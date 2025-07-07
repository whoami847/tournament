import type { PaymentGatewaySettings } from '@/types';
import { mockGatewaySettings } from './mock-data';

let settings = {...mockGatewaySettings};

export const getGatewaySettings = async (): Promise<Omit<PaymentGatewaySettings, 'id'>> => {
  return Promise.resolve(settings);
};

export const updateGatewaySettings = async (data: Partial<Omit<PaymentGatewaySettings, 'id'>>) => {
  settings = { ...settings, ...data };
  return { success: true };
};
