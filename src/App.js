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
        const data = await response.json(); // Moved up to ensure we always attempt to read JSON

        // Log the response data to the console, successful or not
        console.log('Response data:', data);

        if (!response.ok) {
          // Throw an error that includes status and response data for detailed debugging
          throw new Error(`HTTP error! status: ${response.status}, body: ${JSON.stringify(data)}`);
        }
        
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
