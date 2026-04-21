import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDgw_zL6Z3-ZNj-QI1o8GqjjpTnT3k_0LY',
  authDomain: 'independencia-rrhh.firebaseapp.com',
  projectId: 'independencia-rrhh',
  storageBucket: 'independencia-rrhh.firebasestorage.app',
  messagingSenderId: '483180144404',
  appId: '1:483180144404:web:926c6aa01dfdc8b526c401',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
