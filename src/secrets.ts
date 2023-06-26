import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from "firebase/firestore";

let allVersions: number[] = [];

const firebaseConfig = {
  apiKey: "AIzaSyAP5JCTkv3ZhL3HMhdD0PpCI3VrEEMKDMU",
  authDomain: "versioned-secrets.firebaseapp.com",
  projectId: "versioned-secrets",
  storageBucket: "versioned-secrets.appspot.com",
  messagingSenderId: "990738825054",
  appId: "1:990738825054:web:0d2d26d135c160ddebd9cf",
  measurementId: "G-3G4H7NWCYE"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

const versions = collection(firestore, 'versions');

getDocs(versions).then(docs => {
  docs.forEach(d => {
    allVersions.push(+d.id)
  })
})

export { allVersions }
