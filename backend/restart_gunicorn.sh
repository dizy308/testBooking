#!/bin/bash
sudo systemctl restart gunicorn
echo "Gunicorn restarted!"
sudo systemctl status gunicorn