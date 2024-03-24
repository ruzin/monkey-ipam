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
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVnets(data);
      } catch (error) {
        console.error("Failed to fetch VNet details:", error);
        setError('Failed to load VNet details.');
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
      ) : (
        <ul>
          {vnets.map((vnet, index) => (
            <li key={index}>
              <h2>{vnet.subscription_name} - {vnet.vnet_name}</h2>
              <p>Location: {vnet.location}</p>
              <p>Subnets: {vnet.subnet_cidrs.join(', ')}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
