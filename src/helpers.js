/**
 * Debounce function calls.
 * Delay running a function until X ms have passed since its last call.
 * @see https://github.com/developit/decko/blob/master/src/decko.js
 * @param {Function} fn The function to debounce.
 * @param {Number} delay How long to wait for more function calls before executing the function.
 * @returns {Function}
 */
function de(fn, delay) {
  let args;
  let context;
  let timer;

  return function (...a) { // eslint-disable-line func-names
    args = a;
    context = this;

    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args);
        args = context = timer = null; // eslint-disable-line no-multi-assign
      }, delay);
    }
  };
}

/**
 * Open the location in a new tab.
 * @param {string} url The new URL.
 */
function __openNewTab(url) {
  chrome.tabs.create({ url });
}

/**
 * Update the location in the current tab.
 * @param {string} url The new URL.
 */
function __updateTabLocation(url) {
  chrome.tabs.update({ url });
}

/**
 * Handle menu item click.
 * Special case for internal links in an extention.
 * @param {MouseEvent} event the click event
 */
function cL(event) {
  const { target, ctrlKey } = event;
  const url = target.href;

  if (url.charAt(0) !== 'h') {
    if (target.target === '_blank' || ctrlKey) {
      __openNewTab(url);
    } else {
      __updateTabLocation(url);
    }

    event.preventDefault();
  }
}

module.exports = {
  de,
  cL,
};
