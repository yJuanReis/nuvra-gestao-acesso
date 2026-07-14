import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ship, Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (user && user.profile && !hasRedirectedRef.current && !loading) {
      hasRedirectedRef.current = true;
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Digite seu email');
      return;
    }
    if (!senha.trim()) {
      setError('Digite sua senha');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email.trim(), senha);

      if (result.success) {
        // Redirect will happen via useEffect
      } else {
        setError(result.error || 'Erro de autenticação');
      }
    } catch (err: any) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-teal-500/20 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <svg className="w-12 h-12 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
            </div>
            
            <div>
              <h1 className="text-5xl font-bold text-white tracking-tight">
                Nuvra
              </h1>
              <p className="text-xl text-slate-300 mt-2 font-medium">
                Gestão de Acesso
              </p>
            </div>
            
            <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
              Sistema profissional de controle de entrada e saída para estabelecimentos.
              Gerencie o acesso de forma simples e eficiente.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-8 max-w-sm mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-teal-400 text-2xl font-bold">100%</div>
                <div className="text-slate-400 text-sm">Online</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-teal-400 text-2xl font-bold">24/7</div>
                <div className="text-slate-400 text-sm">Disponível</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
              <svg className="w-8 h-8 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Nuvra</h1>
          </div>

          {/* Welcome Text */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-slate-500">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-11 bg-white border-slate-200 focus:border-slate-800 focus:ring-slate-800"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha" className="text-sm font-medium text-slate-700">
                  Senha
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="h-12 pl-11 pr-11 bg-white border-slate-200 focus:border-slate-800 focus:ring-slate-800"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || loading}
              className="w-full h-12 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Entrando...
                </>
              ) : loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Carregando...
                </>
              ) : (
                'Entrar no Sistema'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-slate-400">
            Nuvra - Gestão de Acesso
          </p>
        </div>
      </div>
    </div>
  );
}
