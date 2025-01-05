/**
 * Default configuration
 */
const defaultConfig = {
    languages: {
      javascript: true,
      typescript: true
    },
    analysis: {
      checkFunctions: true,
      checkClasses: true,
      checkMethods: true,
      minFunctionLength: 3
    },
    documentation: {
      requireDescription: true,
      requireParams: true,
      requireReturns: true,
      requireExamples: false
    },
    reporting: {
      includeCoverage: true,
      includeStats: true,
      includeSuggestions: true,
      coverageThreshold: 80
    }
  };
  
  /**
   * Loads and merges configuration
   * @param {Object} context - Probot context
   * @returns {Promise<Object>} Configuration object
   */
  async function loadConfig(context) {
    try {
      const config = await context.config('documentation-guardian.yml');
      return { ...defaultConfig, ...config };
    } catch (error) {
      context.log.warn('Error loading config, using defaults:', error);
      return defaultConfig;
    }
  }
  
  /**
   * Generates documentation suggestion for a node
   * @param {Object} node - AST node
   * @returns {string} Documentation suggestion
   */
  function generateDocSuggestion(node) {
    let suggestion = '/**\n';
  
    // Add description
    suggestion += ` * ${node.type === 'ClassDeclaration' ? 
      `The ${node.id.name} class` : 
      `The ${node.id ? node.id.name : 'anonymous'} function`}\n *\n`;
  
    // Add params if it's a function
    if (node.params) {
      node.params.forEach(param => {
        suggestion += ` * @param {any} ${param.name} - Description of ${param.name}\n`;
      });
    }
  
    // Add return if it's a function
    if (node.type !== 'ClassDeclaration') {
      suggestion += ` * @returns {any} - Return value description\n`;
    }
  
    suggestion += ' */';
    return suggestion;
  }
  
  module.exports = {
    loadConfig,
    generateDocSuggestion
  };