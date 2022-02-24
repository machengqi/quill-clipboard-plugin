import Quill from 'quill';

import BetterClipboard from "@/core/quill.clipboard";



Quill.register('modules/betterClipboard', BetterClipboard, true);

export default Quill;
