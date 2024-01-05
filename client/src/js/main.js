import { setClientId, getClientId } from './db';

// Import our custom CSS
import '../css/styles.css'


if (!('serviceWorker' in navigator)) {
  // No Service Worker support!
  // No Push API Support!
  document.getElementById("noSw").classList.remove("d-none");
}

if (!('PushManager' in window)) {
  document.getElementById("noPushApi").classList.remove("d-none");
}

function getActiveServiceWorker(registration) {
  return new Promise((resolve, reject) => {
    let serviceWorker;
    if (registration.installing) {
      serviceWorker = registration.installing;
    } else if (registration.waiting) {
      serviceWorker = registration.waiting;
    } else if (registration.active) {
      serviceWorker = registration.active;
      resolve(registration.active)
    }
    if (serviceWorker) {
      serviceWorker.addEventListener("statechange", (e) => {
        if (e.target.state == "redundant") {
          console.log("FIXME: redundant (how?)")
        }
        if (registration.active) {
          resolve(registration.active)
        }
      });
    } else {
      reject("no service worker!")
    }
  })
}

if ("serviceWorker" in navigator) {

  window.addEventListener('load', async () => {

    // enable 
    const allowNotificationsBtn = document.getElementById("allowNotifications")

    if (Notification.permission != "granted") {
        allowNotificationsBtn.classList.remove("d-none");
    }

    allowNotificationsBtn.addEventListener("click", async () => {
      const permission = await window.Notification.requestPermission()
      // value of permission can be 'granted', 'default', 'denied'
      // granted: user has accepted the request
      // default: user has dismissed the notification permission popup
      // denied: user has denied the request.
      if (permission !== 'granted') {
        throw new Error('Permission not granted for Notification')
      }
      allowNotificationsBtn.classList.add("d-none")
    })
    
    navigator.serviceWorker.ready.then(registration => {  
      return registration.pushManager.getSubscription();  
    }).then(subscription => {  
      if (!subscription) {  
        console.log('No subscription 😞');  
        return;  
      }
      console.log('Here are the options 🎉');  
      console.log(subscription.options);  
    });

    const registration = await navigator.serviceWorker.register("service-worker.js")

    const unregisterBtn = document.getElementById("unregisterSw")
    
    unregisterBtn.addEventListener("click", async () => {
      await registration.unregister()
      unregisterBtn.classList.add("d-none")
    })

    const clientIdInput = document.getElementById("clientId")
    clientIdInput.value = await getClientId()

    const subscribeBtn = document.getElementById("subscribe")

    const serviceWorker = await getActiveServiceWorker(registration)
    subscribeBtn.disabled = false

    subscribeBtn.addEventListener("click", async () => {
      await setClientId(clientIdInput.value)
      serviceWorker.postMessage({type: "subscribe"})
    })
  })
}
