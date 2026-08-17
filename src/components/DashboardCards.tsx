import { Box, Paper, Stack, Typography } from '@mui/material'
import type { Locacao } from '../types'
import { formatMoeda, precisaReajuste } from '../calc'
import { brick, moss, amber, ink } from '../theme'

function Card({
  label,
  value,
  accent,
  mono = true,
}: {
  label: string
  value: string | number
  accent?: string
  mono?: boolean
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: '1 1 150px',
        minWidth: 150,
        p: 1.75,
        borderColor: 'divider',
        borderTop: `3px solid ${accent ?? ink}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'text.secondary',
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.65rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: mono ? '"IBM Plex Mono", monospace' : undefined,
          fontWeight: 600,
          fontSize: '1.25rem',
          mt: 0.25,
        }}
      >
        {value}
      </Typography>
    </Paper>
  )
}

export default function DashboardCards({ locacoes }: { locacoes: Locacao[] }) {
  const somaAluguel = locacoes.reduce((s, l) => s + (Number(l.valor_aluguel) || 0), 0)
  const somaAdm = locacoes.reduce((s, l) => s + (Number(l.valor_adm) || 0), 0)
  const somaCondominio = locacoes.reduce((s, l) => s + (Number(l.valor_condominio) || 0), 0)
  const somaIptu = locacoes.reduce((s, l) => s + (Number(l.valor_iptu) || 0), 0)
  const somaMulta = locacoes.reduce((s, l) => s + (Number(l.valor_multa) || 0), 0)
  const somaExtras = locacoes.reduce((s, l) => s + (Number(l.valor_extras) || 0), 0)

  const qtdImoveis = locacoes.length
  const qtdAtivos = locacoes.filter((l) => l.ativo).length
  const qtdPredinho = locacoes.filter((l) => l.predinho === 1).length
  const qtdReajuste = locacoes.filter((l) => precisaReajuste(l.data_inicio_contrato)).length

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontFamily: '"IBM Plex Mono", monospace' }}
        >
          Financeiro
        </Typography>
        <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
          <Card label="Aluguéis" value={formatMoeda(somaAluguel)} accent={brick} />
          <Card label="Administração" value={formatMoeda(somaAdm)} accent={brick} />
          <Card label="Condomínios" value={formatMoeda(somaCondominio)} accent={moss} />
          <Card label="IPTUs" value={formatMoeda(somaIptu)} accent={moss} />
          <Card label="Multas" value={formatMoeda(somaMulta)} accent={amber} />
          <Card label="Extras" value={formatMoeda(somaExtras)} accent={moss} />
        </Stack>
      </Box>
      <Box>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontFamily: '"IBM Plex Mono", monospace' }}
        >
          Operacional
        </Typography>
        <Stack direction="row" spacing={1.25} sx={{ flexWrap: 'wrap' }}>
          <Card label="Imóveis" value={qtdImoveis} accent={ink} />
          <Card label="Contratos ativos" value={qtdAtivos} accent={moss} />
          <Card label="PREDINHO" value={qtdPredinho} accent={brick} />
          <Card label="Reajuste pendente" value={qtdReajuste} accent={amber} />
        </Stack>
      </Box>
    </Stack>
  )
}
