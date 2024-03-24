import azure.functions as func
import logging
import json
from http_trigger import bp as http_trigger_bp
from get_vnet_details import bp as get_vnet_details_bp

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

app.register_functions(http_trigger_bp)
app.register_functions(get_vnet_details_bp)