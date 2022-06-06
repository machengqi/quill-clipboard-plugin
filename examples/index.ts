import Quill from '@/examples/setup';
import { IVDoc } from 'quill-clipboard-plugin';
// import Module from "quill/core/module";
// import imageCompressor from ".";

console.log(Quill);

const fullToolbarOptions = [[{ header: [1, 2, 3, false] }], ['bold', 'italic'], ['clean'], ['image'], ['SubtitleBlot']];

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: {
      container: fullToolbarOptions,
    },
    clipboardPlugin: {
      size: 1024 * 2,
      urlReg: new RegExp('.wanjiadongli'),
      async errorCallBack(type: any, errorItem: any): Promise<IVDoc> {
        console.log(type);
        console.log(errorItem);

        await new Promise(res => {
          setTimeout(() => {
            res(null);
          }, 3000);
        });

        return {
          targetName: 'p',
          text: '图片尺寸过大',
          // attr: {
          //   src: 'data:image/png;base64,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',
          // },
        };
      },
      formatHtml() {
        return '';
      },
    },
  },
});

export default quill;
