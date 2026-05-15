'use client'

import Link from 'next/link'
import styles from './page.module.css'

type TileData = {
  date: string
  published: boolean
  displayDate: string
}

type Props = {
  tiles: TileData[]
  username: string
}

export function ProfileMosaic({ tiles, username }: Props) {
  return (
    <div
      className={`mosaic mosaic--lg ${styles.profileMosaic}`}
      aria-label="sixty-day practice mosaic"
    >
      {tiles.map((tile, i) => {
        if (tile.published) {
          return (
            <Link
              key={tile.date}
              href={`/u/${username}/${tile.date}`}
              className={`tile tile--published ${styles.publishedTile}`}
              style={{ animationDelay: `${i * 8}ms` }}
              aria-label={tile.displayDate}
            />
          )
        }
        return (
          <div
            key={tile.date}
            className="tile"
            style={{ animationDelay: `${i * 8}ms` }}
            aria-hidden="true"
          />
        )
      })}
    </div>
  )
}
