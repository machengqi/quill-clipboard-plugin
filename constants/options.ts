export const defaultAllowedTags: string[] = ["address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4",
"h5", "h6", "hgroup", "main", "nav", "section", "blockquote", "dd", "div",
"dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
"ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
"em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
"small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
"col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr"];

export const defaultDisallowedTags: string[] = []

export const clipboardDefaultOpts: IClipboardModule = {
  mimetypes: ["image/png", "image/jpeg"],
  size: 1024 * 1024 * 100,
  doc: "<p>[图片]</p>",
  allowedTags: [],
  disallowedTags: [],
};

// export enum ESource {
//   API = 'api',
//   USER = 'user',
//   SILENT = 'silent',
// }

export enum EFailType {
  size,
  type,
  other,
}
