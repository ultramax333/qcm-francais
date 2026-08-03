// Configuration de l'app.
//
// GOOGLE_CLIENT_ID : identifiant OAuth « Application Web » (console.cloud.google.com),
// avec l'origine autorisée https://ultramax333.github.io. Tant qu'il est vide,
// l'envoi Drive est masqué ; Copier / Télécharger restent disponibles.
//
// APP_VERSION : version affichée en haut de l'app. À INCRÉMENTER à chaque mise à
// jour (convention dans HUB.md → section « App d'entraînement (quiz-app) »).
// BANK_RELEASE : empreinte courte de la banque chargée, conservée dans les exports
// de séance afin de rendre leur classification reproductible.
//
// NB : on assigne explicitement window.CONFIG — un `const` en tête de script
// n'est PAS exposé sur window, ce qui casserait les gardes `window.CONFIG`.

window.CONFIG = {
  APP_VERSION: '1.22',
  BANK_RELEASE: 'questions-20260803-99f652db',
  GOOGLE_CLIENT_ID: '200483680701-h963rk5t3l7v5j64ojgg2k410av8l9ft.apps.googleusercontent.com',
  DRIVE_FOLDER_NAME: 'QCM Français OP001',
};

if (typeof module !== 'undefined') {
  module.exports = { CONFIG: window.CONFIG };
}
