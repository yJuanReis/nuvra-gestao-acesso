import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { NuvraProvider, useNuvra } from "@/contexts/NuvraContext";
import { useSupabaseInit } from "@/hooks/useSupabaseInit";
import LoginPage from "./components/LoginPage";
import Index from "./pages/Index";
import Historico from "./pages/Historico";
import { PessoasPage } from "./pages/Pessoas";
import { AdminPanel } from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { UnauthorizedPage } from "./pages/UnauthorizedPage";
import { LoadingPage } from "./components/LoadingPage";

const queryClient = new QueryClient();

const App = () => {
  // Inicializar Supabase
  useSupabaseInit();

  // Protected Route para usuários autenticados
  function ProtectedRoute({ children }: { children: React.ReactNode }) {
    try {
      const { isAuthenticated } = useNuvra();
      if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
      }
      return <>{children}</>;
    } catch (err) {
      return <Navigate to="/login" replace />;
    }
  }

  // Protected Route para admin e dono
  function AdminRoute({ children }: { children: React.ReactNode }) {
    try {
      const { isAuthenticated, user } = useNuvra();
      if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
      }
      if (user?.profile?.role !== 'admin' && user?.profile?.role !== 'owner') {
        return <Navigate to="/" replace />;
      }
      return <>{children}</>;
    } catch (err) {
      return <Navigate to="/login" replace />;
    }
  }

  // Layout das rotas
  function AppRoutes() {
    try {
      const { authLoading, isAuthenticated, user } = useNuvra();


      // Mostra loading screen apenas durante inicialização
      if (authLoading) {
        return <LoadingPage />;
      }


      return (
        <Routes>
          {/* Login - redireciona se já estiver autenticado */}
          <Route
            path="/login"
            element={
              isAuthenticated && user?.profile ? <Navigate to="/" replace /> : <LoginPage />
            }
          />

          {/* Rotas protegidas para usuários autenticados */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historico"
            element={
              <ProtectedRoute>
                <Historico />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pessoas"
            element={
              <ProtectedRoute>
                <PessoasPage />
              </ProtectedRoute>
            }
          />

          {/* Rota para página de acesso negado */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rota para admin - com proteção de acesso */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      );
    } catch (err) {
      // Se houver erro de contexto, mostrar login como fallback
      return <LoginPage />;
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NuvraProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <AppRoutes />
          </BrowserRouter>
        </NuvraProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;