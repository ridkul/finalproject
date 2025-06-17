import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, AppBar, Toolbar, Typography, Container } from '@mui/material';

const Navbar = () => {
const { user, logout } = useAuth();
const navigate = useNavigate();

const handleLogout = () => {
    logout();
    navigate('/login');
};

return (
    <AppBar position="static">
    <Container>
        <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
            Service Booking
            </Link>
        </Typography>

            {user ? (
            <>
                {user.role === 'provider' && (
                <Button color="inherit" component={Link} to="/dashboard">
                    Dashboard
                </Button>
                )}
                <Button color="inherit" onClick={handleLogout}>
                Logout
                </Button>
            </>
            ) : (
            <>
                <Button color="inherit" component={Link} to="/login">
                Login
                </Button>
                <Button color="inherit" component={Link} to="/register">
                Register
                </Button>
            </>
            )}
        </Toolbar>
        </Container>
    </AppBar>
    );
};

export default Navbar;