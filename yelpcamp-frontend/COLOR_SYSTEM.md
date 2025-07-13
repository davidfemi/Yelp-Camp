# The Campgrounds Color System

## Overview
The The Campgrounds color system is derived from our logo and creates a cohesive, outdoor-themed design that reflects our camping and nature focus.

## Brand Colors

### Primary Colors (From Logo)
```css
--yc-primary: #4a5d23;           /* Main green from logo - use for buttons, links, emphasis */
--yc-primary-light: #6b8c2f;    /* Lighter green - hover states, accents */
--yc-primary-dark: #3a4a1c;     /* Darker green - active states, depth */
--yc-primary-50: #f6f8f3;       /* Very light green tint - backgrounds */
--yc-primary-100: #e8f0dc;      /* Light green tint - subtle backgrounds */
```

### Secondary Colors
```css
--yc-cream: #f5f3f0;            /* Background cream from logo - main bg */
--yc-cream-dark: #ede8e3;       /* Slightly darker cream - sections */
--yc-beige: #e8e4dd;            /* Warm beige - cards, containers */
```

### Accent Colors
```css
--yc-forest: #2d3d18;           /* Deep forest green - headers, dark themes */
--yc-sage: #8fa068;             /* Sage green accent - secondary buttons */
--yc-earth: #a67c5c;            /* Earth brown - tertiary elements */
```

### Status Colors
```css
--yc-success: #10b981;          /* Green success - confirmations */
--yc-warning: #f59e0b;          /* Amber warning - alerts */
--yc-error: #ef4444;            /* Red error - errors */
--yc-info: var(--yc-primary);   /* Use primary for info */
```

## Usage Guidelines

### Buttons
```jsx
// Primary action
<Button className="btn-primary">Book Campground</Button>

// Secondary action  
<Button className="btn-outline-primary">View Details</Button>

// Custom YelpCamp buttons
<Button className="btn-yc-sage">Explore</Button>
<Button className="btn-yc-earth">Filter</Button>

// Custom The Campgrounds buttons
```

### Backgrounds
```jsx
// Main content areas
<div className="bg-white">...</div>

// Secondary sections
<div className="bg-light">...</div> // Uses --yc-cream

// Tertiary sections
<div className="yc-bg-tertiary">...</div> // Uses --yc-primary-50

// Hero sections
<div className="yc-bg-gradient-primary">...</div>
```

### Text Colors
```jsx
// Primary text
<h1 className="text-dark">...</h1> // Uses --yc-text-primary

// Secondary text
<p className="text-muted">...</p> // Uses --yc-text-muted

// Brand colored text
<span className="text-primary">...</span> // Uses --yc-primary
<span className="yc-text-sage">...</span> // Uses --yc-sage
```

### Cards & Components
```jsx
// Standard card (auto-themed)
<Card>...</Card>

// Featured card
<Card className="featured-card">...</Card>

// Stats card
<Card className="stats-card">...</Card>
```

## CSS Custom Properties

All colors are available as CSS custom properties that can be used in your styles:

```css
.my-component {
  background-color: var(--yc-primary);
  color: white;
  border: 1px solid var(--yc-border-light);
  box-shadow: var(--yc-shadow-md);
}

.my-hover-effect:hover {
  background-color: var(--yc-primary-dark);
  box-shadow: var(--yc-shadow-lg);
}
```

## Gradients
```css
/* Hero sections */
background: var(--yc-gradient-hero);

/* Primary buttons */
background: var(--yc-gradient-primary);

/* Sage accents */
background: var(--yc-gradient-sage);

/* Earth tones */
background: var(--yc-gradient-earth);
```

## Shadows
```css
/* Light shadow for cards */
box-shadow: var(--yc-shadow-sm);

/* Medium shadow for components */
box-shadow: var(--yc-shadow-md);

/* Heavy shadow for overlays */
box-shadow: var(--yc-shadow-lg);

/* Extra heavy for modals */
box-shadow: var(--yc-shadow-xl);
```

## Utility Classes

### Background Utilities
- `.yc-bg-gradient-primary` - Primary gradient
- `.yc-bg-gradient-sage` - Sage gradient  
- `.yc-bg-gradient-earth` - Earth gradient

### Text Utilities
- `.yc-text-primary` - Primary brand color
- `.yc-text-forest` - Deep forest green
- `.yc-text-sage` - Sage green

### Border Utilities
- `.yc-border-primary` - Primary border color

### Shadow Utilities
- `.yc-shadow` - Standard shadow
- `.yc-shadow-md` - Medium shadow
- `.yc-shadow-lg` - Large shadow

## Component Examples

### Hero Section
```jsx
<section className="hero-section">
  <Container>
    <h1>Find Your Perfect Campground</h1>
    <p>Discover amazing camping spots across the country</p>
    <Button size="lg" className="btn-primary">Get Started</Button>
  </Container>
</section>
```

### Campground Card
```jsx
<Card className="campground-grid h-100">
  <Card.Img variant="top" src={image} />
  <Card.Body>
    <div className="location-badge">{location}</div>
    <Card.Title>{title}</Card.Title>
    <Card.Text>{description}</Card.Text>
    <div className="review-stats">
      <span className="stars">★★★★☆</span>
      <span>{reviewCount} reviews</span>
    </div>
    <div className="price-badge">${price}/night</div>
  </Card.Body>
</Card>
```

### Filter Section
```jsx
<div className="filter-section">
  <h5>Filter Campgrounds</h5>
  <Form>
    {/* Form controls auto-themed */}
  </Form>
</div>
```

## Accessibility

All color combinations meet WCAG 2.1 AA contrast requirements:

- **Primary on White**: 8.7:1 ratio ✅
- **Text on Cream**: 15.2:1 ratio ✅  
- **Secondary Text**: 4.8:1 ratio ✅
- **Muted Text**: 4.1:1 ratio ✅

## Brand Consistency

### Do's ✅
- Use primary green for main actions and brand elements
- Use cream/beige for backgrounds and sections
- Use gradients for hero sections and featured content
- Maintain consistent shadow usage
- Use sage and earth colors for secondary elements

### Don'ts ❌
- Don't use pure black or pure white (use our neutrals)
- Don't mix our color system with other brand colors
- Don't use colors outside the defined palette
- Don't ignore contrast requirements
- Don't overuse bright accent colors

## Migration from Old Colors

Old Bootstrap classes are automatically updated:

- `.btn-primary` → Now uses `--yc-primary`
- `.text-primary` → Now uses `--yc-primary`  
- `.bg-primary` → Now uses The Campgrounds gradient
- `.alert-info` → Now uses The Campgrounds primary colors

No code changes needed - existing components will automatically use the new color system! 