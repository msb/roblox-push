import isEmpty from 'lodash/isEmpty'

import { getClientId } from './db';
import { getSubscription, putSubscription, postLog } from './api.js';
import config from "./config.js"

// urlB64ToUint8Array is a magic function that will encode the base64 public key
// to Array buffer which is needed by the subscription option
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
  console.log(`log: ${message}`)
  const clientId = await getClientId()
  if (clientId) {
    postLog(message)
  }
}

self.addEventListener('activate', async () => {
  log('Server Worker: activate')
})

self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "subscribe") {
    const clientId = await getClientId()
    if (clientId) {
      const result = await getSubscription(clientId)
      // FIXME
      if (isEmpty(result)) {
        // This will be called only once when the service worker is activated.
        try {
          const options = {
            applicationServerKey: urlB64ToUint8Array(config.vapidKeyPublic),
            userVisibleOnly: true
          }
          const subscription = await self.registration.pushManager.subscribe(options)
          await putSubscription(clientId, subscription)
        } catch (err) {
          console.log('Error', err)
        }
      }
    }
  }
})

self.addEventListener("push", function(event) {
  if (event.data) {
    console.log("Push event: ", event.data.text())
    self.registration.showNotification("FlipQuake", {
      body: event.data.text()
    })
  } else {
    console.log("Push event but no data")
  }
})

self.addEventListener('pushsubscriptionchange', async e => {  
  const clientId = await getClientId()
  if (clientId) {
    const subscription = await registration.pushManager.subscribe(e.oldSubscription.options)
    await putSubscription(clientId, subscription)
  }
});

// // From service-worker.js:
// const channel = new BroadcastChannel('sw-messages');
// channel.postMessage({title: 'Hello from SW'});

// // From your client pages:
// const channel = new BroadcastChannel('sw-messages');
// channel.addEventListener('message', event => {
//     console.log('Received', event.data);
// });