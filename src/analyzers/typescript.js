// src/analyzers/typescript.js
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { generateDocSuggestion } = require('../utils/config');

async function analyzeTypeScript(code, config) {
  const analysis = {
    undocumentedFunctions: [],
    undocumentedClasses: [],
    suggestions: [],
    typeIssues: []
  };

  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx']
    });

    traverse(ast, {
      FunctionDeclaration(path) {
        checkTypeScriptFunction(path.node, analysis);
      },
      ClassDeclaration(path) {
        checkTypeScriptClass(path.node, analysis);
      },
      TSInterfaceDeclaration(path) {
        checkInterface(path.node, analysis);
      }
    });
  } catch (error) {
    console.error('Error parsing TypeScript:', error);
  }

  return analysis;
}

function checkTypeScriptFunction(node, analysis) {
  const docs = getJSDocComment(node);
  if (!docs) {
    analysis.undocumentedFunctions.push({
      name: node.id?.name || 'anonymous',
      line: node.loc.start.line,
      hasDocumentation: false,
      suggestion: generateTypeScriptDocSuggestion(node)
    });
  } else {
    // Check if types match the TypeScript declarations
    checkTypeMatch(node, docs, analysis);
  }
}

function generateTypeScriptDocSuggestion(node) {
  let suggestion = '/**\n';
  suggestion += ` * ${node.id?.name || 'anonymous'} description\n *\n`;
  
  if (node.params) {
    node.params.forEach(param => {
      const paramType = param.typeAnnotation?.typeAnnotation?.type || 'any';
      suggestion += ` * @param {${paramType}} ${param.name} - Parameter description\n`;
    });
  }

  if (node.returnType) {
    const returnType = node.returnType.typeAnnotation.type;
    suggestion += ` * @returns {${returnType}} - Return value description\n`;
  }

  suggestion += ' */';
  return suggestion;
}

module.exports = {
  analyzeTypeScript
};