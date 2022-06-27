import ftplib
import ssl
import os
import subprocess
import shutil
import argparse
import json

# sftp instructions:
# > sftp root@137.184.186.70
# sftp> cd projects/mango
# sftp> lcd s:\projects\mango_official
# sftp> put -r <OUTPUT_NAME>

parser = argparse.ArgumentParser(description="mango deploy")
parser.add_argument('--deploy', action='store_true', help='deploy to production')
args = parser.parse_args()

OUTPUT_NAME = 'prod'
BASE_DIR = os.path.dirname(os.path.realpath(__file__))
CONFIG = BASE_DIR + "/config.json"
OUTPUT_DIR = BASE_DIR + "/" + OUTPUT_NAME + "/"
OUTPUT_SETTINGS = OUTPUT_DIR + 'mango/settings.py'

# READ CONFIG FILE
print('read config file ...')
f = open (CONFIG, 'r')
config = json.loads(f.read())
SERVER_USER = config['UserName']
SERVER_DIRECTORY = config['ServerDirectory']

# CREATE DIRECTORY
print('create {}...'.format(OUTPUT_NAME))
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)
 
# COPY FILES
print('copy files ...')
ignore = shutil.ignore_patterns(
    '*.pyc',
    '*.sh',
    '*__pycache__*',
    '*migrations*',
    '*tests*',
    '.git*',
    '.htaccess',
    'db.sqlite3',
    'deploy.py',
    'deploy.sh',
    'keefrogers.fcgi',
    'prod*',
    'suh*',
)

shutil.copytree('./', OUTPUT_DIR, ignore=ignore)

# CHANGE FILES
with open(OUTPUT_SETTINGS, 'r') as file:
    filedata = file.read()

filedata = filedata.replace("'USER': 'root',", "'USER': 'bez',")
filedata = filedata.replace("'PASSWORD': 'adidas',", "'PASSWORD': 'RuneMaster7',")

with open(OUTPUT_SETTINGS, 'w') as file:
  file.write(filedata)

print('finished copy...')

if (args.deploy):
    print('deploy...')
    # SFTP
    p = subprocess.Popen('sftp ' + SERVER_USER, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    cmds = [
        'cd ' + SERVER_DIRECTORY,
        'lcd ' + BASE_DIR,
        'pwd',
        'lpwd',
        'put -r ' + OUTPUT_NAME,
    ]

    for cmd in cmds:
        p.stdin.write(str(cmd + '\n').encode('utf-8'))
    p.stdin.close()
    for line in p.stdout.read().decode("utf-8"):
        print(line, end='')
