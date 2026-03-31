'use client'

import { useEffect, useState, Suspense } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore'
import { Table as TableIcon, ArrowLeft, Edit3, X, Save, Loader2, FileText, Hash, Plus, ClipboardList, Search } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function PlanilhaContent() {
    const searchParams = useSearchParams()
    const mesParam = searchParams.get('mes')

    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filtroSemana, setFiltroSemana] = useState('Todas')
    const [filtroMes, setFiltroMes] = useState(mesParam !== null ? Number(mesParam) : new Date().getMonth())
    const [busca, setBusca] = useState('')

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

    const abrirNovoCadastro = () => {
        setItemEmEdicao({
            produto: '',
            quantidade: 1,
            valor: 0,
            os: '',
            dataCompra: new Date().toISOString().split('T')[0],
            obs: '',
            referencias: { ref1: '', ref2: '', ref3: '' }
        })
        setMenuAberto(true)
    }

    const abrirEdicao = (item: any) => {
        setItemEmEdicao(item)
        setMenuAberto(true)
    }

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault()
        setSalvando(true)

        // Captura o usuário no momento exato do clique
        const usuarioAtual = auth.currentUser?.email || 'Usuário Desconhecido';
        const timestamp = new Date().toISOString();

        try {
            const payload = {
                produto: itemEmEdicao.produto,
                quantidade: Number(itemEmEdicao.quantidade) || 0,
                valor: Number(itemEmEdicao.valor) || 0,
                os: itemEmEdicao.os || "",
                dataCompra: itemEmEdicao.dataCompra,
                obs: itemEmEdicao.obs || "",
                referencias: itemEmEdicao.referencias || { ref1: "", ref2: "", ref3: "" },

                // CAMPOS DE RASTREIO (LOGS)
                atualizadoPor: usuarioAtual,
                atualizadoEm: timestamp,
                tipoAcao: itemEmEdicao.id ? 'EDIÇÃO' : 'CADASTRO'
            }

            if (itemEmEdicao.id) {
                await updateDoc(doc(db, 'compras', itemEmEdicao.id), payload)
            } else {
                await addDoc(collection(db, 'compras'), payload)
            }

            setMenuAberto(false)
            setItemEmEdicao(null)
        } catch (error) {
            console.error("Erro ao salvar:", error)
            alert("Erro ao salvar operação")
        } finally {
            setSalvando(false)
        }
    }

    const filteredItems = items.filter(item => {
        if (!item.dataCompra) return false;
        const dataString = item.dataCompra.includes('T') ? item.dataCompra : `${item.dataCompra}T12:00:00`;
        const data = new Date(dataString);
        const mesBate = data.getMonth() === Number(filtroMes);
        const semanaCalculada = data.getDate() <= 7 ? 'SEM 1' : data.getDate() <= 14 ? 'SEM 2' : data.getDate() <= 21 ? 'SEM 3' : 'SEM 4';
        const semanaBate = filtroSemana === 'Todas' || semanaCalculada === filtroSemana;
        const termo = busca.toLowerCase();
        const pesquisaBate =
            item.produto?.toLowerCase().includes(termo) ||
            item.os?.toLowerCase().includes(termo) ||
            item.referencias?.ref1?.toLowerCase().includes(termo) ||
            item.referencias?.ref2?.toLowerCase().includes(termo) ||
            item.referencias?.ref3?.toLowerCase().includes(termo);

        return mesBate && semanaBate && pesquisaBate;
    })

    const totalGeral = filteredItems.reduce((acc, curr) => acc + ((Number(curr.valor) || 0) * (Number(curr.quantidade) || 0)), 0)

    if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" size={40} /></div>

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans relative overflow-x-hidden flex flex-col">
            <header className="bg-[#1e293b] border-b border-slate-800 p-4 sticky top-0 z-30 shadow-2xl">
                <div className="max-w-full mx-auto flex flex-col xl:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-full text-orange-500"><ArrowLeft size={24} /></Link>
                                <h1 className="text-xl font-black uppercase italic text-white tracking-tighter shrink-0">Relatório <span className="text-orange-500">GR</span></h1>
                            </div>
                            <button onClick={abrirNovoCadastro} className="xl:hidden bg-orange-600 p-3 rounded-xl text-white shadow-lg"><Plus size={20}/></button>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
                            <input type="text" placeholder="Buscar peça, OS ou referência..." value={busca} onChange={(e) => setBusca(e.target.value)} className="w-full bg-[#0f172a] border border-slate-700 pl-12 pr-4 py-2.5 rounded-xl outline-none focus:border-orange-500 transition-all text-sm font-medium" />
                            {busca && <button onClick={() => setBusca('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={16} /></button>}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-center xl:justify-end">
                        <select className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-xl outline-none font-bold text-sm" value={filtroMes} onChange={(e) => setFiltroMes(Number(e.target.value))}>
                            {meses.map((mes, idx) => <option key={mes} value={idx}>{mes}</option>)}
                        </select>
                        <select className="bg-[#0f172a] border border-slate-700 p-2.5 rounded-xl outline-none font-bold text-sm" value={filtroSemana} onChange={(e) => setFiltroSemana(e.target.value)}>
                            <option value="Todas">Semanas</option>
                            <option value="SEM 1">SEM 1</option><option value="SEM 2">SEM 2</option><option value="SEM 3">SEM 3</option><option value="SEM 4">SEM 4</option>
                        </select>
                        <div className="bg-orange-600/10 border border-orange-500/20 px-4 py-2 rounded-xl min-w-[140px] text-center">
                            <p className="text-[9px] font-black uppercase text-orange-500">Total Filtrado</p>
                            <p className="text-base font-mono font-black text-white italic">R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <button onClick={abrirNovoCadastro} className="hidden xl:flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-5 py-2.5 rounded-xl text-white font-black uppercase text-xs shadow-lg"><Plus size={16}/> Nova Compra</button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 lg:p-6 overflow-hidden">
                <div className="h-full overflow-x-auto rounded-[1.5rem] border border-slate-800 bg-[#1e293b]/10 shadow-2xl custom-scrollbar">
                    <table className="w-full border-collapse min-w-[1400px] text-sm text-center">
                        <thead className="sticky top-0 z-10 bg-slate-900 shadow-sm">
                        <tr className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] border-b border-slate-800">
                            <th className="p-4 w-20">SEM</th>
                            <th className="p-4 w-32">OS</th>
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
                                    <td className="p-4 font-bold text-slate-600">{semana}</td>
                                    <td className="p-4 font-mono font-bold text-blue-400 bg-blue-500/5">{item.os || '-'}</td>
                                    <td className="p-4 text-left">
                                        <div className="font-black text-white uppercase leading-tight">{item.produto}</div>
                                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">{dataObj.toLocaleDateString('pt-BR')}</div>
                                    </td>
                                    <td className="p-4 font-mono text-[10px] text-slate-400">{item.referencias?.ref1 || '-'}</td>
                                    <td className="p-4 font-mono text-[10px] text-slate-400">{item.referencias?.ref2 || '-'}</td>
                                    <td className="p-4 font-mono text-[10px] text-slate-400">{item.referencias?.ref3 || '-'}</td>
                                    <td className="p-4 font-black text-slate-200">{item.quantidade}</td>
                                    <td className="p-4 text-right font-mono text-slate-500">R$ {Number(item.valor || 0).toFixed(2)}</td>
                                    <td className="p-4 text-right font-black text-orange-500 font-mono italic bg-orange-500/[0.02]">R$ {(Number(item.valor || 0) * Number(item.quantidade || 0)).toFixed(2)}</td>
                                    <td className="p-4 text-left text-[10px] text-slate-500 italic max-w-[200px] truncate">{item.obs || '-'}</td>
                                    <td className="p-4"><button onClick={() => abrirEdicao(item)} className="p-2.5 bg-slate-800 text-orange-500 rounded-lg hover:bg-orange-600 hover:text-white transition-all"><Edit3 size={16} /></button></td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </main>

            {menuAberto && itemEmEdicao && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" onClick={() => setMenuAberto(false)} />
                    <div className="relative w-full max-w-md bg-[#1e293b] h-full shadow-2xl p-6 overflow-y-auto border-l border-slate-800">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black uppercase italic text-white">{itemEmEdicao.id ? 'Ajustar Peça' : 'Nova Compra'}</h2>
                            <button onClick={() => setMenuAberto(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><X /></button>
                        </div>
                        <form onSubmit={handleSalvar} className="space-y-4 text-sm">
                            <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Peça / Produto</label>
                                <input required type="text" value={itemEmEdicao.produto} onChange={(e) => setItemEmEdicao({...itemEmEdicao, produto: e.target.value})} className="w-full bg-transparent text-white font-bold outline-none" />
                            </div>
                            <div className="bg-[#0f172a] p-3 rounded-xl border border-blue-900/30">
                                <label className="text-[9px] font-black text-blue-500 uppercase block mb-1 tracking-widest flex items-center gap-2"><ClipboardList size={12}/> Ordem de Serviço (OS)</label>
                                <input type="text" placeholder="Opcional" value={itemEmEdicao.os} onChange={(e) => setItemEmEdicao({...itemEmEdicao, os: e.target.value})} className="w-full bg-transparent text-white font-mono outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                    <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Qtd</label>
                                    <input type="number" value={itemEmEdicao.quantidade} onChange={(e) => setItemEmEdicao({...itemEmEdicao, quantidade: e.target.value})} className="w-full bg-transparent text-white font-bold outline-none" />
                                </div>
                                <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                    <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Valor Unit.</label>
                                    <input type="number" step="0.01" placeholder="0.00" value={itemEmEdicao.valor} onChange={(e) => setItemEmEdicao({...itemEmEdicao, valor: e.target.value})} className="w-full bg-transparent text-orange-500 font-bold outline-none" />
                                </div>
                            </div>
                            <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Data da Compra</label>
                                <input required type="date" style={{ colorScheme: 'dark' }} value={itemEmEdicao.dataCompra} onChange={(e) => setItemEmEdicao({...itemEmEdicao, dataCompra: e.target.value})} className="w-full bg-transparent text-white outline-none" />
                            </div>
                            <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-800 space-y-3">
                                <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-2"><Hash size={12}/> Referências</label>
                                <input placeholder="REF 1 (Opcional)" value={itemEmEdicao.referencias?.ref1} onChange={(e) => setItemEmEdicao({...itemEmEdicao, referencias: {...itemEmEdicao.referencias, ref1: e.target.value}})} className="w-full bg-slate-900 p-2.5 rounded-lg outline-none text-xs" />
                                <input placeholder="REF 2 (Opcional)" value={itemEmEdicao.referencias?.ref2} onChange={(e) => setItemEmEdicao({...itemEmEdicao, referencias: {...itemEmEdicao.referencias, ref2: e.target.value}})} className="w-full bg-slate-900 p-2.5 rounded-lg outline-none text-xs" />
                                <input placeholder="REF 3 (Opcional)" value={itemEmEdicao.referencias?.ref3} onChange={(e) => setItemEmEdicao({...itemEmEdicao, referencias: {...itemEmEdicao.referencias, ref3: e.target.value}})} className="w-full bg-slate-900 p-2.5 rounded-lg outline-none text-xs" />
                            </div>
                            <div className="bg-[#0f172a] p-3 rounded-xl border border-slate-800">
                                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">Observações</label>
                                <textarea rows={2} value={itemEmEdicao.obs} onChange={(e) => setItemEmEdicao({...itemEmEdicao, obs: e.target.value})} className="w-full bg-transparent text-slate-400 italic outline-none resize-none" />
                            </div>
                            <button type="submit" disabled={salvando} className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-black uppercase flex items-center justify-center gap-2 transition-all shadow-xl">
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