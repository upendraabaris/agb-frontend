import React, { useState } from 'react';
import { Col, Form, Card, Button } from 'react-bootstrap';
import GstTypeData from 'globalValue/attributes dropdown data/GstTypeData';
import PriceTypeData from 'globalValue/attributes dropdown data/PriceTypeData';
import ExtraChargeTypeData from 'globalValue/attributes dropdown data/ExtraChargeTypeData';
import TransportChargeData from 'globalValue/attributes dropdown data/TransportChargeData';
import FinalPriceTypeData from 'globalValue/attributes dropdown data/FinalPriceTypeData';
import UnitTypeData from 'globalValue/attributes dropdown data/UnitTypeData';

const VarientPicker = ({ setFormData1 }) => {
  const gstdata = GstTypeData();
  const pricedata = PriceTypeData();
  const unitData = UnitTypeData();
  const extraChargedata = ExtraChargeTypeData();
  const transportChargedata = TransportChargeData();
  const finalPricedata = FinalPriceTypeData();
  const initialVariantState = {
    variantName: '',
    hsn: '',
    status: true,
    superlocation: [],
  };
  const [formData, setFormData] = useState({ supervariant: [initialVariantState] });
  const [message, setMessage] = useState('');
  const handlePincodeChange = (variantIndex) => {
    setFormData((prevState) => {
      const updatedVariant = {
        ...prevState.supervariant[variantIndex],
      };
      const updatedForm = {
        ...prevState,
        supervariant: prevState.supervariant.map((supervariant, index) => (index === variantIndex ? updatedVariant : supervariant)),
      };
      return updatedForm;
    });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const filteredVariants = formData.supervariant.map(({ status, ...validData }) => validData);
    setFormData1((prevState) => {
      const updatedState = {
        ...prevState,
        supervariant: filteredVariants,
      };
      return updatedState;
    });
    setMessage('✅');
  };
  const handleFormChange = (event, variantIndex) => {
    const { name, value, type, checked } = event.target;
    const intFields = ['gstRate', 'price', 'b2bdiscount', 'b2cdiscount', 'extraCharge', 'transportCharge'];
    if (intFields.includes(name)) {
      setFormData((prevState) => {
        const updatedVariant = {
          ...prevState.supervariant[variantIndex],
          [name]: parseInt(value, 10),
        };
        const updatedForm = {
          ...prevState,
          supervariant: prevState.supervariant.map((supervariant, index) => (index === variantIndex ? updatedVariant : supervariant)),
        };
        return updatedForm;
      });
    } else if (type === 'checkbox') {
      setFormData((prevState) => {
        const updatedVariant = {
          ...prevState.supervariant[variantIndex],
          [name]: checked,
        };
        const updatedForm = {
          ...prevState,
          supervariant: prevState.supervariant.map((supervariant, index) => (index === variantIndex ? updatedVariant : supervariant)),
        };
        return updatedForm;
      });
    } else {
      setFormData((prevState) => {
        const updatedVariant = {
          ...prevState.supervariant[variantIndex],
          [name]: value,
        };
        const updatedForm = {
          ...prevState,
          supervariant: prevState.supervariant.map((supervariant, index) => (index === variantIndex ? updatedVariant : supervariant)),
        };
        return updatedForm;
      });
    }
  };
  const handleLocationChange = (e, variantIndex, locationIndex) => {
    const { name, value } = e.target;
    let updatedValue;
    if (name === 'pincode') {
      updatedValue = value
        .split(',')
        .map((pin) => {
          const parsedPin = parseInt(pin.trim(), 10);
          return Number.isNaN(parsedPin) ? null : parsedPin;
        })
        .filter((pin) => pin !== null);
    } else if (name === 'gstRate') {
      updatedValue = parseInt(value, 10) || 0;
    } else if (['b2bdiscount', 'b2cdiscount', 'extraCharge', 'price', 'transportCharge'].includes(name)) {
      updatedValue = parseFloat(value);
    } else {
      updatedValue = value;
    }
    setFormData((prev) => {
      const updatedVariant = { ...prev.supervariant[variantIndex] };
      updatedVariant.superlocation[locationIndex] = {
        ...updatedVariant.superlocation[locationIndex],
        [name]: updatedValue,
        status: true,
      };
      return {
        ...prev,
        supervariant: prev.supervariant.map((v, i) => (i === variantIndex ? updatedVariant : v)),
      };
    });
  };
  const addLocation = (variantIndex) => {
    setFormData((prevState) => {
      const updatedVariants = [...prevState.supervariant];
      updatedVariants[variantIndex].superlocation.push({
        pincode: '',
        extraChargeType: '',
        transportChargeType: '',
        gstRate: '',
        priceType: '',
        finalPrice: '',
        unitType: '',
        allPincode: false,
        status: true,
        mainStock: parseFloat(999999999),
        displayStock: parseFloat(999999999),
      });
      return { ...prevState, supervariant: updatedVariants };
    });
  };
  const removeLocation = (variantIndex, locationIndex) => {
    setFormData((prevState) => {
      const updatedVariants = [...prevState.supervariant];
      updatedVariants[variantIndex].superlocation = updatedVariants[variantIndex].superlocation.filter((_, index) => index !== locationIndex);
      return { ...prevState, supervariant: updatedVariants };
    });
  };
  const addVariant = () => {
    setFormData((prevState) => ({
      ...prevState,
      supervariant: [...prevState.supervariant, { ...initialVariantState }],
    }));
  };
  const removeVariant = (variantIndex) => {
    setFormData((prevState) => ({
      ...prevState,
      supervariant: prevState.supervariant.filter((_, index) => index !== variantIndex),
    }));
  };

  return (
    <>
      <Col>
        <Card>
          <div>
            <Form onSubmit={handleSubmit}>
              {formData.supervariant.map((supervariant, variantIndex) => (
                <div key={variantIndex} className="border">
                  <div>
                    <h2 className="small-title bg-info text-white ps-4 p-2 pt-2 rounded-1">Variant {variantIndex + 1}</h2>
                  </div>
                  <div className="p-3">
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`supervariant[${variantIndex}].variantName`}>
                          <Form.Label className="fw-bold text-dark">Variant Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="variantName"
                            value={supervariant.variantName || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-4 mb-2">
                        <Form.Group controlId={`supervariant[${variantIndex}].hsn`}>
                          <Form.Label className="fw-bold text-dark">
                            HSN <span className="text-danger"> * </span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            onKeyPress={(e) => {
                              if (e.target.value.length >= 8) e.preventDefault();
                            }}
                            name="hsn"
                            onWheel={(e) => e.target.blur()}
                            value={supervariant.hsn || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-2 mb-2">
                        <Form.Group controlId={`supervariant[${variantIndex}].status`}>
                          <Form.Label className="fw-bold text-dark">
                            <div className="w-100">Product Active</div>
                            <Form.Check
                              type="checkbox"
                              name="status"
                              inline
                              value="true"
                              checked={supervariant.status || false}
                              onChange={(e) => handleFormChange(e, variantIndex)}
                            />
                          </Form.Label>
                        </Form.Group>
                      </div>
                    </div>
                    <div className="p-2 border rounded">
                      <table className="table">
                        {supervariant.superlocation.map((location, locationIndex) => (
                          <tbody key={locationIndex}>
                            <tr>
                              <td colSpan={7} className="p-2">
                                <h5 className="fw-bold text-dark rounded-lg bg-gradient-info px-3 py-2 mb-0 small shadow-sm">
                                  📍 Add Location {locationIndex + 1}
                                </h5>
                              </td>
                            </tr>

                            <tr className="w-100">
                              <td colSpan={7}>
                                <Form.Control
                                  as="textarea"
                                  type="text"
                                  name="pincode"
                                  placeholder="Pincode"
                                  value={location.pincode}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <Form.Select
                                  name="priceType"
                                  value={location.priceType || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Select Price Type</option>
                                  {pricedata.map((data, i) => (
                                    <option key={i} value={data.symbol}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                                <Form.Control
                                  type="number"
                                  name="price"
                                  placeholder="Price"
                                  value={location.price}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </td>
                              <td>
                                <Form.Select
                                  name="extraChargeType"
                                  value={location.extraChargeType || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Select Extra Charge Type</option>
                                  {extraChargedata.map((data, i) => (
                                    <option key={i} value={data.symbol}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                                <Form.Control
                                  type="number"
                                  name="extraCharge"
                                  placeholder="Extra Charge"
                                  value={location.extraCharge}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </td>
                              <td>
                                <Form.Select
                                  name="finalPrice"
                                  value={location.finalPrice || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Select Final Price</option>
                                  {finalPricedata.map((data, i) => (
                                    <option key={i} value={data.title}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                                <span className="border text-center bg-light rounded p-2 w-100 d-block">
                                  {Number(location.price || 0) + Number(location.extraCharge || 0)}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <Form.Select
                                  name="transportChargeType"
                                  value={location.transportChargeType || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Select Transport Charge Type</option>
                                  {transportChargedata.map((data, i) => (
                                    <option key={i} value={data.symbol}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                                <Form.Control
                                  type="number"
                                  name="transportCharge"
                                  placeholder="Delivery Charge"
                                  value={location.transportCharge}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                              </td>
                              <td>
                                <Form.Select
                                  name="unitType"
                                  value={location.unitType || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Select Unit Type</option>
                                  {unitData.map((data, i) => (
                                    <option key={i} value={data.symbol}>
                                      {data.title}
                                    </option>
                                  ))}
                                </Form.Select>
                                <Form.Select
                                  name="gstRate"
                                  value={location.gstRate || ''}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                >
                                  <option hidden>Select GST Rate</option>
                                  {gstdata.map((data, i) => (
                                    <option key={i} value={data.gstRate}>
                                      {data.gstRate}%
                                    </option>
                                  ))}
                                </Form.Select>
                              </td>
                              <td>
                                <Form.Control
                                  type="number"
                                  name="b2bdiscount"
                                  placeholder="B2B Discount"
                                  value={location.b2bdiscount}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                                <Form.Control
                                  type="number"
                                  name="b2cdiscount"
                                  placeholder="B2C Discount"
                                  value={location.b2cdiscount}
                                  onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                                />
                                {supervariant.superlocation.length > 1 && (
                                  <Button
                                    variant="white"
                                    className="p-0 pt-2 w-100 text-center p-2 mt-1 border rounded"
                                    onClick={() => removeLocation(variantIndex, locationIndex)}
                                  >
                                    ❌ Remove Locations
                                  </Button>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        ))}
                      </table>
                      <Button variant="dark" className="mt-2" onClick={() => addLocation(variantIndex)}>
                        Add New Location
                      </Button>
                    </div>
                    {variantIndex > 0 && (
                      <Button supervariant="danger" className="ms-3" onClick={() => removeVariant(variantIndex)}>
                        Remove Variant
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              <div className="d-flex p-2 justify-content-between">
                <Button supervariant="primary" onClick={addVariant} className="bg-dark">
                  Add New Variant
                </Button>
                {message && <span className="text-success w-100 text-end ms-2 pt-2">{message}</span>}
                <Button className="ms-3" type="submit">
                  Save Variant
                </Button>
              </div>
            </Form>
          </div>
        </Card>
      </Col>
    </>
  );
};

export default VarientPicker;
