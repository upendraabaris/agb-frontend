import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Row, Col, Card, Button, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { SERVICE_URL } from 'config';
import DefaultAdForm from './DefaultAdForm';

// GraphQL Queries
const GET_ALL_DEFAULT_ADS = gql`
  query GetAllDefaultAds {
    getAllDefaultAds {
      id
      ad_type
      slot_position
      slot_name
      mobile_image_url
      desktop_image_url
      redirect_url
      title
      description
      is_active
      priority
      updatedAt
    }
  }
`;

const TOGGLE_STATUS = gql`
  mutation ToggleDefaultAdStatus($id: ID!) {
    toggleDefaultAdStatus(id: $id) {
      success
      message
      data {
        id
        is_active
      }
    }
  }
`;

const DELETE_DEFAULT_AD = gql`
  mutation DeleteDefaultAd($id: ID!) {
    deleteDefaultAd(id: $id) {
      success
      message
    }
  }
`;

// All possible slots
const ALL_SLOTS = [
  { ad_type: 'banner', slot_position: 1 },
  { ad_type: 'banner', slot_position: 2 },
  { ad_type: 'banner', slot_position: 3 },
  { ad_type: 'banner', slot_position: 4 },
  { ad_type: 'stamp', slot_position: 1 },
  { ad_type: 'stamp', slot_position: 2 },
  { ad_type: 'stamp', slot_position: 3 },
  { ad_type: 'stamp', slot_position: 4 },
];

