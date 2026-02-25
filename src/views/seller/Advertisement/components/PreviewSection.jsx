import React from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const PreviewSection = ({
  category,
  slots,
  duration,
  pricing,
  slotMedia = {},
  totalPrice = 0,
  onEdit,
  onSubmit,
  submitting,
}) => {
  const formatSlotName = (slot) => {
    if (!slot) return slot;
    const parts = slot.split('_');
    const type = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const num = parts[1];
    return `${type} #${num}`;
  };
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
            {/* <Col md={6} className='mb-3'>
              <div className='mb-3'>
                <label className='text-muted small fw-bold mb-1 d-block'>Price per Ad Type</label>
                <div className='fw-bold fs-5 text-success'>₹{getPricingForDuration()}</div>
              </div>
            </Col> */}
            <Col md={6} className='mb-3'>
              <div className='mb-3'>
                <label className='text-muted small fw-bold mb-1 d-block'>Available Slots</label>
                <div className='fw-bold fs-5'>
                  {category?.availableSlots || 0}/{(category?.bookedSlots || 0) + (category?.availableSlots || 0)}
                </div>
              </div>
            </Col>
            <Col md={6} className='mb-3'>
              <div className='mb-3'>
                <label className='text-muted small fw-bold mb-1 d-block'>Total Cost</label>
                <div className='fw-bold fs-5 text-danger'>₹{Math.round(totalPrice)}</div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* show media details for each slot */}
      {slotMedia && Object.keys(slotMedia).length > 0 && (
        <Card className='mb-4'>
          <Card.Header className='bg-light'>
            <Card.Title className='mb-0'>
              <CsLineIcons icon='image' className='me-2' />
              Slot Media
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Row>
              {Object.entries(slotMedia).map(([slot, media]) => (
                <Col md={6} key={slot} className='mb-4'>
                  <h6 className='mb-2'>{formatSlotName(slot)}</h6>
                  {media.mobileImage && (
                    <div className='mb-2'>
                      <strong>Mobile Image:</strong>
                      <br />
                      <img src={media.mobileImage} alt='mobile' className='img-fluid' style={{ maxHeight: '120px' }} />
                    </div>
                  )}
                  {media.desktopImage && (
                    <div className='mb-2'>
                      <strong>Desktop Image:</strong>
                      <br />
                      <img src={media.desktopImage} alt='desktop' className='img-fluid' style={{ maxHeight: '120px' }} />
                    </div>
                  )}
                  <div className='mb-2'>
                    <strong>URL Type:</strong> <Badge bg={(media.urlType || 'external') === 'internal' ? 'info' : 'secondary'}>{(media.urlType || 'external').charAt(0).toUpperCase() + (media.urlType || 'external').slice(1)}</Badge>
                  </div>
                  {media.redirectUrl && (
                    <div className='mb-2'>
                      <strong>Redirect URL:</strong> <a href={media.redirectUrl} target='_blank' rel='noopener noreferrer'>{media.redirectUrl}</a>
                    </div>
                  )}
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}
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
