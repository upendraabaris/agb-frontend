import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Button, Row, Col, Alert, Spinner, Modal, ProgressBar } from 'react-bootstrap';
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
      parent
      availableSlots
      bookedSlots
      bookedBanner
      bookedStamp
      slotStatuses {
        slot
        available
        freeDate
      }
      tierId {
        id
        name
      }
      pricing90 {
        ad_type
        price
      }
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
      }
    }
  }
`;

// Get seller's products for internal URL selection
const GET_SELLER_PRODUCTS = gql`
  query GetSellerProducts {
    getProductByForSeller(limit: 100) {
      id
      previewName
      fullName
      identifier
      thumbnail
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
  const history = useHistory();
  
  // Tab state for category selection
  const [categoryTab, setCategoryTab] = useState('category'); // 'category', 'subcategory', 'subsubcategory'

  // Queries
  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES_WITH_SLOTS);
  
  // Get seller's products for internal URL dropdown
  const { data: sellerProductsData } = useQuery(GET_SELLER_PRODUCTS);
  const sellerProducts = sellerProductsData?.getProductByForSeller || [];

  // Build category hierarchy based on parent field
  const allCategories = categoriesData?.getCategoriesWithAvailableSlots || [];
  
  // Create a map for quick parent lookup
  const categoryMap = {};
  allCategories.forEach(cat => {
    categoryMap[cat.id] = cat;
  });

  // Filter categories by level:
  // - Top-level (Category): parent is null
  // - SubCategory: parent exists and parent's parent is null
  // - SubSubCategory: parent exists and parent's parent also exists
  const topLevelCategories = allCategories.filter(cat => !cat.parent);
  const subCategories = allCategories.filter(cat => {
    if (!cat.parent) return false;
    const parentCat = categoryMap[cat.parent];
    return parentCat && !parentCat.parent;
  });
  const subSubCategories = allCategories.filter(cat => {
    if (!cat.parent) return false;
    const parentCat = categoryMap[cat.parent];
    return parentCat && parentCat.parent;
  });

  const title = 'Submit Advertisement';
  const description = 'Submit your advertisement to available slots';

  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(90);
  const [startPreference, setStartPreference] = useState('today');
  const [selectedSlots, setSelectedSlots] = useState([]);
  // media & url details per-slot (keyed by slot name)
  const [slotMedia, setSlotMedia] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedCategoryName, setSubmittedCategoryName] = useState('');
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [currentWizardStep, setCurrentWizardStep] = useState(1);

  const { data: pricingData, loading: pricingLoading, error: pricingError } = useQuery(
    GET_CATEGORY_PRICING,
    {
      variables: { categoryId: selectedCategory },
      skip: !selectedCategory,
    }
  );

  const [createCategoryRequest, { loading: submitLoading }] = useMutation(CREATE_CATEGORY_REQUEST, {
    onCompleted: (data) => {
      console.log('[Advertisement] Mutation completed:', data);
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
      setSlotMedia({});
    },
    onError: (error) => {
      console.error('[Advertisement] Mutation error:', error);
      if (error.message === 'Authorization header is missing' || error.message === 'jwt expired') {
        toast.error('Please login to submit advertisement');
        setTimeout(() => {
          history.push('/login');
        }, 2000);
      } else {
        toast.error(error.message || 'Failed to submit advertisement');
      }
    },
  });

  // Handle errors
  React.useEffect(() => {
    console.log('Categories Data:', categoriesData);
    console.log('Categories Error:', categoriesError);
    console.log('Categories Loading:', categoriesLoading);
    
    if (categoriesError) {
      console.error('Categories Error:', categoriesError);
      toast.error('Failed to load categories');
    }
    if (pricingError) {
      console.error('Pricing Error:', pricingError);
      toast.error('Failed to load pricing');
    }
  }, [categoriesError, pricingError, categoriesData, categoriesLoading]);

  // Derived selected category data (define before handlers)
  const selectedCategoryData = categoriesData?.getCategoriesWithAvailableSlots?.find(
    (cat) => cat.id === selectedCategory
  );

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSlots([]);
    setSlotMedia({});
    setShowWizardModal(true);
    setCurrentWizardStep(1);
  };

  const handleWizardNext = () => {
    if (currentWizardStep < 4) {
      setCurrentWizardStep(currentWizardStep + 1);
    }
  };

  const handleWizardPrevious = () => {
    if (currentWizardStep > 1) {
      setCurrentWizardStep(currentWizardStep - 1);
    }
  };

  const handleWizardClose = () => {
    setShowWizardModal(false);
    setCurrentWizardStep(1);
    setSelectedCategory('');
    setSelectedDuration(90);
    setStartPreference('today');
    setSelectedSlots([]);
    setSlotMedia({});
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
  };

  const handleSlotToggle = (slotName) => {
    // prevent selecting a slot that's already booked for this category
    const slotStatus = selectedCategoryData?.slotStatuses?.find(s => s.slot === slotName);
    if (slotStatus && !slotStatus.available) {
      toast.error('This slot is already booked');
      return;
    }
    setSelectedSlots((prevSlots) => {
      if (prevSlots.includes(slotName)) {
        const updated = prevSlots.filter((slot) => slot !== slotName);
        setSlotMedia((m) => {
          const copy = { ...m };
          delete copy[slotName];
          return copy;
        });
        return updated;
      }
      // new slot, initialize media entry
      setSlotMedia((m) => ({
        ...m,
        [slotName]: { mobileImage: '', desktopImage: '', redirectUrl: '' },
      }));
      return [...prevSlots, slotName];
    });
  };

  const handlePreview = () => {
    if (!selectedCategory || selectedSlots.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    // ensure each selected slot has at least one image uploaded
    const missing = selectedSlots.some(slot => {
      const media = slotMedia[slot] || {};
      return !media.mobileImage && !media.desktopImage;
    });
    if (missing) {
      toast.error('Please upload at least one image for each selected slot');
      return;
    }
    setShowPreview(true);
  };

  // FRONTEND helper functions for pricing preview (mirrors backend logic)
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
    const year = date.getUTCFullYear();
    if (m >= 1 && m <= 3) return `Q1 ${year}`;
    if (m >= 4 && m <= 6) return `Q2 ${year}`;
    if (m >= 7 && m <= 9) return `Q3 ${year}`;
    return `Q4 ${year}`;
  };

  const getQuarterEnd = (date) => {
    const m = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    if (m >= 1 && m <= 3) return new Date(Date.UTC(year, 2, 31, 23,59,59,999));
    if (m >= 4 && m <= 6) return new Date(Date.UTC(year, 5, 30, 23,59,59,999));
    if (m >= 7 && m <= 9) return new Date(Date.UTC(year, 8, 30, 23,59,59,999));
    return new Date(Date.UTC(year, 11, 31, 23,59,59,999));
  };

  const splitIntervalByQuarter = (startDate, totalDays) => {
    const segments = [];
    let remaining = totalDays;
    // Normalize to UTC midnight to avoid timezone issues
    let cursor = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
    while (remaining > 0) {
      const qEnd = getQuarterEnd(cursor);
      const msPerDay = 24 * 60 * 60 * 1000;
      const diff = Math.floor((Date.UTC(qEnd.getUTCFullYear(), qEnd.getUTCMonth(), qEnd.getUTCDate()) - Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate())) / msPerDay) + 1;
      const take = Math.min(remaining, diff);
      const segmentEnd = addDays(cursor, take - 1);
      segments.push({ 
        quarter: getQuarterLabel(cursor), 
        start: new Date(cursor), 
        end: segmentEnd,
        days: take 
      });
      cursor = addDays(cursor, take);
      remaining -= take;
    }
    return segments;
  };

  // compute pricing preview for a specific ad type (banner/stamp)
  // Logic: If starting today, first fill current quarter remaining days, then add full selected duration from next quarter
  const computePricingPreview = (adType = 'banner') => {
    const pricing = pricingData?.getCategoryPricing;
    if (!pricing) return null;
    
    const today = new Date();
    const segments = [];
    
    if (startPreference === 'next_quarter') {
      // Simple case: start from next quarter with full duration
      const nextQStart = getNextQuarterStart(today);
      const segs = splitIntervalByQuarter(nextQStart, selectedDuration);
      segments.push(...segs);
    } else {
      // Complex case: current quarter remaining + full duration from next quarter
      const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const currentQEnd = getQuarterEnd(todayUTC);
      const msPerDay = 24 * 60 * 60 * 1000;
      const remainingInCurrentQ = Math.floor((Date.UTC(currentQEnd.getUTCFullYear(), currentQEnd.getUTCMonth(), currentQEnd.getUTCDate()) - Date.UTC(todayUTC.getUTCFullYear(), todayUTC.getUTCMonth(), todayUTC.getUTCDate())) / msPerDay) + 1;
      
      // First segment: remaining days in current quarter
      segments.push({
        quarter: getQuarterLabel(todayUTC),
        start: new Date(todayUTC),
        end: new Date(currentQEnd),
        days: remainingInCurrentQ
      });
      
      // Second segment: full selected duration from next quarter start
      const nextQStart = getNextQuarterStart(todayUTC);
      const nextQSegs = splitIntervalByQuarter(nextQStart, selectedDuration);
      segments.push(...nextQSegs);
    }

    // find adCategory: first try exact duration match, then match by type with closest duration, fallback to first
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
    const breakdown = segments.map(s => ({ 
      quarter: s.quarter, 
      start: s.start,
      end: s.end,
      days: s.days, 
      rate_per_day: ratePerDay, 
      subtotal: Math.round(ratePerDay * s.days) 
    }));
    const total = breakdown.reduce((sum, b) => sum + b.subtotal, 0);
    const totalDays = segments.reduce((sum, s) => sum + s.days, 0);
    const startDate = segments[0]?.start || today;
    const endDate = segments[segments.length - 1]?.end || today;
    return { startDate, endDate, breakdown, total, totalDays };
  };

  // compute total price for selected slots (sums per-slot pricing using adType)
  const computeTotalForSelectedSlots = () => {
    if (!selectedSlots || selectedSlots.length === 0) return 0;
    let sum = 0;
    // count slots per ad type
    const counts = { banner: 0, stamp: 0 };
    selectedSlots.forEach(s => {
      const type = s.split('_')[0];
      if (type === 'banner' || type === 'stamp') counts[type] += 1;
    });
    if (counts.banner > 0) {
      const p = computePricingPreview('banner');
      if (p) sum += p.total * counts.banner;
    }
    if (counts.stamp > 0) {
      const p = computePricingPreview('stamp');
      if (p) sum += p.total * counts.stamp;
    }
    return sum;
  };

  const handleSubmit = async () => {
    try {
      if (!selectedCategory || selectedSlots.length === 0) {
        toast.error('Please fill in all required fields');
        return;
      }
      const missing = selectedSlots.some(slot => {
        const media = slotMedia[slot] || {};
        return !media.mobileImage && !media.desktopImage;
      });
      if (missing) {
        toast.error('Please upload at least one image for each selected slot');
        return;
      }

      const selectedCat = categoriesData?.getCategoriesWithAvailableSlots?.find(
        (cat) => cat.id === selectedCategory
      );

      if (!selectedCat) {
        toast.error('Category not found');
        return;
      }

      if (!selectedCat.tierId || !selectedCat.tierId.id) {
        toast.error('Selected category is not mapped to an ad tier. Please contact admin.');
        return;
      }

      if (selectedCat.availableSlots < selectedSlots.length) {
        toast.error('Not enough available slots for this selection');
        return;
      }

      // Create media objects for each selected slot (pick per-type images)
      const medias = selectedSlots.map((slot) => {
        const media = slotMedia[slot] || {};
        return {
          slot,
          media_type: 'both',
          mobile_image_url: media.mobileImage || '',
          desktop_image_url: media.desktopImage || '',
          redirect_url: media.redirectUrl || '',
          url_type: media.urlType || 'external',
        };
      });

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

  

  const getSlotDisplayName = (slot) => {
    const parts = slot.split('_');
    const slotType = parts[0].charAt(0).toUpperCase() + parts[0].slice(1); // Banner/Stamp
    const slotNumber = parts[1];
    return `${slotType} #${slotNumber}`;
  };

  const getSlotCompactName = (slot) => {
    // Format: banner_1 → B1, stamp_2 → S2
    const parts = slot.split('_');
    const prefix = parts[0].charAt(0).toUpperCase(); // B or S
    const number = parts[1];
    return `${prefix}${number}`;
  };

  const renderCategoryContent = (categories, allCategoriesCount) => {
    if (allCategoriesCount === 0) {
      return (
        <Alert variant='warning'>
          No categories with tiers assigned. Please contact admin to set up ad tiers for categories.
        </Alert>
      );
    }
    if (categories.length === 0) {
      return (
        <Alert variant='info'>
          No categories found matching "{searchTerm}". Try a different search term.
        </Alert>
      );
    }
    return (
      <Row className='g-2'>
        {categories && categories.filter(cat => cat && cat.id).map((category) => (
          <Col key={category?.id} md={6} lg={4}>
            <Card
              className={`cursor-pointer transition-all ${selectedCategory === category?.id ? 'border-primary shadow-sm' : 'border-light shadow-xs'}`}
              onClick={() => handleCategoryChange(category?.id)}
              style={{
                cursor: 'pointer',
                borderRadius: '10px',
                border: selectedCategory === category?.id ? '2px solid #0d6efd' : '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                minHeight: 'auto',
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category?.id) {
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category?.id) {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <Card.Body style={{ padding: '0.75rem' }}>
                <div className='d-flex gap-1 mb-2' style={{ flexWrap: 'wrap' }}>
                <Card.Title className='fw-bold mb-2' style={{ fontSize: '0.95rem', color: '#333', marginBottom: '0.5rem !important' }}>
                  {category?.name || 'Unnamed'}
                </Card.Title>
                  <div className='d-flex ml-auto gap-1' style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                  <span
                    className='badge'
                    style={{
                      backgroundColor: '#28a745',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    ✓ {category?.availableSlots || 0}/8
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
                    {category?.tierId?.name || 'Tier'}
                  </span>
                  </div>
                  {category.pricing90 && category.pricing90.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px' }}>
                      {category.pricing90.map(p => `${p.ad_type.charAt(0).toUpperCase() + p.ad_type.slice(1)} ₹${p.price}/90d`).join(' | ')}
                    </div>
                  )}
                </div>
                {/* slot statuses - 2 column layout (banners left, stamps right) */}
                {category.slotStatuses && category.slotStatuses.length > 0 && (
                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <div className='row g-0'>
                      <div className='col-6' style={{ paddingRight: '0.25rem' }}>
                        <strong style={{ fontSize: '0.7rem', color: '#555' }}>Banners</strong>
                        <ul className='list-unstyled mb-0' style={{ margin: 0, fontSize: '0.7rem' }}>
                          {category.slotStatuses.filter(s => s.slot.startsWith('banner')).map((s) => (
                            <li key={s.slot} style={{ color: s.available ? '#28a745' : '#dc3545', fontWeight: '500', lineHeight: '1.2', paddingBottom: '1px' }}>
                              <span style={{ marginRight: '2px' }}>{s.available ? '✓' : '✕'}</span>
                              {getSlotCompactName(s.slot)}: {s.available ? 'Available' : `Aft ${new Date(s.freeDate).toLocaleDateString('en-IN')}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className='col-6' style={{ paddingLeft: '0.25rem' }}>
                        <strong style={{ fontSize: '0.7rem', color: '#555' }}>Stamps</strong>
                        <ul className='list-unstyled mb-0' style={{ margin: 0, fontSize: '0.7rem' }}>
                          {category.slotStatuses.filter(s => s.slot.startsWith('stamp')).map((s) => (
                            <li key={s.slot} style={{ color: s.available ? '#28a745' : '#dc3545', fontWeight: '500', lineHeight: '1.2', paddingBottom: '1px' }}>
                              <span style={{ marginRight: '2px' }}>{s.available ? '✓' : '✕'}</span>
                              {getSlotCompactName(s.slot)}: {s.available ? 'Available' : `Aft ${new Date(s.freeDate).toLocaleDateString('en-IN')}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
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
      console.error('Error details:', categoriesError);
      return (
        <Alert variant='danger'>
          Failed to load categories: {categoriesError?.message || 'Unknown error'}
        </Alert>
      );
    }
    
    // Tab bar UI
    const tabOptions = [
      { key: 'category', label: 'Category' },
      { key: 'subcategory', label: 'Sub Category' },
      { key: 'subsubcategory', label: 'Sub Sub Category' },
    ];

    let list = [];
    let allCount = 0;
    if (categoryTab === 'category') {
      list = topLevelCategories;
      allCount = list.length;
    } else if (categoryTab === 'subcategory') {
      list = subCategories;
      allCount = list.length;
    } else if (categoryTab === 'subsubcategory') {
      list = subSubCategories;
      allCount = list.length;
    }

    if (searchTerm) {
      list = list.filter(cat => cat.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return (
      <div>
        {/* Tab bar */}
        <div className='mb-3 d-flex'>
          {tabOptions.map(tab => (
            <button
              key={tab.key}
              type='button'
              className={`btn btn-sm ${categoryTab === tab.key ? 'btn-primary' : 'btn-outline-secondary'} me-2`}
              style={{ minWidth: 120 }}
              onClick={() => setCategoryTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className='mb-3'>
          <input
            type='text'
            className='form-control'
            placeholder={`Search ${tabOptions.find(t => t.key === categoryTab)?.label}...`}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {renderCategoryContent(list, allCount)}
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
      return (
        <Alert variant='danger'>
          Failed to load pricing: {pricingError?.message || 'Unknown error'}
        </Alert>
      );
    }

    const pricing = pricingData?.getCategoryPricing;
    if (!pricing) {
      return <Alert variant='warning'>No pricing available for this category</Alert>;
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
              { value: 360, label: '360 Days' },
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
          <h6 className='mb-3'>Pricing Details (Tier: {pricing?.tierName || 'Unknown'}):</h6>
          {pricing?.adCategories && pricing.adCategories.length > 0 ? (
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
                  {pricing.adCategories
                    .filter(category => {
                      const { duration_days: durationDays = 30 } = category || {};
                      return durationDays === selectedDuration;
                    })
                    .map((category) => {
                      const { ad_type: adType = 'unknown', duration_days: durationDays = 30, price: basePrice = 0 } = category || {};
                      const baseDuration = durationDays;
                      const ratePerDay = Math.round((basePrice / baseDuration) * 100) / 100;
                      const computedPrice = Math.round(ratePerDay * selectedDuration);
                      const isSelectedType = selectedSlots.some(s => s.startsWith(adType));
                      return (
                      <tr key={category?.id || `${adType}-${Math.random()}`} className={isSelectedType ? 'table-active' : ''}>
                        <td><strong>{adType.charAt(0).toUpperCase() + adType.slice(1)}</strong></td>
                        <td>{baseDuration} days</td>
                        <td>₹{basePrice}</td>
                        <td>₹{ratePerDay}</td>
                        <td><strong>₹{computedPrice}</strong></td>
                      </tr>
                    )})}
                </tbody>
            </table>
          ) : (
            <Alert variant='info'>No pricing tiers configured for this category</Alert>
          )}

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
                    {preview.totalDays && <span className='ms-2 text-muted'>({preview.totalDays} days total)</span>}
                  </div>
                  <div><strong>Total:</strong> ₹{preview.total}</div>
                </div>
                <ul className='mb-0' style={{ fontSize: '0.9rem' }}>
                  {preview.breakdown.map((b, i) => (
                    <li key={i} className='py-1'>
                      <strong>{b.quarter}</strong> ({b.start?.toLocaleDateString()} - {b.end?.toLocaleDateString()}): {b.days} days × ₹{b.rate_per_day} = ₹{b.subtotal}
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
      return (
        <Alert variant='warning'>
          Please select a category first to see available slots
        </Alert>
      );
    }

    if (!selectedCategoryData.tierId) {
      return (
        <Alert variant='danger'>
          Selected category is not mapped to an ad tier. Please contact admin.
        </Alert>
      );
    }

    // map slots to their status for easy lookup
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
          Available Slots: {selectedCategoryData.availableSlots || 0}/{(selectedCategoryData.bookedSlots || 0) + (selectedCategoryData.availableSlots || 0)}
        </Alert>

        {/* legend */}
        <div className='mb-2'>
          <small>
            <span className='badge bg-success me-1'>free</span>
            <span className='badge bg-danger'>booked</span>
          </small>
        </div>
        {/* visual summary grid */}
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
              // append price for this slot type
              try {
                const type = slot.split('_')[0];
                const priceForType = computePricingPreview(type)?.total;
                if (priceForType) {
                  label += ` - ₹${priceForType}`;
                }
              } catch (e) {
                console.error('Error computing price for slot:', e);
              }
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
              // append price
              try {
                const type = slot.split('_')[0];
                const priceForType = computePricingPreview(type)?.total;
                if (priceForType) {
                  label += ` - ₹${priceForType}`;
                }
              } catch (e) {
                console.error('Error computing price for slot:', e);
              }
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
          <Alert variant={selectedSlots.length > 0 ? 'success' : 'secondary'}>
            Selected Slots: {selectedSlots.length > 0 ? selectedSlots.map((s) => getSlotDisplayName(s)).join(', ') : 'None'}
          </Alert>
        </div>
      </div>
    );
  };

  const renderWizardStepContent = () => {
    switch (currentWizardStep) {
      case 1:
        return (
          <div>
            <h5 className='mb-3'>Select Duration & Start Preference</h5>
            {renderPricingStep()}
          </div>
        );
      case 2:
        return (
          <div>
            <h5 className='mb-3'>Select Available Slots</h5>
            {renderSlotSelectionStep()}
          </div>
        );
      case 3:
        return (
          <div>
            <h5 className='mb-3'>Upload Advertisement Images</h5>
            {selectedSlots.length > 0 ? (
              <ImageUpload
                selectedSlots={selectedSlots}
                slotMedia={slotMedia}
                sellerProducts={sellerProducts}
                onSlotMediaChange={(slot, field, value) => {
                  setSlotMedia((m) => ({
                    ...m,
                    [slot]: {
                      ...m[slot],
                      [field]: value,
                    },
                  }));
                }}
              />
            ) : (
              <Alert variant='warning'>Please select slots first</Alert>
            )}
          </div>
        );
      case 4:
        return (
          <div>
            <h5 className='mb-3'>Review & Submit</h5>
            {selectedSlots.length > 0 && (
              <Card className='mb-3 border-success'>
                <Card.Body>
                  <div className='row'>
                    {(() => {
                      const counts = { banner: 0, stamp: 0 };
                      selectedSlots.forEach(s => {
                        const type = s.split('_')[0];
                        if (type === 'banner' || type === 'stamp') counts[type] += 1;
                      });

                      const bannerPrice = counts.banner > 0 ? computePricingPreview('banner')?.total : 0;
                      const stampPrice = counts.stamp > 0 ? computePricingPreview('stamp')?.total : 0;
                      const totalPrice = (bannerPrice * counts.banner) + (stampPrice * counts.stamp);

                      return (
                        <>
                          <h6 className='mb-3'>Order Summary</h6>
                          <Row className='g-3'>
                            {counts.banner > 0 && (
                              <Col md={6}>
                                <small className='text-muted'>Banners Selected</small>
                                <div className='h6'>{counts.banner} × ₹{bannerPrice}</div>
                                <div className='fw-bold' style={{ color: '#17a2b8' }}>₹{Math.round(bannerPrice * counts.banner)}</div>
                              </Col>
                            )}
                            {counts.stamp > 0 && (
                              <Col md={6}>
                                <small className='text-muted'>Stamps Selected</small>
                                <div className='h6'>{counts.stamp} × ₹{stampPrice}</div>
                                <div className='fw-bold' style={{ color: '#28a745' }}>₹{Math.round(stampPrice * counts.stamp)}</div>
                              </Col>
                            )}
                          </Row>
                          <hr />
                          <div className='d-flex justify-content-between align-items-center'>
                            <span className='fw-bold'>Total Cost</span>
                            <span className='h5 fw-bold' style={{ color: '#0d6efd' }}>₹{Math.round(totalPrice)}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />

      {/* Wizard Modal after category selection */}
      <Modal size='lg' show={showWizardModal} onHide={handleWizardClose} centered backdrop='static'>
        <Modal.Header closeButton>
          <div className='w-100'>
            <Modal.Title>Advertisement Submission Wizard</Modal.Title>
            <small className='text-muted d-block mt-2'>
              {selectedCategoryData?.name || 'Selected Category'}
            </small>
          </div>
        </Modal.Header>

        {/* Step Indicators */}
        <Modal.Body>
          <div className='mb-4'>
            {/* Step numbers */}
            <div className='d-flex justify-content-between mb-2'>
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className='text-center' style={{ flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      margin: '0 auto 8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      backgroundColor: step <= currentWizardStep ? '#0d6efd' : '#e9ecef',
                      color: step <= currentWizardStep ? 'white' : '#6c757d',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {step < currentWizardStep ? '✓' : step}
                  </div>
                  <small style={{ fontSize: '12px', color: step <= currentWizardStep ? '#0d6efd' : '#6c757d' }}>
                    {step === 1 && 'Duration'}
                    {step === 2 && 'Slots'}
                    {step === 3 && 'Images'}
                    {step === 4 && 'Review'}
                  </small>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <ProgressBar
              now={(currentWizardStep / 4) * 100}
              style={{ height: '4px' }}
              className='mb-3'
            />
          </div>

          {/* Step Content */}
          <div style={{ minHeight: '400px' }}>
            {renderWizardStepContent()}
          </div>
        </Modal.Body>

        {/* Navigation Buttons */}
        <Modal.Footer>
          <Button variant='secondary' onClick={handleWizardClose}>
            Close
          </Button>
          <Button
            variant='outline-primary'
            onClick={handleWizardPrevious}
            disabled={currentWizardStep === 1}
          >
            ← Previous
          </Button>
          {currentWizardStep < 4 ? (
            <Button
              variant='primary'
              onClick={handleWizardNext}
              disabled={
                (currentWizardStep === 1 && selectedDuration === null) ||
                (currentWizardStep === 2 && selectedSlots.length === 0) ||
                (currentWizardStep === 3 && selectedSlots.some(slot => {
                  const media = slotMedia[slot] || {};
                  return !media.mobileImage && !media.desktopImage;
                }))
              }
            >
              Next →
            </Button>
          ) : (
            <Button
              variant='success'
              onClick={() => {
                handlePreview();
                setShowWizardModal(false);
              }}
              disabled={submitLoading}
            >
              {submitLoading ? 'Submitting...' : 'Submit Advertisement'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

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
            slotMedia={slotMedia}
            totalPrice={computeTotalForSelectedSlots()}
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
            {selectedCategory && !showWizardModal && (
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
            {selectedCategory && !showWizardModal && (
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
            {selectedSlots.length > 0 && !showWizardModal && (
              <Card className='mb-4'>
                <Card.Header>
                  <Card.Title className='mb-0'>
                    <span className='badge badge-primary me-2'>4</span>
                    Upload Advertisement Images
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <ImageUpload
                    selectedSlots={selectedSlots}
                    slotMedia={slotMedia}
                    sellerProducts={sellerProducts}
                    onSlotMediaChange={(slot, field, value) => {
                      setSlotMedia((m) => ({
                        ...m,
                        [slot]: {
                          ...m[slot],
                          [field]: value,
                        },
                      }));
                    }}
                  />
                </Card.Body>
              </Card>
            )}

            {/* Selected Slots Summary */}
            {selectedSlots.length > 0 && !showWizardModal && (
              <Card className='mb-4 border-success'>
                <Card.Header>
                  <Card.Title className='mb-0'>
                    <span className='badge badge-success me-2'>✓</span>
                    Selected Slots Summary ({selectedDuration} Days)
                  </Card.Title>
                </Card.Header>
                <Card.Body>
                  <div className='row'>
                    {selectedSlots.map((slot) => {
                      const media = slotMedia[slot] || {};
                      return (
                        <div key={slot} className='col-md-6 mb-2'>
                          <div className='card p-2'>
                            <strong>{getSlotDisplayName(slot)}</strong>
                            <div>
                              {media.mobileImage ? (
                                <img src={media.mobileImage} alt={slot} style={{ maxWidth: '100%', borderRadius: '4px', marginBottom: '8px' }} />
                              ) : (
                                <span className='text-muted'>No image uploaded</span>
                              )}
                            </div>
                            {media.mobileRedirectUrl && (
                              <small className='text-break'>Redirect: <a href={media.mobileRedirectUrl} target='_blank' rel='noopener noreferrer'>{media.mobileRedirectUrl}</a></small>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Action Buttons */}
            {(() => {
              const ready = selectedSlots.length > 0 && !showWizardModal &&
                selectedSlots.every(slot => {
                  const media = slotMedia[slot] || {};
                  return media.mobileImage || media.desktopImage;
                });
              return ready ? (
              <Card>
                <Card.Body className='text-end'>
                  <Button
                    variant='outline-secondary'
                    className='me-2'
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedDuration(30);
                      setSelectedSlots([]);
                      setSlotMedia({});
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
              ) : null;
            })()}
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
