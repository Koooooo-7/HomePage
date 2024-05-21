## 基本命令
```shell
git add file_name                                     # 向暂存区添加文件
git branch                                            # 查看目前git仓库中已有的分支
git branch new_branch_name                            # 创建分支，无分支起点默认在当前提交上创建分支
git branch -d branch_name                             # 删除分支
git branch -D branch_name                             # 强制删除分支
git checkout branch_name                              # 切换分支
git checkout -b branch_name                           # 新建并切换到该分支
git checkout --file_name                             # 丢弃工作区的修改
git commit -m "commit_log"                            # 保存暂存区记录
git commit -am "commit_log"                           # 保存目录中已被跟踪的文件的暂存区记录
git clone remote_repo_url [file_path]                 # 克隆远程仓库到本地
git diff                                              # 比较工作目录和暂存区的差异
git diff HEAD^                                        # 比较工作目录与仓库中最近一次的提交间的差异
git diff -cached                                      # 比较暂存区和仓库中最近一次的提交间的差异
git fetch remote_repo_name                            # 从远程仓库抓取最新数据到本地但不与本地分支进行合并
git init                                              # 初始化仓库
git log                                               # 查看提交日志
git log --pretty=short                                # 只显示提交信息的第一行
git log file_name                                     # 只显示指定目录、文件的日志
git log -p                                            # 显示文件的改动 
git log --graph                                       # 用图形查看
git log --pretty=oneline                              # 查看简要信息
git merge branch_name                                 # 在 master 分支下进行，合并分支
git merge --no-ff -m "merge_log" branch_name          # 禁用 Fast forward 模式，并生成一个 commit
git pull origin branch_name                           # 从远程仓库抓取最新数据并自动与本地分支进行合并
git pull --rebase origin branch_name                  # 第一次拉取的时候先将本地与远程同步
git push origin branch_name                           # 将本地仓库推送到远程仓库中
git push -u origin branch_name                        # 第一次推送时将本地与远程关联起来
git push -f origin branch_name                        # 强制同步远程与本地仓库
git push origin tag_name                              # 将标签推送到远程仓库
git rm file_name                                      # 删除仓库文件
git reset --hard HEAD^                                # 回退到上一个版本
git reset --hard commit_id                            # 回退到指定的版本
git reflog                                            # 查看提交命令
git reset HEAD -- file_name                           # 撤销暂存区具体文件的修改
git remote                                            # 查看本地已经添加的远程仓库
git remote -v                                         # 可以一并查看远程仓库的地址
git remote show remote_repo_name                      # 查看远程仓库信息
git remote add origin remote_repo_url                 # 在本地添加远程仓库
git remote rm remote_repo_name                        # 删除本地添加的远程仓库
git remote rename old_name new_name                   # 重命名远程仓库
git status                                            # 查看仓库状态
git stash                                             # 隐藏工作现场
git stash list                                        # 查看工作现场
git stash apply                                       # 恢复工作现场
git stash drop                                        # 删除 stash 内容
git stash pop                                         # 恢复现场并删除 stash 内容
git show commit -commit_id                            # 查看指定 id 的提交信息
git show -all                                         # 显示提交历史
```

