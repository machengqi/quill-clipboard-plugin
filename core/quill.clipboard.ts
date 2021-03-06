import Quill, { RangeStatic } from 'quill';
import { clipboardDefaultOpts } from '@/constants';
import Delta from 'quill-delta';
import { isDataurl, isUrl } from '@/utils/regexps';
import { IClipboardModule, IFailType, IVDoc } from 'quill-clipboard-plugin';
import { createDocument, VDoc } from './clipboard.document';

const ATTRS = {
  SERIALIZATION: 'data-serialization',
  VALUE: 'data-value',
};

const Embed = Quill.import('blots/embed');

class TemplateBlot extends Embed {
  static create(value: { serialization: string; value: string }) {
    const node = super.create(value);
    node.setAttribute(ATTRS.SERIALIZATION, value.serialization);
    node.setAttribute(ATTRS.VALUE, value.value);
    node.textContent = value.value;
    return node;
  }

  static value(node: { getAttribute: (arg0: string) => string }) {
    return {
      value: '',
      serialization: node.getAttribute(ATTRS.SERIALIZATION),
    };
  }
}

TemplateBlot.blotName = 'template';
TemplateBlot.tagName = 'template-blot';

Quill.register(TemplateBlot);

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

    console.log(e.clipboardData?.getData('text/plain'));

    let _textHtml;

    if (e.clipboardData?.getData('text/html')) {
      _textHtml = e.clipboardData?.getData('text/html');
    } else if (e.clipboardData?.getData('text/plain')) {
      _textHtml = `<p>${e.clipboardData?.getData('text/plain')}</p>`;
    } else {
      _textHtml = '';
    }

    let html = (await this.options.beforePaste(_textHtml)) ?? _textHtml;
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

          const _rpw = (type: IFailType) => {
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

          const _file = this.calFile(_src || '');

          switch (true) {
            case !_src:
              el.remove();
              break;
            case isUrl(_src || '') && !(this.options.urlReg?.test(_src || '') ?? true):
              _rpw('reg');
              break;
            case isUrl(_src || ''):
              break;
            case !(_file && this.options.checkFile(_file.size, _file.type)):
              _rpw('notFile');
              break;
            default:
              break;
          }
        });
      }
    }

    Promise.all(promiseList);

    html = _doc.documentElement.innerHTML;

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

  calFile(dataurl: string | File) {
    if (!dataurl) return false;
    if (Object.prototype.toString.call(dataurl) === '[object String]') {
      if (!isDataurl(dataurl as string)) return false;
      dataurl = dataURLtoFile(dataurl as string, 'file');
    }
    return dataurl as File;
  }

  async fileFormat(range: RangeStatic, files: File[]) {
    const uploads: File[] = [];
    Array.from(files).forEach(async (file) => {
      let VNode;

      switch (true) {
        case !(file && this.options.checkFile(file.size, file.type)):
          VNode = createDocument(new VDoc(await this.options.errorCallBack('notFile', file)));
          break;
        default:
          uploads.push(file);
          break;
      }

      VNode && this.pasteContent({ text: VNode.textContent || '', html: VNode.outerHTML }, range);
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
