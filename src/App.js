import React, { useState, useEffect } from 'react';

function App() {
  const [vnets, setVnets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Function to fetch VNet details
    async function fetchVNetDetails() {
      try {
        const response = await fetch('/api/get_vnet_details');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text(); // First get the response as text
        console.log("Raw response:", text); // Log the raw text response
        const data = JSON.parse(text); // Then attempt to parse it as JSON
        setVnets(data);
      } catch (error) {
        console.error("Failed to fetch VNet details:", error);
        setError('Failed to load VNet details. Check console for more details.');
      } finally {
        setIsLoading(false);
      }
    }    

    fetchVNetDetails();
  }, []);

  return (
    <div>
      <h1>VNet Details</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : vnets.length > 0 ? (
        <ul>
          {vnets.map((vnet, index) => (
            <li key={index}>
              <h2>{vnet.subscription_name} - {vnet.vnet_name}</h2>
              <p>Location: {vnet.location}</p>
              <p>Subnets: {vnet.subnet_cidrs.join(', ')}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No VNet details available.</p>
      )}
    </div>
  );
}

export default App;
