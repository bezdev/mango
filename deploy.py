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
CONFIG = BASE_DIR + "/config/config.json"
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
 
print('collectstatic ...')
manage.main(['manage.py', 'collectstatic', '--noinput'])

print('gather files ...')
ignore = shutil.ignore_patterns(
    '*.pyc',
    '*__pycache__*',
    '*migrations*',
    '*tests*',
    '.git*',
    'deploy.py',
    'prod*',
    'files*',
    '.venv*',
    '.vscode'
)
shutil.copytree('./', OUTPUT_DIR, ignore=ignore)

# CHANGE FILES
print('change files ...')
settings_file = ""
with open(OUTPUT_SETTINGS, 'r') as file:
    settings_file = file.read()

settings_file = settings_file.replace("DEBUG = True", "DEBUG = False")
settings_file = settings_file.replace("['127.0.0.1']", config["AllowedHosts"])
settings_file = settings_file.replace("<SECRET_KEY>", config['SecretKey'])
settings_file = settings_file.replace("'USER': 'leo',", "'USER': '{}',".format(config['DatabaseUsername']))
settings_file = settings_file.replace("'PASSWORD': 'password',", "'PASSWORD': '{}',".format(config['DatabasePassword']))

with open(OUTPUT_SETTINGS, 'w') as file:
    file.write(settings_file)

if (args.deploy):
    print('deploy ...')

    sshProc = subprocess.Popen(["ssh", SERVER_USER], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print('deleting files on server ...')
    cmds = [
        'cd ' + SERVER_DIRECTORY,
        'find . ! -path "./.venv*" ! -path "./files*" ! -path "." ! -path ".." -type d -exec rm -f -r {} +',
        'echo "delete completed."'
    ]
    for cmd in cmds:
        sshProc.stdin.write(str(cmd + '\n').encode('utf-8'))
    sshProc.stdin.close()
    for line in sshProc.stdout.read().decode("utf-8"):
        if ("delete completed" in line):
            print(line, end='')
    sshProc.kill()

    sftpProc = subprocess.Popen(["sftp", SERVER_USER], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print('copying files ...')
    cmds = [
        'cd ' + SERVER_DIRECTORY,
        'lcd ' + BASE_DIR + '/prod',
        'pwd',
        'lpwd',
        'put -r .',
        'quit',
    ]
    for cmd in cmds:
        sftpProc.stdin.write(str(cmd + '\n').encode('utf-8'))
    sftpProc.stdin.close()
    for line in sftpProc.stdout.read().decode("utf-8"):
        if ("quit" in line):
            print("copying files completed.")
    sftpProc.kill()

    sshProc = subprocess.Popen(["ssh", SERVER_USER], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print('running migrations ...')
    print('restarting services ...')
    cmds = [
        'cd ' + SERVER_DIRECTORY,
        'source .venv/bin/activate',
        'python manage.py migrate',
        'sh deploy.sh'
    ]
    for cmd in cmds:
        sshProc.stdin.write(str(cmd + '\n').encode('utf-8'))
    sshProc.stdin.close()
    sshProc.kill()
