import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Execute the shipped scripts with a small DOM adapter; no build or browser dependency.
const variants = [
  { id: 3, name: 'Ink & <Paper>', note: '<b>Literal text</b>', a: '#fff', b: '#111', c: '#26e' },
  { id: 7, name: 'Console', note: 'Dense and dark', a: '#111', b: '#fff', c: '#fa0' },
  { id: 12, name: 'Quiet', note: 'Space to read', a: '#eee', b: '#333', c: '#090' },
];

function boot(template, { entries = variants, saved = {}, pathname = '/preview/', base = '/', blocked = false, writeBlocked = false } = {}) {
  const storage = new Map(Object.entries(saved));
  const events = new Map();
  const navigations = [];
  let document;
  class Element {
    constructor(tag = 'div') {
      this.tagName = tag;
      this.dataset = {};
      this.attributes = new Map();
      this.children = [];
      this.value = '';
      this.handlers = new Map();
      this.style = { setProperty: (name, value) => this.attributes.set(name, value) };
      this.classList = { toggle() {} };
    }
    set textContent(value) { this.value = String(value); this.children = []; }
    get textContent() { return this.value + this.children.map((c) => c.textContent).join(''); }
    append(...children) { this.children.push(...children); }
    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    addEventListener(name, handler) { this.handlers.set(name, handler); }
    click() { this.handlers.get('click')?.(); }
    closest() { return this.editable ? this : null; }
    focus() { document.activeElement = this; }
    scrollIntoView() {}
  }
  const ids = Object.fromEntries(['frame', 'stage', 'now', 'open', 'nav', 'count'].map((id) => [id, new Element()]));
  ids.frame.contentWindow = { location: { replace: (href) => navigations.push(href) } };
  const widths = ['390', '768', '0'].map((w) => Object.assign(new Element('button'), { dataset: { w } }));
  if (template === 'astro') {
    ids.nav.children = entries.map((d) => Object.assign(new Element('button'), { className: 'opt', dataset: { id: String(d.id) } }));
  }
  document = {
    getElementById: (id) => ids[id],
    querySelectorAll: (selector) => selector === '.opt' ? ids.nav.children : widths,
    createElement: (tag) => new Element(tag),
    createTextNode: (text) => Object.assign(new Element('#text'), { textContent: text }),
  };
  let source = readFileSync(new URL(`../templates/switcher.${template}`, import.meta.url), 'utf8');
  const script = source.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/)[1];
  if (template === 'astro') {
    source = source.match(/^---\n([\s\S]*?)\n---/)[1]
      .replace(/const variants = \[[\s\S]*?\n\];/, `const variants = ${JSON.stringify(entries)};`)
      .replace('import.meta.env.BASE_URL', JSON.stringify(base)) + '\n' + script;
  } else {
    source = script.replace(/const DESIGNS = \[[\s\S]*?\n    \];/, `const DESIGNS = ${JSON.stringify(entries)};`);
  }
  vm.runInNewContext(source, {
    document, URL,
    location: { pathname, href: 'https://example.test' + pathname },
    localStorage: {
      getItem(key) { if (blocked) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (blocked || writeBlocked) throw new Error('Storage blocked'); storage.set(key, value); },
    },
    addEventListener: (name, handler) => events.set(name, handler),
  });
  return {
    ...ids, widths, storage, navigations, document,
    key(key, options = {}) {
      const event = { key, target: new Element(), preventDefault() { this.prevented = true; }, ...options };
      events.get('keydown')?.(event);
      return event;
    },
  };
}

