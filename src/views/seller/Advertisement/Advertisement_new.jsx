import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import ImageUpload from './components/ImageUpload';
import PreviewSection from './components/PreviewSection';
import SuccessModal from './components/SuccessModal';

// Get categories with available slots
const GET_CATEGORIES_WITH_SLOTS = gql`
  query GetCategoriesWithAvailableSlots {
    getCategoriesWithAvailableSlots {
      id
      name
      image
      description
      order
      adTierId
      availableSlots
      bookedSlots
      bookedBanner
      bookedStamp
      slotStatuses {
        slot
        available
        freeDate
      }
      tierId
    }
  }
`;

// Get pricing for a category by tier
const GET_CATEGORY_PRICING = gql`
  query GetCategoryPricing($categoryId: ID!) {
    getCategoryPricing(categoryId: $categoryId) {
      categoryId
      tierId
      tierName
      adCategories {
        id
        ad_type
        price
        priority
        duration_days
        name
      }
    }
  }
`;

// Create category request with media and slots
const CREATE_CATEGORY_REQUEST = gql`
  mutation CreateCategoryRequest($input: CreateCategoryRequestInput!) {
    createCategoryRequest(input: $input) {
      id
      category_id
      tier_id
      seller_id
      status
      createdAt
    }
  }
`;

