import os, time
from fastapi import FastAPI, HTTPException
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
cred = credentials.Certificate('roblox-push-first-408715-507045e2d647.json')
# FIXME don't use SA
firebase_admin.initialize_app(cred)
db = firestore.client()

class SubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class Subscription(BaseModel):
    endpoint: str # FIXME HttpUrl
    expirationTime: None = None
    keys: SubscriptionKeys

class SubscriptionWrapper(BaseModel):
    subscription: Subscription
    # our expiration time
    expirationTime: float

class Notification(BaseModel):
    message: str


@app.put("/subscriptions/{client_id}")
async def subscribed(client_id: str, subscription: Subscription):

    subs_ref = db.collection("subscriptions")

    doc_ref = subs_ref.document(client_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    wrapper = SubscriptionWrapper(
        subscription=subscription,
        expirationTime=time.time() + (60 * 60 * 24)
    )

    doc_ref.set(wrapper.model_dump())


@app.delete("/subscriptions/{client_id}")
async def subscribed(client_id: str):

    subs_ref = db.collection("subscriptions")

    doc_ref = subs_ref.document(client_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Subscription not found")

    doc_ref.set({})


@app.get("/subscriptions/{client_id}")
async def subscribed(client_id: str):

    subs_ref = db.collection("subscriptions")

    subscription = subs_ref.document(client_id).get()
    if not subscription.exists:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    return subscription.to_dict()


@app.post("/notify")
async def notify(notification: Notification):

    subs_ref = db.collection("subscriptions")

    for document in subs_ref.stream():
        wrapper = document.to_dict()
        if wrapper and time.time() < wrapper['expirationTime']:
            try:
                response = webpush(
                    subscription_info=wrapper["subscription"],
                    data=notification.message,
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims={
                        "sub": "mailto:mike.bamford@gmail.com",
                    }
                )
                print(response)
            except WebPushException as ex:
                print("Error: ", repr(ex))
                if hasattr(ex, "response") and ex.response.status_code == 410:
                    # the subscription has expired so delete
                    document.reference.set({})


# FIXME
@app.post("/log")
async def notify(notification: Notification):
    print(notification.message)
