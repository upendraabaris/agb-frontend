import React, { useState, useEffect } from 'react';
import { NavLink, withRouter, useParams } from 'react-router-dom';
import { Row, Col, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import GstTypeData from 'globalValue/attributes dropdown data/GstTypeData';
import PriceTypeData from 'globalValue/attributes dropdown data/PriceTypeData';
import ExtraChargeTypeData from 'globalValue/attributes dropdown data/ExtraChargeTypeData';
import TransportChargeData from 'globalValue/attributes dropdown data/TransportChargeData';
import FinalPriceTypeData from 'globalValue/attributes dropdown data/FinalPriceTypeData';
import UnitTypeData from 'globalValue/attributes dropdown data/UnitTypeData';
import DetailAttributeItem from './PincodeComponents/DetailAttributeItem';

function SellerLocations({ history }) {
  const title = 'Existing Locations List';
  const description = 'Ecommerce Series product Existing Locations List Page';
  const { seriesproductid, seriesvariantId } = useParams();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(null);
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

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

  const GET_SERIES_VARIANT_LOCATIONS = gql`
    query GetSeriesVariantByForSeller($productId: ID) {
      getSeriesVariantByForSeller(productId: $productId) {
        id
        variantName
        moq
        active
        allPincode
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
    mutation UpdateSeriesVariant($updateSeriesVariantId: ID, $moq: Int, $variantName: String, $variantId: ID, $locationId: ID, $location: SeriesLocationInput) {
      updateSeriesVariant(
        id: $updateSeriesVariantId
        moq: $moq
        variantName: $variantName
        variantId: $variantId
        locationId: $locationId
        location: $location
      ) {
        id
      }
    }
  `;

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
        serieslocation: variant1.serieslocation?.map(({ __typename, ...rest }) => rest),
      });
    }
  }, [data1, seriesvariantId]);

  // handle update series product

  const [UpdateSeriesVariant] = useMutation(UPDATE_SERIES_VARIANT, {
    onCompleted: () => {
      toast('Variant Updated Successfully!');
      refetch();
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
    setFormData((prevState) => {
      const updatedLocations = [...prevState.serieslocation];
      const updatedLocation = { ...updatedLocations[locationIndex] };

      updatedLocation.pincode = pincodeValues;
      updatedLocations[locationIndex] = updatedLocation;

      return { ...prevState, serieslocation: updatedLocations };
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

  const onFormSubmit = async (variantid, locationId1, locationIndex) => {
    const locationValue = formData.serieslocation[locationIndex];

    // Convert the necessary fields to numeric values
    const numericFields = ['price', 'displayStock', 'mainStock', 'gstRate', 'extraCharge', 'transportCharge', 'b2cdiscount', 'b2bdiscount'];
    numericFields.forEach((field) => {
      const valueToParse = locationValue[field];
      // eslint-disable-next-line no-restricted-globals
      if (valueToParse !== null && valueToParse !== '' && !isNaN(valueToParse)) {
        locationValue[field] = parseFloat(valueToParse);
      } else {
        locationValue[field] = 0;
      }
    });

    if (variantid && locationId1 && seriesproductid && locationValue) {
      await UpdateSeriesVariant({
        variables: {
          updateSeriesVariantId: seriesproductid,
          variantId: variantid,
          locationId: locationId1,
          location: locationValue,
        },
      });
    } else if (variantid && !locationId1 && seriesproductid && locationValue) {
      await UpdateSeriesVariant({
        variables: {
          updateSeriesVariantId: seriesproductid,
          variantId: variantid,
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

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/seller/series/variant_list/${seriesproductid}`}>
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Existing variant List</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>

      {formData && (
        <>
          <Form>
            {/* Variants */}
            <div className="my-3">
              <h4>Variant</h4>
              {/* Variant Name */}
              <div className="row">
                <div className="col-md-5 mb-2">
                  <Form.Group controlId="variantName">
                    <Form.Label>Variant Name</Form.Label>
                    <Form.Control disabled type="text" name="variantName" value={formData.variantName || ''} onChange={handleFormChange} />
                  </Form.Group>
                </div>
                <div className="col-md-5 mb-2">
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
                </div>
                <div className="col-md-5 mb-2">
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
                </div>

                {/* <div className="col-md-2">
                  <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Update and save Variant\'s Name and moq</Tooltip>}>
                    <div className="d-inline-block me-2">
                      <Button variant="outline-primary" onClick={() => updateNameandMoq(formData.id)} className="btn-icon btn-icon-only ms-3 mt-4">
                        <CsLineIcons icon="save" />
                      </Button>
                    </div>
                  </OverlayTrigger>
                </div> */}
              </div>

              <div className="row">
                <div className="col-md-2 mb-2">
                  <Form.Group controlId="active">
                    <Form.Label>
                      <Form.Check type="checkbox" name="active" inline value="true" checked={formData.active || ''} disabled={formData.active || ''} />
                      Active
                    </Form.Label>
                  </Form.Group>
                </div>
              </div>

              <div className="row mb-2">
                <div className=" col-md-6">
                  <Form.Label htmlFor="allPincode" className="fs-6">
                    Available for all Pincode
                  </Form.Label>
                </div>
                <div className=" col-md-6">
                  <Form.Check name="allPincode" className="ms-3" id="allPincode" type="checkbox" inline disabled checked={formData.allPincode || ''} />
                </div>
              </div>
              {/* Location */}
              {formData.serieslocation?.length > 0 &&
                formData.serieslocation.map((serieslocation, locationIndex) => (
                  <div key={locationIndex} className="my-3">
                    <h5>Location {locationIndex + 1}</h5>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <h5 className="mb-n3">Price show</h5>
                        <br />
                        <Form.Group controlId={`formData.serieslocation[${locationIndex}].gstType`}>
                          <Form.Label>
                            With GST
                            <Form.Label>
                              <Form.Check
                                name="gstType"
                                className="mx-4"
                                type="switch"
                                checked={serieslocation.gstType}
                                onChange={(e) => handleLocationChange(e, locationIndex)}
                              />
                            </Form.Label>
                            Without GST
                          </Form.Label>
                        </Form.Group>
                      </div>
                      {gstdata && (
                        <div className="col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].gstRate`}>
                            <Form.Label className="fs-6">Gst Rate</Form.Label>
                            <Form.Select name="gstRate" value={serieslocation.gstRate || ''} onChange={(e) => handleLocationChange(e, locationIndex)}>
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
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].priceType`}>
                            <Form.Label className="fs-6">Price Type</Form.Label>
                            <Form.Select name="priceType" value={serieslocation.priceType || ''} onChange={(e) => handleLocationChange(e, locationIndex)}>
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
                        <Form.Group controlId={`formData.serieslocation[${locationIndex}].price`}>
                          <Form.Label className="fs-6">price</Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            min={0}
                            name="price"
                            value={serieslocation.price || 0}
                            onChange={(e) => handleLocationChange(e, locationIndex)}
                            placeholder="price"
                          />
                        </Form.Group>
                      </div>

                      {extraChargedata && (
                        <div className=" col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].extraChargeType`}>
                            <Form.Label className="fs-6">Extra Charge Type</Form.Label>
                            <Form.Select
                              name="extraChargeType"
                              value={serieslocation.extraChargeType || ''}
                              onChange={(e) => handleLocationChange(e, locationIndex)}
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
                        <Form.Group controlId={`formData.serieslocation[${locationIndex}].extraCharge`}>
                          <Form.Label className="fs-6">Extra Charge</Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            min={0}
                            name="extraCharge"
                            value={serieslocation.extraCharge || 0}
                            onChange={(e) => handleLocationChange(e, locationIndex)}
                            placeholder="extraCharge"
                          />
                        </Form.Group>
                      </div>
                      {transportChargedata && (
                        <div className=" col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].transportChargeType`}>
                            <Form.Label className="fs-6">Delivery Charge Type</Form.Label>
                            <Form.Select
                              name="transportChargeType"
                              value={serieslocation.transportChargeType || ''}
                              onChange={(e) => handleLocationChange(e, locationIndex)}
                            >
                              <option hidden>Delivery Charge Type</option>
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
                        <Form.Group controlId={`formData.serieslocation[${locationIndex}].transportCharge`}>
                          <Form.Label className="fs-6">Delivery Charge</Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            min={0}
                            name="transportCharge"
                            value={serieslocation.transportCharge || 0}
                            onChange={(e) => handleLocationChange(e, locationIndex)}
                            placeholder="Delivery Charge"
                          />
                        </Form.Group>
                      </div>

                      {finalPricedata && (
                        <div className=" col-md-6 mb-2">
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].finalPrice`}>
                            <Form.Label className="fs-6">Final Price</Form.Label>
                            <Form.Select name="finalPrice" value={serieslocation.finalPrice || ''} onChange={(e) => handleLocationChange(e, locationIndex)}>
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
                          <Form.Group controlId={`formData.serieslocation[${locationIndex}].unitType`}>
                            <Form.Label className="fs-6">Unit Type</Form.Label>
                            <Form.Select name="unitType" value={serieslocation.unitType || ''} onChange={(e) => handleLocationChange(e, locationIndex)}>
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
                        <Form.Group controlId={`formData.serieslocation[${locationIndex}].displayStock`}>
                          <Form.Label>Display Stock</Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            min={0}
                            step="0.01"
                            name="displayStock"
                            value={serieslocation.displayStock || 0}
                            onChange={(e) => handleLocationChange(e, locationIndex)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`formData.serieslocation[${locationIndex}].mainStock`}>
                          <Form.Label>Main Stock</Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            min={0}
                            step="0.01"
                            name="mainStock"
                            value={serieslocation.mainStock || 0}
                            onChange={(e) => handleLocationChange(e, locationIndex)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`formData.serieslocation[${locationIndex}].b2bdiscount`}>
                          <Form.Label>B2B Discount</Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            name="b2bdiscount"
                            min={0}
                            value={serieslocation.b2bdiscount || 0}
                            onChange={(e) => handleLocationChange(e, locationIndex)}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`formData.serieslocation[${locationIndex}].b2cdiscount`}>
                          <Form.Label>B2C Discount</Form.Label>
                          <Form.Control
                            type="number"
                            min={0}
                            onWheel={(e) => e.target.blur()}
                            name="b2cdiscount"
                            value={serieslocation.b2cdiscount || 0}
                            onChange={(e) => handleLocationChange(e, locationIndex)}
                          />
                        </Form.Group>
                      </div>
                      <div className="mb-2">
                        <Form.Group controlId={`formData.serieslocation[${locationIndex}].pincode`}>
                          <Form.Label className="fs-6">Pincode</Form.Label>
                          <DetailAttributeItem
                            onPincodeChange={(pincodeValues) => handlePincodeChange(locationIndex, pincodeValues)}
                            pincodeValues={serieslocation.pincode}
                            allpincode={formData.allPincode}
                          />
                        </Form.Group>
                      </div>
                      <div className="d-flex justify-content-around">
                        <Button className="mt-2" variant="danger" onClick={() => removeLocation(locationIndex)}>
                          Remove Location
                        </Button>

                        <Button variant="primary" className="mt-2" onClick={() => onFormSubmit(formData.id, serieslocation.id, locationIndex)}>
                          Submit Location
                        </Button>
                      </div>
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
        </>
      )}
    </>
  );
}

export default SellerLocations;
