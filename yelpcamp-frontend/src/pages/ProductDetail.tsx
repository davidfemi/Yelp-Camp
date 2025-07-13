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
  Image
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { productAPI, Product } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SEOHead from '../components/SEOHead';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await productAPI.getById(id);
      if (response.success && response.data) {
        setProduct(response.data.product);
      } else {
        setError('Failed to load product details');
      }
    } catch (error) {
      setError('Failed to load product details');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!product || !user) return;

    setAddingToCart(true);
    try {
      addToCart(product, quantity);
      setShowAddToCartModal(false);
      setQuantity(1);
    } catch (error) {
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'clothing': 'Clothing',
      'accessories': 'Accessories',
      'drinkware': 'Drinkware',
      'outdoor-gear': 'Outdoor Gear',
      'collectibles': 'Collectibles'
    };
    return categoryMap[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'clothing': 'fas fa-tshirt',
      'accessories': 'fas fa-key',
      'drinkware': 'fas fa-coffee',
      'outdoor-gear': 'fas fa-mountain',
      'collectibles': 'fas fa-gem'
    };
    return iconMap[category] || 'fas fa-tag';
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <Spinner 
            animation="border" 
            role="status" 
            style={{ 
              width: '3rem', 
              height: '3rem',
              borderTopColor: '#4a5d23'
            }}
          >
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div className="mt-3">
            <h5 style={{ color: '#4a5d23' }}>Loading product details...</h5>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container>
          <div className="text-center">
            <Alert variant="danger" className="mb-4">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error || 'Product not found'}
            </Alert>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate('/shop')}
              style={{ 
                backgroundColor: '#4a5d23', 
                borderColor: '#4a5d23',
                padding: '12px 30px',
                borderRadius: '25px'
              }}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Shop
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
    }}>
      <Container style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
        <SEOHead
          title={`${product.name} - The Campgrounds Shop`}
          description={product.description}
          keywords={`${product.name}, ${product.category}, camping gear, outdoor equipment, The Campgrounds merchandise`}
          image={product.image}
          url={`https://thecampground.vercel.app/products/${product._id}`}
          type="product"
          price={product.price}
        />

        {/* Enhanced Breadcrumb */}
        <Card className="mb-4 shadow-sm border-0">
          <Card.Body className="py-3">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Button 
                    variant="link" 
                    className="p-0 text-decoration-none fw-semibold"
                    onClick={() => navigate('/shop')}
                    style={{ 
                      color: '#2d4016',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#4a5d23';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#2d4016';
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    <i className="fas fa-store me-1"></i>
                    Shop
                  </Button>
                </li>
                <li className="breadcrumb-item">
                  <Button 
                    variant="link" 
                    className="p-0 text-decoration-none fw-semibold"
                    onClick={() => navigate(`/shop?category=${product.category}`)}
                    style={{ 
                      color: '#2d4016',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#4a5d23';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#2d4016';
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    <i className={`${getCategoryIcon(product.category)} me-1`}></i>
                    {getCategoryDisplayName(product.category)}
                  </Button>
                </li>
                                 <li className="breadcrumb-item active fw-semibold" aria-current="page" style={{ color: '#2d4016' }}>
                   {product.name}
                 </li>
              </ol>
            </nav>
          </Card.Body>
        </Card>

        <Row className="g-4">
          {/* Left Column - Enhanced Product Image */}
          <Col lg={6}>
            <Card className="border-0 shadow-lg overflow-hidden">
              <div style={{ 
                position: 'relative',
                background: 'linear-gradient(45deg, #ffffff 0%, #f8f9fa 100%)'
              }}>
                <div 
                  style={{ 
                    height: '600px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    className="w-100 h-100"
                    style={{ 
                      objectFit: 'contain',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                  
                  {/* Stock Status Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px'
                  }}>
                    <Badge 
                      bg={product.inStock ? 'success' : 'danger'}
                      className="px-3 py-2 fs-6"
                      style={{ 
                        borderRadius: '20px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                    >
                      <i className={`fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column - Enhanced Product Details */}
          <Col lg={6}>
            <Card className="border-0 shadow-lg h-100">
              <Card.Body className="p-4">
                {/* Category Badge */}
                <div className="mb-3">
                  <Badge 
                    style={{ 
                      backgroundColor: '#4a5d23',
                      color: 'white',
                      border: 'none'
                    }}
                    className="px-3 py-2 fs-6"
                  >
                    <i className={`${getCategoryIcon(product.category)} me-2`}></i>
                    {getCategoryDisplayName(product.category)}
                  </Badge>
                </div>

                {/* Product Name */}
                <h1 className="mb-3 fw-bold" style={{ 
                  color: '#2c3e50',
                  fontSize: '2.5rem',
                  lineHeight: '1.2'
                }}>
                  {product.name}
                </h1>

                {/* Price */}
                <div className="mb-4">
                  <h2 className="mb-0" style={{ 
                    color: '#4a5d23',
                    fontSize: '2.2rem',
                    fontWeight: '700'
                  }}>
                    ${product.price.toFixed(2)}
                  </h2>
                </div>

                {/* Product Details Card */}
                <Card className="mb-4 border-0" style={{ backgroundColor: 'rgba(74, 93, 35, 0.05)' }}>
                  <Card.Body className="p-3">
                    <h6 className="mb-3 fw-semibold" style={{ color: '#4a5d23' }}>
                      <i className="fas fa-list-ul me-2"></i>
                      Product Details
                    </h6>
                    <Row className="g-3">
                      <Col sm={6}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Category:</span>
                          <span className="fw-semibold">{getCategoryDisplayName(product.category)}</span>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Price:</span>
                          <span className="fw-bold" style={{ color: '#4a5d23' }}>
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Stock:</span>
                          <span className="fw-semibold">{product.stockQuantity} available</span>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Status:</span>
                          <Badge bg={product.inStock ? 'success' : 'danger'}>
                            {product.inStock ? 'Available' : 'Out of Stock'}
                          </Badge>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Action Buttons */}
                <div className="d-grid gap-3">
                  {product.inStock ? (
                    <>
                      {isAuthenticated ? (
                        <Button 
                          variant="primary" 
                          size="lg" 
                          onClick={() => setShowAddToCartModal(true)}
                          style={{ 
                            backgroundColor: '#4a5d23', 
                            borderColor: '#4a5d23',
                            padding: '15px',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 15px rgba(74, 93, 35, 0.3)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(74, 93, 35, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(74, 93, 35, 0.3)';
                          }}
                        >
                          <i className="fas fa-cart-plus me-2"></i>
                          Add to Cart
                        </Button>
                      ) : (
                        <Button 
                          variant="outline-primary" 
                          size="lg" 
                          onClick={() => navigate('/login')}
                          style={{ 
                            borderColor: '#4a5d23', 
                            color: '#4a5d23',
                            padding: '15px',
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            borderWidth: '2px'
                          }}
                        >
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Login to Purchase
                        </Button>
                      )}
                    </>
                  ) : (
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      disabled
                      style={{ 
                        padding: '15px',
                        borderRadius: '12px',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                      }}
                    >
                      <i className="fas fa-times-circle me-2"></i>
                      Out of Stock
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline-secondary" 
                    size="lg"
                    onClick={() => navigate('/shop')}
                    style={{ 
                      borderColor: '#2d4016', 
                      color: '#2d4016',
                      padding: '12px',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      borderWidth: '2px',
                      backgroundColor: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2d4016';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#2d4016';
                    }}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Shop
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Product Description Card */}
        <Row className="mt-4">
          <Col>
            <Card className="border-0 shadow-lg">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: 'rgba(74, 93, 35, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '15px'
                  }}>
                    <i className="fas fa-info-circle" style={{ color: '#4a5d23', fontSize: '1.5rem' }}></i>
                  </div>
                  <h3 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>
                    Product Description
                  </h3>
                </div>
                <div style={{ 
                  backgroundColor: 'rgba(74, 93, 35, 0.02)',
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid rgba(74, 93, 35, 0.1)'
                }}>
                  <p className="text-muted lh-lg mb-0" style={{ 
                    fontSize: '1.1rem',
                    lineHeight: '1.8'
                  }}>
                    {product.description}
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Add to Cart Modal */}
        <Modal 
          show={showAddToCartModal} 
          onHide={() => setShowAddToCartModal(false)}
          centered
          size="lg"
        >
          <Modal.Header 
            closeButton 
            style={{ 
              backgroundColor: '#4a5d23', 
              color: 'white',
              borderBottom: 'none'
            }}
          >
            <Modal.Title className="fw-bold">
              <i className="fas fa-cart-plus me-2"></i>
              Add to Cart
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Card className="border-0" style={{ backgroundColor: '#f8f9fa' }}>
              <Card.Body className="p-3">
                <div className="d-flex align-items-center mb-4">
                  <div style={{ 
                    width: '100px', 
                    height: '100px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">{product.name}</h5>
                    <p className="text-muted mb-0 fs-5">
                      <strong style={{ color: '#4a5d23' }}>
                        ${product.price.toFixed(2)}
                      </strong> each
                    </p>
                  </div>
                </div>
                
                <Form>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold mb-2">
                      <i className="fas fa-sort-numeric-up me-2"></i>
                      Quantity
                    </Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max={product.stockQuantity}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      style={{ 
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '1.1rem',
                        borderColor: '#4a5d23'
                      }}
                    />
                    <Form.Text className="text-muted">
                      Maximum {product.stockQuantity} items available
                    </Form.Text>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between align-items-center p-3 rounded" 
                       style={{ backgroundColor: 'rgba(74, 93, 35, 0.1)' }}>
                    <span className="fs-5 fw-semibold">Total Amount:</span>
                    <strong className="fs-4" style={{ color: '#4a5d23' }}>
                      ${(product.price * quantity).toFixed(2)}
                    </strong>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Modal.Body>
          <Modal.Footer className="border-0 p-4">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowAddToCartModal(false)}
              style={{ 
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '500'
              }}
            >
              <i className="fas fa-times me-2"></i>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddToCart}
              disabled={addingToCart}
              style={{ 
                backgroundColor: '#4a5d23', 
                borderColor: '#4a5d23',
                padding: '10px 25px',
                borderRadius: '8px',
                fontWeight: '600',
                boxShadow: '0 2px 10px rgba(74, 93, 35, 0.3)'
              }}
            >
              {addingToCart ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Adding to Cart...
                </>
              ) : (
                <>
                  <i className="fas fa-cart-plus me-2"></i>
                  Add to Cart
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default ProductDetail; 