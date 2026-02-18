import React, { useState } from 'react';
import { Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import GstTypeData from 'globalValue/attributes dropdown data/GstTypeData';
import PriceTypeData from 'globalValue/attributes dropdown data/PriceTypeData';
import ExtraChargeTypeData from 'globalValue/attributes dropdown data/ExtraChargeTypeData';
import TransportChargeData from 'globalValue/attributes dropdown data/TransportChargeData';
import FinalPriceTypeData from 'globalValue/attributes dropdown data/FinalPriceTypeData';
import UnitTypeData from 'globalValue/attributes dropdown data/UnitTypeData';
import DetailAttributeItem from './PincodeComponents/DetailAttributeItem';

const VarientPicker = ({ setProductDetail, productVariant, handleChange }) => {
  const gstdata = GstTypeData();
  const pricedata = PriceTypeData();
  const unitData = UnitTypeData();
  const extraChargedata = ExtraChargeTypeData();
  const transportChargedata = TransportChargeData();
  const finalPricedata = FinalPriceTypeData();
  const storeFeaturess = StoreFeatures();

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

  const initialVariantState = {
    variantName: '',
    moq: 1,
    minimunQty: 1,
    hsn: '',
    silent_features: '',
    allPincode: true,
    active: false,
    location: [initialLocationState],
  };

  const [formData, setFormData] = useState({
    variant: productVariant,
  });

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

  const [isSaved, setIsSaved] = useState(false);

  const [errors, setErrors] = useState({}); // State for inline errors

  const handleSubmit = (event) => {
    event.preventDefault();

    const newErrors = {};
    let firstErrorElement = null;

    formData.variant.forEach((variant, variantIndex) => {

      // ✅ Only require variantName if it's not the first variant
      if (variantIndex > 0 && (!variant.variantName || !variant.variantName.trim())) {
        const key = `variant-${variantIndex}-variantName`;
        newErrors[key] = "Please enter the Variant Name";
        if (!firstErrorElement) {
          firstErrorElement = document.getElementById(key);
        }
      }

      // ✅ Check HSN
      if (!variant.hsn || !variant.hsn.toString().trim()) {
        const key = `variant-${variantIndex}-hsn`;
        newErrors[key] = "Please enter the HSN";
        if (!firstErrorElement) {
          firstErrorElement = document.getElementById(key);
        }
      }

      // Existing location-level checks
      variant.location.forEach((location, locationIndex) => {
        const checks = [
          { field: "gstRate", message: "Please select the GST Rate" },
          { field: "priceType", message: "Please select the Price Type" },
          { field: "price", message: "Please enter the Price", customCheck: val => val === '' || Number.isNaN(Number(val)) },
          { field: "extraChargeType", message: "Please select the Extra Charge Type" },
          { field: "transportChargeType", message: "Please select the Transport Charge Type" },
          { field: "finalPrice", message: "Please select the Final Price Type" },
          { field: "unitType", message: "Please select the Unit Type" }
        ];

        checks.forEach(({ field, message, customCheck }) => {
          const value = location[field];
          const invalid = customCheck ? customCheck(value) : !value;

          if (invalid) {
            const key = `variant-${variantIndex}-location-${locationIndex}-${field}`;
            newErrors[key] = message;

            // Capture the first invalid field
            if (!firstErrorElement) {
              firstErrorElement = document.getElementById(key);
            }
          }
        });
      });
    });

    setErrors(newErrors);

    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      firstErrorElement.focus();
    }

    // If there are errors, scroll to first invalid field
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        firstErrorElement.focus();
      }
      return;
    }

    // Clear errors and proceed
    setErrors({});

    setProductDetail((prevState) => ({
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

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // const handleFormChange = (event, variantIndex) => {
  //   const { name, value, type, checked } = event.target;
  //   setFormData((prevState) => {
  //     const updatedVariant = {
  //       ...prevState.variant[variantIndex],
  //       [name]: type === 'checkbox' ? checked : value,
  //     };
  //     const updatedForm = {
  //       ...prevState,
  //       variant: prevState.variant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
  //     };
  //     return updatedForm;
  //   });
  // };
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
    const lastVariantIndex = formData.variant.length - 1;
    const lastVariant = formData.variant[lastVariantIndex];

    // Check if last variant has a name
    if (!lastVariant.variantName || !lastVariant.variantName.trim()) {
      const key = `variant-${lastVariantIndex}-variantName`;

      // Set error for last variant name
      setErrors((prevErrors) => ({
        ...prevErrors,
        [key]: "Please enter the Variant Name before adding a new one",
      }));

      // Scroll + focus to that field
      const errorElement = document.getElementById(key);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
      return; // ❌ stop execution, don't add new variant
    }

    // ✅ If name exists, then add new variant
    setFormData((prevFormData) => ({
      ...prevFormData,
      variant: [
        ...prevFormData.variant,
        {
          variantName: "",
          hsn: "",
          location: [
            {
              gstRate: "",
              priceType: "",
              price: "",
              extraChargeType: "",
              transportChargeType: "",
              finalPrice: "",
              unitType: "",
            },
          ],
        },
      ],
    }));
  };

  const removeVariant = (variantIndex) => {
    setFormData((prevState) => ({
      ...prevState,
      variant: prevState.variant.filter((_, index) => index !== variantIndex),
    }));
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
      <div className="mark m-0 p-0">
        <div className="fw-bold fs-6 m-0 p-2">Advance Details</div>
      </div>

      <div className="px-3 py-2 mt-2 rounded" style={{ backgroundColor: "#4ad56aff", color: "white", fontSize: "0.95rem" }}>
        <strong>Note:</strong> If you want to add variants to this product, please enter the Variant Name of your existing product, save it, and then click the <strong>" Add New Variant "</strong> button to add a new variant.(Optional)
      </div>


      <Form onSubmit={handleSubmit}>
        {/* Variants */}
        {formData.variant?.map((variant, variantIndex) => {
          return (
            <div key={variantIndex} className="my-3">
              <div className="row">
                <div className="col-md-12 mb-2 bg-info pt-1">
                  <h4 className="fs-6 pt-1">Variant {variantIndex + 1}</h4>
                </div>
              </div>

              {/* Variant Name */}
              <div className="row">
                <div className="col-md-6 mb-2">
                  <Form.Group controlId={`variant[${variantIndex}].variantName`}>
                    <Form.Label className="fw-bold text-dark">
                      Variant Name
                      {/* Show * only if not the very first variant */}
                      {variantIndex > 0 && <span className="text-danger"> * </span>}
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
                      id={`variant-${variantIndex}-variantName`}
                      type="text"
                      name="variantName"
                      value={variant.variantName || ""}
                      onChange={(e) => handleFormChange(e, variantIndex)}
                      // ✅ Show invalid state only if error exists
                      isInvalid={!!errors[`variant-${variantIndex}-variantName`]}
                    />

                    {/* ✅ Always render feedback if error exists */}
                    {errors[`variant-${variantIndex}-variantName`] && (
                      <Form.Control.Feedback type="invalid">
                        {errors[`variant-${variantIndex}-variantName`]}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId={`variant[${variantIndex}].hsn`}>
                    <Form.Label className="fw-bold text-dark">
                      HSN <span className="text-danger"> * </span>
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
                      id={`variant-${variantIndex}-hsn`} // matches error key
                      type="number"
                      onKeyPress={(e) => {
                        if (e.target.value.length >= 8) e.preventDefault();
                      }}
                      name="hsn"
                      onWheel={(e) => e.target.blur()}
                      value={variant.hsn || ''}
                      onChange={(e) => handleFormChange(e, variantIndex)}
                    />
                    {errors[`variant-${variantIndex}-hsn`] && (
                      <small className="text-danger">
                        {errors[`variant-${variantIndex}-hsn`]}
                      </small>
                    )}

                  </Form.Group>
                </div>

              </div>

              <div className="row">
                {/* minimunQty */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId={`variant[${variantIndex}].minimunQty`}>
                    <Form.Label className="fw-bold text-dark">
                      Minimum Qty <span className="text-danger"> * </span>
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
                      disabled={variant.moq !== 1}
                      name="minimunQty"
                      value={variant.moq !== 1 ? 1 : variant.minimunQty || ''}
                      onChange={(e) => handleFormChange(e, variantIndex)}
                    />
                  </Form.Group>
                </div>
                {/* MOQ */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId={`variant[${variantIndex}].moq`}>
                    <Form.Label className="fw-bold text-dark">
                      MOQ <span className="text-danger"> * </span>
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
                <Form.Label className="fw-bold text-dark">Salient Features
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Key features or highlights of the product.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block ms-2">
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
                      <h5 className="mb-n3 fw-bold text-dark">Price show
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              Choose how price is shown to customers (inclusive or exclusive of GST).
                            </Tooltip>
                          }
                        >
                          <div className="d-inline-block ms-2">
                            <CsLineIcons icon="info-hexagon" size="17" />
                          </div>
                        </OverlayTrigger>
                      </h5>
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
                            GST Rate <span className="text-danger"> * </span>
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
                            id={`variant-${variantIndex}-location-${locationIndex}-gstRate`} // unique id for scrolling
                            name="gstRate"
                            value={location.gstRate || ''}
                            className={errors[`variant-${variantIndex}-location-${locationIndex}-gstRate`] ? 'is-invalid' : ''} // red border if error
                            onChange={(e) => {
                              handleLocationChange(e, variantIndex, locationIndex);
                              // remove error immediately if user selects a value
                              setErrors(prev => {
                                const updated = { ...prev };
                                delete updated[`variant-${variantIndex}-location-${locationIndex}-gstRate`];
                                return updated;
                              });
                            }}
                          >
                            <option value="" hidden>
                              GST Rate
                            </option>
                            {gstdata.map((data, i) => (
                              <option key={i} value={data.gstRate}>
                                {data.gstRate}
                              </option>
                            ))}
                          </Form.Select>

                          {/* Inline error message */}
                          {errors[`variant-${variantIndex}-location-${locationIndex}-gstRate`] && (
                            <div className="text-danger small">
                              {errors[`variant-${variantIndex}-location-${locationIndex}-gstRate`]}
                            </div>
                          )}
                        </Form.Group>
                      </div>
                    )}

                    {pricedata && (
                      <div className=" col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].priceType`}>
                          <Form.Label className="fw-bold text-dark">
                            Price Type <span className="text-danger"> * </span>
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
                            id={`variant-${variantIndex}-location-${locationIndex}-priceType`} // unique id for scrolling
                            name="priceType"
                            value={location.priceType || ''}
                            className={errors[`variant-${variantIndex}-location-${locationIndex}-priceType`] ? 'is-invalid' : ''}
                            onChange={(e) => {
                              handleLocationChange(e, variantIndex, locationIndex);
                              // clear error immediately on change
                              setErrors(prev => {
                                const updated = { ...prev };
                                delete updated[`variant-${variantIndex}-location-${locationIndex}-priceType`];
                                return updated;
                              });
                            }}
                          >
                            <option value="" hidden>
                              Price Type
                            </option>
                            {pricedata.map((data, i) => (
                              <option key={i} value={data.symbol}>
                                {data.title}
                              </option>
                            ))}
                          </Form.Select>

                          {/* Inline error text */}
                          {errors[`variant-${variantIndex}-location-${locationIndex}-priceType`] && (
                            <div className="text-danger small">
                              {errors[`variant-${variantIndex}-location-${locationIndex}-priceType`]}
                            </div>
                          )}
                        </Form.Group>
                      </div>
                    )}

                    <div className="col-md-6 mb-2">
                      <Form.Group
                        controlId={`variant-${variantIndex}-location-${locationIndex}-price`} // match error key for scroll
                      >
                        <Form.Label className="fw-bold text-dark">
                          Price <span className="text-danger">* </span>
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
                          id={`variant-${variantIndex}-location-${locationIndex}-price`} // needed for scrollIntoView
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          step="0.01"
                          name="price"
                          value={location.price || ''}
                          className={errors[`variant-${variantIndex}-location-${locationIndex}-price`] ? 'is-invalid' : ''}
                          placeholder="Price"
                          onChange={(e) => {
                            handleLocationChange(e, variantIndex, locationIndex);
                            // remove error on change
                            setErrors(prev => {
                              const updated = { ...prev };
                              delete updated[`variant-${variantIndex}-location-${locationIndex}-price`];
                              return updated;
                            });
                          }}
                        />

                        {/* Inline error message */}
                        {errors[`variant-${variantIndex}-location-${locationIndex}-price`] && (
                          <div className="text-danger small">
                            {errors[`variant-${variantIndex}-location-${locationIndex}-price`]}
                          </div>
                        )}
                      </Form.Group>

                    </div>

                    {extraChargedata && (
                      <div className=" col-md-6 mb-2">
                        <Form.Group
                          controlId={`variant-${variantIndex}-location-${locationIndex}-extraChargeType`}
                        >
                          <Form.Label className="fw-bold text-dark">
                            Extra Charge Type <span className="text-danger">* </span>
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
                            id={`variant-${variantIndex}-location-${locationIndex}-extraChargeType`} // for scrollIntoView
                            name="extraChargeType"
                            value={location.extraChargeType || ''}
                            className={
                              errors[`variant-${variantIndex}-location-${locationIndex}-extraChargeType`] ? 'is-invalid' : ''
                            }
                            onChange={(e) => {
                              handleLocationChange(e, variantIndex, locationIndex);
                              // Remove error when user changes value
                              setErrors(prev => {
                                const updated = { ...prev };
                                delete updated[`variant-${variantIndex}-location-${locationIndex}-extraChargeType`];
                                return updated;
                              });
                            }}
                          >
                            <option value="" hidden>
                              Extra Charge Type
                            </option>
                            {extraChargedata.map((data, i) => (
                              <option key={i} value={data.title}>
                                {data.title}
                              </option>
                            ))}
                          </Form.Select>

                          {/* Inline error message */}
                          {errors[`variant-${variantIndex}-location-${locationIndex}-extraChargeType`] && (
                            <div className="text-danger small">
                              {errors[`variant-${variantIndex}-location-${locationIndex}-extraChargeType`]}
                            </div>
                          )}
                        </Form.Group>

                      </div>
                    )}
                    <div className="col-md-6 mb-2">
                      <Form.Group
                        controlId={`variant-${variantIndex}-location-${locationIndex}-extraCharge`}
                      >
                        <Form.Label className="fw-bold text-dark">
                          Extra Charge <span className="text-danger">* </span>
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
                          id={`variant-${variantIndex}-location-${locationIndex}-extraCharge`} // needed for scroll
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          step="0.01"
                          name="extraCharge"
                          min={0}
                          value={location.extraCharge || ''}
                          className={errors[`variant-${variantIndex}-location-${locationIndex}-extraCharge`] ? 'is-invalid' : ''}
                          placeholder="Extra Charge"
                          onChange={(e) => {
                            handleLocationChange(e, variantIndex, locationIndex);
                            // remove error immediately on change
                            setErrors(prev => {
                              const updated = { ...prev };
                              delete updated[`variant-${variantIndex}-location-${locationIndex}-extraCharge`];
                              return updated;
                            });
                          }}
                        />

                        {/* Inline error message */}
                        {errors[`variant-${variantIndex}-location-${locationIndex}-extraCharge`] && (
                          <div className="text-danger small">
                            {errors[`variant-${variantIndex}-location-${locationIndex}-extraCharge`]}
                          </div>
                        )}
                      </Form.Group>

                    </div>
                    {transportChargedata && (
                      <div className=" col-md-6 mb-2">
                        <Form.Group
                          controlId={`variant-${variantIndex}-location-${locationIndex}-transportChargeType`}
                        >
                          <Form.Label className="fw-bold text-dark">
                            Transport Charge Type <span className="text-danger">* </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose how transport charge is applied.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>

                          <Form.Select
                            id={`variant-${variantIndex}-location-${locationIndex}-transportChargeType`} // for scrollIntoView
                            name="transportChargeType"
                            value={location.transportChargeType || ''}
                            className={errors[`variant-${variantIndex}-location-${locationIndex}-transportChargeType`] ? 'is-invalid' : ''}
                            onChange={(e) => {
                              handleLocationChange(e, variantIndex, locationIndex);
                              // Remove error immediately after user changes value
                              setErrors(prev => {
                                const updated = { ...prev };
                                delete updated[`variant-${variantIndex}-location-${locationIndex}-transportChargeType`];
                                return updated;
                              });
                            }}
                          >
                            <option value="" hidden>
                              Transport Charge Type
                            </option>
                            {transportChargedata.map((data, i) => (
                              <option key={i} value={data.title}>
                                {data.title}
                              </option>
                            ))}
                          </Form.Select>

                          {/* Inline error message */}
                          {errors[`variant-${variantIndex}-location-${locationIndex}-transportChargeType`] && (
                            <div className="text-danger small">
                              {errors[`variant-${variantIndex}-location-${locationIndex}-transportChargeType`]}
                            </div>
                          )}
                        </Form.Group>
                      </div>
                    )}
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].transportCharge`}>
                        <Form.Label className="fw-bold text-dark">
                          Transport Charge <span className="text-danger"> *</span>
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
                          placeholder="transportCharge"
                        />
                      </Form.Group>
                    </div>

                    {finalPricedata && (
                      <div className=" col-md-6 mb-2">
                        <Form.Group
                          controlId={`variant-${variantIndex}-location-${locationIndex}-finalPrice`}
                        >
                          <Form.Label className="fw-bold text-dark">
                            Final Price <span className="text-danger">* </span>
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
                            id={`variant-${variantIndex}-location-${locationIndex}-finalPrice`} // for scrollIntoView
                            name="finalPrice"
                            value={location.finalPrice || ''}
                            className={
                              errors[`variant-${variantIndex}-location-${locationIndex}-finalPrice`] ? 'is-invalid' : ''
                            }
                            onChange={(e) => {
                              handleLocationChange(e, variantIndex, locationIndex);
                              // Remove error when value changes
                              setErrors(prev => {
                                const updated = { ...prev };
                                delete updated[`variant-${variantIndex}-location-${locationIndex}-finalPrice`];
                                return updated;
                              });
                            }}
                          >
                            <option value="" hidden>
                              Final Price Type
                            </option>
                            {finalPricedata.map((data, i) => (
                              <option key={i} value={data.title}>
                                {data.title}
                              </option>
                            ))}
                          </Form.Select>

                          {/* Inline error message */}
                          {errors[`variant-${variantIndex}-location-${locationIndex}-finalPrice`] && (
                            <div className="text-danger small">
                              {errors[`variant-${variantIndex}-location-${locationIndex}-finalPrice`]}
                            </div>
                          )}
                        </Form.Group>
                      </div>
                    )}
                    {unitData && (
                      <div className=" col-md-6 mb-2">
                        <Form.Group
                          controlId={`variant-${variantIndex}-location-${locationIndex}-unitType`}
                        >
                          <Form.Label className="fw-bold text-dark">
                            Unit Type <span className="text-danger">* </span>
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
                            id={`variant-${variantIndex}-location-${locationIndex}-unitType`} // for scrollIntoView
                            name="unitType"
                            value={location.unitType || ''}
                            className={
                              errors[`variant-${variantIndex}-location-${locationIndex}-unitType`] ? 'is-invalid' : ''
                            }
                            onChange={(e) => {
                              handleLocationChange(e, variantIndex, locationIndex);
                              // Remove error when user changes value
                              setErrors(prev => {
                                const updated = { ...prev };
                                delete updated[`variant-${variantIndex}-location-${locationIndex}-unitType`];
                                return updated;
                              });
                            }}
                          >
                            <option value="" hidden>
                              Unit Type
                            </option>
                            {unitData.map((data, i) => (
                              <option key={i} value={data.symbol}>
                                {data.title}
                              </option>
                            ))}
                          </Form.Select>

                          {/* Inline error message */}
                          {errors[`variant-${variantIndex}-location-${locationIndex}-unitType`] && (
                            <div className="text-danger small">
                              {errors[`variant-${variantIndex}-location-${locationIndex}-unitType`]}
                            </div>
                          )}
                        </Form.Group>

                      </div>
                    )}
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].displayStock`}>
                        <Form.Label className="fw-bold text-dark">
                          Display Stock <span className="text-danger"> * </span>
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
                          required
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].mainStock`}>
                        <Form.Label className="fw-bold text-dark">
                          Main Stock <span className="text-danger"> * </span>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top" className="custom-tooltip">
                                Total available stock for the product.
                                Main Stock should be greater than Display Stock.
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
                          onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                          required
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].b2bdiscount`}>
                        <Form.Label className="fw-bold text-dark">B2B Discount
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top" className="custom-tooltip">
                                Discount applicable for business buyers.
                              </Tooltip>
                            }
                          >
                            <div className="d-inline-block ms-2">
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
                          required
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].b2cdiscount`}>
                        <Form.Label className="fw-bold text-dark">B2C Discount
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top" className="custom-tooltip">
                                Discount applicable for retail customers.
                              </Tooltip>
                            }
                          >
                            <div className="d-inline-block ms-2">
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
                          required
                        />
                      </Form.Group>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].active`}>
                          <Form.Label className="fw-bold text-dark">
                            <Form.Check
                              type="checkbox"
                              name="active"
                              inline
                              value="true"
                              checked={variant.active || ''}
                              onChange={(e) => handleFormChange(e, variantIndex)}
                            />
                            Product Active
                          </Form.Label>
                        </Form.Group>
                      </div>
                      <div className="row mb-2 col-md-6">
                        <div className=" col-md-10">
                          <Form.Label htmlFor={`variant[${variantIndex}].allPincode`} className="fw-bold text-dark">
                            Available for all Pincode
                          </Form.Label>
                        </div>
                        <div className=" col-md-2">
                          <Form.Check
                            name="allPincode"
                            className="ms-3"
                            id={`variant[${variantIndex}].allPincode`}
                            type="checkbox"
                            inline
                            value="true"
                            disabled={!storeFeaturess?.pincode}
                            checked={variant.allPincode || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                          />
                        </div>
                      </div>
                    </div>
                    {storeFeaturess?.pincode && (
                      <div className="mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].pincode`}>
                          <Form.Label className="fw-bold text-dark">Pincode</Form.Label>
                          <DetailAttributeItem
                            onPincodeChange={(pincodeValues) => handlePincodeChange(variantIndex, locationIndex, pincodeValues)}
                            pincodeValues={location.pincode}
                            allpincode={variant.allPincode}
                          />
                        </Form.Group>
                      </div>
                    )}
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

              {/* Add location button */}
              {!variant.allPincode && (
                <Button
                  variant="primary"
                  className="me-2"   // ✅ Adds right-side margin
                  onClick={() => addLocation(variantIndex)}
                >
                  Add New Location
                </Button>
              )}

              {/* Remove variant button */}
              {variantIndex > 0 && (
                <Button
                  variant="danger"
                  onClick={() => removeVariant(variantIndex)}
                >
                  Remove Variant
                </Button>
              )}
            </div>
          );
        })}

        {/* Add variant button */}
        <div className="d-flex justify-content-between">
          <Button className="bg-dark btn btn-primary" onClick={addVariant}>
            Add New Variant
          </Button>

          {/* Submit button */}
          <Button
            className="ms-3"
            type="submit"
            variant={isSaved ? "success" : "primary"}
          >
            {isSaved ? "Saved" : "Save Variants"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default VarientPicker;
