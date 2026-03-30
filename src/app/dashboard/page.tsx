'use client'

import { useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import {
    LogOut,
    Plus,
    ShoppingCart,
    Loader2,
    Table as TableIcon,
    Calendar,
    ArrowRight,
    TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ totalGeral: 0, totalItens: 0 })
    const router = useRouter()

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                router.push('/login')
            } else {
                setUser(currentUser)
            }
        })
        return () => unsubscribe()
    }, [router])

    // Busca estatísticas rápidas para o topo do dashboard
    useEffect(() => {
        if (!user) return
        const q = query(collection(db, 'compras'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let total = 0
            snapshot.docs.forEach(doc => {
                const data = doc.data()
                total += (data.valor || 0) * (data.quantidade || 1)
            })
            setStats({ totalGeral: total, totalItens: snapshot.size })
            setLoading(false)
        })
        return () => unsubscribe()
    }, [user])

    const handleLogout = async () => {
        await signOut(auth)
        router.push('/login')
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-slate-200">
            {/* Header */}
            <header className="bg-[#1e293b] border-b border-slate-800 sticky top-0 z-20 shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-bold text-xl text-white italic">
                        <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-900/20">
                            <ShoppingCart className="text-white w-6 h-6" />
                        </div>
                        <span className="tracking-tighter">FINANCEIRO <span className="text-orange-500 not-italic">GR</span></span>
                    </div>

                    <button onClick={handleLogout} className="bg-slate-800 p-3 rounded-2xl text-slate-400 hover:text-red-500 transition-all border border-slate-700">
                        <LogOut size={20} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-10">
                {/* Resumo Rápido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Investimento Total</p>
                        <h3 className="text-3xl font-black text-white font-mono">R$ {stats.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Peças em Estoque</p>
                        <h3 className="text-3xl font-black text-white font-mono">{stats.totalItens} <span className="text-sm font-sans text-slate-500">Unidades</span></h3>
                    </div>
                    <Link href="/dashboard/novo" className="bg-orange-600 p-6 rounded-[2rem] shadow-xl shadow-orange-900/20 flex items-center justify-center gap-4 hover:bg-orange-500 transition-all group">
                        <Plus className="text-white group-hover:scale-125 transition-transform" size={32} />
                        <span className="text-xl font-black uppercase tracking-tighter text-white">Nova Compra</span>
                    </Link>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Navegação por Mês</h2>
                    <p className="text-slate-500 font-medium">Selecione o período para visualizar a planilha detalhada.</p>
                </div>

                {/* Grid de Meses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {meses.map((mes, index) => (
                        <Link
                            key={mes}
                            href={`/dashboard/planilha?mes=${index}`}
                            className="bg-[#1e293b] group p-6 rounded-[2rem] border border-slate-800 hover:border-orange-500/50 hover:bg-slate-800/50 transition-all shadow-lg flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#0f172a] rounded-2xl text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                    <Calendar size={24} />
                                </div>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">2026</span>
                            </div>

                            <div>
                                <h4 className="text-2xl font-black text-white group-hover:text-orange-500 transition-colors uppercase italic">{mes}</h4>
                                <div className="flex items-center gap-2 text-slate-500 mt-2 font-bold text-xs">
                                    Ver Planilha <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Atalho para Planilha Geral */}
                <div className="mt-12">
                    <Link
                        href="/dashboard/planilha"
                        className="w-full bg-slate-800/50 border border-slate-700 p-8 rounded-[2.5rem] flex items-center justify-between hover:bg-slate-800 transition-all group"
                    >
                        <div className="flex items-center gap-6">
                            <div className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-900/20 text-white">
                                <TableIcon size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Planilha Geral Completa</h3>
                                <p className="text-slate-500 font-medium text-sm italic">Visão consolidada de todas as semanas e meses registrados.</p>
                            </div>
                        </div>
                        <div className="bg-[#0f172a] p-4 rounded-2xl text-slate-500 group-hover:text-white transition-all">
                            <TrendingUp size={24} />
                        </div>
                    </Link>
                </div>
            </main>
        </div>
    )
}