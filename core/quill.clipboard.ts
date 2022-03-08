import Quill, { RangeStatic } from 'quill';
import cheerio from 'cheerio';
import { clipboardDefaultOpts, defaultAllowedTags } from '@/constants';
import sanitizeHTML from 'sanitize-html';
import Delta from 'quill-delta';
import { isDataurl } from '@/utils/regexps';
import { IVDoc } from 'quill-clipboard-plugin';
import { createDocument, VDoc } from './clipboard.document';
// import { IClipboardModule, EFailType } from 'clipboard-plugin'
// import { EFailType, IClipboardModule } from "@/types/clipboard";

export enum EFailType {
  size,
  type,
  other,
}
export interface IClipboardModule {
  mimetypes: string[];
  size: number;
  sanitize: any;
  errorCallBack(arg: EFailType): IVDoc;
}

class ClipboardPlugin {
  public quill!: Quill;
  public options!: IClipboardModule;
  constructor(quill: Quill, options: IClipboardModule) {
    this.quill = quill;
    this.options = Object.assign({}, clipboardDefaultOpts, options);
    this.quill.root.addEventListener('paste', this.onPaste.bind(this), true);
  }

  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const range = this.quill.getSelection(true);
    if (range === null) return;
    let html = cleanHtml.bind(this)(e.clipboardData?.getData('text/html') || '');
    const text = e.clipboardData?.getData('text/plain');
    e.clipboardData?.getData('');
    const files = Array.from(e.clipboardData?.files || []);
    const $ = cheerio.load(html || '');
    if (html) {
      if ($('img').length) {
        $('img').each((_i, el) => {
          let src = $(el).attr('src');
          switch (true) {
            case !src:
              $(el).remove();
              break;
            case this.calSize(src as string) > this.options.size:
              const SizeVNode = createDocument(new VDoc(this.options.errorCallBack(EFailType.size)))
              $(el).replaceWith(SizeVNode.outerHTML);
              break;
            case !this.calType(src as string):
              const TypeVNode = createDocument(new VDoc(this.options.errorCallBack(EFailType.type)))
              $(el).replaceWith(TypeVNode.outerHTML);
            default:
              break;
          }
        });
      }
    }
    html = $.html();
    if (!$('body').html() && files.length > 0) {
      this.fileFormat(range, files);
      return;
    }
    if (html && files.length > 0) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      if (doc.body.childElementCount === 1 && doc.body.firstElementChild?.tagName === 'IMG') {
        this.fileFormat(range, files);
        return;
      }
    }
    this.pasteContent({ text, html }, range);
  }

  pasteContent({ text, html }: { text: string | undefined; html: string }, range: RangeStatic) {
    const formats = this.quill.getFormat(range.index);
    const pastedDelta = this.quill.clipboard.convert({ text, html }, formats);
    const delta = new Delta().retain(range.index).delete(range.length).concat(pastedDelta);

    new Delta().insert('Text', { StyleSheet: {} });

    this.quill.updateContents(delta, Quill.sources.USER);
    this.quill.setSelection(delta.length() - range.length, 0, Quill.sources.SILENT);
  }

  calSize(dataurl: string) {
    if (!dataurl) return 0;
    if (!isDataurl(dataurl)) return 0;
    const file = dataURLtoFile(dataurl, 'file');
    return file.size;
  }

  calType(dataurl: string) {
    if (!dataurl) return false;
    if (!isDataurl(dataurl)) return false;
    let strIndex = dataurl.indexOf(',') + 1;
    if (!strIndex) return false;
    let str = dataurl.slice(0, strIndex);
    return this.options.mimetypes?.some((e: string) => str.includes(e));
  }

  async fileFormat(range: RangeStatic, files: File[]) {
    const uploads: File[] = [];
    Array.from(files).forEach((file) => {
      if (file) {
        let VNode;
        switch (true) {
          case file.size > this.options.size:
              VNode = createDocument(new VDoc(this.options.errorCallBack(EFailType.size)))
            break;
          case !this.options.mimetypes.includes(file.type):
              VNode = createDocument(new VDoc(this.options.errorCallBack(EFailType.type)))
            break;
          default:
            uploads.push(file);
            break;
        }
        VNode && this.pasteContent({ text: VNode.textContent || '', html: VNode.outerHTML }, range);
      }
    });
    if (uploads.length > 0) {
      const base64List = await getImgInfo(uploads);
      let img = new Image() as HTMLImageElement | null;
      (img as HTMLImageElement).onerror = () => {
      };

      (img as HTMLImageElement).src = base64List[0] as string;

      const deltas = base64List.reduce(
        (delta: Delta, image) => delta.insert({ image }),
        new Delta().retain(range.index).delete(range.length),
      );
      this.quill.updateContents(deltas, Quill.sources.USER);
      this.quill.setSelection(range.index + base64List.length, 0, Quill.sources.SILENT);
    }
  }
}

// if (window) {
//   (window as any).QuillImageDropAndPaste = ClipboardPlugin;
//   if ('Quill' in window) {
//     (window as any).Quill.register('modules/ClipboardPlugin', ClipboardPlugin, true);
//   }
// }

function cleanHtml<T>(this: T extends ClipboardPlugin ? T : Record<string, any>, html: string): string {
  if (!html) return '';
  return sanitizeHTML(html, {
    allowedTags: sanitizeHTML.defaults.allowedTags.concat(defaultAllowedTags),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'id', 'class', 'style'],
      img: ['src', 'id', 'class', 'style'],
    },
    allowedSchemes: ['data', 'http', 'https'],
  });
}

function getImgInfo(files: File[]) {
  const promises = files.map((file) => {
    return new Promise((resolve, reject) => {
      try {
        let reader = new FileReader() as FileReader | null;
        (reader as FileReader).onload = (event) => {
          resolve(event.target?.result);
        };
        (reader as FileReader).readAsDataURL(file);
      } catch (e) {
        reject(e);
      }
    });
  });
  return Promise.all(promises);
}

function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default ClipboardPlugin;
