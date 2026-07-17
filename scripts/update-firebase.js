// update-firebase.js
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const fs = require('fs');

async function main() {
  const results = JSON.parse(fs.readFileSync('payload.json', 'utf8'));
  
  // 安全装置：テスト結果が空（0件）の場合は書き込み中止
  if (Object.keys(results).length === 0) {
    console.error("エラー: 実行されたテストが0件です。ディレクトリ構造を確認してください。");
    process.exit(0);
  }
  
  const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
  if (getApps().length === 0) {
    initializeApp({ credential: cert(serviceAccount) });
  }
  
  const db = getFirestore();
  
  await db.collection('users').doc(process.env.USER_NAME).set({
    results: results,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});