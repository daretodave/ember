'use client'

import Markdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import styles from './entry-markdown.module.css'

type Props = {
  content: string
  className?: string
}

export function EntryMarkdown({ content, className }: Props) {
  const wrapperClass = className ? `${styles.body} ${className}` : styles.body
  return (
    <div className={wrapperClass}>
      <Markdown
        rehypePlugins={[rehypeSanitize]}
        components={{
          a: ({ href, children }) => (
            <a href={href} rel="ugc nofollow">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  )
}
