import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { FeaturedBanner } from '@/types';

// Helper to convert Firestore doc to FeaturedBanner type
const fromFirestore = (doc: any): FeaturedBanner => {
  const data = doc.data();
  return {
    id: doc.id,
    game: data.game,
    name: data.name,
    date: data.date,
    image: data.image,
    dataAiHint: data.dataAiHint,
  };
};

export const addBanner = async (banner: Omit<FeaturedBanner, 'id'>) => {
  try {
    const newBanner = {
      ...banner,
      createdAt: Timestamp.now(),
    };
    await addDoc(collection(firestore, 'featured_banners'), newBanner);
    return { success: true };
  } catch (error) {
    console.error('Error adding banner: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const getBannersStream = (callback: (banners: FeaturedBanner[]) => void) => {
  const q = query(collection(firestore, 'featured_banners'), orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const banners = querySnapshot.docs.map(fromFirestore);
    callback(banners);
  }, (error) => {
    console.error("Error fetching banners stream: ", error);
    callback([]);
  });

  return unsubscribe;
};

export const updateBanner = async (id: string, data: Partial<Omit<FeaturedBanner, 'id'>>) => {
  try {
    const docRef = doc(firestore, 'featured_banners', id);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error('Error updating banner: ', error);
    return { success: false, error: (error as Error).message };
  }
};

export const deleteBanner = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'featured_banners', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting banner: ', error);
    return { success: false, error: (error as Error).message };
  }
};
