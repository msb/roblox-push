import isEmpty from 'lodash/isEmpty'

import { getClientId } from './db';
import { getSubscription, putSubscription, deleteSubscription, postLog } from './api.js';
import config from 'config';

// `urlB64ToUint8Array` is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option.
const urlB64ToUint8Array = base64String => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const log = async (message) => {
  console.log(message)
  const clientId = await getClientId()
  if (clientId) {
    postLog(clientId, message)
  }
}

self.addEventListener('activate', async () => {
  log('server Worker activated')
})

self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "subscribe") {
    const clientId = await getClientId()
    if (clientId) {
      const result = await getSubscription(clientId)
      if (!isEmpty(result)) {
        log('there is already a subscription')
      }
      const options = {
        applicationServerKey: urlB64ToUint8Array(config.vapidKeyPublic),
        userVisibleOnly: true
      }
      const subscription = await self.registration.pushManager.subscribe(options)
      await putSubscription(clientId, subscription)
    }
  }
  if (event.data && event.data.type === "unsubscribe") {
    const clientId = await getClientId()
    if (clientId) {
      const result = await getSubscription(clientId)
      if (isEmpty(result)) {
        log('there is no subscription')
      }
      const subscription = await self.registration.pushManager.getSubscription()
      await subscription.unsubscribe()
      await deleteSubscription(clientId)
    }
  }
})

self.addEventListener("push", function(event) {
  let message = "No data"
  if (event.data) {
    message = event.data.text()
  }
  
  console.log("Push event", message)
  self.registration.showNotification("FlipQuake", {
    body: message
  })
})

self.addEventListener('pushsubscriptionchange', async e => {  
  const clientId = await getClientId()
  if (clientId) {
    const subscription = await registration.pushManager.subscribe(e.oldSubscription.options)
    await putSubscription(clientId, subscription)
  }
});
