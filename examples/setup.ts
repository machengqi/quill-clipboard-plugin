import Quill from 'quill';

import ClipboardPlugin from "@/core/quill.clipboard";



Quill.register('modules/clipboardPlugin', ClipboardPlugin, true);

export default Quill;
