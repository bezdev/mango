#!/bin/bash

. .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

sudo cp config/mango.nginx /etc/nginx/sites-available/mango
sudo cp config/gunicorn.service /etc/systemd/system/
systemctl daemon-reload
service gunicorn restart
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
systemctl restart nginx
sudo nginx -t
