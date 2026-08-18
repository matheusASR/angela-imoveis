import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Tooltip,
  Typography,
  Box,
  ToggleButton,
  TextField,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import type { FiltroTipo, Locacao } from '../types'
import {
  calcularMesContratoAtual,
  contratoPertoDoFim,
  formatData,
  formatMoeda,
  formatParcelaContrato,
  precisaReajuste,
  reajusteJaRevisado,
  valorAPagarProprietario,
  valorAReceberLocatario,
  valorParcelaIptu,
} from '../calc'
import { brick, moss, amber, rose, soft, inkSecondary } from '../theme'

/** Toggle buttons desta tabela usam um raio bem menor que o padrão (pílula) do tema. */
const toggleBtnSx = {
  justifyContent: 'flex-start',
  textTransform: 'none',
  px: 1,
  py: 0.25,
  fontSize: '0.75rem',
  borderRadius: '6px !important',
  '&.Mui-selected': { bgcolor: moss, color: '#fff' },
  '&.Mui-selected:hover': { bgcolor: moss },
}

/**
 * Célula de valor monetário editável in-line. Tem fundo e borda sutis
 * permanentes (mesmo fora de foco) para deixar claro, à primeira vista, que
 * é um campo editável e não apenas um texto informativo. Ao clicar, vira um
 * input numérico normal com destaque de foco. `onCommit` só é chamado
 * quando o valor realmente muda.
 */
