import * as functions from "firebase-functions";
import { db } from "./config";
import * as admin from "firebase-admin";
import { sendEmail } from "@knshiro/firetable-functions/lib/utils/email";
import { hasAnyRole } from "@knshiro/firetable-functions/lib/utils/auth";

const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;

export const verifyFounder = functions.https.onCall(
  async (
    data: {
      ref: {
        id: string;
        path: string;
        parentId: string;
      };
      row: any;
      action: "run" | "redo" | "undo";
    },
    context: functions.https.CallableContext
  ) => {
    const { row, ref, action } = data;
    const fieldsToSync = [
      "firstName",
      "lastName",
      "preferredName",
      "personalBio",
      "founderType",
      "cohort",
      "email",
      "profilePhoto",
      "twitter",
      "employerLogos",
      "linkedin",
      "publicProfile",
      "companies",
    ];

    const authorized = hasAnyRole(["ADMIN", "PROGRAM"], context);

    if (!context.auth || !authorized) {
      console.warn(`unautherized user${context}`);
      return {
        success: false,
        message: "you dont have permissions to send this email",
      };
    }
    switch (action) {
      case "undo":
      case "redo":
      case "run":
      default:
        const syncData = fieldsToSync.reduce((acc: any, curr: string) => {
          if (row[curr]) {
            acc[curr] = row[curr];
            return acc;
          } else return acc;
        }, {});
        await db
          .collection("founders")
          .doc(ref.id)
          .set(syncData, { merge: true });
        await sendEmail("p8K9z0CBhGlb3Vgzl02o", row);
        return {
          message: "Founder created!",
          cellValue: {
            redo: false,
            status: "Verified",
            undo: true,
            meta: { ranBy: context.auth.token.email },
          },
          completedAt: serverTimestamp(),
          success: true,
        };
    }
  }
);