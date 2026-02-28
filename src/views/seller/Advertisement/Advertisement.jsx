import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useQuery, useLazyQuery, useMutation, gql } from '@apollo/client';
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
      quarterAvailability {
        quarter
        label
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
        slot_name
        slot_position
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
  const [selectedStartQuarter, setSelectedStartQuarter] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  // media & url details per-slot (keyed by slot name)
  const [slotMedia, setSlotMedia] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedCategoryName, setSubmittedCategoryName] = useState('');
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [currentWizardStep, setCurrentWizardStep] = useState(1);

  // Multi-category cart: [{ categoryId, categoryName, slots, slotMedia, pricingData }]
  const [categoryCart, setCategoryCart] = useState([]);
  const [showAddCategoryPicker, setShowAddCategoryPicker] = useState(false);
  const [addCatSearchTerm, setAddCatSearchTerm] = useState('');
  const [addCatTab, setAddCatTab] = useState('category');

  const { data: pricingData, loading: pricingLoading, error: pricingError } = useQuery(
    GET_CATEGORY_PRICING,
    {
      variables: { categoryId: selectedCategory },
      skip: !selectedCategory,
    }
  );

  // Lazy query for fetching pricing when adding another category
  const [fetchCategoryPricing] = useLazyQuery(GET_CATEGORY_PRICING);

  const [createCategoryRequest, { loading: submitLoading }] = useMutation(CREATE_CATEGORY_REQUEST);

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

  // Save current category slots to cart and prepare for adding another
  const handleSaveToCart = () => {
    if (!selectedCategory || selectedSlots.length === 0) return;
    const catData = allCategories.find(c => c.id === selectedCategory);
    const existing = categoryCart.findIndex(c => c.categoryId === selectedCategory);
    const entry = {
      categoryId: selectedCategory,
      categoryName: catData?.name || 'Unknown',
      slots: [...selectedSlots],
      slotMedia: { ...slotMedia },
      pricingData: pricingData?.getCategoryPricing || null,
    };
    if (existing >= 0) {
      setCategoryCart(prev => prev.map((c, i) => (i === existing ? entry : c)));
    } else {
      setCategoryCart(prev => [...prev, entry]);
    }
  };

  const handleWizardNext = () => {
    if (currentWizardStep < 4) {
      // Save current slots to cart before entering images or review step
      if (currentWizardStep === 2 || currentWizardStep === 3) {
        handleSaveToCart();
      }
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
    setSelectedStartQuarter(null);
    setSelectedSlots([]);
    setSlotMedia({});
    setCategoryCart([]);
    setShowAddCategoryPicker(false);
    setAddCatSearchTerm('');
  };

  // Handle adding another category from the inline picker
  const handleAddAnotherCategory = async (categoryId) => {
    // First save current work to cart
    handleSaveToCart();

    // Now switch to the new category
    setSelectedCategory(categoryId);
    setSelectedSlots([]);
    setSlotMedia({});
    setShowAddCategoryPicker(false);
    setAddCatSearchTerm('');

    // Go back to Step 2 for the new category
    setCurrentWizardStep(2);
  };

  // Remove a category from the cart
  const handleRemoveFromCart = (categoryId) => {
    setCategoryCart(prev => prev.filter(c => c.categoryId !== categoryId));
  };

  // Get all slots across cart + current selection (for images step)
  const getAllCartSlots = () => {
    const cartSlots = [];
    categoryCart.forEach(entry => {
      if (entry.categoryId === selectedCategory) return; // skip current, use live state
      entry.slots.forEach(slot => {
        cartSlots.push({ categoryId: entry.categoryId, categoryName: entry.categoryName, slot, media: entry.slotMedia[slot] || {} });
      });
    });
    // Add current category's slots
    selectedSlots.forEach(slot => {
      const catData = allCategories.find(c => c.id === selectedCategory);
      cartSlots.push({ categoryId: selectedCategory, categoryName: catData?.name || 'Unknown', slot, media: slotMedia[slot] || {} });
    });
    return cartSlots;
  };

  // Get all unique slots for image upload (grouped by category)
  const getAllCategoriesForImages = () => {
    const cats = [];
    categoryCart.forEach(entry => {
      if (entry.categoryId === selectedCategory) return;
      cats.push(entry);
    });
    // Current category
    const catData = allCategories.find(c => c.id === selectedCategory);
    cats.push({
      categoryId: selectedCategory,
      categoryName: catData?.name || 'Unknown',
      slots: [...selectedSlots],
      slotMedia: { ...slotMedia },
      pricingData: pricingData?.getCategoryPricing || null,
    });
    return cats;
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
    // Save current category to cart first
    handleSaveToCart();
    const allCats = getAllCategoriesForImages();
    if (allCats.length === 0 || allCats.every(c => c.slots.length === 0)) {
      toast.error('Please select at least one slot');
      return;
    }
    // Validate all entries have images
    let missingImage = false;
    allCats.forEach(entry => {
      entry.slots.forEach(slot => {
        const media = entry.slotMedia[slot] || {};
        if (!media.mobileImage && !media.desktopImage) {
          missingImage = true;
        }
      });
    });
    if (missingImage) {
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

  // Duration helpers to avoid nested ternaries
  const QUARTER_MAP = { 360: 4, 180: 2, 90: 1 };
  const DURATION_LABEL_MAP = { 360: 'Yearly', 180: 'Half-Yearly', 90: 'Quarterly' };
  const getNumQuarters = (dur) => QUARTER_MAP[dur] || 1;
  const getDurationLabel = (dur) => DURATION_LABEL_MAP[dur] || 'Quarterly';

  // Generate selectable quarter options (current + next 4)
  const getSelectableQuarters = () => {
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const currentQStartMonth = Math.floor(todayUTC.getUTCMonth() / 3) * 3;
    let cursor = new Date(Date.UTC(todayUTC.getUTCFullYear(), currentQStartMonth, 1));
    const quarters = [];
    for (let i = 0; i < 5; i += 1) {
      quarters.push({
        label: getQuarterLabel(cursor),
        startDate: cursor.toISOString().split('T')[0],
        isCurrent: i === 0,
      });
      cursor = getNextQuarterStart(cursor);
    }
    return quarters;
  };

  // compute pricing preview for a specific slot (e.g. 'banner_1', 'stamp_2')
  // Falls back to adType-level if slotName not provided
  const computePricingPreview = (slotName = 'banner_1') => {
    const pricing = pricingData?.getCategoryPricing;
    if (!pricing) return null;

    const adType = slotName.split('_')[0]; // 'banner' or 'stamp'
    const today = new Date();
    const numQuarters = getNumQuarters(selectedDuration);
    const segments = [];
    let proRataCharge = 0;

    // Find per-slot quarterly price for pro-rata calculation
    const slotQuarterlyPrice = pricing.adCategories?.find(
      ac => ac.slot_name === slotName && ac.duration_days === 90
    )?.price || 0;

    if (startPreference === 'today') {
      // Today mode: current quarter remaining charged pro-rata + N full paid quarters
      const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      const currentQEnd = getQuarterEnd(todayUTC);
      const remainingDays = Math.floor((currentQEnd - todayUTC) / (24 * 60 * 60 * 1000)) + 1;

      // Full quarter length for pro-rata calculation
      const qStartMonth = Math.floor(todayUTC.getUTCMonth() / 3) * 3;
      const currentQStart = new Date(Date.UTC(todayUTC.getUTCFullYear(), qStartMonth, 1));
      const fullQuarterDays = Math.floor((currentQEnd - currentQStart) / (24 * 60 * 60 * 1000)) + 1;

      // Pro-rata = (remaining / full) × quarterly price for THIS specific slot
      proRataCharge = Math.round((remainingDays / fullQuarterDays) * slotQuarterlyPrice);

      segments.push({ quarter: `${getQuarterLabel(todayUTC)} (Pro-rata)`, start: new Date(todayUTC), end: currentQEnd, days: remainingDays });

      let cursor = getNextQuarterStart(todayUTC);
      for (let i = 0; i < numQuarters; i += 1) {
        const qEnd = getQuarterEnd(cursor);
        const days = Math.floor((qEnd - cursor) / (24 * 60 * 60 * 1000)) + 1;
        segments.push({ quarter: getQuarterLabel(cursor), start: new Date(cursor), end: qEnd, days });
        cursor = getNextQuarterStart(cursor);
      }
    } else {
      // Specific quarter mode: N full quarters from selected start
      const startDate = selectedStartQuarter ? new Date(selectedStartQuarter) : getNextQuarterStart(today);
      let cursor = new Date(startDate);
      for (let i = 0; i < numQuarters; i += 1) {
        const qEnd = getQuarterEnd(cursor);
        const days = Math.floor((qEnd - cursor) / (24 * 60 * 60 * 1000)) + 1;
        segments.push({ quarter: getQuarterLabel(cursor), start: new Date(cursor), end: qEnd, days });
        cursor = getNextQuarterStart(cursor);
      }
    }

    // Find per-slot price for selected duration
    let adCat = pricing.adCategories?.find(ac => ac.slot_name === slotName && ac.duration_days === selectedDuration);
    // Fallback: same ad_type position 1
    if (!adCat) adCat = pricing.adCategories?.find(ac => ac.ad_type === adType && ac.duration_days === selectedDuration);
    if (!adCat) return null;

    // Total = full duration price for this slot + pro-rata for current quarter (0 for next_quarter)
    const totalPrice = adCat.price + proRataCharge;
    const totalDays = segments.reduce((sum, s) => sum + s.days, 0);

    // Build breakdown with accurate per-segment subtotals
    let breakdown;
    if (proRataCharge > 0 && segments.length > 1) {
      // Today mode: first segment is pro-rata, rest are paid quarters
      const proRataSeg = segments[0];
      const paidSegs = segments.slice(1);
      const paidTotalDays = paidSegs.reduce((sum, s) => sum + s.days, 0);
      const proRataRate = Math.round((proRataCharge / proRataSeg.days) * 100) / 100;
      const paidRate = Math.round((adCat.price / paidTotalDays) * 100) / 100;

      breakdown = [
        { quarter: proRataSeg.quarter, start: proRataSeg.start, end: proRataSeg.end, days: proRataSeg.days, rate_per_day: proRataRate, subtotal: proRataCharge },
        ...paidSegs.map(s => ({
          quarter: s.quarter, start: s.start, end: s.end, days: s.days,
          rate_per_day: paidRate,
          subtotal: Math.round((s.days / paidTotalDays) * adCat.price)
        }))
      ];
    } else {
      // Next quarter mode: uniform rate across all segments
      const ratePerDay = Math.round((totalPrice / totalDays) * 100) / 100;
      breakdown = segments.map(s => ({
        quarter: s.quarter, start: s.start, end: s.end, days: s.days,
        rate_per_day: ratePerDay,
        subtotal: Math.round(ratePerDay * s.days)
      }));
    }
    const startDate = segments[0]?.start || today;
    const endDate = segments[segments.length - 1]?.end || today;
    return { startDate, endDate, breakdown, total: totalPrice, totalDays };
  };

  // compute total price for selected slots (sums per-slot pricing)
  const computeTotalForSelectedSlots = () => {
    if (!selectedSlots || selectedSlots.length === 0) return 0;
    let sum = 0;
    selectedSlots.forEach(slot => {
      const p = computePricingPreview(slot);
      if (p) sum += p.total;
    });
    return sum;
  };

  // Compute pricing for a cart entry using its stored pricingData
  const computeCartEntryPrice = (entry) => {
    let sum = 0;
    entry.slots.forEach(slotName => {
      const pricing = entry.pricingData;
      if (!pricing) return;
      const adType = slotName.split('_')[0];
      const slotQuarterlyPrice = pricing.adCategories?.find(
        ac => ac.slot_name === slotName && ac.duration_days === 90
      )?.price || 0;

      let proRataCharge = 0;
      if (startPreference === 'today') {
        const today = new Date();
        const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
        const currentQEnd = getQuarterEnd(todayUTC);
        const remainingDays = Math.floor((currentQEnd - todayUTC) / (24 * 60 * 60 * 1000)) + 1;
        const qStartMonth = Math.floor(todayUTC.getUTCMonth() / 3) * 3;
        const currentQStart = new Date(Date.UTC(todayUTC.getUTCFullYear(), qStartMonth, 1));
        const fullQuarterDays = Math.floor((currentQEnd - currentQStart) / (24 * 60 * 60 * 1000)) + 1;
        proRataCharge = Math.round((remainingDays / fullQuarterDays) * slotQuarterlyPrice);
      }

      let adCat = pricing.adCategories?.find(ac => ac.slot_name === slotName && ac.duration_days === selectedDuration);
      if (!adCat) adCat = pricing.adCategories?.find(ac => ac.ad_type === adType && ac.duration_days === selectedDuration);
      const slotPrice = adCat?.price || 0;
      sum += slotPrice + proRataCharge;
    });
    return sum;
  };

  // Compute grand total across all cart entries + current
  const computeGrandTotal = () => {
    let total = 0;
    const allCats = getAllCategoriesForImages();
    allCats.forEach(entry => {
      if (entry.categoryId === selectedCategory) {
        total += computeTotalForSelectedSlots();
      } else {
        total += computeCartEntryPrice(entry);
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    try {
      // Save current to cart
      handleSaveToCart();
      const allCats = getAllCategoriesForImages();
      if (allCats.length === 0 || allCats.every(c => c.slots.length === 0)) {
        toast.error('Please fill in all required fields');
        return;
      }

      const durationTypeMap = { 90: 'quarterly', 180: 'half_yearly', 360: 'yearly' };

      // Validate all entries and build mutation promises
      const validEntries = allCats.filter(entry => entry.slots.length > 0);
      const validationError = validEntries.find(entry => {
        const selectedCat = allCategories.find(cat => cat.id === entry.categoryId);
        if (!selectedCat) return true;
        if (!selectedCat.tierId || !selectedCat.tierId.id) return true;
        return false;
      });
      if (validationError) {
        const cat = allCategories.find(c => c.id === validationError.categoryId);
        toast.error(cat ? `${cat.name} is not mapped to an ad tier` : `Category ${validationError.categoryName} not found`);
        return;
      }

      const mutationPromises = validEntries.map(entry => {
        const medias = entry.slots.map(slot => {
          const media = entry.slotMedia[slot] || {};
          return {
            slot,
            media_type: 'both',
            mobile_image_url: media.mobileImage || '',
            desktop_image_url: media.desktopImage || '',
            redirect_url: media.redirectUrl || '',
            url_type: media.urlType || 'external',
          };
        });
        return createCategoryRequest({
          variables: {
            input: {
              category_id: entry.categoryId,
              medias,
              duration_type: durationTypeMap[selectedDuration] || 'quarterly',
              start_preference: startPreference === 'today' ? 'today' : 'select_quarter',
              start_quarter: selectedStartQuarter || undefined,
            },
          },
        });
      });

      const results = await Promise.all(mutationPromises);

      if (results.length > 0) {
        const catNames = allCats.filter(c => c.slots.length > 0).map(c => c.categoryName).join(', ');
        toast.success(`Ad request submitted for: ${catNames}`);
        setSubmittedCategoryName(catNames);
        setShowSuccessModal(true);
        setShowPreview(false);

        // Reset all
        setSelectedCategory('');
        setSelectedDuration(90);
        setStartPreference('today');
        setSelectedStartQuarter(null);
        setSelectedSlots([]);
        setSlotMedia({});
        setCategoryCart([]);
      }
    } catch (error) {
      console.error('Error submitting advertisement:', error);
      if (error.message === 'Authorization header is missing' || error.message === 'jwt expired') {
        toast.error('Please login to submit advertisement');
        setTimeout(() => { history.push('/login'); }, 2000);
      } else {
        toast.error(error.message || 'Failed to submit advertisement');
      }
    }
  };

  

  const getSlotDisplayName = (slot) => {
    const parts = slot.split('_');
    const slotType = parts[0].charAt(0).toUpperCase() + parts[0].slice(1); // Banner/Stamp
    const slotNumber = parts[1];
    return `${slotType} ${slotNumber}`;
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
                {category.parent && categoryMap[category.parent] && (
                  <small className='text-muted d-block w-100 mb-1' style={{ fontSize: '0.7rem' }}>
                    {categoryMap[category.parent].parent && categoryMap[categoryMap[category.parent].parent]
                      ? `${categoryMap[categoryMap[category.parent].parent].name} › ${categoryMap[category.parent].name}`
                      : categoryMap[category.parent].name}
                  </small>
                )}
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
                      {category.pricing90.map(p => `${p.ad_type.charAt(0).toUpperCase() + p.ad_type.slice(1)} ₹${p.price}/Qtr`).join(' | ')}
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
                {/* Quarter Availability */}
                {category.quarterAvailability && category.quarterAvailability.length > 0 && (
                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <strong style={{ fontSize: '0.7rem', color: '#555' }}>Quarter Availability</strong>
                    <div className='d-flex gap-1 mt-1' style={{ flexWrap: 'wrap' }}>
                      {category.quarterAvailability.map(q => {
                        const availCount = q.slots.filter(s => s.available).length;
                        const allBooked = availCount === 0;
                        return (
                          <span
                            key={q.quarter}
                            className='badge'
                            title={`${q.label}\nBanners: ${q.slots.filter(s => s.slot.startsWith('banner') && s.available).length}/4 free\nStamps: ${q.slots.filter(s => s.slot.startsWith('stamp') && s.available).length}/4 free`}
                            style={{
                              backgroundColor: (() => { if (allBooked) return '#dc3545'; return availCount <= 4 ? '#ffc107' : '#28a745'; })(),
                              fontSize: '0.65rem',
                              padding: '0.2rem 0.4rem',
                              borderRadius: '3px',
                              color: (() => { if (allBooked) return '#fff'; return availCount <= 4 ? '#333' : '#fff'; })(),
                              cursor: 'default',
                            }}
                          >
                            {q.quarter}: {availCount}/8
                          </span>
                        );
                      })}
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

    // Get the first selected slot for the breakdown preview
    const selectedSlotForPreview = selectedSlots.length > 0 ? selectedSlots[0] : 'banner_1';
    const preview = computePricingPreview(selectedSlotForPreview);
    return (
      <div>
        <div className='mb-3'>
          <h6 className='mb-2'>Select Duration:</h6>
          <div className='d-flex gap-2 mb-2'>
            {[
              { value: 90, label: 'Quarterly' },
              { value: 180, label: 'Half-Yearly' },
              { value: 360, label: 'Yearly' },
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

          <div className='mt-2'>
            <small className='text-muted d-block mb-2'>Start From Quarter:</small>
            <div className='d-flex gap-2 flex-wrap'>
              {getSelectableQuarters().map((q) => {
                const isSelected = q.isCurrent
                  ? startPreference === 'today'
                  : (startPreference === 'select_quarter' && selectedStartQuarter === q.startDate);
                return (
                  <Button
                    key={q.startDate}
                    size='sm'
                    variant={isSelected ? 'primary' : 'outline-secondary'}
                    onClick={() => {
                      if (q.isCurrent) {
                        setStartPreference('today');
                        setSelectedStartQuarter(null);
                      } else {
                        setStartPreference('select_quarter');
                        setSelectedStartQuarter(q.startDate);
                      }
                    }}
                  >
                    {q.isCurrent ? `${q.label} (Today)` : q.label}
                  </Button>
                );
              })}
            </div>
            <small className='text-muted mt-1 d-block'>
              {startPreference === 'today'
                ? 'Your ad starts today with pro-rata pricing for the remaining current quarter.'
                : 'Your ad starts from the selected quarter with full quarter pricing.'}
            </small>
          </div>
        </div>

        <div>
          <h6 className='mb-3'>Pricing Details (Tier: {pricing?.tierName || 'Unknown'}):</h6>
          {pricing?.adCategories && pricing.adCategories.length > 0 ? (
            <table className='table table-sm'>
              <thead>
                  <tr>
                    <th>Ad Type</th>
                    <th>Duration</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.adCategories
                    .filter(ac => (ac?.duration_days || 30) === selectedDuration)
                    .map((category) => {
                      const { slot_name: slotName = '', price: basePrice = 0 } = category || {};
                      const durationLabel = getDurationLabel(selectedDuration);
                      const isSelectedSlot = selectedSlots.includes(slotName);
                      return (
                      <tr key={category?.id || `${slotName}-${selectedDuration}`} className={isSelectedSlot ? 'table-active' : ''}>
                        <td><strong>{getSlotDisplayName(slotName)}</strong></td>
                        <td>{durationLabel}</td>
                        <td><strong>₹{basePrice}</strong></td>
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
                {/* Show the pricing summary */}
                <div className='mb-3 p-2' style={{ backgroundColor: '#f0f0f0', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <strong>Pricing:</strong> {getSlotDisplayName(selectedSlotForPreview)} — ₹{preview.total} ({getDurationLabel(selectedDuration)})
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
              // append per-slot price
              try {
                const priceForSlot = computePricingPreview(slot)?.total;
                if (priceForSlot) {
                  label += ` - ₹${priceForSlot}`;
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

              let priceLabel = '';
              try {
                const priceForSlot = computePricingPreview(slot)?.total;
                if (priceForSlot) {
                  priceLabel = `₹${priceForSlot}`;
                }
              } catch (e) {
                console.error('Error computing price for slot:', e);
              }

              return (
                <Col key={slot} xs={6} sm={4} md={3}>
                  <Button
                    variant={variant}
                    className='w-100 d-flex flex-column align-items-center justify-content-center'
                    onClick={() => handleSlotToggle(slot)}
                    disabled={disabled}
                    style={{ fontSize: '0.8rem', whiteSpace: 'normal', lineHeight: '1.4', padding: '0.5rem', minHeight: '52px' }}
                  >
                    <span className='fw-bold'>{getSlotDisplayName(slot)}</span>
                    {disabled ? (
                      <small style={{ fontSize: '0.65rem' }}>
                        Booked till {status.freeDate ? new Date(status.freeDate).toLocaleDateString('en-IN') : 'N/A'}
                      </small>
                    ) : (
                      priceLabel && <small>{priceLabel}</small>
                    )}
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

        {selectedSlots.length > 0 && (
          <Alert variant='info' className='mt-2'>
            <div className='d-flex justify-content-between align-items-center'>
              <span><strong>Estimated Total Price:</strong></span>
              <span className='h5 mb-0 fw-bold' style={{ color: '#0d6efd' }}>₹{computeTotalForSelectedSlots()}</span>
            </div>
            <small className='text-muted'>{getDurationLabel(selectedDuration)} | {startPreference === 'today' ? 'Starting Today' : `Starting ${selectedStartQuarter || 'Next Quarter'}`}</small>
          </Alert>
        )}
      </div>
    );
  };

  const renderAddCategoryPicker = () => {
    const tabOptions = [
      { key: 'category', label: 'Category' },
      { key: 'subcategory', label: 'Sub Category' },
      { key: 'subsubcategory', label: 'Sub Sub Category' },
    ];
    let list = [];
    if (addCatTab === 'category') list = topLevelCategories;
    else if (addCatTab === 'subcategory') list = subCategories;
    else list = subSubCategories;

    if (addCatSearchTerm) {
      list = list.filter(cat => cat.name?.toLowerCase().includes(addCatSearchTerm.toLowerCase()));
    }
    // Exclude already-added categories
    const addedIds = categoryCart.map(c => c.categoryId);
    addedIds.push(selectedCategory);
    list = list.filter(cat => !addedIds.includes(cat.id));

    return (
      <div className='border rounded p-3 mt-3' style={{ backgroundColor: '#f8f9fa' }}>
        <div className='d-flex justify-content-between align-items-center mb-2'>
          <h6 className='mb-0'>Add Another Category</h6>
          <Button size='sm' variant='outline-secondary' onClick={() => setShowAddCategoryPicker(false)}>Cancel</Button>
        </div>
        <div className='d-flex gap-1 mb-2'>
          {tabOptions.map(tab => (
            <Button key={tab.key} size='sm' variant={addCatTab === tab.key ? 'primary' : 'outline-secondary'} onClick={() => setAddCatTab(tab.key)}>
              {tab.label}
            </Button>
          ))}
        </div>
        <input
          type='text'
          className='form-control form-control-sm mb-2'
          placeholder='Search categories...'
          value={addCatSearchTerm}
          onChange={e => setAddCatSearchTerm(e.target.value)}
        />
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {list.length === 0 && <small className='text-muted'>No categories available</small>}
          {list.map(cat => (
            <div
              key={cat.id}
              className='d-flex justify-content-between align-items-center p-2 border-bottom'
              style={{ cursor: 'pointer' }}
              onClick={() => handleAddAnotherCategory(cat.id)}
              onKeyDown={e => e.key === 'Enter' && handleAddAnotherCategory(cat.id)}
              role='button'
              tabIndex={0}
            >
              <div>
                <strong style={{ fontSize: '0.85rem' }}>{cat.name}</strong>
                <div className='d-flex gap-1 mt-1'>
                  <span className='badge bg-success' style={{ fontSize: '0.65rem' }}>{cat.availableSlots || 0}/8 free</span>
                  <span className='badge bg-info' style={{ fontSize: '0.65rem' }}>{cat.tierId?.name || 'Tier'}</span>
                </div>
              </div>
              <Button size='sm' variant='outline-primary'>+ Add</Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCartSummaryBadges = () => {
    if (categoryCart.length === 0) return null;
    return (
      <div className='mb-3'>
        <small className='text-muted d-block mb-1'>Categories in cart:</small>
        <div className='d-flex gap-1 flex-wrap'>
          {categoryCart.filter(c => c.categoryId !== selectedCategory).map(entry => (
            <span key={entry.categoryId} className='badge bg-primary d-flex align-items-center gap-1' style={{ fontSize: '0.75rem' }}>
              {entry.categoryName} ({entry.slots.length} slots)
              <button
                type='button'
                className='btn-close btn-close-white'
                style={{ fontSize: '0.5rem', padding: '2px' }}
                onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(entry.categoryId); }}
                aria-label='Remove'
              />
            </span>
          ))}
          <span className='badge bg-info'>{selectedCategoryData?.name || 'Current'} ({selectedSlots.length} slots)</span>
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
            <h5 className='mb-3'>Select Available Slots — {selectedCategoryData?.name}</h5>
            {renderCartSummaryBadges()}
            {renderSlotSelectionStep()}

            {/* Add another category option */}
            {selectedSlots.length > 0 && !showAddCategoryPicker && (
              <div className='text-center mt-3'>
                <Button
                  variant='outline-success'
                  size='sm'
                  onClick={() => { setShowAddCategoryPicker(true); setAddCatSearchTerm(''); }}
                >
                  + Add Another Category
                </Button>
              </div>
            )}
            {showAddCategoryPicker && renderAddCategoryPicker()}
          </div>
        );
      case 3:
        return (
          <div>
            <h5 className='mb-3'>Upload Advertisement Images</h5>
            {(() => {
              const allCats = getAllCategoriesForImages();
              const hasSlots = allCats.some(c => c.slots.length > 0);
              if (!hasSlots) return <Alert variant='warning'>Please select slots first</Alert>;
              return allCats.filter(c => c.slots.length > 0).map(entry => (
                <div key={entry.categoryId} className='mb-4'>
                  <h6 className='border-bottom pb-2 mb-3'>
                    <span className='badge bg-primary me-2' style={{ fontSize: '0.75rem' }}>{entry.categoryName}</span>
                    {entry.slots.length} slot(s)
                  </h6>
                  <ImageUpload
                    selectedSlots={entry.slots}
                    slotMedia={entry.categoryId === selectedCategory ? slotMedia : entry.slotMedia}
                    sellerProducts={sellerProducts}
                    onSlotMediaChange={(slot, field, value) => {
                      if (entry.categoryId === selectedCategory) {
                        setSlotMedia((m) => ({ ...m, [slot]: { ...m[slot], [field]: value } }));
                      } else {
                        setCategoryCart(prev => prev.map(c => {
                          if (c.categoryId !== entry.categoryId) return c;
                          return { ...c, slotMedia: { ...c.slotMedia, [slot]: { ...c.slotMedia[slot], [field]: value } } };
                        }));
                      }
                    }}
                  />
                </div>
              ));
            })()}
          </div>
        );
      case 4:
        return (
          <div>
            <h5 className='mb-3'>Review & Submit</h5>
            {(() => {
              const fmtPrice = (v) => `\u20b9${Math.round(v).toLocaleString('en-IN')}`;
              const allCats = getAllCategoriesForImages().filter(c => c.slots.length > 0);
              if (allCats.length === 0) return <Alert variant='warning'>No slots selected</Alert>;

              // Build per-category data with slot prices + breakdown
              const categoryRows = allCats.map(entry => {
                let catTotal = 0;
                const slotRows = entry.slots.map(slot => {
                  let price = 0;
                  let breakdown = null;
                  if (entry.categoryId === selectedCategory) {
                    const preview = computePricingPreview(slot);
                    price = preview?.total || 0;
                    breakdown = preview?.breakdown || null;
                  } else {
                    const pr = entry.pricingData;
                    if (pr) {
                      const adType = slot.split('_')[0];
                      const slotQPrice = pr.adCategories?.find(ac => ac.slot_name === slot && ac.duration_days === 90)?.price || 0;
                      let proRata = 0;
                      if (startPreference === 'today') {
                        const now = new Date();
                        const nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
                        const qEnd = getQuarterEnd(nowUTC);
                        const rem = Math.floor((qEnd - nowUTC) / 86400000) + 1;
                        const qsm = Math.floor(nowUTC.getUTCMonth() / 3) * 3;
                        const qStart = new Date(Date.UTC(nowUTC.getUTCFullYear(), qsm, 1));
                        const full = Math.floor((qEnd - qStart) / 86400000) + 1;
                        proRata = Math.round((rem / full) * slotQPrice);
                      }
                      let adCat = pr.adCategories?.find(ac => ac.slot_name === slot && ac.duration_days === selectedDuration);
                      if (!adCat) adCat = pr.adCategories?.find(ac => ac.ad_type === adType && ac.duration_days === selectedDuration);
                      price = (adCat?.price || 0) + proRata;
                    }
                  }
                  catTotal += price;
                  return { slot, displayName: getSlotDisplayName(slot), price, breakdown };
                });
                return { ...entry, slotRows, catTotal };
              });

              const grandTotal = categoryRows.reduce((sum, c) => sum + c.catTotal, 0);

              return (
                <>
                  {/* Plan Info */}
                  <Card className='mb-3' style={{ backgroundColor: '#f0f4ff', border: '1px solid #c5d5f7' }}>
                    <Card.Body className='py-2 px-3'>
                      <div className='d-flex flex-wrap gap-3' style={{ fontSize: '0.85rem' }}>
                        <div><strong>Duration:</strong> {getDurationLabel(selectedDuration)}</div>
                        <div><strong>Start:</strong> {startPreference === 'today' ? 'Today (Pro-rata)' : (selectedStartQuarter || 'Next Quarter')}</div>
                        <div><strong>Categories:</strong> {categoryRows.length}</div>
                        <div><strong>Total Slots:</strong> {categoryRows.reduce((s, c) => s + c.slotRows.length, 0)}</div>
                      </div>
                    </Card.Body>
                  </Card>

                  {/* Per-Category Breakdown */}
                  {categoryRows.map(cat => (
                    <Card key={cat.categoryId} className='mb-3'>
                      <Card.Header className='py-2 d-flex justify-content-between align-items-center' style={{ backgroundColor: '#f8f9fa' }}>
                        <span>
                          <span className='badge bg-primary me-2' style={{ fontSize: '0.75rem' }}>{cat.categoryName}</span>
                          <small className='text-muted'>{cat.slotRows.length} slot(s)</small>
                        </span>
                        <strong style={{ color: '#0d6efd' }}>{fmtPrice(cat.catTotal)}</strong>
                      </Card.Header>
                      <Card.Body className='py-2 px-3'>
                        <table className='table table-sm table-borderless mb-0' style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                              <th style={{ padding: '4px 8px' }}>Slot</th>
                              <th style={{ padding: '4px 8px' }}>Breakdown</th>
                              <th className='text-end' style={{ padding: '4px 8px' }}>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.slotRows.map(r => (
                              <tr key={r.slot} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '6px 8px', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{r.displayName}</td>
                                <td style={{ padding: '6px 8px', fontSize: '0.8rem', color: '#555' }}>
                                  {r.breakdown && r.breakdown.length > 0 ? (
                                    r.breakdown.map((b, idx) => (
                                      <div key={idx}>
                                        {b.quarter}: {b.days}d &times; {`\u20b9${b.rate_per_day}`} = {fmtPrice(b.subtotal)}
                                      </div>
                                    ))
                                  ) : (
                                    <span>{getDurationLabel(selectedDuration)}</span>
                                  )}
                                </td>
                                <td className='text-end' style={{ padding: '6px 8px', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{fmtPrice(r.price)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Card.Body>
                    </Card>
                  ))}

                  {/* Grand Total */}
                  <Card className='border-success'>
                    <Card.Body className='py-3'>
                      <div className='d-flex justify-content-between align-items-center'>
                        <span className='fw-bold' style={{ fontSize: '1rem' }}>Grand Total</span>
                        <span className='h4 fw-bold mb-0' style={{ color: '#0d6efd' }}>{fmtPrice(grandTotal)}</span>
                      </div>
                      {startPreference === 'today' && (
                        <small className='text-muted d-block mt-1'>* Includes pro-rata charges for current quarter remaining days</small>
                      )}
                    </Card.Body>
                  </Card>
                </>
              );
            })()}
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
              {categoryCart.filter(c => c.categoryId !== selectedCategory).length > 0 && (
                <span className='ms-2 badge bg-info' style={{ fontSize: '0.7rem' }}>
                  + {categoryCart.filter(c => c.categoryId !== selectedCategory).length} more
                </span>
              )}
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
              onClick={() => {
                if (currentWizardStep === 2) handleSaveToCart();
                handleWizardNext();
              }}
              disabled={
                (currentWizardStep === 1 && selectedDuration === null) ||
                (currentWizardStep === 2 && selectedSlots.length === 0) ||
                (currentWizardStep === 3 && (() => {
                  const allCats = getAllCategoriesForImages();
                  return allCats.some(entry =>
                    entry.slots.some(slot => {
                      const media = entry.categoryId === selectedCategory ? slotMedia[slot] : entry.slotMedia[slot];
                      return !(media?.mobileImage || media?.desktopImage);
                    })
                  );
                })())
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
            cartEntries={getAllCategoriesForImages().filter(c => c.slots.length > 0)}
            selectedCategory={selectedCategory}
            allCategories={allCategories}
            duration={selectedDuration}
            durationLabel={getDurationLabel(selectedDuration)}
            startPreference={startPreference}
            selectedStartQuarter={selectedStartQuarter}
            computePricingPreview={computePricingPreview}
            computeCartEntryPrice={computeCartEntryPrice}
            computeGrandTotal={computeGrandTotal}
            getSlotDisplayName={getSlotDisplayName}
            getQuarterEnd={getQuarterEnd}
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
