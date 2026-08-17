import { mesAtualISO, parcelaIptuAtualPadrao } from './calc'

/** Quem paga o valor diretamente: o próprio inquilino, ou a administradora (ADM). */
export type FormaPagamento = 'inquilino' | 'adm'

export interface Locacao {
  id: number
  local: string
  numero_ap: string
  meio_pagamento: string
  dia_vencimento: string
  nome_locatario: string
  data_pagamento_locatario: string
  valor_aluguel: number
  valor_adm: number
  valor_condominio: number
  valor_iptu: number
  valor_extras: number
  valor_multa: number
  /** Valor extra referente ao proprietário, descontado do repasse. */
  valor_extra_proprietario: number
  /** Quem paga o condomínio: diretamente o inquilino, ou a ADM. */
  pagamento_condominio: FormaPagamento
  /** Quem paga o IPTU: diretamente o inquilino, ou a ADM. */
  pagamento_iptu: FormaPagamento
  /** Quem paga os benefícios/extras do inquilino: diretamente o inquilino, ou a ADM. */
  pagamento_extras: FormaPagamento
  nome_proprietario: string
  telefone_proprietario: string
  data_pagamento_proprietario: string
  meses_contrato: number
  mes_contrato_atual: number
  parcela_iptu_atual: number
  /** Data (ISO) em que o reajuste por IPCA/IGP-M foi revisado pela última vez. */
  data_revisao_reajuste: string
  banco_proprietario: string
  agencia_proprietario: string
  conta_corrente_proprietario: string
  predinho: 0 | 1
  data_inicio_contrato: string
  observacoes: string
  ativo: boolean
  /** Referência ao cliente (proprietário) cadastrado na aba Clientes. */
  id_proprietario: number | null
  /** Competência (mês/ano, "AAAA-MM") a que os valores e pagamentos atuais se referem. */
  mes_referencia: string
}

export interface Cliente {
  id: number
  nome: string
  telefone: string
}

export interface AppData {
  locacoes: Locacao[]
  clientes: Cliente[]
}

export const MEIOS_PAGAMENTO = ['DEPÓSITO', 'LOCAL', 'PIX'] as const
export type FiltroTipo =
  | 'todos'
  | 'ativos'
  | 'predinho'
  | 'pendentes'
  | 'reajuste'

/** Valores padrão para um novo imóvel — sem "id", que é atribuído pelo banco na inserção. */
export const novaLocacaoPadrao = (): Omit<Locacao, 'id'> => ({
  local: '',
  numero_ap: '',
  meio_pagamento: '',
  dia_vencimento: '',
  nome_locatario: '',
  data_pagamento_locatario: '',
  valor_aluguel: 0,
  valor_adm: 0,
  valor_condominio: 0,
  valor_iptu: 0,
  valor_extras: 0,
  valor_multa: 0,
  valor_extra_proprietario: 0,
  pagamento_condominio: 'adm',
  pagamento_iptu: 'adm',
  pagamento_extras: 'adm',
  nome_proprietario: '',
  telefone_proprietario: '',
  data_pagamento_proprietario: '',
  meses_contrato: 12,
  mes_contrato_atual: 0,
  parcela_iptu_atual: parcelaIptuAtualPadrao(),
  data_revisao_reajuste: '',
  banco_proprietario: '',
  agencia_proprietario: '',
  conta_corrente_proprietario: '',
  predinho: 0,
  data_inicio_contrato: '',
  observacoes: '',
  ativo: true,
  id_proprietario: null,
  mes_referencia: mesAtualISO(),
})
