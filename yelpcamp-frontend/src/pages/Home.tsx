import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SEOHead from '../components/SEOHead';

const Home: React.FC = () => {
  const [stats, setStats] = useState<{
    totalCampgrounds: number;
    totalReviews: number;
    pricing: { avgPrice: number; minPrice: number; maxPrice: number };
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.get();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="home-page">
      <SEOHead 
        title="The Campgrounds - Discover Amazing Campgrounds Worldwide"
        description="Find and book extraordinary campgrounds worldwide. From mountain peaks to forest havens and lakeside retreats - discover your perfect wilderness escape with detailed reviews, photos, and maps."
        keywords="camping, campgrounds, outdoor adventure, nature, travel, wilderness, hiking, camping destinations, RV parks, tent camping"
        url="https://thecampground.vercel.app"
        type="website"
      />
      {/* Hero Section - Split Screen Design */}
      <div className="hero-section">
        <Container fluid className="px-0">
          <Row className="g-0 hero-row">
            {/* Left Side - Content */}
            <Col lg={6} className="hero-content d-flex align-items-center">
              <div className="hero-text-container">
                <div className="hero-logo">
                  <img 
                    src={require('../assets/thecampgrounds-logo.png')}
                    alt="The Campgrounds Logo"
                    className="img-fluid mb-4 hero-logo-white"
                    style={{ maxHeight: '150px' }}
                  />
                </div>
                
                <h1 className="hero-title">
                  Find Your Perfect
                  <span className="hero-title-accent">Wilderness Escape</span>
                </h1>
                
                <p className="hero-description">
                  Escape into nature's embrace and discover extraordinary campgrounds 
                  where adventure meets tranquility. From mountain peaks to lakeside 
                  retreats, your perfect outdoor sanctuary awaits.
                </p>
                
                <div className="hero-actions">
                  <Button 
                    onClick={() => navigate('/campgrounds')} 
                    className="btn-hero-primary"
                    size="lg"
                  >
                    Explore Campgrounds
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')} 
                    variant="outline-light" 
                    className="btn-hero-secondary"
                    size="lg"
                  >
                    Join Community
                  </Button>
                </div>

                {/* Quick Stats */}
                {stats && (
                  <div className="hero-stats">
                    <div className="stat-item">
                      <div className="stat-number">{stats.totalCampgrounds}</div>
                      <div className="stat-label">Campgrounds</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                      <div className="stat-number">{stats.totalReviews}</div>
                      <div className="stat-label">Reviews</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                      <div className="stat-number">${stats.pricing.avgPrice.toFixed(0)}</div>
                      <div className="stat-label">Avg/Night</div>
                    </div>
                  </div>
                )}
              </div>
            </Col>

            {/* Right Side - Atmospheric Image */}
            <Col lg={6} className="hero-image">
              <div className="image-overlay">
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Experience Categories */}
      <section className="experience-section">
        <Container>
          <div className="section-header">
            <h2 className="section-title">Choose Your Adventure</h2>
            <p className="section-subtitle">
              Every landscape tells a story. What will yours be?
            </p>
          </div>
          
          <Row className="experience-grid">
            <Col xs={12} sm={6} lg={4} className="mb-4 d-flex">
              <Card 
                className="experience-card mountain-card h-100 w-100"
                onClick={() => navigate('/campgrounds?category=mountain')}
                style={{ cursor: 'pointer' }}
              >
                <div className="experience-icon">🏔️</div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Mountain Peaks</Card.Title>
                  <Card.Text className="flex-grow-1">
                    Breathtaking vistas and crisp mountain air await at elevated campgrounds.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={4} className="mb-4 d-flex">
              <Card 
                className="experience-card forest-card h-100 w-100"
                onClick={() => navigate('/campgrounds?category=forest')}
                style={{ cursor: 'pointer' }}
              >
                <div className="experience-icon">🌲</div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Forest Havens</Card.Title>
                  <Card.Text className="flex-grow-1">
                    Find peace among towering trees and discover nature's quiet wisdom.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={4} className="mb-4 d-flex">
              <Card 
                className="experience-card lake-card h-100 w-100"
                onClick={() => navigate('/campgrounds?category=lake')}
                style={{ cursor: 'pointer' }}
              >
                <div className="experience-icon">🏞️</div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title>Lakeside Serenity</Card.Title>
                  <Card.Text className="flex-grow-1">
                    Wake up to gentle waves and mirror-like reflections of the sky.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <Container>
          <div className="cta-content">
            <h2 className="cta-title">Your Next Adventure Awaits</h2>
            <p className="cta-description">
              Don't just dream about the perfect camping trip—make it happen.
            </p>
            <Button 
              onClick={() => navigate('/campgrounds')} 
              className="btn-cta"
              size="lg"
            >
              Explore Campgrounds Now
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home; 