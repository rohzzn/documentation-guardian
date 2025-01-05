const { analyzeJavaScript } = require('./javascript');

/**
 * Analyzes code for documentation issues
 * @param {Array} files - Changed files from GitHub API
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeCode(files, config) {
  const analysis = {
    totalFiles: files.length,
    undocumentedFunctions: [],
    undocumentedClasses: [],
    suggestions: [],
    coverage: 0
  };

  for (const file of files) {
    if (file.filename.endsWith('.js')) {
      const jsAnalysis = await analyzeJavaScript(file.patch || '', config);
      mergeAnalysis(analysis, jsAnalysis);
    }
  }

  // Calculate overall coverage
  analysis.coverage = calculateCoverage(analysis);

  return analysis;
}

/**
 * Merges file analysis into overall analysis
 * @param {Object} target - Target analysis object
 * @param {Object} source - Source analysis object
 */
function mergeAnalysis(target, source) {
  target.undocumentedFunctions.push(...source.undocumentedFunctions);
  target.undocumentedClasses.push(...source.undocumentedClasses);
  target.suggestions.push(...source.suggestions);
}

/**
 * Calculates documentation coverage percentage
 * @param {Object} analysis - Analysis results
 * @returns {number} Coverage percentage
 */
function calculateCoverage(analysis) {
  const totalItems = analysis.undocumentedFunctions.length + analysis.undocumentedClasses.length;
  if (totalItems === 0) return 100;

  const undocumentedItems = analysis.undocumentedFunctions.filter(f => !f.hasDocumentation).length +
                           analysis.undocumentedClasses.filter(c => !c.hasDocumentation).length;

  return Math.round(((totalItems - undocumentedItems) / totalItems) * 100);
}

module.exports = {
  analyzeCode
};