import {
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  InputAdornment,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import type { FiltroTipo } from '../types'

export default function AppToolbar({
  query,
  onQueryChange,
  filtro,
  onFiltroChange,
  onNovo,
}: {
  query: string
  onQueryChange: (v: string) => void
  filtro: FiltroTipo
  onFiltroChange: (v: FiltroTipo) => void
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

      <ToggleButtonGroup
        size="small"
        exclusive
        value={filtro}
        onChange={(_, v) => v && onFiltroChange(v)}
        sx={{ flexWrap: 'wrap' }}
      >
        <ToggleButton value="todos">Todos</ToggleButton>
        <ToggleButton value="pendentes">Precisam de atenção</ToggleButton>
        <ToggleButton value="predinho">PREDINHO</ToggleButton>
      </ToggleButtonGroup>

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
