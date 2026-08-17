import { useState } from 'react'
import { Box, Paper, Stack, Typography, TextField, Button, Alert } from '@mui/material'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import { supabase } from '../lib/supabaseClient'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const handleEnviar = async () => {
    if (!email.trim()) {
      setErro('Informe o e-mail cadastrado.')
      return
    }
    setEnviando(true)
    setErro('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setEnviando(false)
    if (error) {
      setErro(error.message)
      return
    }
    setEnviado(true)
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
      <Paper variant="outlined" sx={{ p: 4, maxWidth: 380, width: '100%' }}>
        <Stack spacing={2.5} alignItems="center" sx={{ mb: 1 }}>
          <HomeWorkOutlinedIcon sx={{ fontSize: '2.5rem', color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontSize: '1.4rem', textAlign: 'center' }}>
            Angela Imóveis
          </Typography>
        </Stack>

        {enviado ? (
          <Alert severity="success" variant="outlined">
            Link de acesso enviado para <strong>{email}</strong>. Abra o e-mail e clique no link para
            entrar.
          </Alert>
        ) : (
          <Stack spacing={2}>
            <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
              Informe o e-mail cadastrado para receber um link de acesso.
            </Typography>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              autoFocus
              value={email}
              error={!!erro}
              helperText={erro}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEnviar()
              }}
            />
            <Button variant="contained" size="large" onClick={handleEnviar} disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar link de acesso'}
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  )
}
