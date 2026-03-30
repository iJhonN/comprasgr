'use client'

import { useEffect, useState, Suspense } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore'
import { Table as TableIcon, ArrowLeft, Edit3, X, Save, Loader2, FileText, Hash, Plus } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function PlanilhaContent() {
    const searchParams = useSearchParams()
    const mesParam = searchParams.get('mes')

    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filtroSemana, setFiltroSemana] = useState('Todas')
    const [filtroMes, setFiltroMes] = useState(mesParam !== null ? Number(mesParam) : new Date().getMonth())

    // Estados para o Menu Lateral (Edição ou Cadastro)
    const [menuAberto, setMenuAberto] = useState(false)
    const [itemEmEdicao, setItemEmEdicao] = useState<any>(null)
    const [salvando, setSalvando] = useState(false)

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

    // Abrir menu para NOVO cadastro
    const abrirNovoCadastro = () => {
        setItemEmEdicao({
            produto: '',
            quantidade: 1,
            valor: 0,
            dataCompra: new Date().toISOString().split('T')[0],
            obs: '',
            referencias: { ref1: '', ref2: '', ref3: '' }
        })
        setMenuAberto(true)
    }

    // Abrir menu para EDITAR
    const abrirEdicao = (item: any) => {
        setItemEmEdicao(item)
        setMenuAberto(true)
    }

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault()
        setSalvando(true)
        try {
            const payload = {
                produto: itemEmEdicao.produto,
                quantidade: Number(itemEmEdicao.quantidade),
                valor: Number(itemEmEdicao.valor),
                dataCompra: itemEmEdicao.dataCompra,
                obs: itemEmEdicao.obs || "",
                referencias: itemEmEdicao.referencias || { ref1: "", ref2: "", ref3: "" }
            }

            if (itemEmEdicao.id) {
                // Modo Edição
                await updateDoc(doc(db, 'compras', itemEmEdicao.id), payload)
            } else {
                // Modo Cadastro Novo
                await addDoc(collection(db, 'compras'), payload)
            }

            setMenuAberto(false)
            setItemEmEdicao(null)
        } catch (error) {
            alert("Erro ao salvar operação")
        } finally {
            setSalvando(false)
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
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-x-hidden flex flex-col">

            {/* Header Responsivo */}
            <header className="bg-[#1e293b] border-b border-slate-800 p-4 sticky top-0 z-30 shadow-2xl">
                <div className="max-w-full mx-auto flex flex-col xl:flex-row justify-between items-center gap-4">
                    <div className="flex items-center justify-between w-full xl:w-auto gap-4">
                        <div className="flex items-center gap-3">
                            <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-full text-orange-500"><ArrowLeft size={24} /></Link>
                            <h1 className="text-xl font-black uppercase italic text-white tracking-tighter shrink-0">Relatório <span className="text-orange-500">GR</span></h1>
                        </div>
                        <button onClick={abrirNovoCadastro} className="xl:hidden bg-orange-600 p-3 rounded-xl text-white shadow-lg"><Plus size={20}/></button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
                        <select className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-xl outline-none font-bold text-sm flex-1 sm:flex-none" value={filtroMes} onChange={(e) => setFiltroMes(Number(e.target.value))}>
                            {meses.map((mes, idx) => <option key={mes} value={idx}>{mes}</option>)}
                        </select>
                        <select className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-xl outline-none font-bold text-sm flex-1 sm:flex-none" value={filtroSemana} onChange={(e) => setFiltroSemana(e.target.value)}>
                            <option value="Todas">Semanas</option>
                            <option value="SEM 1">SEM 1</option><option value="SEM 2">SEM 2</option><option value="SEM 3">SEM 3</option><option value="SEM 4">SEM 4</option>
                        </select>
                        <div className="bg-orange-600/10 border border-orange-500/20 px-4 py-2 rounded-xl flex flex-col items-center min-w-[140px]">
                            <p className="text-[9px] font-black uppercase text-orange-500 tracking-widest">Gasto Total</p>
                            <p className="text-base font-mono font-black text-white italic">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <button onClick={abrirNovoCadastro} className="hidden xl:flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-5 py-2.5 rounded-xl text-white font-black uppercase text-xs transition-all shadow-lg shadow-orange-900/20">
                            <Plus size={16}/> Nova Compra
                        </button>
                    </div>
                </div>
            </header>

            {/* Container da Tabela com Scroll Suave */}
            <main className="flex-1 p-4 lg:p-6 overflow-hidden">
                <div className="h-full overflow-x-auto rounded-[1.5rem] border border-slate-800 bg-[#1e293b]/10 shadow-2xl custom-scrollbar">
                    <table className="w-full border-collapse min-w-[1200px] text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-900 shadow-sm">
                        <tr className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] text-center border-b border-slate-800">
                            <th className="p-4 w-20">SEM</th>
                            <th className="p-4 text-left">Peça / Data</th>
                            <th className="p-4">REF 1</th>
                            <th className="p-4">REF 2</th>
                            <th className="p-4">REF 3</th>
                            <th className="p-4 w-16">Qtd</th>
                            <th className="p-4 w-32">Unitário</th>
                            <th className="p-4 w-32">Total</th>
                            <th className="p-4 text-left">Observações</th>
                            <th className="p-4 w-20">Ações</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                        {filteredItems.map((item) => {
                            const dataObj = new Date(`${item.dataCompra}T12:00:00`);
                            const dia = dataObj.getDate();
                            const semana = dia <= 7 ? 'SEM 1' : dia <= 14 ? 'SEM 2' : dia <= 21 ? 'SEM 3' : 'SEM 4';
                            return (
                                <tr key={item.id} className="hover:bg-orange-500/[0.03] transition-colors group">
                                    <td className="p-4 text-center font-bold text-slate-600">{semana}</td>
                                    <td className="p-4">
                                        <div className="font-black text-white uppercase leading-tight">{item.produto}</div>
                                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">{dataObj.toLocaleDateString('pt-BR')}</div>
                                    </td>
                                    <td className="p-4 text-center font-mono text-[10px] text-slate-400">{item.referencias?.ref1 || '-'}</td>
                                    <td className="p-4 text-center font-mono text-[10px] text-slate-400">{item.referencias?.ref2 || '-'}</td>
                                    <td className="p-4 text-center font-mono text-[10px] text-slate-400">{item.referencias?.ref3 || '-'}</td>
                                    <td className="p-4 text-center font-black text-slate-200">{item.quantidade}</td>
                                    <td className="p-4 text-right font-mono text-slate-500">R$ {item.valor?.toFixed(2)}</td>
                                    <td className="p-4 text-right font-black text-orange-500 font-mono italic bg-orange-500/[0.02]">
                                        R$ {(item.valor * item.quantidade).toFixed(2)}
                                    </td>
                                    <td className="p-4 text-left text-[10px] text-slate-500 italic max-w-[200px] truncate">
                                        {item.obs || '-'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => abrirEdicao(item)} className="p-2.5 bg-slate-800 text-orange-500 rounded-lg hover:bg-orange-600 hover:text-white transition-all">
                                            <Edit3 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Menu Lateral Unificado (Novo / Editar) */}
            {menuAberto && itemEmEdicao && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setMenuAberto(false)} />
                    <div className="relative w-full max-w-md bg-[#1e293b] h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-800">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black uppercase italic text-white">{itemEmEdicao.id ? 'Ajustar Peça' : 'Nova Compra'}</h2>
                            <button onClick={() => setMenuAberto(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X /></button>
                        </div>

                        <form onSubmit={handleSalvar} className="space-y-5 text-sm">
                            <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Peça / Produto</label>
                                <input required type="text" value={itemEmEdicao.produto} onChange={(e) => setItemEmEdicao({...itemEmEdicao, produto: e.target.value})} className="w-full bg-transparent text-white font-bold outline-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                    <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Qtd</label>
                                    <input type="number" value={itemEmEdicao.quantidade} onChange={(e) => setItemEmEdicao({...itemEmEdicao, quantidade: e.target.value})} className="w-full bg-transparent text-white font-bold outline-none" />
                                </div>
                                <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                    <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Valor Unit.</label>
                                    <input type="number" step="0.01" value={itemEmEdicao.valor} onChange={(e) => setItemEmEdicao({...itemEmEdicao, valor: e.target.value})} className="w-full bg-transparent text-orange-500 font-bold outline-none" />
                                </div>
                            </div>

                            <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Data da Compra</label>
                                <input type="date" style={{ colorScheme: 'dark' }} value={itemEmEdicao.dataCompra} onChange={(e) => setItemEmEdicao({...itemEmEdicao, dataCompra: e.target.value})} className="w-full bg-transparent text-white outline-none" />
                            </div>

                            <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 space-y-3">
                                <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2"><Hash size={12}/> Referências</label>
                                <input placeholder="REF 1" value={itemEmEdicao.referencias?.ref1} onChange={(e) => setItemEmEdicao({...itemEmEdicao, referencias: {...itemEmEdicao.referencias, ref1: e.target.value}})} className="w-full bg-slate-900 p-2.5 rounded-lg outline-none text-xs" />
                                <input placeholder="REF 2" value={itemEmEdicao.referencias?.ref2} onChange={(e) => setItemEmEdicao({...itemEmEdicao, referencias: {...itemEmEdicao.referencias, ref2: e.target.value}})} className="w-full bg-slate-900 p-2.5 rounded-lg outline-none text-xs" />
                                <input placeholder="REF 3" value={itemEmEdicao.referencias?.ref3} onChange={(e) => setItemEmEdicao({...itemEmEdicao, referencias: {...itemEmEdicao.referencias, ref3: e.target.value}})} className="w-full bg-slate-900 p-2.5 rounded-lg outline-none text-xs" />
                            </div>

                            <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Observações</label>
                                <textarea rows={3} value={itemEmEdicao.obs} onChange={(e) => setItemEmEdicao({...itemEmEdicao, obs: e.target.value})} className="w-full bg-transparent text-slate-400 italic outline-none resize-none" />
                            </div>

                            <button type="submit" disabled={salvando} className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all">
                                {salvando ? <Loader2 className="animate-spin" /> : <><Save size={18} /> {itemEmEdicao.id ? 'Salvar Mudanças' : 'Cadastrar Peça'}</>}
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