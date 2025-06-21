import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Spinner, 
  Alert, 
  Badge, 
  Modal, 
  Form,
  ListGroup,
  Carousel
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { campgroundsAPI, reviewsAPI, bookingAPI, Campground } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { updateIntercomUser, trackCampgroundViewed, trackBookingCreated } from '../services/intercomService';
import CampgroundMap from '../components/CampgroundMap';
import SEOHead from '../components/SEOHead';

interface CampgroundData {
  campground: Campground;
  stats: {
    averageRating: number;
    totalReviews: number;
    capacity: number;
    peopleBooked: number;
    bookingPercentage: number;
    availableSpots: number;
  };
}

const CampgroundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [campgroundData, setCampgroundData] = useState<CampgroundData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ 
    days: 1,
    checkInDate: (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    })() // Default to tomorrow
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const fetchCampgroundData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await campgroundsAPI.getById(id);
      if (response.success && response.data) {
        setCampgroundData(response.data);
        
        // Track campground view in Intercom
        if (user) {
          const updatedUser = {
            ...user,
            last_viewed_campground: response.data.campground.title,
            last_viewed_campground_id: id,
            last_viewed_campground_at: Math.floor(new Date().getTime() / 1000),
            campground_views: 'increased'
          };
          updateIntercomUser(updatedUser);
          // Track campground view event
          trackCampgroundViewed(response.data.campground, user);
        }
      } else {
        setError('Failed to load campground details');
      }
    } catch (error) {
      setError('Failed to load campground details');
      console.error('Error fetching campground:', error);
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      fetchCampgroundData();
    }
  }, [id, fetchCampgroundData]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isAuthenticated) return;

    setSubmittingReview(true);
    try {
      const response = await reviewsAPI.create(id, reviewForm);
      if (response.success) {
        toast.success('Review added successfully!');
        setShowReviewModal(false);
        setReviewForm({ rating: 5, body: '' });
        fetchCampgroundData(); // Refresh to show new review
      } else {
        toast.error('Failed to add review');
      }
    } catch (error: any) {
      toast.error('Failed to add review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!id || !window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await reviewsAPI.delete(id, reviewId);
      if (response.success) {
        toast.success('Review deleted successfully!');
        fetchCampgroundData(); // Refresh to remove deleted review
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      toast.error('Failed to delete review');
      console.error('Error deleting review:', error);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isAuthenticated || !campgroundData) return;

    setSubmittingBooking(true);
    try {
      const response = await bookingAPI.create(id, bookingForm);
      if (response.success) {
        toast.success('Booking confirmed successfully!');
        setShowBookingModal(false);
        setBookingForm({ 
          days: 1, 
          checkInDate: (() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow.toISOString().split('T')[0];
          })()
        });
        // Track successful booking creation
        if (response.data && response.data.booking) {
          trackBookingCreated(response.data.booking, user);
        }
      } else {
        toast.error('Failed to create booking');
      }
    } catch (error: any) {
      toast.error('Failed to create booking');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!campgroundData) return 0;
    return campgroundData.campground.price * bookingForm.days;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? 'text-warning' : 'text-muted'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <div className="mt-3">
          <h5>Loading campground details...</h5>
        </div>
      </Container>
    );
  }

  if (error || !campgroundData) {
    return (
      <Container>
        <Alert variant="danger">
          {error || 'Campground not found'}
        </Alert>
        <Button 
          variant="primary" 
          onClick={() => navigate('/campgrounds')}
          style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
        >
          Back to Campgrounds
        </Button>
      </Container>
    );
  }

  const { campground, stats } = campgroundData;
  const isOwner = user && campground.author._id === user.id;

  return (
    <Container>
      <SEOHead
        title={`${campground.title} - The Campgrounds`}
        description={campground.description.length > 160 
          ? `${campground.description.substring(0, 157)}...` 
          : campground.description
        }
        keywords={`${campground.title}, ${campground.location}, camping, campground, outdoor, adventure, nature`}
        image={campground.images[0]?.url}
        url={`https://thecampground.vercel.app/campgrounds/${campground._id}`}
        type="article"
        price={campground.price}
        location={campground.location}
        rating={stats.averageRating}
        reviewCount={stats.totalReviews}
      />
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1 className="mb-2">{campground.title}</h1>
              <p className="text-muted mb-2">
                <i className="fas fa-map-marker-alt me-2"></i>
                {campground.location}
              </p>
              <div className="d-flex align-items-center mb-3">
                <div className="me-3">
                  {renderStars(Math.round(stats.averageRating))}
                  <span className="ms-2">
                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'No ratings'}
                  </span>
                </div>
                <Badge bg="secondary">
                  {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
            <div className="text-end">
              <h3 className="text-success mb-2">${campground.price}/night</h3>
              {isOwner && (
                <div>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => navigate(`/campgrounds/${campground._id}/edit`)}
                    style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
                  >
                    Edit
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Left Column - Images and Description */}
        <Col lg={8}>
          {/* Image Carousel */}
          {campground.images.length > 0 && (
            <Card className="mb-4">
              <Card.Body className="p-0">
                <Carousel 
                  interval={null}
                  indicators={campground.images.length > 1}
                  controls={campground.images.length > 1}
                >
                  {campground.images.map((image, index) => (
                    <Carousel.Item key={index}>
                      <div 
                        style={{ 
                          height: '400px',
                          overflow: 'hidden',
                          borderRadius: '8px'
                        }}
                      >
                        <img
                          src={image.url}
                          alt={`${campground.title} view ${index + 1}`}
                          className="d-block w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      {campground.images.length > 1 && (
                        <Carousel.Caption 
                          style={{ 
                            backgroundColor: 'rgba(0,0,0,0.5)', 
                            borderRadius: '4px',
                            right: '15%',
                            left: '15%'
                          }}
                        >
                          <p>{index + 1} of {campground.images.length}</p>
                        </Carousel.Caption>
                      )}
                    </Carousel.Item>
                  ))}
                </Carousel>
              </Card.Body>
            </Card>
          )}

          {/* Description Section */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">About this campground</h5>
            </Card.Header>
            <Card.Body>
              <div className="campground-description">
                {campground.description.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3">{paragraph}</p>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Reviews Section */}
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Reviews ({stats.totalReviews})</h5>
              {isAuthenticated && (
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowReviewModal(true)}
                  style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
                >
                  Add Review
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {campground.reviews.length > 0 ? (
                <ListGroup variant="flush">
                  {campground.reviews.map((review) => (
                    <ListGroup.Item key={review._id} className="px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-2">
                            <strong className="me-3">{review.author.username}</strong>
                            <div>{renderStars(review.rating)}</div>
                            {user && review.author._id === user.id && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="ms-auto"
                                onClick={() => handleDeleteReview(review._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                          <p className="mb-0">{review.body}</p>
                          <small className="text-muted">
                            {review.createdAt ? 
                              new Date(review.createdAt).toLocaleDateString() : 
                              'Date unavailable'
                            }
                          </small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted text-center py-4">
                  No reviews yet. Be the first to leave a review!
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column - Details, Map and Actions */}
        <Col lg={4}>
          {/* Campground Details */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Campground Details</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Price per night:</span>
                  <strong className="text-success">${campground.price}</strong>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Average rating:</span>
                  <div>
                    {renderStars(Math.round(stats.averageRating))}
                    <span className="ms-2">
                      {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Total reviews:</span>
                  <Badge bg="secondary">{stats.totalReviews}</Badge>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Host:</span>
                  <span>{campground.author.username}</span>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Capacity:</span>
                  <span>{stats.capacity || 'Not specified'} {stats.capacity ? 'people' : ''}</span>
                </ListGroup.Item>
                <ListGroup.Item className="px-0 d-flex justify-content-between">
                  <span>Available spots:</span>
                  <div className="d-flex align-items-center">
                    <span className={`me-2 ${(stats.availableSpots || 0) > 0 ? 'text-success' : 'text-danger'}`}>
                      {stats.availableSpots || 0} spots
                    </span>
                    <Badge 
                      bg={
                        (stats.bookingPercentage || 0) >= 90 ? 'danger' : 
                        (stats.bookingPercentage || 0) >= 70 ? 'warning' : 
                        'success'
                      }
                      className="small"
                    >
                      {stats.bookingPercentage || 0}% booked
                    </Badge>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item className="px-0">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Booking Status</small>
                    <small className="text-muted">
                      {stats.peopleBooked || 0}/{stats.capacity || 0} people
                    </small>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className={`progress-bar ${
                        (stats.bookingPercentage || 0) >= 90 ? 'bg-danger' : 
                        (stats.bookingPercentage || 0) >= 70 ? 'bg-warning' : 
                        'bg-success'
                      }`}
                      role="progressbar" 
                      style={{ width: `${stats.bookingPercentage || 0}%` }}
                      aria-valuenow={stats.bookingPercentage || 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    ></div>
                  </div>
                </ListGroup.Item>
              </ListGroup>
              
              <div className="mt-4">
                {isAuthenticated ? (
                  (stats.availableSpots || 0) > 0 ? (
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-100 mb-3"
                      onClick={() => setShowBookingModal(true)}
                      style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
                    >
                      Book Now
                    </Button>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="w-100 mb-3"
                      disabled
                      style={{ backgroundColor: '#6c757d', borderColor: '#6c757d' }}
                    >
                      <i className="fas fa-times-circle me-2"></i>
                      Fully Booked
                    </Button>
                  )
                ) : (
                  <Button 
                    variant="outline-primary" 
                    size="lg" 
                    className="w-100 mb-3"
                    onClick={() => navigate('/login')}
                    style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
                  >
                    Login to Book
                  </Button>
                )}
                <Button 
                  variant="outline-secondary" 
                  className="w-100"
                  onClick={() => navigate('/campgrounds')}
                  style={{ borderColor: '#6b7280', color: '#6b7280' }}
                >
                  Back to All Campgrounds
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Location Map */}
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Location</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <CampgroundMap campground={campground} height="300px" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add a Review</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleReviewSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Rating</Form.Label>
              <Form.Range
                min={1}
                max={5}
                value={reviewForm.rating}
                onChange={(e) => setReviewForm(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
              />
              <div className="text-center">
                {renderStars(reviewForm.rating)}
                <span className="ms-2">({reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''})</span>
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Review</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={reviewForm.body}
                onChange={(e) => setReviewForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Share your experience at this campground..."
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowReviewModal(false)}
              style={{ backgroundColor: '#6b7280', borderColor: '#6b7280' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={submittingReview}
              style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
            >
              {submittingReview ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Book {campgroundData?.campground.title}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleBookingSubmit}>
          <Modal.Body>
            <div className="mb-4">
              <h6 className="text-muted">Booking Details</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>Price per night:</span>
                <strong>${campgroundData?.campground.price}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Available spots:</span>
                <strong className="text-success">{campgroundData?.stats.availableSpots || 0} remaining</strong>
              </div>
            </div>
            
            <Form.Group className="mb-3">
              <Form.Label>Number of days</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={30}
                value={bookingForm.days}
                onChange={(e) => setBookingForm(prev => ({ ...prev, days: parseInt(e.target.value) || 1 }))}
                required
              />
              <Form.Text className="text-muted">
                Select how many days you want to stay (1-30 days)
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Check-in Date</Form.Label>
              <Form.Control
                type="date"
                value={bookingForm.checkInDate}
                onChange={(e) => setBookingForm(prev => ({ ...prev, checkInDate: e.target.value }))}
                required
              />
            </Form.Group>

            <div className="border-top pt-3">
              <div className="d-flex justify-content-between mb-2">
                <span>${campgroundData?.campground.price} × {bookingForm.days} day{bookingForm.days !== 1 ? 's' : ''}</span>
                <span>${calculateTotalPrice()}</span>
              </div>
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong className="text-success">${calculateTotalPrice()}</strong>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowBookingModal(false)}
              style={{ backgroundColor: '#6b7280', borderColor: '#6b7280' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={submittingBooking}
              style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
            >
              {submittingBooking ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Booking...
                </>
              ) : (
                `Confirm Booking - $${calculateTotalPrice()}`
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default CampgroundDetail; 