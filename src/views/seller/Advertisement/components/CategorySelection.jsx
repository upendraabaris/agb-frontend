import React from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';

const CategorySelection = ({ categories, selectedCategory, onCategoryChange, isAdType = false }) => {
  if (!categories || categories.length === 0) {
    return (
      <Alert variant='warning'>
        <span className='text-muted'>
          {isAdType
            ? 'No ad types available for this tier. Please try another tier.'
            : 'No categories available. Please contact admin.'}
        </span>
      </Alert>
    );
  }

  return (
    <div>
      {!isAdType && <p className='text-muted mb-3'>Select product category where you want to advertise</p>}
      <Row>
        {categories.map((category) => {
          const displayName = isAdType
            ? `${category.ad_type || 'Ad'} - ₹${category.price}`
            : category.name || category.parent?.name;

          let displayDescription = '';
          if (isAdType) {
            displayDescription = `${category.duration_days} days • Priority: ${category.priority}`;
          } else if (category.parent) {
            displayDescription = `Category: ${category.parent.name}`;
          }

          return (
            <Col key={category.id} md={6} lg={4} className='mb-3'>
              <Form.Check
                type='radio'
                id={`category-${category.id}`}
                name={isAdType ? 'ad_type' : 'product_category'}
                value={category.id}
                checked={selectedCategory === category.id}
                onChange={() => onCategoryChange(category.id)}
                className='cursor-pointer'
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCategoryChange(category.id);
                  }
                }}
              >
                <Form.Check.Input
                  type='radio'
                  id={`category-${category.id}`}
                  checked={selectedCategory === category.id}
                  tabIndex={-1}
                />
                <Form.Check.Label className='cursor-pointer ms-2 flex-grow-1'>
                  <div className='fw-bold'>{displayName}</div>
                  {displayDescription && (
                    <div className='text-muted small'>{displayDescription}</div>
                  )}
                  {isAdType && !category.is_active && (
                    <span className='badge bg-danger mt-1'>Inactive</span>
                  )}
                </Form.Check.Label>
              </Form.Check>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default CategorySelection;
