'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PlusCircle, Loader2, Check, Calendar, Package, FileText } from 'lucide-react'
import Link from 'next/link'

export default function NovoItem() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        produto: '',
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
        if (!form.produto || !form.valor) return

        setSaving(true)

        try {
            await addDoc(collection(db, 'compras'), {
                produto: form.produto,
                obs: form.obs,
                valor: parseFloat(form.valor.replace(',', '.')),
                quantidade: parseInt(form.quantidade) || 1,
                dataCompra: form.dataCompra,
                referencias: {
                    ref1: form.ref1,
                    ref2: form.ref2,
                    ref3: form.ref3
                },
                createdAt: serverTimestamp()
            })

            setTimeout(() => router.push('/dashboard'), 1000)
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
                        <h1 className="text-2xl font-black text-white tracking-tight">Novo Registro de Peça</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Produto */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Nome do Produto / Item</label>
                            <input
                                type="text" required placeholder="Ex: Amortecedor Dianteiro"
                                className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white placeholder:text-slate-600 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium text-lg"
                                value={form.produto}
                                onChange={e => setForm({...form, produto: e.target.value})}
                            />
                        </div>

                        {/* Quantidade, Valor e Data */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Qtd.</label>
                                <div className="relative">
                                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input
                                        type="number" required min="1"
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-bold"
                                        value={form.quantidade}
                                        onChange={e => setForm({...form, quantidade: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Valor Unit. (R$)</label>
                                <input
                                    type="text" required placeholder="0,00"
                                    className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-mono font-bold"
                                    value={form.valor}
                                    onChange={e => setForm({...form, valor: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Data</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input
                                        type="date" required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium color-scheme-dark"
                                        style={{ colorScheme: 'dark' }}
                                        value={form.dataCompra}
                                        onChange={e => setForm({...form, dataCompra: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Campo OBS */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Observações (OBS)</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 text-slate-600" size={18} />
                                <textarea
                                    placeholder="Detalhes adicionais, fornecedor ou aplicação da peça..."
                                    rows={3}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white placeholder:text-slate-600 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all font-medium resize-none"
                                    value={form.obs}
                                    onChange={e => setForm({...form, obs: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Referências */}
                        <div className="p-1 bg-[#161e2e] rounded-3xl border border-slate-800">
                            <div className="px-4 py-3 border-b border-slate-800 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Referências de Estoque</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
                                <input
                                    type="text" placeholder="REF 1"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white text-sm focus:border-orange-500 outline-none transition-all shadow-inner"
                                    value={form.ref1}
                                    onChange={e => setForm({...form, ref1: e.target.value})}
                                />
                                <input
                                    type="text" placeholder="REF 2"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white text-sm focus:border-orange-500 outline-none transition-all shadow-inner"
                                    value={form.ref2}
                                    onChange={e => setForm({...form, ref2: e.target.value})}
                                />
                                <input
                                    type="text" placeholder="REF 3"
                                    className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-slate-700 text-white text-sm focus:border-orange-500 outline-none transition-all shadow-inner"
                                    value={form.ref3}
                                    onChange={e => setForm({...form, ref3: e.target.value})}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-orange-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 mt-4 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                            Salvar Peça no Sistema
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}