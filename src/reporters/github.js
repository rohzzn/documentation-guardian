// src/reporters/github.js
async function generateReport(context, analysis) {
    const qualityScore = calculateQualityScore(analysis);
    const body = generateReportBody(analysis, qualityScore);
    
    // Add report as PR comment
    await context.octokit.issues.createComment(context.issue({ body }));
    
    // Add PR status check
    await setPRStatus(context, qualityScore);
  }
  
  function generateReportBody(analysis, qualityScore) {
    let body = `## 📚 Documentation Quality Report
  
  ${getQualityBadge(qualityScore)}
  ${getCoverageBadge(analysis.coverage)}
  
  ### 📊 Overview
  - Documentation Coverage: ${analysis.coverage}%
  - Quality Score: ${qualityScore}/100
  - Files Analyzed: ${analysis.totalFiles}
  - Issues Found: ${getTotalIssues(analysis)}
  
  `;
  
    if (analysis.undocumentedFunctions.length > 0) {
      body += '### 🔍 Undocumented Functions\n\n';
      analysis.undocumentedFunctions.forEach(func => {
        body += `<details>
  <summary>⚠️ <code>${func.name}</code> (Line ${func.line})</summary>
  
  \`\`\`javascript
  ${func.suggestion}
  \`\`\`
  </details>\n\n`;
      });
    }
  
    if (analysis.undocumentedClasses.length > 0) {
      body += '### 📦 Undocumented Classes\n\n';
      analysis.undocumentedClasses.forEach(cls => {
        body += `<details>
  <summary>⚠️ <code>${cls.name}</code> (Line ${cls.line})</summary>
  
  \`\`\`javascript
  ${cls.suggestion}
  \`\`\`
  </details>\n\n`;
      });
    }
  
    body += `### 💡 AI Suggestions
  ${generateAISuggestions(analysis)}
  
  ### 📈 Impact Analysis
  ${generateImpactAnalysis(analysis)}`;
  
    return body;
  }
  
  async function setPRStatus(context, qualityScore) {
    const status = {
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      sha: context.payload.pull_request.head.sha,
      context: 'Documentation Quality',
      description: `Documentation quality: ${qualityScore}/100`,
      state: qualityScore >= 80 ? 'success' : 'failure',
      target_url: context.payload.pull_request.html_url
    };
  
    await context.octokit.repos.createStatus(status);
  }
  
  function calculateQualityScore(analysis) {
    const coverageScore = analysis.coverage * 0.6;
    const complexityScore = calculateComplexityScore(analysis) * 0.2;
    const consistencyScore = calculateConsistencyScore(analysis) * 0.2;
    
    return Math.round(coverageScore + complexityScore + consistencyScore);
  }
  
  function generateAISuggestions(analysis) {
    let suggestions = [];
  
    if (analysis.coverage < 80) {
      suggestions.push('- Consider adding documentation to most critical functions first');
    }
  
    if (analysis.undocumentedClasses.length > 0) {
      suggestions.push('- Add class documentation to improve code maintainability');
    }
  
    return suggestions.join('\n');
  }
  
  function generateImpactAnalysis(analysis) {
    return `- 🔄 Changed Files: ${analysis.totalFiles}
  - 📉 Maintainability Impact: ${calculateMaintainabilityImpact(analysis)}
  - 🎯 Critical Areas: ${identifyCriticalAreas(analysis)}`;
  }
  
  module.exports = {
    generateReport
  };