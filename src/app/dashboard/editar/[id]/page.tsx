'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Package, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

// 1. Adicionamos essa interface para o TypeScript não reclamar do ID
interface ItemForm {
    produto: string;
    obs: string;
    valor: string;
    quantidade: string;
    dataCompra: string;
    ref1: string;
    ref2: string;
    ref3: string;
}

export default function EditarItem() {
    // 2. Forçamos o tipo do ID para string
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState<ItemForm>({
        produto: '',
        obs: '',
        valor: '',
        quantidade: '1',
        dataCompra: '',
        ref1: '',
        ref2: '',
        ref3: ''
    })

    useEffect(() => {
        async function loadItem() {
            if (!id) return
            try {
                const docRef = doc(db, 'compras', id)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    setForm({
                        produto: data.produto || '',
                        obs: data.obs || '',
                        valor: data.valor?.toString() || '0',
                        quantidade: data.quantidade?.toString() || '1',
                        dataCompra: data.dataCompra || '',
                        ref1: data.referencias?.ref1 || '',
                        ref2: data.referencias?.ref2 || '',
                        ref3: data.referencias?.ref3 || ''
                    })
                }
            } catch (error) {
                console.error("Erro ao carregar:", error)
            } finally {
                setLoading(false)
            }
        }
        loadItem()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const docRef = doc(db, 'compras', id)
            await updateDoc(docRef, {
                produto: form.produto,
                obs: form.obs,
                // Usamos Number() ou parseFloat() com tratamento para evitar erros de tipo
                valor: parseFloat(form.valor.replace(',', '.')),
                quantidade: parseInt(form.quantidade) || 1,
                dataCompra: form.dataCompra,
                referencias: {
                    ref1: form.ref1,
                    ref2: form.ref2,
                    ref3: form.ref3
                }
            })
            router.push('/dashboard')
        } catch (error) {
            alert("Erro ao atualizar registro")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0f172a] p-4 md:p-8 font-sans text-slate-200">
            <div className="max-w-2xl mx-auto">
                <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors mb-6 group text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Cancelar Edição
                </Link>

                <div className="bg-[#1e293b] p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
                            <Save className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight italic">Editar Registro</h1>
                            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Código: {id.slice(0, 10)}...</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Especificação da Peça</label>
                            <input
                                type="text" required
                                className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-blue-500 outline-none transition-all font-medium text-lg"
                                value={form.produto}
                                onChange={e => setForm({...form, produto: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Qtd.</label>
                                <input
                                    type="number" required min="1"
                                    className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-blue-500 outline-none font-bold text-center"
                                    value={form.quantidade}
                                    onChange={e => setForm({...form, quantidade: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Valor (R$)</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-orange-500 focus:border-blue-500 outline-none font-mono font-bold text-right"
                                    value={form.valor}
                                    onChange={e => setForm({...form, valor: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Data</label>
                                <input
                                    type="date" required
                                    style={{ colorScheme: 'dark' }}
                                    className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-blue-500 outline-none font-medium"
                                    value={form.dataCompra}
                                    onChange={e => setForm({...form, dataCompra: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em]">Observações (OBS)</label>
                            <textarea
                                rows={3}
                                className="w-full px-4 py-4 rounded-2xl bg-[#0f172a] border border-slate-700 text-white focus:border-blue-500 outline-none resize-none italic text-slate-400"
                                value={form.obs}
                                onChange={e => setForm({...form, obs: e.target.value})}
                            />
                        </div>

                        <div className="bg-[#161e2e] p-4 rounded-3xl border border-slate-800">
                            <label className="block text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.3em] text-center">Referências</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <input type="text" placeholder="REF 1" className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-center text-sm" value={form.ref1} onChange={e => setForm({...form, ref1: e.target.value})} />
                                <input type="text" placeholder="REF 2" className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-center text-sm" value={form.ref2} onChange={e => setForm({...form, ref2: e.target.value})} />
                                <input type="text" placeholder="REF 3" className="bg-[#0f172a] border border-slate-700 p-3 rounded-xl text-center text-sm" value={form.ref3} onChange={e => setForm({...form, ref3: e.target.value})} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-blue-900/20"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                            {saving ? 'Salvando...' : 'Atualizar Registro'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}