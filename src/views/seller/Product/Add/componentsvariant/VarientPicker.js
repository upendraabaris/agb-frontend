import React, { useState, useEffect } from 'react';
import { useQuery, gql, useLazyQuery } from '@apollo/client';
import { Row, Col, Form, Card, Button, Tooltip, OverlayTrigger, Accordion } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
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

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      key
      content
    }
  }
`;

const VarientPicker = ({ setFormData1, handleChange }) => {
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
  const storeFeaturess = StoreFeatures();

  const initialLocationState = {
    b2bdiscount: 0,
    b2cdiscount: 0,
    displayStock: 0,
    mainStock: 0,
    extraCharge: 0,
    extraChargeType: '',
    finalPrice: '',
    gstRate: '',
    pincode: [],
    gstType: false,
    price: 1,
    priceType: '',
    transportCharge: 0,
    transportChargeType: '',
    unitType: '',
  };

  const initialVariantState = {
    variantName: '',
    moq: 1,
    minimunQty: 1,
    hsn: '',
    silent_features: '',
    allPincode: true,
    active: true,
    location: [initialLocationState],
  };

  const [formData, setFormData] = useState({
    variant: [initialVariantState],
    shippingPolicy: '',
    returnPolicy: '',
    cancellationPolicy: '',
  });

  const [GetSiteContent] = useLazyQuery(GET_SITE_CONTENT, {
    onCompleted: (res) => {
      if (res.getSiteContent.key === 'shipping-policy') {
        setFormData((prev) => ({
          ...prev,
          shippingPolicy: res.getSiteContent?.content,
        }));
      }
      if (res.getSiteContent.key === 'return-policy') {
        setFormData((prev) => ({
          ...prev,
          returnPolicy: res.getSiteContent?.content,
        }));
      }
      if (res.getSiteContent.key === 'cancellation-policy') {
        setFormData((prev) => ({
          ...prev,
          cancellationPolicy: res.getSiteContent?.content,
        }));
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  useEffect(() => {
    const getsiteContent = async () => {
      await GetSiteContent({ variables: { key: 'shipping-policy' } });
      await GetSiteContent({ variables: { key: 'return-policy' } });
      await GetSiteContent({ variables: { key: 'cancellation-policy' } });
    };
    getsiteContent();
  }, [GetSiteContent]);

  const handlePincodeChange = (variantIndex, locationIndex, pincodeValues) => {
    setFormData((prevState) => {
      const updatedLocation = {
        ...prevState.variant[variantIndex].location[locationIndex],
        pincode: pincodeValues,
      };
      const updatedVariant = {
        ...prevState.variant[variantIndex],
        location: prevState.variant[variantIndex].location.map((location, index) => (index === locationIndex ? updatedLocation : location)),
      };
      const updatedForm = {
        ...prevState,
        variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
      };
      return updatedForm;
    });
  };

  const [isVariantSaved, setIsVariantSaved] = useState(false);

  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newErrors = {};
    let firstErrorElement = null;

    formData.variant.forEach((variant, variantIndex) => {
      // Variant-level validations
      if (!variant.variantName || !variant.variantName.trim()) {
        newErrors[`variantName-${variantIndex}`] = 'Please enter the Variant Name';
        if (!firstErrorElement) {
          firstErrorElement = document.getElementById(`variantName-${variantIndex}`);
        }
      }

      if (!variant.hsn || !variant.hsn.toString().trim()) {
        newErrors[`hsn-${variantIndex}`] = 'Please enter the HSN';
        if (!firstErrorElement) {
          firstErrorElement = document.getElementById(`hsn-${variantIndex}`);
        }
      }

      // Location-level validations
      variant.location.forEach((location, locationIndex) => {
        if (!location.gstRate) {
          newErrors[`gstRate-${variantIndex}-${locationIndex}`] = 'Please select the GST Rate';
          if (!firstErrorElement) {
            firstErrorElement = document.getElementById(`gstRate-${variantIndex}-${locationIndex}`);
          }
        }

        if (!location.priceType) {
          newErrors[`priceType-${variantIndex}-${locationIndex}`] = 'Please select the Price Type';
          if (!firstErrorElement) {
            firstErrorElement = document.getElementById(`priceType-${variantIndex}-${locationIndex}`);
          }
        }

        if (location.price === '' || location.price === undefined || Number.isNaN(Number(location.price))) {
          newErrors[`price-${variantIndex}-${locationIndex}`] = 'Please enter the Price';
        }

        if (!location.extraChargeType) {
          newErrors[`extraChargeType-${variantIndex}-${locationIndex}`] = 'Please select the Extra Charge Type';
          if (!firstErrorElement) {
            firstErrorElement = document.getElementById(`extraChargeType-${variantIndex}-${locationIndex}`);
          }
        }

        if (!location.transportChargeType || location.transportChargeType.trim() === '') {
          newErrors[`transportChargeType-${variantIndex}-${locationIndex}`] = 'Please select the Delivery Charge Type';
          if (!firstErrorElement) {
            firstErrorElement = document.getElementById(`transportChargeType-${variantIndex}-${locationIndex}`);
          }
        }

        if (!location.finalPrice) {
          newErrors[`finalPrice-${variantIndex}-${locationIndex}`] = 'Please select the Final Price Type';
          if (!firstErrorElement) {
            firstErrorElement = document.getElementById(`finalPrice-${variantIndex}-${locationIndex}`);
          }
        }

        if (!location.unitType) {
          newErrors[`unitType-${variantIndex}-${locationIndex}`] = 'Please select the Unit Type';
          if (!firstErrorElement) {
            firstErrorElement = document.getElementById(`unitType-${variantIndex}-${locationIndex}`);
          }
        }

        if (location.displayStock === undefined || location.displayStock === '' || Number.isNaN(Number(location.displayStock))) {
          newErrors[`displayStock-${variantIndex}-${locationIndex}`] = 'Please enter the Display Stock';
          if (!firstErrorElement) {
            firstErrorElement = document.getElementById(`displayStock-${variantIndex}-${locationIndex}`);
          }
        }

        if (location.mainStock === undefined || location.mainStock === '' || Number.isNaN(Number(location.mainStock))) {
          newErrors[`mainStock-${variantIndex}-${locationIndex}`] = 'Please enter the Main Stock';
          if (!firstErrorElement) {
            firstErrorElement = document.getElementById(`mainStock-${variantIndex}-${locationIndex}`);
          }
        }
      });
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorElement.focus();
      }
      return;
    }

    // No errors — proceed with form data processing
    setFormData1((prevState) => ({
      ...prevState,
      variant: formData.variant.map((variant) => ({
        ...variant,
        location: variant.location.map((location) => ({
          ...location,
          price: location.price !== '' ? parseFloat(location.price) : 0.0,
          gstRate: location.gstRate !== '' ? parseFloat(location.gstRate) : 0.0,
          extraCharge: location.extraCharge !== '' ? parseFloat(location.extraCharge) : 0.0,
          transportCharge: location.transportCharge !== '' ? parseFloat(location.transportCharge) : 0.0,
          displayStock: location.displayStock !== '' ? parseFloat(location.displayStock) : 0.0,
          mainStock: location.mainStock !== '' ? parseFloat(location.mainStock) : 0.0,
          b2cdiscount: location.b2cdiscount !== '' ? parseInt(location.b2cdiscount, 10) : 0,
          b2bdiscount: location.b2bdiscount !== '' ? parseInt(location.b2bdiscount, 10) : 0,
        })),
      })),
    }));

    setIsVariantSaved(true);
    setTimeout(() => setIsVariantSaved(false), 3000);
  };

  const handleFormChange = (event, variantIndex) => {
    const { name, value, type, checked } = event.target;
    const parseditem = ['moq', 'minimunQty'].includes(name);
    if (parseditem) {
      if (name === 'moq') {
        setFormData((prevState) => {
          const updatedVariant = {
            ...prevState.variant[variantIndex],
            [name]: parseFloat(value),
            minimunQty: parseFloat(value) !== 1 ? 1 : 1,
          };
          const updatedForm = {
            ...prevState,
            variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
          };
          return updatedForm;
        });
      } else {
        setFormData((prevState) => {
          const updatedVariant = {
            ...prevState.variant[variantIndex],
            [name]: parseFloat(value),
          };
          const updatedForm = {
            ...prevState,
            variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
          };
          return updatedForm;
        });
      }
    } else if (type === 'checkbox') {
      setFormData((prevState) => {
        const updatedVariant = {
          ...prevState.variant[variantIndex],
          [name]: checked,
        };
        const updatedForm = {
          ...prevState,
          variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
        };
        return updatedForm;
      });
    } else {
      setFormData((prevState) => {
        const updatedVariant = {
          ...prevState.variant[variantIndex],
          [name]: value,
        };
        const updatedForm = {
          ...prevState,
          variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
        };
        return updatedForm;
      });
    }
  };

  const handleSilentFeaturesChange = (silentdesc, variantIndex) => {
    setFormData((prevState) => {
      const updatedVariant = {
        ...prevState.variant[variantIndex],
        silent_features: silentdesc,
      };
      const updatedForm = {
        ...prevState,
        variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
      };
      return updatedForm;
    });
  };

  const handleLocationChange = (event, variantIndex, locationIndex) => {
    const { name, value, checked } = event.target;

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      if (name === 'price' && parseFloat(value) === 0) {
        updatedErrors[`price-${variantIndex}-${locationIndex}`] = 'Price must be greater than 0';
      } else {
        delete updatedErrors[`price-${variantIndex}-${locationIndex}`];
      }
      return updatedErrors;
    });

    setFormData((prevState) => {
      const updatedLocation = {
        ...prevState.variant[variantIndex].location[locationIndex],
        [name]: name === 'gstType' ? checked : value,
      };
      const updatedVariant = {
        ...prevState.variant[variantIndex],
        location: prevState.variant[variantIndex].location.map((location, index) => (index === locationIndex ? updatedLocation : location)),
      };
      const updatedForm = {
        ...prevState,
        variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
      };
      return updatedForm;
    });
  };

  // const handleLocationChange = (event, variantIndex, locationIndex) => {
  //   const { name, value, type, checked } = event.target;

  //   setFormData((prevState) => {
  //     const updatedLocation = {
  //       ...prevState.variant[variantIndex].location[locationIndex],
  //       // eslint-disable-next-line no-nested-ternary
  //       [name]: type === 'checkbox' ? checked : name === 'gstType' ? value === 'true' : value,
  //     };

  //     const updatedVariant = {
  //       ...prevState.variant[variantIndex],
  //       location: prevState.variant[variantIndex].location.map((location, index) => (index === locationIndex ? updatedLocation : location)),
  //     };

  //     const updatedForm = {
  //       ...prevState,
  //       variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
  //     };

  //     return updatedForm;
  //   });
  // };

  const addLocation = (variantIndex) => {
    setFormData((prevState) => {
      const updatedLocation = [...prevState.variant[variantIndex].location, { ...initialLocationState }];
      const updatedVariant = {
        ...prevState.variant[variantIndex],
        location: updatedLocation,
      };
      const updatedForm = {
        ...prevState,
        variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
      };
      return updatedForm;
    });
  };

  const removeLocation = (variantIndex, locationIndex) => {
    setFormData((prevState) => {
      const updatedLocation = prevState.variant[variantIndex].location.filter((_, index) => index !== locationIndex);
      const updatedVariant = {
        ...prevState.variant[variantIndex],
        location: updatedLocation,
      };
      const updatedForm = {
        ...prevState,
        variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
      };
      return updatedForm;
    });
  };

  const addVariant = () => {
    setFormData((prevState) => {
      const lastVariant = prevState.variant[prevState.variant.length - 1] || {};

      // Copy HSN from last variant
      const lastHSN = lastVariant.hsn || '';

      // Copy GST Rate from first location of last variant (if exists)
      const lastGstRate = lastVariant.location?.[0]?.gstRate || '';

      // Build the new variant, starting with your initial state
      const newVariant = {
        ...initialVariantState,
        hsn: lastHSN,
        location: [
          {
            ...initialVariantState.location?.[0],
            gstRate: lastGstRate,
          },
        ],
      };

      return {
        ...prevState,
        variant: [...prevState.variant, newVariant],
      };
    });
  };

  const removeVariant = (variantIndex) => {
    setFormData((prevState) => ({
      ...prevState,
      variant: prevState.variant.filter((_, index) => index !== variantIndex),
    }));
  };

  const { data: data1, refetch } = useQuery(GET_USER_DETAIL);
  useEffect(() => { }, [data1]);
  const pan = data1?.getProfile?.seller?.pancardNo;

  return (
    <>
      <Row>
        <Col xl="12">
          <Card>
            <div className="p-1 mt-2">
              <Form onSubmit={handleSubmit}>
                {/* Variants */}
                {formData.variant.map((variant, variantIndex) => (
                  <>

                    <div className="mark">
                      <div className=" fw-bold ps-4 p-1 fs-6">Advance Details</div>{' '}
                    </div>
                    <div key={variantIndex} className="p-3 border pt-1">
                      {/* Variant Name */}
                      <div className="row">
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`variant[${variantIndex}].variantName`}>
                            <Form.Label className="fw-bold text-dark">
                              Variant Name
                              <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Name for this specific product variant.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              id={`variantName-${variantIndex}`}
                              type="text"
                              name="variantName"
                              value={variant.variantName || ''}
                              onChange={(e) => handleFormChange(e, variantIndex)}
                              isInvalid={!!errors[`variantName-${variantIndex}`]} // Bootstrap invalid style
                            />
                            <Form.Control.Feedback type="invalid">{errors[`variantName-${variantIndex}`]}</Form.Control.Feedback>
                          </Form.Group>
                        </div>

                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`variant[${variantIndex}].hsn`}>
                            <Form.Label className="fw-bold text-dark">
                              HSN <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Harmonized System of Nomenclature code for tax purposes.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              id={`hsn-${variantIndex}`}
                              type="number"
                              onKeyPress={(e) => {
                                if (e.target.value.length >= 8) e.preventDefault();
                              }}
                              name="hsn"
                              value={variant.hsn !== undefined && variant.hsn !== '' ? variant.hsn : ''}
                              onChange={(e) => handleFormChange(e, variantIndex)}
                              onWheel={(e) => e.target.blur()}
                              isInvalid={!!errors[`hsn-${variantIndex}`]}
                            />
                            <Form.Control.Feedback type="invalid">{errors[`hsn-${variantIndex}`]}</Form.Control.Feedback>
                          </Form.Group>
                        </div>
                      </div>

                      <div className="row">
                        {/* minimunQty */}
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`variant[${variantIndex}].minimunQty`}>
                            <Form.Label className="fw-bold text-dark">
                              Minimum Qty <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Minimum quantity a customer can order.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              min={1}
                              name="minimunQty"
                              disabled={variant.moq !== 1}
                              value={variant.moq !== 1 ? 1 : variant.minimunQty || ''}
                              onChange={(e) => handleFormChange(e, variantIndex)}
                            />
                          </Form.Group>
                        </div>

                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`variant[${variantIndex}].moq`}>
                            <Form.Label className="fw-bold text-dark">
                              MOQ <span className="text-danger"> * </span>{' '}
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Minimum order quantity for wholesale (B2B).
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block me-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            <Form.Control
                              type="number"
                              onWheel={(e) => e.target.blur()}
                              min={1}
                              name="moq"
                              value={variant.moq || 1}
                              onChange={(e) => handleFormChange(e, variantIndex)}
                            />
                          </Form.Group>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Form.Label className="fw-bold text-dark">
                          Salient Features{' '}
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top" className="custom-tooltip">
                                Key features or highlights of the product.
                              </Tooltip>
                            }
                          >
                            <div className="d-inline-block me-2">
                              <CsLineIcons icon="info-hexagon" size="17" />
                            </div>
                          </OverlayTrigger>
                        </Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="Salient Features"
                          value={variant.silent_features || ''}
                          onChange={(silentfeaturesss) => handleSilentFeaturesChange(silentfeaturesss, variantIndex)}
                        />
                      </div>

                      {/* Location */}
                      {variant.location.map((location, locationIndex) => (
                        <div key={locationIndex} className="my-3">
                          <div className="mark d-flex align-items-center mb-3">
                            <h5 className="text-bold fw-bold text-dark mb-0">
                              Location {locationIndex + 1}
                            </h5>
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
                              <div className="mb-n3 fw-bold text-dark">
                                Price show{' '}
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
                              </div>
                              <br />
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].gstType`}>
                                <Form.Label className="fw-bold text-dark">
                                  With GST
                                  <Form.Label className="fw-bold text-dark">
                                    <Form.Check
                                      name="gstType"
                                      className="mx-4"
                                      type="switch"
                                      checked={location.gstType}
                                      onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                    />
                                  </Form.Label>
                                  Without GST
                                </Form.Label>
                              </Form.Group>
                            </div>
                            {gstdata && (
                              <div className="col-md-6 mb-2">
                                <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].gstRate`}>
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
                                  <Form.Select
                                    id={`gstRate-${variantIndex}-${locationIndex}`}
                                    name="gstRate"
                                    value={location.gstRate || ''}
                                    onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                    isInvalid={!!errors[`gstRate-${variantIndex}-${locationIndex}`]}
                                  >
                                    <option hidden>GST Rate</option>
                                    {gstdata.map((data, i) => (
                                      <option key={i} value={data.gstRate}>
                                        {data.gstRate}
                                      </option>
                                    ))}
                                  </Form.Select>
                                  <Form.Control.Feedback type="invalid">{errors[`gstRate-${variantIndex}-${locationIndex}`]}</Form.Control.Feedback>
                                </Form.Group>
                              </div>
                            )}

                            {pricedata && (
                              <div className=" col-md-6 mb-2">
                                <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].priceType`}>
                                  <Form.Label className="fw-bold text-dark">
                                    Select Price Type <span className="text-danger"> * </span>{' '}
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
                                  <Form.Select
                                    id={`priceType-${variantIndex}-${locationIndex}`}
                                    name="priceType"
                                    value={location.priceType || ''}
                                    onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                  >
                                    <option hidden>Price Type </option>
                                    {pricedata.map((data, i) => (
                                      <option key={i} value={data.symbol}>
                                        {data.title}
                                      </option>
                                    ))}
                                  </Form.Select>

                                  {/* Add error message here */}
                                  {errors[`priceType-${variantIndex}-${locationIndex}`] && (
                                    <div className="text-danger small mt-1">{errors[`priceType-${variantIndex}-${locationIndex}`]}</div>
                                  )}
                                </Form.Group>
                              </div>
                            )}

                            <div className="col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].price`}>
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
                                  id={`price-${variantIndex}-${locationIndex}`}
                                  type="number"
                                  onWheel={(e) => e.target.blur()}
                                  step="0.01"
                                  name="price"
                                  required
                                  min="0.01"
                                  value={location.price || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                  placeholder="price"
                                />
                                {errors[`price-${variantIndex}-${locationIndex}`] && (
                                  <div className="text-danger small mt-1">{errors[`price-${variantIndex}-${locationIndex}`]}</div>
                                )}
                              </Form.Group>
                            </div>

                            {extraChargedata && (
                              <div className=" col-md-6 mb-2">
                                <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].extraChargeType`}>
                                  <Form.Label className="fw-bold text-dark">
                                    Select Extra Charge Type <span className="text-danger"> * </span>{' '}
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
                                  <Form.Select
                                    id={`extraChargeType-${variantIndex}-${locationIndex}`}
                                    name="extraChargeType"
                                    value={location.extraChargeType || ''}
                                    onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                  >
                                    <option hidden>Extra Charge Type</option>
                                    {extraChargedata.map((data, i) => (
                                      <option key={i} value={data.title}>
                                        {data.title}
                                      </option>
                                    ))}
                                  </Form.Select>
                                  {errors[`extraChargeType-${variantIndex}-${locationIndex}`] && (
                                    <div className="text-danger small mt-1">{errors[`extraChargeType-${variantIndex}-${locationIndex}`]}</div>
                                  )}
                                </Form.Group>
                              </div>
                            )}
                            <div className="col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].extraCharge`}>
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
                                  type="number"
                                  onWheel={(e) => e.target.blur()}
                                  step="0.01"
                                  min={0}
                                  name="extraCharge"
                                  value={location.extraCharge || 0}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                  placeholder="Extra Charge"
                                />
                              </Form.Group>
                            </div>
                            {transportChargedata && (
                              <div className=" col-md-6 mb-2">
                                <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].transportChargeType`}>
                                  <Form.Label className="fw-bold text-dark">
                                    Select Delivery Charge Type <span className="text-danger"> * </span>{' '}
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
                                  <Form.Select
                                    id={`transportChargeType-${variantIndex}-${locationIndex}`}
                                    name="transportChargeType"
                                    value={location.transportChargeType || ''}
                                    onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                  >
                                    <option hidden>Delivery Charge Type</option>
                                    {transportChargedata.map((data, i) => (
                                      <option key={i} value={data.title}>
                                        {data.title}
                                      </option>
                                    ))}
                                  </Form.Select>
                                  {errors[`transportChargeType-${variantIndex}-${locationIndex}`] && (
                                    <div className="text-danger small mt-1">{errors[`transportChargeType-${variantIndex}-${locationIndex}`]}</div>
                                  )}
                                </Form.Group>
                              </div>
                            )}
                            <div className="col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].transportCharge`}>
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
                                  type="number"
                                  onWheel={(e) => e.target.blur()}
                                  step="0.01"
                                  min={0}
                                  name="transportCharge"
                                  value={location.transportCharge || 0}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                  placeholder="Delivery Charge"
                                />
                                {errors[`transportCharge-${variantIndex}-${locationIndex}`] && (
                                  <div className="text-danger small mt-1">{errors[`transportCharge-${variantIndex}-${locationIndex}`]}</div>
                                )}
                              </Form.Group>
                            </div>

                            {finalPricedata && (
                              <div className=" col-md-6 mb-2">
                                <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].finalPrice`}>
                                  <Form.Label className="fw-bold text-dark">
                                    Select Final Price <span className="text-danger"> * </span>{' '}
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
                                  <Form.Select
                                    id={`finalPrice-${variantIndex}-${locationIndex}`}
                                    name="finalPrice"
                                    value={location.finalPrice || ''}
                                    onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                  >
                                    <option hidden>Final Price Type</option>
                                    {finalPricedata.map((data, i) => (
                                      <option key={i} value={data.title}>
                                        {data.title}
                                      </option>
                                    ))}
                                  </Form.Select>
                                  {errors[`finalPrice-${variantIndex}-${locationIndex}`] && (
                                    <div className="text-danger small mt-1">{errors[`finalPrice-${variantIndex}-${locationIndex}`]}</div>
                                  )}
                                </Form.Group>
                              </div>
                            )}
                            {unitData && (
                              <div className=" col-md-6 mb-2">
                                <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].unitType`}>
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
                                  <Form.Select
                                    id={`unitType-${variantIndex}-${locationIndex}`}
                                    name="unitType"
                                    value={location.unitType || ''}
                                    onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                  >
                                    <option hidden>Unit Type</option>
                                    {unitData.map((data, i) => (
                                      <option key={i} value={data.symbol}>
                                        {data.title}
                                      </option>
                                    ))}
                                  </Form.Select>
                                  {errors[`unitType-${variantIndex}-${locationIndex}`] && (
                                    <div className="text-danger small mt-1">{errors[`unitType-${variantIndex}-${locationIndex}`]}</div>
                                  )}
                                </Form.Group>
                              </div>
                            )}

                            <div className="col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].displayStock`}>
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
                                  type="number"
                                  onWheel={(e) => e.target.blur()}
                                  min={0}
                                  step="1"
                                  name="displayStock"
                                  value={location.displayStock || 0}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                                {errors[`displayStock-${variantIndex}-${locationIndex}`] && (
                                  <div className="text-danger small mt-1">{errors[`displayStock-${variantIndex}-${locationIndex}`]}</div>
                                )}
                              </Form.Group>
                            </div>
                            <div className="col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].mainStock`}>
                                <Form.Label className="fw-bold text-dark">
                                  Main Stock <span className="text-danger"> * </span>{' '}
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip-top" className="custom-tooltip">
                                        Total available stock for the product.
                                      </Tooltip>
                                    }
                                  >
                                    <div className="d-inline-block me-2">
                                      <CsLineIcons icon="info-hexagon" size="17" />
                                    </div>
                                  </OverlayTrigger>
                                </Form.Label>
                                <Form.Control
                                  type="number"
                                  onWheel={(e) => e.target.blur()}
                                  min={0}
                                  step="1"
                                  name="mainStock"
                                  value={location.mainStock || 0}
                                  onChange={(e) => {
                                    const { value } = e.target;
                                    if (!value.includes('.')) {
                                      handleLocationChange(e, variantIndex, locationIndex);
                                    }
                                  }}
                                />
                                {errors[`mainStock-${variantIndex}-${locationIndex}`] && (
                                  <div className="text-danger small mt-1">{errors[`mainStock-${variantIndex}-${locationIndex}`]}</div>
                                )}
                              </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].b2bdiscount`}>
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
                                  type="number"
                                  onWheel={(e) => e.target.blur()}
                                  min={0}
                                  name="b2bdiscount"
                                  value={location.b2bdiscount || 0}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </Form.Group>
                            </div>
                            <div className="col-md-6 mb-3">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].b2cdiscount`}>
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
                                  type="number"
                                  onWheel={(e) => e.target.blur()}
                                  min={0}
                                  name="b2cdiscount"
                                  value={location.b2cdiscount || 0}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </Form.Group>
                            </div>

                            <div className="mark">
                              <div className=" fw-bold ps-4 p-1 fs-6">Delivery Pincode Details</div>{' '}
                            </div>
                            <Card>
                              <div className="col-md-12 mb-2">
                                {!pan && (
                                  <>
                                    {/* <div className="fw-bold mt-3">
                                    <span className="ps-0 px-1"> Select Delivery Pincode </span>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip id="tooltip-top" className="custom-tooltip">
                                          Choose delivery locations for the product.
                                        </Tooltip>
                                      }
                                    >
                                      <div className="d-inline-block me-2">
                                        <CsLineIcons icon="info-hexagon" size="17" />
                                      </div>
                                    </OverlayTrigger>
                                  </div> */}

                                    {/* <div className="border rounded ps-3 mb-2 mt-2">
                                    <Form.Check
                                      name="allPincode"
                                      className="mt-2 mb-2"
                                      id={`variant[${variantIndex}].allPincode`}
                                      type="checkbox"
                                      inline
                                      value="true"
                                      disabled={!storeFeaturess?.pincode}
                                      checked={variant.allPincode || ''}
                                      onChange={(e) => handleFormChange(e, variantIndex)}
                                    />
                                    <span className="ps-0 px-1"> All India Delivery </span>
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip id="tooltip-top" className="custom-tooltip">
                                          Enable delivery across all India.
                                        </Tooltip>
                                      }
                                    >
                                      <div className="d-inline-block me-2">
                                        <CsLineIcons icon="info-hexagon" size="17" />
                                      </div>
                                    </OverlayTrigger>
                                  </div> */}
                                  </>
                                )}

                                {storeFeaturess?.pincode && (
                                  <div className="mb-2">
                                    <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].pincode`}>
                                      <DetailAttributeItem
                                        variantIndex={variantIndex}
                                        errors={errors}
                                        deliveryType={variant.deliveryType}
                                        selectedStates={variant.selectedStates}
                                        tags={variant.tags}
                                        onDeliveryTypeChange={(value) => {
                                          setFormData((prev) => {
                                            const updatedVariants = [...prev.variant];
                                            updatedVariants[variantIndex].deliveryType = value;
                                            return { ...prev, variant: updatedVariants };
                                          });
                                        }}
                                        onPincodeChange={(pincodeValues) =>
                                          handlePincodeChange(variantIndex, locationIndex, pincodeValues)
                                        }
                                        onStateChange={(states) => setFormData({ ...formData, states })}
                                        pincodeValues={location.pincode}
                                        allpincode={variant.allPincode}
                                        onAllPincodeChange={(isAllIndia) => {
                                          setFormData((prev) => {
                                            const updatedVariant = {
                                              ...prev.variant[variantIndex],
                                              allPincode: isAllIndia,
                                            };
                                            return {
                                              ...prev,
                                              variant: prev.variant.map((v, i) =>
                                                i === variantIndex ? updatedVariant : v
                                              ),
                                            };
                                          });
                                        }}

                                        formData={formData}
                                        setFormData={setFormData}
                                        handleChange={handleChange}
                                        modules={modules}
                                      />
                                    </Form.Group>

                                  </div>
                                )}
                              </div>
                              {/* Add variant button */}
                              <div className="d-flex justify-content-between">
                                {/* Submit button */}
                                <Button className="ms-3" type="submit" variant={isVariantSaved ? 'success' : 'primary'}>
                                  {isVariantSaved ? 'Saved' : 'Save Variant'}
                                </Button>
                              </div>
                            </Card>
                            {/* Remove location button */}
                            {locationIndex > 0 && (
                              <div>
                                <Button className="mt-2" variant="danger" onClick={() => removeLocation(variantIndex, locationIndex)}>
                                  Remove Location
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {!variant.allPincode && (
                        // <Button variant="primary" onClick={() => addLocation(variantIndex)}>
                        //   Add New Location
                        // </Button>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              Specify a new delivery location, price, or stock point for this variant
                            </Tooltip>
                          }
                        >
                          <Button variant="primary" onClick={() => addLocation(variantIndex)}>
                            Add New Location
                          </Button>
                        </OverlayTrigger>
                      )}

                      {/* Remove variant button */}
                      {variantIndex > 0 && (
                        <Button variant="danger" className="ms-3" onClick={() => removeVariant(variantIndex)}>
                          Remove Variant
                        </Button>
                      )}
                    </div>
                  </>
                ))}

                {/* Add variant button */}
                <div className="d-flex justify-content-between">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Click to add new variant of the product with different features like size, color, or material
                      </Tooltip>
                    }
                  >
                    <Button variant="primary" onClick={addVariant} className="bg-dark">
                      Add New Variant
                    </Button>
                  </OverlayTrigger>

                </div>
              </Form>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default VarientPicker;
