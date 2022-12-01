#!/usr/bin/env python
import os
import sys

def main(args):
    print('bez start')

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mango.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(args)

if __name__ == "__main__":
    main(sys.argv)
