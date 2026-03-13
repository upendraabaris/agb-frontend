import React, { useEffect, useState, useCallback } from 'react';
import { useLazyQuery, useMutation, gql } from '@apollo/client';
import { useParams, NavLink} from 'react-router-dom';
import { toast } from 'react-toastify';
import { Row, Col, Card, Button, Form, Badge, Spinner } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

// ─── GraphQL ────────────────────────────────────────────────────────────────

const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    getCategory(id: $id) {
      id
      name
    }
  }
`;

const GET_CATEGORY_DEFAULT_ADS = gql`
  query GetCategoryDefaultAds($category_id: ID!) {
    getCategoryDefaultAds(category_id: $category_id) {
      id
      category_id
      ad_type
      slot_position
      slot_name
      mobile_image_url
      desktop_image_url
      redirect_url
      title
      is_active
    }
  }
`;

const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!, $folder: String) {
    uploadFile(file: $file, folder: $folder) {
      success
      url
      message
    }
  }
`;

const UPSERT_CATEGORY_DEFAULT_AD = gql`
  mutation UpsertCategoryDefaultAd($category_id: ID!, $input: CategoryDefaultAdInput!) {
    upsertCategoryDefaultAd(category_id: $category_id, input: $input) {
      success
      message
      data {
        id
        ad_type
        slot_position
        mobile_image_url
        desktop_image_url
        redirect_url
        title
        is_active
      }
    }
  }
`;

const DELETE_CATEGORY_DEFAULT_AD = gql`
  mutation DeleteCategoryDefaultAd($id: ID!) {
    deleteCategoryDefaultAd(id: $id) {
      success
      message
    }
  }
`;

const TOGGLE_CATEGORY_DEFAULT_AD = gql`
  mutation ToggleCategoryDefaultAdStatus($id: ID!) {
    toggleCategoryDefaultAdStatus(id: $id) {
      success
      message
      data {
        id
        is_active
      }
    }
  }
`;

// ─── Constants ───────────────────────────────────────────────────────────────

const AD_TYPES = ['banner', 'stamp'];
const SLOT_POSITIONS = [1, 2, 3, 4];

// Build empty slot state for all 8 slots
const buildEmptySlots = () => {
  const slots = {};
  AD_TYPES.forEach((type) => {
    SLOT_POSITIONS.forEach((pos) => {
      const key = `${type}_${pos}`;
      slots[key] = {
        id: null,
        ad_type: type,
        slot_position: pos,
        mobile_image_url: '',
        desktop_image_url: '',
        redirect_url: '',
        title: '',
        is_active: true,
        // local file selections
        mobileFile: null,
        desktopFile: null,
        saving: false,
      };
    });
  });
  return slots;
};

// ─── Component ───────────────────────────────────────────────────────────────

