import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/campgrounds');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const success = await register(formData.username, formData.email, formData.password);
      if (success) {
        navigate('/campgrounds');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={8} lg={6} xl={5}>
            <Card className="register-card shadow-lg border-0">
              <Card.Body className="p-5">
                {/* Header Section */}
                <div className="text-center mb-4">
                  <div className="register-icon mb-3">
                    <img 
                      src={require('../assets/thecampgrounds-logo.png')}
                      alt="The Campgrounds Logo"
                      className="register-logo-img"
                    />
                  </div>
                  <h2 className="register-title">Join The Campgrounds</h2>
                  <p className="register-subtitle">Create your account to start exploring amazing campgrounds</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="danger" className="custom-alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                {/* Registration Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Choose a username"
                      autoComplete="username"
                      className="form-control-custom"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="form-control-custom"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Create a password"
                      minLength={6}
                      autoComplete="new-password"
                      className="form-control-custom"
                    />
                    <Form.Text className="form-text-custom">
                      Password must be at least 6 characters long.
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className="form-control-custom"
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    className="btn-register w-100 mb-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        Create Account
                      </>
                    )}
                  </Button>
                </Form>

                {/* Footer */}
                <div className="text-center">
                  <p className="register-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="register-link">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register; 