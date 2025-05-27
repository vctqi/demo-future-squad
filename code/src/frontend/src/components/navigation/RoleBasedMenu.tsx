import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';

const RoleBasedMenu: React.FC = () => {
  const { permissions, loading } = usePermissions();
  
  if (loading) {
    return <div>Carregando menu...</div>;
  }
  
  return (
    <List>
      {/* Dashboard - available to all authenticated users */}
      <ListItem button component={RouterLink} to="/dashboard">
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
      
      {/* Marketplace - available to all users */}
      <ListItem button component={RouterLink} to="/marketplace">
        <ListItemIcon>
          <StoreIcon />
        </ListItemIcon>
        <ListItemText primary="Marketplace" />
      </ListItem>
      
      {/* Client-specific options */}
      {permissions.isClient && (
        <>
          <ListItem button component={RouterLink} to="/my-services">
            <ListItemIcon>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText primary="Meus Serviços" />
          </ListItem>
        </>
      )}
      
      {/* Supplier-specific options */}
      {permissions.isSupplier && (
        <>
          <ListItem button component={RouterLink} to="/my-offerings">
            <ListItemIcon>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText primary="Meus Produtos" />
          </ListItem>
          <ListItem button component={RouterLink} to="/my-clients">
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Meus Clientes" />
          </ListItem>
        </>
      )}
      
      {/* Admin-specific options */}
      {permissions.isAdmin && (
        <>
          <Divider />
          <ListItem button component={RouterLink} to="/admin/users">
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Usuários" />
          </ListItem>
          <ListItem button component={RouterLink} to="/admin/suppliers">
            <ListItemIcon>
              <StoreIcon />
            </ListItemIcon>
            <ListItemText primary="Fornecedores" />
          </ListItem>
          <ListItem button component={RouterLink} to="/admin/categories">
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Categorias" />
          </ListItem>
          <ListItem button component={RouterLink} to="/admin/contracts">
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Contratos" />
          </ListItem>
          <ListItem button component={RouterLink} to="/admin/reports">
            <ListItemIcon>
              <AssessmentIcon />
            </ListItemIcon>
            <ListItemText primary="Relatórios" />
          </ListItem>
          <ListItem button component={RouterLink} to="/admin/settings">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configurações" />
          </ListItem>
        </>
      )}
      
      {/* Profile - available to all authenticated users */}
      <Divider />
      <ListItem button component={RouterLink} to="/profile">
        <ListItemIcon>
          <PersonIcon />
        </ListItemIcon>
        <ListItemText primary="Meu Perfil" />
      </ListItem>
    </List>
  );
};

export default RoleBasedMenu;