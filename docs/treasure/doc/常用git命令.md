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

## Git 配置 Github 账号
```shell
git config --global user.name "your_name"             # 配置 Github 账号
git config --global user.email "your_email"           # 配置 Github 邮箱
ssh-keygen -t rsa -C "your_email"                     # 设置 ssh key
cat ~/.ssh/id_rsa.pub                                 # 查看 ssh公钥
ssh -T git@github.com                                 # 与 Github 进行验证
```

原档来源。[chenjiandongx](https://github.com/chenjiandongx/Blog/blob/master/%E5%B8%B8%E7%94%A8%20Git%20%E5%91%BD%E4%BB%A4%E6%95%B4%E7%90%86.md)
