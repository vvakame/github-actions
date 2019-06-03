# Markdown to Blog post

Make blog post pull request from markdown file.

## Usage

```hcl
action "md2blog" {
  uses = "vvakame/github-actions/md-to-blogpost@master"
  args = ["--name", "blog-repo", "result.md"]
  secrets = ["BLOG_REPO_GITHUB_TOKEN"]
}
```

new pull request will create.

## Secrets

* `BLOG_REPO_GITHUB_TOKEN` is required
    * You can use `--github_token` command line option instead

## CLI

```sh
$ go run main.go --help
  usage: main --name=NAME [<flags>] <input_path>
  
  Flags:
    --help                   Show context-sensitive help (also try --help-long and --help-man).
    --github_token="$BLOG_REPO_GITHUB_TOKEN"
                             GitHub token for GitHub endpoint request.
    --github_event_path="$GITHUB_EVENT_PATH"
                             GitHub event data json path.
    --owner=OWNER            name of repository owner. default value is from GITHUB_EVENT_PATH.repository.owner.login .
    --name=NAME              name of repository.
    --base_branch="master"   name of base branch.
    --commit_message="auto generated commit"
                             commit message text.
    --timezone="UTC"         timezone for blog post date
    --post_path=POST_PATH    blog post markdown path in repository. default value is source/_posts/YYYY-MM-DD-BranchName.md
    --image_path=IMAGE_PATH  blog post image path in repository. default value is source/images/YYYY-MM-DD-BranchName
    --base_image_url=BASE_IMAGE_URL
                             base image url in blog site. default value is /images/YYYY-MM-DD-BranchName
    --pr_branch=PR_BRANCH    name of pull request branch. default value is from-pr-PRNumber
    --pr_title=PR_TITLE      title of pull request. default value is 'blog post from 'PRTitle”
    --pr_body=PR_BODY        body of pull request. default value is 'from PRURL'
  
  Args:
    <input_path>  input markdown path
```
