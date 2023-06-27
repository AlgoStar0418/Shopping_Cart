import { useState } from 'react';

import { v4 as uuid } from 'uuid';

import { EmailAuthProvider, linkWithCredential } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

import { auth } from 'db/config';
import { db } from 'db/config';

import { useAuthContext } from './useAuthContext';
import { useCartContext } from './useCartContext';

export const useSignUp = () => {
  const { dispatch } = useAuthContext();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultValue, setDefaultValue] = useState(false);

  const signUp = async ({ name, lastName, email, password }) => {
    setError(null);
    setIsLoading(true);
    setDefaultValue({ name, lastName });

    try {
      const credential = EmailAuthProvider.credential(email, password);

      const userCredential = await linkWithCredential(
        auth.currentUser,
        credential
      );

      if (!userCredential) {
        throw new Error('No se pudo crear la cuenta');
      }

      const user = userCredential.user;

      const userData = {
        name,
        lastName,
        email,
        phoneNumber: null,
        addresses: [],
        isVerified: true,
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      dispatch({ type: 'LOGIN', payload: { user, ...userData } });
      dispatchCartAction({ type: 'CART_IS_READY' });
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError({ details: 'El usuario ya existe' });
      } else {
        setError(err);
      }
    }
  };

  return { signUp, error, isLoading, defaultValue };
};
