'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { ArrowLeft, History, User, Clock, Tag } from 'lucide-react'
import Link from 'next/link'

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Buscamos as últimas 50 atividades
        const q = query(collection(db, 'compras'), orderBy('atualizadoEm', 'desc'), limit(50))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setLogs(docs)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-full text-orange-500 transition-colors">
                            <ArrowLeft size={24} />
                        </Link>
                        <h1 className="text-3xl font-black uppercase italic text-white tracking-tighter">Histórico de <span className="text-orange-500">Atividade</span></h1>
                    </div>
                    <History className="text-slate-700" size={32} />
                </header>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center p-20 text-slate-500 animate-pulse uppercase font-black tracking-widest">Carregando rastro de dados...</div>
                    ) : logs.map((log) => (
                        <div key={log.id} className="bg-[#1e293b] border border-slate-800 p-5 rounded-2xl hover:border-orange-500/30 transition-all group">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${log.tipoAcao === 'EDIÇÃO' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                        <Tag size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white uppercase">{log.produto}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                            <User size={12} />
                                            <span>{log.atualizadoPor || 'Antigo/Sistema'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-md mb-2 ${log.tipoAcao === 'EDIÇÃO' ? 'bg-blue-500 text-white' : 'bg-green-600 text-white'}`}>
                                        {log.tipoAcao || 'LANÇAMENTO'}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                        <Clock size={12} />
                                        {log.atualizadoEm ? new Date(log.atualizadoEm).toLocaleString('pt-BR') : 'Data não registrada'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}