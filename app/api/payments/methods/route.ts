import { NextRequest } from 'next/server';
import { getPaystackBanks } from '@/lib/paystack';
import {
  successResponse,
  serverErrorResponse,
} from '@/lib/api-response';

// GET /api/payments/methods - Get available payment methods
export async function GET(request: NextRequest) {
  try {
    const paymentMethods = [
      {
        id: 'card',
        name: 'Card Payment',
        description: 'Pay with your debit or credit card',
        icon: '💳',
        channels: ['card'],
        supported: true,
      },
      {
        id: 'bank',
        name: 'Bank Transfer',
        description: 'Transfer from your bank account',
        icon: '🏦',
        channels: ['bank', 'bank_transfer'],
        supported: true,
      },
      {
        id: 'ussd',
        name: 'USSD',
        description: 'Pay with USSD code',
        icon: '📱',
        channels: ['ussd'],
        supported: true,
      },
      {
        id: 'qr',
        name: 'QR Code',
        description: 'Scan to pay',
        icon: '📲',
        channels: ['qr'],
        supported: true,
      },
      {
        id: 'mobile_money',
        name: 'Mobile Money',
        description: 'Pay with mobile money',
        icon: '📞',
        channels: ['mobile_money'],
        supported: true,
      },
    ];

    // Get supported banks (optional, can be cached)
    let banks = [];
    try {
      const banksResponse = await getPaystackBanks('nigeria');
      if (banksResponse.status) {
        banks = banksResponse.data.map((bank: any) => ({
          id: bank.id,
          name: bank.name,
          code: bank.code,
          slug: bank.slug,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch banks:', error);
      // Continue without banks list
    }

    return successResponse({
      methods: paymentMethods,
      banks: banks.slice(0, 20), // Return top 20 banks
      currency: 'NGN',
      gateway: 'Paystack',
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return serverErrorResponse('Failed to fetch payment methods');
  }
}
