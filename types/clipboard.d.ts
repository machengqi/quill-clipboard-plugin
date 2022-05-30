// import { IOptions } from 'sanitize-html';

// declare module 'clipboard-plugin' {
export enum EFailType {
  size,
  type,
  other,
}

export interface ILimitSizeMap {
  size: number;
  mimetypes?: string[];
}

export interface IClipboardModule {
  mimetypes: string[];
  limitSize: ILimitSizeMap[];
  errorCallBack(errorType: EFailType, HtmlElement: string | File): IVDoc;
  beforePaste(arg: string): string | void;
}
// }
