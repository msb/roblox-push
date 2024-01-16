# roblox-push

The purpose of this project is to allow a game developer to subscribe to
[Web Push Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
for events in a Roblox Experience. It is intended to be deployed to
[GCP](https://cloud.google.com/gcp) as it makes use of [Firestore](https://firebase.google.com/).
It consists of the following sub-projects:

- `client` is a web app with a service worker that subscribes the user to push notifications and
  displays any notifications received.
- `api` implements an API that allows the `client` to save subscription in a firestore

It could be generalised.

- api
- client

```
python -m pip install pip-tools

pip-compile requirements/requirements.in

uvicorn src.app.main:app --reload
```

```
VERSION="0.6"
PROJECT="meta-roblox-ec9e02"
LOCATION="europe-west2"
gcloud init
gcloud auth login
gcloud config set project $PROJECT
gcloud auth configure-docker $LOCATION-docker.pkg.dev
# need to create artefact repository
IMAGE_TAG="$LOCATION-docker.pkg.dev/$PROJECT/default-repository/roblox-push:$VERSION"
docker build . --tag $IMAGE_TAG
docker push $IMAGE_TAG
gcloud run deploy roblox-push \
  --image $IMAGE_TAG \
  --region $LOCATION \
  --set-env-vars=VAPID_PRIVATE_KEY=$VAPID_PRIVATE_KEY
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
- New Vapid Keys
- Fix client flow
- Prune expired subscriptions
- handle `pushsubscriptionchange`
- Complete config
- fix bundle size
- API different DB
- dump bootstrap in-favour of
- API auth
- https://firebase.google.com/docs/firestore/quickstart#optional_prototype_and_test_with
- https://medium.com/@a7ul/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679
- https://cloud.google.com/run/docs/deploying
- https://www.robinwieruch.de/webpack-font/
