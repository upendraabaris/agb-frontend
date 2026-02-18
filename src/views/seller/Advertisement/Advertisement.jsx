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
      tierId {
        id
        name
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
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bannerMobileImage, setBannerMobileImage] = useState(null);
  const [bannerDesktopImage, setBannerDesktopImage] = useState(null);
  const [stampMobileImage, setStampMobileImage] = useState(null);
  const [stampDesktopImage, setStampDesktopImage] = useState(null);
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
      setBannerMobileImage(null);
      setBannerDesktopImage(null);
      setStampMobileImage(null);
      setStampDesktopImage(null);
      setMobileRedirectUrl('');
      setDesktopRedirectUrl('');
    },
    onError: (error) => {
      console.error('[Advertisement] Mutation error:', error);
      toast.error(error.message || 'Failed to submit advertisement');
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
  };

  const handleDurationChange = (duration) => {
    setSelectedDuration(duration);
  };

  const handleSlotToggle = (slotName) => {
    // prevent selecting a slot that's already booked for this category
    const parts = slotName.split('_');
    const type = parts[0];
    const num = parseInt(parts[1], 10);
    const bookedBanner = selectedCategoryData?.bookedBanner || 0;
    const bookedStamp = selectedCategoryData?.bookedStamp || 0;
    const availableBanner = Math.max(0, 4 - bookedBanner);
    const availableStamp = Math.max(0, 4 - bookedStamp);

    if ((type === 'banner' && num > availableBanner) || (type === 'stamp' && num > availableStamp)) {
      toast.error('This slot is already booked');
      return;
    }

    setSelectedSlots((prevSlots) => {
      if (prevSlots.includes(slotName)) {
        return prevSlots.filter((slot) => slot !== slotName);
      }
      return [...prevSlots, slotName];
    });
  };

  const handlePreview = () => {
    const needsBanner = selectedSlots.some(s => s.startsWith('banner'));
    const needsStamp = selectedSlots.some(s => s.startsWith('stamp'));
    if (!selectedCategory || selectedSlots.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (needsBanner && (!bannerMobileImage && !bannerDesktopImage)) {
      toast.error('Please upload at least one image for Banner slots');
      return;
    }
    if (needsStamp && (!stampMobileImage && !stampDesktopImage)) {
      toast.error('Please upload at least one image for Stamp slots');
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    try {
      const needsBanner = selectedSlots.some(s => s.startsWith('banner'));
      const needsStamp = selectedSlots.some(s => s.startsWith('stamp'));
      if (!selectedCategory || selectedSlots.length === 0) {
        toast.error('Please fill in all required fields');
        return;
      }
      if (needsBanner && (!bannerMobileImage && !bannerDesktopImage)) {
        toast.error('Please upload images for Banner slots');
        return;
      }
      if (needsStamp && (!stampMobileImage && !stampDesktopImage)) {
        toast.error('Please upload images for Stamp slots');
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
        const type = slot.split('_')[0];
        const mobileImageUrl = type === 'banner' ? bannerMobileImage : stampMobileImage;
        const desktopImageUrl = type === 'banner' ? bannerDesktopImage : stampDesktopImage;
        return {
          slot,
          media_type: 'both',
          'mobile_image_url': mobileImageUrl,
          'mobile_redirect_url': mobileRedirectUrl || '',
          'desktop_image_url': desktopImageUrl,
          'desktop_redirect_url': desktopRedirectUrl || '',
        };
      });

      const result = await createCategoryRequest({
        variables: {
          input: {
            category_id: selectedCategory,
            medias,
            duration_days: selectedDuration,
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
    
    const categories = categoriesData?.getCategoriesWithAvailableSlots || [];
    
    if (categories.length === 0) {
      return (
        <Alert variant='warning'>
          No categories with tiers assigned. Please contact admin to set up ad tiers for categories.
        </Alert>
      );
    }

    return (
      <div>
        <Row className='g-3'>
          {categories && categories.filter(cat => cat && cat.id).map((category) => (
            <Col key={category?.id} md={6} lg={4}>
              <Card
                className={`cursor-pointer ${selectedCategory === category?.id ? 'border-primary' : ''}`}
                onClick={() => handleCategoryChange(category?.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* {category?.image && (
                  <Card.Img
                    variant='top'
                    src={category.image}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )} */}
                <Card.Body>
                  <Card.Title>{category?.name || 'Unnamed'}</Card.Title>
                  {/* <small className='text-muted d-block mb-2'>{category?.description || 'No description'}</small> */}
                  <div className='d-flex justify-content-between'>
                    <span className='badge bg-success'>
                      Available: {category?.availableSlots || 0}/8
                    </span>
                    <span className='badge bg-info'>{category?.tierId?.name || 'No Tier'}</span>
                  </div>
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

    return (
      <div>
        <div className='mb-4'>
          <h6 className='mb-3'>Select Duration:</h6>
          <div className='d-flex gap-2'>
            {[
              { value: 30, label: '30 Days' },
              { value: 90, label: '90 Days' },
              { value: 180, label: '180 Days' },
              { value: 365, label: '365 Days' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={selectedDuration === option.value ? 'primary' : 'outline-primary'}
                onClick={() => handleDurationChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h6 className='mb-3'>Pricing Details (Tier: {pricing?.tierName || 'Unknown'}):</h6>
          {pricing?.adCategories && pricing.adCategories.length > 0 ? (
            <table className='table table-sm'>
              <thead>
                <tr>
                  <th>Ad Type</th>
                  <th>Price</th>
                  <th>Priority</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {pricing.adCategories.map((category) => (
                  <tr key={category?.id || Date.now()}>
                    <td>{category?.ad_type ? category.ad_type.charAt(0).toUpperCase() + category.ad_type.slice(1) : 'Unknown'}</td>
                    <td>₹{category?.price || 0}</td>
                    <td>{category?.priority || 0}</td>
                    <td>{category?.duration_days || 0} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Alert variant='info'>No pricing tiers configured for this category</Alert>
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

    const bannerSlots = ['banner_1', 'banner_2', 'banner_3', 'banner_4'];
    const stampSlots = ['stamp_1', 'stamp_2', 'stamp_3', 'stamp_4'];
    // per-type booked counts (from API)
    const bookedBanner = selectedCategoryData?.bookedBanner || 0;
    const bookedStamp = selectedCategoryData?.bookedStamp || 0;
    const availableBanner = Math.max(0, 4 - bookedBanner);
    const availableStamp = Math.max(0, 4 - bookedStamp);

    return (
      <div>
        <Alert variant='info'>
          Available Slots: {selectedCategoryData.availableSlots || 0}/{(selectedCategoryData.bookedSlots || 0) + (selectedCategoryData.availableSlots || 0)}
        </Alert>

        <div className='mb-4'>
          <h6 className='mb-3'>Banner Slots (Available: {availableBanner})</h6>
          <Row className='g-2'>
            {bannerSlots.map((slot, idx) => {
              const disabled = idx >= availableBanner;
              return (
                <Col key={slot} xs={6} sm={4} md={3}>
                  <Button
                    variant={selectedSlots.includes(slot) ? 'primary' : 'outline-secondary'}
                    className='w-100'
                    onClick={() => handleSlotToggle(slot)}
                    disabled={disabled}
                  >
                    {getSlotDisplayName(slot)}
                  </Button>
                </Col>
              );
            })}
          </Row>
        </div>

        <div>
          <h6 className='mb-3'>Stamp Slots (Available: {availableStamp})</h6>
          <Row className='g-2'>
            {stampSlots.map((slot, idx) => {
              const disabled = idx >= availableStamp;
              return (
                <Col key={slot} xs={6} sm={4} md={3}>
                  <Button
                    variant={selectedSlots.includes(slot) ? 'primary' : 'outline-secondary'}
                    className='w-100'
                    onClick={() => handleSlotToggle(slot)}
                    disabled={disabled}
                  >
                    {getSlotDisplayName(slot)}
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
            mobileImage={bannerMobileImage || stampMobileImage}
            desktopImage={bannerDesktopImage || stampDesktopImage}
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

            {/* Action Buttons */}
            {(() => {
              const needsBanner = selectedSlots.some(s => s.startsWith('banner'));
                const needsStamp = selectedSlots.some(s => s.startsWith('stamp'));
                const ready = (needsBanner ? (bannerMobileImage || bannerDesktopImage) : true)
                  && (needsStamp ? (stampMobileImage || stampDesktopImage) : true)
                  && selectedSlots.length > 0;
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
                      setBannerMobileImage(null);
                      setBannerDesktopImage(null);
                      setStampMobileImage(null);
                      setStampDesktopImage(null);
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
