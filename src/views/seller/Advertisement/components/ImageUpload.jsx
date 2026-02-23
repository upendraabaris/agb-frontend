import React from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const ImageUpload = ({ selectedSlots = [], slotMedia = {}, onSlotMediaChange = () => {} }) => {
  const formatSlotName = (slot) => {
    if (!slot) return slot;
    const parts = slot.split('_');
    const type = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const num = parts[1];
    return `${type} #${num}`;
  };

  const handleImageChange = (e, slot, device) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      const field = device === 'mobile' ? 'mobileImage' : 'desktopImage';
      onSlotMediaChange(slot, field, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e, slot, field) => {
    onSlotMediaChange(slot, field, e.target.value);
  };

  return (
    <div>
      <p className='text-muted mb-4'>
        Upload advertisement images and redirect URLs for each selected slot.
      </p>

      {selectedSlots.map((slot) => {
        const media = slotMedia[slot] || {};
        return (
          <Card key={slot} className='mb-4'>
            <Card.Header className='bg-light'>
              <Card.Title className='mb-0'>{formatSlotName(slot)}</Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className='mb-3'>
                  <Form.Group>
                    <Form.Label className='fw-bold'>Mobile Image</Form.Label>
                    <div
                      className='border-2 border-dashed rounded p-4 text-center'
                      style={{ position: 'relative' }}
                    >
                      {media.mobileImage ? (
                        <img
                          src={media.mobileImage}
                          alt='mobile'
                          className='img-fluid'
                          style={{ maxHeight: '120px' }}
                        />
                      ) : (
                        <div>
                          <CsLineIcons icon='image' className='mb-2 display-4' />
                          <p className='text-muted mb-2'>Drag or click to upload</p>
                        </div>
                      )}
                      <Form.Control
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleImageChange(e, slot, 'mobile')}
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className='mt-2'>
                    <Form.Label className='fw-bold'>Mobile Redirect URL</Form.Label>
                    <Form.Control
                      type='text'
                      value={media.mobileRedirectUrl || ''}
                      onChange={(e) => handleUrlChange(e, slot, 'mobileRedirectUrl')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className='mb-3'>
                  <Form.Group>
                    <Form.Label className='fw-bold'>Desktop Image</Form.Label>
                    <div
                      className='border-2 border-dashed rounded p-4 text-center'
                      style={{ position: 'relative' }}
                    >
                      {media.desktopImage ? (
                        <img
                          src={media.desktopImage}
                          alt='desktop'
                          className='img-fluid'
                          style={{ maxHeight: '120px' }}
                        />
                      ) : (
                        <div>
                          <CsLineIcons icon='image' className='mb-2 display-4' />
                          <p className='text-muted mb-2'>Drag or click to upload</p>
                        </div>
                      )}
                      <Form.Control
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleImageChange(e, slot, 'desktop')}
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  </Form.Group>
                  <Form.Group className='mt-2'>
                    <Form.Label className='fw-bold'>Desktop Redirect URL</Form.Label>
                    <Form.Control
                      type='text'
                      value={media.desktopRedirectUrl || ''}
                      onChange={(e) => handleUrlChange(e, slot, 'desktopRedirectUrl')}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      })}

      {selectedSlots.length === 0 && (
        <div className='alert alert-warning'>Please select slots first.</div>
      )}
    </div>
  );
};

export default ImageUpload;
