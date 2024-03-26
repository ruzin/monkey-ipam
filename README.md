**Azure IPAM Product**
======================

Azure IPAM is a product designed to manage your IP addresses and subnets within Azure, leveraging Azure Static Web Apps, Azure Functions, and Azure Table Storage. This README outlines the steps to deploy and run the application, both locally and in Azure.

**Prerequisites**
-----------------

Before starting, ensure you have the following installed:

*   Node.js (v18)
*   Azure Functions Core Tools
*   Azure CLI

**Setup Instructions**
----------------------

### **Deploy Static Web App**

1.  Deploy your static web app using the Standard SKU.

### **Setup App Registration**

2.  Register your application in Azure AD to secure your application.

### **Setup Documentation**

#### Running App Locally

*   **Install SWA CLI**

       ```sh
       npm install -g @azure/static-web-apps-cli
       ```

*   **Node.js 18**

   Ensure Node.js version 18 is installed.

*   **Azure Functions Core Tools**

   Install Azure Functions Core Tools if not already installed.

*   **Set up Storage Table Contributor Role**

   Assign the "Storage Table Data Contributor" role to your service principal or user for accessing Azure Table Storage.

#### Set up Build

*   Install dependencies:

       ```sh
       npm install
       ```

*   Build the application:

       ```sh
       npm run build
       ```

#### Command for SWA Local Start

*   Start the application with the SWA CLI:

       ```sh
       swa start build --api-location api
       ```

#### Live Local Testing

*   Start the React app:

       ```sh
       npm start
       ```

*   In another terminal, start the SWA CLI for local testing with the Azure Functions API:

       ```sh
       swa start http://localhost:3000 --api ./api
       ```

### **Setup Service Principal and Role for Web App**

*   **Get Principal ID**

   Obtain the object ID of your service principal.

*   **Assign Network Contributor Role at Tenant Root Level**

       ```sh
       az role assignment create --assignee <object-id> --role "Network Contributor" --scope "/providers/Microsoft.Management/managementGroups/<tenant-root-group-id>"
       ```

*   **Assign Storage Table Data Contributor Role**

       ```sh
       # Get the resource ID of the storage account
       storageAccountId=$(az storage account show --name mystorageaccount --query id --output tsv)

       # Assign role
       az role assignment create --assignee <object-id> --role "Storage Table Data Contributor" --scope $storageAccountId
       ```

### **Create Storage Account and Table Storage**

*   **Command to Create Storage Account and Table**

       ```sh
       az storage table create --name AllocateCidrRangeTable --account-name <YourStorageAccountName> --account-key <YourStorageAccountKey>
       ```

**Useful Links**
----------------

*   Deploying to Azure Static Web Apps
*   Azure Functions Core Tools GitHub

***

Remember to replace placeholders like `<YourStorageAccountName>`, `<YourStorageAccountKey>`, and `<object-id>` with your actual values. This README provides a structured overview for setting up and running your Azure IPAM product both locally and in the cloud.