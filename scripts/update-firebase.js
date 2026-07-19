const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

async function main() {
  console.time("total");

  const results = JSON.parse(fs.readFileSync('payload.json', 'utf8'));

  if (Object.keys(results).length === 0) {
    console.error("エラー: 実行されたテストが0件です。ディレクトリ構造を確認してください。");
    process.exit(0);
  }

  console.time("parse-key");
  const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
  console.timeEnd("parse-key");

  console.time("init-app");
  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  console.timeEnd("init-app");

  console.time("get-firestore-and-settings");
  const db = getFirestore();
  db.settings({ preferRest: true }); // 試すならここでON/OFFを切り替えて比較
  console.timeEnd("get-firestore-and-settings");

  console.time("firestore-write");
  await db.collection('users').doc(process.env.USER_NAME).set({
    results: results,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  console.timeEnd("firestore-write");

  console.timeEnd("total");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});