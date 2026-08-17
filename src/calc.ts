import type { FormaPagamento, Locacao } from './types'

export const MESES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

/** Mês/ano corrente no formato "AAAA-MM", usado como referência de competência da locação. */
export function mesAtualISO(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

/** Formata "AAAA-MM" como "Mês/AAAA" (ex.: "2026-08" → "Agosto/2026"). */
export function formatMesAno(mesAno: string): string {
  const [ano, mes] = (mesAno || '').split('-').map(Number)
  const nomeMes = MESES_PT[(mes || 0) - 1]
  if (!nomeMes || !ano) return '—'
  return `${nomeMes}/${ano}`
}

/**
 * Lista de competências ("AAAA-MM") entre `ultimoMes` (exclusivo) e
 * `mesAtual` (inclusivo), em ordem cronológica. Usada pela virada de mês
 * para descobrir quantas linhas mensais faltam inserir para um imóvel —
 * se ninguém abriu o app por alguns meses, preenche todos de uma vez em
 * vez de pular direto para o mês atual.
 *
 * Ex.: mesesFaltantes("2026-05", "2026-08") → ["2026-06", "2026-07", "2026-08"]
 */
export function mesesFaltantes(ultimoMes: string, mesAtual: string = mesAtualISO()): string[] {
  const [anoIni, mesIni] = ultimoMes.split('-').map(Number)
  if (!anoIni || !mesIni) return []
  const faltantes: string[] = []
  let cursor = new Date(Date.UTC(anoIni, mesIni - 1, 1))
  const limite = (() => {
    const [ano, mes] = mesAtual.split('-').map(Number)
    return new Date(Date.UTC(ano, mes - 1, 1))
  })()
  while (cursor < limite) {
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))
    faltantes.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`)
  }
  return faltantes
}

/** Calcula valor_adm conforme a regra do PREDINHO (7%) ou demais imóveis (8%). */
export function calcValorAdm(valor_aluguel: number, valor_multa: number, predinho: 0 | 1): number {
  const base = (Number(valor_aluguel) || 0) + (Number(valor_multa) || 0)
  const taxa = predinho === 1 ? 0.07 : 0.08
  return Math.round(base * taxa * 100) / 100
}

export function mesesDesdeInicio(data_inicio_contrato: string): number | null {
  if (!data_inicio_contrato) return null
  const inicio = new Date(data_inicio_contrato)
  if (isNaN(inicio.getTime())) return null
  const hoje = new Date()
  let meses =
    (hoje.getFullYear() - inicio.getFullYear()) * 12 + (hoje.getMonth() - inicio.getMonth())
  if (hoje.getDate() < inicio.getDate()) meses -= 1
  return meses
}

/** true quando o contrato já completou 12 meses (ou múltiplos de 12) e está pendente de reajuste. */
export function precisaReajuste(data_inicio_contrato: string): boolean {
  const meses = mesesDesdeInicio(data_inicio_contrato)
  if (meses === null) return false
  return meses >= 12
}

export function formatMoeda(valor: number): string {
  return (Number(valor) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatData(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * O IPTU é sempre parcelado em 10x, começando em fevereiro (1/10) e
 * terminando em novembro (10/10). Fora desse período (dez/jan), assume-se
 * o limite mais próximo do ciclo.
 *
 * IMPORTANTE: esse valor é sempre calculado a partir do calendário (mês
 * atual), e não incrementado manualmente a cada pagamento. O cálculo é o
 * mesmo para todos os imóveis, já que o parcelamento do IPTU segue o
 * calendário fiscal e não a data de início de cada contrato. Isso evita que
 * a parcela "atrase" ou "adiante" por causa de marcações de pagamento
 * feitas fora de ordem (ex.: desmarcar e marcar "locatário pagou" de novo).
 */
export function parcelaIptuParaMes(mes: number): number {
  return Math.min(Math.max(mes - 1, 1), 10)
}

export function parcelaIptuAtualPadrao(): number {
  const mes = new Date().getMonth() + 1 // 1-12
  return parcelaIptuParaMes(mes)
}

export function formatParcelaIptu(atual: number): string {
  return `${Number(atual) || 0}/10`
}

export function valorParcelaIptu(valor_iptu: number): number {
  return Math.round(((Number(valor_iptu) || 0) / 10) * 100) / 100
}

/**
 * Mês atual do contrato calculado a partir da data de início (1-indexado).
 * Também é sempre derivado da data, e não incrementado manualmente, pelo
 * mesmo motivo da parcela do IPTU acima.
 */
export function calcularMesContratoAtual(data_inicio_contrato: string, meses_contrato: number): number {
  const meses = mesesDesdeInicio(data_inicio_contrato)
  if (meses === null) return 0
  const atual = meses + 1
  const max = meses_contrato > 0 ? meses_contrato : 9999
  return Math.min(Math.max(atual, 1), max)
}

export function formatParcelaContrato(mes_atual: number, meses_contrato: number): string {
  return `${Number(mes_atual) || 0}/${Number(meses_contrato) || 0}`
}

/**
 * Valor a ser pago ao proprietário:
 * Aluguel + Condomínio + IPTU (parcela do mês) + Benefícios do Inquilino (Extras) + Multa (se houver)
 * - Taxa ADM - Extra do Proprietário
 *
 * Condomínio, IPTU e Extras só entram na soma quando marcados como pagos
 * pela ADM — se forem pagos diretamente pelo inquilino, não entram no
 * repasse ao proprietário. O Aluguel e a Multa (quando houver) sempre
 * entram na soma.
 */
export function valorAPagarProprietario(l: Locacao): number {
  const aluguel = Number(l.valor_aluguel) || 0
  const condominio = l.pagamento_condominio === 'adm' ? Number(l.valor_condominio) || 0 : 0
  const iptu = l.pagamento_iptu === 'adm' ? valorParcelaIptu(l.valor_iptu) : 0
  const extras = l.pagamento_extras === 'adm' ? Number(l.valor_extras) || 0 : 0
  const multa = Number(l.valor_multa) || 0
  const taxaAdm = Number(l.valor_adm) || 0
  const extraProprietario = Number(l.valor_extra_proprietario) || 0
  return (
    Math.round((aluguel + condominio + iptu + extras + multa - taxaAdm - extraProprietario) * 100) / 100
  )
}

export function formatFormaPagamento(f: FormaPagamento): string {
  return f === 'inquilino' ? 'Direto pelo inquilino' : 'Pela ADM'
}

/**
 * Data do aniversário de 12 meses mais recente já completado (início do
 * ciclo de reajuste atual). Retorna null se o contrato ainda não completou
 * o primeiro ciclo de 12 meses.
 */
export function ultimoAniversarioReajuste(data_inicio_contrato: string): Date | null {
  const meses = mesesDesdeInicio(data_inicio_contrato)
  if (meses === null || meses < 12) return null
  const ciclosCompletos = Math.floor(meses / 12) * 12
  const inicio = new Date(data_inicio_contrato)
  const aniversario = new Date(inicio)
  aniversario.setMonth(aniversario.getMonth() + ciclosCompletos)
  return aniversario
}

/**
 * true quando a revisão de IPCA/IGP-M já foi feita para o ciclo de reajuste
 * de 12 meses atual. Uma revisão antiga (de um ciclo anterior) não conta —
 * assim que um novo aniversário de 12 meses é atingido, o alerta volta a
 * aparecer automaticamente até ser revisado de novo.
 */
export function reajusteJaRevisado(data_inicio_contrato: string, data_revisao_reajuste: string): boolean {
  const aniversario = ultimoAniversarioReajuste(data_inicio_contrato)
  if (!aniversario || !data_revisao_reajuste) return false
  const revisao = new Date(data_revisao_reajuste)
  if (isNaN(revisao.getTime())) return false
  return revisao.getTime() >= aniversario.getTime()
}
