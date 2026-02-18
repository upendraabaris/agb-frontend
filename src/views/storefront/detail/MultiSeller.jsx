import React, { useState, useEffect, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Form, Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import AddToCartMultiple from './AddToCartMultiple';

const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      companyName
      overallrating
      companyDescription
      review {
        description
        userRating
        customerName
        ratingDate
      }
    }
  }
`;

const SellerRating = ({ sellerId }) => {
  const { data, loading, error } = useQuery(GET_SELLER, {
    variables: { getSellerId: sellerId },
    skip: !sellerId,
  });

  if (loading) return null;
  if (error) return null;

  const rating = data?.getSeller?.overallrating ?? 0;

  if (!rating || rating === 0) return null;

  return (
    <div className="d-flex align-items-center">
      <StarRating rating={rating} />
      <div className="text-success small fw-semibold ms-2 d-flex align-items-center">
        <CsLineIcons icon="check-circle" size="14" className="me-1" /> Trusted Seller
      </div>
    </div>
  );
};

const StarRating = ({ rating }) => {
  const fullStars = '★'.repeat(Math.floor(rating));
  const halfStar = rating % 1 !== 0 ? '⯪' : '';
  const emptyStars = '☆'.repeat(5 - Math.ceil(rating));
  return <div className="text-success fs-6">{fullStars + halfStar + emptyStars}</div>;
};

const MultiSeller = ({ product, validPincodes = [] }) => {
  const defaultVariant = product.seriesvariant[0];
  const defaultLocation = defaultVariant.serieslocation[0];
  const { dataStoreFeatures1 } = useGlobleContext();
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [selectedLocation, setSelectedLocation] = useState(defaultLocation);
  const [selectedPrice, setSelectedPrice] = useState(defaultLocation.price);
  const [selectedMainStock, setSelectedMainStock] = useState(defaultLocation.mainStock);
  const [selectedUnitType, setSelectedUnitType] = useState(defaultLocation.unitType);
  const [selectedGstRate, setSelectedGstRate] = useState(defaultLocation.gstRate);
  const [selectedGstType, setSelectedGstType] = useState(defaultLocation.gstType);
  const [selectedB2bDiscount, setSelectedB2bDiscount] = useState(defaultLocation.b2bdiscount);
  const [selectedB2cDiscount, setSelectedB2cDiscount] = useState(defaultLocation.b2cdiscount);
  const [selectedTransportCharge, setSelectedTransportCharge] = useState(defaultLocation.transportCharge);
  const [selectedTransportChargeType, setSelectedTransportChargeType] = useState(defaultLocation.transportChargeType);
  const [selectedExtraCharge, setSelectedExtraCharge] = useState(defaultLocation.extraCharge);
  const [selectedExtraChargeType, setSelectedExtraChargeType] = useState(defaultLocation.extraChargeType);
  const [selectedPincode, setSelectedPincode] = useState(defaultLocation.pincode);
  const [pincode, setPincode] = useState('');
  const [isPincodeValid, setIsPincodeValid] = useState(null);
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [isAddToCartDisabled, setIsAddToCartDisabled] = useState(false);
  const [companyDetails, setCompanyDetails] = useState([]);
  const [formvalue, setformvalue] = useState(0);

  const latestVariantRef = useRef(selectedVariant);
  const latestLocationRef = useRef(selectedLocation);

  useEffect(() => {
    latestVariantRef.current = selectedVariant;
    latestLocationRef.current = selectedLocation;
  }, [selectedVariant, selectedLocation]);

  useEffect(() => {
    setCompanyDetails(
      latestVariantRef.current.serieslocation.map((location) => ({
        productId: product.id,
        variantId: latestVariantRef.current.id,
        companyName: location.sellerId.companyName,
        extraCharge: location.extraCharge,
        price: location.price,
        pincode: location.pincode,
        locationId: location.id,
        mainStock: location.mainStock,
        unitType: location.unitType,
        b2cdiscount: location.b2cdiscount,
        b2bdiscount: location.b2bdiscount,
      }))
    );
  }, [latestVariantRef.current]);

  const handleVariantClick = (variant) => {
    const lowestPriceLocation = variant.serieslocation.reduce((min, location) => (location.price < min.price ? location : min), variant.serieslocation[0]);
    setSelectedVariant(variant);
    setSelectedLocation(lowestPriceLocation);
    setSelectedPrice(lowestPriceLocation.price);
    setSelectedMainStock(lowestPriceLocation.mainStock);
    setSelectedUnitType(lowestPriceLocation.unitType);
    setSelectedGstRate(lowestPriceLocation.gstRate);
    setSelectedGstType(lowestPriceLocation.gstType);
    setSelectedB2bDiscount(lowestPriceLocation.b2bdiscount);
    setSelectedB2cDiscount(lowestPriceLocation.b2cdiscount);
    setSelectedTransportCharge(lowestPriceLocation.transportCharge);
    setSelectedTransportChargeType(lowestPriceLocation.transportChargeType);
    setSelectedPincode(lowestPriceLocation.pincode);

    setPincode('');
    setIsPincodeValid(null);
    setPincodeMessage('');
    setIsAddToCartDisabled(false);
  };

  const handlePincodeChange = (e) => {
    // eslint-disable-next-line prefer-destructuring
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setPincode(value);
    }
  };

  const handleCheckPincode = () => {
    const pincodeStr = parseInt(pincode, 10);

    if (pincode === '') {
      setPincodeMessage('Pincode is required.');
      setIsPincodeValid(false);
      setIsAddToCartDisabled(false);
      setCompanyDetails([]);
      return;
    }

    const isValid = /^\d{6}$/.test(pincode);
    if (!isValid) {
      setPincodeMessage('Pincode must be exactly 6 digits.');
      setIsPincodeValid(false);
      setIsAddToCartDisabled(false);
      setCompanyDetails([]);
      return;
    }

    const filteredLocations = latestVariantRef.current.serieslocation.filter((location) => location.pincode.includes(pincodeStr));

    if (filteredLocations.length > 0) {
      setIsPincodeValid(true);
      setPincodeMessage('Pincode is available.');
      setIsAddToCartDisabled(true);

      const filteredDetails = filteredLocations.map((location) => ({
        productId: product.id,
        variantId: latestVariantRef.current.id,
        companyName: location.sellerId.companyName,
        price: location.price,
        extraCharge: location.extraCharge,
        pincode: location.pincode,
        locationId: location.id,
        mainStock: location.mainStock,
        unitType: location.unitType,
        b2cdiscount: location.b2cdiscount,
        b2bdiscount: location.b2bdiscount,
        companyId: location?.sellerId?.id,
      }));

      setCompanyDetails(filteredDetails);

      const newLocation = filteredLocations[0];
      setSelectedLocation(newLocation);
      setSelectedPrice(newLocation.price);
      setSelectedMainStock(newLocation.mainStock);
    } else {
      setIsPincodeValid(false);
      setPincodeMessage('Sorry, Currently we do not have Sellers who can deliver this product at selected pincode location.');
      setIsAddToCartDisabled(false);
      setCompanyDetails([]);
    }
  };

  const [sortType, setSortType] = useState(null);

  const getSortedDetails = () => {
    const sorted = [...companyDetails];

    if (sortType === 'lowToHigh') {
      sorted.sort((a, b) => a.price + a.extraCharge - (b.price + b.extraCharge));
    } else if (sortType === 'highToLow') {
      sorted.sort((a, b) => b.price + b.extraCharge - (a.price + a.extraCharge));
    }
    return sorted;
  };

  return (
    <>
      <style>{`
      .custom-tooltip .tooltip-inner {
        background-color: #000 !important;
        color: #fff !important;
      }
      .custom-tooltip.bs-tooltip-top .tooltip-arrow::before,
      .custom-tooltip.bs-tooltip-bottom .tooltip-arrow::before,
      .custom-tooltip.bs-tooltip-start .tooltip-arrow::before,
      .custom-tooltip.bs-tooltip-end .tooltip-arrow::before {
        background-color: #000 !important;
      }
    `}</style>
      <Row className="mb-2 g-3">
        <Col>
          {product.active && (
            <div>
              {selectedVariant && selectedLocation && (
                <div>
                  <h5 className="fw-bold text-dark fs-3 pb-0 form-label">
                    ₹{' '}
                    {selectedLocation.gstType
                      ? ((selectedLocation.price + selectedLocation.extraCharge) / ((100 + selectedLocation.gstRate) / 100)).toFixed(2)
                      : (selectedLocation.price + selectedLocation.extraCharge).toFixed(2)}
                    {selectedLocation.gstType && <span className="fs-6 text-dark ps-2">+ {selectedLocation.gstRate}% GST</span>}
                    <p className="d-inline fs-6 text-dark ps-1">Per {selectedLocation.unitType}</p>
                  </h5>

                  <div className="ps-1 fw-bold text-dark">
                    {selectedLocation.gstType ? (
                      <>
                        Price with {selectedLocation.gstRate}% GST included: ₹{(selectedLocation.price + selectedLocation.extraCharge).toFixed(2)}
                      </>
                    ) : (
                      <>Inclusive of all taxes</>
                    )}
                  </div>
                </div>
              )}
              {product.seriesvariant.map((variant) => {
                if (!variant.serieslocation || variant.serieslocation.length === 0) return null;

                const lowestPriceLocation = variant.serieslocation.reduce((min, location) => {
                  if (typeof location.price === 'number' && typeof min.price === 'number') {
                    return location.price < min.price ? location : min;
                  }
                  return min;
                }, variant.serieslocation[0]);

                const isSelected = selectedVariant?.id === variant.id;

                return (
                  <div key={variant.id} className="d-inline me-2">
                    <Button
                      onClick={() => handleVariantClick(variant)}
                      className={`my-2 ${isSelected ? 'bg-primary text-white' : 'bg-white text-dark border'}`}
                      style={isSelected ? {} : { backgroundColor: 'white', color: 'black', borderColor: 'black' }}
                    >
                      {variant.variantName}
                    </Button>
                  </div>
                );
              })}

              <div className="d-flex align-items-center mb-2 mt-1">
                <Form.Group className="mb-0 me-2">
                  <Form.Control type="text" placeholder="Enter delivery pincode" value={pincode} onChange={handlePincodeChange} maxLength="6" required />
                </Form.Group>
                <Button className="btn-primary" onClick={handleCheckPincode}>
                  Check
                </Button>
              </div>
              {isPincodeValid === false && <p className="text-danger mt-2 mb-2 mb-0">{pincodeMessage}</p>}

              {isPincodeValid && (
                <div className="border pt-1 pb-1">
                  <h6 className="border-bottom p-2 mb-0 fw-bold">Sellers available for this product at selected pincode: {pincode}</h6>

                  <div className="d-flex gap-3 p-2 small">
                    <span style={{ cursor: 'pointer' }} onClick={() => setSortType('lowToHigh')}>
                      Price Low to High
                    </span>
                    |
                    <span style={{ cursor: 'pointer' }} onClick={() => setSortType('highToLow')}>
                      Price High to Low
                    </span>
                  </div>

                  <ul className="list-unstyled">
                    {getSortedDetails().map((detail, index) =>
                      detail.mainStock > 0 ? (
                        <li
                          key={index}
                          className="d-flex flex-column flex-md-row justify-content-between align-items-start border border-start-0 border-end-0 p-3 mb-1 shadow-sm"
                        >
                          <div className="flex-grow-1 fw-bold fs-6">
                            <NavLink to={`/SellerReview/${detail.companyId}`} target="_blank" className="fw-bold text-dark text-decoration-none">
                              {dataStoreFeatures1?.getStoreFeature?.sellerMasking ? `Seller Id: ${detail.companyId}` : detail.companyName}
                            </NavLink>

                            {detail.companyId && (
                              <SellerRating sellerId={detail.companyId}>
                                {(rating) =>
                                  rating > 0 && (
                                    <div className="text-success small fw-semibold">
                                      <CsLineIcons icon="check-circle" size="14" className="me-1" /> Trusted Seller
                                    </div>
                                  )
                                }
                              </SellerRating>
                            )}

                            <div>
                              <span className="h5 fw-bold text-dark">
                                ₹{((detail.price + detail.extraCharge) * (1 - (detail.b2cdiscount ?? 0) / 100)).toFixed(2)}
                              </span>
                              {detail.b2cdiscount > 0 && (
                                <>
                                  <span className="badge bg-success ms-2">Save {detail.b2cdiscount}%</span>
                                  <div className="text-muted small">
                                    <del>₹{(detail.price + detail.extraCharge).toFixed(2)}</del>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="d-flex align-items-center mt-3 mt-md-0">
                            <AddToCartMultiple
                              productID={detail.productId}
                              variantID={detail.variantId}
                              locationID={detail.locationId}
                              available={detail.mainStock}
                              gstRate={selectedGstRate}
                              enteredPrice={detail.price}
                              extraCharge={detail.extraCharge}
                              unitType={detail.unitType}
                              extraChargeType={selectedTransportChargeType}
                              transportCharge={selectedTransportCharge}
                              transportChargeType={selectedTransportChargeType}
                              b2bDiscount={selectedB2bDiscount}
                              mainStock={detail.mainStock}
                            />
                          </div>
                        </li>
                      ) : null
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </>
  );
};

export default MultiSeller;
