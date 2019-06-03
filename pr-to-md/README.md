# Pull Request to Markdown for GitHub Actions

Convert your pull request to markdown file. 

## Usage

```hcl
action "pr2md" {
  uses = "vvakame/github-actions/pr-to-md@master"
  secrets = ["GITHUB_TOKEN"]
}
```

`result.md` will create.

## Secrets

* `GITHUB_TOKEN` is required
    * You can use `--github_token` command line option instead

## CLI

```sh
$ go run main.go --help
  usage: main [<flags>] [<output_path>]
  
  Flags:
    --help                         Show context-sensitive help (also try --help-long and --help-man).
    --github_token="$GITHUB_TOKEN"
                                   GitHub token for GitHub endpoint request.
    --github_event_path="$GITHUB_EVENT_PATH"
                                   GitHub event data json path.
    --owner=OWNER                  name of repository owner. default value is from GITHUB_EVENT_PATH.repository.owner.login .
    --name=NAME                    name of repository. default value is from GITHUB_EVENT_PATH.repository.name .
    --pr_number=PR_NUMBER          number of pull request. default value is from GITHUB_EVENT_PATH.number .
    --template_path=TEMPLATE_PATH  markdown template path. it uses with html/template
    --timezone="UTC"               timezone for date
  
  Args:
    [<output_path>]  result output path
```
