# roblox-push
Web Push Notifications For Roblox Events

```
python -m pip install pip-tools

pip-compile requirements/requirements.in
```

```
gcloud init
 1724  gcloud auth login
 1726  gcloud config set project roblox-push-first-408715
gcloud auth configure-docker europe-west2-docker.pkg.dev
# need to create artefact repository
VERSION="0.2"
docker build . --tag europe-west2-docker.pkg.dev/roblox-push-first-408715/general/roblox-push:$VERSION
docker push europe-west2-docker.pkg.dev/roblox-push-first-408715/general/roblox-push:$VERSION
gcloud run deploy roblox-push \
  --image europe-west2-docker.pkg.dev/roblox-push-first-408715/general/roblox-push:$VERSION \
  --region europe-west2 \
  --set-env-vars=ROBLOX_API_KEY=$ROBLOX_API_KEY
```

```
npm run build
cd dist
s3cmd put * s3://msb140610.me.uk-root/resources/roblox/
s3cmd put service-worker.js s3://msb140610.me.uk-root/resources/roblox/ -m "text/javascript"
```

```
http POST $APP_URL/notify message="G'day!"
```

TODO
----
- Fix client flow
- Prune expired subscriptions
- handle `pushsubscriptionchange`
- Complete config
- fix bundle size
- API different DB
- dump bootstrap in-favour of
- API auth
- https://medium.com/@a7ul/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679
- https://cloud.google.com/run/docs/deploying
