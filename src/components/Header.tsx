import { Ship, LogOut, History, LayoutDashboard, Users, Settings, Building2, User, Clock, Menu, X } from 'lucide-react';
import { useNuvra } from '@/contexts/NuvraContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';

export function Header() {
  const { empresaAtual, user, logout, getPessoasDentro } = useNuvra();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const stats = useMemo(() => {
    const pessoasDentro = getPessoasDentro();
    const totalPessoas = pessoasDentro.length;
    const tempoMedio = totalPessoas > 0
      ? Math.round(pessoasDentro.reduce((acc, p) => {
          const tempo = Date.now() - new Date(p.entradaEm).getTime();
          return acc + (tempo / (1000 * 60 * 60));
        }, 0) / totalPessoas * 10) / 10
      : 0;

    return { totalPessoas, tempoMedio };
  }, [getPessoasDentro]);

  const podeVerAdmin = user?.role === 'admin' || user?.role === 'owner';
  
  const navItems = [
    { href: '/', label: 'Painel', icon: LayoutDashboard },
    { href: '/historico', label: 'Histórico', icon: History },
    { href: '/pessoas', label: 'Pessoas', icon: Users },
    ...(podeVerAdmin ? [{ href: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-md">
              <svg className="h-5 w-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Nuvra
              </h1>
              <p className="text-xs text-slate-500">
                {empresaAtual?.nome || 'Sistema de Acesso'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Stats Badge */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-emerald-700">{stats.totalPessoas}</span>
                <span className="text-xs text-emerald-600">no local</span>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">{user?.nome?.split(' ')[0]}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-slate-100 text-slate-900"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            
            {/* Mobile Stats */}
            <div className="mt-4 px-4">
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-emerald-700">
                  {stats.totalPessoas} pessoa{stats.totalPessoas !== 1 ? 's' : ''} no local
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
