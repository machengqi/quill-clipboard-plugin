declare module 'quill-clipboard-plugin' {
  export default class ClipboardPlugin {}

  export type IFailType = 'notFile' | 'reg' | 'other';

  // export interface ILimitSizeMap {
  //   size: number;
  //   mimetypes?: string[];
  // }

  export interface IClipboardModule {
    // mimetypes: string[];
    urlReg?: RegExp;
    checkFile(size: number, type: string): boolean;
    errorCallBack(errorType: IFailType, HtmlElement: string | File): Promise<IVDoc>;
    slot?: IVDoc;
    beforePaste(arg: string): string | void;
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
