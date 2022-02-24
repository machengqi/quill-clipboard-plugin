import Quill from '@/examples/setup';
// import Module from "quill/core/module";
// import imageCompressor from ".";

// Quill.register("modules/BetterClipboard", BetterClipboard);

console.log(Quill);

const fullToolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic"],
  ["clean"],
  ["image"],
];

const quill = new Quill("#editor", {
  theme: "snow",
  modules: {
    toolbar: {
      container: fullToolbarOptions,
    },
    betterClipboard: {},
  },
});

export default quill;
