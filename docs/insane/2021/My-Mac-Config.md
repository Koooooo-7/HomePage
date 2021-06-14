# Vim
IDEA
`.ideavimrc`
```shell
set ideajoin
noremap H ^
noremap L $
inoremap jj <esc>
```

# Apps


- 

## Iterm2

- oh-my-zsh

  - Theme 

     kiwi

**`.zshrc`**

```shell
# enable oh my zsh plugins
source ~/.oh-my-zsh/plugins/incr/incr*.zsh
[[ -s ~/.autojump/etc/profile.d/autojump.sh ]] && . ~/.autojump/etc/profile.d/autojump.sh
eval "$(starship init zsh)"

# unable brew auto update
export HOMEBREW_NO_AUTO_UPDATE=true
# alias
alias cdd="cd  ~/"
alias cl="clear"
alias k="kubectl"
alias his="history"
eval "$(thefuck --alias fuck)"
```

