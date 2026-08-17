import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

/**
 * Sessão do Supabase Auth, centralizada num único hook:
 * `undefined` enquanto a sessão inicial ainda está sendo verificada,
 * `null` quando não há usuário autenticado, ou a `Session` ativa.
 *
 * O client do Supabase (ver lib/supabaseClient.ts) já é criado com
 * `persistSession`/`autoRefreshToken` habilitados, então a sessão
 * sobrevive a um F5 e o token é renovado sozinho antes de expirar —
 * este hook só espelha esse estado em React via onAuthStateChange.
 */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  return session
}
