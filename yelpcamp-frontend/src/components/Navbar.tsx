import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar bg="light" variant="light" expand="lg" sticky="top">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold fs-3">
          The Campgrounds
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/campgrounds">
              Campgrounds
            </Nav.Link>
            <Nav.Link as={Link} to="/shop">
              Shop
              {isAuthenticated && getCartItemCount() > 0 && (
                <Badge bg="success" className="ms-1">
                  {getCartItemCount()}
                </Badge>
              )}
            </Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/campgrounds/new">
                New Campground
              </Nav.Link>
            )}
          </Nav>
          
          <Nav className="ms-auto">
            {isAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/orders" className="me-2">
                  <i className="fas fa-receipt me-1"></i>
                  Orders
                </Nav.Link>
                <Nav.Link as={Link} to="/profile" className="me-2">
                  <i className="fas fa-user me-1"></i>
                  Profile
                </Nav.Link>
                <BootstrapNavbar.Text className="me-3">
                  Welcome, {user?.username}!
                </BootstrapNavbar.Text>
                <Button variant="outline-primary" onClick={handleLogout} className="btn-logout">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 