import { createContext, useEffect, useMemo, useState } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserProfile, UserProfile } from '../services/userProfileService';

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  confirmationResult: ConfirmationResult | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  verifyOTP: (otp: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  clearConfirmationResult: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  userProfile: null,
  loading: true,
  confirmationResult: null,
  login: async () => undefined,
  loginWithPhone: async () => {
    throw new Error('Not implemented');
  },
  verifyOTP: async () => undefined,
  register: async () => undefined,
  resetPassword: async () => undefined,
  logout: async () => undefined,
  refreshUserProfile: async () => undefined,
  clearConfirmationResult: () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  const clearConfirmationResult = () => {
    setConfirmationResult(null);
  };

  useEffect(() => {
    // If auth is not initialized (Firebase not configured), skip auth state
    if (!auth) {
      console.warn('Firebase auth not initialized. Running in demo mode.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    userProfile,
    loading,
    confirmationResult,
    login: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    loginWithPhone: async (phoneNumber, recaptchaVerifier) => {
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
      return result;
    },
    verifyOTP: async (otp: string) => {
      if (!confirmationResult) {
        throw new Error('No confirmation result available. Please request OTP again.');
      }
      await confirmationResult.confirm(otp);
      clearConfirmationResult();
    },
    register: async (email, password, name) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      if (name && currentUser) {
        await updateProfile(currentUser, { displayName: name });
      }
    },
    resetPassword: async (email) => {
      await sendPasswordResetEmail(auth, email);
    },
    logout: async () => {
      await signOut(auth);
    },
    refreshUserProfile,
    clearConfirmationResult,
  }), [loading, user, userProfile, confirmationResult]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
