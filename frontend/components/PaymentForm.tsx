'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface PaymentFormProps {
  userId: string;
  societyId: string;
  currentBalance: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}

export function PaymentForm({ userId, societyId, currentBalance }: PaymentFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    paymentMethod: 'bank_transfer',
  });

  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      description: 'Direct transfer to society account',
      icon: '🏦',
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Instantly pay via UPI apps',
      icon: '📱',
      comingSoon: true,
    },
    {
      id: 'card',
      name: 'Debit Card',
      description: 'Pay using debit/credit card',
      icon: '💳',
      comingSoon: true,
    },
    {
      id: 'cheque',
      name: 'Cheque',
      description: 'Physical cheque payment',
      icon: '📄',
      comingSoon: true,
    },
  ];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setFormData(prev => ({ ...prev, amount: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const amount = parseFloat(formData.amount);

      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      if (amount > 1000000) {
        throw new Error('Amount cannot exceed ₹10,00,000');
      }

      // Create payment record
      const { error: insertError, data } = await supabase
        .from('maintenance_payments')
        .insert({
          resident_id: userId,
          society_id: societyId,
          amount: amount,
          payment_method: selectedMethod,
          description: formData.description || `Manual payment of ₹${amount}`,
          status: 'pending',
          reference_id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        amount: '',
        description: '',
        paymentMethod: 'bank_transfer',
      });

      // Show success message
      setTimeout(() => {
        setSuccess(false);
        router.push('/dashboard/wallet/transactions');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Make a Payment</h2>
            <p className="text-gray-600 text-sm mt-1">Pay your maintenance fees to keep your society running smoothly</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-gray-600">Current Balance</p>
            <p className="text-2xl font-bold text-green-600">₹{currentBalance.toLocaleString()}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">✓ Payment submitted successfully! Redirecting...</p>
          </div>
        )}

        {/* Payment Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">Select Payment Method</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => !method.comingSoon && setSelectedMethod(method.id)}
                disabled={method.comingSoon}
                className={`p-4 rounded-lg border-2 transition text-center relative ${
                  selectedMethod === method.id && !method.comingSoon
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${method.comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="text-3xl mb-2">{method.icon}</div>
                <p className="font-medium text-sm text-gray-900">{method.name}</p>
                <p className="text-xs text-gray-600 mt-1">{method.description}</p>
                {method.comingSoon && (
                  <span className="absolute top-1 right-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Details Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-600 font-medium">₹</span>
              <input
                type="text"
                id="amount"
                value={formData.amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                required
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum amount: ₹10,00,000</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Reference / Notes (Optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Maintenance for April 2024"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          {/* Method-specific Instructions */}
          {selectedMethod === 'bank_transfer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Bank Transfer Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Use your reference number as the bank transaction description</li>
                <li>Payment will be verified within 2-3 business days</li>
                <li>You'll receive a confirmation once verified</li>
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.amount}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Submit Payment'}
            </button>
            <button
              type="reset"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <details className="border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">How long does payment verification take?</summary>
            <p className="text-gray-600 text-sm mt-2">Usually 2-3 business days. You'll receive an email confirmation once verified.</p>
          </details>

          <details className="border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">Can I cancel a payment?</summary>
            <p className="text-gray-600 text-sm mt-2">Yes, you can cancel payments with "pending" status. Verified payments require admin approval.</p>
          </details>

          <details className="border border-gray-200 rounded-lg p-4">
            <summary className="font-medium text-gray-900 cursor-pointer">Is there a transaction fee?</summary>
            <p className="text-gray-600 text-sm mt-2">No hidden fees! Bank transfers are free. Other methods may have minimal processing fees.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
