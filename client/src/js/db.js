import Dexie from 'dexie';

var db = new Dexie("RobloxPush");

db.version(1).stores({
  properties: `name, value`
})

async function setClientId(clientId) {
  await db.properties.put({name: "clientId", value: clientId})
}

async function getClientId() {
  const clientIdProp = await db.properties.where("name").equals("clientId").first()
  if (clientIdProp) {
    return clientIdProp.value
  }
}

export {setClientId, getClientId}
