import Quill from '@/examples/setup';
import { IVDoc } from 'quill-clipboard-plugin';
// import Module from "quill/core/module";
// import imageCompressor from ".";

console.log(Quill);

const fullToolbarOptions = [[{ header: [1, 2, 3, false] }], ['bold', 'italic'], ['clean'], ['image']];

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: {
      container: fullToolbarOptions,
    },
    clipboardPlugin: {
      size: 1024 * 2,
      errorCallBack(type: any, errorItem: any): IVDoc {
        console.log(type);
        console.log(errorItem);
        return {
          targetName: 'img',
          // text: '图片尺寸过大',
          attr: {
            src: 'https://media.nationalgeographic.org/assets/photos/000/290/29094.jpg',
            'data-type': '3333',
          },
          // style: {
          //   height: '100px',
          //   color: 'red',
          //   background: '#000',
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
