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
    <Stack spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar por nome ou endereço…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          sx={{ flex: 1, minWidth: 240, bgcolor: 'background.paper' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
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

      <ToggleButtonGroup
        size="small"
        exclusive
        value={filtro}
        onChange={(_, v) => v && onFiltroChange(v)}
      >
        <ToggleButton value="todos">Todos</ToggleButton>
        <ToggleButton value="pendentes">Precisam de atenção</ToggleButton>
        <ToggleButton value="predinho">PREDINHO</ToggleButton>
        <ToggleButton value="reajuste">Reajuste pendente</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )
}
