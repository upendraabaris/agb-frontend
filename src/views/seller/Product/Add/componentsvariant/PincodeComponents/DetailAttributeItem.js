import React, { useState, useRef, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Row, Col, Button, Form, Spinner, Tooltip, OverlayTrigger } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const GET_ALL_STATES = gql`
  query GetAllStates {
    getAllStates {
      id
      state
      pincode
    }
  }
`;

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

const DetailAttributeItem = ({ onPincodeChange, pincodeValues, allpincode, onAllPincodeChange }) => {
  const [tags, setTags] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [deliveryType, setDeliveryType] = useState("allIndia"); // allIndia | state | manual
  const inputRef = useRef(null);

  const { data, loading, error } = useQuery(GET_ALL_STATES);
  const { data: data1 } = useQuery(GET_USER_DETAIL);

  const clearAll = () => {
    if (inputRef.current) inputRef.current.value = '';
    setTags([]);
    setSelectedStates([]);
    onPincodeChange([]);
  };

  const onTagDelete = (index) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
    onPincodeChange(newTags);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9,]/g, '');
    const inputTags = inputValue
      .split(',')
      .filter((tag) => tag !== '')
      .map((num) => Number(num));
    setTags(inputTags);
    onPincodeChange(inputTags);
  };

  const handleStateSelection = (stateId, checked) => {
    const updatedSelectedStates = checked
      ? [...selectedStates, stateId]
      : selectedStates.filter((id) => id !== stateId);

    setSelectedStates(updatedSelectedStates);

    const selectedPincodes = data?.getAllStates
      .filter((state) => updatedSelectedStates.includes(state.id))
      .flatMap((state) => state.pincode);

    setTags(selectedPincodes);
    onPincodeChange(selectedPincodes);
  };

  const handleDeliveryTypeChange = (e) => {
    const newType = e.target.value;
    setDeliveryType(newType);
    clearAll();

    onAllPincodeChange(newType === "allIndia");
  };

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <p>Error fetching states data: {error.message}</p>;

  let statesData = data?.getAllStates || [];
  const pan = data1?.getProfile?.seller?.pancardNo;
  const sellerState = data1?.getProfile?.seller?.state?.trim() || '';

  if (pan) {
    statesData = statesData.filter((stateItem) => stateItem.state?.trim() === sellerState);
  }

  return (
    <>
      {/* Delivery Type Radio Buttons */}
      <Row className="gx-2 border p-2 rounded mb-2">
        <Col>
          <Form.Check
            type="radio"
            label="All India Delivery"
            name="deliveryType"
            value="allIndia"
            checked={deliveryType === "allIndia"}
            onChange={handleDeliveryTypeChange}
          />
          <Form.Check
            type="radio"
            label="State / Union Territory-wise Delivery"
            name="deliveryType"
            value="state"
            checked={deliveryType === "state"}
            onChange={handleDeliveryTypeChange}
          />

          {/* State Delivery Section */}
          {deliveryType === "state" && (
            <>
              <Row className="gx-2 border p-2 rounded mb-2 mt-2">
                <Col className="col-md">
                  <Form.Label className="fw-bold text-dark">Select States / Union Territories:</Form.Label>
                  <div className="d-flex flex-wrap">
                    {statesData.map((stateItem) => (
                      <Form.Check
                        key={stateItem.id}
                        type="checkbox"
                        label={stateItem.state}
                        value={stateItem.id}
                        checked={selectedStates.includes(stateItem.id)}
                        onChange={(e) => handleStateSelection(stateItem.id, e.target.checked)}
                        className="mr-2 mx-2"
                      />
                    ))}
                  </div>
                </Col>
              </Row>

              {/* Tags Display */}
              {tags.length > 0 && (
                <>
                  <Form.Label className="fw-bold text-dark mb-1">
                    {deliveryType === "state"
                      ? "Pincodes covered in selected States:"
                      : "Pincode(s) covered:"}
                  </Form.Label>

                  <Row
                    className="gx-2 mt-2"
                    style={{ maxHeight: "120px", overflowY: "auto" }}
                  >
                    {tags.map((tag, index) => (
                      <Col xs="auto" key={index} onClick={() => onTagDelete(index)}>
                        <div className="mb-1">
                          <Form.Control
                            name="pincode1"
                            type="text"
                            value={tag}
                            readOnly
                            style={{ cursor: "pointer" }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
            </>
          )}

          <Form.Check
            type="radio"
            label="Manually enter Pincode where material is to be delivered "
            name="deliveryType"
            value="manual"
            checked={deliveryType === "manual"}
            onChange={handleDeliveryTypeChange}
          />
        </Col>
      </Row>

      {/* Manual Pincode Section */}
      {deliveryType === "manual" && (
        <Row className="gx-2 border p-2 rounded mb-2">
          <Col className="col-md">
            <Form.Label className="fw-bold text-dark">Enter / Paste Pincode(s):</Form.Label>
            <Form.Label className="text-dark small ps-1 px-2">
              Example: 313001, 413001, 513001
            </Form.Label>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id="tooltip-top">Enter specific pincodes for delivery manually.</Tooltip>}
            >
              <div className="d-inline-block me-2">
                <CsLineIcons icon="info-hexagon" size="17" />
              </div>
            </OverlayTrigger>
            <Form.Control
              ref={inputRef}
              name="pincode"
              type="text"
              placeholder="Enter / Paste Pincodes separated by Commas"
              onChange={handleInputChange}
            />
          </Col>
          <Col xs="auto">
            <label className="d-block form-label">&nbsp;</label>
            <Button onClick={clearAll} variant="outline-primary" className="btn-icon btn-icon-only mb-1">
              <CsLineIcons icon="bin" />
            </Button>
          </Col>
        </Row>
      )}
    </>
  );
};

export default DetailAttributeItem;
