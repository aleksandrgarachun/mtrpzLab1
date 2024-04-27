'use strict'
import { readFileSync, writeFileSync } from 'fs'

import converter from './converter.mjs'
const progValues = {
  format: 'html',
  outToFile: false,
  outFileName: '',
  inputFileName: ''
}

let pickNext = false

for (const arg of process.argv.slice(2)) {
  if (pickNext) {
    progValues.outFileName = arg
    pickNext = false
  }
  if (arg.startsWith('-f=')) {
    progValues.format = arg.split('=')[1]
  } else if (arg === '--out') {
    progValues.outToFile = true
    pickNext = true
  } else {
    progValues.inputFileName = arg
  }
}

if (!progValues.inputFileName) {
  throw new Error('No file path provided')
}

if (progValues.outToFile && !progValues.outFileName) {
  throw new Error('No output file name provided')
}

if (progValues.format !== 'html' && progValues.format !== 'esc') {
  throw new Error('Invalid format')
}

const replaceMarkdown = async () => {
  try {
    const markdownContent = readFileSync(progValues.inputFileName, 'utf-8')
    const htmlContent = converter(markdownContent, progValues.format)
    if (progValues.outToFile) {
      writeFileSync(outputPath, htmlContent)
      console.log('HTML file generated successfully at:', outputPath)
    } else {
      console.log(htmlContent)
    }
  } catch (error) {
    console.error('Error generating HTML:', error)
  }
}

replaceMarkdown()
