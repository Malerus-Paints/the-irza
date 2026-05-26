import type { EntryStatus, ThreatLevel } from '../../types'
import { STATUS_LABELS, STATUS_COLORS, THREAT_LEVEL_COLORS } from '../../types'

// ─── StatusBadge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: EntryStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] tracking-widest ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── ThreatBadge ──────────────────────────────────────────────────────────────

export function ThreatBadge({ level }: { level: ThreatLevel | null }) {
  if (!level) return <span className="text-[#3d4352] font-mono text-xs">—</span>
  return (
    <span className={`font-mono text-xs tracking-widest ${THREAT_LEVEL_COLORS[level] ?? 'text-[#5a6175]'}`}>
      {level}
    </span>
  )
}

// ─── SystemTag ────────────────────────────────────────────────────────────────

export function SystemTag({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded border border-[#1c1f26] bg-[#111318] font-mono text-[10px] text-[#5a6175] tracking-widest">
      {text}
    </span>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-mono tracking-widest transition-colors disabled:opacity-50'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-xs' }
  const variants = {
    primary: 'bg-[#66ff99]/10 text-[#66ff99] border border-[#66ff99]/30 hover:bg-[#66ff99]/20',
    ghost: 'text-[#5a6175] hover:text-[#8891a4] hover:bg-[#1c1f26]',
    danger: 'text-[#cc3355] border border-[#cc3355]/30 hover:bg-[#cc3355]/10',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} rounded ${className}`} {...props}>
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-mono text-[10px] tracking-widest text-[#5a6175]">{label}</label>
      )}
      <input
        className={`bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 ${className}`}
        {...props}
      />
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-mono text-[10px] tracking-widest text-[#5a6175]">{label}</label>
      )}
      <select
        className={`bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans focus:outline-none focus:border-[#66ff99]/40 ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-mono text-[10px] tracking-widest text-[#5a6175]">{label}</label>
      )}
      <textarea
        className={`bg-[#111318] border border-[#1c1f26] rounded px-3 py-2 text-sm text-[#dde0e6] font-sans placeholder-[#3d4352] focus:outline-none focus:border-[#66ff99]/40 resize-y min-h-[100px] ${className}`}
        {...props}
      />
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-6 h-6 border-2 border-[#1c1f26] border-t-[#66ff99] rounded-full animate-spin" />
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-[#1c1f26] text-4xl mb-3">◈</div>
      <div className="font-mono text-xs text-[#3d4352] tracking-widest">{message}</div>
    </div>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-3xl text-[#dde0e6] tracking-widest">{title}</h1>
        {subtitle && (
          <p className="font-mono text-xs text-[#5a6175] tracking-widest mt-1">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#111318] border border-[#1c1f26] rounded-lg p-4 ${className}`}>
      {children}
    </div>
  )
}
