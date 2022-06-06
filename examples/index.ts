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
      async errorCallBack(type: any, errorItem: any): Promise<IVDoc> {
        console.log(type);
        console.log(errorItem);

        await new Promise((res, rej) => {
          setTimeout(() => {
            res(null);
          }, 3000);
        });

        return {
          targetName: 'img',
          // text: '图片尺寸过大',
          attr: {
            src: 'https://media.nationalgeographic.org/assets/photos/000/290/29094.jpg',
            'data-type': '3333',
          },
          style: {
            height: '100px',
            color: 'red',
            background: '#000',
          },
        };
      },
      formatHtml() {
        return '';
      },
    },
  },
});

export default quill;
