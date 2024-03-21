import fsPromises from 'fs/promises';
import path from 'path';

async function processMarkdownFile(markdownFilePath) {
  try {
    const markdownContent = await fsPromises.readFile(markdownFilePath, 'utf-8');
    const markdownMarkers = ['**', '_', '`', '\n\n'];

    const markdownSections = markdownContent.split('```');
    if (markdownSections.length % 2 === 0) {
      throw new Error('Invalid markdown syntax');
    }

    function createMarkerPattern(marker) {
      return new RegExp(`(?<=^|[\\s,.\\n])${marker}([^${marker}\\s][^${marker}]*[^${marker}\\s]*)${marker}(?=[\\s,.\\n]|$)`, 'g');
    }

    const boldPattern = createMarkerPattern('\\*\\*');
    const italicPattern = createMarkerPattern('_');
    const monospacedPattern = createMarkerPattern('`');

    const convertMarkdown = (regex, marker, tag) => {
      markdownSections.forEach((section, index) => {
        if (index % 2 === 0) {
          let replacedSection = section;
          let match;
          while ((match = regex.exec(section)) !== null) {
            const [fullMatch, content] = match.slice(0, 2);
            if (content.endsWith(' ')) {
              throw new Error('Invalid markdown syntax');
            }
            const nestedMarksCount = (marker) =>
              content.split('').filter((char) => char === marker).length;
            if (
              nestedMarksCount('*') > 3 ||
              nestedMarksCount(markdownMarkers[1]) > 1 ||
              nestedMarksCount(markdownMarkers[2]) > 1
            ) {
              throw new Error('Nested markers are not allowed');
            }
            const replacement = `<${tag}>${content}</${tag}>`;
            replacedSection = replacedSection.replace(fullMatch, replacement);
          }
          
          markdownSections[index] = replacedSection;
        }
      });
    };

    const formattingRules = [
      { regex: boldPattern, marker: markdownMarkers[0], tag: 'b' },
      { regex: italicPattern, marker: markdownMarkers[1], tag: 'i' },
      { regex: monospacedPattern, marker: markdownMarkers[2], tag: 'tt' }
    ];

    formattingRules.forEach(rule => {
      convertMarkdown(rule.regex, rule.marker, rule.tag);
    });

    const processedMarkdownSections = markdownSections.map((section, index) => {
      if (index % 2 === 0 && section.includes(markdownMarkers[3])) {
        const paragraphs = section.split(markdownMarkers[3]);
        return paragraphs.map((paragraph) => `<p>${paragraph.trim()}</p>`).join('\n');
      } else if (index % 2 !== 0 && !section.match(/^\s*\n/) && !section.match(/^\s*\*\*/)) {
        throw new Error('Should be line break after preformatted marker');
      } else if (index % 2 !== 0) {
        return `\n<pre>${section}</pre>`;
      }
      return section;
    });

    return processedMarkdownSections.join('');
  } catch (error) {
    throw new Error('Error processing markdown file: ' + error.message);
  }
}

async function saveProcessedMarkdownToFile(processedMarkdown, outputFilePath) {
  try {
    await fsPromises.writeFile(outputFilePath, processedMarkdown);
    console.log('Processed markdown saved to:', outputFilePath);
  } catch (error) {
    throw new Error('Error saving processed markdown to file: ' + error.message);
  }
}

async function main() {
  try {
    const markdownFilePath = process.argv[2];
    const outputFlagIndex = process.argv.indexOf('--out');
    const formatFlagIndex = process.argv.indexOf('--format');

    if (!markdownFilePath) {
      throw new Error('No file path provided');
    }

    let outputFilePath;
    if (outputFlagIndex !== -1 && process.argv[outputFlagIndex + 1]) {
      outputFilePath = path.resolve(process.argv[outputFlagIndex + 1]);
    }

    let outputFormat = 'html'; // Default output format
    if (formatFlagIndex !== -1 && process.argv[formatFlagIndex + 1]) {
      outputFormat = process.argv[formatFlagIndex + 1].toLowerCase();
    }

    const processedMarkdown = await processMarkdownFile(markdownFilePath);

    if (outputFormat === 'html') {
      if (outputFilePath) {
        await saveProcessedMarkdownToFile(processedMarkdown, outputFilePath);
      } else {
        console.log(processedMarkdown);
      }
    } else if (outputFormat === 'console') {
      console.log(processedMarkdown); // Output formatted text to console
    } else {
      throw new Error('Invalid output format');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