for (const template of ['html', 'astro']) {
  test(`${template}: selects, wraps and opens nonconsecutive design ids`, () => {
    const page = boot(template);
    assert.equal(page.now.textContent, '03 · Ink & <Paper>');
    assert.equal(page.key('ArrowLeft').prevented, true);
    assert.equal(page.now.textContent, '12 · Quiet');
    page.key('ArrowRight');
    assert.equal(page.now.textContent, '03 · Ink & <Paper>');
    page.nav.children[1].click();
    assert.equal(page.now.textContent, '07 · Console');
    assert.equal(page.open.href, template === 'html' ? './7.html' : '/preview/7');
    assert.equal(page.nav.children[1].getAttribute('aria-current'), 'true');
    assert.match(page.frame.title, /07 · Console/);
    assert.equal(page.open.getAttribute('aria-label'), 'Open Console in a new tab');
  });

  test(`${template}: repairs stale ids and invalid widths`, () => {
    const page = boot(template, { saved: { 'design-preview:/preview/:design': '999', 'design-preview:/preview/:width': 'invalid' } });
    assert.equal(page.storage.get('design-preview:/preview/:design'), '3');
    assert.equal(page.stage.getAttribute('--w'), '390px');
    page.key('ArrowLeft');
    assert.equal(page.now.textContent, '12 · Quiet');
  });

  test(`${template}: restores state and isolates other switcher paths`, () => {
    const saved = { 'design-preview:/preview/:design': '7', 'design-preview:/preview/:width': '768' };
    const restored = boot(template, { saved });
    assert.equal(restored.now.textContent, '07 · Console');
    assert.equal(restored.stage.getAttribute('--w'), '768px');
    assert.equal(restored.widths[1].getAttribute('aria-pressed'), 'true');
    assert.equal(boot(template, { saved, pathname: '/other/' }).now.textContent, '03 · Ink & <Paper>');
  });

  test(`${template}: remains usable when storage reads or writes fail`, () => {
    for (const options of [{ blocked: true }, { writeBlocked: true }]) {
      const page = boot(template, options);
      page.key('ArrowRight');
      page.widths[1].click();
      assert.equal(page.now.textContent, '07 · Console');
      assert.equal(page.stage.getAttribute('--w'), '768px');
    }
  });

  test(`${template}: width changes preserve the loaded page and announce their state`, () => {
    const page = boot(template);
    const count = page.navigations.length;
    page.widths[1].click();
    page.widths[2].click();
    assert.equal(page.navigations.length, count);
    assert.equal(page.stage.getAttribute('--w'), 'calc(100% - 2px)');
    assert.equal(page.widths[2].getAttribute('aria-pressed'), 'true');
    assert.equal(page.widths[1].getAttribute('aria-pressed'), 'false');
    page.key('ArrowRight');
    assert.equal(page.navigations.at(-1), `https://example.test/preview/7${template === 'html' ? '.html' : ''}`);
  });

  test(`${template}: ignores editing, modifiers and handled keys`, () => {
    const page = boot(template);
    for (const option of ['altKey', 'ctrlKey', 'metaKey', 'shiftKey', 'defaultPrevented']) page.key('ArrowRight', { [option]: true });
    page.key('ArrowRight', { target: { closest: () => ({}) } });
    page.key('Enter');
    assert.equal(page.now.textContent, '03 · Ink & <Paper>');
    page.nav.children[0].focus();
    page.key('ArrowRight');
    assert.equal(page.document.activeElement, page.nav.children[1]);
  });

  test(`${template}: an empty array shows a usable configuration message`, () => {
    const page = boot(template, { entries: [] });
    assert.equal(page.now.textContent, 'No designs configured');
    assert.equal(page.open.hidden, true);
    assert.equal(page.frame.hidden, true);
    assert.ok(page.widths.every((b) => b.disabled));
    assert.equal(page.navigations.length, 0);
    page.key('ArrowRight');
  });
}

test('HTML renders design names and notes as literal text', () => {
  const page = boot('html');
  assert.equal(page.nav.children[0].children[1].textContent, '03Ink & <Paper><b>Literal text</b>');
  assert.equal(page.nav.children[0].children[1].children[0].children[1].tagName, '#text');
});

test('Astro variant links respect deployment base paths', () => {
  for (const base of ['/portfolio', '/portfolio/']) {
    const page = boot('astro', { base });
    assert.equal(page.open.href, '/portfolio/preview/3');
    assert.equal(page.navigations[0], 'https://example.test/portfolio/preview/3');
  }
});
