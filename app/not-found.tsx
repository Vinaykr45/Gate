import Link from 'next/link'
import { BRAND } from '@/lib/brand'
import { ArrowLeft, BookOpen, LayoutDashboard, FlaskConical, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-30 bg-indigo-500 pointer-events-none -top-20 left-1/2 -translate-x-1/2" />
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[130px] opacity-20 bg-cyan-500 pointer-events-none -bottom-20 right-1/4" />

      <div className="w-full max-w-lg glass-surface p-8 sm:p-10 rounded-3xl text-center animate-slide-up space-y-6 border border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] relative z-10">
        
        {/* Glowing 404 Badge */}
        <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center font-black text-3xl text-white bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-white/20">
          404
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Resource or Page Relocated</h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
            The curriculum topic, exam mock, or page you requested has been restructured or relocated in {BRAND.name}.
          </p>
        </div>

        {/* Quick Nav Destination Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 text-left">
          <Link
            href="/learn"
            className="p-3 rounded-xl glass-card-interactive border border-white/10 group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white group-hover:text-indigo-300">Curriculum Hub</span>
            </div>
            <p className="text-[11px] text-slate-400">GATE & CA Syllabi</p>
          </Link>

          <Link
            href="/dashboard"
            className="p-3 rounded-xl glass-card-interactive border border-white/10 group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white group-hover:text-emerald-300">Dashboard</span>
            </div>
            <p className="text-[11px] text-slate-400">Study Roadmap</p>
          </Link>

          <Link
            href="/test"
            className="p-3 rounded-xl glass-card-interactive border border-white/10 group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">Exam Simulator</span>
            </div>
            <p className="text-[11px] text-slate-400">Mock Tests</p>
          </Link>

          <Link
            href="/"
            className="p-3 rounded-xl glass-card-interactive border border-white/10 group cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white group-hover:text-purple-300">Home Page</span>
            </div>
            <p className="text-[11px] text-slate-400">Overview & Tracks</p>
          </Link>
        </div>

        {/* Primary Back Button */}
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="btn-primary w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Student Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
