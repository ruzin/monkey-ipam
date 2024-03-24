import React, { useState } from 'react';

function CheckIP() {
  const [cidr, setCIDR] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [overlaps, setOverlaps] = useState([]);

  const handleCheckIP = async () => {
    setResult(null);
    setOverlaps([]);
    setLoading(true);
    try {
      const response = await fetch('/api/check-cidrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cidr })
      });
      const data = await response.json();
      if (data.available) {
        setResult({ message: 'CIDR is available for use', color: 'green' });
      } else if (data.overlaps) {
        setResult({ message: 'CIDR is currently in Use', color: 'blue' });
        setOverlaps(data.overlaps);
      }
    } catch (error) {
      setResult({ message: 'An error occurred while checking the CIDR.', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const resultStyle = result ? { color: result.color, marginTop: '10px', fontSize: '16px' } : {};

  return (
    <div style={{ padding: '20px' }}>
      <input
        type="text"
        value={cidr}
        onChange={(e) => setCIDR(e.target.value)}
        placeholder="Enter CIDR"
        style={{ padding: '10px', marginRight: '10px' }}
      />
      
      <button
        onClick={handleCheckIP}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Check IP
      </button>
      {loading && <div style={{ color: 'green', marginTop: '10px' }}>Loading...</div>}
      {result && <div style={resultStyle}>{result.message}</div>}
      {!loading && overlaps.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {overlaps.map((overlap, index) => (
            <li key={index} style={{ color: 'blue' }}>
              {overlap.type === 'VNet' && `It is currently being used by VNet ${overlap.vnet_name} in subscription ${overlap.subscription_name}.`}
              {overlap.type === 'Subnet' && `It is currently being used by subnet ${overlap.subnet_cidr} in VNet ${overlap.vnet_name} in subscription ${overlap.subscription_name}.`}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CheckIP;