const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Helper to delete a Firestore collection in batches
async function deleteCollection(path) {
  const collectionRef = db.collection(path);
  const snapshot = await collectionRef.limit(500).get();
  if (snapshot.empty) return;
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  if (snapshot.size === 500) {
    // continue recursively
    return deleteCollection(path);
  }
}

exports.deleteUserData = functions.https.onRequest(async (req, res) => {
  // Expect POST with {idToken, uid, mode}
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { idToken, uid, mode } = req.body || {};
  if (!idToken || !uid) return res.status(400).json({ error: "Missing idToken or uid" });

  try {
    // Verify the token
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (decoded.uid !== uid) return res.status(403).json({ error: "Token UID mismatch" });

    // Decide between soft-delete and hard-delete
    if (mode === "soft") {
      // mark user doc deleted
      await db.collection("users").doc(uid).set({ deleted: true, deletedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return res.json({ ok: true, mode: "soft" });
    }

    // Hard delete flow: remove user's data and auth account
    // 1) delete user's lodges
    const lodgesRef = db.collection("lodges").where("ownerId", "==", uid);
    const lodgesSnapshot = await lodgesRef.get();
    for (const doc of lodgesSnapshot.docs) {
      const data = doc.data();
      // delete related storage objects if images array present
      if (Array.isArray(data.images)) {
        for (const imgPath of data.images) {
          try {
            const file = storage.bucket().file(imgPath);
            await file.delete().catch(() => {});
          } catch (e) {
            // ignore individual failures
          }
        }
      }
      await doc.ref.delete();
    }

    // 2) delete bookings where user is booked
    const bookingsRef = db.collection("bookings").where("userId", "==", uid);
    const bookingsSnapshot = await bookingsRef.get();
    for (const doc of bookingsSnapshot.docs) await doc.ref.delete();

    // 3) remove or anonymize user document
    await db.collection("users").doc(uid).delete().catch(() => {});

    // 4) optionally delete other collections (fast unsafe) e.g. messages
    // await deleteCollection(`users/${uid}/messages`);

    // 5) delete user from Auth
    await admin.auth().deleteUser(uid);

    return res.json({ ok: true, mode: "hard" });
  } catch (err) {
    console.error("deleteUserData error", err);
    return res.status(500).json({ error: String(err) });
  }
});
