import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import VNetDetails from './VNetDetails';
import CheckIP from './CheckIP';
import Allocations from './Allocations';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { styled } from '@mui/system';
import { MsalProvider, useMsal, useIsAuthenticated } from '@azure/msal-react';
import { msalInstance } from './authConfig';
import logo from './images/microsoft_small.png';


const StyledLink = styled(Link)({
  color: 'white',
  textDecoration: 'none',
  marginRight: '16px',
  padding: '6px 16px',
  borderRadius: '4px',
  '&:hover': {
    color: '#bbdefb',
    borderColor: '#bbdefb',
  },
});


function SignInSignOutButton() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const username = Username();

  const handleLogin = () => {
    instance.loginRedirect().catch(e => console.error(e));
  };

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: "/" }).catch(e => console.error(e));
  };

  return isAuthenticated ? (
    <StyledLink to="/" onClick={handleLogout}>
      Sign Out | {username}
    </StyledLink>
  ) : (
    <StyledLink to="/" onClick={handleLogin}>
      Sign In
    </StyledLink>
  );
}

function Username() {
  let { accounts } = useMsal();
  return accounts.length > 0 ? accounts[0].username : '';
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useIsAuthenticated();
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function Home() {
  const isAuthenticated = useIsAuthenticated();
  const username = Username();

  return (
    <>
      <Typography variant="h4" gutterBottom> Welcome to Azure IPAM{username && `: ${username}`}</Typography>
      {isAuthenticated && (
        <>
        </>
      )}
    </>
  );
}

function NavigationBar() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <AppBar position="static" sx={{ backgroundColor: '#0078D4' }}>
      <Toolbar>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'white', textDecoration: 'none' }}>
          <img src={logo} alt="Azure Logo" style={{ height: '24px', marginRight: '10px' }} />    </Link>

        <Typography variant="h6" sx={{ color: 'white', flexGrow: 1 }}>
          <StyledLink style={{ padding: 0, border: 0 }} to="/">Azure IPAM</StyledLink>
        </Typography>
        <nav style={{ display: 'flex' }}>
          {isAuthenticated && (
            <>
              <StyledLink to="/allocations">Allocations</StyledLink>
              <StyledLink to="/vnets">VNet Details</StyledLink>
              <StyledLink to="/check-ip">CheckIP</StyledLink>
            </>
          )}
          <SignInSignOutButton />
        </nav>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <NavigationBar />
        <Container style={{ marginTop: '20px' }} maxWidth={false}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/allocations" element={<ProtectedRoute><Allocations /></ProtectedRoute>} />
            <Route path="/vnets" element={<ProtectedRoute><VNetDetails /></ProtectedRoute>} />
            <Route path="/check-ip" element={<ProtectedRoute><CheckIP /></ProtectedRoute>} />
          </Routes>
        </Container>
      </Router>
    </MsalProvider>
  );
}

export default App;