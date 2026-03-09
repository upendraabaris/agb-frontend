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
        freeDate
      }
      tierName
      quarterAvailability {
        quarter
        startDate
        endDate
        slots {
          slot
          available
        }
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

// ─── Quarter helper ───────────────────────────────────────────────────────────

/**
 * Returns next N quarters starting from the current quarter.
 * Each entry: { label, isoDate, isToday }
 */
function getQuarters(count = 5) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const currentQStart = Math.floor(month / 3) * 3; // 0, 3, 6, 9

  const quarters = [];
  let qStart = currentQStart;
  let qYear = year;

  for (let i = 0; i < count; i += 1) {
    const qNum = Math.floor(qStart / 3) + 1;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const label = `Q${qNum} ${qYear}`;
    const rangeLabel = `${monthNames[qStart]} - ${monthNames[(qStart + 2) % 12]} ${qYear}`;
    // Build isoDate as plain string to avoid IST→UTC timezone shift from new Date().toISOString()
    const mm = String(qStart + 1).padStart(2, '0');
    const isoDate = `${qYear}-${mm}-01`;
    quarters.push({
      label: i === 0 ? `${label} (Today)` : label,
      rangeLabel,
      isoDate,
      isToday: i === 0,
    });
    // advance to next quarter
    qStart = (qStart + 3) % 12;
    if (qStart === 0) qYear += 1;
  }
  return quarters;
}

/**
 * Returns the start date of the next quarter after the given date.
 */
const getNextQuarterStart = (date) => {
  const m = date.getMonth();
  const year = date.getFullYear();
  if (m <= 2) return new Date(Date.UTC(year, 3, 1));
  if (m <= 5) return new Date(Date.UTC(year, 6, 1));
  if (m <= 8) return new Date(Date.UTC(year, 9, 1));
  return new Date(Date.UTC(year + 1, 0, 1));
};

/**
 * Adds a specified number of days to a date.
 */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

/**
 * Returns the quarter label (Q1, Q2, Q3, Q4) for a given date.
 */
const getQuarterLabel = (date) => {
  const m = date.getUTCMonth() + 1;
  if (m >= 1 && m <= 3) return 'Q1';
  if (m >= 4 && m <= 6) return 'Q2';
  if (m >= 7 && m <= 9) return 'Q3';
  return 'Q4';
};

/**
 * Returns the last moment of the quarter containing the given date.
 */
const getQuarterEnd = (date) => {
  const q = getQuarterLabel(date);
  const year = date.getUTCFullYear();
  if (q === 'Q1') return new Date(Date.UTC(year, 2, 31, 23, 59, 59, 999));
  if (q === 'Q2') return new Date(Date.UTC(year, 5, 30, 23, 59, 59, 999));
  if (q === 'Q3') return new Date(Date.UTC(year, 8, 30, 23, 59, 59, 999));
  return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
};

/**
 * Splits a duration into segments by quarter, calculating how many days fall in each quarter.
 */
const splitIntervalByQuarter = (startDate, totalDays) => {
  const segments = [];
  let remaining = totalDays;
  let cursor = new Date(startDate);

  while (remaining > 0) {
    const qEnd = getQuarterEnd(cursor);
    const msPerDay = 24 * 60 * 60 * 1000;
    const diff =
      Math.floor(
        (Date.UTC(qEnd.getUTCFullYear(), qEnd.getUTCMonth(), qEnd.getUTCDate()) -
          Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate())) /
        msPerDay
      ) + 1;
    const take = Math.min(remaining, diff);

    segments.push({
      quarter: getQuarterLabel(cursor),
      start: new Date(cursor),
      days: take,
    });

    cursor = addDays(cursor, take);
    remaining -= take;
  }
  return segments;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slotLabel = (slot) => {
  const [type, num] = slot.split('_');
  return `${type.charAt(0).toUpperCase() + type.slice(1)} ${num}`;
};

const getDurationKey = (days) => DURATION_OPTIONS.find((d) => d.value === days)?.key || 'quarterly';

