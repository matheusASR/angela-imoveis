import { Paper, Stack, Typography, Box, Chip, Divider } from '@mui/material'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import type { FiltroTipo, Locacao } from '../types'
import {
  contratoPertoDoFim,
  formatMesAno,
  mesAtualISO,
  precisaReajuste,
  reajusteJaRevisado,
} from '../calc'
import { brick, moss, amber, rose, inkSecondary, ink } from '../theme'

/**
 * Cada card também funciona como um toggle de filtro da tabela de imóveis:
 * clicar aplica o filtro correspondente, clicar de novo (no mesmo já ativo)
 * volta para "todos".
 */
function StatItem({
  icon,
  label,
  value,
  accent,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  accent: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Stack
      component="button"
      type="button"
      onClick={onClick}
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        flex: '1 1 200px',
        minWidth: 180,
        border: 0,
        p: 1,
        m: -1,
        borderRadius: 2.5,
        bgcolor: active ? `${accent}18` : 'transparent',
        boxShadow: active ? `inset 0 0 0 1.5px ${accent}` : 'inset 0 0 0 1px transparent',
        cursor: 'pointer',
        textAlign: 'left',
        font: 'inherit',
        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': { bgcolor: `${accent}0f` },
      }}
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          flexShrink: 0,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: `${accent}18`,
          color: accent,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }} noWrap>
          {label}
        </Typography>
      </Box>
    </Stack>
  )
}

export default function HomeSummary({
  locacoes,
  filtro,
  onFiltroChange,
}: {
  locacoes: Locacao[]
  filtro: FiltroTipo
  onFiltroChange: (v: FiltroTipo) => void
}) {
  const total = locacoes.length
  const predinho = locacoes.filter((l) => l.predinho === 1).length
  const pertoDoFim = locacoes.filter(
    (l) => l.ativo && contratoPertoDoFim(l.data_inicio_contrato, l.meses_contrato),
  ).length
  const locatariosPendentes = locacoes.filter((l) => l.ativo && !l.data_pagamento_locatario).length
  const proprietariosPendentes = locacoes.filter((l) => l.ativo && !l.data_pagamento_proprietario).length
  const reajustesPendentes = locacoes.filter(
    (l) =>
      l.ativo &&
      precisaReajuste(l.data_inicio_contrato) &&
      !reajusteJaRevisado(l.data_inicio_contrato, l.data_revisao_reajuste),
  ).length

  const toggle = (v: FiltroTipo) => onFiltroChange(filtro === v ? 'todos' : v)

  return (
    <Stack spacing={1.25}>
      <Box>
        <Chip
          size="small"
          icon={<CalendarMonthOutlinedIcon sx={{ fontSize: '0.95rem !important', color: `${inkSecondary} !important` }} />}
          label={`Mês vigente — ${formatMesAno(mesAtualISO())}`}
          sx={{
            bgcolor: '#FAFAFB',
            color: ink,
            fontFamily: 'inherit',
            fontWeight: 600,
            fontSize: '0.78rem',
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2.25,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: { xs: 2, sm: 3 },
        }}
      >
        <StatItem
          icon={<HomeOutlinedIcon fontSize="small" />}
          label={`Imóve${total === 1 ? 'l' : 'is'} cadastrado${total === 1 ? '' : 's'}`}
          value={total}
          accent={ink}
          active={filtro === 'todos'}
          onClick={() => onFiltroChange('todos')}
        />

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        <StatItem
          icon={<ApartmentOutlinedIcon fontSize="small" />}
          label="PREDINHO"
          value={predinho}
          accent={brick}
          active={filtro === 'predinho'}
          onClick={() => toggle('predinho')}
        />

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        <StatItem
          icon={<EventBusyOutlinedIcon fontSize="small" />}
          label="Com 3 meses ou menos para o fim"
          value={pertoDoFim}
          accent={rose}
          active={filtro === 'perto_fim'}
          onClick={() => toggle('perto_fim')}
        />

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        <StatItem
          icon={<PendingActionsOutlinedIcon fontSize="small" />}
          label="Locatários sem pagar"
          value={locatariosPendentes}
          accent={amber}
          active={filtro === 'locatarios_pendentes'}
          onClick={() => toggle('locatarios_pendentes')}
        />

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        <StatItem
          icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
          label="Proprietários a pagar"
          value={proprietariosPendentes}
          accent={amber}
          active={filtro === 'proprietarios_pendentes'}
          onClick={() => toggle('proprietarios_pendentes')}
        />

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        {reajustesPendentes > 0 ? (
          <StatItem
            icon={<WarningAmberOutlinedIcon fontSize="small" />}
            label="Reajustes IPCA/IGP-M pendentes"
            value={reajustesPendentes}
            accent={amber}
            active={filtro === 'reajustes_pendentes'}
            onClick={() => toggle('reajustes_pendentes')}
          />
        ) : (
          <StatItem
            icon={<CheckCircleOutlinedIcon fontSize="small" />}
            label="Reajustes em dia"
            value="✓"
            accent={moss}
            active={filtro === 'reajustes_pendentes'}
            onClick={() => toggle('reajustes_pendentes')}
          />
        )}
      </Paper>
    </Stack>
  )
}
