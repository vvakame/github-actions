import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  const targetReactions = (core.getInput("target-reactions") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(s => !!s);
  core.debug(`target-reactions: ${JSON.stringify(targetReactions)}`);

  const labels = (core.getInput("filter-labels") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(s => !!s);
  core.debug(`filter-labels: ${JSON.stringify(labels)}`);

  const state = (core.getInput("filter-states") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(s => !!s);
  core.debug(`filter-states: ${JSON.stringify(labels)}`);

  const givenLabels = (core.getInput("voted-labels") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(s => !!s);
  core.debug(`voted-labels: ${JSON.stringify(labels)}`);
  const threshold = parseInt(core.getInput("label-threshold"), 10);

  const githubToken = core.getInput("github-token");
  const octokit = new github.GitHub(githubToken);

  const { owner, repo } = github.context.issue;

  const resp = await octokit.graphql(
    `
    query voteChecker ($owner: String!, $repo: String!, $state: [IssueState!], $labels: [String!]) {
      repository(owner: $owner, name: $repo) {
        id
        name
        issues(first: 100, states: $state, labels: $labels, orderBy: {field: CREATED_AT, direction: DESC}) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            title
            reactions(first: 10) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                content
              }
            }
          }
        }
      }
    }
  `,
    {
      owner,
      repo,
      state,
      labels
    }
  );
  core.debug(`data: ${JSON.stringify(resp)}`);

  const { voteChecker } = resp!;

  const currentIssue = {
    owner: github.context.issue.owner,
    repo: github.context.issue.repo,
    issue_number: github.context.issue.number
  };

  voteChecker.repository.issues.nodes.forEach((issue: any) => {
    core.debug(`issue: ${issue.id}, ${issue.title}`);
    let count = 0;
    issue.reactions.node.forEach((reaction: any) => {
      core.debug(`reaction: ${reaction.id}, ${reaction.content}`);
      if (targetReactions.includes(reaction.content)) {
        count++;
      }
    });
    core.debug(`vote count: ${count}`);
    if (threshold <= count) {
      octokit.issues.addLabels({
        ...currentIssue,
        labels: givenLabels
      });
    }
  });
}

run().catch(err => core.setFailed(err.message));
