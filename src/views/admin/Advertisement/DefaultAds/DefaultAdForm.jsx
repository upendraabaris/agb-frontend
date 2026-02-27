import React, { useState, useEffect } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Modal, Form, Button, Row, Col, Spinner, Image } from 'react-bootstrap';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { SERVICE_URL } from 'config';

// GraphQL Mutations
const CREATE_DEFAULT_AD = gql`
  mutation CreateDefaultAd($input: DefaultAdInput!) {
    createDefaultAd(input: $input) {
      success
      message
      data {
        id
        ad_type
        slot_position
      }
    }
  }
`;

const UPDATE_DEFAULT_AD = gql`
  mutation UpdateDefaultAd($id: ID!, $input: UpdateDefaultAdInput!) {
    updateDefaultAd(id: $id, input: $input) {
      success
      message
      data {
        id
      }
    }
  }
`;

// File upload mutation (uses existing uploadFile mutation)
const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!, $folder: String) {
    uploadFile(file: $file, folder: $folder) {
      success
      url
      message
    }
  }
`;

function DefaultAdForm({ show, onHide, onSuccess, editingAd, selectedSlot }) {
  // Form state
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [desktopImageUrl, setDesktopImageUrl] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(1);

  // File upload state
  const [mobileFile, setMobileFile] = useState(null);
  const [desktopFile, setDesktopFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Mutations
  const [createDefaultAd, { loading: creating }] = useMutation(CREATE_DEFAULT_AD);
  const [updateDefaultAd, { loading: updating }] = useMutation(UPDATE_DEFAULT_AD);
  const [uploadFile] = useMutation(UPLOAD_FILE);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      if (editingAd) {
        setMobileImageUrl(editingAd.mobile_image_url || '');
        setDesktopImageUrl(editingAd.desktop_image_url || '');
        setRedirectUrl(editingAd.redirect_url || '');
        setTitle(editingAd.title || '');
        setDescription(editingAd.description || '');
        setIsActive(editingAd.is_active ?? true);
        setPriority(editingAd.priority || 1);
      } else {
        setMobileImageUrl('');
        setDesktopImageUrl('');
        setRedirectUrl('');
        setTitle('');
        setDescription('');
        setIsActive(true);
        setPriority(1);
      }
      setMobileFile(null);
      setDesktopFile(null);
    }
  }, [show, editingAd]);

  // Handle file selection
  const handleMobileFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMobileFile(file);
      // Create preview URL
      setMobileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDesktopFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDesktopFile(file);
      // Create preview URL
      setDesktopImageUrl(URL.createObjectURL(file));
    }
  };

  // Upload a single file
  const uploadSingleFile = async (file) => {
    try {
      const response = await uploadFile({
        variables: {
          file,
          folder: 'default-ads'
        }
      });
      
      if (response.data.uploadFile.success) {
        return response.data.uploadFile.url;
      }
      throw new Error(response.data.uploadFile.message || 'Upload failed');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!editingAd && !mobileFile) {
      toast.error('Please select a mobile image');
      return;
    }
    if (!editingAd && !desktopFile) {
      toast.error('Please select a desktop image');
      return;
    }

    try {
      setUploading(true);

      let finalMobileUrl = mobileImageUrl;
      let finalDesktopUrl = desktopImageUrl;

      // Upload new files if selected
      if (mobileFile) {
        finalMobileUrl = await uploadSingleFile(mobileFile);
      }
      if (desktopFile) {
        finalDesktopUrl = await uploadSingleFile(desktopFile);
      }

      if (editingAd) {
        // Update existing
        const response = await updateDefaultAd({
          variables: {
            id: editingAd.id,
            input: {
              mobile_image_url: finalMobileUrl,
              desktop_image_url: finalDesktopUrl,
              redirect_url: redirectUrl || null,
              title: title || null,
              description: description || null,
              is_active: isActive,
              priority: parseInt(priority, 10)
            }
          }
        });

        if (response.data.updateDefaultAd.success) {
          toast.success('Default ad updated successfully!');
          onSuccess();
        } else {
          toast.error(response.data.updateDefaultAd.message);
        }
      } else {
        // Create new
        const response = await createDefaultAd({
          variables: {
            input: {
              ad_type: selectedSlot.ad_type,
              slot_position: selectedSlot.slot_position,
              mobile_image_url: finalMobileUrl,
              desktop_image_url: finalDesktopUrl,
              redirect_url: redirectUrl || null,
              title: title || null,
              description: description || null,
              is_active: isActive,
              priority: parseInt(priority, 10)
            }
          }
        });

        if (response.data.createDefaultAd.success) {
          toast.success('Default ad created successfully!');
          onSuccess();
        } else {
          toast.error(response.data.createDefaultAd.message);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save default ad');
    } finally {
      setUploading(false);
    }
  };

  // Get image URL for display
  const getDisplayUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('blob:')) return url; // Local preview
    if (url.startsWith('http')) return url;
    return `${SERVICE_URL}/${url}`;
  };

  const isLoading = creating || updating || uploading;
  const slotName = selectedSlot 
    ? `${selectedSlot.ad_type.charAt(0).toUpperCase() + selectedSlot.ad_type.slice(1)} ${selectedSlot.slot_position}`
    : '';

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {editingAd ? 'Edit' : 'Add'} Default Ad - {slotName}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            {/* Mobile Image */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <CsLineIcons icon="phone" className="me-1" size={16} />
                  Mobile Image *
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleMobileFileChange}
                />
                {getDisplayUrl(mobileImageUrl) && (
                  <div className="mt-2 position-relative">
                    <Image
                      src={getDisplayUrl(mobileImageUrl)}
                      alt="Mobile preview"
                      className="w-100 rounded border"
                      style={{ maxHeight: '150px', objectFit: 'cover' }}
                    />
                    <small className="text-muted d-block mt-1">
                      Recommended: 375x200 px
                    </small>
                  </div>
                )}
              </Form.Group>
            </Col>

            {/* Desktop Image */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <CsLineIcons icon="desktop" className="me-1" size={16} />
                  Desktop Image *
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleDesktopFileChange}
                />
                {getDisplayUrl(desktopImageUrl) && (
                  <div className="mt-2 position-relative">
                    <Image
                      src={getDisplayUrl(desktopImageUrl)}
                      alt="Desktop preview"
                      className="w-100 rounded border"
                      style={{ maxHeight: '150px', objectFit: 'cover' }}
                    />
                    <small className="text-muted d-block mt-1">
                      Recommended: 1200x300 px (Banner) / 300x400 px (Stamp)
                    </small>
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Title (Optional)</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., AGB Special Offer"
            />
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this ad"
            />
          </Form.Group>

          {/* Redirect URL */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Redirect URL (Optional)</Form.Label>
            <Form.Control
              type="url"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="https://example.com/page or /internal/page"
            />
            <Form.Text className="text-muted">
              Where users will go when they click on this ad
            </Form.Text>
          </Form.Group>

          <Row>
            {/* Priority */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Priority</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="10"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Higher priority ads shown first (if multiple defaults for same slot)
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Active Status */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Status</Form.Label>
                <Form.Check
                  type="switch"
                  id="is-active-switch"
                  label={isActive ? 'Active' : 'Inactive'}
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mt-2"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {uploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <CsLineIcons icon="save" className="me-1" size={16} />
                {editingAd ? 'Update' : 'Create'} Default Ad
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default DefaultAdForm;
