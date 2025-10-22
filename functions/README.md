# Firebase Functions for Lodge - User Deletion

This folder contains a minimal Firebase Cloud Function for deleting a user's data (hard or soft delete).

Files:
- `index.js` - HTTP function `deleteUserData` that expects POST { idToken, uid, mode }

Setup and deploy
1. Install dependencies inside `functions/`:

   npm install

2. Deploy with Firebase CLI (you must have `firebase-tools` installed and authenticated):

   firebase deploy --only functions:deleteUserData

Environment and permissions
- The function uses the Admin SDK and requires the service account used by Firebase to have permission to delete Storage objects and Firestore documents.
- Make sure your Firebase project has a `lodges` collection with `ownerId` field and a `bookings` collection with `userId`.

Testing locally
1. Use `firebase emulators:start --only functions` to run the function locally.
2. Call the endpoint with a valid ID token obtained from the client (frontend) after sign-in.

Security note
- The function verifies the ID token and compares UID; do not accept unauthenticated deletion requests.
- Consider adding rate-limiting and an administrator approval workflow for high-risk deletions.
