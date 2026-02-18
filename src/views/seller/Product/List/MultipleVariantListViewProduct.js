import React, { useState, useEffect } from 'react';
import { NavLink, withRouter, useParams, useHistory } from 'react-router-dom';
import { Row, Col, Button, Form, OverlayTrigger, Tooltip, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { useQuery, useLazyQuery, useMutation, gql } from '@apollo/client';
import GstTypeData from 'globalValue/attributes dropdown data/GstTypeData';
import PriceTypeData from 'globalValue/attributes dropdown data/PriceTypeData';
import ExtraChargeTypeData from 'globalValue/attributes dropdown data/ExtraChargeTypeData';
import TransportChargeData from 'globalValue/attributes dropdown data/TransportChargeData';
import FinalPriceTypeData from 'globalValue/attributes dropdown data/FinalPriceTypeData';
import UnitTypeData from 'globalValue/attributes dropdown data/UnitTypeData';
import DetailAttributeItem from './PincodeComponents/DetailAttributeItem';

const GET_USER_DETAIL = gql`
  query GetProfile {
    getProfile {
      id
      seller {
        id
        companyName
        gstin
        pancardNo
        state
      }
    }
  }
`;

const GET_SERIES_VARIANT_LOCATIONS = gql`
  query GetSeriesVariantByForSeller($productId: ID) {
    getSeriesVariantByForSeller(productId: $productId) {
      id
      variantName
      hsn
      moq
      active
      allPincode
      gstType
      gstRate
      extraChargeType
      transportChargeType
      finalPrice
      unitType
      priceType
      product {
        fullName
        images
        description
        previewName
        brand_name
        listingComm
        productComm
        shippingComm
        fixedComm
        productCommType
        listingCommType
        fixedCommType
        shippingCommType
      }
      serieslocation {
        id
        pincode
        unitType
        priceType
        price
        gstType
        gstRate
        extraChargeType
        extraCharge
        transportChargeType
        transportCharge
        finalPrice
        b2cdiscount
        b2bdiscount
        displayStock
        mainStock
      }
    }
  }
`;

const UPDATE_SERIES_VARIANT = gql`
  mutation UpdateSeriesVariantMultiSeller(
    $updateSeriesVariantMultiSellerId: ID
    $variantId: ID
    $locationId: ID
    $location: SeriesLocationInput
    $allPincode: Boolean
    $hsn: String
    $silentFeatures: String
    $active: Boolean
    $variantName: String
    $moq: Int
  ) {
    updateSeriesVariantMultiSeller(
      id: $updateSeriesVariantMultiSellerId
      variantId: $variantId
      locationId: $locationId
      location: $location
      allPincode: $allPincode
      hsn: $hsn
      silent_features: $silentFeatures
      active: $active
      variantName: $variantName
      moq: $moq
    ) {
      id
    }
  }
`;

function SellerLocations({ history, handleChange }) {
  const title = 'Multi Seller Products';
  const description = 'Ecommerce Series product Existing Locations List Page';
  const { seriesproductid, seriesvariantId } = useParams();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(null);
  console.log('formData', formData);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);
  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const gstdata = GstTypeData();
  const pricedata = PriceTypeData();
  const unitData = UnitTypeData();
  const extraChargedata = ExtraChargeTypeData();
  const transportChargedata = TransportChargeData();
  const finalPricedata = FinalPriceTypeData();

  const initialLocationState = {
    b2bdiscount: '',
    b2cdiscount: '',
    displayStock: '',
    mainStock: '',
    extraCharge: '',
    extraChargeType: '',
    finalPrice: '',
    gstRate: '',
    pincode: [],
    gstType: false,
    price: '',
    priceType: '',
    transportCharge: '',
    transportChargeType: '',
    unitType: '',
  };

  const [GetSeriesVariantByForSeller, { data: data1, refetch }] = useLazyQuery(GET_SERIES_VARIANT_LOCATIONS, {
    variables: {
      productId: seriesproductid,
    },
    onError: (error) => {
      console.log(`GET_SERIES_VARIANT_LOCATIONS!!! : ${error}`);
    },
  });
  useEffect(() => {
    if (seriesproductid) {
      GetSeriesVariantByForSeller();
    }
    // eslint-disable-next-line
  }, [seriesproductid]);

  useEffect(() => {
    if (data1 && data1.getSeriesVariantByForSeller) {
      const variant1 = data1.getSeriesVariantByForSeller.find((variant) => variant.id === seriesvariantId);

      // setFormData(variant1);
      setFormData({
        ...variant1,
        productName: variant1?.product?.fullName || '',
        hsn: variant1?.hsn || '',
        productImage: variant1?.product?.images || '',
        productDescription: variant1?.product?.description
          ? variant1.product.description.replace(/<\/?[^>]+(>|$)/g, '') // remove HTML tags
          : '',
        productPreviewName: variant1?.product?.previewName || '',
        productBrand: variant1?.product?.brand_name || '',
        listingComm: variant1?.product?.listingComm || 0,
        productComm: variant1?.product?.productComm || 0,
        shippingComm: variant1?.product?.shippingComm || 0,
        fixedComm: variant1?.product?.fixedComm || 0,
        productCommType: variant1?.product?.productCommType || '',
        listingCommType: variant1?.product?.listingCommType || '',
        fixedCommType: variant1?.product?.fixedCommType || '',
        shippingCommType: variant1?.product?.shippingCommType || '',
        serieslocation: variant1.serieslocation?.map(({ __typename, ...rest }) => ({
          ...rest,
          priceType: variant1.priceType || '',
          gstType: variant1.gstType || false,
          gstRate: variant1.gstRate || 0,
          extraChargeType: variant1.extraChargeType || '',
          transportChargeType: variant1.transportChargeType || '',
          finalPrice: variant1.finalPrice || '',
          unitType: variant1.unitType || '',
        })),
      });
    }
  }, [data1, seriesvariantId]);

  // handle update series product

  const [UpdateSeriesVariantMultiSeller] = useMutation(UPDATE_SERIES_VARIANT, {
    onCompleted: () => {
      toast.success('Variant Updated Successfully!');
      refetch();
      history.push(`/seller/product/multiplevariantlist/${seriesproductid}`);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!'); 
    },
  });

  // handle form change

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handlePincodeChange = (locationIndex, pincodeValues) => {
    setFormData((prev) => {
      const newSeriesLocation = [...prev.serieslocation];
      newSeriesLocation[locationIndex] = {
        ...newSeriesLocation[locationIndex],
        pincode: pincodeValues,
      };
      return { ...prev, serieslocation: newSeriesLocation };
    });
  };

  const handleLocationChange = (event, locationIndex) => {
    const { name, value, checked } = event.target;

    setFormData((prevState) => {
      const updatedLocations = [...prevState.serieslocation];
      const updatedLocation = { ...updatedLocations[locationIndex] };

      updatedLocation[name] = name === 'gstType' ? checked : value;
      updatedLocations[locationIndex] = updatedLocation;

      return { ...prevState, serieslocation: updatedLocations };
    });
  };

  const [errors, setErrors] = useState({});

  const onFormSubmit = async (variantid, locationId1, locationIndex) => {
    const locationValue = formData.serieslocation[locationIndex];

    const newErrors = {};

    const isEmpty = (val) => val === '' || val === null || val === undefined;

    const isInvalidNumber = (val) => isEmpty(val) || Number.isNaN(Number(val));
    if (isInvalidNumber(locationValue.price) || Number(locationValue.price) < 1) {
      newErrors[`price-${locationIndex}`] = 'Price must be at least 1';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Scroll or focus the first invalid field
      const firstErrorKey = Object.keys(newErrors)[0]; // e.g. 'price-0'

      // Try to find element by id
      const el = document.getElementById(firstErrorKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }

      return;
    }
    // If no errors, clear previous errors
    setErrors({});

    // Convert numeric fields
    const numericFields = ['price', 'displayStock', 'mainStock', 'gstRate', 'extraCharge', 'transportCharge', 'b2cdiscount', 'b2bdiscount'];
    numericFields.forEach((field) => {
      const valueToParse = locationValue[field];
      locationValue[field] = Number.isNaN(Number(valueToParse)) ? 0 : parseFloat(valueToParse);
    });

    // Proceed with mutation
    if (variantid && seriesproductid) {
      await UpdateSeriesVariantMultiSeller({
        variables: {
          updateSeriesVariantMultiSellerId: seriesproductid,
          variantId: variantid,
          ...(locationId1 ? { locationId: locationId1 } : {}),
          location: locationValue,
        },
      });
    }
  };

  const removeLocation = (locationIndex) => {
    setFormData((prevState) => {
      const updatedLocations = [...prevState.serieslocation];
      updatedLocations.splice(locationIndex, 1); // Remove the location at the specified index
      return { ...prevState, serieslocation: updatedLocations };
    });
  };

  const addNewLocation = () => {
    setFormData((prevState) => {
      const newLocation = { ...initialLocationState };

      const updatedLocations = [...prevState.serieslocation, newLocation];
      return { ...prevState, serieslocation: updatedLocations };
    });
  };

  const { data: userData, refetch: refetchUser } = useQuery(GET_USER_DETAIL);
  useEffect(() => {}, [data1]);
  const pan = userData?.getProfile?.seller?.pancardNo;

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
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-3">
        <Row className="g-0 align-items-center">
          <Col className="col-auto">
            <Button variant="outline-secondary" size="sm" className="d-inline-flex align-items-center" onClick={() => window.history.back()}>
                Go Back
            </Button>
          </Col>
        </Row>
      </div>

      {formData && (
        <>
          <Card className="mb-4">
            <div>
              <div>
                <div className="fw-bold ps-2 p-1 fs-7">Commission / Fee Details</div>
              </div>
            </div>
            <div className="my-2 mx-2">
              <Row>
                {/* Sale Commission Fee */}
                <Form.Group controlId="productComm" className="col-md-3 mb-2">
                  <Form.Label style={{ fontSize: '0.75rem' }}>Sale Commission Fee (Percentage %)</Form.Label>
                  <Form.Control
                    disabled
                    type="text"
                    name="productComm"
                    value={formData.productComm ?? ''}
                    onChange={handleFormChange}
                    style={{
                      fontSize: '0.75rem',
                      height: '15px',
                    }}
                  />
                </Form.Group>

                {/* Listing Fee */}
                <Form.Group controlId="listingComm" className="col-md-3 mb-2">
                  <Form.Label style={{ fontSize: '0.75rem' }}>Listing Fee (Fix Rs.)</Form.Label>
                  <Form.Control
                    disabled
                    type="text"
                    name="listingComm"
                    value={formData.listingComm ?? ''}
                    onChange={handleFormChange}
                    style={{
                      fontSize: '0.75rem',
                      height: '15px',
                    }}
                  />
                </Form.Group>

                {/* Fixed Closing Fee */}
                <Form.Group controlId="fixedComm" className="col-md-3 mb-2">
                  <Form.Label style={{ fontSize: '0.75rem' }}>Fixed Closing Fee (Fix Rs.)</Form.Label>
                  <Form.Control
                    disabled
                    type="text"
                    name="fixedComm"
                    value={formData.fixedComm ?? ''}
                    onChange={handleFormChange}
                    style={{
                      fontSize: '0.75rem',
                      height: '15px',
                    }}
                  />
                </Form.Group>

                {/* Shipping Fee */}
                <Form.Group controlId="shippingComm" className="col-md-3 mb-2">
                  <Form.Label style={{ fontSize: '0.75rem' }}>Shipping Fee (Percentage %)</Form.Label>
                  <Form.Control
                    disabled
                    type="text"
                    name="shippingComm"
                    value={formData.shippingComm ?? ''}
                    onChange={handleFormChange}
                    style={{
                      fontSize: '0.75rem',
                      height: '15px',
                    }}
                  />
                </Form.Group>
              </Row>
            </div>
          </Card>

          <Card>
            {/* Variants */}
            <div>
              <div className="mark">
                <div className="fw-bold ps-4 p-1 fs-6">Variant Details</div>
              </div>
            </div>
            <Form className="mx-3">
              <div className="my-3">
                {/* Product Full Name */}
                <Row>
                  <Form.Group controlId="productName" className="col-md-6 mb-2">
                    <Form.Label>Product Full Name</Form.Label>
                    <Form.Control disabled type="text" name="productName" value={formData.productName || ''} onChange={handleFormChange} />
                  </Form.Group>

                  {/* Product Preview Name */}
                  <Form.Group controlId="productPreviewName" className="col-md-6 mb-2">
                    <Form.Label>Product Preview Name</Form.Label>
                    <Form.Control type="text" disabled value={formData.productPreviewName} />
                  </Form.Group>
                </Row>
                <Row>
                  {/* Variant Name */}
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="variantName">
                      <Form.Label>Variant Name</Form.Label>
                      <Form.Control disabled type="text" name="variantName" value={formData.variantName || ''} onChange={handleFormChange} />
                    </Form.Group>
                  </div>

                  {/* HSN */}
                  <Form.Group controlId="productBrand" className="col-md-6 mb-2">
                    <Form.Label>HSN</Form.Label>
                    <Form.Control type="text" disabled value={formData.hsn} />
                  </Form.Group>
                </Row>
                {/* Brand Name */}
                <Form.Group controlId="productBrand" className="col-md-6 mb-2">
                  <Form.Label>Brand Name</Form.Label>
                  <Form.Control type="text" disabled value={formData.productBrand} />
                </Form.Group>

                {/* Product Image */}
                <Form.Group controlId="productImage" className="col-md-6 mb-2">
                  <Form.Label>Product Image</Form.Label>
                  <div>
                    <img
                      src={Array.isArray(formData.productImage) ? formData.productImage[0] : formData.productImage}
                      alt={formData.productPreviewName || 'Product Image'}
                      style={{ maxWidth: '150px', borderRadius: '8px', marginTop: '8px' }}
                    />
                  </div>
                </Form.Group>

                {/* Description */}
                <Form.Group controlId="productDescription" className="col-md-12 mb-2">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={1} disabled value={formData.productDescription} />
                </Form.Group>

                {/* <div className="col-md-6 mb-2">
                    <Form.Group controlId="moq">
                      <Form.Label>MOQ</Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        onWheel={(e) => e.target.blur()}
                        name="moq"
                        value={formData.moq || 0}
                        disabled
                        onChange={handleFormChange}
                      />
                    </Form.Group>
                  </div> */}
                {/* <div className="col-md-6 mb-2">
                    <Form.Group controlId="moq">
                      <Form.Label>Minimun qty </Form.Label>
                      <Form.Control
                        type="number"
                        min={0}
                        onWheel={(e) => e.target.blur()}
                        name="minimunQty"
                        value={formData.minimunQty || 0}
                        disabled
                        onChange={handleFormChange}
                      />
                    </Form.Group>
                  </div> */}

                {/* <div className="col-md-2">
                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Update and save Variant\'s Name and moq</Tooltip>}>
                      <div className="d-inline-block me-2">
                        <Button variant="outline-primary" onClick={() => updateNameandMoq(formData.id)} className="btn-icon btn-icon-only ms-3 mt-4">
                          <CsLineIcons icon="save" />
                        </Button>
                      </div>
                    </OverlayTrigger>
                  </div> */}

                {/* <div className="row px-2">
                  <div className="col-md-6 mb-2 mt-2">
                    <Form.Group controlId="active">
                      <Form.Label className="fw-bold text-dark">
                        <Form.Check
                          type="checkbox"
                          name="active"
                          inline
                          value="true"
                          checked={formData.active || false}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              active: e.target.checked,
                            }))
                          }
                        />
                        Product Active{' '}
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              Enable or disable this product for sale.
                            </Tooltip>
                          }
                        >
                          <div className="d-inline-block me-2">
                            <CsLineIcons icon="info-hexagon" size="17" />
                          </div>
                        </OverlayTrigger>
                      </Form.Label>
                    </Form.Group>
                  </div>
                </div> */}

                {/* <div className="row mb-2">
                  <div className=" col-md-2">
                    <Form.Label htmlFor="allPincode" className="fs-6">
                      Available for all Pincode
                    </Form.Label>
                  </div>
                  <div className=" col-md-2">
                    <Form.Check name="allPincode" className="ms-3" id="allPincode" type="checkbox" inline disabled checked={formData.allPincode || ''} />
                  </div>
                </div> */}

                {/* Location */}
                {formData.serieslocation?.length > 0 &&
                  formData.serieslocation.map((serieslocation, locationIndex) => (
                    <div key={locationIndex} className="my-3">
                      <div className="mark d-flex align-items-center mb-3">
                        <h5 className="text-bold fw-bold text-dark mb-0">Location {locationIndex + 1}</h5>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              To sell the same product at different prices in multiple locations, use the "Add New Location" button.
                            </Tooltip>
                          }
                        >
                          <div className="d-inline-block ms-2">
                            <CsLineIcons icon="info-hexagon" size="17" />
                          </div>
                        </OverlayTrigger>
                      </div>
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`seriesvariant[${locationIndex}].gstType`}>
                            <Form.Label className="fw-bold text-dark">
                              GST Type<span className="fw-bold text-danger"> * </span>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Choose how price is shown to customers (inclusive or exclusive of GST).
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              readOnly
                              type="text"
                              name="gstType"
                              value={formData.gstType ? 'Exclusive' : 'Inclusive'}
                              onChange={handleFormChange}
                            />
                          </Form.Group>
                        </div>
                        {gstdata && (
                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`formData.serieslocation[${locationIndex}].gstRate`}>
                              <Form.Label className="fw-bold text-dark">
                                GST Rate <span className="text-danger"> * </span>{' '}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top" className="custom-tooltip">
                                      Applicable GST percentage for this product.
                                    </Tooltip>
                                  }
                                >
                                  <div className="d-inline-block me-2">
                                    <CsLineIcons icon="info-hexagon" size="17" />
                                  </div>
                                </OverlayTrigger>
                              </Form.Label>
                              <Form.Control readOnly type="text" name="gstRate" value={formData.gstRate || ''} onChange={handleFormChange} />
                            </Form.Group>
                          </div>
                        )}

                        {pricedata && (
                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`formData.serieslocation[${locationIndex}].priceType`}>
                              <Form.Label className="fw-bold text-dark">
                                Price Type <span className="text-danger"> * </span>{' '}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top" className="custom-tooltip">
                                      Choose price type: MRP, Selling Price, etc.
                                    </Tooltip>
                                  }
                                >
                                  <div className="d-inline-block me-2">
                                    <CsLineIcons icon="info-hexagon" size="17" />
                                  </div>
                                </OverlayTrigger>
                              </Form.Label>
                              <Form.Control readOnly type="text" name="priceType" value={formData.priceType || ''} onChange={handleFormChange} />
                            </Form.Group>
                          </div>
                        )}

                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].price`}>
                            <Form.Label className="fw-bold text-dark">
                              Price <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Base selling price of the product. Minimum price is Rs. 1.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size={17} />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              id={`price-${locationIndex}`}
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              step="0.01"
                              min={1}
                              name="price"
                              value={serieslocation.price || ''}
                              onChange={(e) => handleLocationChange(e, locationIndex)}
                              placeholder="Enter price"
                              isInvalid={!!errors[`price-${locationIndex}`]}
                            />
                            <Form.Control.Feedback type="invalid">{errors[`price-${locationIndex}`]}</Form.Control.Feedback>
                          </Form.Group>
                        </div>

                        {extraChargedata && (
                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`formData.serieslocation[${locationIndex}].extraChargeType`}>
                              <Form.Label className="fw-bold text-dark">
                                Extra Charge Type <span className="text-danger"> * </span>{' '}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top" className="custom-tooltip">
                                      Type of additional charge (like packing, handling).
                                    </Tooltip>
                                  }
                                >
                                  <div className="d-inline-block me-2">
                                    <CsLineIcons icon="info-hexagon" size="17" />
                                  </div>
                                </OverlayTrigger>
                              </Form.Label>
                              <Form.Control readOnly type="text" name="extraChargeType" value={formData.extraChargeType || ''} onChange={handleFormChange} />
                            </Form.Group>
                          </div>
                        )}
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].extraCharge`}>
                            <Form.Label className="fw-bold text-dark">
                              Extra Charge <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Extra amount to be added to the base price.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              id={`extraCharge-${locationIndex}`}
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              step="0.01"
                              min={0}
                              name="extraCharge"
                              value={serieslocation.extraCharge || 0}
                              onChange={(e) => handleLocationChange(e, locationIndex)}
                              placeholder="extraCharge"
                              isInvalid={!!errors[`extraCharge-${locationIndex}`]}
                            />
                            <Form.Control.Feedback type="invalid">{errors[`extraCharge-${locationIndex}`]}</Form.Control.Feedback>
                          </Form.Group>
                        </div>

                        {transportChargedata && (
                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`formData.serieslocation[${locationIndex}].transportChargeType`}>
                              <Form.Label className="fw-bold text-dark">
                                Delivery Charge Type <span className="text-danger"> * </span>{' '}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top" className="custom-tooltip">
                                      Choose how delivery charge is applied.
                                    </Tooltip>
                                  }
                                >
                                  <div className="d-inline-block me-2">
                                    <CsLineIcons icon="info-hexagon" size="17" />
                                  </div>
                                </OverlayTrigger>
                              </Form.Label>
                              <Form.Control
                                readOnly
                                type="text"
                                name="transportChargeType"
                                value={formData.transportChargeType || ''}
                                onChange={handleFormChange}
                              />
                            </Form.Group>
                          </div>
                        )}
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].transportCharge`}>
                            <Form.Label className="fw-bold text-dark">
                              Delivery Charge <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Shipping charge per order or unit.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              id={`transportCharge-${locationIndex}`}
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              step="0.01"
                              min={0}
                              name="transportCharge"
                              value={serieslocation.transportCharge || 0}
                              onChange={(e) => handleLocationChange(e, locationIndex)}
                              placeholder="Delivery Charge"
                              isInvalid={!!errors[`transportCharge-${locationIndex}`]}
                            />
                            <Form.Control.Feedback type="invalid">{errors[`transportCharge-${locationIndex}`]}</Form.Control.Feedback>
                          </Form.Group>
                        </div>

                        {finalPricedata && (
                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`formData.serieslocation[${locationIndex}].finalPrice`}>
                              <Form.Label className="fw-bold text-dark">
                                Final Price Type <span className="text-danger"> * </span>{' '}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top" className="custom-tooltip">
                                      Choose which price is final for billing.
                                    </Tooltip>
                                  }
                                >
                                  <div className="d-inline-block me-2">
                                    <CsLineIcons icon="info-hexagon" size="17" />
                                  </div>
                                </OverlayTrigger>
                              </Form.Label>
                              <Form.Control readOnly type="text" name="finalPrice" value={formData.finalPrice || ''} onChange={handleFormChange} />
                            </Form.Group>
                          </div>
                        )}
                        {unitData && (
                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`formData.serieslocation[${locationIndex}].unitType`}>
                              <Form.Label className="fw-bold text-dark">
                                Unit Type <span className="text-danger"> * </span>{' '}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top" className="custom-tooltip">
                                      Select unit of measurement (e.g., piece, kg).
                                    </Tooltip>
                                  }
                                >
                                  <div className="d-inline-block me-2">
                                    <CsLineIcons icon="info-hexagon" size="17" />
                                  </div>
                                </OverlayTrigger>
                              </Form.Label>
                              <Form.Control readOnly type="text" name="unitType" value={formData.unitType || ''} onChange={handleFormChange} />
                            </Form.Group>
                          </div>
                        )}
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].displayStock`}>
                            <Form.Label className="fw-bold text-dark">
                              Display Stock <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Stock quantity visible to customers.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              id={`displayStock-${locationIndex}`}
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              min={0}
                              step="0.01"
                              name="displayStock"
                              value={serieslocation.displayStock || 0}
                              onChange={(e) => handleLocationChange(e, locationIndex)}
                              isInvalid={!!errors[`displayStock-${locationIndex}`]}
                            />
                            <Form.Control.Feedback type="invalid">{errors[`displayStock-${locationIndex}`]}</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].mainStock`}>
                            <Form.Label className="fw-bold text-dark">
                              Main Stock <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Total available stock for the product. Main Stock should be greater than Display Stock.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              id={`mainStock-${locationIndex}`}
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              min={0}
                              step="0.01"
                              name="mainStock"
                              value={serieslocation.mainStock || 0}
                              onChange={(e) => handleLocationChange(e, locationIndex)}
                              isInvalid={!!errors[`mainStock-${locationIndex}`]}
                            />
                            <Form.Control.Feedback type="invalid">{errors[`mainStock-${locationIndex}`]}</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].b2bdiscount`}>
                            <Form.Label className="fw-bold text-dark">
                              B2B Discount <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Discount applicable for business buyers.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              id={`b2bdiscount-${locationIndex}`}
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              name="b2bdiscount"
                              min={0}
                              value={serieslocation.b2bdiscount || 0}
                              onChange={(e) => handleLocationChange(e, locationIndex)}
                              isInvalid={!!errors[`b2bdiscount-${locationIndex}`]}
                            />
                            <Form.Control.Feedback type="invalid">{errors[`b2bdiscount-${locationIndex}`]}</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].b2cdiscount`}>
                            <Form.Label className="fw-bold text-dark">
                              B2C Discount <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Discount applicable for retail customers.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              id={`b2cdiscount-${locationIndex}`}
                              type="number"
                              min={0}
                              onWheel={(e) => e.target.blur()}
                              name="b2cdiscount"
                              value={serieslocation.b2cdiscount || 0}
                              onChange={(e) => handleLocationChange(e, locationIndex)}
                              isInvalid={!!errors[`b2cdiscount-${locationIndex}`]}
                            />
                            <Form.Control.Feedback type="invalid">{errors[`b2cdiscount-${locationIndex}`]}</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                        <div className="mark">
                          <div className=" fw-bold ps-4 p-1 fs-6">Delivery Pincode Details</div>{' '}
                        </div>

                        <div className="mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].pincode`}>
                            <DetailAttributeItem
                              pincodeValues={serieslocation.pincode}
                              allpincode={serieslocation.allPincode}
                              onPincodeChange={(updatedPincodes) => {
                                setFormData((prev) => {
                                  const updatedSeriesLocation = {
                                    ...prev.serieslocation[locationIndex],
                                    pincode: updatedPincodes, // ✅ array save ho rahi hai
                                  };
                                  const updatedLocations = prev.serieslocation.map((loc, i) => (i === locationIndex ? updatedSeriesLocation : loc));
                                  return { ...prev, serieslocation: updatedLocations };
                                });
                              }}
                              onAllPincodeChange={(isAllIndia) => {
                                setFormData((prev) => {
                                  const updatedSeriesLocation = {
                                    ...prev.serieslocation[locationIndex],
                                    allPincode: isAllIndia,
                                  };
                                  const updatedLocations = prev.serieslocation.map((loc, i) => (i === locationIndex ? updatedSeriesLocation : loc));
                                  return { ...prev, serieslocation: updatedLocations };
                                });
                              }}
                            />
                          </Form.Group>
                        </div>

                        <Row>
                          <div className="d-flex justify-content-between mt-2">
                            <Button variant="danger" onClick={() => removeLocation(locationIndex)}>
                              Remove Location
                            </Button>

                            <Button variant="primary" onClick={() => onFormSubmit(formData.id, serieslocation.id, locationIndex)}>
                              Submit
                            </Button>
                          </div>
                        </Row>
                      </div>
                    </div>
                  ))}

                {!formData.allPincode && (
                  <Button variant="primary" onClick={addNewLocation}>
                    Add New Location
                  </Button>
                )}
              </div>
            </Form>
          </Card>
        </>
      )}
    </>
  );
}

export default SellerLocations;
