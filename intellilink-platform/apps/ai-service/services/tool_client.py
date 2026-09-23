import httpx
from config import API_BASE_URL

class ToolClient:
    def __init__(self):
        self.base_url = API_BASE_URL

    async def get(self, endpoint: str, params: dict = None, token: str = None) -> dict:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.get(f"{self.base_url}/{endpoint}", params=params, headers=headers)
                if resp.status_code == 200:
                    return resp.json()
            except Exception as e:
                pass
            return {}

    async def post(self, endpoint: str, json_data: dict = None, token: str = None) -> dict:
        headers = {}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                resp = await client.post(f"{self.base_url}/{endpoint}", json=json_data, headers=headers)
                if resp.status_code in [200, 201]:
                    return resp.json()
            except Exception as e:
                pass
            return {}
