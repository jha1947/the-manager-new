 "use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState('phone');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (loginMethod === 'phone') {
        const { error } = await supabase.auth.signInWithOtp({
          phone: mobile,
        });
        if (error) throw error;
        setMessage('OTP sent to ' + mobile);
        router.push('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-sm w-full bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-slate-200">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            The Manager
          </h1>
          <p className="text-slate-600">Login to dashboard</p>
        </div>

        <div className="bg-slate-100 rounded-2xl p-1">
          <button 
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${loginMethod === 'phone' ? 'bg-blue-500 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            Phone OTP
          </button>
          <button 
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${loginMethod === 'email' ? 'bg-green-500 text-white' : 'text-slate-700 hover:bg-slate-200'}`}
          >
            Email Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {loginMethod === 'phone' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+919104325231"
                className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>
          )}
          {loginMethod === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-green-200 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-green-200 focus:border-green-500"
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-2xl transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>

        {message && (
          <div className={`p-3 rounded-xl text-sm ${message.includes('OTP') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
