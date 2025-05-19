import { Firestore } from "firebase/firestore";
import { Auth } from "firebase/auth";
import { FirebaseStorage } from "firebase/storage";
import { FirebaseApp } from "firebase/app";

// Declaração de tipos para o módulo firebase.js
declare const db: Firestore;
declare const auth: Auth;
declare const storage: FirebaseStorage;
declare const app: FirebaseApp;

export { db, auth, storage, app }

declare module '../firebase' {
  const firebase: any; // Substitua 'any' pelos tipos corretos se souber
  export = firebase;
}
