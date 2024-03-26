import azure.functions as func
from azure.data.tables import TableServiceClient
from azure.identity import DefaultAzureCredential
import os
import ipaddress

credentials = DefaultAzureCredential()

bp = func.Blueprint()

@bp.function_name("allocate_cidrs")
@bp.route(route="allocate_cidrs", methods=[func.HttpMethod.GET, func.HttpMethod.POST])
def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
    except ValueError:
        return func.HttpResponse("Invalid JSON input", status_code=400)
    
    cidr = req_body.get('cidr')
    allocation_name = req_body.get('allocationName')
    region = req_body.get('region')

    if not cidr or not allocation_name or not region:
        return func.HttpResponse(
            "Please pass cidr, allocationName, and region in the request body",
            status_code=400
        )

    # Validate CIDR
    try:
        ipaddress.ip_network(cidr)
    except ValueError as e:
        return func.HttpResponse(f"Invalid CIDR: {str(e)}", status_code=400)

    azure_storage_endpoint = os.environ['AzureTableStorageEndpoint']
    table_name = "AllocateCidrRangeTable"
    
    table_service_client = TableServiceClient(endpoint=azure_storage_endpoint,
        credential=credentials)
    table_client = table_service_client.get_table_client(table_name=table_name)
    
    entity = {
        "PartitionKey": "CidrAllocation",
        "RowKey": f"{allocation_name}_{region}",
        "Cidr": cidr,
        "AllocationName": allocation_name,
        "Region": region
    }

    try:
        table_client.create_entity(entity=entity)
        return func.HttpResponse("Entity added to AllocateCidrRangeTable", status_code=200)
    except Exception as e:
        return func.HttpResponse(f"Error adding entity to AllocateCidrRangeTable: {str(e)}", status_code=500)
