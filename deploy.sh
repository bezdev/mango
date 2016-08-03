#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

rm -rf $DIR/prod/
mkdir -p $DIR/prod/mango/

# collect all the static files
python $DIR/manage.py collectstatic --noinput

# copy files to deployment folder
rsync -av --exclude='.git' --exclude='prod' --exclude='*/migrations*' --exclude='*.pyc' --exclude='*.sh' $DIR $DIR/prod/
mv $DIR/prod/mango/.htaccess $DIR/prod/
mv $DIR/prod/mango/keefrogers.fcgi $DIR/prod/

# replace some things for production:
# settings.py
#  DEBUG = True -> False
#  STATIC_URL = '/static/' -> '/mango/static/'
#  STATIC_ROOT = 'static' -> 'www.keefrogers.com'
sed -i -e "s/DEBUG = True/DEBUG = False/" $DIR/prod/mango/mango/settings.py
sed -i -e "s/STATIC_URL = '\/static\/'/STATIC_URL = '\/mango\/static\/'/g" $DIR/prod/mango/mango/settings.py
sed -i -e "s/STATIC_ROOT = 'static'/STATIC_ROOT = 'www.keefrogers.com'/g" $DIR/prod/mango/mango/settings.py

# run rsync to deploy files on server
rsync -ravi --delete $DIR/prod/ keefroge@keefrogers.com:/home5/keefroge/www/