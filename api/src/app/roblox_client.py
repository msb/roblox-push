from contextlib import asynccontextmanager
import os
import httpx
import time

# The base url for the Roblox API
RBX_API_URL = 'https://apis.roblox.com/'

# The base url for the Data Store API
DATASTORE_URL = RBX_API_URL + 'datastores/v1/universes/'

# The base url for the Ordered Data Store API
ORDERED_DATASTORE_URL = (
    RBX_API_URL + 'ordered-data-stores/v1/universes/{}/orderedDataStores/{}/scopes/{}/entries'
)

# The maximum number of retries 
MAX_RETRIES = 5

# authenticated API calls
headers = {'x-api-key': os.environ['ROBLOX_API_KEY']}


class AsyncClientBase:
    """
    A base class for async Roblox API request clients.
    """
    def __init__(self, client):
        # The total number of retries (from rate limiting fails) for the session
        self.retries = 0
        # An instance of `httpx.AsyncClient`
        self.client = client

    async def _request(self, *args, attempt=1, **kwargs):
        """
        Attempts to execute a request and parse the response.
        If a `Too Many Requests` (429) error response is returned
        the function waits for `2 ** attempt`
        then recurses incrementing `attempt` up to `MAX_RETRIES` times.
        """
        response = await self.client.request(*args, **kwargs)
        if response.status_code in (httpx.codes.TOO_MANY_REQUESTS, httpx.codes.BAD_GATEWAY):
            if attempt <= MAX_RETRIES:
                time.sleep(2 ** attempt)
                self.retries += 1
                return await self._request(*args, attempt=(attempt + 1), **kwargs)
        response.raise_for_status()
        if response.status_code != httpx.codes.NO_CONTENT:
            return response.json()


class AsyncDataStoreClient(AsyncClientBase):
    """
    Wraps a `httpx.AsyncClient` with specific methods for using the Data Store API.
    """
    def __init__(self, client, universe_id, **base_params):
        super().__init__(client)
        # The base Data Store API url for a given place
        self.url = f'{DATASTORE_URL}{universe_id}/standard-datastores'
        # Parameters applied to all requests
        self.base_params = base_params

    async def list_datastores(self, **kwargs):
        """
        Lists a page of the names of the datastore belonging to an experience.
        Subsequent pages are requested with the `cursor` param.
        """
        return await self._request(
            'GET', self.url, params={**self.base_params, **kwargs}
        )

    async def list_entries(self, **kwargs):
        """
        Lists a page of entry keys for a given datastore.
        Subsequent pages are requested with the `cursor` param.
        """
        return await self._request(
            'GET', self.url + '/datastore/entries', params={**self.base_params, **kwargs}
        )

    async def get_entry(self, entry_key, **kwargs):
        """
        Retrieves an entry for a given key for a given datastore.
        """
        return await self._request('GET', self.url + '/datastore/entries/entry', params={
            'entryKey': entry_key, **self.base_params, **kwargs
        })

    async def set_entry(self, entry_key, data, **kwargs):
        """
        Set an entry for a given key for a given datastore.
        """
        url = self.url + '/datastore/entries/entry'

        return await self._request('POST', url, json=data, params={
            'entryKey': entry_key, **self.base_params, **kwargs
        })

    async def delete_entry(self, entry_key, **kwargs):
        """
        Marks an entry for a given key for a given datastore as deleted.
        The `datastoreName` request param must be given either with `base_params` or with `kwargs`.
        """
        return await self._request('DELETE', self.url + '/datastore/entries/entry', params={
            'entryKey': entry_key, **self.base_params, **kwargs
        })


class AsyncOrderedDataStoreClient(AsyncClientBase):
    """
    Wraps a `httpx.AsyncClient` with specific methods for using the Ordered Data Store API.
    """
    def __init__(self, client, universe_id, ods_name, scope):
        super().__init__(client)
        # The base Data Store API url for the given args
        self.url = ORDERED_DATASTORE_URL.format(universe_id, ods_name, scope)

    async def list(self, **kwargs):
        """
        Lists a page of entries for a given datastore. Subsequent pages are requested
        with the `page_token` param.
        """
        return await self._request('GET', self.url, params=kwargs)

    async def create(self, id, value, **kwargs):
        """
        Creates an entry for a given `id` & `value`.
        """
        return await self._request(
            'POST', self.url, json={"value": value}, params={"id": id, **kwargs}
        )

    async def delete(self, entry_id, **kwargs):
        """
        Deletes an entry for a given key.
        """
        return await self._request('DELETE', f'{self.url}/{entry_id}')


@asynccontextmanager
async def ds_client(universe_id, base_params={}, **kwargs):
    """
    An `async` context manager that yields an `AsyncDataStoreClient`
    for a given place and data store.
    """
    async with httpx.AsyncClient(headers=headers, **kwargs) as client:
        yield AsyncDataStoreClient(client, universe_id, **base_params)


@asynccontextmanager
async def ods_client(universe_id, ods_name, scope='global', **kwargs):
    """
    An `async` context manager that yields an `AsyncOrderedDataStoreClient`
    for a given place and data store.
    """
    async with httpx.AsyncClient(headers=headers, **kwargs) as client:
        yield AsyncOrderedDataStoreClient(client, universe_id, ods_name, scope)

