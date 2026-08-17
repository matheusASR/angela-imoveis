import { useEffect, useMemo, useState } from 'react'
import {
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Box,
  CircularProgress,
} from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import type { Locacao } from '../types'
import {
  MESES_PT,
  calcularMesContratoAtual,
  formatMoeda,
  formatParcelaContrato,
  formatParcelaIptu,
  parcelaIptuParaMes,
  valorAPagarProprietario,
} from '../calc'
import { fetchLocacoesPorMes } from '../storage'

// Colunas essenciais para o relatório mensal (fins de conferência e repasse).
type LinhaRelatorio = {
  imovel: string
  proprietario: string
  telefone: string
  locatario: string
  tempoContrato: string
  aluguel: number
  condominio: number
  parcelaIptuLabel: string
  valorIptu: number
  extras: number
  multa: number
  taxaAdm: number
  extraProprietario: number
  valorPagar: number
}

function montarLinhas(locacoes: Locacao[], mes: number): LinhaRelatorio[] {
  const parcela = parcelaIptuParaMes(mes)
  return locacoes.map((l) => ({
    imovel: `${l.local || 'Sem endereço'}${l.numero_ap ? ' - Apto ' + l.numero_ap : ''}`,
    proprietario: l.nome_proprietario || '—',
    telefone: l.telefone_proprietario || '—',
    locatario: l.nome_locatario || '—',
    tempoContrato: formatParcelaContrato(
      calcularMesContratoAtual(l.data_inicio_contrato, l.meses_contrato),
      l.meses_contrato,
    ),
    aluguel: l.valor_aluguel,
    condominio: l.pagamento_condominio === 'adm' ? l.valor_condominio : 0,
    parcelaIptuLabel: formatParcelaIptu(parcela),
    valorIptu: l.pagamento_iptu === 'adm' ? l.valor_iptu / 10 : 0,
    extras: l.pagamento_extras === 'adm' ? l.valor_extras : 0,
    multa: l.valor_multa,
    taxaAdm: l.valor_adm,
    extraProprietario: l.valor_extra_proprietario,
    valorPagar: valorAPagarProprietario(l),
  }))
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function ReportsTab() {
  const hoje = new Date()
  const [mesAno, setMesAno] = useState(
    `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`,
  )
  const [somenteAtivos, setSomenteAtivos] = useState(true)

  const [ano, mesNum] = mesAno.split('-').map(Number)
  const nomeMes = MESES_PT[(mesNum || 1) - 1] ?? ''

  // Cada mês do relatório busca sua própria linha histórica (mes_referencia)
  // direto no Supabase — os dados de um mês passado não vêm mais dos
  // valores "ao vivo" do estado global do app, e sim da linha gravada
  // naquele mês pela virada mensal.
  const [locacoesMes, setLocacoesMes] = useState<Locacao[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let cancelado = false
    setCarregando(true)
    fetchLocacoesPorMes(mesAno)
      .then((data) => {
        if (!cancelado) setLocacoesMes(data)
      })
      .catch(() => {
        if (!cancelado) setLocacoesMes([])
      })
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [mesAno])

  const base = useMemo(
    () => (somenteAtivos ? locacoesMes.filter((l) => l.ativo) : locacoesMes),
    [locacoesMes, somenteAtivos],
  )

  const linhas = useMemo(() => montarLinhas(base, mesNum || hoje.getMonth() + 1), [base, mesNum])

  const totais = useMemo(
    () => ({
      aluguel: linhas.reduce((s, l) => s + l.aluguel, 0),
      condominio: linhas.reduce((s, l) => s + l.condominio, 0),
      valorIptu: linhas.reduce((s, l) => s + l.valorIptu, 0),
      extras: linhas.reduce((s, l) => s + l.extras, 0),
      multa: linhas.reduce((s, l) => s + l.multa, 0),
      taxaAdm: linhas.reduce((s, l) => s + l.taxaAdm, 0),
      extraProprietario: linhas.reduce((s, l) => s + l.extraProprietario, 0),
      valorPagar: linhas.reduce((s, l) => s + l.valorPagar, 0),
    }),
    [linhas],
  )
  const totalPagar = totais.valorPagar

  const tituloRelatorio = `Relatório ${nomeMes}/${ano}`

  const handleExportarHtml = () => {
    if (linhas.length === 0) return
    const linhasHtml = linhas
      .map(
        (l) => `
      <tr>
        <td>${escapeHtml(l.imovel)}</td>
        <td>${escapeHtml(l.proprietario)}</td>
        <td>${escapeHtml(l.telefone)}</td>
        <td>${escapeHtml(l.locatario)}</td>
        <td>${escapeHtml(l.tempoContrato)}</td>
        <td class="num">${formatMoeda(l.aluguel)}</td>
        <td class="num">${formatMoeda(l.condominio)}</td>
        <td class="num">${l.parcelaIptuLabel} · ${formatMoeda(l.valorIptu)}</td>
        <td class="num">${formatMoeda(l.extras)}</td>
        <td class="num">${formatMoeda(l.multa)}</td>
        <td class="num">${formatMoeda(l.taxaAdm)}</td>
        <td class="num">${formatMoeda(l.extraProprietario)}</td>
        <td class="num total">${formatMoeda(l.valorPagar)}</td>
      </tr>`,
      )
      .join('')

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(tituloRelatorio)}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #1E2A24; padding: 24px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  p.subtitulo { color: #5B6660; margin-top: 0; margin-bottom: 20px; }
  table { border-collapse: collapse; width: 100%; font-size: 12px; }
  th, td { border: 1px solid #E1D9C8; padding: 6px 8px; text-align: left; }
  th { background: #F3EFE6; text-transform: uppercase; font-size: 10px; letter-spacing: 0.04em; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  td.total { font-weight: bold; }
  tfoot td { font-weight: bold; border-top: 2px solid #1E2A24; }
</style>
</head>
<body>
  <h1>Angela Imóveis — ${escapeHtml(tituloRelatorio)}</h1>
  <p class="subtitulo">${linhas.length} imóve${linhas.length === 1 ? 'l' : 'is'}${somenteAtivos ? ' ativo(s)' : ''} — gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
  <table>
    <thead>
      <tr>
        <th>Imóvel</th><th>Proprietário</th><th>Telefone</th><th>Locatário</th><th>Tempo de contrato</th>
        <th>Aluguel</th><th>Condomínio</th><th>IPTU</th><th>Extras</th>
        <th>Multa</th><th>Taxa ADM</th><th>Extra Prop.</th><th>A pagar ao proprietário</th>
      </tr>
    </thead>
    <tbody>${linhasHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="5">Total</td>
        <td class="num">${formatMoeda(totais.aluguel)}</td>
        <td class="num">${formatMoeda(totais.condominio)}</td>
        <td class="num">${formatMoeda(totais.valorIptu)}</td>
        <td class="num">${formatMoeda(totais.extras)}</td>
        <td class="num">${formatMoeda(totais.multa)}</td>
        <td class="num">${formatMoeda(totais.taxaAdm)}</td>
        <td class="num">${formatMoeda(totais.extraProprietario)}</td>
        <td class="num">${formatMoeda(totalPagar)}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${ano}-${String(mesNum).padStart(2, '0')}.html`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const handleExportarPdf = async () => {
    if (linhas.length === 0) return
    const { jsPDF } = await import('jspdf')
    const { autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt' })
    doc.setFontSize(14)
    doc.text(`Angela Imóveis — ${tituloRelatorio}`, 32, 32)
    doc.setFontSize(9)
    doc.setTextColor(90)
    doc.text(
      `${linhas.length} imóve${linhas.length === 1 ? 'l' : 'is'}${somenteAtivos ? ' ativo(s)' : ''} — gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      32,
      48,
    )

    autoTable(doc, {
      startY: 62,
      head: [
        [
          'Imóvel', 'Proprietário', 'Telefone', 'Locatário', 'Tempo de contrato',
          'Aluguel', 'Condomínio', 'IPTU', 'Extras',
          'Multa', 'Taxa ADM', 'Extra Prop.', 'A pagar',
        ],
      ],
      body: linhas.map((l) => [
        l.imovel,
        l.proprietario,
        l.telefone,
        l.locatario,
        l.tempoContrato,
        formatMoeda(l.aluguel),
        formatMoeda(l.condominio),
        `${l.parcelaIptuLabel} · ${formatMoeda(l.valorIptu)}`,
        formatMoeda(l.extras),
        formatMoeda(l.multa),
        formatMoeda(l.taxaAdm),
        formatMoeda(l.extraProprietario),
        formatMoeda(l.valorPagar),
      ]),
      foot: [
        [
          'Total', '', '', '', '',
          formatMoeda(totais.aluguel),
          formatMoeda(totais.condominio),
          formatMoeda(totais.valorIptu),
          formatMoeda(totais.extras),
          formatMoeda(totais.multa),
          formatMoeda(totais.taxaAdm),
          formatMoeda(totais.extraProprietario),
          formatMoeda(totalPagar),
        ],
      ],
      showFoot: 'lastPage',
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [166, 71, 43] },
      footStyles: { fillColor: [243, 239, 230], textColor: [30, 42, 36] },
    })

    doc.save(`relatorio-${ano}-${String(mesNum).padStart(2, '0')}.pdf`)
  }

  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Typography variant="overline" color="text.secondary">
            Relatório por mês
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField
              label="Mês do relatório"
              type="month"
              size="small"
              value={mesAno}
              onChange={(e) => setMesAno(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: 220 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={somenteAtivos}
                  onChange={(e) => setSomenteAtivos(e.target.checked)}
                />
              }
              label="Somente contratos ativos"
            />
            <Box sx={{ flex: 1 }} />
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={handleExportarHtml}
              disabled={carregando || linhas.length === 0}
            >
              Exportar HTML
            </Button>
            <Button
              variant="contained"
              startIcon={<PictureAsPdfOutlinedIcon />}
              onClick={handleExportarPdf}
              disabled={carregando || linhas.length === 0}
            >
              Exportar PDF
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Os valores exibidos são os registrados naquela competência ({nomeMes}/{ano}) — a foto do
            imóvel gravada quando o mês virou, não os dados atuais. A parcela de IPTU também é a
            referente a esse mês.
          </Typography>
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Imóvel</TableCell>
              <TableCell>Proprietário</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Locatário</TableCell>
              <TableCell>Tempo de contrato</TableCell>
              <TableCell align="right">Aluguel</TableCell>
              <TableCell align="right">Condomínio</TableCell>
              <TableCell align="right">IPTU</TableCell>
              <TableCell align="right">Extras</TableCell>
              <TableCell align="right">Multa</TableCell>
              <TableCell align="right">Taxa ADM</TableCell>
              <TableCell align="right">Extra Prop.</TableCell>
              <TableCell align="right">A pagar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carregando ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : linhas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhum registro para {nomeMes}/{ano} com este filtro.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              linhas.map((l, i) => (
                <TableRow key={i} hover>
                  <TableCell>{l.imovel}</TableCell>
                  <TableCell>{l.proprietario}</TableCell>
                  <TableCell>{l.telefone}</TableCell>
                  <TableCell>{l.locatario}</TableCell>
                  <TableCell>{l.tempoContrato}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {formatMoeda(l.aluguel)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {formatMoeda(l.condominio)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {l.parcelaIptuLabel} · {formatMoeda(l.valorIptu)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {formatMoeda(l.extras)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {formatMoeda(l.multa)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {formatMoeda(l.taxaAdm)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    {formatMoeda(l.extraProprietario)}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                  >
                    {formatMoeda(l.valorPagar)}
                  </TableCell>
                </TableRow>
              ))
            )}
            {linhas.length > 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ fontWeight: 700 }}>
                  Total
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                >
                  {formatMoeda(totais.aluguel)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                >
                  {formatMoeda(totais.condominio)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                >
                  {formatMoeda(totais.valorIptu)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                >
                  {formatMoeda(totais.extras)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                >
                  {formatMoeda(totais.multa)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                >
                  {formatMoeda(totais.taxaAdm)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                >
                  {formatMoeda(totais.extraProprietario)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700 }}
                >
                  {formatMoeda(totalPagar)}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
