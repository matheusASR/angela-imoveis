import { Paper, Stack, Typography, Box, Chip } from '@mui/material'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import type { Locacao } from '../types'
import { formatMesAno, mesAtualISO, precisaReajuste } from '../calc'
import { brick, moss, amber } from '../theme'

export default function HomeSummary({ locacoes }: { locacoes: Locacao[] }) {
  // (!l.data_pagamento_locatario || precisaReajuste(l.data_inicio_contrato))
  const total = locacoes.length
  const precisamAtencao = locacoes.filter(
    (l) => l.ativo && (!l.data_pagamento_locatario),
  ).length

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.75,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Chip
        icon={<CalendarMonthOutlinedIcon sx={{ color: '#fff !important' }} />}
        label={`Mês vigente: ${formatMesAno(mesAtualISO())}`}
        sx={{ bgcolor: brick, color: '#fff', fontWeight: 700, px: 0.5 }}
      />

      <Stack direction="row" spacing={1.5} alignItems="center">
        <HomeOutlinedIcon sx={{ color: 'text.secondary' }} />
        <Typography sx={{ fontSize: '1.15rem' }}>
          Você tem <strong>{total}</strong> imóve{total === 1 ? 'l' : 'is'} cadastrado{total === 1 ? '' : 's'}
        </Typography>
      </Stack>

      {precisamAtencao > 0 && (
        <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', pl: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <WarningAmberIcon sx={{ color: amber }} />
            <Typography sx={{ fontSize: '1.15rem' }}>
              <strong>{precisamAtencao}</strong> precisa{precisamAtencao === 1 ? '' : 'm'} de atenção
              (pagamento ou reajuste)
            </Typography>
          </Stack>
        </Box>
      )}

      {precisamAtencao === 0 && total > 0 && (
        <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', pl: 3 }}>
          <Typography sx={{ fontSize: '1.15rem', color: moss }}>Tudo em dia ✓</Typography>
        </Box>
      )}
    </Paper>
  )
}
