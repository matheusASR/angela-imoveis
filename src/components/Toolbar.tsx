import { Stack, TextField, Button, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'

export default function AppToolbar({
  query,
  onQueryChange,
  onNovo,
}: {
  query: string
  onQueryChange: (v: string) => void
  onNovo: () => void
}) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
      <TextField
        size="small"
        placeholder="Buscar por nome, endereço ou apartamento…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        sx={{ flex: '0 1 340px', minWidth: 240 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: '1.15rem', color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      <Stack sx={{ flex: 1 }} />

      <Button
        size="medium"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onNovo}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Adicionar imóvel
      </Button>
    </Stack>
  )
}
