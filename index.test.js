import convertMarkdown from './converter.mjs'

describe('convertMarkdown', () => {
  test('converts bold text to HTML', () => {
    const input = '**bold**'
    const expected = '<p><b>bold</b></p>'
    expect(convertMarkdown(input, 'html')).toBe(expected)
  })

  test('converts italic text to HTML', () => {
    const input = '_italic_'
    const expected = '<p><i>italic</i></p>'
    expect(convertMarkdown(input, 'html')).toBe(expected)
  })

  test('converts preformatted text to HTML', () => {
    const input = '```\npreformatted\n```'
    const expected = '<pre>preformatted</pre>\n'
    expect(convertMarkdown(input, 'html')).toBe(expected)
  })

  test('converts bold text to escape codes', () => {
    const input = '**bold**'
    const expected = '\x1b[1mbold\x1b[0m'
    expect(convertMarkdown(input, 'esc')).toBe(expected)
  })

  test('converts italic text to escape codes', () => {
    const input = '_italic_'
    const expected = '\x1b[3mitalic\x1b[0m'
    expect(convertMarkdown(input, 'esc')).toBe(expected)
  })

  test('converts preformatted text to escape codes', () => {
    const input = '```\npreformatted\n```'
    const expected = '\x1b[7mpreformatted\x1b[0m\n'
    expect(convertMarkdown(input, 'esc')).toBe(expected)
  })

  test('throws error for nested tags', () => {
    const input = '**bold _nested_ tags***'
    expect(() => convertMarkdown(input, 'html')).toThrow()
    expect(() => convertMarkdown(input, 'esc')).toThrow()
  })
})
