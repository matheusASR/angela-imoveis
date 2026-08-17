import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { paper, soft } from '../theme'

export interface SegmentedTabOption<T extends string> {
  value: T
  label: string
}

/**
 * Navegação por abas com indicador deslizante (estilo Linear): em vez de um
 * border-bottom desenhado por CSS a partir de suposições de altura/padding
 * (fonte de desalinhamentos), a "pílula" ativa é posicionada medindo o
 * elemento real do botão selecionado via getBoundingClientRect — por isso
 * fica sempre pixel-perfect, independente do tamanho do texto, fonte
 * carregada ou resolução da tela.
 */
export default function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: SegmentedTabOption<T>[]
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false })

  const recalc = () => {
    const container = containerRef.current
    const button = buttonRefs.current.get(value)
    if (!container || !button) return
    const containerRect = container.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    setIndicator({ left: buttonRect.left - containerRect.left, width: buttonRect.width, ready: true })
  }

  // useLayoutEffect evita o "flash" do indicador na posição errada entre o
  // paint inicial e a medição.
  useLayoutEffect(() => {
    recalc()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options.map((o) => o.label).join('|')])

  useEffect(() => {
    const onResize = () => recalc()
    window.addEventListener('resize', onResize)
    let cancelado = false
    // Fontes web carregam de forma assíncrona; se o indicador for medido
    // antes da fonte final aplicar, o texto pode mudar de largura depois.
    // Recalcula assim que as fontes terminarem de carregar.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (!cancelado) recalc()
      })
    }
    return () => {
      cancelado = true
      window.removeEventListener('resize', onResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box
      ref={containerRef}
      role="tablist"
      sx={{
        position: 'relative',
        display: 'inline-flex',
        gap: 0.5,
        p: 0.5,
        bgcolor: soft,
        borderRadius: 999,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          borderRadius: 999,
          bgcolor: paper,
          boxShadow: '0 1px 2px rgba(15,15,20,0.08), 0 1px 1px rgba(15,15,20,0.04)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.15s ease',
          transform: `translateX(${indicator.left}px)`,
          width: `${indicator.width}px`,
          opacity: indicator.ready ? 1 : 0,
          pointerEvents: 'none',
        }}
      />
      {options.map((opt) => (
        <Box
          key={opt.value}
          component="button"
          type="button"
          ref={(el: HTMLButtonElement | null) => {
            if (el) buttonRefs.current.set(opt.value, el)
            else buttonRefs.current.delete(opt.value)
          }}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          sx={{
            position: 'relative',
            zIndex: 1,
            border: 0,
            background: 'none',
            cursor: 'pointer',
            font: 'inherit',
            fontWeight: 600,
            fontSize: '0.88rem',
            color: value === opt.value ? 'text.primary' : 'text.secondary',
            px: 2.25,
            py: 0.85,
            borderRadius: 999,
            transition: 'color 0.2s ease',
            '&:hover': { color: 'text.primary' },
            '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
          }}
        >
          {opt.label}
        </Box>
      ))}
    </Box>
  )
}
