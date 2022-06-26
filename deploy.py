import ftplib
import ssl
import os
import subprocess
import shutil
import argparse

# sftp instructions:
# > sftp root@137.184.186.70
# sftp> cd projects/mango
# sftp> lcd s:\projects\mango_official
# sftp> put -r <outputName>

parser = argparse.ArgumentParser(description="mango deploy")
parser.add_argument('--deploy', action='store_true', help='deploy to production')
args = parser.parse_args()

outputName = 'prod2'
scriptDirectory = os.path.dirname(os.path.realpath(__file__))
outputDirectory = scriptDirectory + "/" + outputName + "/"
outputSettings = outputDirectory + 'mango/settings.py'
serverUser = 'root@137.184.186.70'
serverProjectDirectory = '/home/bez/projects/mango'

print('create {}...'.format(outputName))

if os.path.exists(outputDirectory):
    shutil.rmtree(outputDirectory)
 
# COPY FILES
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

shutil.copytree('./', outputDirectory, ignore=ignore)

# CHANGE FILES
with open(outputSettings, 'r') as file:
    filedata = file.read()

filedata = filedata.replace("'USER': 'root',", "'USER': 'bez',")
filedata = filedata.replace("'PASSWORD': 'adidas',", "'PASSWORD': 'RuneMaster7',")

with open(outputSettings, 'w') as file:
  file.write(filedata)

print('finished copy...')

if (args.deploy):
    print('deploy...')
    # SFTP
    p = subprocess.Popen('sftp ' + serverUser, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    cmds = [
        'cd ' + serverProjectDirectory,
        'lcd ' + scriptDirectory,
        'pwd',
        'lpwd',
        'put -r ' + outputName,
    ]

    for cmd in cmds:
        p.stdin.write(str(cmd + '\n').encode('utf-8'))
    p.stdin.close()
    for line in p.stdout.read().decode("utf-8"):
        print(line, end='')


# DEAD CODE:
# context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# context.load_verify_locations('./suh')
# session = ftplib.FTP('137.184.186.70', 'root', context=context)
# session.quit()

# os.system('ssh root@137.184.186.70')
# os.system('ls -l')

# p = subprocess.Popen('cmd.exe', stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# cmds = ['ssh root@137.184.186.70', 'ls -l']
# for cmd in cmds:
#     p.stdin.write(str(cmd + '\n').encode('utf-8'))
# p.stdin.close()
# print(p.stdout.read())


# p = subprocess.Popen('ssh root@137.184.186.70', stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# cmds = [
#     'ls'
# ]

# for cmd in cmds:
#     p.stdin.write(str(cmd + '\n').encode('utf-8'))
# p.stdin.close()
# for line in p.stdout.read().decode("utf-8"):
#     print(line, end='')

# p = subprocess.Popen('cmd.exe', stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# cmds = ['ssh root@137.184.186.70', 'ls -l']
# for cmd in cmds:
#     p.stdin.write(str(cmd + '\n').encode('utf-8'))
#     if (p.poll() == None):
#         print('continue')
#         continue

# poll
# p.stdin.close()
# for line in p.stdout.read().decode("utf-8"):
#     print(line, end='')
