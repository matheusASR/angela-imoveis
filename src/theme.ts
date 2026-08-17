import { createTheme, alpha } from '@mui/material/styles'

// Identidade "livro-caixa de imóveis": tons de tinta/papel, com terracota-tijolo
// como cor de destaque (referência a fachadas e telhados) e verde-mata para
// confirmações. Números monoespaçados reforçam a leitura tipo planilha/ficha.
// A camada visual (raios, sombras, transições) é deliberadamente mais macia
// e "moderna" por cima dessa identidade, sem abandonar a paleta nem a
// tipografia mono nos números.
export const ink = '#1E2A24'
export const paper = '#FBF8F2'
export const brick = '#A6472B'
export const brickDark = '#833723'
export const moss = '#2F6E58'
export const amber = '#B8862E'

const cardShadow = '0 1px 2px rgba(30,42,36,0.04), 0 6px 16px -8px rgba(30,42,36,0.10)'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: brick, dark: brickDark, contrastText: '#FBF8F2' },
    secondary: { main: moss },
    warning: { main: amber },
    background: { default: '#F3EFE6', paper: paper },
    text: { primary: ink, secondary: '#5B6660' },
    divider: '#E1D9C8',
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 15,
    body1: { fontSize: '1rem' },
    body2: { fontSize: '0.9rem' },
    h1: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h2: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h3: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h4: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h5: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h6: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { boxShadow: cardShadow },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
        },
        contained: {
          boxShadow: '0 2px 6px -2px rgba(166,71,43,0.45)',
          '&:hover': {
            boxShadow: '0 4px 10px -2px rgba(166,71,43,0.5)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          '&:hover': { transform: 'translateY(-1px)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#5B6660',
          borderBottom: `2px solid ${ink}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderBottom: `1px solid ${'#E1D9C8'}`,
        },
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 42,
          height: 42,
          boxSizing: 'border-box',
          padding: '0 18px',
          fontWeight: 600,
          borderRadius: '8px 8px 0 0',
          transition: 'background-color 0.15s ease, color 0.15s ease',
          '&:hover': { backgroundColor: alpha(ink, 0.04) },
          '&.Mui-selected': { color: brick },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 24px 48px -12px rgba(30,42,36,0.35)',
        },
      },
    },
  },
})

/** Sombra suave para separar o cabeçalho fixo do conteúdo (em vez da antiga borda sólida). */
export const appBarShadow = '0 1px 0 rgba(30,42,36,0.08), 0 8px 20px -12px rgba(30,42,36,0.12)'

export default theme