function DefaultAdsList() {
  const title = 'Default Ads Management';
  const description = 'Manage default advertisement images for empty ad slots';

  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Query
  const { data, loading, refetch } = useQuery(GET_ALL_DEFAULT_ADS);

  // Mutations
  const [toggleStatus] = useMutation(TOGGLE_STATUS, {
    onCompleted: (response) => {
      if (response.toggleDefaultAdStatus.success) {
        toast.success(response.toggleDefaultAdStatus.message);
        refetch();
      } else {
        toast.error(response.toggleDefaultAdStatus.message);
      }
    },
    onError: (error) => toast.error(error.message)
  });

  const [deleteAd] = useMutation(DELETE_DEFAULT_AD, {
    onCompleted: (response) => {
      if (response.deleteDefaultAd.success) {
        toast.success(response.deleteDefaultAd.message);
        refetch();
      } else {
        toast.error(response.deleteDefaultAd.message);
      }
    },
    onError: (error) => toast.error(error.message)
  });

  // Get ad by slot
  const getAdBySlot = (adType, slotPosition) => {
    return data?.getAllDefaultAds?.find(
      ad => ad.ad_type === adType && ad.slot_position === slotPosition
    );
  };

  // Open modal for create
  const handleAddClick = (slot) => {
    setSelectedSlot(slot);
    setEditingAd(null);
    setShowModal(true);
  };

  // Open modal for edit
  const handleEditClick = (ad) => {
    setSelectedSlot({ ad_type: ad.ad_type, slot_position: ad.slot_position });
    setEditingAd(ad);
    setShowModal(true);
  };

  // Toggle active status
  const handleToggle = (id) => {
    toggleStatus({ variables: { id } });
  };

  // Delete ad
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this default ad?')) {
      deleteAd({ variables: { id } });
    }
  };

  // Close modal
  const handleModalClose = () => {
    setShowModal(false);
    setEditingAd(null);
    setSelectedSlot(null);
  };

  // On save success
  const handleSaveSuccess = () => {
    handleModalClose();
    refetch();
  };

  // Get image URL
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${SERVICE_URL}/${url}`;
  };

  // Render slot card
  const renderSlotCard = (slot) => {
    const ad = getAdBySlot(slot.ad_type, slot.slot_position);
    const slotName = `${slot.ad_type}_${slot.slot_position}`;
    const displayName = `${slot.ad_type.charAt(0).toUpperCase() + slot.ad_type.slice(1)} ${slot.slot_position}`;

    return (
      <Col md={3} key={slotName} className="mb-4">
        <Card className={`h-100 ${ad ? 'border-success' : 'border-dashed'}`}>
          <Card.Header className="d-flex justify-content-between align-items-center py-2">
            <span className="fw-bold">{displayName}</span>
            {ad && (
              <Badge bg={ad.is_active ? 'success' : 'secondary'}>
                {ad.is_active ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </Card.Header>
          
          <Card.Body className="p-2">
            {ad ? (
              <>
                {/* Image Preview */}
                <div className="position-relative mb-2" style={{ height: '120px', overflow: 'hidden' }}>
                  <img
                    src={getImageUrl(ad.desktop_image_url)}
                    alt={displayName}
                    className="w-100 h-100 rounded"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/img/placeholder.png'; }}
                  />
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Desktop Image</Tooltip>}
                  >
                    <Badge 
                      bg="dark" 
                      className="position-absolute" 
                      style={{ top: '5px', right: '5px', opacity: 0.8 }}
                    >
                      <CsLineIcons icon="desktop" size={12} />
                    </Badge>
                  </OverlayTrigger>
                </div>

                {/* Title */}
                {ad.title && (
                  <p className="small text-muted mb-2 text-truncate">{ad.title}</p>
                )}

                {/* Actions */}
                <div className="d-flex gap-1">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="flex-grow-1"
                    onClick={() => handleEditClick(ad)}
                  >
                    <CsLineIcons icon="edit" size={14} /> Edit
                  </Button>
                  <Button 
                    variant={ad.is_active ? 'outline-warning' : 'outline-success'} 
                    size="sm"
                    onClick={() => handleToggle(ad.id)}
                  >
                    <CsLineIcons icon={ad.is_active ? 'eye-off' : 'eye'} size={14} />
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <CsLineIcons icon="bin" size={14} />
                  </Button>
                </div>
              </>
            ) : (
              <div 
                className="d-flex flex-column align-items-center justify-content-center h-100 py-4"
                style={{ minHeight: '150px' }}
              >
                <CsLineIcons icon="image" size={40} className="text-muted mb-2" />
                <p className="text-muted small mb-3">No default ad set</p>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => handleAddClick(slot)}
                >
                  <CsLineIcons icon="plus" size={14} className="me-1" />
                  Add Default Ad
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const bannerSlots = ALL_SLOTS.filter(s => s.ad_type === 'banner');
  const stampSlots = ALL_SLOTS.filter(s => s.ad_type === 'stamp');

  return (
    <>
      <HtmlHead title={title} description={description} />
      
      {/* Title */}
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <h1 className="mb-0 pb-0 display-4">{title}</h1>
            <p className="text-muted mt-1">
              These ads will be displayed when no paid ads are running in a slot
            </p>
          </Col>
        </Row>
      </div>

      {/* Info Alert */}
      <Card className="mb-4 bg-light border-0">
        <Card.Body className="py-3">
          <div className="d-flex align-items-center">
            <CsLineIcons icon="info-hexagon" className="text-primary me-3" size={24} />
            <div>
              <strong>How it works:</strong> Default ads are shown when a slot has no active paid advertisement. 
              Set up default images for all 8 slots (4 banners + 4 stamps) to ensure no empty spaces on category pages.
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Banner Slots */}
      <h5 className="mb-3">
        <CsLineIcons icon="layout-5" className="me-2" />
        Banner Slots (Top of Category Page)
      </h5>
      <Row className="mb-4">
        {bannerSlots.map(renderSlotCard)}
      </Row>

      {/* Stamp Slots */}
      <h5 className="mb-3">
        <CsLineIcons icon="bookmark" className="me-2" />
        Stamp Slots (Sidebar)
      </h5>
      <Row className="mb-4">
        {stampSlots.map(renderSlotCard)}
      </Row>

      {/* Form Modal */}
      <DefaultAdForm
        show={showModal}
        onHide={handleModalClose}
        onSuccess={handleSaveSuccess}
        editingAd={editingAd}
        selectedSlot={selectedSlot}
      />
    </>
  );
}

export default DefaultAdsList;
