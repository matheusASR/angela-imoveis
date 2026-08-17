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

function EditableCell({
  cliente,
  campo,
  placeholder,
  onSave,
  minWidth = 170,
}: {
  cliente: Cliente
  campo: keyof Pick<Cliente, 'telefone' | 'banco' | 'agencia' | 'conta_corrente'>
  placeholder: string
  onSave: (id: number, changes: Partial<Cliente>) => void
  minWidth?: number
}) {
  const [valor, setValor] = useState(cliente[campo])
  const [editando, setEditando] = useState(false)

  const commit = () => {
    setEditando(false)
    if (valor !== cliente[campo]) onSave(cliente.id, { [campo]: valor })
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

function NovoClienteDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (values: Omit<Cliente, 'id'>) => void
}) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [banco, setBanco] = useState('')
  const [agencia, setAgencia] = useState('')
  const [contaCorrente, setContaCorrente] = useState('')
  const [erro, setErro] = useState('')

  const handleClose = () => {
    setNome('')
    setTelefone('')
    setBanco('')
    setAgencia('')
    setContaCorrente('')
    setErro('')
    onClose()
  }

  const handleSave = () => {
    if (!nome.trim()) {
      setErro('Campo obrigatório')
      return
    }
    onSave({
      nome,
      telefone,
      banco,
      agencia,
      conta_corrente: contaCorrente,
    })
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Adicionar cliente</DialogTitle>
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
          <TextField
            label="Banco"
            fullWidth
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
          />
          <TextField
            label="Agência"
            fullWidth
            value={agencia}
            onChange={(e) => setAgencia(e.target.value)}
          />
          <TextField
            label="Conta corrente"
            fullWidth
            value={contaCorrente}
            onChange={(e) => setContaCorrente(e.target.value)}
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
  onAdd: (values: Omit<Cliente, 'id'>) => void
  onUpdate: (
    id: number,
    changes: Partial<Pick<Cliente, 'nome' | 'telefone' | 'banco' | 'agencia' | 'conta_corrente'>>,
  ) => void
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
              Edite telefone, banco, agência e conta corrente diretamente na tabela. Clientes
              cadastrados aqui ficam disponíveis no select de proprietário ao criar ou editar um
              imóvel — os dados bancários são preenchidos automaticamente lá e só podem ser
              editados aqui.
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
              <TableCell>Banco</TableCell>
              <TableCell>Agência</TableCell>
              <TableCell>Conta corrente</TableCell>
              <TableCell>Imóveis</TableCell>
              <TableCell align="right"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesOrdenados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                      <EditableCell
                        cliente={c}
                        campo="telefone"
                        placeholder="Adicionar telefone…"
                        onSave={onUpdate}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        cliente={c}
                        campo="banco"
                        placeholder="Adicionar banco…"
                        onSave={onUpdate}
                        minWidth={120}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        cliente={c}
                        campo="agencia"
                        placeholder="Adicionar agência…"
                        onSave={onUpdate}
                        minWidth={110}
                      />
                    </TableCell>
                    <TableCell>
                      <EditableCell
                        cliente={c}
                        campo="conta_corrente"
                        placeholder="Adicionar conta…"
                        onSave={onUpdate}
                        minWidth={130}
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
