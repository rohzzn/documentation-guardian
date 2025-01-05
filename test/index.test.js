const { Probot, ProbotOctokit } = require('probot');
const app = require('../src');
const fs = require('fs');
const path = require('path');

describe('Documentation Guardian', () => {
  let probot;

  beforeEach(() => {
    probot = new Probot({
      appId: 123,
      privateKey: 'test',
      Octokit: ProbotOctokit,
    });
    probot.load(app);
  });

  test('creates a comment on PR open', async () => {
    const payload = {
      action: 'opened',
      pull_request: {
        number: 1,
        base: { sha: 'base-sha' },
        head: { sha: 'head-sha' }
      },
      repository: {
        owner: { login: 'owner' },
        name: 'repo'
      }
    };

    const mock = {
      compareCommits: jest.fn().mockResolvedValue({
        data: {
          files: [{
            filename: 'test.js',
            patch: `function test() { console.log('test'); }`
          }]
        }
      }),
      issues: {
        createComment: jest.fn().mockResolvedValue({})
      }
    };

    await probot.receive({ name: 'pull_request', payload, mock });

    expect(mock.issues.createComment).toHaveBeenCalled();
  });
});