import time
from pywebpush import webpush, WebPushException
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

import src.app.roblox_client as roblox_client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    async with roblox_client.ods_client(universe_id, 'NotificationIndex') as ods_client:
        async with roblox_client.ds_client(universe_id, base_params) as ds_client:
            id = int(time.time())
            await ds_client.set_entry(id, subscription.model_dump())
            await ods_client.create(str(id), id)

    # FIXME return something else
    return subscription

@app.post("/notify")
async def notify(notification: Notification):

    async with roblox_client.ods_client(universe_id, 'NotificationIndex') as ods_client:
        async with roblox_client.ds_client(universe_id, base_params) as ds_client:
            content = await ods_client.list()
            for entry in content['entries']:
                # FIXME await all
                subscription = await ds_client.get_entry(entry['value'])
                try:
                    response = webpush(
                        subscription_info=subscription,
                        data=notification.message,
                        vapid_private_key="3PYUCgtztckmAgz8c1XYh6mZfA5vHaCZVfJQsNofHgg",
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