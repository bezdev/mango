sudo cp config/mango.nginx /etc/nginx/sites-available/mango
sudo cp config/gunicorn.service /etc/systemd/system/
systemctl daemon-reload
service gunicorn restart
systemctl restart nginx
sudo nginx -t
