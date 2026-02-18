import React, { useState } from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const ImageUpload = ({
  selectedSlots = [],
  onBannerMobileImageChange,
  onBannerDesktopImageChange,
  onStampMobileImageChange,
  onStampDesktopImageChange,
  mobileRedirectUrl,
  desktopRedirectUrl,
  onMobileRedirectUrlChange,
  onDesktopRedirectUrlChange,
}) => {
  const [bannerMobilePreview, setBannerMobilePreview] = useState(null);
  const [bannerDesktopPreview, setBannerDesktopPreview] = useState(null);
  const [stampMobilePreview, setStampMobilePreview] = useState(null);
  const [stampDesktopPreview, setStampDesktopPreview] = useState(null);

  // Simplified: no client-side size/dimension validations here

  // Helper to apply image to previews and parent handlers
  function applyImage(dataUrl, type, device) {
    if (type === 'banner' && device === 'mobile') {
      if (onBannerMobileImageChange) onBannerMobileImageChange(dataUrl);
      setBannerMobilePreview(dataUrl);
      return;
    }
    if (type === 'banner' && device === 'desktop') {
      if (onBannerDesktopImageChange) onBannerDesktopImageChange(dataUrl);
      setBannerDesktopPreview(dataUrl);
      return;
    }
    if (type === 'stamp' && device === 'mobile') {
      if (onStampMobileImageChange) onStampMobileImageChange(dataUrl);
      setStampMobilePreview(dataUrl);
      return;
    }
    if (type === 'stamp' && device === 'desktop') {
      if (onStampDesktopImageChange) onStampDesktopImageChange(dataUrl);
      setStampDesktopPreview(dataUrl);
    }
  }

  // type: 'banner' | 'stamp', device: 'mobile' | 'desktop'
  const handleImageChange = (e, type, device) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      applyImage(dataUrl, type, device);
    };
    reader.readAsDataURL(file);
  };

  const hasBanner = selectedSlots.some(s => s && s.startsWith('banner'));
  const hasStamp = selectedSlots.some(s => s && s.startsWith('stamp'));

  return (
    <div>
      <p className='text-muted mb-4'>
        Upload advertisement images per selected slot type.
      </p>

      <Row>
        {hasBanner && (
          <>
            <Col md={6} className='mb-4'>
              <Card className='h-100'>
                <Card.Header className='bg-light'>
                  <Card.Title className='mb-0'>
                    <CsLineIcons icon='mobile' className='me-2' />
                    Banner - Mobile Image
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold'>Mobile Banner Image *</Form.Label>
                    <div className='border-2 border-dashed rounded p-4 text-center' style={{ position: 'relative' }}>
                      {bannerMobilePreview ? (
                        <div>
                          <img src={bannerMobilePreview} alt='Banner mobile' className='img-fluid' style={{ maxHeight: '150px' }} />
                          <div className='mt-2'><small className='text-success fw-bold'>✓ Image uploaded</small></div>
                        </div>
                      ) : (
                        <div>
                          <CsLineIcons icon='image' className='mb-2 display-4' />
                          <p className='text-muted mb-2'>Drag or click to upload</p>
                          <small className='text-muted'>Recommended: 300x250px, Max: 2MB</small>
                        </div>
                      )}
                      <Form.Control
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleImageChange(e, 'banner', 'mobile')}
                        id='banner-mobile-input'
                        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <div className='mt-3'>
                        <label htmlFor='banner-mobile-input' className='btn btn-sm btn-outline-primary cursor-pointer'>
                          <CsLineIcons icon='upload' className='me-2' />Choose Image
                        </label>
                      </div>
                    </div>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className='mb-4'>
              <Card className='h-100'>
                <Card.Header className='bg-light'>
                  <Card.Title className='mb-0'>
                    <CsLineIcons icon='monitor' className='me-2' />
                    Banner - Desktop Image
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold'>Desktop Banner Image *</Form.Label>
                      <div className='border-2 border-dashed rounded p-4 text-center' style={{ position: 'relative' }}>
                      {bannerDesktopPreview ? (
                        <div>
                          <img src={bannerDesktopPreview} alt='Banner desktop' className='img-fluid' style={{ maxHeight: '150px' }} />
                          <div className='mt-2'><small className='text-success fw-bold'>✓ Image uploaded</small></div>
                        </div>
                      ) : (
                        <div>
                          <CsLineIcons icon='image' className='mb-2 display-4' />
                          <p className='text-muted mb-2'>Drag or click to upload</p>
                          <small className='text-muted'>Recommended: 728x90px, Max: 2MB</small>
                        </div>
                      )}
                      <Form.Control
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleImageChange(e, 'banner', 'desktop')}
                        id='banner-desktop-input'
                        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <div className='mt-3'>
                        <label htmlFor='banner-desktop-input' className='btn btn-sm btn-outline-primary cursor-pointer'>
                          <CsLineIcons icon='upload' className='me-2' />Choose Image
                        </label>
                      </div>
                    </div>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}

        {hasStamp && (
          <>
            <Col md={6} className='mb-4'>
              <Card className='h-100'>
                <Card.Header className='bg-light'>
                  <Card.Title className='mb-0'>
                    <CsLineIcons icon='mobile' className='me-2' />
                    Stamp - Mobile Image
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold'>Mobile Stamp Image *</Form.Label>
                      <div className='border-2 border-dashed rounded p-4 text-center' style={{ position: 'relative' }}>
                      {stampMobilePreview ? (
                        <div>
                          <img src={stampMobilePreview} alt='Stamp mobile' className='img-fluid' style={{ maxHeight: '150px' }} />
                          <div className='mt-2'><small className='text-success fw-bold'>✓ Image uploaded</small></div>
                        </div>
                      ) : (
                        <div>
                          <CsLineIcons icon='image' className='mb-2 display-4' />
                          <p className='text-muted mb-2'>Drag or click to upload</p>
                          <small className='text-muted'>Recommended: 150x150px, Max: 2MB</small>
                        </div>
                      )}
                      <Form.Control
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleImageChange(e, 'stamp', 'mobile')}
                        id='stamp-mobile-input'
                        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <div className='mt-3'>
                        <label htmlFor='stamp-mobile-input' className='btn btn-sm btn-outline-primary cursor-pointer'>
                          <CsLineIcons icon='upload' className='me-2' />Choose Image
                        </label>
                      </div>
                    </div>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className='mb-4'>
              <Card className='h-100'>
                <Card.Header className='bg-light'>
                  <Card.Title className='mb-0'>
                    <CsLineIcons icon='monitor' className='me-2' />
                    Stamp - Desktop Image
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <Form.Group className='mb-3'>
                    <Form.Label className='fw-bold'>Desktop Stamp Image *</Form.Label>
                      <div className='border-2 border-dashed rounded p-4 text-center' style={{ position: 'relative' }}>
                      {stampDesktopPreview ? (
                        <div>
                          <img src={stampDesktopPreview} alt='Stamp desktop' className='img-fluid' style={{ maxHeight: '150px' }} />
                          <div className='mt-2'><small className='text-success fw-bold'>✓ Image uploaded</small></div>
                        </div>
                      ) : (
                        <div>
                          <CsLineIcons icon='image' className='mb-2 display-4' />
                          <p className='text-muted mb-2'>Drag or click to upload</p>
                          <small className='text-muted'>Recommended: 150x150px, Max: 2MB</small>
                        </div>
                      )}
                      <Form.Control
                        type='file'
                        accept='image/*'
                        onChange={(e) => handleImageChange(e, 'stamp', 'desktop')}
                        id='stamp-desktop-input'
                        style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      <div className='mt-3'>
                        <label htmlFor='stamp-desktop-input' className='btn btn-sm btn-outline-primary cursor-pointer'>
                          <CsLineIcons icon='upload' className='me-2' />Choose Image
                        </label>
                      </div>
                    </div>
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>

      {/* Redirect URL inputs (global for mobile/desktop) */}
      {(onMobileRedirectUrlChange || onDesktopRedirectUrlChange) && (
        <Card className='mb-4'>
          <Card.Body>
            <h6 className='mb-3'>Redirect URLs (optional)</h6>
            <Row>
              <Col md={6} className='mb-2'>
                <Form.Group>
                  <Form.Label className='fw-bold'>Mobile Redirect URL</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='https://example.com/mobile'
                    value={mobileRedirectUrl || ''}
                    onChange={(e) => onMobileRedirectUrlChange && onMobileRedirectUrlChange(e.target.value)}
                  />
                  <small className='text-muted'>Where the mobile image should redirect (optional)</small>
                </Form.Group>
              </Col>

              <Col md={6} className='mb-2'>
                <Form.Group>
                  <Form.Label className='fw-bold'>Desktop Redirect URL</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='https://example.com/desktop'
                    value={desktopRedirectUrl || ''}
                    onChange={(e) => onDesktopRedirectUrlChange && onDesktopRedirectUrlChange(e.target.value)}
                  />
                  <small className='text-muted'>Where the desktop image should redirect (optional)</small>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Info Alert */}
      {(hasBanner || hasStamp) && (
        <div className='alert alert-info mt-2'>
          <CsLineIcons icon='info' className='me-2' /> Upload completed for selected types will show a check.
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
