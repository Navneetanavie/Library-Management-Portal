import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
        <Container fluid>
          <Navbar.Brand as={Link} to="/books" className="fw-bold text-primary">Library App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/books">Books</Nav.Link>
              <Nav.Link as={Link} to="/authors">Authors</Nav.Link>
              <Nav.Link as={Link} to="/users">Users</Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted">Logged in as: <strong>{user?.name}</strong></span>
              <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="flex-grow-1">
        {children}
      </Container>
      <footer className="bg-light py-3 mt-auto text-center text-muted">
        <Container fluid>
          <small>&copy; 2025 Library App</small>
        </Container>
      </footer>
    </div>
  );
}
