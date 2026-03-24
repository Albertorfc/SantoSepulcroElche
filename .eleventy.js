module.exports = function(eleventyConfig) {
  
  // 1. Copiar carpetas estáticas al destino final (public)
  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/js");

  // 2. Watch para ver cambios en tiempo real durante el desarrollo
  eleventyConfig.addWatchTarget("./src/css/");
  eleventyConfig.addWatchTarget("./src/js/");

  // 3. Configuración de carpetas de entrada y salida
  return {
    dir: {
      input: "src",          // Donde escribes tu código
      output: "public",       // Donde Eleventy genera la web final
      includes: "_includes"   // Dentro de src/_includes
    },
    // Usamos Nunjucks (.njk) para las plantillas, es muy potente
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
