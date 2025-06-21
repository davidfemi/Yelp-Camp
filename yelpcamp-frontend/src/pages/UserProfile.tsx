import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Spinner, 
  Alert, 
  Badge,
  ListGroup,
  Image
} from 'react-bootstrap';
import { bookingAPI, userAPI, Booking, UserProfile as UserProfileType } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { updateIntercomUser } from '../services/intercomService';
import SEOHead from '../components/SEOHead';

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
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
      // Fetch user profile and bookings in parallel
      const [profileResponse, bookingsResponse] = await Promise.all([
        userAPI.getProfile(),
        bookingAPI.getUserBookings()
      ]);

      if (profileResponse.success && profileResponse.data) {
        setUserProfile(profileResponse.data.user);
      }

      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data.bookings);
        
        // Update Intercom with fresh user profile and booking data
        if (profileResponse.success && profileResponse.data) {
          updateIntercomUser(profileResponse.data.user, bookingsResponse.data.bookings);
        }
      }

      if (!profileResponse.success && !bookingsResponse.success) {
        setError('Failed to load profile data');
      }
    } catch (error) {
      setError('Failed to load profile data');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'cancelled':
        return 'danger';
      case 'expired':
        return 'secondary';
      default:
        return 'primary';
    }
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
        description={`View ${displayUser?.username}'s profile and booking history on The Campgrounds`}
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
                      <Col xs={4} className="text-center mb-3">
                        <div className="stat-number text-primary fs-4 fw-bold">
                          {userProfile?.stats.campgrounds || 0}
                        </div>
                        <div className="stat-label text-muted small">
                          Campgrounds
                        </div>
                      </Col>
                      <Col xs={4} className="text-center mb-3">
                        <div className="stat-number text-success fs-4 fw-bold">
                          {bookings.length}
                        </div>
                        <div className="stat-label text-muted small">
                          Total Bookings
                        </div>
                      </Col>
                      <Col xs={4} className="text-center mb-3">
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

      {/* Bookings Section */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h3 className="mb-0">
                <i className="fas fa-calendar-check me-2"></i>
                My Bookings
              </h3>
              <Button 
                variant="primary" 
                onClick={() => navigate('/campgrounds')}
                style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
              >
                <i className="fas fa-plus me-2"></i>
                Book New Campground
              </Button>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {bookings.length === 0 ? (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="fas fa-campground fa-4x text-muted"></i>
                  </div>
                  <h4 className="text-muted">No bookings yet</h4>
                  <p className="text-muted mb-4">
                    Start exploring amazing campgrounds and make your first booking!
                  </p>
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => navigate('/campgrounds')}
                    style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
                  >
                    <i className="fas fa-search me-2"></i>
                    Explore Campgrounds
                  </Button>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {bookings.map((booking) => (
                    <ListGroup.Item key={booking._id} className="px-0 py-3">
                      <Row className="align-items-center">
                        {/* Campground Image */}
                        <Col md={2}>
                          <div className="booking-image">
                            {booking.campground.images && booking.campground.images.length > 0 ? (
                              <Image
                                src={booking.campground.images[0].url}
                                alt={booking.campground.title}
                                rounded
                                style={{ 
                                  width: '80px', 
                                  height: '80px', 
                                  objectFit: 'cover' 
                                }}
                              />
                            ) : (
                              <div 
                                className="bg-light d-flex align-items-center justify-content-center rounded"
                                style={{ width: '80px', height: '80px' }}
                              >
                                <i className="fas fa-campground text-muted"></i>
                              </div>
                            )}
                          </div>
                        </Col>

                        {/* Booking Details */}
                        <Col md={6}>
                          <div className="booking-details">
                            <h5 className="mb-1">
                              <Button
                                variant="link"
                                className="p-0 text-start fw-bold"
                                style={{ textDecoration: 'none', color: '#4a5d23' }}
                                onClick={() => navigate(`/campgrounds/${booking.campground._id}`)}
                              >
                                {booking.campground.title}
                              </Button>
                            </h5>
                            <p className="text-muted mb-1">
                              <i className="fas fa-map-marker-alt me-2"></i>
                              {booking.campground.location}
                            </p>
                            <p className="text-muted mb-1">
                              <i className="fas fa-calendar me-2"></i>
                              Booked on {formatDate(booking.createdAt)}
                            </p>
                            {booking.checkInDate && booking.checkOutDate && (
                              <p className="text-muted mb-1">
                                <i className="fas fa-calendar-check me-2"></i>
                                {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                              </p>
                            )}
                            <div className="booking-meta">
                              <Badge bg={getStatusVariant(booking.status)} className="me-2">
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                {booking.status === 'expired' && ' 🕐'}
                              </Badge>
                              <small className="text-muted">
                                {booking.days} day{booking.days !== 1 ? 's' : ''} stay
                              </small>
                            </div>
                          </div>
                        </Col>

                        {/* Pricing and Actions */}
                        <Col md={4} className="text-md-end">
                          <div className="booking-pricing mb-2">
                            <div className="text-muted small mb-1">
                              ${booking.campground.price}/night × {booking.days} days
                            </div>
                            <div className="fs-5 fw-bold text-success">
                              Total: ${booking.totalPrice}
                            </div>
                          </div>
                          <div className="booking-actions">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/campgrounds/${booking.campground._id}`)}
                              style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
                            >
                              <i className="fas fa-eye me-1"></i>
                              View Details
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Actions */}
      <Row className="mt-4">
        <Col className="text-center">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/campgrounds')}
            style={{ borderColor: '#6b7280', color: '#6b7280' }}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Campgrounds
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile; 