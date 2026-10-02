'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const read = name => fs.readFileSync(path.join(__dirname, name), 'utf8');
const css = read('style.css');
const app = read('app.js');
const html = read('index.html');
const manifest = JSON.parse(read('manifest.json'));
const token = name => css.match(new RegExp(`--${name}:\\s*(#[a-f0-9]{6})`, 'i'))[1];
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(c => parseInt(c, 16) / 255)
    .map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}
const measured = [];
for (const foreground of ['text', 'text-dim', 'accent', 'good', 'bad']) {
  for (const background of ['bg', 'bg-card', 'bg-card-2']) {
    const ratio = contrast(token(foreground), token(background));
    assert(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)} < 4.5`);
    measured.push(ratio);
  }
}
for (const [foregroundName, backgroundName] of [
  ['text-on-accent', 'accent'], ['text-on-accent', 'good'], ['text-on-accent', 'bad'],
  ['feature-text', 'bg-feature'], ['feature-dim', 'bg-feature'], ['good', 'bg-good'],
  ['bad', 'bg-bad'], ['text-dim', 'bg-info'], ['text-on-accent', 'accent-hover'],
  ['text-dim', 'bg-review'], ['text-dim', 'bg-good'], ['text-dim', 'bg-bad'],
  ['text', 'bg-good'], ['text', 'bg-bad'], ['accent', 'bg-info'],
]) {
  const foreground = token(foregroundName);
  const background = token(backgroundName);
  const ratio = contrast(foreground, background);
  assert(ratio >= 4.5, `${foreground}/${background}: ${ratio.toFixed(2)} < 4.5`);
  measured.push(ratio);
}
for (const background of ['bg-card', 'bg-card-2', 'bg-info', 'bg-good', 'bg-bad', 'bg-feature']) {
  assert(contrast(token('control-border'), token(background)) >= 3, `Visible control boundary on ${background}`);
}
assert(contrast(token('accent'), token('bg')) >= 3, 'Visible keyboard focus');
assert(html.includes('<main id="app"></main>'));
assert.equal(html.match(/name="theme-color" content="([^"]+)"/)[1], token('bg'));
assert.equal(manifest.theme_color, token('bg'));
assert.equal(manifest.background_color, token('bg'), 'PWA launch surface matches the dark interface');
assert(css.includes('prefers-reduced-motion: reduce'));
assert(css.includes('color-scheme: dark'));
for (const title of ['QCM Français', 'Résultat', 'Mes erreurs', 'Historique', 'Séances à synchroniser']) {
  assert(app.includes(`el('h1', { class: 'title', text: '${title}' })`), `Semantic heading: ${title}`);
}
assert(app.includes("el('button', { class: 'footer-link home-history-link'"), 'Keyboard-accessible history');
assert(app.includes("for: 'question-memo'"));
assert(app.includes("id: 'question-memo'"));
assert(app.includes("'aria-expanded': showDetails ? 'true' : 'false'"));
assert(app.includes("'aria-pressed': state.likes[q.id] ? 'true' : 'false'"));
// Visual order and keyboard order agree: the adaptive action is first in both.
assert(app.indexOf('actions.appendChild(adaptive)') < app.indexOf('actions.appendChild(errorCard)'));
console.log(`OK — design : ${measured.length} contrastes texte ≥4.5 (minimum ${Math.min(...measured).toFixed(2)}), contrôles ≥3, titres/boutons/étiquettes et thème PWA.`);
