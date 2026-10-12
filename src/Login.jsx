import { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (err) {
      setError(
        err.message?.includes('Invalid login')
          ? 'Email o password non corretti.'
          : 'Accesso non riuscito. Controlla la connessione e riprova.'
      )
    }
    setBusy(false)
  }

  return (
    <div className="login">
      <form className="login-card form" onSubmit={submit}>
        <h1 className="greeting">Ciao Massimiliano</h1>
        <p className="today">Accedi per vedere le tue task</p>
        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
          {busy ? 'Accesso…' : 'Accedi'}
        </button>
      </form>
    </div>
  )
}