参考原档来源。[chenjiandongx](https://github.com/chenjiandongx/Blog/blob/master/%E5%B8%B8%E7%94%A8%20Git%20%E5%91%BD%E4%BB%A4%E6%95%B4%E7%90%86.md)

---

## Git 配置 Github 账号

```shell
git config --global user.name "your_name"             # 配置 Github 账号
git config --global user.email "your_email"           # 配置 Github 邮箱,Github 会默认用邮箱识别用户，使用user.name可以会造成非自己提交的问题
ssh-keygen -t rsa -C "your_email"                     # 设置 ssh key
cat ~/.ssh/id_rsa.pub                                 # 查看 ssh公钥
ssh -T git@github.com                                 # 与 Github 进行验证
```

---

## Github 相关命令

### 拉取PR

```shell
# 需要设置本地仓库和PR所在仓库同源(upstream)，或直接本地仓库就是原仓库clone的即可。
# /pull/<PR号#1271>/head:本地分支名<自定义>
git fetch origin  pull/1271/head:vue-demo              # 拉取PR

git remote -v                                          # 查看远程仓库信息
```

>When a repo is cloned, it has a default remote called origin that points to your fork on GitHub, not the original repo it was forked from.
>
>To keep track of the original repo, you need to add another remote named upstream
>
>`git remote add upstream git://github.com/user/repo_name.git`



### 给PR新增commit

####  fork仓库给主仓库的PR新增

> 主要是给自己参与维护的项目使用，需要PR提交的人开启`Allow edits by maintainers`。

```shell
# 在自己的folk仓库中添加一个上游，名为pr-xxx 地址为提交PR的人的folk仓库地址。
git remote add pr-xxx pr-repository.git
# 同步一下这个PR的上游分支
git fetch pr-xxx
# 检出其提交PR的分支 pr-v2-fix-xxx，并新建成v2-fix-xxx分支（因为HEAD模式你改不了）。
git checkout -b pr-v2-fix-xxx pr-xxx/v2-fix-xxx
# 造作，然后提交
git commit -am "add some new things in this PR"
# 推送，把对应更改的本地分支pr-v2-fix-xxx推送到指向远端的pr-xxx对应的HEAD。
git push pr-xxx HEAD:pr-v2-fix-xxx
```

参考[Adding Commits to Someone Else's Pull Request](https://tighten.co/blog/adding-commits-to-a-pull-request/)



#### 给当前clone仓库的PR新增

> 合作开发，给其中一个committer的PR新增新的提交。

假设PR分支为`pr-remote-branch`

```shell
# 本地新建一个branch名为track-pr去track远程的pr-remote-branch分支
git checkout -b track-pr remotes/origin/pr-remote-branch

# 正常修改和提交 ...

# 推送到原来的PR分支
git push origin HEAD:pr-remote-branch

```

直接`git push`参考提示如下。

```
❯ git push 
fatal: The upstream branch of your current branch does not match
the name of your current branch.  To push to the upstream branch
on the remote, use

    git push origin HEAD:pr-remote-branch

To push to the branch of the same name on the remote, use

    git push origin HEAD

To choose either option permanently, see push.default in 'git help config'.

```



## 分支开发与同步

> 主要是为了保证在进行提交时，不会携带上之前的提交（不同步那HEAD会始终还是folk时的指向），所以需要保持一直和上游的同步。

```shell
# clone自己folk的仓库到本地后添加上游仓库(源仓库)
git add remote upstream git://github.com/user/repo_name.git`
# 拉取源仓库最新代码
git fetch upstream
# 同步源仓库(merge,rebase)，我就比较粗暴了，直接切换到原仓库我需要的分支，比如v2
git checkout upstream/v2
# 同样的检出新分支，跳出HEAD模式
git checkout -b my-v2
# 此时该分支和源仓库是同步的，在这里造作之后，提交代码，此时因为有了不止一个上游，所以需要指定origin，即是要将my-v2推送到我们自己flok的远程仓库。
git push --set-upstream origin my-v2
```



## Git submodules

有时候会有并行更新的不同的库，而不是会定时发布稳定版本的jar依赖时候。
可以使用Git submodules结合Maven的Moudle解决依赖的问题。
即将某个依赖的仓库设置为当前仓库的子Module，也就是说当前仓库就是一个多Module的仓库了，其中某些Module属于Git submodules.
参考：
[demo-1-cn](https://xiezefan.me/2016/08/13/maven_module_with_git_sub_module/)
[demo-2-en]
[gitsubmodules-doc](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E5%AD%90%E6%A8%A1%E5%9D%97)

## 多Githun账户以及自动登录SSH
---
> Refer [using-multiple-github-accounts-with-ssh-keys](https://gist.github.com/oanhnn/80a89405ab9023894df7)

### Problem
I have two Github accounts: *oanhnn* (personal) and *superman* (for work).
I want to use both accounts on same computer (without typing password everytime, when doing git push or pull).

### Solution
Use ssh keys and define host aliases in ssh config file (each alias for an account).

### How to?
1. [Generate ssh key pairs for accounts](https://help.github.com/articles/generating-a-new-ssh-key/) and [add them to GitHub accounts](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/).
2. Edit/Create ssh config file (`~/.ssh/config`):

   ```conf
   # Default github account: oanhnn
   Host github.com
      HostName github.com
      IdentityFile ~/.ssh/oanhnn_private_key
      IdentitiesOnly yes
      
   # Other github account: superman
   Host github-superman
      HostName github.com
      IdentityFile ~/.ssh/superman_private_key
      IdentitiesOnly yes
   ```
   
3. [Add ssh private keys to your agent](https://help.github.com/articles/adding-a-new-ssh-key-to-the-ssh-agent/):

   ```shell
   $ ssh-add ~/.ssh/oanhnn_private_key
   $ ssh-add ~/.ssh/superman_private_key
   ```

4. Test your connection

   ```shell
   $ ssh -T git@github.com
   $ ssh -T git@github-superman
   ```

   With each command, you may see this kind of warning, type `yes`:

   ```shell
   The authenticity of host 'github.com (192.30.252.1)' can't be established.
   RSA key fingerprint is xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:
   Are you sure you want to continue connecting (yes/no)?
   ```

   If everything is OK, you will see these messages:

   ```shell
   Hi oanhnn! You've successfully authenticated, but GitHub does not provide shell access.
   ```
   
   ```shell
   Hi superman! You've successfully authenticated, but GitHub does not provide shell access.
   ```

5. Now all are set, just clone your repositories

   ```shell
   $ git clone git@github-superman:org2/project2.git /path/to/project2
   $ cd /path/to/project2
   $ git config user.email "superman@org2.com"
   $ git config user.name  "Super Man"
   ```


## 多Git账户以及自动登录HTTPS

开使用go mod 拉取依赖，碰到时候遇到下面的问题。
```shell
        fatal: could not read Username for 'https://domain.example.com': terminal prompts disabled
Confirm the import path was entered correctly.
If this is a private repository, see https://golang.org/doc/faq#git_https for additional information.

```

发现在不支持SSH的情况下，需要自动登录HTTPS可以通过设置`~/.netrc`。
同时可以用于下列程序： 
- git
- ftp
- curl


用于配置网络登录帐号信息的 `~/.netrc` 文件, 保存用户名密码，自动输入用户名密码。


参考   
- [How to use ftp in combination with .netrc](http://www.mavetju.org/unix/netrc.php)    

- [Go doc: Why does "go get" use HTTPS when cloning a repository?](https://go.dev/doc/faq#git_https)


## Github 如何重新打开一个被`force-push`的PR
如果我们关闭了一个PR, 然后在这个PR所在的分支有了force-push, 此时`Reopen` 的button就被disable了。

此时需要做的操作是把PR分支的commit reset到被close的PR最后一个commit hash上, 即
```
Instructions
1. Write down the current commit hash of your PR-branch git log --oneline -1 <PR-BRANCH>
2. Write down the latest commit hash on github before the PR has been closed.
git push -f origin <GITHUB-HASH-FROM-STEP-2>:<PR-BRANCH>
Reopen the PR.
```

Refer [How to reopen a pull-request after a force-push? gist](https://gist.github.com/robertpainsi/2c42c15f1ce6dab03a0675348edd4e2c)


## Git 工作原理
[Git from the inside out](https://maryrosecook.com/blog/post/git-from-the-inside-out)

## Changelog 获取commits
可以使用以下命令来获取在某个commit之后的所有commit信息的精简内容，排除包含"chore"或"ci"的commit信息：

```bash
git log --oneline --no-merges <commit_sha>..HEAD --invert-grep --grep="chore\|ci"
```

- `git log`: 显示提交日志
- `--oneline`: 以一行的形式显示每个提交的精简信息
- `--no-merges`: 排除合并提交
- `<commit_sha>..HEAD`: 从指定的commit之后到当前HEAD的所有提交
- `--invert-grep`: 反转匹配，排除包含指定关键词的提交
- `--grep="chore\|ci"`: 包含"chore"或"ci"的提交信息

将`<commit_sha>`替换为你想要的commit的SHA值或者tag值。

```shell
git log --oneline --no-merges v2.3.3..HEAD --invert-grep --grep="chore\|ci"
git log --oneline --no-merges faa30f03..HEAD --grep="chore\|ci"
```
