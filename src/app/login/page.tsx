'use client'

import { useState } from 'react'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Lock, Mail, Loader2, Gauge } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.push('/dashboard')
        } catch (error: any) {
            alert("Acesso Negado: Verifique as credenciais da oficina.")
            console.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0f172a] p-4 font-sans relative overflow-hidden">
            {/* Efeito de brilho de fundo (Glow) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>

            <div className="w-full max-w-md bg-[#1e293b]/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-slate-800 relative z-10">

                {/* Header do Login */}
                <div className="text-center mb-10">
                    <div className="inline-flex bg-orange-600 p-4 rounded-2xl mb-5 shadow-2xl shadow-orange-900/40 transform -rotate-3">
                        <Gauge className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                        Financeiro <span className="text-orange-500">GR</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">
                        Sistema de Peças v2.0
                    </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type="email"
                                placeholder="usuario@comprasgr.com"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-[#0f172a] border border-slate-700 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-white placeholder:text-slate-700 font-medium"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest ml-1">Senha de Segurança</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                className="w-full pl-12 pr-4 py-4 bg-[#0f172a] border border-slate-700 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-white placeholder:text-slate-700 font-medium"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 active:scale-[0.98] transition-all shadow-xl shadow-orange-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={22} />
                        ) : (
                            <>
                                <ShieldCheck size={22} />
                                Autenticar
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 flex flex-col items-center gap-2">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                        Acesso Restrito: Jhonatha
                    </p>
                    <div className="h-1 w-12 bg-slate-800 rounded-full"></div>
                </div>
            </div>
        </div>
    )
}