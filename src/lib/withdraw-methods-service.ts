import type { WithdrawMethod } from '@/types';
import { mockWithdrawMethods } from './mock-data';

let methods = [...mockWithdrawMethods];

export const addWithdrawMethod = async (method: Omit<WithdrawMethod, 'id'>) => {
  const newMethod: WithdrawMethod = {
    ...method,
    id: `wm_${Date.now()}`,
  };
  methods.push(newMethod);
  return { success: true };
};

export const getWithdrawMethodsStream = (callback: (methods: WithdrawMethod[]) => void) => {
  callback([...methods].sort((a,b) => a.name.localeCompare(b.name)));
  return () => {};
};

export const getActiveWithdrawMethods = async (): Promise<WithdrawMethod[]> => {
    const active = methods.filter(m => m.status === 'active');
    return Promise.resolve(active);
}

export const updateWithdrawMethod = async (id: string, data: Partial<Omit<WithdrawMethod, 'id'>>) => {
  const methodIndex = methods.findIndex(m => m.id === id);
  if (methodIndex > -1) {
    methods[methodIndex] = { ...methods[methodIndex], ...data };
    return { success: true };
  }
  return { success: false, error: "Method not found." };
};

export const deleteWithdrawMethod = async (id: string) => {
  const initialLength = methods.length;
  methods = methods.filter(m => m.id !== id);
  if (methods.length < initialLength) {
    return { success: true };
  }
  return { success: false, error: "Method not found." };
};
