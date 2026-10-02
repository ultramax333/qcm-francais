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
// APP_PUBLISHED_AT : instant fixe de préparation de la release publiée, en ISO 8601
// avec Z ou un décalage explicite. Renseigner lors de la publication avec APP_VERSION
// et CACHE ; null pour une version locale non publiée. Ce n'est pas l'heure de visite
// ni l'heure exacte de fin du déploiement. Affichage en Europe/Zurich.
//
// NB : on assigne explicitement window.CONFIG — un `const` en tête de script
// n'est PAS exposé sur window, ce qui casserait les gardes `window.CONFIG`.

window.CONFIG = {
  APP_VERSION: '1.38',
  APP_PUBLISHED_AT: '2026-10-02T11:35:58Z',
  BANK_RELEASE: 'questions-20261002-2d53e15e',
  GOOGLE_CLIENT_ID: '200483680701-h963rk5t3l7v5j64ojgg2k410av8l9ft.apps.googleusercontent.com',
  DRIVE_FOLDER_NAME: 'QCM Français OP001',
  FEEDBACK_FORM: {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfBK5VkmZTA-2KzAeBr-w4KEnUq2T8W8_YqlGYVAunMIHNvww/viewform',
    question: 'entry.1704761187',
    comment: 'entry.1464607448',
    release: 'entry.1348145644',
  },
};

if (typeof module !== 'undefined') {
  module.exports = { CONFIG: window.CONFIG };
}
