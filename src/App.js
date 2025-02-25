import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { 
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ReceiptIcon from '@mui/icons-material/Receipt';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

import WelcomePage from './pages/WelcomePage';
import Services from './pages/Services';
import Clients from './pages/Clients';
import Vehicles from './pages/Vehicles';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import Logo from './components/Logo';

const activeGreen = '#191bdf';
const inactiveGray = '#757575';

function Navigation({ menuItems, isMobile, handleDrawerClose }) {
  const location = useLocation();
  
  const ListItemComponent = ({ item, isSelected }) => (
    <ListItem 
      button 
      component={Link} 
      to={item.path} 
      selected={isSelected}
      onClick={isMobile ? handleDrawerClose : undefined}
      sx={{
        '&.Mui-selected': {
          backgroundColor: 'transparent',
          color: isMobile ? activeGreen : '#fff',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: isMobile ? 'rgba(76, 175, 80, 0.08)' : 'rgba(255, 255, 255, 0.1)',
          }
        },
        color: isMobile ? inactiveGray : 'white',
        '&:hover': {
          backgroundColor: isMobile ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.1)',
        },
        padding: '8px 16px'
      }}
    >
      <ListItemIcon
        sx={{
          color: isSelected 
            ? (isMobile ? activeGreen : '#fff') 
            : (isMobile ? inactiveGray : 'rgba(255, 255, 255, 0.7)'),
          minWidth: '40px'
        }}
      >
        {item.icon}
      </ListItemIcon>
      <ListItemText 
        primary={item.text}
        primaryTypographyProps={{
          fontWeight: isSelected ? 700 : 400,
          color: isSelected 
            ? (isMobile ? activeGreen : '#fff') 
            : (isMobile ? inactiveGray : 'rgba(255, 255, 255, 0.7)')
        }}
      />
    </ListItem>
  );

  return (
    <List sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row',
      margin: 0,
      padding: isMobile ? '8px 0' : 0
    }}>
      {menuItems.map((item) => {
        const isSelected = location.pathname === item.path;
        return (
          <ListItemComponent 
            key={item.text} 
            item={item} 
            isSelected={isSelected}
          />
        );
      })}
    </List>
  );
}

function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Услуги', icon: <BuildIcon />, path: '/services' },
    { text: 'Клиенты', icon: <PeopleIcon />, path: '/clients' },
    { text: 'Автомобили', icon: <DirectionsCarIcon />, path: '/vehicles' },
    { text: 'Заказы', icon: <ReceiptIcon />, path: '/orders' },
    { text: 'Склад', icon: <InventoryIcon />, path: '/inventory' }
  ];

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="fixed">
            <Toolbar sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              padding: { xs: '0 16px', sm: '0 24px' }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <Link to="/" style={{ 
                  color: 'inherit', 
                  textDecoration: 'none', 
                  display: 'flex', 
                  alignItems: 'center' 
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mr: 2
                  }}>
                    <Logo />
                  </Box>
                </Link>
              </Box>

              {isMobile ? (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              ) : (
                <Navigation menuItems={menuItems} isMobile={false} />
              )}
            </Toolbar>
          </AppBar>

          {isMobile && (
            <Drawer
              variant="temporary"
              anchor="right"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true // Лучшая производительность на мобильных устройствах
              }}
              sx={{
                '& .MuiDrawer-paper': { 
                  width: 280,
                  boxSizing: 'border-box'
                },
              }}
            >
              <Box sx={{ mt: '64px' }}>
                <Navigation 
                  menuItems={menuItems} 
                  isMobile={true}
                  handleDrawerClose={handleDrawerToggle}
                />
              </Box>
            </Drawer>
          )}

          <Box
            component="main"
            sx={{ 
              flexGrow: 1,
              mt: '64px',
              backgroundColor: '#f5f5f5',
              minHeight: 'calc(100vh - 64px)'
            }}
          >
            <Container maxWidth="lg" sx={{ py: 3 }}>
              <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/services" element={<Services />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;