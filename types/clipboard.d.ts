interface IClipboardModule {
  mimetypes: string[];
  size: number;
  errorDoc: {
    size: string,
    type: string,
    other: string,
  };
  allowedTags: string[];
  disallowedTags: string[];
  // errorCallBack: {
  //   sizeError(): void,
  //   typeError(): void,
  // }
}
