import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Popover,
  IconButton,
  Typography,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

function VNetDetails() {
  const [vnets, setVnets] = useState([]);
  const [filterValues, setFilterValues] = useState({
    subscription_name: [],
    location: [],
    address_space: [],
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [openFilter, setOpenFilter] = useState('');
  const [loading, setLoading] = useState(true); // Initialize loading to true

  useEffect(() => {
    const fetchVNetDetails = async () => {
      try {
        const response = await axios.get('/api/get_vnet_details');
        setVnets(response.data.map(vnet => ({
          ...vnet,
          address_space: vnet.address_space.join(', '),
        })));
      } catch (error) {
        console.error('Error fetching VNet details:', error);
      } finally {
        setLoading(false); // Set loading to false once data fetching is complete
      }
    };

    fetchVNetDetails();
  }, []);

  const handleFilterIconClick = (event, column) => {
    setAnchorEl(event.currentTarget);
    setOpenFilter(openFilter === column ? '' : column);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
    setOpenFilter('');
  };

  const handleFilterChange = (event, column) => {
    const { value, checked } = event.target;
    setFilterValues(prevState => ({
      ...prevState,
      [column]: checked ? [...prevState[column], value] : prevState[column].filter(item => item !== value),
    }));
  };

  const filteredVnets = vnets.filter(vnet =>
    Object.entries(filterValues).every(([key, value]) =>
      value.length ? value.includes(vnet[key]) : true
    )
  );

  const makeSelectItems = (key) => [...new Set(vnets.map(item => item[key]))];

  if (loading) {
    return <Typography color="green" style={{ margin: '20px', textAlign: 'center' }}>Loading...</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
      <Table sx={{ minWidth: '100%' }} aria-label="VNet details table">
        <TableHead>
          <TableRow>
            {["VNet Name", "VNet ID", "Subscription Name", "Subscription ID", "Location", "Address Space", "Subnet CIDRs"].map((text) => {
              const filterKey = text.replace(/\s/g, '_').toLowerCase();
              return (
                <TableCell
                  key={text}
                  sx={{
                    fontWeight: 'bold',
                    borderBottom: 2,
                    borderColor: 'primary.main'
                  }}
                >
                  {text}
                  {['subscription_name', 'location', 'address_space'].includes(filterKey) && (
                    <>
                      <IconButton size="small" onClick={(e) => handleFilterIconClick(e, filterKey)}>
                        <ArrowDropDownIcon />
                      </IconButton>
                      <Popover
                        open={openFilter === filterKey}
                        anchorEl={anchorEl}
                        onClose={handleFilterClose}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                      >
                        <div style={{ padding: '8px' }}>
                          {makeSelectItems(filterKey).map((item) => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center' }}>
                              <Checkbox
                                checked={filterValues[filterKey].includes(item)}
                                onChange={(e) => handleFilterChange(e, filterKey)}
                                value={item}
                              />
                              <Typography>{item}</Typography>
                            </div>
                          ))}
                        </div>
                      </Popover>
                    </>
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredVnets.map((vnet, index) => (
            <TableRow key={index}>
              <TableCell>{vnet.vnet_name}</TableCell>
              <TableCell>{vnet.vnet_id}</TableCell> {/* Apply wrapping style here */}
              <TableCell>{vnet.subscription_name}</TableCell>
              <TableCell>{vnet.subscription_id}</TableCell>
              <TableCell>{vnet.location}</TableCell>
              <TableCell>{vnet.address_space}</TableCell>
              <TableCell>{Array.isArray(vnet.subnet_cidrs) ? vnet.subnet_cidrs.join(', ') : vnet.subnet_cidrs}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default VNetDetails;
