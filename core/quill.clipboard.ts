import Quill, { RangeStatic } from 'quill';
import { clipboardDefaultOpts } from '@/constants';
import Delta from 'quill-delta';
import { isDataurl } from '@/utils/regexps';
import { IVDoc } from 'quill-clipboard-plugin';
import { createDocument, VDoc } from './clipboard.document';

const ATTRS = {
  SERIALIZATION: 'data-serialization',
  VALUE: 'data-value',
};

const Embed = Quill.import('blots/embed');

class TemplateBlot extends Embed {
  static create(value: any) {
    const node = super.create(value);
    node.setAttribute(ATTRS.SERIALIZATION, value.serialization);
    node.setAttribute(ATTRS.VALUE, value.value);
    node.textContent = value.value;
    return node;
  }

  static value(node: any) {
    return {
      value: '',
      serialization: node.getAttribute(ATTRS.SERIALIZATION),
    };
  }
}

TemplateBlot.blotName = 'template';
TemplateBlot.tagName = 'template-blot';

Quill.register(TemplateBlot);

export enum EFailType {
  size,
  type,
  reg,
  other,
}

export interface ILimitSizeMap {
  size: number;
  mimetypes?: string[];
}
export interface IClipboardModule {
  mimetypes: string[];
  limitSize: ILimitSizeMap[];
  urlReg?: RegExp;
  errorCallBack(errorType: EFailType, HtmlElement: string | File): Promise<IVDoc>;
  slot?: IVDoc;
  beforePaste(arg: string): string | void;
}

class ClipboardPlugin {
  public quill!: Quill;
  public options!: IClipboardModule;
  constructor(quill: Quill, options: IClipboardModule) {
    this.quill = quill;
    this.options = Object.assign({}, clipboardDefaultOpts, options);
    this.quill.root.addEventListener('paste', this.onPaste.bind(this), true);
  }

  async onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const range = this.quill.getSelection(true);
    if (range === null) return;
    let html =
      (await this.options.beforePaste(e.clipboardData?.getData('text/html') || '')) ??
      (e.clipboardData?.getData('text/html') || '');
    const text = e.clipboardData?.getData('text/plain');
    e.clipboardData?.getData('');
    const files = Array.from(e.clipboardData?.files || []);

    const _doc = new DOMParser().parseFromString(html || '', 'text/html');

    const promiseList: Promise<IVDoc>[] = [];

    if (html) {
      const imgDoc = _doc.querySelectorAll('img');
      if (imgDoc.length) {
        Array.from(imgDoc).forEach((el) => {
          let _src = el.getAttribute('src');

          const _rpw = (type: EFailType) => {
            console.log(EFailType[type]);
            promiseList.push(
              new Promise(async (res) => {
                const VNode = await this.options.errorCallBack(type, _src || '');
                this.quill.root
                  .querySelector(`template-blot[data-serialization="${_src}"]`)
                  ?.replaceWith(createDocument(new VDoc(VNode)));
                res(VNode);
              }),
            );
            el.replaceWith(
              createDocument(
                new VDoc(
                  this.options.slot ?? {
                    targetName: 'template-blot',
                    attr: {
                      'data-serialization': _src,
                      'data-value': '',
                    },
                    text: '',
                  },
                ),
              ),
            );
          };

          switch (true) {
            case !_src:
              el.remove();
              break;
            case !(this.options.urlReg?.test(_src || '') ?? true):
              _rpw(EFailType.reg);
            case !this.calType(_src || ''):
              _rpw(EFailType.type);
            case !this.calSize(_src || ''):
              _rpw(EFailType.size);
              break;
            default:
              break;
          }
        });
      }
    }

    Promise.all(promiseList);

    html = _doc.documentElement.innerHTML;

    // html = '<html><head><meta charset="utf-8"></head><body><br class="Apple-interchange-newline"><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="http://www.baidu.com" style="box-sizing: border-box; cursor: text; display: block; max-width: 100%; color: rgb(34, 34, 34); font-size: 13px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: left; text-indent: 0px; text-transform: none; white-space: pre-wrap; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;"><div>333</div></iframe><br class="Apple-interchange-newline"></body></html>'
    if (!_doc.querySelector('body')?.innerHTML && files.length > 0) {
      this.fileFormat(range, files);
      return;
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

  calSize(dataurl: string | File) {
    if (!dataurl) return false;
    if (Object.prototype.toString.call(dataurl) === 'string') {
      if (!isDataurl(dataurl as string)) return false;
      dataurl = dataURLtoFile(dataurl as string, 'file');
    }
    return this.options.limitSize.some((limitSizeItem) => {
      if (limitSizeItem.mimetypes && limitSizeItem.mimetypes.length) {
        return limitSizeItem.mimetypes.includes((dataurl as File).type);
      } else {
        return (dataurl as File).size > limitSizeItem.size;
      }
    });
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
    Array.from(files).forEach(async (file) => {
      // if (file) {
      let VNode;

      /**
       * check img type
       */
      if (!this.options.mimetypes.includes(file.type)) {
        VNode = createDocument(new VDoc(await this.options.errorCallBack(EFailType.type, file)));
      }

      /**
       * check img size
       */
      if (this.options.limitSize.length) {
        const isSetUpSize = this.options.limitSize.some((limitSizeItem) => {
          if (limitSizeItem.mimetypes && limitSizeItem.mimetypes.length) {
            return limitSizeItem.mimetypes.includes(file.type);
          } else {
            return file.size > limitSizeItem.size;
          }
        });
        if (isSetUpSize) {
          VNode = createDocument(new VDoc(await this.options.errorCallBack(EFailType.size, file)));
        }
      }

      switch (true) {
        case this.calSize(file):
          VNode = createDocument(new VDoc(await this.options.errorCallBack(EFailType.size, file)));
          break;
        case !this.options.mimetypes.includes(file.type):
          VNode = createDocument(new VDoc(await this.options.errorCallBack(EFailType.type, file)));
          break;
        default:
          uploads.push(file);
          break;
      }
      VNode && this.pasteContent({ text: VNode.textContent || '', html: VNode.outerHTML }, range);
      // }
    });
    if (uploads.length > 0) {
      const base64List = await getImgInfo(uploads);
      let img = new Image() as HTMLImageElement | null;
      (img as HTMLImageElement).onerror = () => {};

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
