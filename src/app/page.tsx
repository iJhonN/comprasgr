'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Gauge, ArrowRight, LayoutDashboard, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">

            {/* Efeito de Iluminação de Fundo (Ambiente de Garagem) */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-600/5 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[150px] rounded-full"></div>

            {/* Logo / Ícone com Glow */}
            <div className="bg-orange-600 p-6 rounded-[2rem] shadow-[0_0_50px_rgba(234,88,12,0.3)] mb-8 transform hover:scale-105 transition-all duration-500 cursor-default border border-orange-500/20 relative z-10">
                <Gauge className="text-white w-14 h-14" />
            </div>

            {/* Texto Principal */}
            <div className="relative z-10">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic">
                    Financeiro <span className="text-orange-500 not-italic">GR</span>
                </h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-lg mb-12 leading-relaxed font-medium mx-auto">
                    Gestão inteligente de estoque e compras de <span className="text-slate-200 border-b-2 border-orange-600/50">peças automotivas</span> em tempo real.
                </p>
            </div>

            {/* Botões Dinâmicos */}
            <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xs sm:max-w-none justify-center relative z-10">
                {user ? (
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-3 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-2xl active:scale-95"
                    >
                        <LayoutDashboard size={22} />
                        Acessar Painel
                    </Link>
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-3 bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all shadow-[0_10px_40px_rgba(234,88,12,0.3)] active:scale-95"
                    >
                        Entrar no Sistema
                        <ArrowRight size={22} />
                    </Link>
                )}
            </div>

            {/* Rodapé de Status */}
            <div className="absolute bottom-10 flex items-center gap-3 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">
                <ShieldCheck size={14} className="text-orange-900/50" />
                Terminal de Acesso Seguro
            </div>

            {/* Decoração Lateral (Linhas de Grade) - CORRIGIDO AQUI */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                 style={{
                     backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                     backgroundSize: '40px 40px'
                 }}>
            </div>
        </div>
    )
}