function EditableMoneyCell({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [editando, setEditando] = useState(false)
  const [texto, setTexto] = useState(String(value))

  useEffect(() => {
    if (!editando) setTexto(String(value))
  }, [value, editando])

  const commit = () => {
    setEditando(false)
    const num = Number(texto.replace(',', '.'))
    const arredondado = Math.round((isNaN(num) ? 0 : num) * 100) / 100
    if (arredondado !== value) onCommit(arredondado)
  }

  return (
    <TextField
      size="small"
      variant="standard"
      type={editando ? 'number' : 'text'}
      value={editando ? texto : formatMoeda(value)}
      onFocus={(e) => {
        setEditando(true)
        setTexto(String(value))
        requestAnimationFrame(() => e.target.select())
      }}
      onChange={(e) => setTexto(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
      onClick={(e) => e.stopPropagation()}
      title="Clique para editar"
      InputProps={{
        disableUnderline: true,
        inputProps: { min: 0, style: { textAlign: 'right' } },
        sx: {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.85rem',
          bgcolor: editando ? '#FAFAFB' : 'transparent',
          borderRadius: 1.5,
          px: 0.75,
          py: 0.25,
          border: '1px solid',
          borderColor: editando ? 'primary.main' : 'transparent',
          boxShadow: editando ? '0 0 0 3px rgba(166,71,43,0.12)' : 'none',
          transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': { borderColor: editando ? 'primary.main' : '#D9D9DE', bgcolor: editando ? '#FAFAFB' : '#FAFAFB' },
        },
      }}
      sx={{ minWidth: 100 }}
    />
  )
}

export default function LocacaoTable({
  locacoes,
  filtro,
  onOpen,
  onToggleLocatario,
  onToggleProprietario,
  onToggleReajusteRevisado,
  onUpdateCampo,
}: {
  locacoes: Locacao[]
  filtro: FiltroTipo
  onOpen: (l: Locacao) => void
  onToggleLocatario: (l: Locacao) => void
  onToggleProprietario: (l: Locacao) => void
  onToggleReajusteRevisado: (l: Locacao) => void
  onUpdateCampo: (l: Locacao, field: keyof Locacao, value: number) => void
}) {
  if (locacoes.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 7, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25 }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FAFAFB',
            color: inkSecondary,
          }}
        >
          <HomeWorkOutlinedIcon />
        </Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>Nenhum imóvel encontrado</Typography>
        <Typography variant="body2" color="text.secondary">
          Ajuste a busca ou os filtros, ou adicione um novo imóvel.
        </Typography>
      </Paper>
    )
  }

  // "Pendência de pagamento" e "reajuste pendente" são visões enxutas: a
  // lista já vem filtrada para só esses casos (ver App.tsx), então colunas
  // de valores editáveis somem e só as colunas relevantes à ação (marcar
  // pagamento / revisão) aparecem.
  const filtroPendencia = filtro === 'locatarios_pendentes' || filtro === 'proprietarios_pendentes'
  const filtroReajuste = filtro === 'reajustes_pendentes'
  const colunasReduzidas = filtroPendencia || filtroReajuste

  return (
    <Stack spacing={1}>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Imóvel</TableCell>
              <TableCell>Locatário</TableCell>
              <TableCell>Proprietário</TableCell>
              <TableCell>Tempo de contrato</TableCell>
              {!colunasReduzidas && <TableCell align="right">Aluguel</TableCell>}
              {!colunasReduzidas && <TableCell align="right">Condomínio</TableCell>}
              {!colunasReduzidas && <TableCell align="right">IPTU (mensal)</TableCell>}
              {!colunasReduzidas && <TableCell align="right">Extras locatário</TableCell>}
              <TableCell align="right">Multa</TableCell>
              {!colunasReduzidas && <TableCell align="right">Taxa ADM</TableCell>}
              <TableCell align="right">Extras proprietário</TableCell>
              <TableCell align="right">A receber do locatário</TableCell>
              <TableCell align="right">A pagar ao proprietário</TableCell>
              {filtroPendencia && <TableCell>Pagamentos</TableCell>}
              {filtroReajuste && <TableCell>Revisão</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
          {locacoes.map((l) => {
            const reajuste = precisaReajuste(l.data_inicio_contrato)
            const revisado = reajusteJaRevisado(l.data_inicio_contrato, l.data_revisao_reajuste)
            const locatarioPagou = !!l.data_pagamento_locatario
            const proprietarioPago = !!l.data_pagamento_proprietario
            const pertoDoFim = l.ativo && contratoPertoDoFim(l.data_inicio_contrato, l.meses_contrato)
            const abrirCellSx = {
              cursor: 'pointer',
              transition: 'background-color 0.12s ease',
              '&:hover': { bgcolor: 'rgba(166,71,43,0.045)' },
            }
            return (
              <TableRow
                key={l.id}
                hover
                sx={{ '&:last-child td': { borderBottom: 0 } }}
              >
                <Tooltip title="Clique para ver detalhes do imóvel" placement="top-start" enterDelay={600}>
                  <TableCell sx={{ py: 1.25, ...abrirCellSx }} onClick={() => onOpen(l)}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box>
                        <Typography
                          sx={{ fontSize: '0.9rem', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                        >
                          {l.local || 'Sem endereço'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                          Apto {l.numero_ap || '—'}
                        </Typography>
                      </Box>
                      {l.predinho === 1 && (
                        <Chip label="PREDINHO" size="small" sx={{ bgcolor: brick, color: '#fff' }} />
                      )}
                    </Stack>
                  </TableCell>
                </Tooltip>
                <TableCell sx={{ fontSize: '0.85rem', ...abrirCellSx }} onClick={() => onOpen(l)}>
                  {l.nome_locatario || '—'}
                </TableCell>
                <TableCell sx={{ fontSize: '0.85rem', ...abrirCellSx }} onClick={() => onOpen(l)}>
                  {l.nome_proprietario || '—'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Chip
                    label={formatParcelaContrato(
                      calcularMesContratoAtual(l.data_inicio_contrato, l.meses_contrato),
                      l.meses_contrato,
                    )}
                    size="small"
                    sx={{
                      bgcolor: pertoDoFim ? rose : reajuste && !revisado ? amber : soft,
                      color: pertoDoFim || (reajuste && !revisado) ? '#fff' : inkSecondary,
                      '& .MuiChip-label': { fontSize: '0.85rem', px: 1.5, py: 0.5 },
                    }}
                  />
                </TableCell>
                {!colunasReduzidas && (
                  <TableCell align="right">
                    <EditableMoneyCell
                      value={l.valor_aluguel}
                      onCommit={(v) => onUpdateCampo(l, 'valor_aluguel', v)}
                    />
                  </TableCell>
                )}
                {!colunasReduzidas && (
                  <TableCell align="right">
                    <EditableMoneyCell
                      value={l.valor_condominio}
                      onCommit={(v) => onUpdateCampo(l, 'valor_condominio', v)}
                    />
                  </TableCell>
                )}
                {!colunasReduzidas && (
                  <TableCell align="right">
                    <EditableMoneyCell
                      value={valorParcelaIptu(l.valor_iptu)}
                      onCommit={(v) => onUpdateCampo(l, 'valor_iptu', Math.round(v * 10 * 100) / 100)}
                    />
                  </TableCell>
                )}
                {!colunasReduzidas && (
                  <TableCell align="right">
                    <EditableMoneyCell
                      value={l.valor_extras}
                      onCommit={(v) => onUpdateCampo(l, 'valor_extras', v)}
                    />
                  </TableCell>
                )}
                <TableCell align="right">
                  <EditableMoneyCell
                    value={l.valor_multa}
                    onCommit={(v) => onUpdateCampo(l, 'valor_multa', v)}
                  />
                </TableCell>
                {!colunasReduzidas && (
                  <TableCell align="right">
                    <EditableMoneyCell
                      value={l.valor_adm}
                      onCommit={(v) => onUpdateCampo(l, 'valor_adm', v)}
                    />
                  </TableCell>
                )}
                <TableCell align="right">
                  <EditableMoneyCell
                    value={l.valor_extra_proprietario}
                    onCommit={(v) => onUpdateCampo(l, 'valor_extra_proprietario', v)}
                  />
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.9rem', fontWeight: 700, ...abrirCellSx }}
                  onClick={() => onOpen(l)}
                >
                  {formatMoeda(valorAReceberLocatario(l))}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.9rem', fontWeight: 700, ...abrirCellSx }}
                  onClick={() => onOpen(l)}
                >
                  {formatMoeda(valorAPagarProprietario(l))}
                </TableCell>
                {filtroPendencia && (
                  <TableCell>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap">
                      <Tooltip
                        title={
                          locatarioPagou
                            ? `Recebido em ${formatData(l.data_pagamento_locatario)}`
                            : 'Marcar como recebido hoje'
                        }
                      >
                        <ToggleButton
                          value="locatario"
                          selected={locatarioPagou}
                          size="small"
                          onChange={() => onToggleLocatario(l)}
                          sx={toggleBtnSx}
                        >
                          {locatarioPagou ? (
                            <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          ) : (
                            <RadioButtonUncheckedIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          )}
                          Locatário pagou
                        </ToggleButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          proprietarioPago
                            ? `Pago em ${formatData(l.data_pagamento_proprietario)}`
                            : 'Marcar como pago hoje'
                        }
                      >
                        <ToggleButton
                          value="proprietario"
                          selected={proprietarioPago}
                          size="small"
                          onChange={() => onToggleProprietario(l)}
                          sx={toggleBtnSx}
                        >
                          {proprietarioPago ? (
                            <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          ) : (
                            <RadioButtonUncheckedIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                          )}
                          Paguei proprietário
                        </ToggleButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                )}
                {filtroReajuste && (
                  <TableCell>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                      {reajuste && !revisado && (
                        <Tooltip title="Contrato completou 12 meses — verificar reajuste">
                          <WarningAmberIcon fontSize="small" sx={{ color: amber }} />
                        </Tooltip>
                      )}
                      {reajuste && (
                        <Tooltip
                          title={
                            revisado
                              ? 'IPCA/IGP-M já revisado neste ciclo — clique para desmarcar'
                              : 'Marcar que o reajuste por IPCA/IGP-M já foi revisado'
                          }
                        >
                          <ToggleButton
                            value="reajuste"
                            selected={revisado}
                            size="small"
                            onChange={() => onToggleReajusteRevisado(l)}
                            sx={toggleBtnSx}
                          >
                            {revisado ? (
                              <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                            ) : (
                              <RadioButtonUncheckedIcon fontSize="small" sx={{ mr: 0.5, fontSize: '1rem' }} />
                            )}
                            IPCA/IGP-M revisado
                          </ToggleButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
