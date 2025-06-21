import React from 'react';
import { Container, Alert } from 'react-bootstrap';

const EditCampground: React.FC = () => {
  return (
    <Container>
      <Alert variant="info">
        <h4>Edit Campground Page</h4>
        <p>This page will contain a form to edit existing campgrounds, including:</p>
        <ul>
          <li>Pre-filled form with current campground data</li>
          <li>Ability to update name, description, location, and price</li>
          <li>Image management (add/remove images)</li>
          <li>Form validation</li>
          <li>Authorization check (only campground owner can edit)</li>
        </ul>
        <p><strong>Status:</strong> To be implemented</p>
      </Alert>
    </Container>
  );
};

export default EditCampground; 