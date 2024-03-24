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
import ipaddress

credentials = DefaultAzureCredential()

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
        return []  # Return an empty list in case of error

def check_cidr_availability(cidr, vnets_info):
    try:
        input_network = ipaddress.ip_network(cidr)
        overlaps = []

        for vnet in vnets_info:
            # Check against VNet address space
            for address_space in vnet['address_space']:
                vnet_network = ipaddress.ip_network(address_space)
                if input_network.overlaps(vnet_network):
                    overlaps.append({
                        'vnet_name': vnet['vnet_name'],
                        'subscription_name': vnet['subscription_name'],
                        'address_space': address_space,
                        'type': 'VNet'
                    })
                    # break  # No need to check further if overlap with VNet address space is found

            # Check against subnets
            for subnet_cidr in vnet["subnet_cidrs"]:
                subnet_network = ipaddress.ip_network(subnet_cidr)
                if input_network.overlaps(subnet_network):
                    overlaps.append({
                        'vnet_name': vnet['vnet_name'],
                        'subscription_name': vnet['subscription_name'],
                        'subnet_cidr': subnet_cidr,
                        'type': 'Subnet'
                    })
                    # Continue checking other subnets, as there could be multiple overlaps

        if overlaps:
            return json.dumps({"available": False, "overlaps": overlaps})
        else:
            return json.dumps({"available": True, "overlaps": []})
    except ValueError as e:
        return json.dumps({"error": "CIDR value inputted is incorrect: " + str(e)})

bp = func.Blueprint()
@bp.function_name("check_cidrs")
@bp.route(route="check-cidrs")
def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    
    try:
        req_body = req.get_json()
        cidr = req_body["cidr"]
    except Exception as e:
        return func.HttpResponse("Invalid request body.", status_code=400)

    # credentials = DefaultAzureCredential()
    subscription_client = SubscriptionClient(credentials)
    subscription_list = list(subscription_client.subscriptions.list())

    vnets_info = []

    with ThreadPoolExecutor(max_workers=10) as executor:
        future_to_vnet = {executor.submit(fetch_vnet_details, subscription, credentials): subscription for subscription in subscription_list}
        for future in as_completed(future_to_vnet):
            vnets_info.extend(future.result())

    result = check_cidr_availability(cidr, vnets_info)

    return func.HttpResponse(
        body=result,
        mimetype="text/plain",
        status_code=200
    )