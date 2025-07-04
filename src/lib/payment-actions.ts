'use server';

import { redirect } from 'next/navigation';
import {
  collection,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  increment,
  getDoc,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { getGatewaySettings } from './gateway-service';

type CreatePaymentResponse = {
  status: 'success' | 'fail' | 'error';
  message?: string;
  payment_url?: string;
  data?: {
    payment_url?: string;
  };
};

type VerifyPaymentResponse = {
    status: 'success' | 'fail' | 'error';
    message?: string;
    data?: any; 
};

export async function createPaymentUrl(
  userId: string | null,
  state: { error: string } | null,
  formData: FormData
) {
  if (!userId) {
    return { error: 'User is not authenticated. Please log in again.' };
  }

  const gatewaySettings = await getGatewaySettings();
  const accessToken = gatewaySettings.accessToken;

  if (!accessToken) {
    return { error: 'Payment gateway access token is not configured. Please set it in the admin panel.' };
  }

  const rawFormData = {
    amount: formData.get('amount'),
  };

  if (!rawFormData.amount || +rawFormData.amount < 10) {
    return { error: 'Amount is required and must be at least 10.' };
  }

  const userRef = doc(firestore, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    return { error: 'User profile not found.' };
  }
  const userData = userSnap.data();

  const transaction_id = `TRX-${Date.now()}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  const success_url = `${baseUrl}/payment/success`;
  const cancel_url = `${baseUrl}/payment/cancel`;
  const fail_url = `${baseUrl}/payment/fail`;

  try {
    const transactionData = {
        userId,
        amount: parseFloat(rawFormData.amount.toString()),
        status: 'pending',
        createdAt: Timestamp.now(),
        transaction_id,
        type: 'deposit',
        description: `Deposit via ${gatewaySettings.name}`
    };
    await addDoc(collection(firestore, 'transactions'), transactionData);

    const response = await fetch(gatewaySettings.checkoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: accessToken,
        transaction_id,
        amount: rawFormData.amount,
        success_url: `${success_url}?transaction_id=${transaction_id}`,
        cancel_url,
        fail_url,
        customer_name: userData.name || 'Esports HQ User',
        customer_email: userData.email || 'user@esportshq.com',
        customer_phone: '01234567890', // Placeholder
      }),
    });

    const result: CreatePaymentResponse = await response.json();

    if (result.status === 'success' && result.data?.payment_url) {
      redirect(result.data.payment_url);
    } else {
      return { error: result.message || 'Failed to create payment link.' };
    }
  } catch (error) {
    console.error('Payment creation failed:', error);
    return { error: 'An unexpected server error occurred. Please try again later.' };
  }
}


export async function verifyPayment(transaction_id: string | null): Promise<VerifyPaymentResponse> {
  const gatewaySettings = await getGatewaySettings();
  const accessToken = gatewaySettings.accessToken;

  if (!accessToken) {
      return { status: 'error', message: 'Payment gateway access token is not configured on the server.' };
  }
  if (!transaction_id) {
      return { status: 'error', message: 'Transaction ID is missing.' };
  }

  try {
      const q = query(collection(firestore, 'transactions'), where('transaction_id', '==', transaction_id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { status: 'fail', message: 'Transaction not found in our system.' };
      }
      const transactionDoc = querySnapshot.docs[0];
      const transactionData = transactionDoc.data();

      if (transactionData.status !== 'pending') {
          return { status: 'success', message: `Transaction was already processed with status: ${transactionData.status}.` };
      }

      const response = await fetch(gatewaySettings.verifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken, transaction_id: transaction_id }),
      });
      const result: VerifyPaymentResponse = await response.json();
      
      const batch = writeBatch(firestore);
      if (result.status === 'success' && result.data?.status?.toLowerCase() === 'completed') {
        const userRef = doc(firestore, 'users', transactionData.userId);
        batch.update(userRef, { balance: increment(transactionData.amount) });
        batch.update(transactionDoc.ref, { status: 'success' });
      } else {
        batch.update(transactionDoc.ref, { status: 'failed', failure_reason: result.message });
      }

      await batch.commit();

      return result;

  } catch (error) {
      console.error('Payment verification failed:', error);
      return { status: 'error', message: 'An unexpected error occurred during payment verification.' };
  }
}

export async function withdrawAmount(
  userId: string,
  amountToWithdraw: number,
  method: string
): Promise<{ success: boolean; error?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  if (!amountToWithdraw || amountToWithdraw <= 0) {
    return { success: false, error: 'Invalid withdrawal amount.' };
  }

  const userRef = doc(firestore, 'users', userId);
  const transactionRef = doc(collection(firestore, 'transactions'));

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists() || userSnap.data().balance < amountToWithdraw) {
      return { success: false, error: 'Insufficient balance.' };
    }

    const batch = writeBatch(firestore);

    // Decrease user balance
    batch.update(userRef, {
      balance: increment(-amountToWithdraw),
    });

    // Create a withdrawal transaction log
    batch.set(transactionRef, {
      userId,
      amount: -amountToWithdraw,
      type: 'withdrawal',
      description: `Withdrawal to ${method}`,
      date: Timestamp.now(),
      status: 'completed', // Withdrawals are instant in this system
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return { success: false, error: (error as Error).message };
  }
}
