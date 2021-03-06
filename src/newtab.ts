import { setupSyntheticEvent } from 'stage1';
import { BookmarkBar } from './components/BookmarkBar';
import { Menu } from './components/Menu';
import { Search } from './components/Search';
import { append, createFragment, handleClick } from './utils';

declare global {
  interface HTMLElement {
    /** `stage1` synthetic click event handler. */
    __click(event: MouseEvent): void;
  }
}

const frag = createFragment();
// Create Search component first because it has asynchronous calls that can
// execute while the remaining components are constructed
append(Search(), frag);
// Create BookmarkBar component near last because, after an async call, it needs
// to synchronously and sequentially calculate DOM layout multiple times and
// could cause reflow in extreme situations, so paint the rest of the app first
append(BookmarkBar(), frag);
append(Menu(), frag);
append(frag, document.body);

document.body.__click = handleClick;
setupSyntheticEvent('click');

// TODO: Keep? It can actually cause worse first page initial load!
// // When the page isn't active stop the "Open Tabs" section from updating to
// // prevent performance issues when users open many new-tab pages
// document.onvisibilitychange = () => {
//   if (document.hidden) {
//     // @ts-expect-error - force override to kill API method
//     chrome.tabs.query = () => {};
//   } else {
//     // eslint-disable-next-line no-restricted-globals
//     location.reload();
//   }
// };
