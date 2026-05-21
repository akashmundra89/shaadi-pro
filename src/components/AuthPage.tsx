import { useState } from 'react'
import { supabase } from '../lib/supabase'
import heroPng from '../assets/hero.png'

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1C0F14',
    }}>
      {/* Background */}
      <img
        src={heroPng}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18, filter: 'saturate(1.3)' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(28,15,20,0.85) 0%, rgba(45,19,32,0.75) 100%)' }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--surface)', borderRadius: 20, padding: '36px 40px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
        border: '1px solid rgba(201,160,68,0.2)',
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🪔</div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28, fontWeight: 700,
            background: 'linear-gradient(135deg, var(--pink), var(--gold))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 4,
          }}>
            Shaadi Pro
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Professional Wedding Management</div>
        </div>

        {/* Tab toggle */}
        <div style={{
          display: 'flex', marginBottom: 24, borderRadius: 10,
          background: 'var(--bg)', padding: 3, border: '1px solid var(--border)',
        }}>
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              style={{
                flex: 1, padding: '7px 0', border: 'none', borderRadius: 8,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all .15s',
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--pink)' : 'var(--muted)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Error / success messages */}
        {error && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 8,
            background: 'var(--coral-l)', border: '1px solid rgba(208,80,48,0.2)',
            color: 'var(--coral)', fontSize: 12, lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 8,
            background: 'var(--teal-l)', border: '1px solid rgba(26,147,112,0.2)',
            color: 'var(--teal)', fontSize: 12, lineHeight: 1.5,
          }}>
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email Address</label>
            <input
              className="inp"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{ width: '100%' }}
              autoComplete="email"
            />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input
              className="inp"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              required
              minLength={mode === 'signup' ? 6 : undefined}
              style={{ width: '100%' }}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            type="submit"
            className="btn btn-p"
            disabled={loading}
            style={{
              width: '100%', justifyContent: 'center', padding: '10px',
              fontSize: 13, fontWeight: 700, marginTop: 4,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
              : (mode === 'signin' ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--muted)' }}>
          {mode === 'signin'
            ? <>Don't have an account? <span style={{ color: 'var(--pink)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>Sign up free</span></>
            : <>Already have an account? <span style={{ color: 'var(--pink)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setMode('signin'); setError(''); setSuccess('') }}>Sign in</span></>
          }
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--muted)', lineHeight: 1.6 }}>
          Your wedding data is securely stored and only accessible to you.
        </div>
      </div>
    </div>
  )
}
