// src/authConfig.js
import { PublicClientApplication } from '@azure/msal-browser';

export const msalConfig = {
  auth: {
    clientId: "be2873ca-56f3-4847-8582-254dcf43504e", // Replace with your Azure AD client ID
    authority: "https://login.microsoftonline.com/604ad8e8-3986-402f-a489-12c6cbca099f", // Replace YOUR_TENANT_ID
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage', // This is recommended to store the auth token
    storeAuthStateInCookie: false, // Set to true if you have issues on IE11 or Edge
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);