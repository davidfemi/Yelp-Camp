import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Row, Col, Spinner, Alert, Badge, Button, Image, Modal } from 'react-bootstrap';
import { bookingAPI, Booking } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      setLoading(true);
      try {
        const response = await bookingAPI.getById(id);
        if (response.success && response.data) {
          setBooking(response.data.booking);
        } else {
          setError(response.error || 'Failed to fetch booking');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

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

  const canCancel = () => {
    return booking?.status === 'confirmed';
  };

  const handleCancelConfirm = async () => {
    if (!booking) return;
    
    setCancelLoading(true);
    setError('');
    
    try {
      const response = await bookingAPI.cancel(booking._id);
      if (response.success) {
        setSuccessMessage('Booking cancelled successfully');
        setBooking({ ...booking, status: 'cancelled' });
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(response.error || 'Failed to cancel booking');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
      setShowCancelConfirm(false);
    }
  };

  if (!isAuthenticated && !booking) {
    return null;
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <div className="mt-3">
          <h5>Loading booking details...</h5>
        </div>
      </Container>
    );
  }

  if (error && !booking) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  if (!booking) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">Booking not found</Alert>
        <Button variant="primary" onClick={() => navigate('/orders')}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  const { campground } = booking;

  return (
    <Container>
      <SEOHead
        title={`Booking for ${campground.title} - The Campgrounds`}
        description={`View details for your booking at ${campground.title}`}
      />

      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">Booking Details</h1>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-4">
          <i className="fas fa-check-circle me-2"></i>
          {successMessage}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={5} className="mb-3 mb-md-0">
              {campground.images && campground.images.length > 0 ? (
                <Image
                  src={campground.images[0].url}
                  alt={campground.title}
                  rounded
                  fluid
                />
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center rounded" style={{ height: '300px' }}>
                  <i className="fas fa-campground fa-3x text-muted"></i>
                </div>
              )}
            </Col>
            <Col md={7}>
              <h2>{campground.title}</h2>
              <p className="text-muted">
                <i className="fas fa-map-marker-alt me-2"></i>
                {campground.location}
              </p>

              <div className="mb-3">
                <Badge bg={getStatusVariant(booking.status)} className="me-2">
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  {booking.status === 'expired' && ' 🕐'}
                </Badge>
                <span className="text-muted">
                  Booked on {formatDate(booking.createdAt)}
                </span>
              </div>

              {booking.checkInDate && booking.checkOutDate && (
                <p className="text-muted">
                  <i className="fas fa-calendar-check me-2"></i>
                  {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)}
                </p>
              )}

              <p className="mb-2">
                <strong>${campground.price}/night</strong> × {booking.days} days
              </p>
              <h4 className="text-success">
                Total Paid: ${booking.totalPrice}
              </h4>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="d-flex gap-2">
        <Button variant="outline-secondary" onClick={() => navigate('/orders')}>
          <i className="fas fa-arrow-left me-2"></i> Back to Orders
        </Button>
        {canCancel() && (
          <Button 
            variant="outline-danger" 
            onClick={() => setShowCancelConfirm(true)}
          >
            <i className="fas fa-times me-2"></i>
            Cancel Booking
          </Button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelConfirm} onHide={() => setShowCancelConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h5>Are you sure you want to cancel this booking?</h5>
            <p className="text-muted">
              This action cannot be undone. Your booking will be cancelled.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowCancelConfirm(false)}
            disabled={cancelLoading}
          >
            Keep Booking
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelConfirm}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Cancelling...
              </>
            ) : (
              <>
                <i className="fas fa-times me-2"></i>
                Yes, Cancel Booking
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookingDetail; 