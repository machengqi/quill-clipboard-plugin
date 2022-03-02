interface IVDoc {
  targetName?: string;
  attr?: {
    [x in string]: any;
  };
  style?: string | object[] | object;
  children?: IVDoc[];
  text?: string | number;
  isStatic?: boolean;
}

class VDoc {
  targetName!: string | void;
  attrs!: { [key: string]: any };
  style!: string | object[] | object | void;
  children!: VDoc[] | void;
  text!: string | number;
  isStatic: boolean = false;
  constructor(doc: IVDoc) {
    this.targetName = doc.targetName;
    this.attrs = doc.attr || {};
    this.style = doc.style;
    this.children = doc.children?.map(e => new VDoc(e));
    this.text = doc.text || '';
    this.isStatic = doc.isStatic || false;
  }
}

export function createTextNode(val: string | number) {
  return new VDoc({ text: val });
}
// TODO val not use
export function createEmptyNode(val: string = '') {
  return new VDoc({});
}

export function createDocument(doc: VDoc): HTMLElement {
  if (!doc) return document.createElement('div');
  const el = document.createElement(doc.text.toString());
  if (doc.text) el.textContent = doc.text.toString();
  if (doc.attrs) {
    const objKey = Object.keys(doc.attrs);
    objKey.forEach((e) => {
      if (checkTypeofObj(doc.attrs[e])) {
        el.setAttribute(e, JSON.stringify(doc.attrs[e]));
        return;
      }
      if (
        typeof doc.attrs[e] === 'string' ||
        typeof doc.attrs[e] === 'boolean' ||
        typeof doc.attrs[e] === 'bigint' ||
        typeof doc.attrs[e] === 'number'
      ) {
        el.setAttribute(e, doc.attrs[e].toString());
      }
    });
  }
  if(doc.children && doc.children.length) {
    const childNode = doc.children.map(e => createDocument(e))
    childNode.forEach(e => el.appendChild(e));
  }
  return el;
}

export function checkTypeofObj(obj: unknown) {
  const _toString = Object.prototype.toString;
  return _toString.call(obj) === '[object Object]';
}
