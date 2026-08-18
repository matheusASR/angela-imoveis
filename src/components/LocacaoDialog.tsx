import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Stack,
  Divider,
  Typography,
  FormControlLabel,
  Switch,
  Alert,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
} from '@mui/material'
import type { Cliente, FormaPagamento, Locacao, Locatario } from '../types'
import { MEIOS_PAGAMENTO } from '../types'
import {
  calcValorAdm,
  calcularMesContratoAtual,
  formatData,
  formatMoeda,
  formatParcelaContrato,
  formatParcelaIptu,
  hojeISO,
  parcelaIptuAtualPadrao,
  precisaReajuste,
  reajusteJaRevisado,
  valorAPagarProprietario,
  valorParcelaIptu,
} from '../calc'

export default function LocacaoDialog({
  open,
  locacao,
  clientes,
  locatarios,
  onClose,
  onSave,
}: {
  open: boolean
  locacao: Locacao | null
  clientes: Cliente[]
  locatarios: Locatario[]
  onClose: () => void
  onSave: (l: Locacao) => void
}) {
  const [form, setForm] = useState<Locacao | null>(locacao)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setForm(locacao)
    setErrors({})
  }, [locacao, open])

  if (!form) return null

  const update = (field: keyof Locacao, value: any) => {
    setForm((prev) => {
      if (!prev) return prev
      const next = { ...prev, [field]: value }
      if (field === 'valor_aluguel' || field === 'valor_multa' || field === 'predinho') {
        next.valor_adm = calcValorAdm(next.valor_aluguel, next.valor_multa, next.predinho)
      }
      // O mês atual do contrato é recalculado automaticamente sempre que a
      // data de início ou a quantidade de meses do contrato mudarem.
      if (field === 'data_inicio_contrato' || field === 'meses_contrato') {
        next.mes_contrato_atual = calcularMesContratoAtual(next.data_inicio_contrato, next.meses_contrato)
      }
      return next
    })
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.local.trim()) errs.local = 'Campo obrigatório'
    if (!form.numero_ap.trim()) errs.numero_ap = 'Campo obrigatório'
    if (!form.nome_proprietario.trim()) errs.nome_proprietario = 'Campo obrigatório'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    onSave(form)
  }

  const numField = (
    label: string,
    field: keyof Locacao,
    opts?: { adornment?: string; disabled?: boolean },
  ) => (
    <TextField
      label={label}
      type="number"
      fullWidth
      size="small"
      value={form[field] as number}
      disabled={opts?.disabled}
      onFocus={(e) => e.target.select()}
      onChange={(e) => update(field, e.target.value === '' ? 0 : Number(e.target.value))}
      InputProps={{
        startAdornment: opts?.adornment ? (
          <InputAdornment position="start">{opts.adornment}</InputAdornment>
        ) : undefined,
        inputProps: { min: 0 },
      }}
    />
  )

  const txtField = (label: string, field: keyof Locacao, required = false) => (
    <TextField
      label={label}
      fullWidth
      size="small"
      required={required}
      value={form[field] as string}
      error={!!errors[field as string]}
      helperText={errors[field as string]}
      onChange={(e) => update(field, e.target.value)}
    />
  )

  const dateField = (label: string, field: keyof Locacao) => (
    <TextField
      label={label}
      type="date"
      fullWidth
      size="small"
      InputLabelProps={{ shrink: true }}
      value={form[field] as string}
      onChange={(e) => update(field, e.target.value)}
    />
  )

  const formaPagamentoField = (label: string, field: keyof Locacao) => (
    <Stack spacing={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <ToggleButtonGroup
        size="small"
        exclusive
        fullWidth
        value={form[field] as FormaPagamento}
        onChange={(_, v: FormaPagamento | null) => v && update(field, v)}
      >
        <ToggleButton value="inquilino" sx={{ textTransform: 'none' }}>
          Direto pelo inquilino
        </ToggleButton>
        <ToggleButton value="adm" sx={{ textTransform: 'none' }}>
          Pela ADM
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )

  const title = form.local ? form.local : 'Detalhes do imóvel'

  const alertaReajuste = precisaReajuste(form.data_inicio_contrato)
  const revisado = reajusteJaRevisado(form.data_inicio_contrato, form.data_revisao_reajuste)
  // A parcela do IPTU é sempre calculada a partir do calendário atual (ver
  // calc.ts) — não depende de contador manual, então nunca desalinha.
  const parcelaIptuAtual = parcelaIptuAtualPadrao()
  const parcelaIptuLabel = formatParcelaIptu(parcelaIptuAtual)
  const mostrarValorParcelaIptu = parcelaIptuLabel !== '10/10'
  const valorPagarProprietario = valorAPagarProprietario(form)

  const toggleRevisado = () => {
    update('data_revisao_reajuste', form.data_revisao_reajuste ? '' : hojeISO())
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {alertaReajuste && !revisado && (
            <Alert severity="warning" variant="outlined">
              ⚠ Contrato completou 12 meses. Verificar reajuste por IPCA ou IGP-M.
            </Alert>
          )}
          {alertaReajuste && revisado && (
            <Alert severity="success" variant="outlined">
              ✓ Reajuste por IPCA/IGP-M já revisado em {formatData(form.data_revisao_reajuste)} neste ciclo.
            </Alert>
          )}

          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              Imóvel
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={5}>
                {txtField('Local (imóvel)', 'local', true)}
              </Grid>
              <Grid item xs={12} sm={3}>
                {txtField('Número do apartamento', 'numero_ap', true)}
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  sx={{ mt: 0.5 }}
                  control={
                    <Switch
                      checked={form.predinho === 1}
                      onChange={(e) => update('predinho', e.target.checked ? 1 : 0)}
                    />
                  }
                  label="Categoria PREDINHO"
                />
              </Grid>
            </Grid>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              Locatário e pagamento
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={5}>
                <TextField
                  select
                  label="Locatário"
                  fullWidth
                  size="small"
                  value={form.id_locatario ?? ''}
                  onChange={(e) => {
                    const id = e.target.value === '' ? null : Number(e.target.value)
                    const locatario = locatarios.find((loc) => loc.id === id)
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            id_locatario: id,
                            nome_locatario: locatario?.nome ?? '',
                            telefone_locatario: locatario?.telefone ?? '',
                            email_locatario: locatario?.email ?? '',
                          }
                        : prev,
                    )
                  }}
                >
                  <MenuItem value="">
                    <em>—</em>
                  </MenuItem>
                  {form.id_locatario != null &&
                    !locatarios.some((loc) => loc.id === form.id_locatario) && (
                      <MenuItem value={form.id_locatario}>{form.nome_locatario} (não cadastrado)</MenuItem>
                    )}
                  {locatarios.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  select
                  label="Meio de pagamento"
                  fullWidth
                  size="small"
                  value={form.meio_pagamento}
                  onChange={(e) => update('meio_pagamento', e.target.value)}
                >
                  <MenuItem value="">
                    <em>—</em>
                  </MenuItem>
                  {MEIOS_PAGAMENTO.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                {txtField('Dia de vencimento', 'dia_vencimento')}
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone do locatário"
                  fullWidth
                  size="small"
                  disabled
                  value={form.telefone_locatario || 'Sem telefone cadastrado'}
                  helperText="Editável na aba Locatários"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email do locatário"
                  fullWidth
                  size="small"
                  disabled
                  value={form.email_locatario || 'Sem email cadastrado'}
                  helperText="Editável na aba Locatários"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {dateField('Data de pagamento (locatário)', 'data_pagamento_locatario')}
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary">
              Dica: use os botões "Locatário pagou" na lista de imóveis para marcar o pagamento com um
              clique — a data é preenchida sozinha.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              Valores — Aluguel e administração
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={6} sm={4}>
                {numField('Valor do aluguel', 'valor_aluguel', { adornment: 'R$' })}
              </Grid>
              <Grid item xs={6} sm={4}>
                {numField('Valor da multa', 'valor_multa', { adornment: 'R$' })}
              </Grid>
              <Grid item xs={6} sm={4}>
                {numField('Valor da administração', 'valor_adm', { adornment: 'R$' })}
                <Typography variant="caption" color="text.secondary">
                  {`Calculado automaticamente (${form.predinho === 1 ? '7%' : '8%'} sobre aluguel + multa) — pode ser editado manualmente.`}
                </Typography>
              </Grid>
            </Grid>
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="overline" color="text.secondary">
              Valores do inquilino
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                {numField('Condomínio', 'valor_condominio', { adornment: 'R$' })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {formaPagamentoField('Condomínio pago', 'pagamento_condominio')}
              </Grid>

              <Grid item xs={12} sm={6}>
                {numField('IPTU (valor anual)', 'valor_iptu', { adornment: 'R$' })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {formaPagamentoField('IPTU pago', 'pagamento_iptu')}
              </Grid>

              <Grid item xs={12} sm={mostrarValorParcelaIptu ? 6 : 12}>
                <TextField
                  label="Parcela do IPTU (automático)"
                  fullWidth
                  size="small"
                  value={parcelaIptuLabel}
                  disabled
                  helperText="Calculado pelo mês atual — sempre 10 parcelas: 1/10 em fevereiro até 10/10 em novembro"
                />
              </Grid>
              {mostrarValorParcelaIptu && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Valor da parcela do IPTU"
                    fullWidth
                    size="small"
                    value={formatMoeda(valorParcelaIptu(form.valor_iptu))}
                    disabled
                    helperText="IPTU anual ÷ 10"
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                {numField('Benefícios do inquilino (extras)', 'valor_extras', { adornment: 'R$' })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {formaPagamentoField('Extras pagos', 'pagamento_extras')}
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary">
              Quando marcados como "Direto pelo inquilino", esses valores não entram no cálculo do
              repasse ao proprietário. A Multa (acima) sempre entra na soma quando houver.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              Proprietário
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Proprietário"
                  fullWidth
                  size="small"
                  required
                  value={form.id_proprietario ?? ''}
                  error={!!errors.nome_proprietario}
                  helperText={errors.nome_proprietario}
                  onChange={(e) => {
                    const id = Number(e.target.value)
                    const cliente = clientes.find((c) => c.id === id)
                    setForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            id_proprietario: id,
                            nome_proprietario: cliente?.nome ?? '',
                            telefone_proprietario: cliente?.telefone ?? '',
                            banco_proprietario: cliente?.banco ?? '',
                            agencia_proprietario: cliente?.agencia ?? '',
                            conta_corrente_proprietario: cliente?.conta_corrente ?? '',
                            chave_pix_proprietario: cliente?.chave_pix ?? '',
                          }
                        : prev,
                    )
                  }}
                >
                  {form.id_proprietario != null &&
                    !clientes.some((c) => c.id === form.id_proprietario) && (
                      <MenuItem value={form.id_proprietario}>{form.nome_proprietario} (não cadastrado)</MenuItem>
                    )}
                  {clientes.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefone do proprietário"
                  fullWidth
                  size="small"
                  disabled
                  value={form.telefone_proprietario || 'Sem telefone cadastrado'}
                  helperText="Editável na aba Proprietários"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Banco"
                  fullWidth
                  size="small"
                  disabled
                  value={form.banco_proprietario || '—'}
                  helperText="Editável na aba Proprietários"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Agência"
                  fullWidth
                  size="small"
                  disabled
                  value={form.agencia_proprietario || '—'}
                  helperText="Editável na aba Proprietários"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Conta corrente"
                  fullWidth
                  size="small"
                  disabled
                  value={form.conta_corrente_proprietario || '—'}
                  helperText="Editável na aba Proprietários"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Chave PIX"
                  fullWidth
                  size="small"
                  disabled
                  value={form.chave_pix_proprietario || '—'}
                  helperText="Editável na aba Proprietários"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                {numField('Extra do proprietário', 'valor_extra_proprietario', { adornment: 'R$' })}
              </Grid>
              <Grid item xs={12} sm={6}>
                {dateField('Data de pagamento (proprietário)', 'data_pagamento_proprietario')}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Valor a pagar ao proprietário (automático)"
                  fullWidth
                  size="small"
                  value={formatMoeda(valorPagarProprietario)}
                  disabled
                  helperText="Aluguel + Condomínio + IPTU + Extras (quando pagos pela ADM) + Multa − Taxa ADM − Extra do proprietário"
                  InputProps={{
                    sx: { fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace' },
                  }}
                />
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary">
              Dica: use o botão "Paguei proprietário" na lista de imóveis para marcar com um clique.
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="overline" color="text.secondary">
              Contrato
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={4}>
                {dateField('Data de início do contrato', 'data_inicio_contrato')}
              </Grid>
              <Grid item xs={12} sm={4}>
                {numField('Meses de contrato', 'meses_contrato')}
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Parcela do contrato (automático)"
                  fullWidth
                  size="small"
                  value={formatParcelaContrato(
                    calcularMesContratoAtual(form.data_inicio_contrato, form.meses_contrato),
                    form.meses_contrato,
                  )}
                  disabled
                  helperText="Calculado a partir da data de início"
                />
              </Grid>
              {alertaReajuste && (
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant={revisado ? 'contained' : 'outlined'}
                    color={revisado ? 'success' : 'warning'}
                    onClick={toggleRevisado}
                    sx={{ height: '100%' }}
                  >
                    {revisado ? 'IPCA/IGP-M revisado ✓' : 'Marcar IPCA/IGP-M como revisado'}
                  </Button>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  label="Observações"
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  value={form.observacoes}
                  onChange={(e) => update('observacoes', e.target.value)}
                />
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button size="large" onClick={onClose}>
          Cancelar
        </Button>
        <Button size="large" variant="contained" onClick={handleSave}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
