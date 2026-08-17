import { createTheme } from '@mui/material/styles'

// Identidade "livro-caixa de imóveis": tons de tinta/papel, com terracota-tijolo
// como cor de destaque (referência a fachadas e telhados) e verde-mata para
// confirmações. Números monoespaçados reforçam a leitura tipo planilha/ficha.
export const ink = '#1E2A24'
export const paper = '#FBF8F2'
export const brick = '#A6472B'
export const brickDark = '#833723'
export const moss = '#2F6E58'
export const amber = '#B8862E'

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
  shape: { borderRadius: 6 },
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
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4 },
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
  },
})

export default theme
