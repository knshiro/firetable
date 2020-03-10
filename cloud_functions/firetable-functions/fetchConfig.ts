#!/usr/bin/env node

import * as fs from "fs";
// Initialize Firebase Admin
import * as admin from "firebase-admin";
// Initialize Firebase Admin

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./firebase-credentials.json";

let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
}
catch {
  console.error(
    `Couldn't find ${process.cwd()}/${credentialsPath} , set GOOGLE_APPLICATION_CREDENTIALS env variable with path to service-account.js`
  );
  process.exit(1);
}

console.log(`Running on ${serviceAccount.project_id}`);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
});
const db = admin.firestore();

const fetchAllDocConfigs = async (...docPaths: string[]) => {
  const docRefs = docPaths.map(docPath => db.doc(docPath))
  const docs = await db.getAll(...docRefs)
  return docs.map(doc => doc.data()?.config);
};

// Initialize Cloud Firestore Database
const docConfig2json = (path, data) => {
  const jsonData = JSON.stringify(data);
  fs.writeFileSync(path, jsonData);
}

const main = async () => {
  const [history, algolia, sync] = await fetchAllDocConfigs(
    "_FIRETABLE_/_SETTINGS_/_CONFIG_/_HISTORY_",
    "_FIRETABLE_/_SETTINGS_/_CONFIG_/_ALGOLIA_",
    "_FIRETABLE_/_SETTINGS_/_CONFIG_/_COLLECTION_SYNC_",
  )
  docConfig2json("firetableconfig.json", { history, algolia, sync} )
  return true;
};

main()
  .catch(err => console.log(err))
  .then(() => console.log("this will succeed"))
  .catch(() => "obligatory catch");
