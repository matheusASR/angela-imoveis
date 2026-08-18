import { useMemo, useState } from 'react'
import {
  Paper,
  Stack,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TextField,
  Chip,
  Box,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import type { Locacao, Locatario } from '../types'

function imoveisDoLocatario(locatario: Locatario, locacoes: Locacao[]): string[] {
  const chave = locatario.nome.trim().toLowerCase()
  return locacoes
    .filter(
      (l) =>
        l.id_locatario === locatario.id ||
        (l.id_locatario == null && l.nome_locatario.trim().toLowerCase() === chave),
    )
    .map((l) => `${l.local || 'Sem endereço'}${l.numero_ap ? ' - Apto ' + l.numero_ap : ''}`)
}

function EditableCell({
  locatario,
  campo,
  placeholder,
  onSave,
  minWidth = 170,
}: {
  locatario: Locatario
  campo: keyof Pick<Locatario, 'telefone' | 'email'>
  placeholder: string
  onSave: (id: number, changes: Partial<Locatario>) => void
  minWidth?: number
}) {
  const [valor, setValor] = useState(locatario[campo])
  const [editando, setEditando] = useState(false)

  const commit = () => {
    setEditando(false)
    if (valor !== locatario[campo]) onSave(locatario.id, { [campo]: valor })
  }

  return (
    <TextField
      size="small"
      variant={editando ? 'outlined' : 'standard'}
      placeholder={placeholder}
      value={valor}
      onFocus={() => setEditando(true)}
      onChange={(e) => setValor(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
      InputProps={{ disableUnderline: !editando }}
      sx={{ minWidth }}
    />
  )
}

function NovoLocatarioDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (values: Omit<Locatario, 'id'>) => void
}) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [erro, setErro] = useState('')

  const handleClose = () => {
    setNome('')
    setTelefone('')
    setEmail('')
    setErro('')
    onClose()
  }

  const handleSave = () => {
    if (!nome.trim()) {
      setErro('Campo obrigatório')
      return
    }
    onSave({ nome, telefone, email })
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar locatário</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            label="Nome do locatário"
            fullWidth
            autoFocus
            value={nome}
            error={!!erro}
            helperText={erro}
            onChange={(e) => setNome(e.target.value)}
          />
          <TextField
            label="Telefone"
            fullWidth
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
          <TextField label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button size="large" onClick={handleClose}>
          Cancelar
        </Button>
        <Button size="large" variant="contained" onClick={handleSave}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function LocatariosTab({
  locacoes,
  locatarios,
  onAdd,
  onUpdate,
  onDelete,
}: {
  locacoes: Locacao[]
  locatarios: Locatario[]
  onAdd: (values: Omit<Locatario, 'id'>) => void
  onUpdate: (id: number, changes: Partial<Pick<Locatario, 'nome' | 'telefone' | 'email'>>) => void
  onDelete: (locatario: Locatario) => void
}) {
  const [novoOpen, setNovoOpen] = useState(false)

  const locatariosOrdenados = useMemo(
    () => [...locatarios].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [locatarios],
  )

  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '1.1rem' }}>
              <strong>{locatarios.length}</strong> locatário{locatarios.length === 1 ? '' : 's'}{' '}
              cadastrado{locatarios.length === 1 ? '' : 's'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Edite telefone e email diretamente na tabela. Locatários cadastrados aqui ficam
              disponíveis no select de locatário ao editar um imóvel — telefone e email são
              preenchidos automaticamente lá e só podem ser editados aqui.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNovoOpen(true)}>
            Adicionar locatário
          </Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Locatário</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Imóveis</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locatariosOrdenados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Nenhum locatário cadastrado.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              locatariosOrdenados.map((loc) => {
                const imoveis = imoveisDoLocatario(loc, locacoes)
                return (
                  <TableRow key={loc.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{loc.nome}</TableCell>
                    <TableCell>
                      <EditableCell
                        locatario={loc}
                        campo="telefone"
                        placeholder="Adicionar telefone…"
                        onSave={onUpdate}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        locatario={loc}
                        campo="email"
                        placeholder="Adicionar email…"
                        onSave={onUpdate}
                        minWidth={200}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {imoveis.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        ) : (
                          imoveis.map((im, i) => (
                            <Chip key={i} label={im} size="small" variant="outlined" />
                          ))
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Excluir locatário">
                        <IconButton size="small" onClick={() => onDelete(loc)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <NovoLocatarioDialog open={novoOpen} onClose={() => setNovoOpen(false)} onSave={onAdd} />
    </Stack>
  )
}
