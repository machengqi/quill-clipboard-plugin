import Quill, { RangeStatic, StringMap, ClipboardStatic } from "quill";
import cheerio from "cheerio";
import {
  clipboardDefaultOpts,
  defaultAllowedTags,
  defaultDisallowedTags,
} from "@/constants/options";
import sanitizeHTML from "sanitize-html";
import Delta from "quill-delta";

// import Cli from 'quill/modules/clipboard';

class BetterClipboard {
  public quill!: Quill;
  public options!: IClipboardModule;
  constructor(quill: Quill, options: IClipboardModule) {
    this.quill = quill;
    this.options = Object.assign({}, clipboardDefaultOpts, options);
    this.quill.root.addEventListener("paste", this.onPaste.bind(this), false);
  }

  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const range = this.quill.getSelection(true);
    if (range == null) return;
    let html = cleanHtml(e.clipboardData?.getData("text/html") || "");
    const text = e.clipboardData?.getData("text/plain");
    console.log(html, "😈2");
    e.clipboardData?.getData("");
    const files = Array.from(e.clipboardData?.files || []);
    const $ = cheerio.load(html || "");
    if (html) {
      if ($("img").length) {
        const RegexpsBase64 =
          /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;
        // const images = [];
        $("img").each((_i, el) => {
          let src = $(el).attr("src");
          if (
            src &&
            (!RegexpsBase64.test(src) ||
              this.calSize(src) > this.options.size ||
              !this.calType(src))
          ) {
            $(el).replaceWith(this.options.doc);
          }
        });
      }
    }
    console.log(files, "😈");
    if (!html && files.length > 0) {
      this.fileFormat(range, files);
      return;
    }
    if (html && files.length > 0) {
      const doc = new DOMParser().parseFromString(html, "text/html");
      if (
        doc.body.childElementCount === 1 &&
        doc.body.firstElementChild?.tagName === "IMG"
      ) {
        this.fileFormat(range, files);
        return;
      }
    }
    this.pasteContent({ text, html }, range);
  }

  pasteContent(
    { text, html }: { text: string | undefined; html: string },
    range: RangeStatic
  ) {
    const formats = this.quill.getFormat(range.index);
    const pastedDelta = this.quill.clipboard.convert({ text, html }, formats);
    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .concat(pastedDelta);
    console.log(range, "😄");
    console.log(formats, "😄");
    console.log(pastedDelta, "😄");

    this.quill.updateContents(delta, Quill.sources.USER);
    // this.quill.setSelection(
    //   delta.length() - range.length,
    //   0,
    //   Quill.sources.SILENT
    // );
  }

  calSize(base64Url: string) {
    let strIndex = base64Url.indexOf(",") + 1;
    if (!strIndex) return 0;
    let str = base64Url.slice(strIndex);
    const equalIndex = str.indexOf("=");
    if (str.indexOf("=") > 0) {
      str = str.substring(0, equalIndex);
    }
    const strLength = str.length;
    const fileLength = strLength - (strLength / 8) * 2;
    // return size
    return fileLength.toFixed(2);
  }

  calType(base64Url: string) {
    let strIndex = base64Url.indexOf(",") + 1;
    if (!strIndex) return false;
    let str = base64Url.slice(0, strIndex);
    return this.options.mimetypes?.some((e: string) => str.includes(e));
  }

  async fileFormat(range: RangeStatic, files: File[]) {
    const uploads: File[] = [];
    Array.from(files).forEach((file) => {
      if (
        file &&
        this.options.mimetypes.includes(file.type) &&
        file.size <= this.options.size
      ) {
        uploads.push(file);
      }
    });
    if (uploads.length > 0) {
      const base64List = await getImgInfo(uploads);
      let img = new Image() as HTMLImageElement | null;
      (img as HTMLImageElement).onerror = () => {
        console.log(222);
      };

      (img as HTMLImageElement).src = base64List[0] as string;

      const deltas = base64List.reduce(
        (delta: Delta, image) => delta.insert({ image }),
        new Delta().retain(range.index).delete(range.length)
      );
      this.quill.updateContents(deltas, Quill.sources.USER);
      this.quill.setSelection(
        range.index + base64List.length,
        0,
        Quill.sources.SILENT
      );
    }
  }
}

Quill.register("modules/BetterClipboard", BetterClipboard);
// (window as any).QuillImageDropAndPaste = BetterClipboard;
// console.log(window);
// if ("Quill" in window) 55{
//   (window as any).Quill.register(
//     "modules/BetterClipboard",
//     BetterClipboard,
//     true
//   );
// }
function cleanHtml(html: string): string {
  if (!html) return "";
  return sanitizeHTML(html, {
    allowedTags: sanitizeHTML.defaults.allowedTags.concat(["img", "br", "hr"]),
    allowedAttributes: {
      // 放行 role="button"
      "*": ["role"],
      a: ["href", "name", "target", "id", "class", "style"],
      img: ["src", "id", "class", "style"],
    },
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

// function typeError() {

//   return
// }

// function sanitizeHtml(html?: string): string {
//   if (!html) return '';
//   const $ = cheerio.load(html || '');
//   defaultAllowedTags.forEach(e => {
//     $(e).remove()
//     // $(e).each(el => {
//     //   $(el).remove();
//     // })
//   })
//   const sanHtml = $.html();
//   return sanHtml;
// }

export default BetterClipboard;
