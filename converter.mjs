'use strict'
import os from 'node:os'

const boldPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)\\*\\*(?=\\S)(.+?)(?<=\\S)\\*\\*(?=[ ,.:;\\n\\t]|$)', 'g')
const italicPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)_(?=\\S)(.+?)(?<=\\S)_(?=[ ,.:;\\n\\t]|$)', 'g')
const monospacedPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)`(?=\\S)(.+?)(?=\\S)`(?=[ ,.:;\\n\\t]|$)', 'g')
const leftBoldPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)\\*\\*(?=\\S)', 'g')
const rightBoldPattern = new RegExp('(?<=\\S)\\*\\*(?=[ ,.:;\\n\\t]|$)', 'g')
const leftItalicPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)_(?=\\S)', 'g')
const rightItalicPattern = new RegExp('(?<=\\S)_(?=[ ,.:;\\n\\t]|$)', 'g')
const leftMonospacedPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)`(?=\\S)', 'g')
const rightMonospacedPattern = new RegExp('(?=\\S)`(?=[ ,.:;\\n\\t]|$)', 'g')

const markers = ['**', '_', '`']

const regexPatterns = [boldPattern, italicPattern, monospacedPattern]

const formatParagraphs = (event) => {
  const parag = event.split(/\r?\n\s*\r?\n/).filter((par) => par.trim() !== '')
  const JoinParagraphs = parag.map((par) => `<p>${par.trim()}</p>`).join('')

  return JoinParagraphs
}

const formatCodeBlocks = (event, format) => {
  if (!/^[\r\n]/.test(event) || !/[\r\n]$/.test(event)) {
    throw new Error('Preformatted text must be enclosed with line breaks')
  }
  return format === 'html' ? `<pre>${event.trim()}</pre>${os.EOL}` : `\x1b[7m${event.trim()}\x1b[0m${os.EOL}`
}

const formatTextWithTags = (event, format) => {
  return event.replace(boldPattern, (match, p1) => format === 'html' ? `<b>${p1}</b>` : `\x1b[1m${p1}\x1b[0m`)
    .replace(italicPattern, (match, p1) => format === 'html' ? `<i>${p1}</i>` : `\x1b[3m${p1}\x1b[0m`)
    .replace(monospacedPattern, (match, p1) => format === 'html' ? `<tt>${p1}</tt>` : `\x1b[7m${p1}\x1b[0m`)
}

const validateMarkerClosure = (event, leftRegex, rightRegex, regex) => {
  const countMarkers = (str, regex) => (str.match(regex) || []).length

  const totalMarkers = countMarkers(event, regex) * 2
  const leftMarkers = countMarkers(event, leftRegex)
  const rightMarkers = countMarkers(event, rightRegex)

  if (leftMarkers + rightMarkers !== totalMarkers) {
    throw new Error('Problem with close marker')
  }
}

const checkNestedMarkers = (event, pattern, marker) => {
  const parts = event.match(pattern)
  if (parts) {
    for (const part of parts) {
      const nestedMarkers = part.split(marker).filter(mark => mark !== '')
      for (const nested of nestedMarkers) {
        if (nested.length > 2) {
          const firstTwoChars = nested.substring(0, 2)
          const lastTwoChars = nested.substring(nested.length - 2)
          if (markers.includes(firstTwoChars) || markers.includes(lastTwoChars)) {
            throw new Error('Permitted markers are nested')
          }
        }
        if (nested.length > 1) {
          if (markers.includes(nested[0]) || markers.includes(nested[nested.length - 1])) {
            throw new Error('Permitted markers are nested')
          }
        }
        const asterisksCount = (nested.match(/\*/g) || []).length
        const underscoresCount = (nested.match(/_/g) || []).length
        const backticksCount = (nested.match(/`/g) || []).length
        if (asterisksCount > 1 || underscoresCount > 1 || backticksCount > 1) {
          throw new Error('Permitted markers are nested')
        }
      }
    }
  }
}

const formatPlainText = (event, format) => {
  checkTextMarkers(event)
  const text = formatTextWithTags(event, format)
  const paragraphizedText = format === 'html' ? formatParagraphs(text) : text
  return paragraphizedText
}

const formatPreformattedText = (event, format) => {
  return formatCodeBlocks(event, format)
}

const checkTextMarkers = (event) => {
  validateMarkerClosure(event, leftBoldPattern, rightBoldPattern, boldPattern)
  validateMarkerClosure(event, leftItalicPattern, rightItalicPattern, italicPattern)
  validateMarkerClosure(event, leftMonospacedPattern, rightMonospacedPattern, monospacedPattern)

  regexPatterns.forEach((regex, index) =>
    checkNestedMarkers(event, regex, markers[index])
  )
}


export default (content, format) => {
  const parts = content.split('```')
  if (parts.length % 2 === 0) {
    throw new Error('The preformatted marker provider lacks a closing tag.')
  }

  let formattedContent = ''

  for (let i = 0; i < parts.length; i++) {
    const currentPart = parts[i]
    if (i % 2 === 0) {
      const formattedPart = formatPlainText(currentPart, format)
      formattedContent += formattedPart
    } else {
      const preformattedPart = formatPreformattedText(currentPart, format)
      formattedContent += preformattedPart
    }
  }

  return formattedContent
}
