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
  core.debug(`filter-states: ${JSON.stringify(state)}`);

  const givenLabels = (core.getInput("voted-labels") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(s => !!s);
  core.debug(`voted-labels: ${JSON.stringify(givenLabels)}`);

  const threshold = parseInt(core.getInput("label-threshold"), 10);
  core.debug(`label-threshold: ${JSON.stringify(threshold)}`);

  const assignees = (core.getInput("assignees") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(s => !!s);
  core.debug(`assignees: ${JSON.stringify(assignees)}`);

  const message = core.getInput("message");

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
            labels(first: 10) {
              nodes {
                id
                name
              }
            }
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

  const currentIssue = {
    owner: github.context.issue.owner,
    repo: github.context.issue.repo,
    issue_number: github.context.issue.number
  };
  resp!.repository.issues.nodes.forEach((issue: any) => {
    core.debug(`issue: ${issue.id}, ${issue.title}`);
    const givenLabelsExists = givenLabels.every(givenLabel => {
      return issue.labels.nodes.some((label: any) => label.name === givenLabel);
    });
    if (givenLabelsExists) {
      core.debug(`given labels are already exists`);
      return;
    }

    let count = 0;
    issue.reactions.nodes.forEach((reaction: any) => {
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
      if (assignees.length !== 0) {
        octokit.issues.addAssignees({
          ...currentIssue,
          assignees
        });
      }
      if (message) {
        octokit.issues.createComment({
          ...currentIssue,
          body: message
        });
      }
    }
  });
}

run().catch(err => core.setFailed(err.message));
