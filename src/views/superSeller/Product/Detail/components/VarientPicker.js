import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import GstTypeData from 'globalValue/attributes dropdown data/GstTypeData';
import PriceTypeData from 'globalValue/attributes dropdown data/PriceTypeData';
import ExtraChargeTypeData from 'globalValue/attributes dropdown data/ExtraChargeTypeData';
import TransportChargeData from 'globalValue/attributes dropdown data/TransportChargeData';
import FinalPriceTypeData from 'globalValue/attributes dropdown data/FinalPriceTypeData';
import UnitTypeData from 'globalValue/attributes dropdown data/UnitTypeData';

const VarientPicker = ({ setProductDetail, productVariant }) => {
  const gstdata = GstTypeData();
  const pricedata = PriceTypeData();
  const unitData = UnitTypeData();
  const extraChargedata = ExtraChargeTypeData();
  const transportChargedata = TransportChargeData();
  const finalPricedata = FinalPriceTypeData();
  const storeFeaturess = StoreFeatures();
  const initialVariantState = {
    variantName: '',
    hsn: '',
    status: true,
    superlocation: [],
  };
  const [formData, setFormData] = useState({
    supervariant: productVariant,
    variant: productVariant || [{ ...initialVariantState }],
  });

  const handleFormChange = (e, variantIndex) => {
    const { name, value, type, checked } = e.target;
    const newVariant = [...formData.variant];
    newVariant[variantIndex] = {
      ...newVariant[variantIndex],
      [name]: type === 'checkbox' ? checked : value,
    };
    if (name === 'active' && !checked) {
      newVariant[variantIndex].active = false;
    }
    setFormData({
      ...formData,
      variant: newVariant,
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setProductDetail((prevState) => {
      const updatedProductDetail = {
        ...prevState,
        variant: formData.variant.map((variant) => ({
          ...variant,
        })),
      }; 
      return updatedProductDetail;
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

  const getParsedValue = (name, value) => {
    if (['b2bdiscount', 'price', 'b2cdiscount', 'extraCharge', 'transportCharge', 'gstRate'].includes(name)) {
      return parseInt(value, 10) || 0;
    }

    if (name === 'pincode') {
      return value
        .split(',')
        .map((p) => parseInt(p.trim(), 10))
        .filter((p) => !Number.isNaN(p) && p > 0 && p <= 2147483647);
    }

    return value;
  };

  const handleLocationChange = (e, variantIndex, locationIndex) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      variant: prevState.variant.map((variant, vIndex) =>
        vIndex === variantIndex
          ? {
              ...variant,
              superlocation: variant.superlocation.map((location, lIndex) =>
                lIndex === locationIndex
                  ? {
                      ...location,
                      [name]: getParsedValue(name, value),
                    }
                  : location
              ),
            }
          : variant
      ),
    }));
  };

  const addLocation = (variantIndex) => {
    const newVariant = [...formData.variant];
    newVariant[variantIndex].superlocation.push({
      pincode: '',
      price: '',
      extraChargeType: '',
      transportChargeType: '',
      transportCharge: '',
      gstRate: '',
      priceType: '',
      finalPrice: '',
      unitType: '',
      allPincode: false,
      status: true,
      mainStock: parseFloat(999999999),
      displayStock: parseFloat(999999999),
    });
    setFormData({ ...formData, variant: newVariant });
  };

  const removeLocation = (variantIndex, locationIndex) => {
    const newVariant = [...formData.variant];
    newVariant[variantIndex].superlocation.splice(locationIndex, 1);
    setFormData({ ...formData, variant: newVariant });
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        {formData.variant?.map((variant, variantIndex) => {
          return (
            <div key={variantIndex}>
              <div className="row m-0">
                <div className="col-md-12 mb-2 bg-info pt-1 rounded">
                  <h4 className="fs-6 pt-1">Variant {variantIndex + 1}</h4>
                </div>
              </div>
              <div className="m-2">
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId={`variant[${variantIndex}].variantName`}>
                      <Form.Label className="fw-bold text-dark">Variant Name</Form.Label>
                      <Form.Control type="text" name="variantName" value={variant.variantName || ''} onChange={(e) => handleFormChange(e, variantIndex)} />
                    </Form.Group>
                  </div>
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId={`variant[${variantIndex}].hsn`}>
                      <Form.Label className="fw-bold text-dark">
                        HSN <span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        onKeyPress={(e) => {
                          if (e.target.value.length >= 8) e.preventDefault();
                        }}
                        name="hsn"
                        min={1}
                        onWheel={(e) => e.target.blur()}
                        value={variant.hsn || ''}
                        onChange={(e) => handleFormChange(e, variantIndex)}
                      />
                    </Form.Group>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId={`variant[${variantIndex}].status`}>
                      <Form.Label className="fw-bold text-dark">
                        <Form.Check type="checkbox" name="status" inline checked={!!variant.status} onChange={(e) => handleFormChange(e, variantIndex)} />
                        Active
                      </Form.Label>
                    </Form.Group>
                  </div>
                </div>
                <div>
                  <h5 className="fw-bold text-dark ps-2">Add Locations</h5>
                  {variant.superlocation.map((location, locationIndex) => (
                    <div key={locationIndex} className="border rounded p-2 my-2">
                      <table className="table table-bordered">
                        <tbody>
                          <tr>
                            <td colSpan="2">
                              <Form.Group>
                                <Form.Label className="text-dark">Pincode</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="pincode"
                                  value={location.pincode}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </Form.Group>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <Form.Group>
                                <Form.Select name="priceType" value={location.priceType} onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}>
                                  <option value="">Select Price Type</option>
                                  {pricedata.map((data, i) => (
                                    <option key={i} value={data.symbol}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                                <Form.Control
                                  type="number"
                                  name="price"
                                  value={location.price}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </Form.Group>
                            </td>
                            <td>
                              <Form.Group>
                                <Form.Select
                                  name="extraChargeType"
                                  value={location.extraChargeType}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option value="">Select</option>
                                  {extraChargedata.map((data, i) => (
                                    <option key={i} value={data.symbol}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                                <Form.Control
                                  type="number"
                                  name="extraCharge"
                                  value={location.extraCharge}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </Form.Group>
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <Form.Select name="finalPrice" value={location.finalPrice} onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}>
                                <option value="">Select</option>
                                {finalPricedata.map((data, i) => (
                                  <option key={i} value={data.symbol}>
                                    {data.title}
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Group>
                                <Form.Control type="number" readOnly value={parseFloat(location.price || 0) + parseFloat(location.extraCharge || 0)} />
                              </Form.Group>
                            </td>
                            <td>
                              <Form.Select
                                name="transportChargeType"
                                value={location.transportChargeType}
                                onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                              >
                                <option value="">Select</option>
                                {transportChargedata.map((data, i) => (
                                  <option key={i} value={data.symbol}>
                                    {data.title}
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Control
                                type="number"
                                name="transportCharge"
                                value={location.transportCharge}
                                onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                              />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              {[
                                { name: 'unitType', label: 'Unit Type', data: unitData, key: 'symbol' },
                                { name: 'gstRate', label: 'GST Rate', data: gstdata, key: 'gstRate' },
                              ].map(({ name, label, data, key }) => (
                                <Form.Group key={name}>
                                  <Form.Select name={name} value={location[name]} onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}>
                                    <option value="">{`Select ${label}`}</option>
                                    {data.map((item, i) => (
                                      <option key={i} value={item[key]}>
                                        {item[key]}
                                        {name === 'gstRate' ? '%' : ''}
                                      </option>
                                    ))}
                                  </Form.Select>
                                </Form.Group>
                              ))}
                            </td>
                            <td>
                              <Form.Group>
                                <Form.Control
                                  type="number"
                                  name="b2cdiscount"
                                  value={location.b2cdiscount}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                                <Form.Control
                                  type="number"
                                  name="b2bdiscount"
                                  value={location.b2bdiscount}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </Form.Group>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <Button variant="danger" onClick={() => removeLocation(variantIndex, locationIndex)}>
                        Remove Location
                      </Button>
                    </div>
                  ))}
                </div>
                <Button onClick={() => addLocation(variantIndex)}>Add Location</Button>
                {variantIndex > 0 && (
                  <Button variant="danger" onClick={() => removeVariant(variantIndex)}>
                    Remove Variant
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        <div className="d-flex justify-content-between">
          <Button className="bg-dark btn btn-primary" onClick={addVariant}>
            Add New Variant
          </Button>
          <Button className="ms-3" type="submit">
            Save Variants
          </Button>
        </div>
      </Form>
    </>
  );
};

export default VarientPicker;
