import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Card, Button } from 'react-bootstrap';
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

const VarientPicker = ({ setFormData1 }) => {
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
    active: true,
    location: [initialLocationState],
  };

  const [formData, setFormData] = useState({
    variant: [initialVariantState],
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

  const handleSubmit = async (event) => {
    event.preventDefault();
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
    const { name, value } = event.target;

    setFormData((prevState) => {
      const updatedLocation = {
        ...prevState.variant[variantIndex].location[locationIndex],
        [name]: name === 'gstType' ? value === 'true' : value,
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
    setFormData((prevState) => ({
      ...prevState,
      variant: [...prevState.variant, { ...initialVariantState }],
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
      <Row>
        <Col xl="12">
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Variants */}
                {formData.variant.map((variant, variantIndex) => (
                  <div key={variantIndex} className="my-3">
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <h4>Variant {variantIndex + 1}</h4>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].active`}>
                          <Form.Label>
                            <Form.Check
                              type="checkbox"
                              name="active"
                              inline
                              value="true"
                              checked={variant.active || ''}
                              onChange={(e) => handleFormChange(e, variantIndex)}
                            />
                            Active
                          </Form.Label>
                        </Form.Group>
                      </div>
                    </div>
                    <div className="row mb-2">
                      <div className=" col-md-6">
                        <Form.Label htmlFor={`variant[${variantIndex}].allPincode`} className="fs-6">
                          Available for all Pincode
                        </Form.Label>
                      </div>
                      <div className=" col-md-6">
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
                    {/* Variant Name */}
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].variantName`}>
                          <Form.Label>Variant Name</Form.Label>
                          <Form.Control type="text" name="variantName" value={variant.variantName || ''} onChange={(e) => handleFormChange(e, variantIndex)} />
                        </Form.Group>
                      </div>

                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].hsn`}>
                          <Form.Label>HSN</Form.Label>
                          <Form.Control
                            type="number"
                            onKeyPress={(e) => {
                              if (e.target.value.length >= 8) e.preventDefault();
                            }}
                            name="hsn"
                            onWheel={(e) => e.target.blur()}
                            value={variant.hsn || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <div className="row">
                      {/* minimunQty */}
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].minimunQty`}>
                          <Form.Label>Minimum Qty</Form.Label>
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
                          <Form.Label>MOQ</Form.Label>
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
                      <Form.Label>Salient Features</Form.Label>
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
                        <h5>Location {locationIndex + 1}</h5>
                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <h5 className="mb-n3">Price show</h5>
                            <br />
                            <Form.Check
                              name="gstType"
                              type="radio"
                              inline
                              id={`variant[${variantIndex}].location[${locationIndex}].gstType`}
                              value="true"
                              checked={location.gstType}
                              onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                            />
                            <Form.Label htmlFor={`variant[${variantIndex}].location[${locationIndex}].gstType`} className="me-3">
                              Without GST
                            </Form.Label>
                            <Form.Check
                              name="gstType"
                              type="radio"
                              inline
                              id={`variant[${variantIndex}].location[${locationIndex}]`}
                              checked={!location.gstType}
                              value="false"
                              onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                            />
                            <Form.Label htmlFor={`variant[${variantIndex}].location[${locationIndex}]`}>With GST</Form.Label>
                          </div>
                          {gstdata && (
                            <div className="col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].gstRate`}>
                                <Form.Label className="fs-6">Gst Rate</Form.Label>
                                <Form.Select
                                  name="gstRate"
                                  value={location.gstRate || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Gst Rate</option>
                                  {/* eslint-disable-next-line */}
                                  {gstdata.map((data, i) => (
                                    <option key={i} value={data.gstRate}>
                                      {data.gstRate}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </div>
                          )}

                          {pricedata && (
                            <div className=" col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].priceType`}>
                                <Form.Label className="fs-6">Price Type</Form.Label>
                                <Form.Select
                                  name="priceType"
                                  value={location.priceType || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Price Type</option>
                                  {/* eslint-disable-next-line */}
                                  {pricedata.map((data, i) => (
                                    <option key={i} value={data.symbol}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </div>
                          )}

                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].price`}>
                              <Form.Label className="fs-6">Price</Form.Label>
                              <Form.Control
                                type="number"
                                onWheel={(e) => e.target.blur()}
                                step="0.01"
                                min={0}
                                name="price"
                                value={location.price || ''}
                                onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                placeholder="Price"
                              />
                            </Form.Group>
                          </div>

                          {extraChargedata && (
                            <div className=" col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].extraChargeType`}>
                                <Form.Label className="fs-6">Extra Charge Type</Form.Label>
                                <Form.Select
                                  name="extraChargeType"
                                  value={location.extraChargeType || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Extra Charge Type</option>
                                  {/* eslint-disable-next-line */}
                                  {extraChargedata.map((data, i) => (
                                    <option key={i} value={data.title}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </div>
                          )}
                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].extraCharge`}>
                              <Form.Label className="fs-6">Extra Charge</Form.Label>
                              <Form.Control
                                type="number"
                                onWheel={(e) => e.target.blur()}
                                step="0.01"
                                min={0}
                                name="extraCharge"
                                value={location.extraCharge || ''}
                                onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                placeholder="Extra Charge"
                              />
                            </Form.Group>
                          </div>
                          {transportChargedata && (
                            <div className=" col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].transportChargeType`}>
                                <Form.Label className="fs-6">Delivery Charge Type</Form.Label>
                                <Form.Select
                                  name="transportChargeType"
                                  value={location.transportChargeType || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Delivery Charge Type</option>
                                  {/* eslint-disable-next-line */}
                                  {transportChargedata.map((data, i) => (
                                    <option key={i} value={data.title}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </div>
                          )}
                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].transportCharge`}>
                              <Form.Label className="fs-6">Delivery Charge</Form.Label>
                              <Form.Control
                                type="number"
                                onWheel={(e) => e.target.blur()}
                                step="0.01"
                                min={0}
                                name="transportCharge"
                                value={location.transportCharge || ''}
                                onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                placeholder="Delivery Charge"
                              />
                            </Form.Group>
                          </div>

                          {finalPricedata && (
                            <div className=" col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].finalPrice`}>
                                <Form.Label className="fs-6">Final Price</Form.Label>
                                <Form.Select
                                  name="finalPrice"
                                  value={location.finalPrice || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Final Price Type</option>
                                  {/* eslint-disable-next-line */}
                                  {finalPricedata.map((data, i) => (
                                    <option key={i} value={data.title}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </div>
                          )}
                          {unitData && (
                            <div className=" col-md-6 mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].unitType`}>
                                <Form.Label className="fs-6">Unit Type</Form.Label>
                                <Form.Select
                                  name="unitType"
                                  value={location.unitType || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Unit Type</option>
                                  {/* eslint-disable-next-line */}
                                  {unitData.map((data, i) => (
                                    <option key={i} value={data.symbol}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </div>
                          )}

                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].displayStock`}>
                              <Form.Label>Display Stock</Form.Label>
                              <Form.Control
                                type="number"
                                onWheel={(e) => e.target.blur()}
                                min={0}
                                step="0.01"
                                name="displayStock"
                                value={location.displayStock || ''}
                                onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                              />
                            </Form.Group>
                          </div>
                          <div className="col-md-6 mb-2">
                            <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].mainStock`}>
                              <Form.Label>Main Stock</Form.Label>
                              <Form.Control
                                type="number"
                                onWheel={(e) => e.target.blur()}
                                min={0}
                                step="0.01"
                                name="mainStock"
                                value={location.mainStock || ''}
                                onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                              />
                            </Form.Group>
                          </div>
                          <div className="col-md-6 mb-3">
                            <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].b2bdiscount`}>
                              <Form.Label>B2B Discount</Form.Label>
                              <Form.Control
                                type="number"
                                onWheel={(e) => e.target.blur()}
                                min={0}
                                name="b2bdiscount"
                                value={location.b2bdiscount || ''}
                                onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                              />
                            </Form.Group>
                          </div>
                          <div className="col-md-6 mb-3">
                            <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].b2cdiscount`}>
                              <Form.Label>B2C Discount</Form.Label>
                              <Form.Control
                                type="number"
                                onWheel={(e) => e.target.blur()}
                                min={0}
                                name="b2cdiscount"
                                value={location.b2cdiscount || ''}
                                onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                              />
                            </Form.Group>
                          </div>

                          {storeFeaturess?.pincode && (
                            <div className="mb-2">
                              <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].pincode`}>
                                <Form.Label className="fs-6">Pincode</Form.Label>
                                <DetailAttributeItem
                                  onPincodeChange={(pincodeValues) => handlePincodeChange(variantIndex, locationIndex, pincodeValues)}
                                  pincodeValues={location.pincode}
                                  allpincode={variant.allPincode}
                                />
                              </Form.Group>
                            </div>
                          )}
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
                      <Button variant="primary" onClick={() => addLocation(variantIndex)}>
                        Add New Location
                      </Button>
                    )}

                    {/* Remove variant button */}
                    {variantIndex > 0 && (
                      <Button variant="danger" className="ms-3" onClick={() => removeVariant(variantIndex)}>
                        Remove Variant
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add variant button */}
                <div className="d-flex justify-content-between">
                  <Button variant="primary" onClick={addVariant}>
                    Add New Variant
                  </Button>

                  {/* Submit button */}
                  <Button className="ms-3" type="submit">
                    Save Variant
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default VarientPicker;
