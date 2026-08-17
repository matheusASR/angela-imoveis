import { useState, type FormEvent } from 'react'
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { supabase } from '../lib/supabaseClient'

/** Traduz as mensagens mais comuns do Supabase Auth para um texto amigável em pt-BR. */
function mensagemErro(msg: string): string {
  const normalizada = msg.toLowerCase()
  if (normalizada.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (normalizada.includes('email not confirmed')) {
    return 'E-mail ainda não confirmado. Verifique sua caixa de entrada.'
  }
  if (normalizada.includes('too many requests')) {
    return 'Muitas tentativas seguidas. Aguarde um instante e tente novamente.'
  }
  return msg
}

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !senha) {
      setErro('Informe e-mail e senha.')
      return
    }
    setEntrando(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })
    setEntrando(false)
    if (error) {
      setErro(mensagemErro(error.message))
    }
    // Em caso de sucesso, o listener de sessão (useSession) atualiza o app
    // sozinho e a tela de login some — nenhum redirecionamento manual aqui.
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{ p: { xs: 3, sm: 4.5 }, maxWidth: 400, width: '100%' }}
      >
        <Stack spacing={1.5} alignItems="center" sx={{ mb: 3.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: '#fff',
            }}
          >
            <HomeWorkOutlinedIcon sx={{ fontSize: '1.5rem' }} />
          </Box>
          <Typography
            sx={{
              fontFamily: '"Fraunces", serif',
              fontWeight: 600,
              fontSize: '1.4rem',
              letterSpacing: '-0.01em',
              textAlign: 'center',
            }}
          >
            Angela Imóveis
          </Typography>
          <Stack spacing={0.25} alignItems="center">
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>Bem-vinda de volta</Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.88rem', textAlign: 'center' }}>
              Entre com seu e-mail e senha para continuar.
            </Typography>
          </Stack>
        </Stack>

        <Stack component="form" onSubmit={handleSubmit} spacing={2.25}>
          {erro && (
            <Alert severity="error" variant="outlined">
              {erro}
            </Alert>
          )}

          <TextField
            label="E-mail"
            type="email"
            fullWidth
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Senha"
            type={mostrarSenha ? 'text' : 'password'}
            fullWidth
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setMostrarSenha((v) => !v)}
                    edge="end"
                    size="small"
                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    tabIndex={-1}
                  >
                    {mostrarSenha ? (
                      <VisibilityOffOutlinedIcon fontSize="small" />
                    ) : (
                      <VisibilityOutlinedIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={entrando}
            startIcon={entrando ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {entrando ? 'Entrando…' : 'Entrar'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
