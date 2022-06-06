// import { IOptions } from 'sanitize-html';

// declare module 'clipboard-plugin' {
export enum EFailType {
  size,
  type,
  reg,
  other,
}

export interface ILimitSizeMap {
  size: number;
  mimetypes?: string[];
}

export interface IClipboardModule {
  mimetypes: string[];
  limitSize: ILimitSizeMap[];
  urlReg?: RegExp;
  errorCallBack(errorType: EFailType, HtmlElement: string | File): Promise<IVDoc>;
  slot?: IVDoc;
  beforePaste(arg: string): string | void;
}
// }
