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

function handleAllowNotificationsButton() {
  const button = document.getElementById("allowNotifications")

  if (Notification.permission != "granted") {
    button.classList.remove("d-none");
  }

  button.addEventListener("click", async () => {
    const permission = await window.Notification.requestPermission()
    // value of permission can be 'granted', 'default', 'denied'
    // granted: user has accepted the request
    // default: user has dismissed the notification permission popup
    // denied: user has denied the request.
    if (permission !== 'granted') {
      throw new Error('Permission not granted for Notification')
    }
    button.classList.add("d-none")
  })
}

async function handleRegistrationButtons() {
  const registrations = await navigator.serviceWorker.getRegistrations()

  const unregister = document.getElementById("unregister")
  const register = document.getElementById("register")

  if (registrations.length > 0) {
    unregister.classList.remove("d-none")
  } else {
    register.classList.remove("d-none")
  }

  register.addEventListener("click", async () => {
    await navigator.serviceWorker.register("service-worker.js")
    unregister.classList.remove("d-none")
    register.classList.add("d-none")
  })

  unregister.addEventListener("click", async () => {
    registrations[0].unregister()
    unregister.classList.add("d-none")
    register.classList.remove("d-none")
  })
}

if ("serviceWorker" in navigator) {

  window.addEventListener('load', async () => {

    handleAllowNotificationsButton()

    await handleRegistrationButtons()

    const clientIdInput = document.getElementById("clientId")
    clientIdInput.value = await getClientId()

    clientIdInput.addEventListener("input", async (event) => {
      await setClientId(event.target.value)

      if (clientIdInput.value) {
        subscriptionGroup.classList.remove("d-none")
      } else {
        subscriptionGroup.classList.add("d-none")
      }
    })

    const subscriptionGroup = document.getElementById("subscription")

    if (clientIdInput.value) {
      subscriptionGroup.classList.remove("d-none")
    }
  })
    
  window.addEventListener('load', async () => {

    const registration = await navigator.serviceWorker.ready

    const subscription = await registration.pushManager.getSubscription()

    const clientIdInput = document.getElementById("clientId")
    const subscribeBtn = document.getElementById("subscribe")
    const unsubscribeBtn = document.getElementById("unsubscribe")

    if (subscription) {  
      unsubscribeBtn.classList.remove("d-none")
    } else {
      subscribeBtn.classList.remove("d-none")
    }

    clientIdInput.disabled = !!subscription

    subscribeBtn.addEventListener("click", async () => {
      navigator.serviceWorker.controller.postMessage({type: "subscribe"})
      subscribeBtn.classList.add("d-none")
      unsubscribeBtn.classList.remove("d-none")
      clientIdInput.disabled = true
    })

    unsubscribeBtn.addEventListener("click", async () => {
      navigator.serviceWorker.controller.postMessage({type: "unsubscribe"})
      unsubscribeBtn.classList.add("d-none")
      subscribeBtn.classList.remove("d-none")
      clientIdInput.disabled = false
    })
  })
}
