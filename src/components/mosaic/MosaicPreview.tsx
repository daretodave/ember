type TileState = 'empty' | 'filled' | 'today' | 'published'

// 6×10 illustrative pattern from design/Ember · Landing.html
const PREVIEW_PATTERN: TileState[] = [
  'filled',    'filled',    'empty',     'filled', 'filled', 'filled',
  'filled',    'published', 'filled',    'filled', 'filled', 'filled',
  'filled',    'filled',    'filled',    'filled', 'filled', 'empty',
  'filled',    'filled',    'filled',    'filled', 'published', 'filled',
  'empty',     'filled',    'filled',    'filled', 'filled', 'filled',
  'filled',    'filled',    'filled',    'published', 'filled', 'filled',
  'filled',    'filled',    'filled',    'filled', 'filled', 'filled',
  'filled',    'filled',    'filled',    'filled', 'filled', 'filled',
  'filled',    'filled',    'filled',    'filled', 'filled', 'filled',
  'filled',    'filled',    'filled',    'filled', 'today',  'empty',
]

function tileClass(state: TileState): string {
  if (state === 'filled') return 'tile tile--filled'
  if (state === 'today') return 'tile tile--today'
  if (state === 'published') return 'tile tile--published'
  return 'tile'
}

export function MosaicPreview() {
  return (
    <div className="mosaic mosaic--md" aria-label="sixty days of practice">
      {PREVIEW_PATTERN.map((state, i) => (
        <div
          key={i}
          className={tileClass(state)}
          style={{ animationDelay: `${i * 8}ms` }}
        />
      ))}
    </div>
  )
}