const CategoryDefaultAds = () => {
  const { categoryId } = useParams();
  const [categoryName, setCategoryName] = useState('');
  const [slots, setSlots] = useState(buildEmptySlots);

  // ── Queries / Mutations ──
  const [fetchCategory] = useLazyQuery(GET_CATEGORY, {
    onCompleted(res) {
      if (res?.getCategory?.name) setCategoryName(res.getCategory.name);
    },
  });

  const [fetchAds, { loading: loadingAds }] = useLazyQuery(GET_CATEGORY_DEFAULT_ADS, {
    fetchPolicy: 'network-only',
    onCompleted(res) {
      const ads = res?.getCategoryDefaultAds || [];
      setSlots((prev) => {
        const updated = { ...prev };
        ads.forEach((ad) => {
          const key = `${ad.ad_type}_${ad.slot_position}`;
          updated[key] = {
            ...updated[key],
            id: ad.id,
            mobile_image_url: ad.mobile_image_url || '',
            desktop_image_url: ad.desktop_image_url || '',
            redirect_url: ad.redirect_url || '',
            title: ad.title || '',
            is_active: ad.is_active,
          };
        });
        return updated;
      });
    },
    onError(err) {
      console.error('[getCategoryDefaultAds]', err);
    },
  });

  const [uploadFile] = useMutation(UPLOAD_FILE);
  const [upsertAd] = useMutation(UPSERT_CATEGORY_DEFAULT_AD);
  const [deleteAd] = useMutation(DELETE_CATEGORY_DEFAULT_AD);
  const [toggleAd] = useMutation(TOGGLE_CATEGORY_DEFAULT_AD);

  // ── Init ──
  useEffect(() => {
    if (categoryId) {
      fetchCategory({ variables: { id: categoryId } });
      fetchAds({ variables: { category_id: categoryId } });
    }
  }, [categoryId, fetchCategory, fetchAds]);

  // ── Helpers ──
  const updateSlot = useCallback((key, field, value) => {
    setSlots((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }, []);

  const refreshAds = useCallback(() => {
    fetchAds({ variables: { category_id: categoryId } });
  }, [categoryId, fetchAds]);

  // ── Save slot ──
  const handleSave = async (slotKey) => {
    const slot = slots[slotKey];
    updateSlot(slotKey, 'saving', true);
    try {
      let mobileUrl = slot.mobile_image_url;
      let desktopUrl = slot.desktop_image_url;

      // Upload mobile image if a new file was selected
      if (slot.mobileFile) {
        const res = await uploadFile({ variables: { file: slot.mobileFile, folder: 'category-default-ads' } });
        if (!res.data?.uploadFile?.success) throw new Error(res.data?.uploadFile?.message || 'Mobile image upload failed');
        mobileUrl = res.data.uploadFile.url;
      }
      // Upload desktop image if a new file was selected
      if (slot.desktopFile) {
        const res = await uploadFile({ variables: { file: slot.desktopFile, folder: 'category-default-ads' } });
        if (!res.data?.uploadFile?.success) throw new Error(res.data?.uploadFile?.message || 'Desktop image upload failed');
        desktopUrl = res.data.uploadFile.url;
      }

      if (!mobileUrl || !desktopUrl) {
        toast.error('Both mobile and desktop images are required.');
        return;
      }

      const result = await upsertAd({
        variables: {
          category_id: categoryId,
          input: {
            ad_type: slot.ad_type,
            slot_position: slot.slot_position,
            mobile_image_url: mobileUrl,
            desktop_image_url: desktopUrl,
            redirect_url: slot.redirect_url || null,
            title: slot.title || '',
            is_active: slot.is_active,
          },
        },
      });

      if (result.data?.upsertCategoryDefaultAd?.success) {
        toast.success(`${slot.ad_type} slot ${slot.slot_position} saved!`);
        refreshAds();
      } else {
        toast.error(result.data?.upsertCategoryDefaultAd?.message || 'Save failed');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      updateSlot(slotKey, 'saving', false);
    }
  };

  // ── Delete slot ──
  const handleDelete = async (slotKey) => {
    const slot = slots[slotKey];
    if (!slot.id) return;
    if (!window.confirm(`Delete ${slot.ad_type} slot ${slot.slot_position} default ad?`)) return;
    try {
      const result = await deleteAd({ variables: { id: slot.id } });
      if (result.data?.deleteCategoryDefaultAd?.success) {
        toast.success('Deleted successfully');
        refreshAds();
      } else {
        toast.error(result.data?.deleteCategoryDefaultAd?.message || 'Delete failed');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  // ── Toggle active ──
  const handleToggle = async (slotKey) => {
    const slot = slots[slotKey];
    if (!slot.id) return;
    try {
      const result = await toggleAd({ variables: { id: slot.id } });
      if (result.data?.toggleCategoryDefaultAdStatus?.success) {
        refreshAds();
      } else {
        toast.error('Toggle failed');
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  // ── Render a single slot card ──
  const renderSlotCard = (adType, pos) => {
    const key = `${adType}_${pos}`;
    const slot = slots[key];
    const isSet = Boolean(slot.id);
    const typeLabel = adType === 'banner' ? 'Banner' : 'Stamp';
    const typeColor = adType === 'banner' ? 'primary' : 'warning';

    return (
      <Col key={key} xs="12" md="6" xl="3" className="mb-4">
        <Card className="h-100 shadow-sm">
          <Card.Header className="d-flex align-items-center justify-content-between py-2">
            <span className="fw-bold">
              <Badge bg={typeColor} className="me-2">{typeLabel}</Badge>
              Slot {pos}
            </span>
            <div className="d-flex gap-1 align-items-center">
              {isSet && (
                <>
                  <Badge bg={slot.is_active ? 'success' : 'secondary'} style={{ cursor: 'pointer' }} onClick={() => handleToggle(key)}>
                    {slot.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button variant="outline-danger" size="sm" className="btn-icon btn-icon-only" onClick={() => handleDelete(key)}>
                    <CsLineIcons icon="bin" size="14" />
                  </Button>
                </>
              )}
              {!isSet && <Badge bg="light" text="dark">Not set</Badge>}
            </div>
          </Card.Header>
          <Card.Body className="d-flex flex-column gap-2">
            {/* Mobile image preview */}
            <div>
              <Form.Label className="text-small fw-bold mb-1">Mobile Image</Form.Label>
              {slot.mobile_image_url && !slot.mobileFile && (
                <div className="mb-1">
                  <img src={slot.mobile_image_url} alt="mobile" className="w-100 rounded border" style={{ maxHeight: '80px', objectFit: 'cover' }} />
                </div>
              )}
              {slot.mobileFile && (
                <div className="mb-1 text-success text-small">
                  <CsLineIcons icon="check" size="14" /> {slot.mobileFile.name}
                </div>
              )}
              <Form.Control
                type="file"
                accept="image/*"
                size="sm"
                onChange={(e) => updateSlot(key, 'mobileFile', e.target.files[0] || null)}
              />
            </div>

            {/* Desktop image preview */}
            <div>
              <Form.Label className="text-small fw-bold mb-1">Desktop Image</Form.Label>
              {slot.desktop_image_url && !slot.desktopFile && (
                <div className="mb-1">
                  <img src={slot.desktop_image_url} alt="desktop" className="w-100 rounded border" style={{ maxHeight: '80px', objectFit: 'cover' }} />
                </div>
              )}
              {slot.desktopFile && (
                <div className="mb-1 text-success text-small">
                  <CsLineIcons icon="check" size="14" /> {slot.desktopFile.name}
                </div>
              )}
              <Form.Control
                type="file"
                accept="image/*"
                size="sm"
                onChange={(e) => updateSlot(key, 'desktopFile', e.target.files[0] || null)}
              />
            </div>

            {/* Title */}
            <div>
              <Form.Label className="text-small fw-bold mb-1">Title (optional)</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder="Ad title"
                value={slot.title}
                onChange={(e) => updateSlot(key, 'title', e.target.value)}
              />
            </div>

            {/* Redirect URL */}
            <div>
              <Form.Label className="text-small fw-bold mb-1">Redirect URL (optional)</Form.Label>
              <Form.Control
                type="url"
                size="sm"
                placeholder="https://..."
                value={slot.redirect_url}
                onChange={(e) => updateSlot(key, 'redirect_url', e.target.value)}
              />
            </div>

            {/* Active toggle for new slot */}
            {!isSet && (
              <Form.Check
                type="switch"
                id={`active-${key}`}
                label="Active on save"
                checked={slot.is_active}
                onChange={(e) => updateSlot(key, 'is_active', e.target.checked)}
              />
            )}

            {/* Save button */}
            <div className="mt-auto pt-2">
              <Button
                variant="primary"
                size="sm"
                className="w-100"
                disabled={slot.saving}
                onClick={() => handleSave(key)}
              >
                {slot.saving ? <Spinner animation="border" size="sm" /> : (
                  <>{isSet ? 'Update' : 'Save'} {typeLabel} {pos}</>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <>
      <HtmlHead title={`Category Default Ads — ${categoryName}`} description="Set per-category fallback ads" />

      <div className="page-title-container mb-4">
        <Row className="g-0 align-items-center">
          <Col className="col-auto me-auto">
            <NavLink className="muted-link pb-1 d-inline-block breadcrumb-back" to="/admin/advertisment/category_advertisment">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Category List</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4">
              Category Default Ads
            </h1>
            {categoryName && (
              <p className="text-muted mb-0">
                <span className="fw-bold text-primary">{categoryName}</span>
                {' '}— fallback ads shown when no paid ad is booked for a slot
              </p>
            )}
          </Col>
        </Row>
      </div>

      {/* Fallback chain info */}
      <div className="border rounded p-3 mb-4 bg-light text-small">
        <strong>Fallback chain:</strong>&nbsp;
        <Badge bg="success" className="me-1">1. Paid Ads</Badge>
        <span className="text-muted me-1">→</span>
        <Badge bg="primary" className="me-1">2. Category Default Ads (this page)</Badge>
        <span className="text-muted me-1">→</span>
        <Badge bg="secondary">3. Global Default Ads</Badge>
      </div>

      {loadingAds ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {/* Banner Slots */}
          <div className="border fw-bold p-2 mb-3 rounded bg-primary text-white">
            Banner Slots (4 banners)
          </div>
          <Row>
            {SLOT_POSITIONS.map((pos) => renderSlotCard('banner', pos))}
          </Row>

          {/* Stamp Slots */}
          <div className="border fw-bold p-2 mb-3 rounded bg-warning text-dark mt-2">
            Stamp Slots (4 stamps)
          </div>
          <Row>
            {SLOT_POSITIONS.map((pos) => renderSlotCard('stamp', pos))}
          </Row>
        </>
      )}
    </>
  );
};

export default CategoryDefaultAds;
