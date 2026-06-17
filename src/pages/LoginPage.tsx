import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-[#050608] items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <div className="text-[#66ff99] font-mono text-xs tracking-widest mb-3">IRZA SYSTEM</div>
          <div className="text-[#dde0e6] font-display text-3xl tracking-widest leading-tight">
            INTER-REALITY<br />ZOOLOGICAL<br />ARCHIVE
          </div>
          <div className="mt-3 text-[#5a6175] font-mono text-[10px] tracking-widest">
            OPERATOR AUTHENTICATION REQUIRED
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a0c10] border border-[#1c1f26] rounded-lg p-6 space-y-4">
          <div>
            <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1.5">OPERATOR EMAIL</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="operator@archive.irza"
              className="w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40"
            />
          </div>
          <div>
            <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1.5">PASSWORD</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40"
            />
          </div>
          {error && (
            <div className="font-mono text-[10px] text-[#cc3355] tracking-widest">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full bg-[#66ff99]/10 hover:bg-[#66ff99]/20 border border-[#66ff99]/30 text-[#66ff99] font-mono text-xs tracking-widest py-2.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? 'AUTHENTICATING...' : 'AUTHENTICATE'}
          </button>
        </form>

        <div className="mt-6 text-center text-[#3d4352] font-mono text-[10px] tracking-widest">
          ARCHIVE STATUS: ACTIVE · CLEARANCE: OPERATOR LEVEL
        </div>
      </div>
    </div>
  )
}
