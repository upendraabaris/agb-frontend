import React from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const PreviewSection = ({
  category,
  slots,
  duration,
  pricing,
  mobileImage,
  desktopImage,
  mobileRedirectUrl,
  desktopRedirectUrl,
  onEdit,
  onSubmit,
  submitting,
}) => {
  const getPricingForDuration = () => {
    if (!pricing || !pricing.adCategories || pricing.adCategories.length === 0) return 0;
    const priceField = `pricing${duration}Days`;
    return pricing.adCategories[0]?.[priceField] || 0;
  };

  if (!category) {
    return (
      <Card className='border-danger'>
        <Card.Body>
          <p className='text-danger'>Error: Category data is missing. Please go back and select a category.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <Row className='mb-4'>
        <Col>
          <div className='page-title-container'>
            <h2 className='mb-0 pb-0'>Advertisement Preview</h2>
            <div className='text-muted fs-base'>Review your advertisement before submitting</div>
          </div>
        </Col>
      </Row>

      {/* Details Summary */}
      <Card className='mb-4'>
        <Card.Header className='bg-light'>
          <Card.Title className='mb-0'>
            <CsLineIcons icon='info' className='me-2' />
            Advertisement Details
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className='mb-3'>
              <div className='mb-3'>
                <label className='text-muted small fw-bold mb-1 d-block'>Product Category</label>
                <div className='fw-bold fs-5'>{category?.name || 'Unknown'}</div>
              </div>
            </Col>
            <Col md={6} className='mb-3'>
              <div className='mb-3'>
                <label className='text-muted small fw-bold mb-1 d-block'>Ad Tier</label>
                <div className='fw-bold fs-5'>{pricing?.tierName || 'Unknown'}</div>
              </div>
            </Col>
            <Col md={6} className='mb-3'>
              <div className='mb-3'>
                <label className='text-muted small fw-bold mb-1 d-block'>Selected Slots</label>
                <div className='fw-bold fs-5'>
                  <Badge bg='info'>{slots || 'None'}</Badge>
                </div>
              </div>
            </Col>
            <Col md={6} className='mb-3'>
              <div className='mb-3'>
                <label className='text-muted small fw-bold mb-1 d-block'>Duration</label>
                <div className='fw-bold fs-5'>{duration || 30} days</div>
              </div>
            </Col>
            <Col md={6} className='mb-3'>
              <div className='mb-3'>
                <label className='text-muted small fw-bold mb-1 d-block'>Price per Ad Type</label>
                <div className='fw-bold fs-5 text-success'>₹{getPricingForDuration()}</div>
              </div>
            </Col>
            <Col md={6} className='mb-3'>
              <div className='mb-3'>
                <label className='text-muted small fw-bold mb-1 d-block'>Available Slots</label>
                <div className='fw-bold fs-5'>
                  {category?.availableSlots || 0}/{(category?.bookedSlots || 0) + (category?.availableSlots || 0)}
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Mobile Preview */}
      <Card className='mb-4'>
        <Card.Header className='bg-light'>
          <Card.Title className='mb-0'>
            <CsLineIcons icon='mobile' className='me-2' />
            Mobile Preview
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <div className='text-center'>
            <div
              className='d-inline-block'
              style={{
                border: '2px solid #ccc',
                borderRadius: '12px',
                padding: '4px',
                backgroundColor: '#000',
              }}
            >
              <img
                src={mobileImage}
                alt='Mobile preview'
                className='img-fluid'
                style={{
                  maxWidth: '320px',
                  borderRadius: '10px',
                  display: 'block',
                }}
              />
            </div>
            <div className='mt-3 text-muted small'>
              {mobileRedirectUrl && (
                <>
                  <span className='fw-bold'>Redirect URL:</span>
                  <br />
                  <a href={mobileRedirectUrl} target='_blank' rel='noopener noreferrer'>
                    {mobileRedirectUrl}
                  </a>
                </>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Desktop Preview */}
      <Card className='mb-4'>
        <Card.Header className='bg-light'>
          <Card.Title className='mb-0'>
            <CsLineIcons icon='monitor' className='me-2' />
            Desktop Preview
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <div className='text-center'>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              <img
                src={desktopImage}
                alt='Desktop preview'
                className='img-fluid'
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              />
            </div>
            <div className='mt-3 text-muted small'>
              {desktopRedirectUrl && (
                <>
                  <span className='fw-bold'>Redirect URL:</span>
                  <br />
                  <a href={desktopRedirectUrl} target='_blank' rel='noopener noreferrer'>
                    {desktopRedirectUrl}
                  </a>
                </>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>
      {/* Terms Notice */}
      <Card className='mb-4 border-warning'>
        <Card.Body>
          <div className='alert alert-warning mb-0'>
            <CsLineIcons icon='warning' className='me-2' />
            <strong>Important:</strong> By submitting this advertisement, you agree that:
            <ul className='mt-2 mb-0 ms-3'>
              <li>The images and content are original or you have rights to use them</li>
              <li>The advertisement complies with our content guidelines</li>
              <li>You understand this request will be reviewed by our admin team</li>
              <li>Once approved, your advertisement will run for the selected duration and slots</li>
              <li>The pricing shown is for each selected ad type (banner/stamp)</li>
</ul></div> </Card.Body> </Card>
      {/* Action Buttons */}
      <Card>
        <Card.Body className='text-end'>
          <Button
            variant='outline-secondary'
            className='me-2'
            onClick={onEdit}
            disabled={submitting}
          >
            <CsLineIcons icon='edit' className='me-2' />
            Edit
          </Button>
          <Button
            variant='success'
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                  aria-hidden='true'
                />
                Submitting...
              </>
            ) : (
              <>
                <CsLineIcons icon='check' className='me-2' />
                Submit Advertisement
              </>
            )}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PreviewSection;
