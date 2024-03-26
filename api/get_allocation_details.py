import azure.functions as func
from azure.data.tables import TableServiceClient
from azure.identity import DefaultAzureCredential
import json
import os

credentials = DefaultAzureCredential()
table_name = "AllocateCidrRangeTable"
azure_storage_endpoint = os.environ['AzureTableStorageEndpoint']

bp = func.Blueprint()

@bp.function_name("get_allocation_details")
@bp.route(route="get_allocation_details", methods=[func.HttpMethod.GET, func.HttpMethod.POST])
def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Authenticate with Azure Table Storage using DefaultAzureCredential
        table_service_client = TableServiceClient(
            endpoint=azure_storage_endpoint,
            credential=credentials
        )

        # Connect to the table
        table_client = table_service_client.get_table_client(table_name=table_name)

        # Query the table for all entities
        entities = table_client.query_entities("PartitionKey eq 'CidrAllocation'")

        # Collect the details of each allocation
        allocations = [{
            "cidr": entity['Cidr'],
            "allocationName": entity['AllocationName'],
            "region": entity['Region']
        } for entity in entities]

        # Return the allocations as a JSON response
        return func.HttpResponse(
            body=json.dumps(allocations),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            body=f"An error occurred: {str(e)}",
            status_code=500
        )
