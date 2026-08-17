import { createTheme } from '@mui/material/styles'

// Identidade "Angela Imóveis": terracota-tijolo como cor de ação/destaque
// (referência a fachadas e telhados) e verde-mata para confirmações, sobre
// uma base neutra — cartões brancos flutuando num fundo cinza muito claro,
// bordas quase invisíveis e sombras suaves, no espírito de painéis SaaS
// modernos (Notion, Linear, Stripe, Vercel). Números seguem monoespaçados
// para leitura tabular precisa; o restante da UI é tipografia sans limpa,
// com a serifada reservada só para a marca no cabeçalho.
export const ink = '#171A1F'
export const inkSecondary = '#6B7280'
export const surface = '#F5F5F7'
export const paper = '#FFFFFF'
export const line = '#E7E7EA'
export const soft = '#F0F0F2'
export const brick = '#A6472B'
export const brickDark = '#833723'
export const moss = '#2F6E58'
export const amber = '#B8862E'

const cardShadow = '0 1px 1px rgba(15,15,20,0.03), 0 8px 24px -12px rgba(15,15,20,0.12)'
const cardShadowHover = '0 1px 1px rgba(15,15,20,0.04), 0 16px 32px -14px rgba(15,15,20,0.16)'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: brick, dark: brickDark, contrastText: '#FFFFFF' },
    secondary: { main: moss },
    warning: { main: amber },
    background: { default: surface, paper: paper },
    text: { primary: ink, secondary: inkSecondary },
    divider: line,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 14,
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.85rem' },
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    overline: { fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: surface },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: {
          borderColor: line,
          boxShadow: cardShadow,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          paddingInline: 16,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
        },
        contained: {
          boxShadow: '0 1px 2px rgba(166,71,43,0.15), 0 4px 10px -4px rgba(166,71,43,0.45)',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(166,71,43,0.18), 0 8px 16px -6px rgba(166,71,43,0.5)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: line,
          '&:hover': { transform: 'translateY(-1px)', borderColor: brick, backgroundColor: 'rgba(166,71,43,0.04)' },
        },
        text: {
          '&:hover': { backgroundColor: 'rgba(23,26,31,0.05)' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          transition: 'background-color 0.15s ease, transform 0.15s ease',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: 600,
          borderRadius: 999,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${line}`,
        },
        head: {
          fontFamily: '"Inter", sans-serif',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: inkSecondary,
          backgroundColor: '#FAFAFB',
          borderBottom: `1px solid ${line}`,
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 4,
          padding: 4,
          backgroundColor: soft,
          borderRadius: 999,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: 0,
          borderRadius: '999px !important',
          fontWeight: 600,
          fontSize: '0.82rem',
          color: inkSecondary,
          transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
          '&.Mui-selected': {
            backgroundColor: paper,
            color: ink,
            boxShadow: '0 1px 2px rgba(15,15,20,0.08), 0 1px 1px rgba(15,15,20,0.04)',
          },
          '&.Mui-selected:hover': { backgroundColor: paper },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          backgroundColor: paper,
          transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: line },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#C9C9CE' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: brick,
            borderWidth: 1.5,
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(166,71,43,0.12)',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: '0.9rem' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          boxShadow: '0 32px 64px -16px rgba(15,15,20,0.35)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.15rem',
          fontWeight: 700,
          letterSpacing: '-0.01em',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: ink,
          borderRadius: 6,
          fontSize: '0.72rem',
        },
      },
    },
  },
})

/** Sombra suave para separar o cabeçalho fixo do conteúdo (em vez de uma borda sólida). */
export const appBarShadow = '0 1px 0 rgba(15,15,20,0.06), 0 8px 20px -14px rgba(15,15,20,0.15)'
export { cardShadow, cardShadowHover }

export default theme
