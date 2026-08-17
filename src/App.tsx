import { useEffect, useMemo, useState } from 'react'
import {
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  Container,
  Stack,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'

import type { Cliente, FiltroTipo, Locacao } from './types'
import { novaLocacaoPadrao } from './types'
import {
  fetchAppData,
  insertLocacao,
  updateLocacao,
  deleteLocacao,
  insertCliente,
  updateCliente,
  deleteCliente,
  updateLocacoesByProprietario,
} from './storage'
import { aplicarReferenciaMensal, calcValorAdm, precisaReajuste, hojeISO } from './calc'
import { supabase } from './lib/supabaseClient'
import { useSession } from './hooks/useSession'
import { appBarShadow } from './theme'

import LoginScreen from './components/LoginScreen'
import HomeSummary from './components/HomeSummary'
import AppToolbar from './components/Toolbar'
import LocacaoTable from './components/LocacaoTable'
import LocacaoDialog from './components/LocacaoDialog'
import NovoImovelDialog, { type NovoImovelValues } from './components/NovoImovelDialog'
import ReportsTab from './components/ReportsTab'
import ClientesTab from './components/ClientesTab'
import SegmentedTabs from './components/SegmentedTabs'

type Aba = 'imoveis' | 'relatorios' | 'clientes'

export default function App() {
  const session = useSession()

  const [locacoes, setLocacoes] = useState<Locacao[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [query, setQuery] = useState('')
  const [filtro, setFiltro] = useState<FiltroTipo>('todos')
  const [aba, setAba] = useState<Aba>('imoveis')

  const [novoOpen, setNovoOpen] = useState(false)
  const [detalhesOpen, setDetalhesOpen] = useState(false)
  const [selected, setSelected] = useState<Locacao | null>(null)

  const [confirmDelete, setConfirmDelete] = useState<Locacao | null>(null)
  const [confirmDeleteCliente, setConfirmDeleteCliente] = useState<Cliente | null>(null)
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    msg: '',
    severity: 'success',
  })

  const showSnack = (msg: string, severity: 'success' | 'error' | 'info' = 'success') =>
    setSnack({ open: true, msg, severity })

  const showErro = (e: unknown) =>
    showSnack(e instanceof Error ? e.message : 'Ocorreu um erro ao falar com o servidor.', 'error')

  // Carrega os dados do Supabase assim que há sessão. Ao carregar, aplica a
  // virada de mês pendente: qualquer locação cuja competência não seja mais
  // a atual tem os pagamentos do ciclo anterior zerados (e persiste a
  // mudança de volta no banco).
  useEffect(() => {
    if (!session) return
    let cancelado = false
    setCarregando(true)
    fetchAppData()
      .then(async (data) => {
        if (cancelado) return
        const atualizadas = data.locacoes.map(aplicarReferenciaMensal)
        setLocacoes(atualizadas)
        setClientes(data.clientes)
        const mudaram = atualizadas.filter((l, i) => l !== data.locacoes[i])
        await Promise.all(
          mudaram.map((l) =>
            updateLocacao(l.id, {
              mes_referencia: l.mes_referencia,
              data_pagamento_locatario: l.data_pagamento_locatario,
              data_pagamento_proprietario: l.data_pagamento_proprietario,
            }),
          ),
        )
      })
      .catch(showErro)
      .finally(() => {
        if (!cancelado) setCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [session])

  // Enquanto o app fica aberto, verifica periodicamente se o mês virou (ex.:
  // sessão aberta durante a virada da meia-noite de fim de mês) para zerar
  // os pagamentos sem depender de um novo carregamento da página.
  useEffect(() => {
    if (!session) return
    const id = setInterval(() => {
      setLocacoes((prev) => {
        const atualizadas = prev.map(aplicarReferenciaMensal)
        const mudaram = atualizadas.filter((l, i) => l !== prev[i])
        if (mudaram.length > 0) {
          Promise.all(
            mudaram.map((l) =>
              updateLocacao(l.id, {
                mes_referencia: l.mes_referencia,
                data_pagamento_locatario: l.data_pagamento_locatario,
                data_pagamento_proprietario: l.data_pagamento_proprietario,
              }),
            ),
          ).catch(showErro)
        }
        return atualizadas
      })
    }, 30 * 60 * 1000)
    return () => clearInterval(id)
  }, [session])

  const filtered = useMemo(() => {
    let list = locacoes

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (l) =>
          l.nome_locatario.toLowerCase().includes(q) ||
          l.nome_proprietario.toLowerCase().includes(q) ||
          l.local.toLowerCase().includes(q) ||
          l.numero_ap.toLowerCase().includes(q),
      )
    }

    if (filtro === 'pendentes') {
      list = list.filter((l) => !l.data_pagamento_locatario || precisaReajuste(l.data_inicio_contrato))
    }

    if (filtro === 'predinho') {
      list = list.filter((l) => l.predinho === 1)
    }

    if (filtro === 'ativos') {
      list = list.filter((l) => l.ativo)
    }

    if (filtro === 'reajuste') {
      list = list.filter((l) => precisaReajuste(l.data_inicio_contrato))
    }

    return list
  }, [locacoes, query, filtro])

  const handleNovo = () => setNovoOpen(true)

  const handleSalvarNovo = async (values: NovoImovelValues) => {
    try {
      const novo = await insertLocacao({ ...novaLocacaoPadrao(), ...values })
      setLocacoes((prev) => [...prev, novo])
      setNovoOpen(false)
      showSnack('Imóvel adicionado.')
    } catch (e) {
      showErro(e)
    }
  }

  const handleOpen = (l: Locacao) => {
    setSelected(l)
    setDetalhesOpen(true)
  }

  const handleDeleteRequest = (l: Locacao) => setConfirmDelete(l)

  const handleToggleLocatario = async (l: Locacao) => {
    // Observação: a parcela do IPTU e o mês do contrato NÃO são mais
    // incrementados aqui. Antes, cada clique em "Locatário pagou" somava +1
    // manualmente, e desmarcar não desfazia a soma — então marcar/desmarcar
    // por engano (ou fora de ordem) fazia a parcela "andar" mais rápido que
    // o calendário real (ex.: aparecer 8/10 em agosto, quando o correto era
    // 7/10). Agora esses valores são sempre calculados a partir da data
    // atual (ver calc.ts), então não têm mais como desalinhar.
    const jaPagou = !!l.data_pagamento_locatario
    try {
      const atualizado = await updateLocacao(l.id, {
        data_pagamento_locatario: jaPagou ? '' : hojeISO(),
      })
      setLocacoes((prev) => prev.map((x) => (x.id === l.id ? atualizado : x)))
      showSnack(jaPagou ? 'Pagamento do locatário desmarcado.' : 'Locatário marcado como pago.', 'info')
    } catch (e) {
      showErro(e)
    }
  }

  const handleToggleReajusteRevisado = async (l: Locacao) => {
    const jaRevisado = !!l.data_revisao_reajuste
    try {
      const atualizado = await updateLocacao(l.id, {
        data_revisao_reajuste: jaRevisado ? '' : hojeISO(),
      })
      setLocacoes((prev) => prev.map((x) => (x.id === l.id ? atualizado : x)))
      showSnack(
        jaRevisado ? 'Revisão de IPCA/IGP-M desmarcada.' : 'Reajuste marcado como revisado.',
        'info',
      )
    } catch (e) {
      showErro(e)
    }
  }

  const handleAddCliente = async (nome: string, telefone: string) => {
    try {
      const novo = await insertCliente({ nome: nome.trim(), telefone: telefone.trim() })
      setClientes((prev) => [...prev, novo])
      showSnack('Cliente adicionado.')
    } catch (e) {
      showErro(e)
    }
  }

  const handleUpdateCliente = async (id: number, changes: Partial<Pick<Cliente, 'nome' | 'telefone'>>) => {
    try {
      const atualizado = await updateCliente(id, changes)
      setClientes((prev) => prev.map((c) => (c.id === id ? atualizado : c)))
      const locacoesAtualizadas = await updateLocacoesByProprietario(id, {
        nome_proprietario: atualizado.nome,
        telefone_proprietario: atualizado.telefone,
      })
      if (locacoesAtualizadas.length > 0) {
        const porId = new Map(locacoesAtualizadas.map((l) => [l.id, l]))
        setLocacoes((prev) => prev.map((l) => porId.get(l.id) ?? l))
      }
      showSnack('Cliente atualizado.')
    } catch (e) {
      showErro(e)
    }
  }

  const handleDeleteClienteRequest = (c: Cliente) => setConfirmDeleteCliente(c)

  const handleDeleteClienteConfirm = async () => {
    if (!confirmDeleteCliente) return
    try {
      await deleteCliente(confirmDeleteCliente.id)
      setClientes((prev) => prev.filter((c) => c.id !== confirmDeleteCliente.id))
      showSnack('Cliente excluído.', 'info')
    } catch (e) {
      showErro(e)
    } finally {
      setConfirmDeleteCliente(null)
    }
  }

  const handleToggleProprietario = async (l: Locacao) => {
    const jaPago = !!l.data_pagamento_proprietario
    try {
      const atualizado = await updateLocacao(l.id, {
        data_pagamento_proprietario: jaPago ? '' : hojeISO(),
      })
      setLocacoes((prev) => prev.map((x) => (x.id === l.id ? atualizado : x)))
      showSnack(jaPago ? 'Pagamento ao proprietário desmarcado.' : 'Proprietário marcado como pago.', 'info')
    } catch (e) {
      showErro(e)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return
    try {
      await deleteLocacao(confirmDelete.id)
      setLocacoes((prev) => prev.filter((l) => l.id !== confirmDelete.id))
      showSnack('Imóvel excluído.', 'info')
    } catch (e) {
      showErro(e)
    } finally {
      setConfirmDelete(null)
    }
  }

  const handleSave = async (l: Locacao) => {
    try {
      const { id, ...changes } = l
      const atualizado = await updateLocacao(id, changes)
      setLocacoes((prev) => prev.map((x) => (x.id === id ? atualizado : x)))
      showSnack('Imóvel atualizado.')
      setDetalhesOpen(false)
    } catch (e) {
      showErro(e)
    }
  }

  // Edição direta de campos contábeis na listagem de imóveis (sem abrir o
  // dialog). Mantém a mesma regra de recálculo automático da taxa ADM usada
  // no dialog: ao alterar aluguel ou multa, a taxa ADM é recalculada — mas
  // pode ser sobrescrita editando o próprio campo de taxa ADM em seguida.
  const handleUpdateCampo = async (l: Locacao, field: keyof Locacao, value: number) => {
    const changes: Partial<Locacao> = { [field]: value }
    if (field === 'valor_aluguel' || field === 'valor_multa') {
      const aluguel = field === 'valor_aluguel' ? value : l.valor_aluguel
      const multa = field === 'valor_multa' ? value : l.valor_multa
      changes.valor_adm = calcValorAdm(aluguel, multa, l.predinho)
    }
    try {
      const atualizado = await updateLocacao(l.id, changes)
      setLocacoes((prev) => prev.map((x) => (x.id === l.id ? atualizado : x)))
    } catch (e) {
      showErro(e)
    }
  }

  const handleSignOut = () => supabase.auth.signOut()

  if (session === undefined) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    )
  }

  if (!session) {
    return <LoginScreen />
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{ bgcolor: 'background.paper', boxShadow: appBarShadow }}
      >
        <MuiToolbar sx={{ py: 1, minHeight: '60px !important' }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                color: '#fff',
              }}
            >
              <HomeWorkOutlinedIcon sx={{ fontSize: '1.3rem' }} />
            </Box>
            <Typography
              sx={{
                fontFamily: '"Fraunces", serif',
                fontWeight: 600,
                fontSize: '1.3rem',
                letterSpacing: '-0.01em',
              }}
            >
              Angela Imóveis
            </Typography>
          </Stack>
          <Tooltip title={`Sair (${session.user.email})`}>
            <IconButton onClick={handleSignOut} size="small">
              <LogoutOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </MuiToolbar>
      </AppBar>

      {carregando ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            py: 10,
          }}
        >
          <CircularProgress size={28} />
          <Typography color="text.secondary" variant="body2">
            Carregando seus dados…
          </Typography>
        </Box>
      ) : (
        <Container maxWidth={false} sx={{ py: { xs: 2.5, md: 3.5 }, px: { xs: 2, sm: 3, md: 4.5 } }}>
          <Stack spacing={3}>
            <SegmentedTabs
              value={aba}
              onChange={setAba}
              options={[
                { value: 'imoveis', label: 'Imóveis' },
                { value: 'relatorios', label: 'Relatórios' },
                { value: 'clientes', label: 'Clientes' },
              ]}
            />

            {aba === 'imoveis' && (
              <Stack spacing={2}>
                <HomeSummary locacoes={locacoes} />

                <AppToolbar
                  query={query}
                  onQueryChange={setQuery}
                  filtro={filtro}
                  onFiltroChange={setFiltro}
                  onNovo={handleNovo}
                />

                <LocacaoTable
                  locacoes={filtered}
                  onOpen={handleOpen}
                  onDelete={handleDeleteRequest}
                  onToggleLocatario={handleToggleLocatario}
                  onToggleProprietario={handleToggleProprietario}
                  onToggleReajusteRevisado={handleToggleReajusteRevisado}
                  onUpdateCampo={handleUpdateCampo}
                />
              </Stack>
            )}

            {aba === 'relatorios' && <ReportsTab locacoes={locacoes} />}

            {aba === 'clientes' && (
              <ClientesTab
                locacoes={locacoes}
                clientes={clientes}
                onAdd={handleAddCliente}
                onUpdate={handleUpdateCliente}
                onDelete={handleDeleteClienteRequest}
              />
            )}
          </Stack>
        </Container>
      )}

      <NovoImovelDialog
        open={novoOpen}
        clientes={clientes}
        onClose={() => setNovoOpen(false)}
        onSave={handleSalvarNovo}
      />

      <LocacaoDialog
        open={detalhesOpen}
        locacao={selected}
        clientes={clientes}
        onClose={() => setDetalhesOpen(false)}
        onSave={handleSave}
      />

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Excluir imóvel</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o imóvel {confirmDelete ? `"${confirmDelete.local}"` : ''}? Esta ação
            não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size="large" onClick={() => setConfirmDelete(null)}>
            Cancelar
          </Button>
          <Button size="large" color="error" variant="contained" onClick={handleDeleteConfirm}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDeleteCliente} onClose={() => setConfirmDeleteCliente(null)}>
        <DialogTitle>Excluir cliente</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o cliente{' '}
            {confirmDeleteCliente ? `"${confirmDeleteCliente.nome}"` : ''}? Imóveis já vinculados a ele
            mantêm o nome e telefone atuais, mas deixarão de aparecer no select de proprietários.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button size="large" onClick={() => setConfirmDeleteCliente(null)}>
            Cancelar
          </Button>
          <Button size="large" color="error" variant="contained" onClick={handleDeleteClienteConfirm}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ width: '100%', fontSize: '1rem' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
