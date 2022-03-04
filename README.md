# quill-clipboard-plugin
> A quill editor module plugin for clipboard pasted files, it can help you filter clipboard file size and mimetypes, and provides a hook to help you substituted error files.


## Install

```bash
npm install quill-clipboard-plugin -S

yarn add quill-clipboard-plugin -S
```

## Usage
### Import

``` javascript
import Quill from 'quill';

import ClipboardPlugin from 'quill-clipboard-plugin'

Quill.register({
  "modules/clipboardPlugin": ClipboardPlugin
})

const quill = new Quill('#your-editor-container', {
  // ...
  modules: {
    // ...
    clipboardPlugin: {}
  }
});
```

### Option
``` typescript

const modules = {
  clipboardPlugin: {

    // support mimetypes
    mimetypes: ['image/png', 'image/jpeg'],

    // file max size, default 10MB
    size: 1024 * 1024 * 10,

    // error file call back, need return a VDoc
    errorCallBack: errorCallBack
  }
}

/**
 * @return type { IVDoc }
 * need return type of IVDoc or void
 */
function errorCallBack (type): IVDoc {
  // 
  return {
    targetName: 'div';
    attr: {
      class: 'container'
    };
    style?: {
      height: '100px',
      width: '100px !important',
    };
    children: [
      // children element same as
    ];
    text: 'This pic size is more then 10MB';
    isStatic: false;
  }
}

interface ClipboardPluginOption {
  
    // file mimetypes (img | xml ... and more)
    mimetypes: string[];

    // file max size, default 10MB
    size: number;


    sanitize: any;

    // error file call back, need return a VDoc
    errorCallBack(arg: EFailType): IVDoc,
}

/**
 * 
 */
interface IVDoc {
  // document target name: 'div', 'p', 'img'...
  targetName?: string;

  // document attribute
  attr?: {
    [x in string]: any;
  };

  // css style, support !important
  style?: string | Record<string, string>[] | Record<string, string>;

  // children document node
  children?: IVDoc[];

  // document innerText
  text?: string | number;

  // is document is (img | video)?
  isStatic?: boolean;
}

```