import algoliaFnsGenerator, { AlgoliaConfig } from "./algolia";
import collectionSyncFnsGenerator, { CollectionSyncConfig } from "./collectionSync";
import collectionSnapshotFnsGenerator, { CollectionHistoryConfig } from "./history";
import permissionControlFnsGenerator, { PermissionsConfig } from "./permissions";
import synonymsFnsGenerator, { SynonymConfig } from "./synonyms";

import { exportTableCallable } from "./export";
import { sendEmailTemplateCallable } from "./callable";

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { SearchClient } from "algoliasearch";

export interface FiretableConfig {
  algolia?: AlgoliaConfig[];
  sync?: CollectionSyncConfig[];
  history?: CollectionHistoryConfig[];
  synonyms?: SynonymConfig[];
  permissions?: PermissionsConfig[];
}

// Hack to get the compiler not to emit functions.Requests as generic following express-serve-static-core
type FirebaseHttpsFunction = functions.TriggerAnnotated & ((req: functions.Request, resp: functions.Response) => void) & functions.Runnable<any>;

export default function(auth: admin.auth.Auth, db: FirebaseFirestore.Firestore, searchClient: SearchClient, config: FiretableConfig = {}) {

  const exportTable: FirebaseHttpsFunction = functions.https.onCall(exportTableCallable(db));
  const SendEmail: FirebaseHttpsFunction = functions.https.onCall(sendEmailTemplateCallable(db));

  const FT_algolia = (config.algolia || []).reduce((acc: any, collection) => {
    return { ...acc, [collection.name]: algoliaFnsGenerator(searchClient, collection) };
  }, {});


  const FT_sync = (config.sync || []).reduce((acc: any, collection: CollectionSyncConfig) => {
    return {
      ...acc,
      [`${`${`${collection.source}`
        .replace(/\//g, "_")
        .replace(/_{.*?}_/g, "_")}`}2${`${`${collection.target}`
          .replace(/\//g, "_")
          .replace(/_{.*?}_/g, "_")}`}`]: collectionSyncFnsGenerator(db, collection),
    };
  }, {});

  const FT_history = (config.history || []).reduce(
    (acc: any, collection: CollectionHistoryConfig) => {
      return {
        ...acc,
        [collection.name
          .replace(/\//g, "_")
          .replace(/_{.*?}_/g, "_")]: collectionSnapshotFnsGenerator(db, collection),
      };
    },
    {}
  );
  
  const defaultPermissionsConfig = [{ "name": "userPermissions", "customTokenFields": ["regions", "roles"] }]

  const FT_permissions = (config.permissions || defaultPermissionsConfig).reduce(
    (acc: any, collection) => {
      return {
        ...acc,
        [collection.name]: permissionControlFnsGenerator(auth, db, collection),
      };
    },
    {}
  );


  const FT_synonyms = (config.synonyms || []).reduce((acc: any, collection: SynonymConfig) => {
    return {
      ...acc,
      [collection.name]: synonymsFnsGenerator(db, collection),
    };
  }, {});

  return {
    exportTable,
    SendEmail,
    FT_algolia,
    FT_sync,
    FT_history,
    FT_permissions,
    FT_synonyms,
  }
}
