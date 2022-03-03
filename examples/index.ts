import Quill from '@/examples/setup';
// import Module from "quill/core/module";
// import imageCompressor from ".";

// Quill.register("modules/BetterClipboard", BetterClipboard);

console.log(Quill);

const fullToolbarOptions = [[{ header: [1, 2, 3, false] }], ['bold', 'italic'], ['clean'], ['image']];

const quill = new Quill('#editor', {
  theme: 'snow',
  modules: {
    toolbar: {
      container: fullToolbarOptions,
    },
    betterClipboard: {
      size: 1,
      errorCallBack() {
        return '<div class="clipboard-type" style="display: block; background: #f6f6f6; padding: 1.5em 0;"><p style="color: #ccc">图片尺寸过大</p></div>';
      },
    },
  },
});

export default quill;
