import azure.functions as func
import logging
import json
from get_vnet_details import bp as get_vnet_details_bp
from check_cidrs import bp as check_cidrs_bp
from allocate_cidrs import bp as allocate_cidrs_bp

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

app.register_functions(allocate_cidrs_bp)
app.register_functions(get_vnet_details_bp)
app.register_functions(check_cidrs_bp)