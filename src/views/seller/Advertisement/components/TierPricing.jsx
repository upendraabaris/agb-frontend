import React from 'react';
import { Form, Row, Col, Badge } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const TierPricing = ({ categories, selectedCategory, onCategoryChange }) => {
  if (!categories || categories.length === 0) {
    return (
      <div className='alert alert-warning'>
        <span className='text-muted'>
          No ad types available for this category. Please check with admin to add pricing tiers for this category.
        </span>
      </div>
    );
  }

  return (
    <div>
      <p className='text-muted mb-3'>Select the type and duration of your advertisement</p>
      <Row>
        {categories.map((category) => (
          <Col key={category.id} md={6} lg={4} className='mb-3'>
            <div
              className={`p-3 border rounded cursor-pointer ${
                selectedCategory === category.id ? 'border-primary bg-light' : 'border-light'
              }`}
              onClick={() => onCategoryChange(category.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onCategoryChange(category.id);
                }
              }}
              role='button'
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <div className='d-flex justify-content-between align-items-start mb-2'>
                <div>
                  <div className='fw-bold'>
                    {category.ad_type === 'banner' ? (
                      <>
                        <CsLineIcons icon='image' className='me-2' />
                        Banner Ad
                      </>
                    ) : (
                      <>
                        <CsLineIcons icon='stamp' className='me-2' />
                        Stamp Ad
                      </>
                    )}
                  </div>
                  <div className='text-muted small mt-1'>
                    Priority: {category.priority}
                  </div>
                </div>
                <Badge bg='primary'>₹{category.price}</Badge>
              </div>
              <div className='text-muted small'>
                <div className='d-flex justify-content-between mb-1'>
                  <span>Duration:</span>
                  <span className='text-dark fw-bold'>{category.duration_days} days</span>
                </div>
              </div>
              <Form.Check
                type='radio'
                id={`category-${category.id}`}
                name='ad_category'
                value={category.id}
                checked={selectedCategory === category.id}
                onChange={(e) => onCategoryChange(e.target.value)}
                className='mt-2'
                label='Select this'
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TierPricing;
