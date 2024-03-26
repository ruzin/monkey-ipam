import React, { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

// Example Azure Regions with short names
const azureRegions = [
  { name: 'UK South', value: 'uksouth' },
  { name: "UK West", value: "ukwest" },
  { name: "East Asia", value: "eastasia" },
  { name: "Southeast Asia", value: "southeastasia" },
  { name: "North Europe", value: "northeurope" },
  { name: "West Europe", value: "westeurope" },
  { name: "Japan East", value: "japaneast" },
  { name: "Japan West", value: "japanwest" },
  { name: "East US", value: "eastus" },
  { name: "East US 2", value: "eastus2" },
  { name: "South Central US", value: "southcentralus" },
  { name: "West US 2", value: "westus2" },
  { name: "West US 3", value: "westus3" },
  { name: "Central US", value: "centralus" },
  { name: "North Central US", value: "northcentralus" },
  { name: "West US", value: "westus" },
  { name: "Brazil South", value: "brazilsouth" },
  { name: "Australia East", value: "australiaeast" },
  { name: "Australia Southeast", value: "australiasoutheast" },
  { name: "South Africa North", value: "southafricanorth" },
  { name: "South Africa West", value: "southafricawest" },
  { name: "Central India", value: "centralindia" },
  { name: "South India", value: "southindia" },
  { name: "West India", value: "westindia" },
  { name: "Canada Central", value: "canadacentral" },
  { name: "Canada East", value: "canadaeast" },
  { name: "France Central", value: "francecentral" },
  { name: "Germany West Central", value: "germanywestcentral" },
  { name: "Norway East", value: "norwayeast" },
  { name: "Switzerland North", value: "switzerlandnorth" },
  { name: "UAE North", value: "uaenorth" },
];

function Allocations() {
  const [cidr, setCidr] = useState('');
  const [allocationName, setAllocationName] = useState('');
  const [region, setRegion] = useState('');
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/get_allocation_details');
      const data = await response.json();
      setAllocations(data);
    } catch (error) {
      console.error('Error fetching allocation details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await fetch('/api/allocate_cidrs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cidr, allocationName, region }),
      });
      fetchAllocations(); // Refresh allocations after adding
    } catch (error) {
      console.error('Error creating allocation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>Allocate CIDR</Typography>
      <TextField
        label="Allocation Name"
        variant="outlined"
        value={allocationName}
        onChange={(e) => setAllocationName(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <FormControl variant="outlined" style={{ minWidth: 120, marginRight: '10px' }}>
        <InputLabel>Region</InputLabel>
        <Select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          label="Region"
        >
          {azureRegions.map((region) => (
            <MenuItem key={region.value} value={region.value}>{region.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="CIDR"
        variant="outlined"
        value={cidr}
        onChange={(e) => setCidr(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreate}
        disabled={loading}
      >
        Create
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={fetchAllocations}
        disabled={loading}
        style={{ marginLeft: '10px' }}
      >
        Refresh
      </Button>

      <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>Allocations</Typography>
      <TableContainer component={Paper} sx={{ marginTop: '10px' }}>
        <Table aria-label="Allocations Table">
          <TableHead>
            <TableRow>
              {["Allocation Name", "Region", "CIDR"].map((heading) => (
                <TableCell
                  key={heading}
                  style={{
                    fontWeight: 'bold',
                    borderBottom: '3px solid #1976d2' // Bold with blue underline
                  }}
                >
                  {heading}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {allocations.map((alloc, index) => (
              <TableRow key={index}>
                <TableCell>{alloc.allocationName}</TableCell>
                <TableCell>{alloc.region}</TableCell>
                <TableCell>{alloc.cidr}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default Allocations;
