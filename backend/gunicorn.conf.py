# gunicorn.conf.py
bind = "0.0.0.0:8000"
workers = 3
worker_class = "sync"
accesslog = "-"
errorlog = "-" 
loglevel = "info"
timeout = 30
daemon = False
preload_app = True