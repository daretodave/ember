import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { EntryMarkdown } from '../EntryMarkdown'

afterEach(() => {
  cleanup()
})

describe('EntryMarkdown', () => {
  it('renders plain text as a paragraph', () => {
    render(<EntryMarkdown content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders bold text', () => {
    const { container } = render(<EntryMarkdown content="**bold**" />)
    expect(container.querySelector('strong')).toBeInTheDocument()
    expect(container.querySelector('strong')?.textContent).toBe('bold')
  })

  it('renders italic text', () => {
    const { container } = render(<EntryMarkdown content="_italic_" />)
    expect(container.querySelector('em')).toBeInTheDocument()
    expect(container.querySelector('em')?.textContent).toBe('italic')
  })

  it('renders h1 headings', () => {
    const { container } = render(<EntryMarkdown content="# Heading" />)
    expect(container.querySelector('h1')).toBeInTheDocument()
    expect(container.querySelector('h1')?.textContent).toBe('Heading')
  })

  it('renders unordered list items', () => {
    const content = `- first item\n- second item`
    const { container } = render(<EntryMarkdown content={content} />)
    const items = container.querySelectorAll('li')
    expect(items.length).toBeGreaterThanOrEqual(1)
    const allText = container.textContent ?? ''
    expect(allText).toContain('first item')
    expect(allText).toContain('second item')
  })

  it('renders links with rel="ugc nofollow"', () => {
    const { container } = render(
      <EntryMarkdown content="[link](https://example.com)" />,
    )
    const anchor = container.querySelector('a')
    expect(anchor).toBeInTheDocument()
    expect(anchor?.getAttribute('href')).toBe('https://example.com')
    expect(anchor?.getAttribute('rel')).toBe('ugc nofollow')
  })

  it('does not render script elements', () => {
    const { container } = render(
      <EntryMarkdown content={'<script>bad()</script>'} />,
    )
    expect(container.querySelector('script')).not.toBeInTheDocument()
  })

  it('renders inline code', () => {
    const { container } = render(<EntryMarkdown content="use `const` here" />)
    expect(container.querySelector('code')).toBeInTheDocument()
    expect(container.querySelector('code')?.textContent).toBe('const')
  })

  it('renders fenced code block in pre > code', () => {
    const { container } = render(
      <EntryMarkdown content={"```\nconst x = 1\n```"} />,
    )
    const pre = container.querySelector('pre')
    expect(pre).toBeInTheDocument()
    expect(pre?.querySelector('code')).toBeInTheDocument()
  })

  it('renders a blockquote', () => {
    const { container } = render(<EntryMarkdown content="> a quote" />)
    expect(container.querySelector('blockquote')).toBeInTheDocument()
  })

  it('forwards className to the wrapper div', () => {
    const { container } = render(
      <EntryMarkdown content="text" className="customClass" />,
    )
    expect(container.firstChild).toHaveClass('customClass')
  })
})
