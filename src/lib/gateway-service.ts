import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import type { PaymentGatewaySettings } from '@/types';

const settingsDocRef = doc(firestore, 'settings', 'paymentGateway');

// Helper to get settings with default fallbacks
export const getGatewaySettings = async (): Promise<Omit<PaymentGatewaySettings, 'id'>> => {
  const defaultSettings = {
    name: 'RupantorPay',
    accessToken: process.env.RUPANTORPAY_ACCESS_TOKEN || '',
    checkoutUrl: 'https://payment.rupantorpay.com/api/payment/checkout',
    verifyUrl: 'https://payment.rupantorpay.com/api/payment/verify-payment',
  };

  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return { ...defaultSettings, ...docSnap.data() };
    }
    // If no settings exist, create them with defaults
    await setDoc(settingsDocRef, defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error("Error fetching gateway settings, returning defaults:", error);
    return defaultSettings;
  }
};

// Helper to update settings
export const updateGatewaySettings = async (data: Partial<Omit<PaymentGatewaySettings, 'id'>>) => {
  try {
    // Using setDoc with merge: true will create the document if it doesn't exist, or update it if it does.
    await setDoc(settingsDocRef, data, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating gateway settings:', error);
    return { success: false, error: (error as Error).message };
  }
};
