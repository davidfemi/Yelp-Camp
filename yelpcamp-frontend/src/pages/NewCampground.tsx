import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Spinner,
  Image
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { campgroundsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface FormData {
  title: string;
  description: string;
  location: string;
  price: string;
  images: File[];
}

interface FormErrors {
  title?: string;
  description?: string;
  location?: string;
  price?: string;
  images?: string;
}

const NewCampground: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    price: '',
    images: []
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to create a campground');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }));
      return;
    }

    // Validate file types and sizes
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        invalidFiles.push(`${file.name} is not an image file`);
      } else if (file.size > 5 * 1024 * 1024) { // 5MB limit
        invalidFiles.push(`${file.name} is too large (max 5MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: invalidFiles.join(', ')
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: validFiles
    }));

    // Clear errors
    setErrors(prev => ({
      ...prev,
      images: undefined
    }));

    // Generate previews
    const previewUrls: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewUrls.push(e.target?.result as string);
        if (previewUrls.length === validFiles.length) {
          setImagePreviews(previewUrls);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (formData.images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImages = async (images: File[]): Promise<Array<{ url: string; filename: string }>> => {
    // For now, we'll create mock image data since we don't have Cloudinary setup in frontend
    // In a real implementation, you'd upload to Cloudinary here
    const mockImages = images.map((file, index) => ({
      url: URL.createObjectURL(file), // This would be the Cloudinary URL
      filename: `campground_${Date.now()}_${index}` // This would be the Cloudinary filename
    }));
    
    return mockImages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first (in real app, this would go to Cloudinary)
      const uploadedImages = await uploadImages(formData.images);

      // Create campground data
      const campgroundData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        price: Number(formData.price),
        images: uploadedImages
      };

      const response = await campgroundsAPI.create(campgroundData);

      if (response.success && response.data) {
        toast.success('Campground created successfully!');
        navigate(`/campgrounds/${response.data.campground._id}`);
      } else {
        toast.error('Failed to create campground');
      }
    } catch (error: any) {
      console.error('Error creating campground:', error);
      toast.error(error.response?.data?.message || 'Failed to create campground');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h2 className="mb-0">Create New Campground</h2>
              <p className="text-muted mb-0">Share your favorite camping spot with the community</p>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Title Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Campground Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a descriptive title for your campground"
                    isInvalid={!!errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Location Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Location *</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State or specific address"
                    isInvalid={!!errors.location}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.location}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Be as specific as possible to help others find your campground
                  </Form.Text>
                </Form.Group>

                {/* Price Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Price per Night *</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      isInvalid={!!errors.price}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.price}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                {/* Description Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your campground, its amenities, nearby attractions, and what makes it special..."
                    isInvalid={!!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Minimum 10 characters. Include details about amenities, scenery, and activities.
                  </Form.Text>
                </Form.Group>

                {/* Image Upload Field */}
                <Form.Group className="mb-4">
                  <Form.Label>Images *</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    isInvalid={!!errors.images}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.images}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Select up to 5 images. Maximum file size: 5MB each. Accepted formats: JPG, PNG, GIF.
                  </Form.Text>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-3">
                      <h6>Image Preview:</h6>
                      <Row>
                        {imagePreviews.map((preview, index) => (
                          <Col key={index} md={3} className="mb-3">
                            <div className="position-relative">
                              <Image
                                src={preview}
                                thumbnail
                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0 m-1"
                                onClick={() => removeImage(index)}
                              >
                                ×
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}
                </Form.Group>

                {/* Form Actions */}
                <div className="d-flex justify-content-between">
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/campgrounds')}
                    disabled={isSubmitting}
                    style={{ borderColor: '#6b7280', color: '#6b7280' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    style={{ backgroundColor: '#4a5d23', borderColor: '#4a5d23' }}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating Campground...
                      </>
                    ) : (
                      'Create Campground'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Help Section */}
          <Alert variant="info" className="mt-4">
            <Alert.Heading>Tips for a Great Campground Listing</Alert.Heading>
            <ul className="mb-0">
              <li>Use clear, high-quality photos that showcase the best features</li>
              <li>Include details about amenities (restrooms, showers, fire pits, etc.)</li>
              <li>Mention nearby attractions and activities</li>
              <li>Be accurate with location information</li>
              <li>Set a fair price based on amenities and location</li>
            </ul>
          </Alert>
        </Col>
      </Row>
    </Container>
  );
};

export default NewCampground; 