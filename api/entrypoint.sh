#!/usr/bin/env sh
exec gunicorn -b "0.0.0.0:$PORT" -w 1 -k uvicorn.workers.UvicornWorker --chdir ./src --timeout 60 app.main:app
