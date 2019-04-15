// FIXME: Move things to `common.test.js` + fix click handler tests

'use strict';

const App = require('../src/App.html');

describe('App root component', () => {
  it('renders correctly', () => {
    const target = document.createElement('div');
    new App({ target });
    expect(target.innerHTML).toMatchSnapshot();
  });
});

describe('App click handler', () => {
  it.skip('triggers on mouse click event', () => {
    expect.assertions(1);
    const target = document.createElement('div');
    const spy1 = jest.spyOn(chrome.tabs, 'update');
    new App({ target });
    const event = new MouseEvent('click');
    Object.defineProperty(event, 'target', {
      value: { href: 'chrome://bookmarks/' },
      enumerable: true,
    });
    const spy2 = jest.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    expect(spy1).toHaveBeenCalledWith(event);
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
    spy1.mockRestore();
    spy2.mockRestore();
  });

  it.skip('handles regular HTTP links', () => {
    expect.assertions(2);
    const target = document.createElement('div');
    const component = new App({ target });
    const link = target.querySelector(
      '[href="https://github.com/MaxMilton/new-tab/issues"]',
    );
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'target', { value: link, enumerable: true });
    const spy1 = jest.spyOn(component, '_onLinkClick');
    const spy2 = jest.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    spy1.mockRestore();
    spy2.mockRestore();
  });

  it.skip('handles chrome internal links', () => {
    expect.assertions(4);
    const target = document.createElement('div');
    const component = new App({ target });
    const link = target.querySelector('[href="chrome://bookmarks/"]');
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'target', { value: link, enumerable: true });
    const spy1 = jest.spyOn(component, '_onLinkClick');
    const spy2 = jest.spyOn(event, 'preventDefault');
    const spy3 = jest.spyOn(chrome.tabs, 'create', 'get');
    const spy4 = jest.spyOn(chrome.tabs, 'update', 'get');
    window.dispatchEvent(event);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    spy1.mockRestore();
    spy2.mockRestore();
    spy3.mockRestore();
    spy4.mockRestore();
  });

  it.skip('handles chrome internal links with _blank target', () => {
    expect.assertions(4);
    const target = document.createElement('div');
    const component = new App({ target });
    const link = target.querySelector('[href="chrome://bookmarks/"]');
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, 'target', { value: link, enumerable: true });
    Object.defineProperty(event.target, 'target', {
      value: '_blank',
      enumerable: true,
    });
    const spy1 = jest.spyOn(component, '_onLinkClick');
    const spy2 = jest.spyOn(event, 'preventDefault');
    const spy3 = jest.spyOn(chrome.tabs, 'create', 'get');
    const spy4 = jest.spyOn(chrome.tabs, 'update', 'get');
    window.dispatchEvent(event);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    spy1.mockRestore();
    spy2.mockRestore();
    spy3.mockRestore();
    spy4.mockRestore();
  });

  it.skip('handles chrome internal links with ctrl key', () => {
    expect.assertions(4);
    const target = document.createElement('div');
    const component = new App({ target });
    const link = target.querySelector('[href="chrome://bookmarks/"]');
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
    });
    Object.defineProperty(event, 'target', { value: link, enumerable: true });
    const spy1 = jest.spyOn(component, '_onLinkClick');
    const spy2 = jest.spyOn(event, 'preventDefault');
    const spy3 = jest.spyOn(chrome.tabs, 'create', 'get');
    const spy4 = jest.spyOn(chrome.tabs, 'update', 'get');
    window.dispatchEvent(event);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).not.toHaveBeenCalled();
    spy1.mockRestore();
    spy2.mockRestore();
    spy3.mockRestore();
    spy4.mockRestore();
  });
});