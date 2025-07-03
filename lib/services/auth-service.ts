
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types';
import { generateCardNumber } from '../utils';
import { prisma } from '../db';

export class AuthService {
  static async signUp(email: string, password: string, name: string, phone?: string): Promise<User> {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase profile
      await updateProfile(firebaseUser, { displayName: name });

      // Send email verification
      await sendEmailVerification(firebaseUser);

      // Create user in database
      const userData = {
        id: firebaseUser.uid,
        email,
        name,
        phone: phone || null,
        profileImage: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Prisma database
      const user = await prisma.user.create({
        data: userData,
      });

      // Create default metro card
      await prisma.metroCard.create({
        data: {
          cardNumber: generateCardNumber(),
          balance: 0,
          isActive: true,
          cardType: 'REGULAR',
          userId: user.id,
        },
      });

      // Save to Firestore for real-time sync
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      return user;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user data from database
      const user = await prisma.user.findUnique({
        where: { id: firebaseUser.uid },
      });

      if (!user) {
        throw new Error('User not found in database');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  static async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      // Update Firestore
      await updateDoc(doc(db, 'users', userId), data);

      return user;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const user = await prisma.user.findUnique({
        where: { id: firebaseUser.uid },
      });

      return user;
    } catch (error: any) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}
