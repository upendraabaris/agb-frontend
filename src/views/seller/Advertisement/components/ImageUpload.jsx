import React, { useState } from 'react';
import { Form, Row, Col, Card, InputGroup, ListGroup } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const ImageUpload = ({ selectedSlots = [], slotMedia = {}, onSlotMediaChange = () => {}, sellerProducts = [] }) => {
  const [productSearch, setProductSearch] = useState({});
  const [showDropdown, setShowDropdown] = useState({});

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

  const handleProductSelect = (slot, product) => {
    const productUrl = `/product/${product.identifier?.replace(/\s/g, '_').toLowerCase()}`;
    onSlotMediaChange(slot, 'redirectUrl', productUrl);
    onSlotMediaChange(slot, 'selectedProductName', product.previewName || product.fullName);
    setProductSearch((prev) => ({ ...prev, [slot]: '' }));
    setShowDropdown((prev) => ({ ...prev, [slot]: false }));
  };

  const getFilteredProducts = (slot) => {
    const search = productSearch[slot] || '';
    if (!search) return sellerProducts.slice(0, 10);
    return sellerProducts.filter(
      (p) =>
        (p.previewName || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.identifier || '').toLowerCase().includes(search.toLowerCase())
    ).slice(0, 10);
  };

  return (
    <div>
      <p className='text-muted mb-4'>
        Upload advertisement images and redirect URL for each selected slot.
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
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className='mt-2'>
                    <Form.Label className='fw-bold'>URL Type</Form.Label>
                    <div className='d-flex gap-4'>
                      <Form.Check
                        type='radio'
                        id={`urlType-external-${slot}`}
                        label='External URL'
                        name={`urlType-${slot}`}
                        checked={(media.urlType || 'external') === 'external'}
                        onChange={() => onSlotMediaChange(slot, 'urlType', 'external')}
                      />
                      <Form.Check
                        type='radio'
                        id={`urlType-internal-${slot}`}
                        label='Internal URL'
                        name={`urlType-${slot}`}
                        checked={media.urlType === 'internal'}
                        onChange={() => onSlotMediaChange(slot, 'urlType', 'internal')}
                      />
                    </div>
                    <Form.Text className='text-muted'>
                      External: Links outside this website | Internal: Links within this website
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className='mt-2'>
                    <Form.Label className='fw-bold'>Redirect URL</Form.Label>
                    {(media.urlType || 'external') === 'external' ? (
                      <>
                        <Form.Control
                          type='text'
                          placeholder='https://example.com'
                          value={media.redirectUrl || ''}
                          onChange={(e) => handleUrlChange(e, slot, 'redirectUrl')}
                        />
                        <Form.Text className='text-muted'>
                          Enter full URL (e.g., https://example.com)
                        </Form.Text>
                      </>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <InputGroup>
                          <InputGroup.Text>
                            <CsLineIcons icon='search' size={16} />
                          </InputGroup.Text>
                          <Form.Control
                            type='text'
                            placeholder='Search your products...'
                            value={productSearch[slot] || ''}
                            onChange={(e) => {
                              setProductSearch((prev) => ({ ...prev, [slot]: e.target.value }));
                              setShowDropdown((prev) => ({ ...prev, [slot]: true }));
                            }}
                            onFocus={() => setShowDropdown((prev) => ({ ...prev, [slot]: true }))}
                          />
                        </InputGroup>
                        {showDropdown[slot] && sellerProducts.length > 0 && (
                          <ListGroup
                            style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              zIndex: 1000,
                              maxHeight: '200px',
                              overflowY: 'auto',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            }}
                          >
                            {getFilteredProducts(slot).map((product) => (
                              <ListGroup.Item
                                key={product.id}
                                action
                                onClick={() => handleProductSelect(slot, product)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className='d-flex align-items-center'>
                                  {product.thumbnail && (
                                    <img
                                      src={product.thumbnail}
                                      alt=''
                                      style={{ width: '30px', height: '30px', objectFit: 'cover', marginRight: '10px' }}
                                    />
                                  )}
                                  <div>
                                    <div className='fw-bold'>{product.previewName || product.fullName}</div>
                                    <small className='text-muted'>{product.identifier}</small>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                            {getFilteredProducts(slot).length === 0 && (
                              <ListGroup.Item className='text-muted'>No products found</ListGroup.Item>
                            )}
                          </ListGroup>
                        )}
                        {media.redirectUrl && (
                          <div className='mt-2 p-2 bg-light rounded'>
                            <small className='text-muted'>Selected:</small>
                            <div className='fw-bold text-primary'>{media.selectedProductName || media.redirectUrl}</div>
                          </div>
                        )}
                        <Form.Text className='text-muted'>
                          Search and select your product
                        </Form.Text>
                      </div>
                    )}
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
