import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  getAuth
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, SubscriptionTier } from '../types';

let isAuthOperationPending = false;

export const firebaseService = {
  loginWithGoogle: async (): Promise<User> => {
    const auth = getAuth();
    if (isAuthOperationPending) {
      if (auth.currentUser) return auth.currentUser;
      throw new Error("An authentication operation is already in progress.");
    }
    isAuthOperationPending = true;
    try {
      console.log("Starting Google Login...");
      console.log("Auth object type:", typeof auth);
      const provider = new GoogleAuthProvider();
      console.log("Provider created:", !!provider);
      
      if (!auth || !provider) {
        throw new Error("Firebase Auth or Provider not initialized correctly.");
      }

      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const initialProfile: UserProfile = {
          email: user.email || '',
          fullName: user.displayName || 'Google User',
          role: 'Student',
          createdAt: serverTimestamp(),
          learningProgress: 0,
          xp: 0,
          completedTopics: [],
          quizScores: [],
          tier: SubscriptionTier.FREE,
          streak: 0,
          questionsAskedToday: 0,
          uploadedDocuments: [],
          completedMasterclasses: []
        };
        await setDoc(docRef, initialProfile);
      }
      return user;
    } finally {
      isAuthOperationPending = false;
    }
  },

  loginUser: async (email: string, pass: string): Promise<User> => {
    const auth = getAuth();
    if (isAuthOperationPending) throw new Error("An authentication operation is already in progress.");
    isAuthOperationPending = true;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return userCredential.user;
    } finally {
      isAuthOperationPending = false;
    }
  },

  registerUser: async (email: string, pass: string, fullName: string, userType: 'Tutor' | 'Student'): Promise<User> => {
    const auth = getAuth();
    if (isAuthOperationPending) throw new Error("An authentication operation is already in progress.");
    isAuthOperationPending = true;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      
      const initialProfile: UserProfile = {
        email,
        fullName,
        role: userType,
        createdAt: serverTimestamp(),
        learningProgress: 0,
        xp: 0,
        completedTopics: [],
        quizScores: [],
        tier: SubscriptionTier.FREE,
        streak: 0,
        questionsAskedToday: 0,
        uploadedDocuments: [],
        completedMasterclasses: []
      };
      
      await setDoc(doc(db, 'users', user.uid), initialProfile);
      return user;
    } finally {
      isAuthOperationPending = false;
    }
  },

  logout: () => signOut(getAuth()),

  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  },

  updateProgress: async (uid: string, topic: string) => {
    await updateDoc(doc(db, 'users', uid), {
      completedTopics: arrayUnion(topic),
      learningProgress: increment(5),
      xp: increment(100)
    });
  },

  toggleBookmark: async (uid: string, topic: string, difficulty: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;
    
    const profile = docSnap.data() as UserProfile;
    const bookmarks = profile.bookmarkedLessons || [];
    const existingIndex = bookmarks.findIndex(b => b.topic === topic);
    
    let newBookmarks;
    if (existingIndex > -1) {
      newBookmarks = bookmarks.filter(b => b.topic !== topic);
    } else {
      newBookmarks = [...bookmarks, { topic, difficulty, date: new Date().toISOString() }];
    }
    
    await updateDoc(docRef, { bookmarkedLessons: newBookmarks });
    return newBookmarks;
  }
};
