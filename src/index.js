const { analyzeCode } = require('./analyzers');
const { generateReport } = require('./reporters');
const { loadConfig } = require('./utils/config');

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info('Documentation Guardian is running!');

  app.on(['pull_request.opened', 'pull_request.synchronize'], async (context) => {
    const pr = context.payload.pull_request;
    
    // Initial comment
    await context.octokit.issues.createComment(context.issue({
      body: '📝 Documentation Guardian is analyzing your changes...'
    }));

    try {
      // Get the diff
      const comparison = await context.octokit.repos.compareCommits({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        base: pr.base.sha,
        head: pr.head.sha,
      });

      // Load config
      const config = await loadConfig(context);

      // Analyze changes
      const analysis = await analyzeCode(comparison.data.files, config);

      // Generate and post report
      await generateReport(context, analysis);

    } catch (error) {
      app.log.error(error);
      await context.octokit.issues.createComment(context.issue({
        body: '❌ An error occurred while analyzing the documentation.\n```\n' + error.message + '\n```'
      }));
    }
  });
};