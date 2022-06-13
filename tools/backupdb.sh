#!/bin/bash

# mysql -uroot -p... mango < backups/bod.sq
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

read -s -p "mysql password: " dbpass
mysqldump -uroot -p$dbpass mango bodybuilding_cardioexercise bodybuilding_cardiotraining bodybuilding_set bodybuilding_weightexercise bodybuilding_weighttraining bodybuilding_workoutsession > $DIR/../backups/$1