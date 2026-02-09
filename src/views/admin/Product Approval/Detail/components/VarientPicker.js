import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
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

const VarientPicker = ({ setProductDetail, productVariant }) => {
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
  const handleFormChange = (event, variantIndex) => {
    console.log(variantIndex);
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
    event.preventDefault();
  };

  return (
    <>
      <Form>
        {formData.variant?.map((variant, variantIndex) => {
          return (
            <div key={variantIndex} className="my-3">
              <div className="row">
                <div className="col-md-12 mb-2">
                  <h4 className="fw-bold">Variant {variantIndex + 1}</h4>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <Form.Group controlId={`variant[${variantIndex}].variantName`}>
                    <Form.Label className="fw-bold text-dark">Variant Name</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      name="variantName"
                      value={variant.variantName || ''}
                      onChange={(e) => handleFormChange(e, variantIndex)}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-2">
                  <Form.Group controlId={`variant[${variantIndex}].moq`}>
                    <Form.Label className="fw-bold text-dark">MOQ</Form.Label>
                    <Form.Control
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      min={1}
                      name="moq"
                      value={variant.moq || ''}
                      onChange={(e) => handleFormChange(e, variantIndex)}
                      disabled
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <Form.Group controlId={`variant[${variantIndex}].hsn`}>
                    <Form.Label className="fw-bold text-dark">HSN</Form.Label>
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
                      disabled
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-2">
                  <Form.Group controlId={`variant[${variantIndex}].minimunQty`}>
                    <Form.Label className="fw-bold text-dark">Minimum Qty</Form.Label>
                    <Form.Control
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      min={0}
                      name="minimunQty"
                      value={variant.minimunQty || ''}
                      onChange={(e) => handleFormChange(e, variantIndex)}
                      disabled
                    />
                  </Form.Group>
                </div>
              </div>
              <div className="mb-3">
                <Form.Label className="fw-bold text-dark">Silent features</Form.Label>
                <ReactQuill
                  modules={modules}
                  theme="snow"
                  placeholder="Silent Features"
                  value={variant.silent_features || ''}
                  disabled
                  onChange={(silentfeaturesss) => handleSilentFeaturesChange(silentfeaturesss, variantIndex)}
                />
              </div>
              {variant.location.map((location, locationIndex) => (
                <div key={locationIndex} className="my-3">
                  <h5 className="fw-bold text-dark">Location {locationIndex + 1}</h5>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <h5 className="mb-n3 fw-bold text-dark">Price show</h5>
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
                          <Form.Label className="fw-bold text-dark">Gst Rate</Form.Label>
                          <Form.Select name="gstRate" value={location.gstRate || ''} onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}>
                            <option hidden>Gst Rate</option>
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
                          <Form.Label className="fw-bold text-dark">Price Type</Form.Label>
                          <Form.Select name="priceType" value={location.priceType || ''} onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)} disabled >
                            <option hidden>Price Type</option>
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
                        <Form.Label className="fw-bold text-dark">Price</Form.Label>
                        <Form.Control
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          step="0.01"
                          name="price"
                          min={0}
                          value={location.price || 0}
                          onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                          placeholder="price"
                          disabled
                        />
                      </Form.Group>
                    </div>
                    {extraChargedata && (
                      <div className=" col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].extraChargeType`}>
                          <Form.Label className="fw-bold text-dark">Extra Charge Type</Form.Label>
                          <Form.Select
                            name="extraChargeType"
                            value={location.extraChargeType || ''}
                            onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                            disabled
                          >
                            <option hidden>Extra Charge Type</option>
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
                        <Form.Label className="fw-bold text-dark">Extra Charge</Form.Label>
                        <Form.Control
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          step="0.01"
                          name="extraCharge"
                          min={0}
                          value={location.extraCharge || 0}
                          onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                          placeholder="extraCharge"
                          disabled
                        />
                      </Form.Group>
                    </div>
                    {transportChargedata && (
                      <div className=" col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].transportChargeType`}>
                          <Form.Label className="fw-bold text-dark">Transport ChargeType</Form.Label>
                          <Form.Select
                            name="transportChargeType"
                            value={location.transportChargeType || ''}
                            onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                            disabled
                          >
                            <option hidden>Transport Charge Type</option>
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
                        <Form.Label className="fw-bold text-dark">Transport Charge</Form.Label>
                        <Form.Control
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          step="0.01"
                          min={0}
                          name="transportCharge"
                          value={location.transportCharge || 0}
                          onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                          placeholder="transportCharge"
                          disabled
                        />
                      </Form.Group>
                    </div>
                    {finalPricedata && (
                      <div className=" col-md-6 mb-2">
                        <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].finalPrice`}>
                          <Form.Label className="fw-bold text-dark">Final Price</Form.Label>
                          <Form.Select
                            name="finalPrice"
                            value={location.finalPrice || ''}
                            onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                            disabled
                          >
                            <option hidden>Final Price Type</option>
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
                          <Form.Label className="fw-bold text-dark">Unit Type</Form.Label>
                          <Form.Select name="unitType" disabled value={location.unitType || ''} onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}>
                            <option hidden>Unit Type</option>
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
                        <Form.Label className="fw-bold text-dark">Display Stock</Form.Label>
                        <Form.Control
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          min={0}
                          step="0.01"
                          name="displayStock"
                          value={location.displayStock || 0}
                          onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                          disabled
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].mainStock`}>
                        <Form.Label className="fw-bold text-dark">Main Stock</Form.Label>
                        <Form.Control
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          min={0}
                          step="0.01"
                          name="mainStock"
                          value={location.mainStock || 0}
                          onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                          disabled
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].b2bdiscount`}>
                        <Form.Label className="fw-bold text-dark">B2B Discount</Form.Label>
                        <Form.Control
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          min={0}
                          name="b2bdiscount"
                          value={location.b2bdiscount || 0}
                          onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                          disabled
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId={`variant[${variantIndex}].location[${locationIndex}].b2cdiscount`}>
                        <Form.Label className="fw-bold text-dark">B2C Discount</Form.Label>
                        <Form.Control
                          type="number"
                          onWheel={(e) => e.target.blur()}
                          min={0}
                          name="b2cdiscount"
                          value={location.b2cdiscount || 0}
                          onChange={(e) => handleLocationChange(e, variantIndex, locationIndex)}
                          disabled
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
                            Active
                          </Form.Label>
                        </Form.Group>
                      </div>
                      <div className="col-md-6">
                        <div className=" col-md-12">
                          <Form.Label htmlFor={`variant[${variantIndex}].allPincode`} className="fw-bold text-dark">
                            Available for all Pincode
                          </Form.Label>
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
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </Form>
    </>
  );
};

export default VarientPicker;
