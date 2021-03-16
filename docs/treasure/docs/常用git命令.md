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

