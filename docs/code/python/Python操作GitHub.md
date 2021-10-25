# Python 操作GitHub

## Commit

```python

def commit(branch_name, target_branch):
    subprocess.run(["git", "checkout", "-b", branch_name])
    subprocess.run(["git", "config", "user.email", "Koy@bot.com"])
    subprocess.run(["git", "config", "push.default", "current"])
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-am", "[Job Config] Create job config changes PR: " + branch_name])
    # to target branch
    if target_branch:
        subprocess.run(["git", "push", "--set-upstream", "origin", f"{branch_name}:{target_branch}"])
    # create new branch
    else:
        subprocess.run(["git", "push", "--set-upstream", "origin", branch_name])

```



# PR

https://github.com/PyGithub/PyGithub

> ```shell
> pip3 install PyGithub
> ```

```python
from github import Github

def create_push_request(org, repo_name, current_name, target_branch, token):
    g = Github(base_url="https://github.tools.sap/api/v3", login_or_token=token)
    repo = g.get_repo(f"{org}/{repo_name}")
    details = "this pr is for ..."
    body = f"""
---
Message body in this PR 
---
{details}
"""
    title = "PR title"
    head = current_name
    base = target_branch
    repo.create_pull(title, body, base, head, True)

```

