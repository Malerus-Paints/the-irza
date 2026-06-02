import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
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

        {sent ? (
          <div className="bg-[#0a0c10] border border-[#66ff99]/20 rounded-lg p-6 text-center space-y-2">
            <div className="text-[#66ff99] font-mono text-xs tracking-widest">ACCESS LINK TRANSMITTED</div>
            <div className="text-[#8891a4] font-sans text-sm">Check {email} for your access link.</div>
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="mt-2 text-[#3d4352] hover:text-[#5a6175] font-mono text-[10px] tracking-widest transition-colors"
            >
              USE DIFFERENT ADDRESS
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#0a0c10] border border-[#1c1f26] rounded-lg p-6 space-y-4">
            <div>
              <div className="font-mono text-[10px] text-[#3d4352] tracking-widest mb-1.5">OPERATOR EMAIL</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="operator@archive.irza"
                className="w-full bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40"
              />
            </div>
            {error && (
              <div className="font-mono text-[10px] text-[#cc3355] tracking-widest">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-[#66ff99]/10 hover:bg-[#66ff99]/20 border border-[#66ff99]/30 text-[#66ff99] font-mono text-xs tracking-widest py-2.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'TRANSMITTING...' : 'REQUEST ACCESS LINK'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-[#3d4352] font-mono text-[10px] tracking-widest">
          ARCHIVE STATUS: ACTIVE · CLEARANCE: OPERATOR LEVEL
        </div>
      </div>
    </div>
  )
}
