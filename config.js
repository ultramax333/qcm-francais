// Configuration de l'app — À COMPLÉTER pour activer l'envoi Google Drive.
//
// 1. Va sur https://console.cloud.google.com/ → crée un projet.
// 2. « API et services » → active « Google Drive API ».
// 3. « Écran de consentement OAuth » : type External, mode Test,
//    ajoute ton adresse Gmail comme utilisateur de test, scope drive.file.
// 4. « Identifiants » → Créer un identifiant → ID client OAuth →
//    type « Application Web ». Dans « Origines JavaScript autorisées », ajoute :
//      http://localhost:5500       (pour tester sur ce PC)
//      https://TON-APP.netlify.app (l'URL exacte une fois déployée)
// 5. Copie l'ID client (finit par .apps.googleusercontent.com) ci-dessous.
//
// Tant que ce champ est vide, l'app fonctionne mais l'envoi Drive est masqué ;
// les boutons « Copier » et « Télécharger » du feedback restent disponibles.

const CONFIG = {
  GOOGLE_CLIENT_ID: '200483680701-h963rk5t3l7v5j64ojgg2k410av8l9ft.apps.googleusercontent.com',
  DRIVE_FOLDER_NAME: 'QCM Français OP001',
};

if (typeof module !== 'undefined') {
  module.exports = { CONFIG };
}
