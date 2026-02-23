import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Button, Row, Col, Alert, Spinner, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ImageUpload from './components/ImageUpload';

// ─── GraphQL ────────────────────────────────────────────────────────────────

const GET_PRODUCTS_WITH_SLOTS = gql`
  query GetProductsWithAvailableAdSlots {
    getProductsWithAvailableAdSlots {
      id
      productName
      brandName
      thumbnail
      availableSlots
      bookedSlots
      bookedBanner
      bookedStamp
      slotStatuses {
        slot
        available
      }
    }
  }
`;

const CREATE_PRODUCT_AD_REQUEST = gql`
  mutation CreateProductAdRequest($input: CreateProductAdRequestInput!) {
    createProductAdRequest(input: $input) {
      id
      product_id
      tier_id
      status
      createdAt
    }
  }
`;

// ─── Helpers ────────────────────────────────────────────────────────────────

const getSlotDisplayName = (slot) => {
    const parts = slot.split('_');
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} #${parts[1]}`;
};

const DURATION_OPTIONS = [
    { value: 30, label: '30 Days' },
    { value: 90, label: '90 Days' },
    { value: 180, label: '180 Days' },
    { value: 365, label: '365 Days' },
];

const getSlotVariant = (isBooked, isSelected) => {
    if (isBooked) return 'secondary';
    if (isSelected) return 'primary';
    return 'outline-primary';
};

// ─── Component ──────────────────────────────────────────────────────────────

