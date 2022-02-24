interface IClipboardModule {
  mimetypes: string[];
  size: number;
  doc: string;
  allowedTags: string[];
  disallowedTags: string[];
  // errorCallBack: {
  //   sizeError(): void,
  //   typeError(): void,
  // }
}
