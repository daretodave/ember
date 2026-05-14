import styles from './MosaicGlyph.module.css'

type TileState = 'empty' | 'filled' | 'today'

// 6×10 bit pattern from design/Ember · Landing.html
const GLYPH_PATTERN: TileState[] = [
  'filled', 'filled', 'empty',   'filled', 'filled', 'filled',
  'filled', 'filled', 'filled',  'filled', 'filled', 'empty',
  'filled', 'filled', 'filled',  'filled', 'filled', 'filled',
  'empty',  'filled', 'filled',  'filled', 'filled', 'filled',
  'filled', 'filled', 'filled',  'filled', 'filled', 'filled',
  'filled', 'filled', 'filled',  'filled', 'filled', 'filled',
  'filled', 'filled', 'filled',  'filled', 'filled', 'filled',
  'filled', 'filled', 'filled',  'filled', 'filled', 'filled',
  'filled', 'filled', 'filled',  'filled', 'filled', 'filled',
  'filled', 'filled', 'filled',  'filled', 'today',  'empty',
]

function tileClass(state: TileState): string {
  if (state === 'filled') return 'tile tile--filled'
  if (state === 'today') return 'tile tile--today'
  return 'tile'
}

export function MosaicGlyph() {
  return (
    <div className={styles.glyph} aria-label="ember">
      {GLYPH_PATTERN.map((state, i) => (
        <div key={i} className={tileClass(state)} />
      ))}
    </div>
  )
}