const ProductAdvertisement = () => {
    const title = 'Advertise a Product';
    const description = 'Run a targeted ad on a specific product listing';
    const history = useHistory();

    // Step state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [bannerMobileImage, setBannerMobileImage] = useState(null);
    const [bannerDesktopImage, setBannerDesktopImage] = useState(null);
    const [stampMobileImage, setStampMobileImage] = useState(null);
    const [stampDesktopImage, setStampDesktopImage] = useState(null);
    const [mobileRedirectUrl, setMobileRedirectUrl] = useState('');
    const [desktopRedirectUrl, setDesktopRedirectUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Queries
    const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_PRODUCTS_WITH_SLOTS, {
        fetchPolicy: 'network-only',
    });

    const [createProductAdRequest, { loading: submitLoading }] = useMutation(CREATE_PRODUCT_AD_REQUEST, {
        onCompleted: () => {
            toast.success('Product advertisement submitted! Awaiting admin approval.');
            history.push('/seller/advertisement/product-list');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to submit product advertisement');
        },
    });

    // Derived
    const products = (productsData?.getProductsWithAvailableAdSlots || []).filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.productName?.toLowerCase().includes(q) ||
            p.brandName?.toLowerCase().includes(q)
        );
    });

    const bannerSlots = ['banner_1', 'banner_2', 'banner_3', 'banner_4'];
    const stampSlots = ['stamp_1', 'stamp_2', 'stamp_3', 'stamp_4'];

    // Handlers
    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setSelectedSlots([]);
    };

    const handleSlotToggle = (slotName) => {
        if (!selectedProduct) return;
        const slotInfo = selectedProduct.slotStatuses?.find((s) => s.slot === slotName);
        if (!slotInfo?.available) {
            toast.error('This slot is already booked');
            return;
        }
        setSelectedSlots((prev) =>
            prev.includes(slotName) ? prev.filter((s) => s !== slotName) : [...prev, slotName]
        );
    };

    const isReady = () => {
        if (!selectedProduct || selectedSlots.length === 0) return false;
        const needsBanner = selectedSlots.some((s) => s.startsWith('banner'));
        const needsStamp = selectedSlots.some((s) => s.startsWith('stamp'));
        if (needsBanner && !bannerMobileImage && !bannerDesktopImage) return false;
        if (needsStamp && !stampMobileImage && !stampDesktopImage) return false;
        return true;
    };

    const handleReset = () => {
        setSelectedProduct(null);
        setSelectedSlots([]);
        setSelectedDuration(30);
        setBannerMobileImage(null);
        setBannerDesktopImage(null);
        setStampMobileImage(null);
        setStampDesktopImage(null);
        setMobileRedirectUrl('');
        setDesktopRedirectUrl('');
        setSearchQuery('');
    };

    const handleSubmit = async () => {
        if (!isReady()) {
            toast.error('Please complete all steps before submitting');
            return;
        }

        const medias = selectedSlots.map((slot) => {
            const type = slot.split('_')[0];
            return {
                slot,
                media_type: 'both',
                mobile_image_url: type === 'banner' ? bannerMobileImage : stampMobileImage,
                desktop_image_url: type === 'banner' ? bannerDesktopImage : stampDesktopImage,
                mobile_redirect_url: mobileRedirectUrl || '',
                desktop_redirect_url: desktopRedirectUrl || '',
            };
        });

        await createProductAdRequest({
            variables: {
                input: {
                    product_id: selectedProduct.id,
                    duration_days: selectedDuration,
                    medias,
                },
            },
        });
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <>
            <HtmlHead title={title} description={description} />
            <div className="container-xl">
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/advertisement/product-list">
                            <CsLineIcons icon="chevron-left" size="13" />
                            <span className="align-middle text-small ms-1">My Product Ads</span>
                        </NavLink>
                        <h1 className="mb-0 pb-0 display-4">{title}</h1>
                        <div className="text-muted fs-base">{description}</div>
                    </Col>
                </Row>

                {/* ── Step 1: Product Selection ──────────────────────────────────── */}
                <Card className="mb-4">
                    <Card.Header>
                        <Card.Title className="mb-0">
                            <span className="badge badge-primary me-2">1</span>
                            Select a Product to Advertise
                        </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        {productsLoading && (
                            <div className="text-center py-4">
                                <Spinner animation="border" role="status" className="me-2" />
                                <span className="text-muted">Loading products…</span>
                            </div>
                        )}
                        {productsError && (
                            <Alert variant="danger">Failed to load products: {productsError.message}</Alert>
                        )}
                        {!productsLoading && !productsError && (
                            <>
                                {/* Search */}
                                <Form.Control
                                    type="text"
                                    placeholder="Search by product or brand name…"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="mb-3"
                                />
                                {products.length === 0 ? (
                                    <Alert variant="info">No products found. Make sure products are approved and active.</Alert>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Brand</th>
                                                    <th>Available Slots</th>
                                                    <th>Banner Slots</th>
                                                    <th>Stamp Slots</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map((p) => (
                                                    <tr
                                                        key={p.id}
                                                        className={selectedProduct?.id === p.id ? 'table-primary' : ''}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleProductSelect(p)}
                                                    >
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                {p.thumbnail && (
                                                                    <img
                                                                        src={p.thumbnail}
                                                                        alt={p.productName}
                                                                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                                                    />
                                                                )}
                                                                <span className="fw-semibold">{p.productName}</span>
                                                            </div>
                                                        </td>
                                                        <td>{p.brandName || '—'}</td>
                                                        <td>
                                                            <span className={`badge ${p.availableSlots > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                                {p.availableSlots}/8
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-info">{Math.max(0, 4 - p.bookedBanner)} free</span>
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-secondary">{Math.max(0, 4 - p.bookedStamp)} free</span>
                                                        </td>
                                                        <td>
                                                            <Button
                                                                size="sm"
                                                                variant={selectedProduct?.id === p.id ? 'primary' : 'outline-primary'}
                                                                onClick={(e) => { e.stopPropagation(); handleProductSelect(p); }}
                                                                disabled={p.availableSlots === 0}
                                                            >
                                                                {selectedProduct?.id === p.id ? '✓ Selected' : 'Select'}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                        {selectedProduct && (
                            <Alert variant="success" className="mt-3 mb-0">
                                <CsLineIcons icon="check" className="me-2" />
                                Selected: <strong>{selectedProduct.productName}</strong>
                                {selectedProduct.brandName && ` — ${selectedProduct.brandName}`}
                            </Alert>
                        )}
                    </Card.Body>
                </Card>

                {/* ── Step 2: Duration ───────────────────────────────────────────── */}
                {selectedProduct && (
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="mb-0">
                                <span className="badge badge-primary me-2">2</span>
                                Select Ad Duration
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex gap-2 flex-wrap">
                                {DURATION_OPTIONS.map((opt) => (
                                    <Button
                                        key={opt.value}
                                        variant={selectedDuration === opt.value ? 'primary' : 'outline-primary'}
                                        onClick={() => setSelectedDuration(opt.value)}
                                    >
                                        {opt.label}
                                    </Button>
                                ))}
                            </div>
                            <small className="text-muted d-block mt-2">
                                Selected: <strong>{selectedDuration} days</strong>
                            </small>
                        </Card.Body>
                    </Card>
                )}

                {/* ── Step 3: Slot Selection ─────────────────────────────────────── */}
                {selectedProduct && (
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="mb-0">
                                <span className="badge badge-primary me-2">3</span>
                                Select Ad Slots (Banner &amp; Stamp)
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Alert variant="info" className="mb-3">
                                Available slots: <strong>{selectedProduct.availableSlots}/8</strong> &nbsp;|&nbsp;
                                Banner free: <strong>{Math.max(0, 4 - selectedProduct.bookedBanner)}</strong> &nbsp;|&nbsp;
                                Stamp free: <strong>{Math.max(0, 4 - selectedProduct.bookedStamp)}</strong>
                            </Alert>

                            {/* Banner Slots */}
                            <h6 className="mb-2">Banner Slots</h6>
                            <Row className="g-2 mb-4">
                                {bannerSlots.map((slot) => {
                                    const info = selectedProduct.slotStatuses?.find((s) => s.slot === slot);
                                    const isBooked = !info?.available;
                                    return (
                                        <Col key={slot} xs={6} sm={4} md={3}>
                                            <Button
                                                className="w-100"
                                                variant={getSlotVariant(isBooked, selectedSlots.includes(slot))}
                                                disabled={isBooked}
                                                onClick={() => handleSlotToggle(slot)}
                                            >
                                                {getSlotDisplayName(slot)}
                                                {isBooked && <small className="d-block text-white-50">Booked</small>}
                                            </Button>
                                        </Col>
                                    );
                                })}
                            </Row>

                            {/* Stamp Slots */}
                            <h6 className="mb-2">Stamp Slots</h6>
                            <Row className="g-2 mb-3">
                                {stampSlots.map((slot) => {
                                    const info = selectedProduct.slotStatuses?.find((s) => s.slot === slot);
                                    const isBooked = !info?.available;
                                    return (
                                        <Col key={slot} xs={6} sm={4} md={3}>
                                            <Button
                                                className="w-100"
                                                variant={getSlotVariant(isBooked, selectedSlots.includes(slot))}
                                                disabled={isBooked}
                                                onClick={() => handleSlotToggle(slot)}
                                            >
                                                {getSlotDisplayName(slot)}
                                                {isBooked && <small className="d-block text-white-50">Booked</small>}
                                            </Button>
                                        </Col>
                                    );
                                })}
                            </Row>

                            {selectedSlots.length > 0 && (
                                <Alert variant="success" className="mb-0">
                                    <CsLineIcons icon="check" className="me-2" />
                                    Selected: <strong>{selectedSlots.map(getSlotDisplayName).join(', ')}</strong>
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                )}

                {/* ── Step 4: Image Upload ───────────────────────────────────────── */}
                {selectedSlots.length > 0 && (
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="mb-0">
                                <span className="badge badge-primary me-2">4</span>
                                Upload Advertisement Images
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <ImageUpload
                                selectedSlots={selectedSlots}
                                onBannerMobileImageChange={setBannerMobileImage}
                                onBannerDesktopImageChange={setBannerDesktopImage}
                                onStampMobileImageChange={setStampMobileImage}
                                onStampDesktopImageChange={setStampDesktopImage}
                                mobileRedirectUrl={mobileRedirectUrl}
                                desktopRedirectUrl={desktopRedirectUrl}
                                onMobileRedirectUrlChange={setMobileRedirectUrl}
                                onDesktopRedirectUrlChange={setDesktopRedirectUrl}
                            />
                        </Card.Body>
                    </Card>
                )}

                {/* ── Action Buttons ─────────────────────────────────────────────── */}
                {isReady() && (
                    <Card>
                        <Card.Body className="d-flex justify-content-end gap-2">
                            <Button variant="outline-secondary" onClick={handleReset} disabled={submitLoading}>
                                Reset
                            </Button>
                            <Button variant="primary" onClick={handleSubmit} disabled={submitLoading}>
                                {submitLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        <CsLineIcons icon="send" className="me-2" />
                                        Submit for Approval
                                    </>
                                )}
                            </Button>
                        </Card.Body>
                    </Card>
                )}
            </div>
        </>
    );
};

export default ProductAdvertisement;
