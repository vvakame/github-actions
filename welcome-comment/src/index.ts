import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  const labels = (core.getInput("target-labels") ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(s => !!s);
  core.debug(`target-labels: ${JSON.stringify(labels)}`);

  const githubToken = core.getInput("github-token");
  const octokit = new github.GitHub(githubToken);

  const currentIssue = {
    owner: github.context.issue.owner,
    repo: github.context.issue.repo,
    issue_number: github.context.issue.number
  };
  const issue = await octokit.issues.get(currentIssue);

  function matchLabel(label: string, issueLabel: typeof issue.data.labels[0]) {
    if (`${issueLabel.id}` === label) {
      return true;
    } else if (issueLabel.node_id === label) {
      return true;
    } else if (issueLabel.name === label) {
      return true;
    }
    return false;
  }

  if (
    !labels.every(label =>
      issue.data.labels.some(issueLabel => matchLabel(label, issueLabel))
    )
  ) {
    core.debug(`some target labels doesn't contains on issue labels.`);
    return;
  }

  octokit.issues.createComment({
    ...currentIssue,
    body: core.getInput("message")
  });
}

run().catch(err => core.setFailed(err.message));
