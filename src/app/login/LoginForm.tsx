'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  redirect: string;
}

export default function LoginForm({ redirect }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<'view' | 'admin'>('view');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleViewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, type: 'view' }),
      });
      const data = await res.json();
      if (data.ok) {
        if (data.isAdmin) {
          router.push(redirect);
          router.refresh();
        } else {
          setStep('admin');
          setPassword('');
        }
      } else {
        setError('Incorrect password. Try again.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, type: 'admin' }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(redirect);
        router.refresh();
      } else {
        setError('Incorrect admin password.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'admin') {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Access granted
          </div>
          <p className="text-white/60 text-sm">Want admin controls? Enter the admin password, or skip to continue.</p>
        </div>

        <form onSubmit={handleAdminSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoFocus
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f97316]/60 focus:bg-white/15 transition-colors"
          />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 bg-[#f97316] hover:bg-[#ea6f0e] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
            >
              {loading ? 'Verifying…' : 'Enable admin'}
            </button>
            <button
              type="button"
              onClick={() => { router.push(redirect); router.refresh(); }}
              className="flex-1 bg-white/10 hover:bg-white/15 text-white/70 text-sm font-medium rounded-lg py-2.5 transition-colors"
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-white font-medium text-sm mb-4">Enter password to continue</h2>
      <form onSubmit={handleViewSubmit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#f97316]/60 focus:bg-white/15 transition-colors"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-[#f97316] hover:bg-[#ea6f0e] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
        >
          {loading ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
