# Register this blueprint by adding the following line of code 
# to your entry point file.  
# app.register_functions(blueprint) 
# 
# Please refer to https://aka.ms/azure-functions-python-blueprints


import azure.functions as func
import logging
from azure.identity import DefaultAzureCredential
from azure.mgmt.network import NetworkManagementClient
from azure.mgmt.resource import SubscriptionClient
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from azure.storage.blob import BlobServiceClient, BlobClient
from datetime import datetime
import os

credentials = DefaultAzureCredential()

# Initialize the BlobServiceClient
connect_str = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
blob_service_client = BlobServiceClient.from_connection_string(connect_str)
container_name = 'error-logs'
blob_container_client = blob_service_client.get_container_client(container_name)

def log_error_to_blob(error_message):
    # Generate a unique blob name
    blob_name = f'error_{datetime.utcnow().isoformat()}.txt'
    blob_client = blob_container_client.get_blob_client(blob_name)

    # Upload the error message to the blob
    blob_client.upload_blob(error_message)

def fetch_vnet_details(subscription, credentials):
    try:
        subscription_id = subscription.subscription_id
        subscription_name = subscription.display_name  # Capture the subscription name
        network_client = NetworkManagementClient(credentials, subscription_id)

        vnets_info = []
        # List all VNets in the subscription
        all_vnets = network_client.virtual_networks.list_all()
        for vnet in all_vnets:
            # Fetch details of each subnet within the VNet
            subnets_detail = network_client.subnets.list(resource_group_name=vnet.id.split("/")[4], virtual_network_name=vnet.name)
            subnet_cidrs = [subnet.address_prefix for subnet in subnets_detail if subnet.address_prefix]

            vnet_detail = {
                "subscription_id": subscription_id,
                "subscription_name": subscription_name,
                "vnet_name": vnet.name,
                "vnet_id": vnet.id,
                "location": vnet.location,
                "address_space": vnet.address_space.address_prefixes if vnet.address_space else [],
                "subnet_cidrs": subnet_cidrs  # Include subnet CIDRs
            }
            vnets_info.append(vnet_detail)
        return vnets_info
    except Exception as e:
        logging.error(f"Error fetching VNet details for subscription {subscription_id}: {e}")
        error_message = f"Error fetching VNet details for subscription {subscription_id}: {e}"
        log_error_to_blob(error_message)
        return []  # Return an empty list in case of error

bp = func.Blueprint()
@bp.function_name("get_vnet_details")
@bp.route(route="get_vnet_details", auth_level=func.AuthLevel.ANONYMOUS)
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    subscription_client = SubscriptionClient(credentials)
    subscription_list = list(subscription_client.subscriptions.list())

    vnets_info = []

    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_vnet = {executor.submit(fetch_vnet_details, subscription, credentials): subscription for subscription in subscription_list}
        for future in as_completed(future_to_vnet):
            vnets_info.extend(future.result())

    return func.HttpResponse(
        body=json.dumps(vnets_info, indent=2),  # Use indent for more readable JSON
        mimetype="application/json",
        status_code=200
    )