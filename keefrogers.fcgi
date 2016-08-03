#!/home/keefroge/bin/python/bin/python
import sys
import os

project_name = "mango"

sys.path.insert(0, "/home/keefroge/bin/python")
sys.path.append(os.getcwd() + "/" + project_name)
 
os.environ["DJANGO_SETTINGS_MODULE"] = project_name + ".settings"

from django.core.servers.fastcgi import runfastcgi
runfastcgi(method="threaded", daemonize="false")