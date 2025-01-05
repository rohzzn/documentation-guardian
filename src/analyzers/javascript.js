const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { generateDocSuggestion } = require('../utils/config');  // Fixed import path

/**
 * Analyzes JavaScript code for documentation issues
 * @param {string} code - JavaScript code content
 * @param {Object} config - Configuration options
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeJavaScript(code, config) {
  const analysis = {
    undocumentedFunctions: [],
    undocumentedClasses: [],
    suggestions: []
  };

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });

    traverse(ast, {
      FunctionDeclaration(path) {
        checkFunctionDocumentation(path.node, analysis);
      },

      ClassDeclaration(path) {
        checkClassDocumentation(path.node, analysis);
      },

      ClassMethod(path) {
        if (config.checkMethods !== false) {
          checkFunctionDocumentation(path.node, analysis);
        }
      }
    });

  } catch (error) {
    console.error('Error parsing JavaScript:', error);
  }

  return analysis;
}

/**
 * Checks function documentation
 * @param {Object} node - AST node
 * @param {Object} analysis - Analysis object to update
 */
function checkFunctionDocumentation(node, analysis) {
  const hasDocumentation = hasJSDocComment(node);
  if (!hasDocumentation) {
    analysis.undocumentedFunctions.push({
      name: node.id ? node.id.name : 'anonymous',
      line: node.loc.start.line,
      hasDocumentation: false,
      suggestion: generateDocSuggestion(node)
    });
  }
}

/**
 * Checks class documentation
 * @param {Object} node - AST node
 * @param {Object} analysis - Analysis object to update
 */
function checkClassDocumentation(node, analysis) {
  const hasDocumentation = hasJSDocComment(node);
  if (!hasDocumentation) {
    analysis.undocumentedClasses.push({
      name: node.id.name,
      line: node.loc.start.line,
      hasDocumentation: false,
      suggestion: generateDocSuggestion(node)
    });
  }
}

/**
 * Checks if a node has JSDoc comments
 * @param {Object} node - AST node
 * @returns {boolean} True if has JSDoc comments
 */
function hasJSDocComment(node) {
  if (!node.leadingComments) return false;
  return node.leadingComments.some(comment => 
    comment.type === 'CommentBlock' && 
    comment.value.startsWith('*')
  );
}

module.exports = {
  analyzeJavaScript
};