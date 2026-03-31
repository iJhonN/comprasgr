'use client'

import { useState } from 'react'
import { db, auth } from '@/lib/firebase' // Adicionado auth aqui
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PlusCircle, Loader2, Check, Calendar, Package, FileText, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default function NovoItem() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        produto: '',
        os: '',
        obs: '',
        valor: '',
        quantidade: '1',
        dataCompra: new Date().toISOString().split('T')[0],
        ref1: '',
        ref2: '',
        ref3: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.produto || !form.dataCompra) return

        setSaving(true)

        // Captura os dados do usuário para o log
        const usuarioAtual = auth.currentUser?.email || 'Usuário Desconhecido'
        const timestampLog = new Date().toISOString()

        try {
            await addDoc(collection(db, 'compras'), {
                produto: form.produto,
                os: form.os || "",
                obs: form.obs || "",
                valor: form.valor ? parseFloat(form.valor.replace(',', '.')) : 0,
                quantidade: parseInt(form.quantidade) || 0,
                dataCompra: form.dataCompra,
                referencias: {
                    ref1: form.ref1 || "",
                    ref2: form.ref2 || "",
                    ref3: form.ref3 || ""
                },
                createdAt: serverTimestamp(),

                // CAMPOS DE LOG (Para aparecer no monitor de atividade)
                atualizadoPor: usuarioAtual,
                atualizadoEm: timestampLog,
                tipoAcao: 'CADASTRO'
            })

            setTimeout(() => router.push('/dashboard/planilha'), 1000)
        } catch (error) {
            console.error("Erro ao salvar:", error)
            alert("Erro ao criar novo registro.")
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 font-sans text-slate-200">
            <div className="max-w-2xl mx-auto">
                <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors mb-6 group text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar ao Painel
                </Link>

                <div className="bg-[#1e293b] p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-900/20">
                            <PlusCircle className="text-white" size={28} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight italic">Novo Registro</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Peça / Produto</label>
                                <input
                                    type="text" required placeholder="Ex: Filtro de Óleo"
                                    className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-orange-500 outline-none transition-all font-medium"
                                    value={form.produto}
                                    onChange={e => setForm({...form, produto: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-blue-500 mb-2 uppercase tracking-[0.2em]">Nº da OS</label>
                                <div className="relative">
                                    <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-900/50" size={18} />
                                    <input
                                        type="text" placeholder="Opcional"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0f172a] border border-blue-900/30 text-blue-400 focus:border-blue-500 outline-none transition-all font-bold font-mono"
                                        value={form.os}
                                        onChange={e => setForm({...form, os: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Qtd.</label>
                                <input
                                    type="number" min="0"
                                    className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-orange-500 outline-none font-bold text-center"
                                    value={form.quantidade}
                                    onChange={e => setForm({...form, quantidade: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Valor Unit. (R$)</label>
                                <input
                                    type="text" placeholder="0,00"
                                    className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-orange-500 focus:border-orange-500 outline-none font-mono font-bold text-right"
                                    value={form.valor}
                                    onChange={e => setForm({...form, valor: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Data</label>
                                <input
                                    type="date" required
                                    style={{ colorScheme: 'dark' }}
                                    className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-orange-500 outline-none transition-all"
                                    value={form.dataCompra}
                                    onChange={e => setForm({...form, dataCompra: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Observações (Opcional)</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 text-slate-600" size={18} />
                                <textarea
                                    placeholder="Detalhes adicionais ou aplicação..."
                                    rows={2}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-orange-500 outline-none transition-all italic text-slate-400 resize-none"
                                    value={form.obs}
                                    onChange={e => setForm({...form, obs: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="p-1 bg-[#161e2e] rounded-3xl border border-slate-800">
                            <div className="px-4 py-3 border-b border-slate-800 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Referências (Opcional)</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
                                <input type="text" placeholder="REF 1" className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-center text-sm" value={form.ref1} onChange={e => setForm({...form, ref1: e.target.value})} />
                                <input type="text" placeholder="REF 2" className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-center text-sm" value={form.ref2} onChange={e => setForm({...form, ref2: e.target.value})} />
                                <input type="text" placeholder="REF 3" className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-center text-sm" value={form.ref3} onChange={e => setForm({...form, ref3: e.target.value})} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-orange-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                            {saving ? 'Salvando...' : 'Salvar Peça no Sistema'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}