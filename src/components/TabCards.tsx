import { Box, Stack, Typography } from '@mui/material'

export interface TabCardOption<T extends string> {
  value: T
  label: string
  icon: React.ComponentType<{ fontSize?: 'inherit' | 'small' | 'medium' | 'large' }>
}

/**
 * Navegação principal como três cartões que preenchem a largura da tela,
 * em vez de abas de texto. O card ativo tem um estilo bem distinto (fundo
 * preenchido com a cor de destaque + sombra) em vez de só um indicador
 * fino, para ficar óbvio em qual seção o usuário está.
 */
export default function TabCards<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: TabCardOption<T>[]
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} role="tablist" sx={{ width: '100%' }}>
      {options.map((opt) => {
        const ativo = opt.value === value
        const Icon = opt.icon
        return (
          <Box
            key={opt.value}
            component="button"
            type="button"
            role="tab"
            aria-selected={ativo}
            onClick={() => onChange(opt.value)}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 2,
              border: '1px solid',
              borderColor: ativo ? 'primary.main' : 'divider',
              borderRadius: 3,
              bgcolor: ativo ? 'primary.main' : 'background.paper',
              color: ativo ? '#fff' : 'text.primary',
              cursor: 'pointer',
              textAlign: 'left',
              font: 'inherit',
              boxShadow: ativo
                ? '0 10px 24px -10px rgba(166,71,43,0.55)'
                : '0 1px 1px rgba(15,15,20,0.03), 0 8px 24px -12px rgba(15,15,20,0.10)',
              transition:
                'background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
              '&:hover': {
                transform: 'translateY(-1px)',
                borderColor: 'primary.main',
                ...(ativo ? {} : { bgcolor: 'rgba(166,71,43,0.05)' }),
              },
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                flexShrink: 0,
                borderRadius: 2,
                bgcolor: ativo ? 'rgba(255,255,255,0.18)' : 'rgba(166,71,43,0.08)',
                color: ativo ? '#fff' : 'primary.main',
              }}
            >
              <Icon fontSize="small" />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{opt.label}</Typography>
          </Box>
        )
      })}
    </Stack>
  )
}
