import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Alert,
} from '@mui/material'
import type { Cliente } from '../types'

export interface NovoImovelValues {
  local: string
  numero_ap: string
  id_proprietario: number
  nome_proprietario: string
  telefone_proprietario: string
}

const emptyValues = { local: '', numero_ap: '', id_proprietario: '' as number | '' }

export default function NovoImovelDialog({
  open,
  clientes,
  onClose,
  onSave,
}: {
  open: boolean
  clientes: Cliente[]
  onClose: () => void
  onSave: (values: NovoImovelValues) => void
}) {
  const [values, setValues] = useState(emptyValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setValues(emptyValues)
      setErrors({})
    }
  }, [open])

  const handleSave = () => {
    const errs: Record<string, string> = {}
    if (!values.local.trim()) errs.local = 'Preencha este campo'
    if (!values.numero_ap.trim()) errs.numero_ap = 'Preencha este campo'
    if (values.id_proprietario === '') errs.id_proprietario = 'Selecione um cliente'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    const cliente = clientes.find((c) => c.id === values.id_proprietario)
    onSave({
      local: values.local,
      numero_ap: values.numero_ap,
      id_proprietario: values.id_proprietario as number,
      nome_proprietario: cliente?.nome ?? '',
      telefone_proprietario: cliente?.telefone ?? '',
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.5rem' }}>
        Adicionar imóvel
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2.5, color: 'text.secondary' }}>
          Preencha só o básico agora. Os outros dados (aluguel, contrato, banco etc.) você
          adiciona depois, abrindo o imóvel.
        </Typography>
        <Stack spacing={2.5}>
          <TextField
            label="Local (endereço do imóvel)"
            fullWidth
            autoFocus
            value={values.local}
            error={!!errors.local}
            helperText={errors.local}
            onChange={(e) => setValues((v) => ({ ...v, local: e.target.value }))}
          />
          <TextField
            label="Número do apartamento"
            fullWidth
            value={values.numero_ap}
            error={!!errors.numero_ap}
            helperText={errors.numero_ap}
            onChange={(e) => setValues((v) => ({ ...v, numero_ap: e.target.value }))}
          />
          {clientes.length === 0 ? (
            <Alert severity="warning" variant="outlined">
              Nenhum cliente cadastrado ainda. Cadastre o proprietário na aba "Clientes" antes de
              adicionar o imóvel.
            </Alert>
          ) : (
            <TextField
              select
              label="Proprietário"
              fullWidth
              value={values.id_proprietario}
              error={!!errors.id_proprietario}
              helperText={errors.id_proprietario}
              onChange={(e) => setValues((v) => ({ ...v, id_proprietario: Number(e.target.value) }))}
            >
              {clientes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.nome}
                  {c.telefone ? ` — ${c.telefone}` : ''}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button size="large" onClick={onClose}>
          Cancelar
        </Button>
        <Button size="large" variant="contained" onClick={handleSave} disabled={clientes.length === 0}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
