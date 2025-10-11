#!/bin/bash
cd /home/dinh-duy/LocalProject/testBooking/backend
gunicorn -c gunicorn.conf.py cfghome.wsgi:application