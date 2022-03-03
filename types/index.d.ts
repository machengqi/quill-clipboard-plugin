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
    errorCallBack(arg: EFailType): IVDoc;
  }

  export interface IVDoc {
    targetName?: string;
    attr?: {
      [x in string]: any;
    };
    style?: string | Record<string, string>[] | Record<string, string>;
    children?: IVDoc[];
    text?: string | number;
    isStatic?: boolean;
  }
}