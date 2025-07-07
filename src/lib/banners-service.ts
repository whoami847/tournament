import { mockBanners } from './mock-data';
import type { FeaturedBanner } from '@/types';

// Make it a mutable copy so we can simulate writes
let banners = [...mockBanners];

export const addBanner = async (banner: Omit<FeaturedBanner, 'id'>) => {
  const newBanner = {
    ...banner,
    id: `banner_${Date.now()}`,
  };
  banners.unshift(newBanner); // Add to the top
  return { success: true };
};

export const getBannersStream = (callback: (banners: FeaturedBanner[]) => void) => {
  callback(banners);
  return () => {}; // Return an empty unsubscribe function
};

export const updateBanner = async (id: string, data: Partial<Omit<FeaturedBanner, 'id'>>) => {
  const bannerIndex = banners.findIndex(b => b.id === id);
  if (bannerIndex > -1) {
    banners[bannerIndex] = { ...banners[bannerIndex], ...data };
    return { success: true };
  }
  return { success: false, error: "Banner not found." };
};

export const deleteBanner = async (id: string) => {
  const initialLength = banners.length;
  banners = banners.filter(b => b.id !== id);
  if (banners.length < initialLength) {
    return { success: true };
  }
  return { success: false, error: "Banner not found." };
};
