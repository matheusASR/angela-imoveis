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
import type { Cliente, Locacao } from '../types'

function imoveisDoCliente(cliente: Cliente, locacoes: Locacao[]): string[] {
  const chave = cliente.nome.trim().toLowerCase()
  return locacoes
    .filter(
      (l) =>
        l.id_proprietario === cliente.id ||
        (l.id_proprietario == null && l.nome_proprietario.trim().toLowerCase() === chave),
    )
    .map((l) => `${l.local || 'Sem endereço'}${l.numero_ap ? ' - Apto ' + l.numero_ap : ''}`)
}

function TelefoneCell({
  cliente,
  onSave,
}: {
  cliente: Cliente
  onSave: (id: number, telefone: string) => void
}) {
  const [valor, setValor] = useState(cliente.telefone)
  const [editando, setEditando] = useState(false)

  const commit = () => {
    setEditando(false)
    if (valor !== cliente.telefone) onSave(cliente.id, valor)
  }

  return (
    <TextField
      size="small"
      variant={editando ? 'outlined' : 'standard'}
      placeholder="Adicionar telefone…"
      value={valor}
      onFocus={() => setEditando(true)}
      onChange={(e) => setValor(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
      }}
      InputProps={{ disableUnderline: !editando }}
      sx={{ minWidth: 170 }}
    />
  )
}

function NovoClienteDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (nome: string, telefone: string) => void
}) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')

  const handleClose = () => {
    setNome('')
    setTelefone('')
    setErro('')
    onClose()
  }

  const handleSave = () => {
    if (!nome.trim()) {
      setErro('Campo obrigatório')
      return
    }
    onSave(nome, telefone)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.5rem' }}>
        Adicionar cliente
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <TextField
            label="Nome do proprietário"
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

export default function ClientesTab({
  locacoes,
  clientes,
  onAdd,
  onUpdate,
  onDelete,
}: {
  locacoes: Locacao[]
  clientes: Cliente[]
  onAdd: (nome: string, telefone: string) => void
  onUpdate: (id: number, changes: Partial<Pick<Cliente, 'nome' | 'telefone'>>) => void
  onDelete: (cliente: Cliente) => void
}) {
  const [novoOpen, setNovoOpen] = useState(false)

  const clientesOrdenados = useMemo(
    () => [...clientes].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [clientes],
  )

  return (
    <Stack spacing={2.5}>
      <Paper variant="outlined" sx={{ p: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: '1.1rem' }}>
              <strong>{clientes.length}</strong> cliente{clientes.length === 1 ? '' : 's'} cadastrado
              {clientes.length === 1 ? '' : 's'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Edite o telefone diretamente na tabela. Clientes cadastrados aqui ficam disponíveis no
              select de proprietário ao criar ou editar um imóvel.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNovoOpen(true)}>
            Adicionar cliente
          </Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Proprietário</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Imóveis</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesOrdenados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Nenhum cliente cadastrado.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              clientesOrdenados.map((c) => {
                const imoveis = imoveisDoCliente(c, locacoes)
                return (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{c.nome}</TableCell>
                    <TableCell>
                      <TelefoneCell
                        cliente={c}
                        onSave={(id, telefone) => onUpdate(id, { telefone })}
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
                      <Tooltip title="Excluir cliente">
                        <IconButton size="small" onClick={() => onDelete(c)}>
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

      <NovoClienteDialog open={novoOpen} onClose={() => setNovoOpen(false)} onSave={onAdd} />
    </Stack>
  )
}
