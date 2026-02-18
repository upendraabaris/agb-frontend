import React from 'react';
import { Row, Col, Form, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import GstTypeData from 'globalValue/attributes dropdown data/GstTypeData';
import PriceTypeData from 'globalValue/attributes dropdown data/PriceTypeData';
import ExtraChargeTypeData from 'globalValue/attributes dropdown data/ExtraChargeTypeData';
import TransportChargeData from 'globalValue/attributes dropdown data/TransportChargeData';
import FinalPriceTypeData from 'globalValue/attributes dropdown data/FinalPriceTypeData';
import UnitTypeData from 'globalValue/attributes dropdown data/UnitTypeData';
import DetailAttributeItem from './PincodeComponents/DetailAttributeItem';


const VarientPicker = ({ section, locationValue, setLocationValue, allPincode }) => {
  const gstdata = GstTypeData();
  const pricedata = PriceTypeData();
  const unitData = UnitTypeData();
  const extraChargedata = ExtraChargeTypeData();
  const transportChargedata = TransportChargeData();
  const finalPricedata = FinalPriceTypeData();

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;

    // eslint-disable-next-line no-nested-ternary
    const parsedValue = ['extraCharge', 'gstRate', 'transportCharge', 'displayStock', 'mainStock'].includes(name)
      ? parseFloat(value)
      : name === 'gstType'
        ? checked
        : value;

    setLocationValue({
      ...locationValue,
      [name]: parsedValue,
    });
  };

  const handlePincodeChange = (pincodeValues) => {
    setLocationValue({
      ...locationValue,
      pincode: pincodeValues,
    });
  };

  return (
    <>
      <Row>
        <Col xl="12">
          <Card className="border mt-2 mb-4">
            <Card.Body>
              <div className="row mb-3">
                <div className="mb-2">
                  <h5 className="fw-bold text-dark">Price show</h5>
                  <Form.Group controlId="gstType">
                    <Form.Label className="text-dark">
                      With GST
                      <Form.Label>
                        <Form.Check name="gstType" className="mx-4" type="switch" checked={locationValue.gstType} onChange={handleInputChange} />
                      </Form.Label>
                      Without GST
                    </Form.Label>
                  </Form.Group>
                </div>
                {gstdata && (
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="gstRate">
                      <Form.Label className="text-dark fw-bold">Gst Rate<span className="text-danger"> * </span>{' '}
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
                      <Form.Select name="gstRate" value={locationValue.gstRate || ''} onChange={handleInputChange}>
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
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="priceType">
                      <Form.Label className="text-dark fw-bold">Price Type<span className="text-danger"> * </span>{' '}
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
                        </OverlayTrigger></Form.Label>
                      <Form.Select name="priceType" value={locationValue.priceType || ''} onChange={handleInputChange}>
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

                {extraChargedata && (
                  <div className=" col-md-6 mb-2">
                    <Form.Group controlId="extraChargeType">
                      <Form.Label className="text-dark fw-bold">Extra Charge Type<span className="text-danger"> * </span>{' '}
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
                        </OverlayTrigger></Form.Label>
                      <Form.Select name="extraChargeType" value={locationValue.extraChargeType || ''} onChange={handleInputChange}>
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
                  <Form.Group controlId="extraCharge">
                    <Form.Label className="text-dark fw-bold">Extra Charge<span className="text-danger"> * </span>{' '}
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
                      </OverlayTrigger></Form.Label>
                    <Form.Control
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      min={0}
                      step="0.01"
                      name="extraCharge"
                      value={locationValue.extraCharge || 0}
                      onChange={handleInputChange}
                      placeholder="extraCharge"
                    />
                  </Form.Group>
                </div>
                {transportChargedata && (
                  <div className=" col-md-6 mb-2">
                    <Form.Group controlId="transportChargeType">
                      <Form.Label className="text-dark fw-bold">Transport ChargeType <span className="text-danger"> * </span>{' '}
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
                        </OverlayTrigger></Form.Label>
                      <Form.Select name="transportChargeType" value={locationValue.transportChargeType || ''} onChange={handleInputChange}>
                        <option hidden>Transport Charge Type</option>
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
                  <Form.Group controlId="transportCharge">
                    <Form.Label className="text-dark fw-bold">Transport Charge<span className="text-danger"> * </span>{' '}
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
                      </OverlayTrigger></Form.Label>
                    <Form.Control
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      min={0}
                      step="0.01"
                      name="transportCharge"
                      value={locationValue.transportCharge || 0}
                      onChange={handleInputChange}
                      placeholder="transportCharge"
                    />
                  </Form.Group>
                </div>

                {finalPricedata && (
                  <div className=" col-md-6 mb-2">
                    <Form.Group controlId="finalPrice">
                      <Form.Label className="text-dark fw-bold">Final Price<span className="text-danger"> * </span>{' '}
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
                        </OverlayTrigger></Form.Label>
                      <Form.Select name="finalPrice" value={locationValue.finalPrice || ''} onChange={handleInputChange}>
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
                    <Form.Group controlId="unitType">
                      <Form.Label className="text-dark fw-bold">Unit Type<span className="text-danger"> * </span>{' '}
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
                        </OverlayTrigger></Form.Label>
                      <Form.Select name="unitType" disabled={section} value={section ? 'Kg' : locationValue.unitType || ''} onChange={handleInputChange}>
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
                {/* <div className="row">
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="displayStock">
                      <Form.Label className="text-dark fw-bold">Display Stock <span className="text-danger"> * </span>{' '}
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
                        </OverlayTrigger></Form.Label>
                      <Form.Control
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        min={0}
                        step="0.01"
                        name="displayStock"
                        value={locationValue.displayStock || 0}
                        onChange={handleInputChange}
                        placeholder="display Stock"
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="mainStock">
                      <Form.Label className="text-dark fw-bold">Main Stock<span className="text-danger"> * </span>{' '}
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
                        </OverlayTrigger></Form.Label>
                      <Form.Control
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        min={0}
                        step="0.01"
                        name="mainStock"
                        value={locationValue.mainStock || 0}
                        onChange={handleInputChange}
                        placeholder="main Stock"
                      />
                    </Form.Group>
                  </div>
                </div> */}

                <DetailAttributeItem
                  allPincode={allPincode}
                  onPincodeChange={(pincodeValues) => handlePincodeChange(pincodeValues)}
                  pincodeValues={locationValue.pincode}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default VarientPicker;
