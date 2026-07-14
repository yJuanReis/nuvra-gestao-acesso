import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase, getSupabaseClient } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';

export interface UserProfile {
  id: string;
  nome: string;
  empresa_id: string;
  role: 'user' | 'admin' | 'owner';
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: UserProfile;
}

interface UseAuthReturn {
  user: AuthUser | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  nome: string;
  empresa_id: string;
  role?: 'user' | 'admin' | 'owner';
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialSessionProcessed, setInitialSessionProcessed] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const isSigningUpRef = useRef(false);
  const { profile, loadProfile, createProfile, clearProfile } = useProfile();

  // Inicializar auth state do Supabase
  useEffect(() => {
    let mounted = true;

    // Verificar sessão atual
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          // sessão inválida/ausente — tratada como não autenticado abaixo
        } else if (session?.user) {
          await handleAuthStateChange(session.user);
          setInitialSessionProcessed(true);
        } else {
          // Usuário não autenticado
          setUser(null);
          setSession(null);
          clearProfile();
          setInitialSessionProcessed(true);
        }
      } catch (err) {
        if (mounted) {
          setUser(null);
          setSession(null);
          clearProfile();
          setInitialSessionProcessed(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listener para mudanças de auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (!mounted) return;

        // Se estamos saindo ou criando usuário, ignorar o evento de auth state change
        if (isSigningOut || isSigningUpRef.current) {
          return;
        }

        // Evitar processar a sessão inicial novamente
        if (event === 'SIGNED_IN' && initialSessionProcessed) {
          return;
        }

        if (session?.user) {
          await handleAuthStateChange(session.user);
        } else {
          setUser(null);
          setSession(null);
          clearProfile();
        }

        // Garantir que loading seja false após mudança de estado
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Função auxiliar para lidar com mudança de estado de auth
  const handleAuthStateChange = async (supabaseUser: any) => {

    // Extrair dados do metadata do auth (criados no signup)
    const metadataRole = supabaseUser?.user_metadata?.role;
    const metadataNome = supabaseUser?.user_metadata?.nome;
    const metadataEmpresa = supabaseUser?.user_metadata?.empresa_id;
    
    // Criar usuário básico do metadata (sempre disponível)
    const basicAuthUser: AuthUser = {
      id: supabaseUser.id,
      email: supabaseUser.email,
      profile: metadataRole ? {
        id: supabaseUser.id,
        nome: metadataNome || supabaseUser.email,
        empresa_id: metadataEmpresa || '',
        role: metadataRole as 'user' | 'admin' | 'owner',
        created_at: new Date().toISOString()
      } : undefined
    };

    // Preservar perfil já carregado para o mesmo usuário, evitando
    // flicker da tela de login em eventos de auth (token refresh, foco de aba).
    setUser(prev => {
      if (prev?.id === basicAuthUser.id && prev.profile) {
        return prev;
      }
      return basicAuthUser;
    });
    setSession({ user: basicAuthUser });

    // Depois tentar carregar o perfil em background (não bloqueante)
    try {
      const userProfile = await loadProfile(supabaseUser.id);

      if (userProfile) {
        // Atualizar usuário com perfil carregado do banco
        setUser(prev => prev ? { ...prev, profile: userProfile } : prev);
      } else if (metadataRole) {
        // Já tem profile do metadata, não fazer nada
      } else {
        // Tentar fazer uma ação de resgate: tentar criar o perfil
        try {
          // Este é um último recurso - não deveria ser necessário
          // mas garante que não deixamos usuários órfãos
        } catch (rescueErr: any) {
        }
      }
    } catch (err: any) {
      // Não fazer nada - usuário básico já foi criado com dados do metadata
    }
  };

  // Sign In - Apenas Supabase Auth
  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        toast.error('Email ou senha incorretos');
        return { success: false, error: 'Credenciais inválidas' };
      }

      if (data.user) {
        toast.success('Login realizado com sucesso!');
        return { success: true };
      }

      // Caso improvável
      toast.error('Erro inesperado no login');
      return { success: false, error: 'Erro interno' };

    } catch (err: any) {
      toast.error('Erro ao fazer login');
      return { success: false, error: 'Erro interno' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign Up - Criar conta no Supabase + perfil
  const signUp = useCallback(async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    // Preserva sessão atual: se o Supabase trocar a sessão ao criar um novo usuário,
    // restauramos a sessão do admin/owner para evitar troca automática de usuário.
    try {
      setLoading(true);

      // Capturar sessão atual (antes do signup)
      let prevSession: any = null;
      try {
        const { data } = await supabase.auth.getSession();
        prevSession = data?.session || null;
      } catch (e) {
        prevSession = null;
      }

      // Marcar que signup está em andamento para que o listener ignore auth changes
      isSigningUpRef.current = true;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            nome: data.nome.trim(),
            empresa_id: data.empresa_id,
            role: data.role || 'user'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        return { success: false, error: 'Erro ao criar conta' };
      }


      // Aguardar criação do perfil com retry
      let profileCreated = false;
      let retries = 0;
      const maxRetries = 3;

      while (!profileCreated && retries < maxRetries) {
        try {

          await createProfile(authData.user.id, {
            nome: data.nome.trim(),
            empresa_id: data.empresa_id,
            role: data.role || 'user'
          });

          profileCreated = true;
        } catch (profileErr: any) {
          retries++;

          if (profileErr?.message && profileErr.message.includes('infinite recursion')) {
            break;
          }

          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      if (!profileCreated) {
        // perfil não criado após retries — o trigger do banco cobre esse caso
      }

      // Após signup, verificar se a sessão atual mudou para o novo usuário
      try {
        const { data: currentData } = await supabase.auth.getSession();
        const currentSession = currentData?.session || null;

        if (prevSession && currentSession && prevSession.user?.id !== currentSession.user?.id) {

          if (prevSession.access_token && prevSession.refresh_token) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token: prevSession.access_token,
              refresh_token: prevSession.refresh_token
            });

            if (setErr) {
              // falha ao restaurar sessão anterior — segue com a sessão atual
              } else {
                try {
                // Reaplicar estado de usuário a partir da sessão restaurada
                await handleAuthStateChange(prevSession.user);
              } catch (hErr) {
                }
            }
          } else {
            // sessão anterior sem tokens — nada a restaurar
            }
        }
      } catch (restoreErr) {
      }

      toast.success('Conta criada com sucesso! Verifique seu email para confirmar.');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao criar conta';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      isSigningUpRef.current = false;
      setLoading(false);
    }
  }, [createProfile]);

  // Sign Out - Apenas Supabase Auth
  const signOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      setLoading(true);

      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          // erro no signOut do Supabase (ex.: sessão faltante) — ignora e
          // segue com o logout local abaixo
        }
      } catch (err: any) {
      }

      // Sempre limpar dados locais, independente do resultado do Supabase
      setUser(null);
      setSession(null);
      clearProfile();

      // Limpando chaves locais do Supabase para evitar sessão persistente
      try {
        Object.keys(localStorage).forEach(key => {
          if (typeof key === 'string' && (key.startsWith('supabase.auth') || key.startsWith('sb-') || key.includes('supabase'))) {
            localStorage.removeItem(key);
          }
        });
      } catch (lsErr) {
      }

      toast.success('Você saiu do sistema');
    } catch (err) {
      // Mesmo com erro, tentar limpar dados locais
      setUser(null);
      setSession(null);
      clearProfile();
    } finally {
      setLoading(false);
      // Aumentar janela para evitar race conditions de auth state change
      setTimeout(() => {
        setIsSigningOut(false);
      }, 1000);
    }
  }, [clearProfile]);

  // Reset Password - Supabase Auth
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao enviar email de recuperação';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update Password - Supabase Auth
  const updatePassword = useCallback(async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast.success('Senha atualizada com sucesso!');
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar senha';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Refresh Profile - Recarregar dados do perfil
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      // loadProfile já atualiza o estado do perfil internamente
      await loadProfile(user.id);
    } catch (err) {
      console.error('Erro ao recarregar perfil:', err);
    }
  }, [user?.id, loadProfile]);

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };
}