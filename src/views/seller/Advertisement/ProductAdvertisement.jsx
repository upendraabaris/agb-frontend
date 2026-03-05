import React, { useState } from 'react';
import { useHistory, NavLink } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation, gql } from '@apollo/client';
import { Card, Button, Row, Col, Alert, Spinner, Modal, Badge, Form, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import SuccessModal from './components/SuccessModal';

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

const GET_PRODUCT_AD_PRICING = gql`
  query GetProductAdPricing($productId: ID!) {
    getProductAdPricing(productId: $productId) {
      tierId
      tierName
      adCategories {
        id
        ad_type
        slot_name
        slot_position
        price
        priority
        duration_days
      }
    }
  }
`;

const GET_MY_WALLET = gql`
  query GetMyWallet {
    getMyWallet {
      id
      balance
    }
  }
`;

const UPLOAD_FILE = gql`
  mutation UploadFile($file: Upload!) {
    uploadFile(file: $file) {
      success
      url
      message
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

// ─── Constants ───────────────────────────────────────────────────────────────

const DURATION_OPTIONS = [
    { value: 90, label: 'Quarterly', key: 'quarterly' },
    { value: 180, label: 'Half-Yearly', key: 'half_yearly' },
    { value: 365, label: 'Yearly', key: 'yearly' },
];

const BANNER_SLOTS = ['banner_1', 'banner_2', 'banner_3', 'banner_4'];
const STAMP_SLOTS = ['stamp_1', 'stamp_2', 'stamp_3', 'stamp_4'];
const ALL_SLOTS = [...BANNER_SLOTS, ...STAMP_SLOTS];

const AD_WIZARD_STORAGE_KEY = 'agb_product_ad_wizard_state';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slotLabel = (slot) => {
    const [type, num] = slot.split('_');
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${num}`;
};

const getDurationKey = (days) =>
    DURATION_OPTIONS.find(d => d.value === days)?.key || 'quarterly';

const getSlotPrice = (pricingData, slotName, durationDays) => {
    if (!pricingData?.adCategories) return 0;
    const entry = pricingData.adCategories.find(
        ac => ac.slot_name === slotName && ac.duration_days === durationDays
    );
    return entry?.price || 0;
};

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = ['Duration', 'Product & Slots', 'Images', 'Review'];

