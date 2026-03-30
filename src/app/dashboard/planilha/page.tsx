'use client'

import { useEffect, useState, Suspense } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { Table as TableIcon, ArrowLeft, Edit3, X, Save, Loader2, FileText, Hash } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function PlanilhaContent() {
    const searchParams = useSearchParams()
    const mesParam = searchParams.get('mes')

    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filtroSemana, setFiltroSemana] = useState('Todas')
    const [filtroMes, setFiltroMes] = useState(mesParam !== null ? Number(mesParam) : new Date().getMonth())
    const [itemParaEditar, setItemParaEditar] = useState<any>(null)
    const [salvandoEdicao, setSalvandoEdicao] = useState(false)

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

    useEffect(() => {
        const q = query(collection(db, 'compras'), orderBy('dataCompra', 'desc'))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setItems(docs)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const handleSalvarEdicao = async (e: React.FormEvent) => {
        e.preventDefault()
        setSalvandoEdicao(true)
        try {
            const docRef = doc(db, 'compras', itemParaEditar.id)
            await updateDoc(docRef, {
                produto: itemParaEditar.produto,
                quantidade: Number(itemParaEditar.quantidade),
                valor: Number(itemParaEditar.valor),
                dataCompra: itemParaEditar.dataCompra,
                obs: itemParaEditar.obs || "",
                referencias: itemParaEditar.referencias || { ref1: "", ref2: "", ref3: "" }
            })
            setItemParaEditar(null)
        } catch (error) {
            alert("Erro ao atualizar item")
        } finally {
            setSalvandoEdicao(false)
        }
    }

    const filteredItems = items.filter(item => {
        if (!item.dataCompra) return false;
        const dataString = item.dataCompra.includes('T') ? item.dataCompra : `${item.dataCompra}T12:00:00`;
        const data = new Date(dataString);
        return data.getMonth() === Number(filtroMes) && (filtroSemana === 'Todas' || (data.getDate() <= 7 ? 'SEM 1' : data.getDate() <= 14 ? 'SEM 2' : data.getDate() <= 21 ? 'SEM 3' : 'SEM 4') === filtroSemana);
    })

    const totalGeral = filteredItems.reduce((acc, curr) => acc + ((curr.valor || 0) * (curr.quantidade || 1)), 0)

    if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><TableIcon className="animate-bounce text-orange-500" size={40} /></div>

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-x-hidden">
            {/* Header */}
            <div className="bg-[#1e293b] border-b border-slate-800 p-6 sticky top-0 z-30 shadow-2xl">
                <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-full text-orange-500"><ArrowLeft size={24} /></Link>
                        <h1 className="text-2xl font-black uppercase italic text-white tracking-tighter">Relatório <span className="text-orange-500">GR</span></h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-center">
                        <select className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl outline-none font-bold" value={filtroMes} onChange={(e) => setFiltroMes(Number(e.target.value))}>
                            {meses.map((mes, idx) => <option key={mes} value={idx}>{mes}</option>)}
                        </select>
                        <select className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl outline-none font-bold" value={filtroSemana} onChange={(e) => setFiltroSemana(e.target.value)}>
                            <option value="Todas">Todas Semanas</option>
                            <option value="SEM 1">SEM 1</option><option value="SEM 2">SEM 2</option><option value="SEM 3">SEM 3</option><option value="SEM 4">SEM 4</option>
                        </select>
                        <div className="bg-orange-600/10 border border-orange-500/20 px-6 py-3 rounded-2xl min-w-[220px]">
                            <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Total Período</p>
                            <p className="text-xl font-mono font-black text-white italic">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabela com todas as informações */}
            <div className="max-w-[1800px] mx-auto p-4 lg:p-8">
                <div className="overflow-x-auto rounded-[2rem] border border-slate-800 bg-[#1e293b]/20 shadow-inner">
                    <table className="w-full border-collapse min-w-[1400px]">
                        <thead>
                        <tr className="bg-slate-800/50 text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] text-center border-b border-slate-800">
                            <th className="p-5">SEM</th>
                            <th className="p-5 text-left">Data / Item</th>
                            <th className="p-5">REF 1</th>
                            <th className="p-5">REF 2</th>
                            <th className="p-5">REF 3</th>
                            <th className="p-5">Qtd</th>
                            <th className="p-5">Unitário</th>
                            <th className="p-5">Total</th>
                            <th className="p-5 text-left">Observações</th>
                            <th className="p-5">Menu</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredItems.map((item) => {
                            const dataObj = new Date(`${item.dataCompra}T12:00:00`);
                            const dia = dataObj.getDate();
                            const semana = dia <= 7 ? 'SEM 1' : dia <= 14 ? 'SEM 2' : dia <= 21 ? 'SEM 3' : 'SEM 4';
                            return (
                                <tr key={item.id} className="border-b border-slate-800/50 hover:bg-orange-500/[0.02] transition-colors group">
                                    <td className="p-5 text-center font-bold text-slate-600 text-xs">{semana}</td>
                                    <td className="p-5">
                                        <div className="font-black text-white uppercase text-sm">{item.produto}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">{dataObj.toLocaleDateString('pt-BR')}</div>
                                    </td>
                                    <td className="p-5 text-center font-mono text-[11px] text-slate-400 bg-black/10">{item.referencias?.ref1 || '-'}</td>
                                    <td className="p-5 text-center font-mono text-[11px] text-slate-400 bg-black/5">{item.referencias?.ref2 || '-'}</td>
                                    <td className="p-5 text-center font-mono text-[11px] text-slate-400 bg-black/10">{item.referencias?.ref3 || '-'}</td>
                                    <td className="p-5 text-center font-black text-white text-base">{item.quantidade}</td>
                                    <td className="p-5 text-right font-mono text-slate-400">R$ {item.valor?.toFixed(2)}</td>
                                    <td className="p-5 text-right font-black text-orange-500 font-mono bg-orange-500/[0.03]">R$ {(item.valor * item.quantidade).toFixed(2)}</td>
                                    <td className="p-5 text-left text-[11px] text-slate-500 italic max-w-xs truncate border-l border-slate-800/50">
                                        {item.obs || <span className="opacity-20">Nenhuma observação...</span>}
                                    </td>
                                    <td className="p-5 text-center">
                                        <button onClick={() => setItemParaEditar(item)} className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-500 hover:scale-110 transition-all shadow-lg shadow-orange-900/20">
                                            <Edit3 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Menu Lateral (Drawer) */}
            {itemParaEditar && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-md" onClick={() => setItemParaEditar(null)} />
                    <div className="relative w-full max-w-md bg-[#1e293b] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.5)] p-8 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-800">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-black uppercase italic text-white leading-none">Ajustar Registro</h2>
                                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-2">ID: {itemParaEditar.id.slice(0,8)}</p>
                            </div>
                            <button onClick={() => setItemParaEditar(null)} className="p-2 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-all text-slate-400"><X /></button>
                        </div>

                        <form onSubmit={handleSalvarEdicao} className="space-y-6">
                            <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Nome da Peça</label>
                                <input type="text" value={itemParaEditar.produto} onChange={(e) => setItemParaEditar({...itemParaEditar, produto: e.target.value})} className="w-full bg-transparent text-white font-bold text-lg outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Qtd</label>
                                    <input type="number" value={itemParaEditar.quantidade} onChange={(e) => setItemParaEditar({...itemParaEditar, quantidade: e.target.value})} className="w-full bg-transparent text-white font-bold outline-none" />
                                </div>
                                <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Valor Unit.</label>
                                    <input type="number" step="0.01" value={itemParaEditar.valor} onChange={(e) => setItemParaEditar({...itemParaEditar, valor: e.target.value})} className="w-full bg-transparent text-orange-500 font-bold outline-none" />
                                </div>
                            </div>

                            <div className="bg-[#0f172a] p-5 rounded-[2rem] border border-slate-800 space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><Hash size={12}/> Referências de Estoque</label>
                                <input type="text" placeholder="Referência 1" value={itemParaEditar.referencias?.ref1} onChange={(e) => setItemParaEditar({...itemParaEditar, referencias: {...itemParaEditar.referencias, ref1: e.target.value}})} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-orange-500 transition-all" />
                                <input type="text" placeholder="Referência 2" value={itemParaEditar.referencias?.ref2} onChange={(e) => setItemParaEditar({...itemParaEditar, referencias: {...itemParaEditar.referencias, ref2: e.target.value}})} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-orange-500 transition-all" />
                                <input type="text" placeholder="Referência 3" value={itemParaEditar.referencias?.ref3} onChange={(e) => setItemParaEditar({...itemParaEditar, referencias: {...itemParaEditar.referencias, ref3: e.target.value}})} className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl outline-none focus:border-orange-500 transition-all" />
                            </div>

                            <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800">
                                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 mb-2 tracking-widest"><FileText size={12}/> Observações Técnicas</label>
                                <textarea rows={4} value={itemParaEditar.obs} onChange={(e) => setItemParaEditar({...itemParaEditar, obs: e.target.value})} className="w-full bg-transparent text-slate-400 italic outline-none resize-none" />
                            </div>

                            <button type="submit" disabled={salvandoEdicao} className="w-full bg-orange-600 hover:bg-orange-500 py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-900/40">
                                {salvandoEdicao ? <Loader2 className="animate-spin text-white" /> : <><Save size={22} /> Confirmar Alterações</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function PlanilhaView() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f172a]" />}>
            <PlanilhaContent />
        </Suspense>
    )
}