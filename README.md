# roblox-push
Web Push Notifications For Roblox Events

```
python -m pip install pip-tools

pip-compile requirements/requirements.in
```

```
   36  gcloud init
   47  gcloud auth configure-docker     europe-west2-docker.pkg.dev
   need to create artefact repository
   45  docker build . --tag europe-west2-docker.pkg.dev/roblox-push-first-408715/general/roblox-push:0.1
   46  docker push europe-west2-docker.pkg.dev/roblox-push-first-408715/general/roblox-push:0.1
   need command to create cloud run service
```

```
s3cmd put * s3://msb140610.me.uk-root/resources/roblox/
```

TODO
----
- Fix client flow
- Complete config
- https://medium.com/@a7ul/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679
