'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore'
import { ArrowLeft, History, User, Clock, Tag, Package, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Buscamos apenas itens que foram atualizados recentemente para gerar o log
        const q = query(
            collection(db, 'compras'),
            orderBy('atualizadoEm', 'desc'),
            limit(40)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                // Filtramos apenas quem tem dado de log para não mostrar itens antigos "vazios"
                .filter(doc => doc.atualizadoEm)

            setLogs(docs)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-full text-orange-500 transition-all">
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black uppercase italic text-white tracking-tighter leading-none">Monitor de <span className="text-orange-500">Atividade</span></h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Rastro de alterações em tempo real</p>
                        </div>
                    </div>
                    <History className="text-slate-800 hidden md:block" size={40} />
                </header>

                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-20">
                            <Loader2 className="animate-spin text-orange-500 mx-auto mb-4" size={32} />
                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Sincronizando Banco de Dados...</p>
                        </div>
                    ) : logs.length > 0 ? (
                        logs.map((log) => (
                            <div key={log.id} className="bg-[#1e293b] border border-slate-800 p-4 md:p-6 rounded-3xl hover:border-orange-500/40 transition-all group relative overflow-hidden">
                                {/* Indicador lateral de ação */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${log.tipoAcao === 'EDIÇÃO' ? 'bg-blue-500' : 'bg-green-500'}`} />

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-2xl hidden sm:block ${log.tipoAcao === 'EDIÇÃO' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-white uppercase text-base group-hover:text-orange-500 transition-colors">{log.produto}</h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold">
                                                    <User size={14} className="text-slate-600" />
                                                    {log.atualizadoPor}
                                                </div>
                                                {log.os && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-mono font-bold">
                                                        <ClipboardList size={14} />
                                                        OS: {log.os}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full mb-1 ${log.tipoAcao === 'EDIÇÃO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'bg-green-600 text-white shadow-lg shadow-green-900/20'}`}>
                                            {log.tipoAcao || 'CADASTRO'}
                                        </span>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                            <Clock size={12} />
                                            {new Date(log.atualizadoEm).toLocaleString('pt-BR')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-[#1e293b]/50 rounded-[3rem] border-2 border-dashed border-slate-800">
                            <p className="text-slate-600 font-black uppercase tracking-widest">Nenhuma atividade registrada ainda.</p>
                            <p className="text-[10px] text-slate-700 mt-2">Faça uma alteração na planilha para iniciar o rastro.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function Loader2({ className, size }: { className?: string, size?: number }) {
    return <Clock className={className} size={size} />
}