const StepIndicator = ({ current }) => (
    <div className="d-flex align-items-center justify-content-center mb-4">
        {STEPS.map((label, idx) => {
            const step = idx + 1;
            const active = step === current;
            const done = step < current;
            return (
                <React.Fragment key={step}>
                    <div className="d-flex flex-column align-items-center" style={{ minWidth: 70 }}>
                        <div
                            style={{
                                width: 36, height: 36, borderRadius: '50%',
                                backgroundColor: active ? '#0d6efd' : (done ? '#198754' : '#dee2e6'),
                                color: (active || done) ? '#fff' : '#6c757d',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: 15,
                                transition: 'all 0.3s',
                            }}
                        >
                            {done ? <CsLineIcons icon="check" size="14" /> : step}
                        </div>
                        <small
                            style={{
                                fontSize: '0.72rem',
                                marginTop: 4,
                                // eslint-disable-next-line no-nested-ternary
                                color: active ? '#0d6efd' : (done ? '#198754' : '#6c757d'),
                                fontWeight: active ? 700 : 400,
                            }}
                        >
                            {label}
                        </small>
                    </div>
                    {idx < STEPS.length - 1 && (
                        <div
                            style={{
                                flex: 1, height: 2, margin: '0 4px', marginBottom: 20,
                                backgroundColor: done ? '#198754' : '#dee2e6',
                                transition: 'background-color 0.3s',
                            }}
                        />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const ProductAdvertisement = () => {
    const title = 'Advertise a Product';
    const description = 'Book a banner or stamp slot on a product listing page';
    const history = useHistory();

    // ── Wizard state ────────────────────────────────────────────────────
    const [showWizard, setShowWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);

    // Selected data across steps
    const [selectedProduct, setSelectedProduct] = useState(null);   // full product object from list
    const [selectedDuration, setSelectedDuration] = useState(90);
    const [selectedSlots, setSelectedSlots] = useState([]);
    // keyed by slot: { mobileFile, desktopFile, mobilePreview, desktopPreview, redirectUrl }
    const [slotMedia, setSlotMedia] = useState({});
    const [pricingData, setPricingData] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Success modal
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [submittedProductName, setSubmittedProductName] = useState('');

    const [uploading, setUploading] = useState(false);

    // ── Queries ─────────────────────────────────────────────────────────
    const { data: productsData, loading: productsLoading, error: productsError } = useQuery(
        GET_PRODUCTS_WITH_SLOTS, { fetchPolicy: 'network-only' }
    );

    const { data: walletData, refetch: refetchWallet } = useQuery(GET_MY_WALLET, { fetchPolicy: 'network-only' });
    const walletBalance = walletData?.getMyWallet?.balance ?? 0;

    const [fetchPricing, { loading: pricingLoading }] = useLazyQuery(GET_PRODUCT_AD_PRICING, {
        fetchPolicy: 'network-only',
        onCompleted: (data) => {
            if (data?.getProductAdPricing) {
                setPricingData(data.getProductAdPricing);
            } else {
                setPricingData(null);
                toast.warn('No ad tier assigned to this product. Contact admin to assign a tier first.');
            }
        },
        onError: (err) => toast.error(`Failed to load pricing: ${err.message}`),
    });

    const [uploadFile] = useMutation(UPLOAD_FILE);
    const [createProductAdRequest, { loading: submitLoading }] = useMutation(CREATE_PRODUCT_AD_REQUEST);

    // ── Session Storage restore ──────────────────────────────────────────
    React.useEffect(() => {
        try {
            const saved = sessionStorage.getItem(AD_WIZARD_STORAGE_KEY);
            if (!saved) return;
            sessionStorage.removeItem(AD_WIZARD_STORAGE_KEY);
            const s = JSON.parse(saved);
            if (s.selectedProduct) setSelectedProduct(s.selectedProduct);
            if (s.selectedDuration) setSelectedDuration(s.selectedDuration);
            if (s.selectedSlots) setSelectedSlots(s.selectedSlots);
            if (s.slotMedia) setSlotMedia(s.slotMedia);
            if (s.pricingData) setPricingData(s.pricingData);
            if (s.showWizard) { setShowWizard(true); setWizardStep(s.wizardStep || 1); }
            refetchWallet();
            toast.info('Welcome back! Your ad selections have been restored.');
        } catch (e) {
            console.warn('[ProductAd] Could not restore wizard state:', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveWizardState = () => {
        try {
            sessionStorage.setItem(AD_WIZARD_STORAGE_KEY, JSON.stringify({
                selectedProduct, selectedDuration, selectedSlots, slotMedia, pricingData,
                showWizard: true, wizardStep,
            }));
        } catch (e) {
            console.warn('[ProductAd] Could not save wizard state:', e);
        }
    };

    const goToWalletRecharge = () => {
        saveWizardState();
        history.push('/seller/wallet?returnTo=/seller/ads/product/add');
    };

    // ── Open wizard for a product ────────────────────────────────────────
    const openWizard = (product) => {
        setSelectedProduct(product);
        setSelectedSlots([]);
        setSlotMedia({});
        setPricingData(null);
        setWizardStep(1);
        setShowWizard(true);
        fetchPricing({ variables: { productId: product.id } });
    };

    const closeWizard = () => { setShowWizard(false); };

    // ── Pricing helpers ──────────────────────────────────────────────────
    const computeSlotPrice = (slotName) => getSlotPrice(pricingData, slotName, selectedDuration);

    const grandTotal = selectedSlots.reduce((sum, s) => sum + computeSlotPrice(s), 0);

    // ── Slot toggle ──────────────────────────────────────────────────────
    const handleSlotToggle = (slotName) => {
        const info = selectedProduct?.slotStatuses?.find(s => s.slot === slotName);
        if (!info?.available) { toast.error('This slot is already booked'); return; }
        setSelectedSlots(prev => {
            if (prev.includes(slotName)) {
                setSlotMedia(m => { const c = { ...m }; delete c[slotName]; return c; });
                return prev.filter(s => s !== slotName);
            }
            setSlotMedia(m => ({
                ...m,
                [slotName]: { mobileFile: null, desktopFile: null, mobilePreview: '', desktopPreview: '', redirectUrl: '' }
            }));
            return [...prev, slotName];
        });
    };

    const handleMediaChange = (slot, field, value) => {
        setSlotMedia(m => ({ ...m, [slot]: { ...(m[slot] || {}), [field]: value } }));
    };

    const handleFileChange = (slot, type, file) => {
        if (!file) return;
        const preview = URL.createObjectURL(file);
        setSlotMedia(m => ({
            ...m,
            [slot]: {
                ...(m[slot] || {}),
                [`${type}File`]: file,
                [`${type}Preview`]: preview,
            }
        }));
    };

    // ── Step validation ──────────────────────────────────────────────────
    const canGoToStep2 = selectedProduct && (pricingData || !pricingLoading);
    const canGoToStep3 = selectedSlots.length > 0;
    const canGoToStep4 = selectedSlots.every(slot => {
        const m = slotMedia[slot] || {};
        return m.mobileFile || m.mobilePreview || m.desktopFile || m.desktopPreview;
    }) && selectedSlots.length > 0;

    // ── Submit ───────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (pricingData && walletBalance < grandTotal) {
            toast.error(`Insufficient wallet balance (₹${walletBalance}). Need ₹${grandTotal}.`);
            return;
        }
        try {
            setUploading(true);
            const uploadOne = async (file) => {
                const res = await uploadFile({ variables: { file } });
                if (!res.data?.uploadFile?.success) throw new Error(res.data?.uploadFile?.message || 'Upload failed');
                return res.data.uploadFile.url;
            };

            const medias = await Promise.all(
                selectedSlots.map(async (slot) => {
                    const m = slotMedia[slot] || {};
                    const [mobileUrl, desktopUrl] = await Promise.all([
                        m.mobileFile instanceof File ? uploadOne(m.mobileFile) : Promise.resolve(m.mobilePreview || ''),
                        m.desktopFile instanceof File ? uploadOne(m.desktopFile) : Promise.resolve(m.desktopPreview || ''),
                    ]);
                    return {
                        slot,
                        media_type: 'both',
                        mobile_image_url: mobileUrl,
                        desktop_image_url: desktopUrl,
                        mobile_redirect_url: m.redirectUrl || '',
                        desktop_redirect_url: m.redirectUrl || '',
                    };
                })
            );
            setUploading(false);

            await createProductAdRequest({
                variables: { input: { product_id: selectedProduct.id, duration_days: selectedDuration, medias } },
            });

            setSubmittedProductName(selectedProduct.productName);
            setShowWizard(false);
            setShowSuccessModal(true);
            // Reset
            setSelectedProduct(null); setSelectedSlots([]); setSlotMedia({});
            setPricingData(null); setSelectedDuration(90);
        } catch (err) {
            setUploading(false);
            console.error('[ProductAd] Submit error:', err);
            if (err.message?.includes('Authorization') || err.message?.includes('jwt')) {
                toast.error('Session expired. Please login again.');
                setTimeout(() => history.push('/login'), 2000);
            } else {
                toast.error(err.message || 'Failed to submit advertisement');
            }
        }
    };

    // ── Products list (filtered) ─────────────────────────────────────────
    const products = (productsData?.getProductsWithAvailableAdSlots || []).filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.productName?.toLowerCase().includes(q) || p.brandName?.toLowerCase().includes(q);
    });

    // ────────────────────────────────────────────────────────────────────
    // Wizard step renders
    // ────────────────────────────────────────────────────────────────────

    const renderStep1 = () => {
        const durKeyMap = { quarterly: 90, half_yearly: 180, yearly: 365 };

        return (
            <div>
                <h6 className="mb-3">Select Duration &amp; Start Preference</h6>

                {/* Duration buttons */}
                <div className="mb-3">
                    <div className="text-muted small mb-2">Select Duration:</div>
                    <div className="d-flex gap-2">
                        {DURATION_OPTIONS.map(opt => (
                            <Button
                                key={opt.value}
                                variant={selectedDuration === opt.value ? 'primary' : 'outline-secondary'}
                                onClick={() => setSelectedDuration(opt.value)}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Pricing table */}
                {pricingLoading && (
                    <div className="text-center py-3"><Spinner animation="border" size="sm" className="me-2" />Loading pricing…</div>
                )}
                {!pricingLoading && pricingData && (
                    <div className="mt-3">
                        <div className="text-muted small mb-2">
                            Pricing Details (Tier: <strong>{pricingData.tierName}</strong>):
                        </div>
                        <Table bordered size="sm" className="mb-0">
                            <thead className="table-light">
                                <tr><th>Ad Type</th><th>Duration</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                                {ALL_SLOTS.map(slot => {
                                    const price = computeSlotPrice(slot);
                                    return (
                                        <tr key={slot}>
                                            <td>{slotLabel(slot)}</td>
                                            <td>{DURATION_OPTIONS.find(d => d.value === selectedDuration)?.label}</td>
                                            <td className="fw-bold">₹{price}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </div>
                )}
                {!pricingLoading && !pricingData && (
                    <Alert variant="warning" className="mt-3">
                        <CsLineIcons icon="warning-hexagon" className="me-2" />
                        No ad tier assigned to this product. Please ask admin to assign a tier first.
                    </Alert>
                )}
            </div>
        );
    };

    const renderStep2 = () => {
        const renderSlotGroup = (slots, label) => (
            <div className="mb-4">
                <h6 className="text-muted mb-2">{label}</h6>
                <Row className="g-2">
                    {slots.map(slot => {
                        const info = selectedProduct?.slotStatuses?.find(s => s.slot === slot);
                        const isBooked = !info?.available;
                        const isSelected = selectedSlots.includes(slot);
                        const price = computeSlotPrice(slot);
                        return (
                            <Col key={slot} xs={6} sm={3}>
                                <Button
                                    className="w-100"
                                    // eslint-disable-next-line no-nested-ternary
                                    variant={isBooked ? 'secondary' : (isSelected ? 'primary' : 'outline-primary')}
                                    disabled={isBooked}
                                    onClick={() => handleSlotToggle(slot)}
                                    style={{ borderRadius: 8 }}
                                >
                                    <div className="fw-semibold">{slotLabel(slot)}</div>
                                    {isBooked && <small className="d-block text-white-50" style={{ fontSize: '0.72rem' }}>Booked</small>}
                                    {!isBooked && pricingData && price > 0 && (
                                        <small className="d-block" style={{ fontSize: '0.72rem', opacity: 0.85 }}>₹{price}</small>
                                    )}
                                </Button>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        );

        return (
            <div>
                {/* Product summary */}
                <div className="d-flex align-items-center gap-3 p-3 rounded mb-4" style={{ background: '#f8f9fa' }}>
                    {selectedProduct?.thumbnail && (
                        <img src={selectedProduct.thumbnail} alt={selectedProduct.productName}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                    <div>
                        <div className="fw-bold">{selectedProduct?.productName}</div>
                        {selectedProduct?.brandName && <small className="text-muted">{selectedProduct.brandName}</small>}
                    </div>
                    {pricingData && <Badge bg="info" className="ms-auto">{pricingData.tierName}</Badge>}
                </div>

                {/* Slot selection */}
                {renderSlotGroup(BANNER_SLOTS, 'Banner Slots')}
                {renderSlotGroup(STAMP_SLOTS, 'Stamp Slots')}

                {selectedSlots.length > 0 && (
                    <Alert variant="success" className="mb-0">
                        <CsLineIcons icon="check" className="me-2" />
                        Selected: <strong>{selectedSlots.map(slotLabel).join(', ')}</strong>
                        {pricingData && grandTotal > 0 && (
                            <span className="ms-3 fw-bold text-primary">Total: ₹{grandTotal}</span>
                        )}
                    </Alert>
                )}
            </div>
        );
    };

    const renderStep3 = () => (
        <div>
            {selectedSlots.map(slot => (
                <div key={slot} className="mb-4">
                    <div className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
                        <strong>{slotLabel(slot)}</strong>
                        {pricingData && computeSlotPrice(slot) > 0 && (
                            <Badge bg="primary">₹{computeSlotPrice(slot)}</Badge>
                        )}
                    </div>

                    <Row className="g-3">
                        {/* Mobile Image */}
                        <Col md={6}>
                            <Form.Label className="small fw-bold">Mobile Image</Form.Label>
                            {slotMedia[slot]?.mobilePreview && (
                                <img src={slotMedia[slot].mobilePreview} alt="mobile preview"
                                    className="d-block mb-2 rounded"
                                    style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover' }} />
                            )}
                            <Form.Control
                                type="file"
                                accept="image/*"
                                size="sm"
                                onChange={e => handleFileChange(slot, 'mobile', e.target.files[0])}
                            />
                        </Col>

                        {/* Desktop Image */}
                        <Col md={6}>
                            <Form.Label className="small fw-bold">Desktop Image</Form.Label>
                            {slotMedia[slot]?.desktopPreview && (
                                <img src={slotMedia[slot].desktopPreview} alt="desktop preview"
                                    className="d-block mb-2 rounded"
                                    style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover' }} />
                            )}
                            <Form.Control
                                type="file"
                                accept="image/*"
                                size="sm"
                                onChange={e => handleFileChange(slot, 'desktop', e.target.files[0])}
                            />
                        </Col>

                        {/* Redirect URL */}
                        <Col md={12}>
                            <Form.Label className="small fw-bold">Redirect URL (optional)</Form.Label>
                            <Form.Control
                                type="url"
                                size="sm"
                                placeholder="https://example.com"
                                value={slotMedia[slot]?.redirectUrl || ''}
                                onChange={e => handleMediaChange(slot, 'redirectUrl', e.target.value)}
                            />
                        </Col>
                    </Row>
                </div>
            ))}
        </div>
    );

    const renderStep4 = () => (
        <div>
            {/* Product & Duration summary */}
            <div className="d-flex align-items-center gap-3 p-3 rounded mb-3" style={{ background: '#f8f9fa' }}>
                {selectedProduct?.thumbnail && (
                    <img src={selectedProduct.thumbnail} alt={selectedProduct.productName}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                )}
                <div>
                    <div className="fw-bold">{selectedProduct?.productName}</div>
                    {selectedProduct?.brandName && <small className="text-muted">{selectedProduct.brandName}</small>}
                </div>
                <div className="ms-auto text-end">
                    <Badge bg="secondary">{DURATION_OPTIONS.find(d => d.value === selectedDuration)?.label}</Badge>
                    {pricingData && <div className="mt-1"><Badge bg="info">{pricingData.tierName}</Badge></div>}
                </div>
            </div>

            {/* Slot pricing breakdown */}
            <Table bordered size="sm" className="mb-3">
                <thead className="table-light">
                    <tr><th>Slot</th><th>Image</th><th className="text-end">Price</th></tr>
                </thead>
                <tbody>
                    {selectedSlots.map(slot => {
                        const m = slotMedia[slot] || {};
                        const hasImg = m.mobilePreview || m.desktopPreview;
                        return (
                            <tr key={slot}>
                                <td>{slotLabel(slot)}</td>
                                <td>
                                    {hasImg
                                        ? <span className="text-success small"><CsLineIcons icon="check" size="12" className="me-1" />Uploaded</span>
                                        : <span className="text-muted small">No image</span>}
                                </td>
                                <td className="text-end fw-bold">₹{computeSlotPrice(slot)}</td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr className="fw-bold table-light">
                        <td colSpan={2}>Total</td>
                        <td className="text-end text-primary">₹{grandTotal}</td>
                    </tr>
                </tfoot>
            </Table>

            {/* Wallet check */}
            <div className="d-flex align-items-center justify-content-between p-3 rounded"
                style={{ background: walletBalance >= grandTotal ? '#d4edda' : '#fff3cd', border: `1px solid ${walletBalance >= grandTotal ? '#c3e6cb' : '#ffc107'}` }}>
                <div>
                    <strong>Wallet Balance:</strong>{' '}
                    <span className={walletBalance >= grandTotal ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                        ₹{walletBalance.toFixed(2)}
                    </span>
                </div>
                {walletBalance < grandTotal && (
                    <Button size="sm" variant="warning" onClick={goToWalletRecharge}>
                        <CsLineIcons icon="plus" size="13" className="me-1" />
                        Recharge (need ₹{(grandTotal - walletBalance).toFixed(2)} more)
                    </Button>
                )}
            </div>

            {walletBalance < grandTotal && (
                <Alert variant="warning" className="mt-3 mb-0">
                    Insufficient balance. Please recharge your wallet before submitting.
                </Alert>
            )}
        </div>
    );

    // ────────────────────────────────────────────────────────────────────
    // Navigation helpers
    // ────────────────────────────────────────────────────────────────────
    const canNext = () => {
        if (wizardStep === 1) return !!pricingData || (!pricingLoading && !selectedProduct?.adTierId);
        if (wizardStep === 2) return canGoToStep3;
        if (wizardStep === 3) return canGoToStep4;
        return false;
    };

    // ────────────────────────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────────────────────────

    return (
        <>
            <HtmlHead title={title} description={description} />
            <div className="page-title-container mb-3">
                <Row className="g-0">
                    <Col className="col-auto mb-3 mb-sm-0 me-auto">
                        <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/advertisement/product-list">
                            <CsLineIcons icon="chevron-left" size="13" />
                            <span className="align-middle text-small ms-1">My Product Ads</span>
                        </NavLink>
                        <h1 className="mb-0 pb-0 display-4">{title}</h1>
                        <div className="text-muted fs-base">{description}</div>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-center gap-3">
                        <div className="text-end">
                            <div className="text-muted small">Wallet Balance</div>
                            <div className={`fw-bold fs-5 ${walletBalance === 0 ? 'text-danger' : 'text-success'}`}>
                                ₹{walletBalance.toFixed(2)}
                            </div>
                        </div>
                        <Button size="sm" variant="outline-primary" onClick={goToWalletRecharge}>
                            <CsLineIcons icon="plus" size="13" className="me-1" />Recharge
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Product list */}
            <Card>
                <Card.Body>
                    <Form.Control
                        type="text"
                        placeholder="Search product or brand…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="mb-3"
                    />

                    {productsLoading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" /><span className="ms-2 text-muted">Loading products…</span>
                        </div>
                    )}
                    {productsError && <Alert variant="danger">{productsError.message}</Alert>}
                    {!productsLoading && !productsError && products.length === 0 && (
                        <Alert variant="info">No products found.</Alert>
                    )}
                    {!productsLoading && products.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Product</th>
                                        <th>Brand</th>
                                        <th>Available Slots</th>
                                        <th>Banner Free</th>
                                        <th>Stamp Free</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    {p.thumbnail && (
                                                        <img src={p.thumbnail} alt={p.productName}
                                                            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                                                    )}
                                                    <span className="fw-semibold">{p.productName}</span>
                                                </div>
                                            </td>
                                            <td>{p.brandName || '—'}</td>
                                            <td>
                                                <Badge bg={p.availableSlots > 0 ? 'success' : 'danger'}>
                                                    {p.availableSlots}/8
                                                </Badge>
                                            </td>
                                            <td><Badge bg="info">{Math.max(0, 4 - p.bookedBanner)}</Badge></td>
                                            <td><Badge bg="secondary">{Math.max(0, 4 - p.bookedStamp)}</Badge></td>
                                            <td>
                                                <Button
                                                    size="sm"
                                                    variant="primary"
                                                    disabled={p.availableSlots === 0}
                                                    onClick={() => openWizard(p)}
                                                >
                                                    <CsLineIcons icon="tag" size="13" className="me-1" />
                                                    Book Ad
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* ── Wizard Modal ──────────────────────────────────────────────── */}
            <Modal show={showWizard} onHide={closeWizard} size="lg" scrollable>
                <Modal.Header closeButton className="border-bottom">
                    <div>
                        <Modal.Title>Advertisement Submission Wizard</Modal.Title>
                        {selectedProduct && (
                            <div className="text-muted small mt-1">{selectedProduct.productName.toUpperCase()}</div>
                        )}
                    </div>
                </Modal.Header>

                <Modal.Body>
                    <StepIndicator current={wizardStep} />

                    <div style={{ minHeight: 300 }}>
                        {wizardStep === 1 && renderStep1()}
                        {wizardStep === 2 && renderStep2()}
                        {wizardStep === 3 && renderStep3()}
                        {wizardStep === 4 && renderStep4()}
                    </div>
                </Modal.Body>

                <Modal.Footer className="d-flex justify-content-between">
                    <Button variant="outline-secondary" onClick={closeWizard}>Close</Button>
                    <div className="d-flex gap-2">
                        {wizardStep > 1 && (
                            <Button variant="outline-secondary" onClick={() => setWizardStep(s => s - 1)}>
                                ← Previous
                            </Button>
                        )}
                        {wizardStep < 4 ? (
                            <Button
                                variant="primary"
                                onClick={() => setWizardStep(s => s + 1)}
                                disabled={!canNext()}
                            >
                                Next →
                            </Button>
                        ) : (
                            <Button
                                variant="success"
                                onClick={handleSubmit}
                                disabled={submitLoading || uploading || (pricingData && walletBalance < grandTotal)}
                            >
                                {submitLoading || uploading ? (
                                    <><Spinner animation="border" size="sm" className="me-2" />{uploading ? 'Uploading…' : 'Submitting…'}</>
                                ) : (
                                    <><CsLineIcons icon="send" className="me-2" />Submit for Approval</>
                                )}
                            </Button>
                        )}
                    </div>
                </Modal.Footer>
            </Modal>

            {/* ── Success Modal ─────────────────────────────────────────────── */}
            <SuccessModal
                show={showSuccessModal}
                categoryName={submittedProductName}
                viewAdsPath="/seller/advertisement/product-list"
                onClose={() => {
                    setShowSuccessModal(false);
                    history.push('/seller/advertisement/product-list');
                }}
            />
        </>
    );
};

export default ProductAdvertisement;
