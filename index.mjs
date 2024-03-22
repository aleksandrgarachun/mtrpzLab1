import fsPromises from 'fs/promises';
import path from 'path';
import os from 'node:os';

const [, , filePath] = process.argv;
const outputFlagIndex = process.argv.includes('--out') ? process.argv.indexOf('--out') : -1;

if (!filePath) {
  throw new Error('No file path provided');
}


const boldPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)\\*\\*(?=\\S)(.+?)(?<=\\S)\\*\\*(?=[ ,.:;\\n\\t]|$)', 'g');
const italicPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)_(?=\\S)(.+?)(?<=\\S)_(?=[ ,.:;\\n\\t]|$)', 'g');
const monospacedPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)`(?=\\S)(.+?)(?=\\S)`(?=[ ,.:;\\n\\t]|$)', 'g');
const leftBoldPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)\\*\\*(?=\\S)', 'g');
const rightBoldPattern = new RegExp('(?<=\\S)\\*\\*(?=[ ,.:;\\n\\t]|$)', 'g');
const leftItalicPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)_(?=\\S)', 'g');
const rightItalicPattern = new RegExp('(?<=\\S)_(?=[ ,.:;\\n\\t]|$)', 'g');
const leftMonospacedPattern = new RegExp('(?<=[ ,.:;\\n\\t]|^)`(?=\\S)', 'g');
const rightMonospacedPattern = new RegExp('(?=\\S)`(?=[ ,.:;\\n\\t]|$)', 'g');


const formatParagraphs  = (event) => {
  const parag = event.split(/\r?\n\s*\r?\n/).filter((par) => par.trim() !== '');
  const JoinParagraphs = parag.map((par) => `<p>${par.trim()}</p>`).join('');

  return JoinParagraphs;
};


const formatCodeBlocks = (event) => {
  if (!/^[\r\n]/.test(event) || !/[\r\n]$/.test(event)) {
    throw new Error('Preformatted text must be enclosed with line breaks');
  }
  return `<pre>${event.trim()}</pre>${os.EOL}`;
};



const formatTextWithHtmlTags = (event) => {
  return event.replace(boldPattern, (match, p1) => `<b>${p1}</b>`)
                          .replace(italicPattern, (match, p1) => `<i>${p1}</i>`)
                          .replace(monospacedPattern, (match, p1) => `<tt>${p1}</tt>`);

  
};

const validateMarkerClosure = (event, leftRegex, rightRegex, regex) => {
  const countMarkers = (str, regex) => (str.match(regex) || []).length;

  const totalMarkers = countMarkers(event, regex) * 2;
  const leftMarkers = countMarkers(event, leftRegex);
  const rightMarkers = countMarkers(event, rightRegex);

  if (leftMarkers + rightMarkers !== totalMarkers) {
    throw new Error('Problem with close marker');
  }
};

const markers = ['**', '_', '`'];

const checkNestedMarkers = (event, pattern, marker) => {
  const parts = event.match(pattern);
  if (parts) {
    for (const part of parts) {
      const nestedMarkers = part.split(marker).filter(mark => mark !== '');
      for (const nested of nestedMarkers) {
        if (nested.length > 2) {
          const firstTwoChars = nested.substring(0, 2);
          const lastTwoChars = nested.substring(nested.length - 2);
          if (markers.includes(firstTwoChars) || markers.includes(lastTwoChars)) {
            throw new Error('Permitted markers are nested');
          }
        }
        if (nested.length > 1) {
          if (markers.includes(nested[0]) || markers.includes(nested[nested.length - 1])) {
            throw new Error('Permitted markers are nested');
          }
        }
        const asterisksCount = (nested.match(/\*/g) || []).length;
        const underscoresCount = (nested.match(/_/g) || []).length;
        const backticksCount = (nested.match(/`/g) || []).length;
        if (asterisksCount > 1 || underscoresCount > 1 || backticksCount > 1) {
          throw new Error('Permitted markers are nested');
        }
      }
    }
  }
};



const formatPlainText = (event) => {
  checkTextMarkers(event);
  const htmlText = formatTextWithHtmlTags(formatParagraphs (event));
  return htmlText;
};

const formatPreformattedText = (event) => {
  return formatCodeBlocks(event);
};
const regexPatterns = [boldPattern, italicPattern, monospacedPattern];

const checkTextMarkers = (event) => {
  validateMarkerClosure(event, leftBoldPattern, rightBoldPattern, boldPattern);
  validateMarkerClosure(event, leftItalicPattern, rightItalicPattern, italicPattern);
  validateMarkerClosure(event, leftMonospacedPattern, rightMonospacedPattern, monospacedPattern);

  regexPatterns.forEach((regex, index) =>
  checkNestedMarkers(event, regex, markers[index])
  );
};
const markdownContent = await fsPromises.readFile(filePath, 'utf-8');

const renderMarkdownAsHTML = () => {
  const parts = markdownContent.split('```');
  if (parts.length % 2 === 0) {
    throw new Error('The preformatted marker provider lacks a closing tag.');
  }

  let htmlContent = '';

  for (let i = 0; i < parts.length; i++) {
    const currentPart = parts[i];
    if (i % 2 === 0) {
      const formattedPart = formatPlainText(currentPart);
      htmlContent += formattedPart;
    } else {
      const preformattedPart = formatPreformattedText(currentPart);
      htmlContent += preformattedPart;
    }
  }

  return htmlContent;
};

const generateHTML = async () => {
  try {
    const htmlContent = renderMarkdownAsHTML();
    if (outputFlagIndex !== -1 && process.argv[outputFlagIndex + 1]) {
      const outputPath = path.resolve(process.argv[outputFlagIndex + 1]);
      await fsPromises.writeFile(outputPath, htmlContent);
      console.log('HTML file generated successfully at:', outputPath);
    } else {
      console.log(htmlContent);
    }
  } catch (error) {
    console.error('Error generating HTML:', error);
  }
};

generateHTML();