const Advertisement = () => {
  const title = 'Submit Advertisement';
  const description = 'Submit your advertisement to available slots';

  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(90);
  const [startPreference, setStartPreference] = useState('today');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [mobileImage, setMobileImage] = useState(null);
  const [desktopImage, setDesktopImage] = useState(null);
  const [mobileRedirectUrl, setMobileRedirectUrl] = useState('');
  const [desktopRedirectUrl, setDesktopRedirectUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedCategoryName, setSubmittedCategoryName] = useState('');

  // Queries
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES_WITH_SLOTS);
  
  const { data: pricingData, loading: pricingLoading, error: pricingError } = useQuery(
    GET_CATEGORY_PRICING,
    {
      variables: { categoryId: selectedCategory },
      skip: !selectedCategory,
    }
  );

  const [createCategoryRequest, { loading: submitLoading }] = useMutation(CREATE_CATEGORY_REQUEST, {
    onCompleted: (data) => {
      toast.success('Advertisement submitted successfully!');
      setSubmittedCategoryName(
        categoriesData?.getCategoriesWithAvailableSlots?.find(
          (cat) => cat.id === selectedCategory
        )?.name || ''
      );
      setShowSuccessModal(true);
      setShowPreview(false);
      
      // Reset form
      setSelectedCategory('');
      setSelectedDuration(30);
      setSelectedSlots([]);
      setMobileImage(null);
      setDesktopImage(null);
      setMobileRedirectUrl('');
      setDesktopRedirectUrl('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit advertisement');
    },
  });

  // Handle errors
  React.useEffect(() => {
    if (categoriesError) {
      console.error('Categories Error:', categoriesError);
      toast.error('Failed to load categories');
    }
    if (pricingError) {
      console.error('Pricing Error:', pricingError);
      toast.error('Failed to load pricing');
    }
  }, [categoriesError, pricingError]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSlots([]);
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
  };

  // helper functions for pricing preview
  const getNextQuarterStart = (date) => {
    const m = date.getMonth();
    const year = date.getFullYear();
    if (m <= 2) return new Date(Date.UTC(year, 3, 1));
    if (m <= 5) return new Date(Date.UTC(year, 6, 1));
    if (m <= 8) return new Date(Date.UTC(year, 9, 1));
    return new Date(Date.UTC(year + 1, 0, 1));
  };

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  };

  const getQuarterLabel = (date) => {
    const m = date.getUTCMonth() + 1;
    if (m >= 1 && m <= 3) return 'Q1';
    if (m >= 4 && m <= 6) return 'Q2';
    if (m >= 7 && m <= 9) return 'Q3';
    return 'Q4';
  };

  const getQuarterEnd = (date) => {
    const q = getQuarterLabel(date);
    const year = date.getUTCFullYear();
    if (q === 'Q1') return new Date(Date.UTC(year, 2, 31, 23,59,59,999));
    if (q === 'Q2') return new Date(Date.UTC(year, 5, 30, 23,59,59,999));
    if (q === 'Q3') return new Date(Date.UTC(year, 8, 30, 23,59,59,999));
    return new Date(Date.UTC(year, 11, 31, 23,59,59,999));
  };

  const splitIntervalByQuarter = (startDate, totalDays) => {
    const segments = [];
    let remaining = totalDays;
    let cursor = new Date(startDate);
    while (remaining > 0) {
      const qEnd = getQuarterEnd(cursor);
      const msPerDay = 24 * 60 * 60 * 1000;
      const diff = Math.floor((Date.UTC(qEnd.getUTCFullYear(), qEnd.getUTCMonth(), qEnd.getUTCDate()) - Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate())) / msPerDay) + 1;
      const take = Math.min(remaining, diff);
      segments.push({ quarter: getQuarterLabel(cursor), start: new Date(cursor), days: take });
      cursor = addDays(cursor, take);
      remaining -= take;
    }
    return segments;
  };

  const computePricingPreview = () => {
    const pricing = pricingData?.getCategoryPricing;
    if (!pricing) return null;
    const segmentsStart = startPreference === 'next_quarter' ? getNextQuarterStart(new Date()) : new Date();
    const segments = splitIntervalByQuarter(segmentsStart, selectedDuration);
    const adCat = pricing.adCategories && pricing.adCategories.length > 0 ? pricing.adCategories[0] : null;
    if (!adCat) return null;
    const { price = 0, duration_days: durationDays = selectedDuration } = adCat;
    const ratePerDay = (price || 0) / (durationDays || 1);
    const breakdown = segments.map(s => ({ quarter: s.quarter, days: s.days, rate_per_day: Math.round(ratePerDay * 100) / 100, subtotal: Math.round(ratePerDay * s.days) }));
    const total = breakdown.reduce((sum, b) => sum + b.subtotal, 0);
    const startDate = segmentsStart;
    const endDate = addDays(segmentsStart, selectedDuration - 1);
    return { startDate, endDate, breakdown, total };
  };

  const computePricingPreviewByType = (adType = 'banner') => {
    const pricing = pricingData?.getCategoryPricing;
    if (!pricing) return null;
    const segmentsStart = startPreference === 'next_quarter' ? getNextQuarterStart(new Date()) : new Date();
    const segments = splitIntervalByQuarter(segmentsStart, selectedDuration);
    
    // find adCategory: first try exact duration match, then match by type with any duration, fallback to first
    let adCat = null;
    if (pricing.adCategories && pricing.adCategories.length > 0) {
      // Try exact match: same ad_type AND same duration_days
      adCat = pricing.adCategories.find(ac => ac.ad_type === adType && ac.duration_days === selectedDuration);
      // If no exact match, try same ad_type with any duration
      if (!adCat) {
        adCat = pricing.adCategories.find(ac => ac.ad_type === adType);
      }
      // Final fallback: first entry
      if (!adCat) {
        const [firstEntry] = pricing.adCategories;
        adCat = firstEntry;
      }
    }
    if (!adCat) return null;
    
    const { duration_days: durationDays = 30, price = 0 } = adCat;
    const baseDuration = durationDays;
    const basePrice = price;
    const ratePerDay = Math.round((basePrice / baseDuration) * 100) / 100;
    const breakdown = segments.map(s => ({ quarter: s.quarter, days: s.days, rate_per_day: ratePerDay, subtotal: Math.round(ratePerDay * s.days) }));
    const total = breakdown.reduce((sum, b) => sum + b.subtotal, 0);
    const startDate = segmentsStart;
    const endDate = addDays(segmentsStart, selectedDuration - 1);
    return { startDate, endDate, breakdown, total };
  };

  const computeTotalForSelectedSlots = () => {
    if (!selectedSlots || selectedSlots.length === 0) return 0;
    let sum = 0;
    const counts = { banner: 0, stamp: 0 };
    selectedSlots.forEach(s => {
      const type = s.split('_')[0];
      if (type === 'banner' || type === 'stamp') counts[type] += 1;
    });
    if (counts.banner > 0) {
      const p = computePricingPreviewByType('banner');
      if (p) sum += p.total * counts.banner;
    }
    if (counts.stamp > 0) {
      const p = computePricingPreviewByType('stamp');
      if (p) sum += p.total * counts.stamp;
    }
    return sum;
  };

  const handleSlotToggle = (slotName) => {
    // Prevent toggling a slot that's currently booked (disabled)
    const parts = slotName.split('_');
    const type = parts[0];
    const num = parseInt(parts[1], 10);
    const counts = selectedCategoryData || {};
    const bookedBanner = counts.bookedBanner || 0;
    const bookedStamp = counts.bookedStamp || 0;
    const enabledBanner = Math.max(0, 4 - bookedBanner);
    const enabledStamp = Math.max(0, 4 - bookedStamp);

    if ((type === 'banner' && num > enabledBanner) || (type === 'stamp' && num > enabledStamp)) {
      // slot is booked/unavailable
      toast.error('This slot is already booked');
      return;
    }

    setSelectedSlots((prevSlots) => {
      if (prevSlots.includes(slotName)) {
        return prevSlots.filter((slot) => slot !== slotName);
      } else {
        return [...prevSlots, slotName];
      }
    });
  };

  const handlePreview = () => {
    if (!selectedCategory || selectedSlots.length === 0 || !mobileImage || !desktopImage) {
      toast.error('Please fill in all required fields');
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedCategory || selectedSlots.length === 0 || !mobileImage || !desktopImage) {
        toast.error('Please fill in all required fields');
        return;
      }

      const selectedCat = categoriesData?.getCategoriesWithAvailableSlots?.find(
        (cat) => cat.id === selectedCategory
      );

      if (!selectedCat) {
        toast.error('Category not found');
        return;
      }

      // Create media objects for each selected slot
      const medias = selectedSlots.map((slot) => ({
        slot,
        media_type: 'both', // banner and stamp
        mobile_image_url: mobileImage,
        mobile_redirect_url: mobileRedirectUrl,
        desktop_image_url: desktopImage,
        desktop_redirect_url: desktopRedirectUrl,
      }));

      const result = await createCategoryRequest({
        variables: {
          input: {
            category_id: selectedCategory,
            medias,
            duration_days: selectedDuration,
            start_preference: startPreference,
          },
        },
      });

      if (result.data) {
        // Success handled in onSuccess callback
      }
    } catch (error) {
      console.error('Error submitting advertisement:', error);
      toast.error(error.message || 'Failed to submit advertisement');
    }
  };

  const selectedCategoryData = categoriesData?.getCategoriesWithAvailableSlots?.find(
    (cat) => cat.id === selectedCategory
  );

  const getSlotDisplayName = (slot) => {
    const parts = slot.split('_');
    const slotType = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const slotNumber = parts[1];
    return `${slotType} #${slotNumber}`;
  };

  const renderCategoryStep = () => {
    if (categoriesLoading) {
      return (
        <div className='text-center'>
          <Spinner animation='border' role='status' className='me-2' />
          <span className='text-muted'>Loading categories...</span>
        </div>
      );
    }
    if (categoriesError) {
      return <Alert variant='danger'>Failed to load categories</Alert>;
    }
    
    let categories = categoriesData?.getCategoriesWithAvailableSlots || [];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      categories = categories.filter(cat =>
        cat.name && cat.name.toLowerCase().includes(lower)
      );
    }
    return (
      <div>
        <div className='mb-3'>
          <input
            type='text'
            className='form-control'
            placeholder='Search categories...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Row className='g-2'>
          {categories.map((category) => (
            <Col key={category.id} md={6} lg={4}>
              <Card
                className={`cursor-pointer transition-all ${selectedCategory === category.id ? 'border-primary shadow-sm' : 'border-light shadow-xs'}`}
                onClick={() => handleCategoryChange(category.id)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '10px',
                  border: selectedCategory === category.id ? '2px solid #0d6efd' : '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  minHeight: 'auto',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {category.image && (
                  <Card.Img
                    variant='top'
                    src={category.image}
                    style={{ height: '120px', objectFit: 'cover', borderRadius: '10px 10px 0 0' }}
                  />
                )}
                <Card.Body style={{ padding: '0.75rem' }}>
                  <Card.Title className='fw-bold mb-2' style={{ fontSize: '0.95rem', color: '#333', marginBottom: '0.5rem !important' }}>
                    {category.name}
                  </Card.Title>
                  <small className='text-muted d-block mb-2' style={{ lineHeight: '1.3', fontSize: '0.75rem' }}>
                    {category.description}
                  </small>
                  <div className='d-flex gap-1 mb-2' style={{ flexWrap: 'wrap' }}>
                    <span
                      className='badge'
                      style={{
                        backgroundColor: '#28a745',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      ✓ {category.availableSlots}/8
                    </span>
                    <span
                      className='badge'
                      style={{
                        backgroundColor: '#17a2b8',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {category.tierId?.name || 'Tier'}
                    </span>
                  </div>
                  {/* slot statuses list - compact */}
                  {category.slotStatuses && category.slotStatuses.length > 0 && (
                    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <ul className='list-unstyled mb-0' style={{ margin: 0, fontSize: '0.75rem' }}>
                        {category.slotStatuses.map((s) => (
                          <li
                            key={s.slot}
                            style={{
                              color: s.available ? '#28a745' : '#dc3545',
                              fontWeight: '500',
                              lineHeight: '1.3',
                              paddingBottom: '2px',
                            }}
                          >
                            <span style={{ marginRight: '3px' }}>{s.available ? '✓' : '✕'}</span>
                            {getSlotDisplayName(s.slot).split(' ').slice(0, 2).join(' ')}: {s.available ? 'free' : new Date(s.freeDate).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderPricingStep = () => {
    if (pricingLoading) {
      return (
        <div className='text-center'>
          <Spinner animation='border' role='status' className='me-2' />
          <span className='text-muted'>Loading pricing...</span>
        </div>
      );
    }
    if (pricingError) {
      return <Alert variant='danger'>Failed to load pricing</Alert>;
    }

    const pricing = pricingData?.getCategoryPricing;
    if (!pricing) {
      return <Alert variant='warning'>No pricing available</Alert>;
    }

    // Get the first selected ad type (banner or stamp) for the breakdown preview
    const selectedAdType = selectedSlots.length > 0 ? selectedSlots[0].split('_')[0] : 'banner';
    const preview = computePricingPreview(selectedAdType);
    return (
      <div>
        <div className='mb-3'>
          <h6 className='mb-2'>Select Duration:</h6>
          <div className='d-flex gap-2 mb-2'>
            {[
              { value: 90, label: '90 Days' },
              { value: 180, label: '180 Days' },
              { value: 365, label: '365 Days' },
            ].map((option) => (
              <Button
                key={option.value}
                size='sm'
                variant={selectedDuration === option.value ? 'primary' : 'outline-primary'}
                onClick={() => handleDurationChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          <div className='d-flex align-items-center gap-2'>
            <small className='text-muted'>Start From:</small>
            <Button size='sm' variant={startPreference === 'today' ? 'primary' : 'outline-secondary'} onClick={() => setStartPreference('today')}>Today</Button>
            <Button size='sm' variant={startPreference === 'next_quarter' ? 'primary' : 'outline-secondary'} onClick={() => setStartPreference('next_quarter')}>Next Quarter</Button>
          </div>
        </div>

        <div>
          <h6 className='mb-3'>Pricing Details:</h6>
          <table className='table table-sm'>
            <thead>
              <tr>
                <th>Ad Type</th>
                <th>Base Duration</th>
                <th>Base Price</th>
                <th>/Day</th>
                <th>Price ({selectedDuration}d)</th>
              </tr>
            </thead>
            <tbody>
              {pricing.adCategories?.map((category) => {
                const { ad_type: adType = 'unknown', duration_days: durationDays = 30, price: basePrice = 0 } = category || {};
                const baseDuration = durationDays;
                const ratePerDay = Math.round((basePrice / baseDuration) * 100) / 100;
                const priceForSelected = Math.round(ratePerDay * selectedDuration);
                const isSelectedType = selectedSlots.some(s => s.startsWith(adType));
                return (
                  <tr key={category.id} className={isSelectedType ? 'table-active' : ''}>
                    <td><strong>{adType.charAt(0).toUpperCase() + adType.slice(1)}</strong></td>
                    <td>{baseDuration} days</td>
                    <td>₹{basePrice}</td>
                    <td>₹{ratePerDay}</td>
                    <td><strong>₹{priceForSelected}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {preview && (
            <Card className='mt-3'>
              <Card.Body>
                {/* Show the pricing data being used */}
                <div className='mb-3 p-2' style={{ backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Pricing Used:</strong> {selectedAdType.charAt(0).toUpperCase() + selectedAdType.slice(1)}
                  </div>
                  {(() => {
                    let adCat = null;
                    if (pricing?.adCategories && pricing.adCategories.length > 0) {
                      adCat = pricing.adCategories.find(ac => ac.ad_type === selectedAdType && ac.duration_days === selectedDuration);
                      if (!adCat) {
                        adCat = pricing.adCategories.find(ac => ac.ad_type === selectedAdType);
                      }
                      if (!adCat) {
                        const [firstCategory] = pricing.adCategories;
                        adCat = firstCategory;
                      }
                    }
                    if (adCat) {
                      const { duration_days: baseDays = 30, price: basePrice = 0 } = adCat;
                      const ratePerDay = Math.round((basePrice / baseDays) * 100) / 100;
                      return (
                        <div>
                          <span>₹{basePrice} ÷ {baseDays} days = <strong>₹{ratePerDay} per day</strong></span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className='d-flex justify-content-between align-items-center mb-2'>
                  <div>
                    <strong>Start:</strong> {preview.startDate.toLocaleDateString()} &nbsp; <strong>End:</strong> {preview.endDate.toLocaleDateString()}
                  </div>
                  <div><strong>Total:</strong> ₹{preview.total}</div>
                </div>
                <ul className='mb-0' style={{ fontSize: '0.9rem' }}>
                  {preview.breakdown.map((b, i) => (
                    <li key={i} className='py-1'>
                      <strong>{b.quarter}:</strong> {b.days} days × ₹{b.rate_per_day} = ₹{b.subtotal}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderSlotSelectionStep = () => {
    if (!selectedCategoryData) {
      return <Alert variant='warning'>Please select a category first</Alert>;
    }

    // create a map of slot -> status so it’s easy to look up
    const slotMap = {};
    (selectedCategoryData.slotStatuses || []).forEach((s) => {
      slotMap[s.slot] = s;
    });

    const bannerSlots = ['banner_1', 'banner_2', 'banner_3', 'banner_4'];
    const stampSlots = ['stamp_1', 'stamp_2', 'stamp_3', 'stamp_4'];

    const availableBanner = bannerSlots.filter((s) => slotMap[s]?.available).length;
    const availableStamp = stampSlots.filter((s) => slotMap[s]?.available).length;

    return (
      <div>
        <Alert variant='info'>
          Available Slots: {selectedCategoryData.availableSlots}/{selectedCategoryData.bookedSlots + selectedCategoryData.availableSlots}
        </Alert>

        {/* legend */}
        <div className='mb-2'>
          <small>
            <span className='badge bg-success me-1'>free</span>
            <span className='badge bg-danger'>booked</span>
          </small>
        </div>
        {/* visual badge summary */}
        <div className='d-flex flex-wrap mb-3'>
          {[...bannerSlots, ...stampSlots].map((slot) => {
            const s = slotMap[slot] || { available: true };
            return (
              <span
                key={slot}
                className={`badge me-1 mb-1 ${s.available ? 'bg-success' : 'bg-danger'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {getSlotDisplayName(slot)}
              </span>
            );
          })}
        </div>

        <div className='mb-4'>
          <h6 className='mb-3'>Banner Slots (Available: {availableBanner})</h6>
          <Row className='g-2'>
            {bannerSlots.map((slot) => {
              const status = slotMap[slot] || { available: true, freeDate: null };
              const disabled = !status.available;
              let variant;
              if (!status.available) {
                variant = 'outline-danger';
              } else if (selectedSlots.includes(slot)) {
                variant = 'primary';
              } else {
                variant = 'outline-success';
              }
              let label = getSlotDisplayName(slot);
              if (!status.available) {
                const until = status.freeDate ? new Date(status.freeDate).toLocaleDateString() : 'unknown';
                label += ` (booked until ${until})`;
              }
              return (
                <Col key={slot} xs={6} sm={4} md={3}>
                  <Button
                    variant={variant}
                    className='w-100'
                    onClick={() => handleSlotToggle(slot)}
                    disabled={disabled}
                  >
                    {label}
                  </Button>
                </Col>
              );
            })}
          </Row>
        </div>

        <div>
          <h6 className='mb-3'>Stamp Slots (Available: {availableStamp})</h6>
          <Row className='g-2'>
            {stampSlots.map((slot) => {
              const status = slotMap[slot] || { available: true, freeDate: null };
              const disabled = !status.available;
              let variant;
              if (!status.available) {
                variant = 'outline-danger';
              } else if (selectedSlots.includes(slot)) {
                variant = 'primary';
              } else {
                variant = 'outline-success';
              }
              let label = getSlotDisplayName(slot);
              if (!status.available) {
                const until = status.freeDate ? new Date(status.freeDate).toLocaleDateString() : 'unknown';
                label += ` (booked until ${until})`;
              }
              return (
                <Col key={slot} xs={6} sm={4} md={3}>
                  <Button
                    variant={variant}
                    className='w-100'
                    onClick={() => handleSlotToggle(slot)}
                    disabled={disabled}
                  >
                    {label}
                  </Button>
                </Col>
              );
            })}
          </Row>
        </div>

        <div className='mt-4'>
          <Alert variant='success'>
            Selected Slots: {selectedSlots.length > 0 ? selectedSlots.map((s) => getSlotDisplayName(s)).join(', ') : 'None'}
          </Alert>
        </div>
      </div>
    );
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className='container-xl'>
        <Row className='mb-3'>
          <Col>
            <div className='page-title-container'>
              <h1 className='mb-0 pb-0 display-4'>{title}</h1>
              <div className='text-muted fs-base'>{description}</div>
            </div>
          </Col>
        </Row>

        {showPreview ? (
          <PreviewSection
            category={selectedCategoryData}
            slots={selectedSlots.map((s) => getSlotDisplayName(s)).join(', ')}
            duration={selectedDuration}
            pricing={pricingData?.getCategoryPricing}
            mobileImage={mobileImage}
            desktopImage={desktopImage}
            mobileRedirectUrl={mobileRedirectUrl}
            desktopRedirectUrl={desktopRedirectUrl}
            onEdit={() => setShowPreview(false)}
            onSubmit={handleSubmit}
            submitting={submitLoading}
          />
        ) : (
          <div>
            {/* Step 1: Category Selection with Available Slots */}
            <Card className='mb-4'>
              <Card.Header>
                <Card.Title className='mb-0'>
                  <span className='badge badge-primary me-2'>1</span>
                  Select Product Category
                </Card.Title>
              </Card.Header>
              <Card.Body>
                {renderCategoryStep()}
              </Card.Body>
            </Card>

            {/* Step 2: View Pricing & Select Duration */}
            {selectedCategory && (
              <Card className='mb-4'>
                <Card.Header>
                  <Card.Title className='mb-0'>
                    <span className='badge badge-primary me-2'>2</span>
                    View Pricing & Select Duration
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  {renderPricingStep()}
                </Card.Body>
              </Card>
            )}

            {/* Step 3: Slot Selection */}
            {selectedCategory && (
              <Card className='mb-4'>
                <Card.Header>
                  <Card.Title className='mb-0'>
                    <span className='badge badge-primary me-2'>3</span>
                    Select Available Slots (Banner & Stamp)
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  {renderSlotSelectionStep()}
                </Card.Body>
              </Card>
            )}

            {/* Step 4: Image Upload */}
            {selectedSlots.length > 0 && (
              <Card className='mb-4'>
                <Card.Header>
                  <Card.Title className='mb-0'>
                    <span className='badge badge-primary me-2'>4</span>
                    Upload Advertisement Images
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <ImageUpload
                    mobileImage={mobileImage}
                    desktopImage={desktopImage}
                    mobileRedirectUrl={mobileRedirectUrl}
                    desktopRedirectUrl={desktopRedirectUrl}
                    onMobileImageChange={setMobileImage}
                    onDesktopImageChange={setDesktopImage}
                    onMobileRedirectUrlChange={setMobileRedirectUrl}
                    onDesktopRedirectUrlChange={setDesktopRedirectUrl}
                  />
                </Card.Body>
              </Card>
            )}

            {/* Selected Slots Summary */}
            {selectedSlots.length > 0 && (
              <Card className='mb-4 border-success'>
                <Card.Header>
                  <Card.Title className='mb-0'>
                    <span className='badge badge-success me-2'>✓</span>
                    Selected Slots Summary ({selectedDuration} Days)
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className='row'>
                    {(() => {
                      const counts = { banner: 0, stamp: 0 };
                      selectedSlots.forEach(s => {
                        const type = s.split('_')[0];
                        if (type === 'banner' || type === 'stamp') counts[type] += 1;
                      });

                      const bannerPrice = counts.banner > 0 ? computePricingPreviewByType('banner')?.total : 0;
                      const stampPrice = counts.stamp > 0 ? computePricingPreviewByType('stamp')?.total : 0;
                      const totalPrice = (bannerPrice * counts.banner) + (stampPrice * counts.stamp);

                      return (
                        <>
                          {counts.banner > 0 && (
                            <div className='col-md-4'>
                              <div className='card' style={{ backgroundColor: '#f8f9fa', borderColor: '#dee2e6' }}>
                                <div className='card-body'>
                                  <div className='text-muted small'>Banners Selected</div>
                                  <div className='h6 mt-2'>{counts.banner} × ₹{bannerPrice}</div>
                                  <div className='h5 mt-2' style={{ color: '#17a2b8' }}>₹{Math.round(bannerPrice * counts.banner)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          {counts.stamp > 0 && (
                            <div className='col-md-4'>
                              <div className='card' style={{ backgroundColor: '#f8f9fa', borderColor: '#dee2e6' }}>
                                <div className='card-body'>
                                  <div className='text-muted small'>Stamps Selected</div>
                                  <div className='h6 mt-2'>{counts.stamp} × ₹{stampPrice}</div>
                                  <div className='h5 mt-2' style={{ color: '#28a745' }}>₹{Math.round(stampPrice * counts.stamp)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className='col-md-4'>
                            <div className='card' style={{ backgroundColor: '#e7f3ff', borderColor: '#0d6efd', borderWidth: '2px' }}>
                              <div className='card-body'>
                                <div className='text-muted small'>Total Cost</div>
                                <div className='h4 mt-2 fw-bold' style={{ color: '#0d6efd' }}>₹{Math.round(totalPrice)}</div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Action Buttons */}
            {selectedSlots.length > 0 && mobileImage && desktopImage && (
              <Card>
                <Card.Body className='text-end'>
                  <Button
                    variant='outline-secondary'
                    className='me-2'
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedDuration(30);
                      setSelectedSlots([]);
                      setMobileImage(null);
                      setDesktopImage(null);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant='primary'
                    onClick={handlePreview}
                    disabled={submitLoading}
                  >
                    Preview & Submit
                  </Button>
                </Card.Body>
              </Card>
            )}
          </div>
        )}
      </div>

      <SuccessModal
        show={showSuccessModal}
        categoryName={submittedCategoryName}
        onClose={() => setShowSuccessModal(false)}
      />
    </>
  );
};

export default Advertisement;
