import uuid, os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import firestore, credentials
from pywebpush import webpush, WebPushException

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VAPID_PRIVATE_KEY = os.environ['VAPID_PRIVATE_KEY']

# Application Default credentials are automatically created.
# cred = credentials.Certificate('roblox-push-first-408715-507045e2d647.json')
# FIXME don't use SA
firebase_admin.initialize_app()
db = firestore.client()

class SubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class Subscription(BaseModel):
    endpoint: str # FIXME HttpUrl
    expirationTime: None = None
    keys: SubscriptionKeys

class Notification(BaseModel):
    message: str

# FIXME
universe_id = '4480489854'

base_params = {'datastoreName': 'Notification'}

@app.post("/subscribed")
async def subscribed(subscription: Subscription):

    subs_ref = db.collection("subscriptions")

    doc_ref = subs_ref.document(str(uuid.uuid4()))
    doc_ref.set(subscription.model_dump())

    # FIXME return something else
    return subscription

@app.post("/notify")
async def notify(notification: Notification):

    subs_ref = db.collection("subscriptions")

    subscriptions = subs_ref.stream()

    for subscription in subscriptions:
        try:
            response = webpush(
                subscription_info=subscription.to_dict(),
                data=notification.message,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={
                    "sub": "mailto:mike.bamford@gmail.com",
                }
            )
            print(response)
        except WebPushException as ex:
            print("I'm sorry, Dave, but I can't do that: {}", repr(ex))
            # Mozilla returns additional information in the body of the response.
            if ex.response and ex.response.json():
                extra = ex.response.json()
                print("Remote service replied with a {}:{}, {}",
                    extra.code,
                    extra.errno,
                    extra.message
                )
