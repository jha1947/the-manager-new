import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PaymentForm } from '@/components/PaymentForm';
import { getUserWallet } from '@/lib/walletData';

export default async function PaymentPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (e) {}
        },
        remove(name: string, options: any) {
          try {
            cookieStore.delete(name);
          } catch (e) {}
        },
      },
    }
  );

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!userProfile || userProfile.role !== 'resident') redirect('/login');

  // Get wallet data
  const wallet = await getUserWallet(user.id);
  const currentBalance = wallet?.balance || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Make a Payment</h1>
        <p className="text-gray-600 mt-2">Submit your maintenance fee payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PaymentForm
            userId={user.id}
            societyId={userProfile.society_id}
            currentBalance={currentBalance}
          />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Payment Information</h3>

            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-600 text-sm">Current Balance</p>
                <p className="text-2xl font-bold text-green-600 mt-1">₹{currentBalance.toLocaleString()}</p>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <p className="text-gray-600 text-sm">Payment Processing</p>
                <p className="text-gray-900 font-medium mt-1">2-3 Business Days</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Security</p>
                <p className="text-gray-900 font-medium mt-1">All payments are encrypted</p>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-900">
                💡 <strong>Tip:</strong> Keep your reference number safe for tracking your payment status.
              </p>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 text-sm mb-4">
              If you have any questions about making a payment, contact your society admin.
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-gray-900">
                <span className="font-medium">Admin:</span> admin@society.com
              </p>
              <p className="text-gray-900">
                <span className="font-medium">Call:</span> +91 (XXX) XXX-XXXX
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
