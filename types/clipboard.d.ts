// import { IOptions } from 'sanitize-html';

// declare module 'clipboard-plugin' {
export enum EFailType {
  size,
  type,
  other,
}
export interface IClipboardModule {
  mimetypes: string[];
  size: number;
  sanitize: any;
  errorCallBack(arg: EFailType): string;
}
// }
