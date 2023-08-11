const markdownIt = require('markdown-it');
const markdownItFootnote = require('markdown-it-footnote');

module.exports = function (eleventyConfig) {
  // Copy over various static files
  eleventyConfig.addPassthroughCopy(
    'src/**/*.(gif|ico|jpg|png|svg|webp|woff|woff2)',
  );

  // Watch for CSS changes
  eleventyConfig.addWatchTarget('./src/_scss/');

  // Add MarkdownIt plugins
  let options = {
    html: true,
  };
  let markdownLibrary = markdownIt(options).use(markdownItFootnote);
  eleventyConfig.setLibrary('md', markdownLibrary);

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
