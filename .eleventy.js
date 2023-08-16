module.exports = function (eleventyConfig) {
  // Copy over various static files
  eleventyConfig.addPassthroughCopy(
    'src/**/*.(gif|ico|jpg|png|svg|webp|woff|woff2)',
  );

  // Watch for CSS changes
  eleventyConfig.addWatchTarget('./src/_scss/');

  return {
    dir: {
      input: 'src',
      output: 'dist',
    },
  };
};
