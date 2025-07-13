import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Spinner, 
  Alert
} from 'react-bootstrap';
import { userAPI, UserProfile as UserProfileType } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { updateIntercomUser } from '../services/intercomService';
import SEOHead from '../components/SEOHead';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');

    try {
      const profileResponse = await userAPI.getProfile();

      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data.user);
        
        // Update Intercom with fresh user profile
        updateIntercomUser(profileResponse.data.user, []);
      } else {
        setError('Failed to load profile data');
      }
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <div className="mt-3">
          <h5>Loading your profile...</h5>
        </div>
      </Container>
    );
  }

  const displayUser = userProfile || user;

  return (
    <Container>
      <SEOHead 
        title={`${displayUser?.username}'s Profile - The Campgrounds`}
        description={`View ${displayUser?.username}'s profile on The Campgrounds`}
      />
      
      {/* Profile Header */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="profile-info">
                    <h1 className="mb-2">
                      <i className="fas fa-user-circle me-3 text-primary"></i>
                      {displayUser?.username}
                    </h1>
                    <p className="text-muted mb-2">
                      <i className="fas fa-envelope me-2"></i>
                      {displayUser?.email}
                    </p>
                    <p className="text-muted mb-0">
                      <i className="fas fa-calendar me-2"></i>
                      Member since {userProfile ? formatDate(userProfile.createdAt) : 'Recently'}
                    </p>
                  </div>
                </Col>
                <Col md={4} className="text-md-end">
                  <div className="profile-stats">
                    <Row>
                      <Col xs={6} className="text-center mb-3">
                        <div className="stat-number text-primary fs-4 fw-bold">
                          {userProfile?.stats.campgrounds || 0}
                        </div>
                        <div className="stat-label text-muted small">
                          Campgrounds
                        </div>
                      </Col>
                      <Col xs={6} className="text-center mb-3">
                        <div className="stat-number text-info fs-4 fw-bold">
                          {userProfile?.stats.reviews || 0}
                        </div>
                        <div className="stat-label text-muted small">
                          Reviews
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h3 className="mb-0">
                <i className="fas fa-bolt me-2"></i>
                Quick Actions
              </h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="primary" 
                    className="w-100"
                    onClick={() => navigate('/orders')}
                    style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
                  >
                    <i className="fas fa-receipt me-2"></i>
                    View Orders
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={() => navigate('/campgrounds')}
                    style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
                  >
                    <i className="fas fa-campground me-2"></i>
                    Book Campground
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={() => navigate('/shop')}
                    style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    Browse Shop
                  </Button>
                </Col>
                <Col md={3} className="mb-3">
                  <Button 
                    variant="outline-primary" 
                    className="w-100"
                    onClick={() => navigate('/campgrounds/new')}
                    style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add Campground
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Account Information */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h3 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Account Information
              </h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Username:</strong>
                    <div className="text-muted">{displayUser?.username}</div>
                  </div>
                  <div className="mb-3">
                    <strong>Email:</strong>
                    <div className="text-muted">{displayUser?.email}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <strong>Member Since:</strong>
                    <div className="text-muted">
                      {userProfile ? formatDate(userProfile.createdAt) : 'Recently'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <strong>Account Status:</strong>
                    <div>
                      <span className="badge bg-success">Active</span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Navigation Actions */}
      <Row className="mt-4">
        <Col className="text-center">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/campgrounds')}
            className="me-3"
            style={{ borderColor: '#6b7280', color: '#6b7280' }}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Campgrounds
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/orders')}
            style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
          >
            <i className="fas fa-receipt me-2"></i>
            View My Orders
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile; 