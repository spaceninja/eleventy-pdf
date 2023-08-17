# Eleventy PDF

This repo is an example of how to have a static website that is automatically converted into a PDF using [DocRaptor](https://docraptor.com/). We're using Eleventy, but you could use any static site generator, including hand-maintained HTML files. We're using DocRaptor, which is a friendly and affordable API build on top of the [Prince PDF](https://www.princexml.com/) service, but you could use other HTML-to-PDF services, including [WeasyPrint](https://weasyprint.org/) or the [Adobe PDF Services API](https://developer.adobe.com/document-services/apis/pdf-services/).

## How This Works

The repo will build a standard static site — in this case, a chapter-navigable version of the Sherlock Holmes story, _A Study In Scarlet_ — with some basic CSS.

In addition, it will output a single-page version of the entire book. This HTML file loads the same CSS as the main site, it just keeps everything in a single file, which is needed so DocRaptor can add page numbers.

We then have a node script that will load the contents of the single-page version, inline all the CSS and images, and then submit the resulting HTML to the DocRaptor API, which returns a PDF that we save to the `dist` directory.

For more information, check out [`build-pdf.mjs`](build-pdf.mjs) and this blog post (coming soon).
