import config from "./config.js"

const getSubscription = async (clientId) => {
  const url = `${config.apiUrl}/subscriptions/${clientId}`
  const response = await fetch(url, {method: 'GET'})
  if (!response.ok) {
    throw new Error((await response.json()).detail)
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
    throw new Error((await response.json()).detail)
  }
}

const deleteSubscription = async (clientId) => {
  const url = `${config.apiUrl}/subscriptions/${clientId}`
  const response = await fetch(url, {method: 'DELETE'})
  if (!response.ok) {
    throw new Error((await response.json()).detail)
  }
  return response.json()
}

const postLog = async (clientId, message) => {
  const url = `${config.apiUrl}/log/${clientId}`
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message}),
  })
  if (!response.ok) {
    throw new Error((await response.json()).detail)
  }
}

export {getSubscription, putSubscription, deleteSubscription, postLog}
