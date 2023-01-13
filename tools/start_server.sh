#!/bin/sh

sudo cp /home/bez/projects/mango/config/mango.nginx /etc/nginx/sites-available/mango
sudo cp /home/bez/projects/mango/config/gunicorn.service /etc/systemd/system/
sudo cp /home/bez/projects/mango/config/gunicorn.socket /etc/systemd/system/

sudo systemctl daemon-reload
sudo service gunicorn restart
sudo systemctl status gunicorn
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
sudo systemctl status gunicorn.socket
sudo systemctl restart nginx
sudo nginx -t