import { Paper, Stack, Typography, Box, Chip, Divider } from '@mui/material'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import type { Locacao } from '../types'
import { formatMesAno, mesAtualISO, precisaReajuste } from '../calc'
import { moss, amber, inkSecondary, ink } from '../theme'

function StatItem({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  accent: string
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ flex: '1 1 200px', minWidth: 180 }}
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

export default function HomeSummary({ locacoes }: { locacoes: Locacao[] }) {
  const total = locacoes.length
  const precisamAtencao = locacoes.filter((l) => l.ativo && !l.data_pagamento_locatario).length
  const ativos = locacoes.filter((l) => l.ativo).length

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
        />

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        <StatItem
          icon={<CheckCircleOutlinedIcon fontSize="small" />}
          label="Contratos ativos"
          value={ativos}
          accent={moss}
        />

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        {precisamAtencao > 0 ? (
          <StatItem
            icon={<WarningAmberOutlinedIcon fontSize="small" />}
            label="Precisam de atenção (pagamento ou reajuste)"
            value={precisamAtencao}
            accent={amber}
          />
        ) : (
          <StatItem icon={<CheckCircleOutlinedIcon fontSize="small" />} label="Tudo em dia" value="✓" accent={moss} />
        )}
      </Paper>
    </Stack>
  )
}
