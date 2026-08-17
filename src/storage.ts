import type { AppData, Cliente, Locacao } from './types'
import { supabase } from './lib/supabaseClient'
import { mesAtualISO, mesesFaltantes } from './calc'

export async function fetchAppData(): Promise<AppData> {
  const [locacoesRes, clientesRes] = await Promise.all([
    supabase.from('locacoes').select('*').eq('mes_referencia', mesAtualISO()).order('id'),
    supabase.from('clientes').select('*').order('nome'),
  ])
  if (locacoesRes.error) throw locacoesRes.error
  if (clientesRes.error) throw clientesRes.error
  return {
    locacoes: (locacoesRes.data ?? []) as Locacao[],
    clientes: (clientesRes.data ?? []) as Cliente[],
  }
}

/** Busca as linhas de um mês específico (histórico) — usada pelo Relatório. */
export async function fetchLocacoesPorMes(mesReferencia: string): Promise<Locacao[]> {
  const { data, error } = await supabase
    .from('locacoes')
    .select('*')
    .eq('mes_referencia', mesReferencia)
    .order('id')
  if (error) throw error
  return (data ?? []) as Locacao[]
}

export async function insertLocacao(
  values: Omit<Locacao, 'id' | 'imovel_id'> & { imovel_id?: number },
): Promise<Locacao> {
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

/**
 * Propaga nome/telefone/dados bancários de um cliente para os imóveis
 * vinculados a ele — só a linha do mês atual (colunas desnormalizadas).
 * Meses históricos mantêm os dados que valiam naquela época.
 */
export async function updateLocacoesByProprietario(
  idProprietario: number,
  changes: Partial<
    Pick<
      Locacao,
      | 'nome_proprietario'
      | 'telefone_proprietario'
      | 'banco_proprietario'
      | 'agencia_proprietario'
      | 'conta_corrente_proprietario'
    >
  >,
): Promise<Locacao[]> {
  const { data, error } = await supabase
    .from('locacoes')
    .update(changes)
    .eq('id_proprietario', idProprietario)
    .eq('mes_referencia', mesAtualISO())
    .select()
  if (error) throw error
  return (data ?? []) as Locacao[]
}

/**
 * Virada de mês: para cada imóvel ativo cuja linha mais recente não seja
 * do mês atual, insere uma linha nova por mês faltante (em cadeia, cada
 * uma clonando a anterior, com as datas de pagamento zeradas e o novo
 * mes_referencia). Idempotente — seguro rodar em paralelo (ex.: duas abas
 * abertas) graças ao upsert com "ignoreDuplicates" sobre a constraint
 * única (imovel_id, mes_referencia).
 *
 * Imóveis com a última linha marcada como inativa não geram mês novo — a
 * forma de parar o histórico automático de um imóvel é desligar "Contrato
 * ativo" na ficha dele.
 */
export async function avancarMesReferencia(): Promise<boolean> {
  const { data, error } = await supabase
    .from('locacoes')
    .select('*')
    .order('imovel_id')
    .order('mes_referencia', { ascending: false })
  if (error) throw error
  const linhas = (data ?? []) as Locacao[]

  const maisRecentePorImovel = new Map<number, Locacao>()
  for (const l of linhas) {
    if (!maisRecentePorImovel.has(l.imovel_id)) maisRecentePorImovel.set(l.imovel_id, l)
  }

  const mesAtual = mesAtualISO()
  const novasLinhas: Omit<Locacao, 'id'>[] = []

  for (const ultima of maisRecentePorImovel.values()) {
    if (!ultima.ativo) continue
    const faltantes = mesesFaltantes(ultima.mes_referencia, mesAtual)
    let base = ultima
    for (const mes of faltantes) {
      const { id, ...campos } = base
      const nova: Omit<Locacao, 'id'> = {
        ...campos,
        mes_referencia: mes,
        data_pagamento_locatario: '',
        data_pagamento_proprietario: '',
      }
      novasLinhas.push(nova)
      base = { ...nova, id: -1 }
    }
  }

  if (novasLinhas.length === 0) return false

  const { error: upsertError } = await supabase
    .from('locacoes')
    .upsert(novasLinhas, { onConflict: 'imovel_id,mes_referencia', ignoreDuplicates: true })
  if (upsertError) throw upsertError
  return true
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
