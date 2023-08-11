import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import { globby } from 'globby';
import fetch from 'node-fetch';
import rehypeInline from 'rehype-inline';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

dotenv.config();
const docraptorApiKey = process.env.DOCRAPTOR_API_KEY;
const docraptorTest = process.env.DOCRAPTOR_TEST;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(currentDir, 'dist', 'pdf');
const pages = await globby('dist/**/*.html');

/**
 * Inline Assets
 * Uses rehype/unified to inline assets like CSS and JS.
 */
const inlineAssets = unified()
  .use(rehypeParse, { fragment: false })
  .use(rehypeInline, {
    js: true,
    css: true,
    images: true,
    imports: true,
    svgElements: false,
  })
  .use(rehypeStringify);

/**
 * Get an HTML file and prepare it for DocRaptor
 *
 * @param {string} htmlPath - the HTML file to load
 * @returns {string} the contents of the HTML file with inlined CSS
 */
const getHTML = async (htmlPath) => {
  // Grab the HTML file contents as a string
  const rawHTML = await fs.readFile(htmlPath, 'utf8');
  // Change the CSS URI to a path so it can be inlined
  const updatedCSS = rawHTML.replace('/style.css', 'dist/style.css');
  // Change any image URLs to paths so they can be inlined
  const updatedImages = updatedCSS.replace('/images/', 'dist/images/');
  // Inline the CSS
  return String(await inlineAssets.process(updatedImages));
};

/**
 * Generate a PDF using DocRaptor
 *
 * @see https://docraptor.com/documentation/api
 * @param {string} html - passed to docraptor
 * @param {string} slug - used for better error logging only
 * @returns {Buffer}
 */
const getPDF = async (html, slug) => {
  if (!docraptorApiKey) throw new Error('Missing DocRaptor API Key');
  // Send HTML to DocRaptor to generate PDF
  const pdfRes = await fetch('https://docraptor.com/docs', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(docraptorApiKey).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      test: docraptorTest,
      document_content: html,
      type: 'pdf',
      prince_options: {
        profile: 'PDF/UA-1', // Adds accessibility features like tagging
      },
    }),
  });
  if (!pdfRes.ok)
    throw new Error(
      `${slug}: ${pdfRes.status} ${pdfRes.statusText} ${await pdfRes.text()}`,
    );
  // Extract the PDF from the response and return it
  const blob = await pdfRes.blob();
  return Buffer.from(await blob.arrayBuffer(), 'binary');
};

/**
 * Create a PDF from an HTML file
 *
 * @param {string} htmlPath - the HTML file to load
 */
const generatePDF = async (htmlPath) => {
  // Strip `dist/` and `/index.html` from htmlPath
  let slug = htmlPath.slice(5, -11);
  // Special case for the root HTML file
  if (htmlPath === 'dist/index.html') slug = 'index';
  // Create relative HTML path and PDF write destination
  const htmlPathCWD = path.join(currentDir, htmlPath);
  const pdfSlug = slug.replace('/', '-');
  const pdfPath = path.join(distDir, `${pdfSlug}.pdf`);
  // Load the HTML file
  const html = await getHTML(htmlPathCWD);
  // Generate the PDF with DocRaptor
  const pdf = await getPDF(html, slug);
  // Save the PDF to a file
  await fs.writeFile(pdfPath, pdf);
  console.log(`[PDF] Writing dist/pdf/${pdfSlug}.pdf`);
};

/**
 * Build All PDFs
 * This script will generate a PDF from every HTML file in the `/dist` folder by
 * passing the HTML to DocRaptor and saving the files to `/dist/pdf`.
 */
const buildAllPDFs = async () => {
  // Create the output directory if it doesn't exist
  await fs.mkdir(distDir, { recursive: true });
  // Loop over the list of pages to generate an individual PDF for each page
  await Promise.all(
    pages.map(async (page) => {
      await generatePDF(page);
    }),
  );
};

buildAllPDFs();
