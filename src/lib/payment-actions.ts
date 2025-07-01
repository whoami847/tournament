'use server';

import { redirect } from 'next/navigation';

const RUPANTORPAY_API_URL = 'https://payment.rupantorpay.com/api/payment';

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

// This function is designed to be used with React's useFormState hook.
export async function createPaymentUrl(state: { error: string } | null, formData: FormData) {
  const accessToken = process.env.RUPANTORPAY_ACCESS_TOKEN;
  if (!accessToken || accessToken === 'YOUR_SECRET_ACCESS_TOKEN') {
    return { error: 'RupantorPay access token is not configured on the server. Please check your .env file.' };
  }

  const rawFormData = {
    amount: formData.get('amount'),
    customer_name: formData.get('customer_name'),
    customer_email: formData.get('customer_email'),
    customer_phone: formData.get('customer_phone'),
  };

  // Basic server-side validation
  if (!rawFormData.amount || !rawFormData.customer_name || !rawFormData.customer_email || !rawFormData.customer_phone) {
    return { error: 'All fields are required.' };
  }
  
  const transaction_id = `TRX-${Date.now()}`;
  // In a real app, use the actual base URL from environment variables.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  const success_url = `${baseUrl}/payment/success`;
  const cancel_url = `${baseUrl}/payment/cancel`;
  const fail_url = `${baseUrl}/payment/fail`;

  try {
    const response = await fetch(`${RUPANTORPAY_API_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        transaction_id,
        amount: rawFormData.amount,
        success_url: `${success_url}?transaction_id=${transaction_id}`,
        cancel_url,
        fail_url,
        customer_name: rawFormData.customer_name,
        customer_email: rawFormData.customer_email,
        customer_phone: rawFormData.customer_phone,
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
  const accessToken = process.env.RUPANTORPAY_ACCESS_TOKEN;
  if (!accessToken || accessToken === 'YOUR_SECRET_ACCESS_TOKEN') {
      return { status: 'error', message: 'RupantorPay access token is not configured on the server.' };
  }
  if (!transaction_id) {
      return { status: 'error', message: 'Transaction ID is missing.' };
  }

  try {
      const response = await fetch(`${RUPANTORPAY_API_URL}/verify-payment`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              access_token: accessToken,
              transaction_id: transaction_id,
          }),
      });
      const result: VerifyPaymentResponse = await response.json();
      
      // In a real application, you would check the payment status from `result.data`
      // and update your database accordingly before confirming success to the user.
      // e.g., if (result.data.status === 'COMPLETED') { updateUserWallet(result.data.amount); }

      return result;

  } catch (error) {
      console.error('Payment verification failed:', error);
      return { status: 'error', message: 'An unexpected error occurred during payment verification.' };
  }
}
