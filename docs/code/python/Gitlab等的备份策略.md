基于gitlab等的各种备份策略，服务端能上Python同学的地方，机会不能错过阿23333。
所以就就用Python去写脚本，再用Crontab定时任务去跑，一个超级简单需要不断完善的伪Demo。

#### 使用模块
`traceback`  异常追溯记录模块  
`pexpect`    多种命令自动交互模块  
使用了scp命令进行文件传输  

```python

import os
import time
import traceback
import pexpect

# local backup dir
local_path = "/home/gitlab/backup"
# remote backup dir
remote_path = "/home/gitlab/backup"
# log path
backup_log_path = "/home/gitlab/log.log"
backup_error_log_path = "/home/gitlab/error_log.log"

LINE = " ----  "
SUCCESS = "  success !!!"


# get need_backup_files list
def find_backup_files(files):
	need_backup_files = []
	current_timestamp = int(time.time())
	for file in files:
		temp = file.split("-")
		if len(temp) > 1 and temp[1] == "ee_gitlab_backup.tar":
			back_up_timestamp = int(temp[0].split("_", 1)[0])
			# get backup_files within last 12hours
			if (current_timestamp - back_up_timestamp) < (12 * 60 * 60):
				need_backup_files.append(file)
				print(back_up_timestamp)
	print(need_backup_files)
	return need_backup_files


def backup_to_remote(need_backup_files):
	start_time = time.time()
	need_backup_files_num = len(need_backup_files)
	if need_backup_files_num > 0:
		for need_backup_file in need_backup_files:
			temp = "scp  " + local_path + "/" + need_backup_file + "  user@ip_addr:" + remote_path
			child = pexpect.spawn(temp)
			child.expect('.*password:.*')
			child.sendline("yourpassword")
			# make sure your file operation complete
			child.expect('100%')  
			# child.interact()    back to  console
			child.close()

	else:
		print("zero")
	end_time = time.time()
	cost_time = int(end_time - start_time)
	format_time = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(time.time()))
	log_content = format_time + LINE + " backup files:   " + str(need_backup_files) + LINE + "   count=" + str(
		need_backup_files_num) + "   cost_time=" + str(cost_time) + SUCCESS
	log_record(log_content, backup_log_path)


# Log record
def log_record(log_content, log_path):
	with open(log_path, "a+") as f:
		f.write(log_content)
		f.write("\n")


if __name__ == '__main__':
	try:
		files = os.listdir(local_path)
	except Exception as e:
		log_record(traceback.format_exc(), backup_error_log_path)
		os.makedirs(local_path)
	else:
		need_backup_files = find_backup_files(files)
		backup_to_remote(need_backup_files)

```
