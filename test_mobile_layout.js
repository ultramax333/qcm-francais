'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const html = read('index.html');
const css = read('style.css');
const manifest = JSON.parse(read('manifest.json'));
const viewport = html.match(/<meta name="viewport" content="([^"]+)"/)[1];
assert(viewport.includes('width=device-width'));
assert(viewport.includes('viewport-fit=cover'));
assert(!/maximum-scale|user-scalable\s*=\s*no/.test(viewport), 'Le zoom de lecture doit rester autorise.');
for (const side of ['top', 'right', 'bottom', 'left']) {
  assert(css.includes(`safe-area-inset-${side}`), side);
}
assert(css.includes('min-height: 100dvh'));
assert(/button, summary, \.footer-link\s*\{[^}]*min-height: 44px/.test(css));
assert(/a\.btn\s*\{[^}]*min-height: 44px/.test(css));
assert(/\.btn-row\s*\{ flex-wrap: wrap; \}/.test(css));
assert(/input, textarea, select, \.memo-field\s*\{ font-size: 16px; \}/.test(css), 'Safari : taille de saisie mobile suffisante.');
assert.notStrictEqual(manifest.orientation, 'portrait', 'Le mode paysage doit rester utilisable.');
assert(/\.version-tag\s*\{[^}]*min-width: 0;[^}]*flex: 1 1 0;[^}]*overflow-wrap: anywhere;/.test(css),
  'La date de version peut se replier dans les en-têtes mobiles.');
console.log('OK — contrats mobiles : zoom, encoches, saisie, paysage et zones tactiles.');
