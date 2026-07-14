import { useState, useEffect, useRef } from 'react';
import { supabase, getSupabaseClient } from '@/lib/supabase';
import { UserProfile } from '@/hooks/useAuth';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingUserId = useRef<string | null>(null);

  // Carregar perfil do usuário atual
  const loadProfile = async (userId: string) => {

    // Verificar se já está carregando o mesmo userId
    if (loading && loadingUserId.current === userId) {
      return null;
    }

    try {
      setLoading(true);
      loadingUserId.current = userId;


      // Criar um timeout curto para liberar UI rapidamente (fallback para metadata)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout after 2 seconds')), 2000);
      });

      const queryPromise = supabase
        .from('user_profiles')
        .select('id, nome, empresa_id, role, created_at')
        .eq('id', userId)
        .maybeSingle();

      const result = await Promise.race([queryPromise, timeoutPromise]) as any;
      const { data, error } = result;


      if (error) {

        // Se for erro de política RLS ou recursão, tentar uma abordagem alternativa
        if (error.message && error.message.includes('infinite recursion')) {
          
          // Tentar carregar via RPC function que não tem RLS
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_profile', { user_id: userId });
            
            if (!rpcError && rpcData) {
              const userProfile: UserProfile = {
                id: rpcData.id,
                nome: rpcData.nome,
                empresa_id: rpcData.empresa_id,
                role: rpcData.role as 'user' | 'admin' | 'owner',
                created_at: rpcData.created_at
              };
              setProfile(userProfile);
              return userProfile;
            }
          } catch (rpcErr) {
          }
          
          return null;
        }

        // Para outros erros, continuar normalmente
        if (error.code === 'PGRST116') {
            return null;
        }
        return null;
      }

      // Se data for null, significa que não encontrou o perfil
      if (!data) {
        return null;
      }


      const userProfile: UserProfile = {
        id: data.id,
        nome: data.nome,
        empresa_id: data.empresa_id,
        role: data.role as 'user' | 'admin' | 'owner',
        created_at: data.created_at
      };

      setProfile(userProfile);
      return userProfile;
    } catch (err: any) {

      // Se for timeout, retornar null para permitir continuação
      if (err.message && err.message.includes('Query timeout')) {
        return null;
      }

      return null;
    } finally {
      setLoading(false);
      loadingUserId.current = null;
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        nome: updates.nome,
        empresa_id: updates.empresa_id,
        role: updates.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) throw error;

    const updatedProfile: UserProfile = {
      id: data.id,
      nome: data.nome,
      empresa_id: data.empresa_id,
      role: data.role as 'user' | 'admin' | 'owner',
      created_at: data.created_at
    };

    setProfile(updatedProfile);
    return updatedProfile;
  };

  // Criar perfil (usado durante signup)
  const createProfile = async (userId: string, profileData: Omit<UserProfile, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        nome: profileData.nome,
        empresa_id: profileData.empresa_id,
        role: profileData.role
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('Nenhum dado retornado após criar perfil');
    }

    const newProfile: UserProfile = {
      id: data.id,
      nome: data.nome,
      empresa_id: data.empresa_id,
      role: data.role as 'user' | 'admin' | 'owner',
      created_at: data.created_at
    };

    setProfile(newProfile);
    return newProfile;
  };

  // Limpar perfil (logout)
  const clearProfile = () => {
    setProfile(null);
    setLoading(false);
    loadingUserId.current = null;
  };

  return {
    profile,
    loading,
    loadProfile,
    updateProfile,
    createProfile,
    clearProfile
  };
}