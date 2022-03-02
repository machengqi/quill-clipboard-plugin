declare module 'quill-clipboard-plugin' {
  export default class ClipboardPlugin {}

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
}