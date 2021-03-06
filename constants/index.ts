// import { clipboardPlugin } from "@/types/clipboard";

import { IClipboardModule } from "quill-clipboard-plugin";

// import { IClipboardModule } from '@/core/quill.clipboard';

// import { IClipboardModule } from "@/types/clipboard";
// import { IClipboardModule } from "clipboard-plugin";

// export const defaultAllowedTags: string[] = [
//   'address',
//   'article',
//   'aside',
//   'footer',
//   'header',
//   'h1',
//   'h2',
//   'h3',
//   'h4',
//   'h5',
//   'h6',
//   'hgroup',
//   'main',
//   'nav',
//   'section',
//   'blockquote',
//   'dd',
//   'div',
//   'dl',
//   'dt',
//   'figcaption',
//   'figure',
//   'hr',
//   'li',
//   'main',
//   'ol',
//   'p',
//   'pre',
//   'ul',
//   'a',
//   'abbr',
//   'b',
//   'bdi',
//   'bdo',
//   'br',
//   'cite',
//   'code',
//   'data',
//   'dfn',
//   'em',
//   'i',
//   'kbd',
//   'mark',
//   'q',
//   'rb',
//   'rp',
//   'rt',
//   'rtc',
//   'ruby',
//   's',
//   'samp',
//   'small',
//   'span',
//   'strong',
//   'sub',
//   'sup',
//   'time',
//   'u',
//   'var',
//   'wbr',
//   'caption',
//   'col',
//   'colgroup',
//   'table',
//   'tbody',
//   'td',
//   'tfoot',
//   'th',
//   'thead',
//   'tr',
//   'img',
// ];

export const defaultDisallowedTags: string[] = [];

export const clipboardDefaultOpts: IClipboardModule = {
  checkFile() {
    return true;
  },
  async errorCallBack(e) {
    console.log(e);
    return {};
  },
  beforePaste() {},
};
