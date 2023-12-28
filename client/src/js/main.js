// Import our custom CSS
import '../scss/styles.scss'

if (!('serviceWorker' in navigator)) {
  document.getElementById("no-sw").classList.remove("d-none");
}

if (!('PushManager' in window)) {
  document.getElementById("no-push-api").classList.remove("d-none");
}

const allowNotificationsBtn = document.getElementById("allow-notifications")

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

const serviceWorkerUrl = 'service-worker.js'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register(serviceWorkerUrl)

    const unregisterBtn = document.getElementById("unregister-sw")
    
    unregisterBtn.addEventListener("click", async () => {
      await registration.unregister()
      unregisterBtn.classList.add("d-none")
    })
  });
}

