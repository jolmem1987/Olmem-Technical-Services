'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function Form() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Only ever follow an in-app admin path, so a crafted ?next= cannot bounce
  // the administrator to an external site after login.
  const requested = searchParams.get('next') ?? '';
  const next = requested.startsWith('/admin') && !requested.startsWith('//') ? requested : '/admin';

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.get('username'),
          password: form.get('password'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to sign in.');
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Unable to sign in.');
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        Username
        <input name="username" autoComplete="username" required />
      </label>
      <label>
        Password
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      <button className="button" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign In'}
      </button>
      {error && <p className="admin-error">{error}</p>}
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={null}>
      <Form />
    </Suspense>
  );
}
