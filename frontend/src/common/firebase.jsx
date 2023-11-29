import {GoogleAuthProvider,getAuth, signInWithPopup} from 'firebase/auth'
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyDqiw_EcKS7qkDqXhr2jpmDQP89EgiSoAM",
  authDomain: "yeh-hai-14364.firebaseapp.com",
  projectId: "yeh-hai-14364",
  storageBucket: "yeh-hai-14364.appspot.com",
  messagingSenderId: "423333952696",
  appId: "1:423333952696:web:c0d7dcdf5f0d9f40b5884d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// google auth Provider

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
    let user = null;

    await signInWithPopup(auth,provider)
    .then((result)=>{
        user = result.user;
    }).catch( (err)=>{
        console.log(err);
    })

    return user;
}
