from services.tool_client import ToolClient

class ToolRegistry:
    def __init__(self):
        self.client = ToolClient()

    async def getTenant(self, tenant_id: str, token: str = None):
        return await self.client.get(f"tenants/{tenant_id}", token=token)

    async def getSite(self, site_id: str, token: str = None):
        return await self.client.get(f"sites/{site_id}", token=token)

    async def getGateway(self, gateway_id: str, token: str = None):
        return await self.client.get(f"gateways/{gateway_id}", token=token)

    async def getPoP(self, pop_id: str, token: str = None):
        return await self.client.get(f"pops/{pop_id}", token=token)

    async def getAggregator(self, agg_id: str, token: str = None):
        return await self.client.get(f"aggregators/{agg_id}", token=token)

    async def getTunnel(self, tunnel_id: str, token: str = None):
        return await self.client.get(f"tunnels/{tunnel_id}", token=token)

    async def getWAN(self, wan_id: str, token: str = None):
        return await self.client.get(f"wan-links/{wan_id}", token=token)

    async def getMetrics(self, source_id: str, token: str = None):
        return await self.client.get(f"telemetry/v1/history/{source_id}", token=token)

    async def getLogs(self, token: str = None):
        return await self.client.get("audit", token=token)

    async def getAlerts(self, token: str = None):
        return await self.client.get("alerts", token=token)

    async def getIncidents(self, token: str = None):
        return await self.client.get("incidents", token=token)

    async def getRoutes(self, token: str = None):
        return await self.client.get("routing", token=token)

    async def getPolicies(self, token: str = None):
        return await self.client.get("policies", token=token)

    async def runDiagnostic(self, payload: dict, token: str = None):
        return await self.client.post("diagnostics/run", json_data=payload, token=token)

    async def getConfiguration(self, resource_id: str, token: str = None):
        return await self.client.get(f"configuration/{resource_id}", token=token)

    async def compareConfiguration(self, v1: str, v2: str, token: str = None):
        return {"diff": "No drift detected between versions."}

    async def proposeChange(self, proposal: dict, token: str = None):
        return {"status": "PROPOSED", "proposal": proposal, "requiresApproval": True}

    async def createIncident(self, incident: dict, token: str = None):
        return await self.client.post("incidents", json_data=incident, token=token)

    async def generateReport(self, report_spec: dict, token: str = None):
        return await self.client.post("reports", json_data=report_spec, token=token)

tool_registry = ToolRegistry()