const getSlotPrice = (pricingData, slotName, durationDays) => {
  if (!pricingData?.adCategories) return 0;
  const entry = pricingData.adCategories.find((ac) => ac.slot_name === slotName && ac.duration_days === durationDays);
  return entry?.price || 0;
};

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = ['Duration', 'Product & Slots', 'Images', 'Review'];

const StepIndicator = ({ current }) => {
  const getBackgroundColor = (active, done) => {
    if (active) return '#0d6efd';
    if (done) return '#198754';
    return '#dee2e6';
  };

  const getTextColor = (active, done) => {
    if (active) return '#0d6efd';
    if (done) return '#198754';
    return '#6c757d';
  };

  return (
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
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: getBackgroundColor(active, done),
                  color: active || done ? '#fff' : '#6c757d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 15,
                  transition: 'all 0.3s',
                }}
              >
                {done ? <CsLineIcons icon="check" size="14" /> : step}
              </div>
              <small
                style={{
                  fontSize: '0.72rem',
                  marginTop: 4,
                  color: getTextColor(active, done),
                  fontWeight: active ? 700 : 400,
                }}
              >
                {label}
              </small>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  margin: '0 4px',
                  marginBottom: 20,
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
};

// ─── Main Component ──────────────────────────────────────────────────────────

const ProductAdvertisement = () => {
  const title = 'Advertise a Product';
  const description = 'Book a banner or stamp slot on a product listing page';
  const history = useHistory();

  // ── Wizard state ────────────────────────────────────────────────────
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Selected data across steps
  const [selectedProduct, setSelectedProduct] = useState(null); // full product object from list
  const [selectedDuration, setSelectedDuration] = useState(90);
  const [selectedSlots, setSelectedSlots] = useState([]);
  // keyed by slot: { mobileFile, desktopFile, mobilePreview, desktopPreview, redirectUrl }
  const [slotMedia, setSlotMedia] = useState({});
  const [pricingData, setPricingData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStartQuarter, setSelectedStartQuarter] = useState(null); // ISO date of chosen quarter
  const [expandedProductId, setExpandedProductId] = useState(null); // which product card is expanded

  // Success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedProductName, setSubmittedProductName] = useState('');

  const [uploading, setUploading] = useState(false);

  // ── Queries ─────────────────────────────────────────────────────────
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_PRODUCTS_WITH_SLOTS, { fetchPolicy: 'network-only' });

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
      if (s.selectedStartQuarter) setSelectedStartQuarter(s.selectedStartQuarter);
      if (s.showWizard) {
        setShowWizard(true);
        setWizardStep(s.wizardStep || 1);
      }
      refetchWallet();
      toast.info('Welcome back! Your ad selections have been restored.');
    } catch (e) {
      console.warn('[ProductAd] Could not restore wizard state:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveWizardState = () => {
    try {
      sessionStorage.setItem(
        AD_WIZARD_STORAGE_KEY,
        JSON.stringify({
          selectedProduct,
          selectedDuration,
          selectedSlots,
          slotMedia,
          pricingData,
          selectedStartQuarter,
          showWizard: true,
          wizardStep,
        })
      );
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

  const closeWizard = () => {
    setShowWizard(false);
  };

  // Returns the quarterAvailability entry matching the user's selected quarter.
  // Matches by QUARTER LABEL (e.g. "Q2 2026") instead of start date to avoid IST/UTC timezone drift.
  const getSelectedQuarterAvailability = () => {
    if (!selectedProduct?.quarterAvailability) return null;
    const isoDate = selectedStartQuarter || getQuarters(1)[0].isoDate;
    const d = new Date(isoDate);
    // Derive quarter label from the local date (same convention as backend: Q1-Q4)
    const qNum = Math.floor(d.getMonth() / 3) + 1;
    const quarterLabel = `Q${qNum} ${d.getFullYear()}`;
    return selectedProduct.quarterAvailability.find((q) => q.quarter === quarterLabel) || null;
  };

  // ── Pricing helpers ──────────────────────────────────────────────────
  const computeSlotPrice = (slotName) => getSlotPrice(pricingData, slotName, selectedDuration);

  const grandTotal = selectedSlots.reduce((sum, s) => sum + computeSlotPrice(s), 0);

  // ── Slot toggle ──────────────────────────────────────────────────────
  const handleSlotToggle = (slotName) => {
    // Use quarter-specific availability if a quarter is selected
    const qAvail = getSelectedQuarterAvailability();
    const info = qAvail
      ? qAvail.slots?.find((s) => s.slot === slotName)
      : selectedProduct?.slotStatuses?.find((s) => s.slot === slotName);
    const isAvailable = qAvail ? info?.available : info?.available;
    if (!isAvailable) {
      toast.error('This slot is already booked for the selected quarter');
      return;
    }
    setSelectedSlots((prev) => {
      if (prev.includes(slotName)) {
        setSlotMedia((m) => {
          const c = { ...m };
          delete c[slotName];
          return c;
        });
        return prev.filter((s) => s !== slotName);
      }
      setSlotMedia((m) => ({
        ...m,
        [slotName]: { mobileFile: null, desktopFile: null, mobilePreview: '', desktopPreview: '', redirectUrl: '' },
      }));
      return [...prev, slotName];
    });
  };

  const handleMediaChange = (slot, field, value) => {
    setSlotMedia((m) => ({ ...m, [slot]: { ...(m[slot] || {}), [field]: value } }));
  };

  const handleFileChange = (slot, type, file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSlotMedia((m) => ({
      ...m,
      [slot]: {
        ...(m[slot] || {}),
        [`${type}File`]: file,
        [`${type}Preview`]: preview,
      },
    }));
  };

  // ── Step validation ──────────────────────────────────────────────────
  const canGoToStep2 = selectedProduct && (pricingData || !pricingLoading);
  const canGoToStep3 = selectedSlots.length > 0;
  const canGoToStep4 =
    selectedSlots.every((slot) => {
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
        variables: {
          input: {
            product_id: selectedProduct.id,
            duration_days: selectedDuration,
            start_preference: selectedStartQuarter ? 'select_quarter' : 'today',
            // Derive quarter label directly from the isoDate string (YYYY-MM-DD) to avoid timezone issues
            selected_quarter: (() => {
              if (!selectedStartQuarter) return null;
              const [yr, mo] = selectedStartQuarter.split('-').map(Number);
              const qNum = Math.ceil(mo / 3);
              return `Q${qNum} ${yr}`;
            })(),
            medias,
          },
        },
      });

      setSubmittedProductName(selectedProduct.productName);
      setShowWizard(false);
      setShowSuccessModal(true);
      // Reset
      setSelectedProduct(null);
      setSelectedSlots([]);
      setSlotMedia({});
      setPricingData(null);
      setSelectedDuration(90);
      setSelectedStartQuarter(null);
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
  const products = (productsData?.getProductsWithAvailableAdSlots || []).filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.productName?.toLowerCase().includes(q) || p.brandName?.toLowerCase().includes(q);
  });

  // ────────────────────────────────────────────────────────────────────
  // Wizard step renders
  // ────────────────────────────────────────────────────────────────────

  const renderStep1 = () => {
    const quarters = getQuarters(5);

    return (
      <div>
        <h6 className="mb-3">Select Duration &amp; Start Preference</h6>

        {/* Duration buttons */}
        <div className="mb-3">
          <div className="text-muted small mb-2">Select Duration:</div>
          <div className="d-flex gap-2 flex-wrap">
            {DURATION_OPTIONS.map((opt) => (
              <Button key={opt.value} variant={selectedDuration === opt.value ? 'primary' : 'outline-secondary'} onClick={() => setSelectedDuration(opt.value)}>
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Quarter selection */}
        <div className="mb-3">
          <div className="text-muted small mb-2">Start From Quarter:</div>
          <div className="d-flex gap-2 flex-wrap">
            {quarters.map((q) => (
              <Button
                key={q.isoDate}
                size="sm"
                variant={(selectedStartQuarter || quarters[0].isoDate) === q.isoDate ? 'primary' : 'outline-secondary'}
                onClick={() => setSelectedStartQuarter(q.isoDate)}
                title={q.rangeLabel}
              >
                {q.label}
              </Button>
            ))}
          </div>
          <div className="text-muted" style={{ fontSize: '0.78rem', marginTop: 4 }}>
            Your ad starts from the selected quarter with full quarter pricing.
          </div>
        </div>

        {/* Pricing table */}
        {pricingLoading && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading pricing…
          </div>
        )}
        {!pricingLoading && pricingData && (
          <div className="mt-3">
            <div className="text-muted small mb-2">
              Pricing Details (Tier: <strong>{pricingData.tierName}</strong>):
            </div>
            <Table bordered size="sm" className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ad Type</th>
                  <th>Duration</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {ALL_SLOTS.map((slot) => {
                  const price = computeSlotPrice(slot);
                  return (
                    <tr key={slot}>
                      <td>{slotLabel(slot)}</td>
                      <td>{DURATION_OPTIONS.find((d) => d.value === selectedDuration)?.label}</td>
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
    // Format freeDate → "DD/MM/YYYY"
    const formatDate = (iso) => {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const renderSlotRow = (slot) => {
      // Use quarter-specific availability so that a slot booked for Q2 doesn't
      // appear as booked when the user is selecting Q3 or Q4.
      const qAvail = getSelectedQuarterAvailability();
      const info = qAvail
        ? qAvail.slots?.find((s) => s.slot === slot)
        : selectedProduct?.slotStatuses?.find((s) => s.slot === slot);
      const isBooked = qAvail ? !info?.available : !info?.available;
      const isSelected = selectedSlots.includes(slot);
      const price = computeSlotPrice(slot);
      // freeDate only makes sense for global slotStatuses (has end_date info)
      const globalInfo = selectedProduct?.slotStatuses?.find((s) => s.slot === slot);
      const freeDate = globalInfo?.freeDate ? formatDate(globalInfo.freeDate) : null;

      return (
        <div
          key={slot}
          onClick={() => !isBooked && handleSlotToggle(slot)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 8px',
            marginBottom: 4,
            borderRadius: 6,
            cursor: isBooked ? 'not-allowed' : 'pointer',
            background: isSelected ? '#e8f4ff' : 'transparent',
            border: isSelected ? '1px solid #0d6efd' : '1px solid transparent',
            transition: 'all 0.15s',
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#333', minWidth: 60 }}>{slotLabel(slot)}:</span>
          {isBooked ? (
            <span style={{ fontSize: '0.78rem', color: '#dc3545' }}>
              <strong>✗</strong> Booked till {freeDate || '—'}
            </span>
          ) : (
            <span style={{ fontSize: '0.78rem', color: '#198754' }}>
              <strong>✓</strong> Available
              {pricingData && price > 0 && <span style={{ color: '#0d6efd', marginLeft: 6 }}>₹{price}</span>}
            </span>
          )}
        </div>
      );
    };

    return (
      <div>
        {/* Product summary bar */}
        <div className="d-flex align-items-center gap-3 p-3 rounded mb-3" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
          {selectedProduct?.thumbnail && (
            <img src={selectedProduct.thumbnail} alt={selectedProduct.productName} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6 }} />
          )}
          <div className="flex-grow-1">
            <div className="fw-bold" style={{ fontSize: '0.92rem' }}>
              {selectedProduct?.productName}
            </div>
            {selectedProduct?.brandName && <small className="text-muted">{selectedProduct.brandName}</small>}
          </div>
          <div className="d-flex gap-2">
            <Badge bg="success">{selectedProduct?.availableSlots ?? 0}/8 Available</Badge>
            {pricingData && <Badge bg="info">{pricingData.tierName}</Badge>}
          </div>
        </div>

        {/* Banners | Stamps two-column layout */}
        <Row className="g-3 mb-3">
          <Col xs={12} sm={6}>
            <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, padding: '12px 14px' }}>
              <div className="fw-semibold mb-2" style={{ fontSize: '0.85rem', color: '#555' }}>
                Banners
              </div>
              {BANNER_SLOTS.map(renderSlotRow)}
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 8, padding: '12px 14px' }}>
              <div className="fw-semibold mb-2" style={{ fontSize: '0.85rem', color: '#555' }}>
                Stamps
              </div>
              {STAMP_SLOTS.map(renderSlotRow)}
            </div>
          </Col>
        </Row>

        {selectedSlots.length > 0 && (
          <Alert variant="success" className="mb-0 py-2">
            <CsLineIcons icon="check" className="me-2" />
            Selected: <strong>{selectedSlots.map(slotLabel).join(', ')}</strong>
            {pricingData && grandTotal > 0 && <span className="ms-3 fw-bold text-primary">Total: ₹{grandTotal}</span>}
          </Alert>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div>
      {selectedSlots.map((slot) => (
        <div key={slot} className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-2 pb-2 border-bottom">
            <strong>{slotLabel(slot)}</strong>
            {pricingData && computeSlotPrice(slot) > 0 && <Badge bg="primary">₹{computeSlotPrice(slot)}</Badge>}
          </div>

          <Row className="g-3">
            {/* Mobile Image */}
            <Col md={6}>
              <Form.Label className="small fw-bold">Mobile Image</Form.Label>
              {slotMedia[slot]?.mobilePreview && (
                <img
                  src={slotMedia[slot].mobilePreview}
                  alt="mobile preview"
                  className="d-block mb-2 rounded"
                  style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover' }}
                />
              )}
              <Form.Control type="file" accept="image/*" size="sm" onChange={(e) => handleFileChange(slot, 'mobile', e.target.files[0])} />
            </Col>

            {/* Desktop Image */}
            <Col md={6}>
              <Form.Label className="small fw-bold">Desktop Image</Form.Label>
              {slotMedia[slot]?.desktopPreview && (
                <img
                  src={slotMedia[slot].desktopPreview}
                  alt="desktop preview"
                  className="d-block mb-2 rounded"
                  style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'cover' }}
                />
              )}
              <Form.Control type="file" accept="image/*" size="sm" onChange={(e) => handleFileChange(slot, 'desktop', e.target.files[0])} />
            </Col>

            {/* Redirect URL */}
            <Col md={12}>
              <Form.Label className="small fw-bold">Redirect URL (optional)</Form.Label>
              <Form.Control
                type="url"
                size="sm"
                placeholder="https://example.com"
                value={slotMedia[slot]?.redirectUrl || ''}
                onChange={(e) => handleMediaChange(slot, 'redirectUrl', e.target.value)}
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
          <img src={selectedProduct.thumbnail} alt={selectedProduct.productName} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
        )}
        <div>
          <div className="fw-bold">{selectedProduct?.productName}</div>
          {selectedProduct?.brandName && <small className="text-muted">{selectedProduct.brandName}</small>}
        </div>
        <div className="ms-auto text-end">
          <Badge bg="secondary">{DURATION_OPTIONS.find((d) => d.value === selectedDuration)?.label}</Badge>
          {pricingData && (
            <div className="mt-1">
              <Badge bg="info">{pricingData.tierName}</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Quarter breakdown */}
      {(() => {
        const startDate = selectedStartQuarter ? new Date(selectedStartQuarter) : new Date();
        const segments = splitIntervalByQuarter(startDate, selectedDuration);
        const endDate = addDays(startDate, selectedDuration - 1);

        return (
          <div className="mb-3 p-3 rounded" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
            <div className="fw-semibold mb-2">Advertisement Period</div>
            <div className="text-muted small mb-2">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </div>
            <div className="text-muted small">
              <strong>Quarter Breakdown:</strong>
              <ul className="mb-0 mt-1">
                {segments.map((seg, idx) => (
                  <li key={idx}>
                    {seg.quarter}: {seg.days} days
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })()}

      {/* Slot pricing breakdown */}
      <Table bordered size="sm" className="mb-3">
        <thead className="table-light">
          <tr>
            <th>Slot</th>
            <th>Image</th>
            <th className="text-end">Price</th>
          </tr>
        </thead>
        <tbody>
          {selectedSlots.map((slot) => {
            const m = slotMedia[slot] || {};
            const hasImg = m.mobilePreview || m.desktopPreview;
            return (
              <tr key={slot}>
                <td>{slotLabel(slot)}</td>
                <td>
                  {hasImg ? (
                    <span className="text-success small">
                      <CsLineIcons icon="check" size="12" className="me-1" />
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-muted small">No image</span>
                  )}
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
      <div
        className="d-flex align-items-center justify-content-between p-3 rounded"
        style={{ background: walletBalance >= grandTotal ? '#d4edda' : '#fff3cd', border: `1px solid ${walletBalance >= grandTotal ? '#c3e6cb' : '#ffc107'}` }}
      >
        <div>
          <strong>Wallet Balance:</strong>{' '}
          <span className={walletBalance >= grandTotal ? 'text-success fw-bold' : 'text-danger fw-bold'}>₹{walletBalance.toFixed(2)}</span>
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
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/advertisement/list?tab=product">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">My Ads</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4">{title}</h1>
            <div className="text-muted fs-base">{description}</div>
          </Col>
          <Col xs="auto" className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="text-muted small">Wallet Balance</div>
              <div className={`fw-bold fs-5 ${walletBalance === 0 ? 'text-danger' : 'text-success'}`}>₹{walletBalance.toFixed(2)}</div>
            </div>
            <Button size="sm" variant="outline-primary" onClick={goToWalletRecharge}>
              <CsLineIcons icon="plus" size="13" className="me-1" />
              Recharge
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />

          {productsLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <span className="ms-2 text-muted">Loading products…</span>
            </div>
          )}
          {productsError && <Alert variant="danger">{productsError.message}</Alert>}
          {!productsLoading && !productsError && products.length === 0 && <Alert variant="info">No products found.</Alert>}
          {!productsLoading &&
            products.length > 0 &&
            (() => {
              const formatDate = (iso) => {
                if (!iso) return '\u2014';
                const d = new Date(iso);
                return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
              };
              return (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: 44 }} /> {/* thumbnail */}
                      <col /> {/* product name */}
                      <col style={{ width: 110 }} /> {/* brand */}
                      <col style={{ width: 80 }} /> {/* tier */}
                      <col style={{ width: 100 }} /> {/* available */}
                      <col style={{ width: 100 }} /> {/* banners */}
                      <col style={{ width: 100 }} /> {/* stamps */}
                      <col style={{ width: 120 }} /> {/* action */}
                    </colgroup>
                    <thead className="table-light">
                      <tr>
                        <th />
                        <th>Product</th>
                        <th>Brand</th>
                        <th>Tier</th>
                        <th className="text-center">Available</th>
                        <th className="text-center">Banners</th>
                        <th className="text-center">Stamps</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const isExpanded = expandedProductId === p.id;
                        return (
                          <React.Fragment key={p.id}>
                            {/* Main row */}
                            <tr
                              style={{ cursor: 'pointer', background: isExpanded ? '#f0f6ff' : undefined }}
                              onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                            >
                              <td className="px-2">
                                {p.thumbnail ? (
                                  <img src={p.thumbnail} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                                ) : (
                                  <div style={{ width: 36, height: 36, borderRadius: 6, background: '#e9ecef' }} />
                                )}
                              </td>
                              <td>
                                <div className="fw-semibold text-truncate" style={{ fontSize: '0.88rem' }}>
                                  {p.productName}
                                </div>
                              </td>
                              <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                                {p.brandName || '\u2014'}
                              </td>
                              <td>
                                {p.tierName ? (
                                  <Badge bg="warning" text="dark" style={{ fontSize: '0.72rem' }}>
                                    {p.tierName}
                                  </Badge>
                                ) : (
                                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    —
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <Badge bg={p.availableSlots > 0 ? 'success' : 'danger'}>{p.availableSlots}/8</Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg={p.bookedBanner < 4 ? 'info' : 'danger'}>{Math.max(0, 4 - p.bookedBanner)} free</Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg={p.bookedStamp < 4 ? 'secondary' : 'danger'}>{Math.max(0, 4 - p.bookedStamp)} free</Badge>
                              </td>
                              <td className="text-center">
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                  <span
                                    style={{
                                      color: '#aaa',
                                      fontSize: 10,
                                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                                      display: 'inline-block',
                                      transition: 'transform 0.2s',
                                    }}
                                  >
                                    ▼
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="primary"
                                    disabled={p.availableSlots === 0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openWizard(p);
                                    }}
                                  >
                                    <CsLineIcons icon="tag" size="13" className="me-1" />
                                    Book Ad
                                  </Button>
                                </div>
                              </td>
                            </tr>

                            {/* Expandable slot detail row */}
                            {isExpanded && (
                              <tr style={{ background: '#f8fbff' }}>
                                <td colSpan={8} style={{ padding: '12px 20px', borderTop: 'none' }}>
                                  <Row className="g-2">
                                    <Col xs={12} sm={6}>
                                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px' }}>
                                        <div
                                          className="fw-semibold mb-2"
                                          style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                        >
                                          Banners
                                        </div>
                                        {BANNER_SLOTS.map((slot) => {
                                          const info = p.slotStatuses?.find((s) => s.slot === slot);
                                          const booked = !info?.available;
                                          const fd = info?.freeDate ? formatDate(info.freeDate) : null;
                                          return (
                                            <div
                                              key={slot}
                                              className="d-flex align-items-center justify-content-between"
                                              style={{ padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}
                                            >
                                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444' }}>{slotLabel(slot)}</span>
                                              {booked ? (
                                                <span style={{ fontSize: '0.75rem', color: '#dc3545' }}>✗ Booked till {fd}</span>
                                              ) : (
                                                <span style={{ fontSize: '0.75rem', color: '#198754' }}>✓ Available</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </Col>
                                    <Col xs={12} sm={6}>
                                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px' }}>
                                        <div
                                          className="fw-semibold mb-2"
                                          style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                                        >
                                          Stamps
                                        </div>
                                        {STAMP_SLOTS.map((slot) => {
                                          const info = p.slotStatuses?.find((s) => s.slot === slot);
                                          const booked = !info?.available;
                                          const fd = info?.freeDate ? formatDate(info.freeDate) : null;
                                          return (
                                            <div
                                              key={slot}
                                              className="d-flex align-items-center justify-content-between"
                                              style={{ padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}
                                            >
                                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#444' }}>{slotLabel(slot)}</span>
                                              {booked ? (
                                                <span style={{ fontSize: '0.75rem', color: '#dc3545' }}>✗ Booked till {fd}</span>
                                              ) : (
                                                <span style={{ fontSize: '0.75rem', color: '#198754' }}>✓ Available</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </Col>
                                  </Row>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
        </Card.Body>
      </Card>

      {/* ── Wizard Modal ──────────────────────────────────────────────── */}
      <Modal show={showWizard} onHide={closeWizard} size="lg" scrollable>
        <Modal.Header closeButton className="border-bottom">
          <div>
            <Modal.Title>Advertisement Submission Wizard</Modal.Title>
            {selectedProduct && <div className="text-muted small mt-1">{selectedProduct.productName.toUpperCase()}</div>}
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
          <Button variant="outline-secondary" onClick={closeWizard}>
            Close
          </Button>
          <div className="d-flex gap-2">
            {wizardStep > 1 && (
              <Button variant="outline-secondary" onClick={() => setWizardStep((s) => s - 1)}>
                ← Previous
              </Button>
            )}
            {wizardStep < 4 ? (
              <Button variant="primary" onClick={() => setWizardStep((s) => s + 1)} disabled={!canNext()}>
                Next →
              </Button>
            ) : (
              <Button variant="success" onClick={handleSubmit} disabled={submitLoading || uploading || (pricingData && walletBalance < grandTotal)}>
                {submitLoading || uploading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {uploading ? 'Uploading…' : 'Submitting…'}
                  </>
                ) : (
                  <>
                    <CsLineIcons icon="send" className="me-2" />
                    Submit for Approval
                  </>
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
        viewAdsPath="/seller/advertisement/list?tab=product"
        onClose={() => {
          setShowSuccessModal(false);
          history.push('/seller/advertisement/list?tab=product');
        }}
      />
    </>
  );
};

export default ProductAdvertisement;
