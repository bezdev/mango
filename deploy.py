import os
import subprocess
import shutil
import argparse
import json
import sys
import manage

parser = argparse.ArgumentParser(description="mango deploy")
parser.add_argument('--deploy', action='store_true', help='deploy to production')
args = parser.parse_args()

OUTPUT_NAME = 'prod'
BASE_DIR = os.path.dirname(os.path.realpath(__file__))
CONFIG = BASE_DIR + "/private/config.json"
MANAGE_PY = BASE_DIR + "/manage.py"
OUTPUT_DIR = BASE_DIR + "/" + OUTPUT_NAME + "/"
OUTPUT_SETTINGS = OUTPUT_DIR + 'mango/settings.py'

# READ CONFIG FILE
print('read config file ...')
f = open(CONFIG, 'r')
config = json.loads(f.read())
SERVER_USER = config['Username']
SERVER_DIRECTORY = config['ServerDirectory']

# CREATE DIRECTORY
print('create {}...'.format(OUTPUT_NAME))
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)
 
# # COLLECT STATIC
print('collectstatic ...')
manage.main(['manage.py', 'collectstatic', '--noinput'])

# COPY FILES
print('copy files ...')
ignore = shutil.ignore_patterns(
    '*.pyc',
    '*__pycache__*',
    '*migrations*',
    '*tests*',
    '.git*',
    'deploy.py',
    'prod*',
)
shutil.copytree('./', OUTPUT_DIR, ignore=ignore)

# CHANGE FILES
print('change files ...')
with open(OUTPUT_SETTINGS, 'r') as file:
    filedata = file.read()

filedata = filedata.replace("DEBUG = True", "DEBUG = False")
filedata = filedata.replace("['127.0.0.1']", config["AllowedHosts"])
filedata = filedata.replace("<SECRET_KEY>", config['SecretKey'])
filedata = filedata.replace("'USER': 'root',", "'USER': '{}',".format(config['DatabaseUsername']))
filedata = filedata.replace("'PASSWORD': 'adidas',", "'PASSWORD': '{}',".format(config['DatabasePassword']))

with open(OUTPUT_SETTINGS, 'w') as file:
  file.write(filedata)

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
        'quit',
    ]

    for cmd in cmds:
        p.stdin.write(str(cmd + '\n').encode('utf-8'))
    p.stdin.close()
    for line in p.stdout.read().decode("utf-8"):
        print(line, end='')

    p.kill()
