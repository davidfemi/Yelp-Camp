import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  InputGroup, 
  Spinner, 
  Alert,
  Pagination,
  Badge
} from 'react-bootstrap';
import { campgroundsAPI, Campground, PaginationInfo } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CampgroundsMap from '../components/CampgroundsMap';
import LoadingScreen from '../components/LoadingScreen';
import SEOHead from '../components/SEOHead';

const Campgrounds: React.FC = () => {
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'title',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCampgrounds = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page: 1,
        limit: 1000, // Fetch all campgrounds
        ...filters,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      };

      const response = await campgroundsAPI.getAll(params);
      
      if (response.success && response.data) {
        setCampgrounds(response.data.campgrounds);
      } else {
        setError('Failed to fetch campgrounds');
      }
    } catch (error) {
      setError('Failed to fetch campgrounds');
      console.error('Error fetching campgrounds:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCampgrounds();
  }, [fetchCampgrounds]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'title',
      sortOrder: 'asc'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container>
      <SEOHead title="All Campgrounds" description="Discover amazing camping destinations across the country" />
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="yc-text-primary mb-2">All Campgrounds</h1>
          <p className="text-muted mb-0">Discover amazing camping destinations across the country</p>
        </div>
        {isAuthenticated && (
          <Button 
            onClick={() => navigate('/campgrounds/new')} 
            className="btn btn-primary"
            size="lg"
            style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
          >
            <i className="fas fa-plus me-2"></i>
            Add New Campground
          </Button>
        )}
      </div>

      {/* Map Section */}
      {!loading && campgrounds.length > 0 && (
        <div className="map-container mb-4">
          <CampgroundsMap campgrounds={campgrounds} />
        </div>
      )}

      {/* Filters */}
      <div className="filter-section">
        <h5>Filter & Sort Campgrounds</h5>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search campgrounds..."
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                placeholder="Filter by location..."
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Min Price</Form.Label>
              <Form.Control
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="$0"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Max Price</Form.Label>
              <Form.Control
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="$100"
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Sort By</Form.Label>
              <Form.Select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="title">Name</option>
                <option value="price">Price</option>
                <option value="location">Location</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={2}>
            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Select
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleFilterChange}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={10} className="d-flex align-items-end">
            <Button 
              variant="outline-primary" 
              onClick={clearFilters}
              style={{ borderColor: '#4a5d23', color: '#4a5d23' }}
            >
              <i className="fas fa-undo me-2"></i>
              Clear Filters
            </Button>
          </Col>
        </Row>
      </div>

      {/* Results Summary */}
      {!loading && (
        <div className="results-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1 yc-text-primary">
                <i className="fas fa-campground me-2"></i>
                {campgrounds.length} Campgrounds Found
              </h6>
              <small className="text-muted">
                {filters.search && `Matching "${filters.search}" • `}
                {filters.location && `In ${filters.location} • `}
                Showing all results
              </small>
            </div>
            <div className="text-muted">
              <small>
                <i className="fas fa-sort me-1"></i>
                Sorted by {filters.sortBy} ({filters.sortOrder})
              </small>
            </div>
          </div>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Loading State */}
      {loading && (
        <LoadingScreen 
          message="Loading amazing campgrounds for you..." 
          size="large"
        />
      )}

      {/* Campgrounds Grid */}
      {!loading && campgrounds.length > 0 && (
        <Row className="campground-grid">
          {campgrounds.map((campground) => (
            <Col key={campground._id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                {campground.images.length > 0 && (
                  <Card.Img
                    variant="top"
                    src={campground.images[0].url}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="location-badge mb-2">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {campground.location}
                  </div>
                  
                  <Card.Title>{campground.title}</Card.Title>
                  
                  <Card.Text className="flex-grow-1">
                    {campground.description.length > 120
                      ? `${campground.description.substring(0, 120)}...`
                      : campground.description}
                  </Card.Text>
                  
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="price-badge">
                        ${campground.price}/night
                      </div>
                      <div className="review-stats">
                        <span className="stars me-1">★★★★☆</span>
                        <small>{campground.reviews.length} review{campground.reviews.length !== 1 ? 's' : ''}</small>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-100"
                      onClick={() => navigate(`/campgrounds/${campground._id}`)}
                      style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
                    >
                      <i className="fas fa-eye me-2"></i>
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* No Results */}
      {!loading && campgrounds.length === 0 && !error && (
        <div className="text-center py-5">
          <div className="yc-bg-gradient-earth p-5 rounded-3 d-inline-block">
            <i className="fas fa-search fa-3x yc-text-primary mb-3"></i>
            <h4 className="yc-text-primary">No campgrounds found</h4>
            <p className="text-muted mb-3">
              We couldn't find any campgrounds matching your criteria.
            </p>
            <Button 
              variant="primary" 
              onClick={clearFilters}
              style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
            >
              <i className="fas fa-undo me-2"></i>
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          className="back-to-top"
          onClick={scrollToTop}
          title="Back to Top"
        >
          <i className="fas fa-chevron-up"></i>
        </Button>
      )}
    </Container>
  );
};

export default Campgrounds; 