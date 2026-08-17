import type { AppData, Cliente, Locacao } from './types'
import { supabase } from './lib/supabaseClient'

export async function fetchAppData(): Promise<AppData> {
  const [locacoesRes, clientesRes] = await Promise.all([
    supabase.from('locacoes').select('*').order('id'),
    supabase.from('clientes').select('*').order('nome'),
  ])
  if (locacoesRes.error) throw locacoesRes.error
  if (clientesRes.error) throw clientesRes.error
  return {
    locacoes: (locacoesRes.data ?? []) as Locacao[],
    clientes: (clientesRes.data ?? []) as Cliente[],
  }
}

export async function insertLocacao(values: Omit<Locacao, 'id'>): Promise<Locacao> {
  const { data, error } = await supabase.from('locacoes').insert(values).select().single()
  if (error) throw error
  return data as Locacao
}

export async function updateLocacao(id: number, changes: Partial<Omit<Locacao, 'id'>>): Promise<Locacao> {
  const { data, error } = await supabase.from('locacoes').update(changes).eq('id', id).select().single()
  if (error) throw error
  return data as Locacao
}

export async function deleteLocacao(id: number): Promise<void> {
  const { error } = await supabase.from('locacoes').delete().eq('id', id)
  if (error) throw error
}

/** Propaga nome/telefone de um cliente para todos os imóveis vinculados a ele (colunas desnormalizadas). */
export async function updateLocacoesByProprietario(
  idProprietario: number,
  changes: Partial<Pick<Locacao, 'nome_proprietario' | 'telefone_proprietario'>>,
): Promise<Locacao[]> {
  const { data, error } = await supabase
    .from('locacoes')
    .update(changes)
    .eq('id_proprietario', idProprietario)
    .select()
  if (error) throw error
  return (data ?? []) as Locacao[]
}

export async function insertCliente(values: Omit<Cliente, 'id'>): Promise<Cliente> {
  const { data, error } = await supabase.from('clientes').insert(values).select().single()
  if (error) throw error
  return data as Cliente
}

export async function updateCliente(id: number, changes: Partial<Omit<Cliente, 'id'>>): Promise<Cliente> {
  const { data, error } = await supabase.from('clientes').update(changes).eq('id', id).select().single()
  if (error) throw error
  return data as Cliente
}

export async function deleteCliente(id: number): Promise<void> {
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw error
}
