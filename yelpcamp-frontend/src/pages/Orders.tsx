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
  Image,
  Nav,
  Tab,
  Modal
} from 'react-bootstrap';
import { bookingAPI, orderAPI, Booking, Order } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';

interface OrderDetailProps {
  order: Order | null;
  booking: Booking | null;
  show: boolean;
  onHide: () => void;
  onCancel: (type: 'order' | 'booking', id: string) => void;
}

const OrderDetailModal: React.FC<OrderDetailProps> = ({ order, booking, show, onHide, onCancel }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'success';
      case 'processing':
      case 'shipped':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const item = order || booking;
  if (!item) return null;

  const canCancel = () => {
    if (order) {
      return ['pending', 'processing'].includes(order.status);
    }
    if (booking) {
      return booking.status === 'confirmed';
    }
    return false;
  };

  const handleCancel = () => {
    if (order) {
      onCancel('order', order._id);
    } else if (booking) {
      onCancel('booking', booking._id);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton style={{ backgroundColor: '#4a5d23', color: 'white' }}>
        <Modal.Title>
          {order ? 'Order Details' : 'Booking Details'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={8}>
            {/* Order/Booking Information */}
            <Card className="mb-3">
              <Card.Header>
                <h5 className="mb-0">
                  {order ? `Order #${order.orderNumber}` : `Booking #${booking!._id.slice(-8).toUpperCase()}`}
                </h5>
              </Card.Header>
              <Card.Body>
                {order ? (
                  // Product Order Items
                  <div>
                    {order.items.map((item, index) => (
                      <div key={index} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          rounded
                        />
                        <div className="ms-3 flex-grow-1">
                          <h6 className="mb-1">{item.product.name}</h6>
                          <small className="text-muted">{item.product.category}</small>
                          <div className="mt-1">
                            <span className="text-muted">Qty: {item.quantity}</span>
                            <span className="ms-3">${item.price.toFixed(2)} each</span>
                          </div>
                        </div>
                        <div className="text-end">
                          <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                        </div>
                      </div>
                    ))}
                    <div className="text-end">
                      <h5>Total: ${order.totalAmount.toFixed(2)}</h5>
                    </div>
                  </div>
                ) : (
                  // Campground Booking
                  <div className="d-flex align-items-center">
                    {booking!.campground.images && booking!.campground.images.length > 0 ? (
                      <Image
                        src={booking!.campground.images[0].url}
                        alt={booking!.campground.title}
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        rounded
                      />
                    ) : (
                      <div 
                        className="bg-light d-flex align-items-center justify-content-center rounded"
                        style={{ width: '100px', height: '100px' }}
                      >
                        <i className="fas fa-campground text-muted fa-2x"></i>
                      </div>
                    )}
                    <div className="ms-3">
                      <h5>{booking!.campground.title}</h5>
                      <p className="text-muted mb-1">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        {booking!.campground.location}
                      </p>
                      <p className="mb-1">
                        <strong>{booking!.days} day{booking!.days !== 1 ? 's' : ''} stay</strong>
                      </p>
                      <p className="mb-0">
                        <strong>Total: ${booking!.totalPrice}</strong>
                      </p>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Customer Details */}
            {order && (
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Shipping Address</h6>
                </Card.Header>
                <Card.Body>
                  <address className="mb-0">
                    <strong>{order.shippingAddress.name}</strong><br />
                    {order.shippingAddress.address}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                    {order.shippingAddress.country}
                  </address>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col md={4}>
            {/* Status and Activity */}
            <Card>
              <Card.Header>
                <h6 className="mb-0">Status & Activity</h6>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <Badge bg={getStatusColor(item.status || 'pending')} className="px-3 py-2">
                    {(item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1)}
                  </Badge>
                </div>

                <div className="activity-timeline">
                  <div className="activity-item mb-3">
                    <div className="d-flex align-items-center">
                      <div className="activity-icon me-3">
                        <i className="fas fa-plus-circle text-success"></i>
                      </div>
                      <div>
                        <div className="fw-bold">
                          {order ? 'Order Placed' : 'Booking Created'}
                        </div>
                        <small className="text-muted">
                          {formatDate(item.createdAt)}
                        </small>
                      </div>
                    </div>
                  </div>

                  {(item.status === 'processing' || item.status === 'shipped' || item.status === 'delivered') && (
                    <div className="activity-item mb-3">
                      <div className="d-flex align-items-center">
                        <div className="activity-icon me-3">
                          <i className="fas fa-cog text-primary"></i>
                        </div>
                        <div>
                          <div className="fw-bold">
                            {item.status === 'processing' ? 'Order Processing' : 
                             item.status === 'shipped' ? 'Order Shipped' : 'Order Delivered'}
                          </div>
                          <small className="text-muted">
                            {formatDate(item.updatedAt || item.createdAt)}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.status === 'confirmed' && booking && (
                    <div className="activity-item mb-3">
                      <div className="d-flex align-items-center">
                        <div className="activity-icon me-3">
                          <i className="fas fa-check-circle text-success"></i>
                        </div>
                        <div>
                          <div className="fw-bold">Booking Confirmed</div>
                          <small className="text-muted">Ready for your stay</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.status === 'cancelled' && item.refund && item.refund.status === 'processed' && (
                    <div className="activity-item mb-3">
                      <div className="d-flex align-items-center">
                        <div className="activity-icon me-3">
                          <i className="fas fa-undo text-info"></i>
                        </div>
                        <div>
                          <div className="fw-bold">Refund Processed</div>
                          <small className="text-muted">
                            ${item.refund.amount} refunded on {new Date(item.refund.processedAt!).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.status === 'cancelled' && item.refund && item.refund.status === 'failed' && (
                    <div className="activity-item mb-3">
                      <div className="d-flex align-items-center">
                        <div className="activity-icon me-3">
                          <i className="fas fa-exclamation-triangle text-warning"></i>
                        </div>
                        <div>
                          <div className="fw-bold">Refund Failed</div>
                          <small className="text-muted">
                            {item.refund.failureReason || 'Please contact support'}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  {item.payment && (
                    <div className="mt-3 pt-3 border-top">
                      <h6 className="mb-2">Payment Details</h6>
                      <div className="small text-muted">
                        <div>Method: {item.payment.method.charAt(0).toUpperCase() + item.payment.method.slice(1)}</div>
                        {item.payment.transactionId && (
                          <div>Transaction: {item.payment.transactionId}</div>
                        )}
                        {item.payment.paidAt && (
                          <div>Paid: {new Date(item.payment.paidAt).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        {canCancel() && (
          <Button 
            variant="outline-danger" 
            onClick={handleCancel}
            className="me-2"
          >
            <i className="fas fa-times me-2"></i>
            Cancel {order ? 'Order' : 'Booking'}
          </Button>
        )}
        {booking && (
          <Button 
            variant="primary" 
            onClick={() => window.location.href = `/campgrounds/${booking.campground._id}`}
            style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
          >
            View Campground
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

const Orders: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelType, setCancelType] = useState<'order' | 'booking'>('order');
  const [cancelId, setCancelId] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrdersData();
  }, [isAuthenticated, navigate]);

  const fetchOrdersData = async () => {
    setLoading(true);
    setError('');

    try {
      const [ordersResponse, bookingsResponse] = await Promise.all([
        orderAPI.getUserOrders(),
        bookingAPI.getUserBookings()
      ]);

      if (ordersResponse.success && ordersResponse.data) {
        setOrders(ordersResponse.data.orders);
      }

      if (bookingsResponse.success && bookingsResponse.data) {
        setBookings(bookingsResponse.data.bookings);
      }

      if (!ordersResponse.success && !bookingsResponse.success) {
        setError('Failed to load orders data');
      }
    } catch (error) {
      setError('Failed to load orders data');
      console.error('Error fetching orders data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'success';
      case 'processing':
      case 'shipped':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'expired':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const showOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setSelectedBooking(null);
    setShowDetailModal(true);
  };

  const showBookingDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedOrder(null);
    setShowDetailModal(true);
  };

  const handleCancelRequest = (type: 'order' | 'booking', id: string) => {
    setCancelType(type);
    setCancelId(id);
    setShowCancelConfirm(true);
    setShowDetailModal(false);
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    setError('');
    
    try {
      if (cancelType === 'order') {
        const response = await orderAPI.cancel(cancelId);
        if (response.success) {
          const message = response.data?.refund?.success 
            ? `Order cancelled and $${response.data.refund.refund.amount} refund processed`
            : 'Order cancelled successfully';
          setSuccessMessage(message);
          
          // Update the order in the local state
          setOrders(prev => prev.map(order => 
            order._id === cancelId ? { 
              ...order, 
              status: 'cancelled' as const,
              refund: response.data?.refund?.refund
            } : order
          ));
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          setError(response.error || 'Failed to cancel order');
        }
      } else {
        const response = await bookingAPI.cancel(cancelId);
        if (response.success) {
          const refundData = (response.data as any)?.refund;
          const message = refundData?.success 
            ? `Booking cancelled and $${refundData.refund.amount} refund processed`
            : 'Booking cancelled successfully';
          setSuccessMessage(message);
          
          // Update the booking in the local state
          setBookings(prev => prev.map(booking => 
            booking._id === cancelId ? { 
              ...booking, 
              status: 'cancelled' as const,
              refund: refundData?.refund
            } : booking
          ));
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          setError(response.error || 'Failed to cancel booking');
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.error || `Failed to cancel ${cancelType}`);
    } finally {
      setCancelLoading(false);
      setShowCancelConfirm(false);
    }
  };

  const allItems = [
    ...orders.map(order => ({ ...order, type: 'order' as const })),
    ...bookings.map(booking => ({ ...booking, type: 'booking' as const }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredItems = activeTab === 'all' ? allItems :
                       activeTab === 'orders' ? allItems.filter(item => item.type === 'order') :
                       allItems.filter(item => item.type === 'booking');

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
          <h5>Loading your orders...</h5>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <SEOHead 
        title={`${user?.username}'s Orders - The Campgrounds`}
        description={`View your order history and booking details on The Campgrounds`}
      />
      
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="yc-text-primary mb-2">My Orders</h1>
              <p className="text-muted mb-0">Track your product orders and campground bookings</p>
            </div>
            <div>
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/shop')}
                className="me-2"
                style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
              >
                <i className="fas fa-shopping-cart me-2"></i>
                Shop
              </Button>
              <Button 
                variant="primary" 
                onClick={() => navigate('/campgrounds')}
                style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
              >
                <i className="fas fa-campground me-2"></i>
                Book Campground
              </Button>
            </div>
          </div>
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

      {/* Order Tabs */}
      <Card>
        <Card.Header className="p-0">
          <Nav variant="tabs" defaultActiveKey="all">
            <Nav.Item>
              <Nav.Link 
                eventKey="all" 
                active={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                style={{ color: activeTab === 'all' ? '#4a5d23' : '#6b7280' }}
              >
                All ({allItems.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="orders" 
                active={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
                style={{ color: activeTab === 'orders' ? '#4a5d23' : '#6b7280' }}
              >
                Product Orders ({orders.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                eventKey="bookings" 
                active={activeTab === 'bookings'}
                onClick={() => setActiveTab('bookings')}
                style={{ color: activeTab === 'bookings' ? '#4a5d23' : '#6b7280' }}
              >
                Campground Bookings ({bookings.length})
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body>
          {filteredItems.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="fas fa-shopping-bag fa-4x text-muted"></i>
              </div>
              <h4 className="text-muted">No orders yet</h4>
              <p className="text-muted mb-4">
                Start exploring our shop and campgrounds to make your first order!
              </p>
              <div>
                <Button 
                  variant="outline-primary" 
                  className="me-3"
                  onClick={() => navigate('/shop')}
                  style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Browse Shop
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/campgrounds')}
                  style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
                >
                  <i className="fas fa-campground me-2"></i>
                  Explore Campgrounds
                </Button>
              </div>
            </div>
          ) : (
            <Row>
              {filteredItems.map((item) => (
                <Col lg={4} md={6} className="mb-4" key={`${item.type}-${item._id}`}>
                  <Card className="h-100 border-0" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                    <Card.Body className="p-0">
                      {/* Order Header */}
                      <div className="px-3 py-2" style={{ backgroundColor: '#ffffff', borderRadius: '12px 12px 0 0' }}>
                        <Row className="align-items-center">
                          <Col xs={6}>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-map-marker-alt me-2 text-muted" style={{ fontSize: '12px' }}></i>
                              <small className="text-muted">
                                {item.type === 'order' ? 'Product Order' : 'Campground Booking'}
                              </small>
                            </div>
                          </Col>
                          <Col xs={6} className="text-end">
                            <small className="text-muted">
                              Arrival {formatDate(item.createdAt)}
                            </small>
                          </Col>
                        </Row>
                      </div>

                      {/* Order ID and Status */}
                      <div className="px-3 py-2">
                        <Row className="align-items-center mb-2">
                          <Col xs={8}>
                            <div className="d-flex align-items-center">
                              <i className="fas fa-receipt me-2 text-muted" style={{ fontSize: '12px' }}></i>
                              <span className="fw-bold" style={{ fontSize: '14px' }}>
                                {item.type === 'order' ? `#${(item as Order).orderNumber}` : `#${item._id.slice(-6)}`}
                              </span>
                            </div>
                          </Col>
                          <Col xs={4} className="text-end">
                            <Badge 
                              bg={getStatusVariant(item.status || 'pending')} 
                              style={{ fontSize: '10px', padding: '4px 8px' }}
                            >
                              {(item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1)}
                            </Badge>
                          </Col>
                        </Row>

                        {/* Location/Destination */}
                        <div className="d-flex align-items-center mb-3">
                          <i className="fas fa-map-marker-alt me-2 text-muted" style={{ fontSize: '12px' }}></i>
                          <small className="text-muted">
                            {item.type === 'order' ? 'Ship to Address' : (item as Booking).campground.location}
                          </small>
                        </div>

                        {/* Product/Campground Details */}
                        <div className="d-flex align-items-center mb-3">
                          <div className="me-3">
                            {item.type === 'order' ? (
                              (item as Order).items[0] ? (
                                <Image
                                  src={(item as Order).items[0].product.image}
                                  alt={(item as Order).items[0].product.name}
                                  rounded
                                  style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    objectFit: 'cover' 
                                  }}
                                />
                              ) : (
                                <div 
                                  className="bg-light d-flex align-items-center justify-content-center rounded"
                                  style={{ width: '50px', height: '50px' }}
                                >
                                  <i className="fas fa-shopping-bag text-muted"></i>
                                </div>
                              )
                            ) : (
                              (() => {
                                const booking = item as Booking;
                                const campground = booking.campground;
                                return campground?.images && campground.images.length > 0 ? (
                                  <Image
                                    src={campground.images[0].url}
                                    alt={campground.title}
                                    rounded
                                    style={{ 
                                      width: '50px', 
                                      height: '50px', 
                                      objectFit: 'cover' 
                                    }}
                                  />
                                ) : (
                                  <div 
                                    className="bg-light d-flex align-items-center justify-content-center rounded"
                                    style={{ width: '50px', height: '50px' }}
                                  >
                                    <i className="fas fa-campground text-muted"></i>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-bold mb-1" style={{ fontSize: '14px' }}>
                              {item.type === 'order' ? 
                                (item as Order).items[0]?.product.name || 'Multiple Items' : 
                                (item as Booking).campground.title
                              }
                            </div>
                            <div className="text-muted" style={{ fontSize: '12px' }}>
                              {item.type === 'order' ? 
                                `$${(item as Order).totalAmount.toFixed(2)}` : 
                                `$${(item as Booking).totalPrice}`
                              }
                            </div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>
                              {item.type === 'order' ? 
                                `${(item as Order).items.length} item${(item as Order).items.length !== 1 ? 's' : ''}` : 
                                'Booking'
                              }
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="text-end">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => item.type === 'order' ? showOrderDetail(item as Order) : showBookingDetail(item as Booking)}
                            style={{ 
                              color: '#4a5d23', 
                              textDecoration: 'none',
                              fontSize: '12px',
                              padding: '4px 8px'
                            }}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        booking={selectedBooking}
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        onCancel={handleCancelRequest}
      />

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelConfirm} onHide={() => setShowCancelConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h5>Are you sure you want to cancel this {cancelType}?</h5>
            <p className="text-muted">
              {cancelType === 'order' 
                ? 'This action cannot be undone. Your order will be cancelled and stock will be restored.' 
                : 'This action cannot be undone. Your booking will be cancelled.'}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowCancelConfirm(false)}
            disabled={cancelLoading}
          >
            Keep {cancelType === 'order' ? 'Order' : 'Booking'}
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
                Yes, Cancel {cancelType === 'order' ? 'Order' : 'Booking'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Orders; 