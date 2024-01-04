import isEmpty from 'lodash/isEmpty'

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

const getSubscription = async (clientId) => {
  const url = `${config.apiUrl}/subscriptions/${clientId}`
  const response = await fetch(url, {method: 'GET'})
  if (response.status == 404) {
    throw new Error("clientId not known")
  }
  return response.json()
}

const putSubscription = async (clientId, subscription) => {
  const url = `${config.apiUrl}/subscriptions/${clientId}`
  const response = await fetch(url, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(subscription),
  })
  if (!response.ok) {
    throw new Error("Error:" + await response.text())
  }
}

const weblog = async (message) => {
  const url = `${config.apiUrl}/log`
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message}),
  })
  if (!response.ok) {
    throw new Error("Error:" + await response.text())
  }
}

self.addEventListener('activate', async () => {
  weblog('Server Worker: activate')
})

self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "subscribe") {
    const result = await getSubscription(event.data.clientId)
    if (isEmpty(result) || (result.timestamp < Date.now())) {
      // This will be called only once when the service worker is activated.
      try {
        const options = {
          applicationServerKey: urlB64ToUint8Array(config.vapidKeyPublic),
          userVisibleOnly: true
        }
        const subscription = await self.registration.pushManager.subscribe(options)
        await putSubscription(event.data.clientId, subscription)
      } catch (err) {
        console.log('Error', err)
      }
    }
  }
})

self.addEventListener("push", function(event) {
  if (event.data) {
    console.log("Push event: ", event.data.text())
    self.registration.showNotification("FlipQuake", {
      body: event.data.text()
      // here you can add more properties like icon, image, vibrate, etc.
    })
  } else {
    console.log("Push event but no data")
  }
})

self.addEventListener('pushsubscriptionchange', async e => {  
  const subscription = await registration.pushManager.subscribe(e.oldSubscription.options)
  // FIXME
  await putSubscription(event.data.clientId, subscription)
});
