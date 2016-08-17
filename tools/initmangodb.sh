#!/bin/bash

# Delete migrations before running this script

echo "delete and create mango database"
mysql -u root -p < tools/initmangodb.sql

echo "migrate database changes"
python manage.py makemigrations bodybuilding
python manage.py migrate

echo "create superuser"
python manage.py createsuperuser