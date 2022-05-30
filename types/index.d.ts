declare module 'quill-clipboard-plugin' {
  export default class ClipboardPlugin {}

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
