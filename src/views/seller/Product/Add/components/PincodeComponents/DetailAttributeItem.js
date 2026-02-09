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

const DetailAttributeItem = ({ onPincodeChange, pincodeValues, allpincode, onAllPincodeChange, onStateChange }) => {
  const [tags, setTags] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [deliveryType, setDeliveryType] = useState('all');
  const inputRef = useRef(null);

  const { data, loading, error } = useQuery(GET_ALL_STATES);
  const { data: data1 } = useQuery(GET_USER_DETAIL);

  const clearAll = () => {
    if (inputRef.current) inputRef.current.value = '';
    setTags([]);
    setSelectedStates([]);
    onPincodeChange([]);
  };

  useEffect(() => {
    if (allpincode) {
      clearAll();
      onPincodeChange(true); // explicitly telling parent "All Pincodes enabled"
    } else {
      onPincodeChange(false); // telling parent "Not All Pincodes"
    }
  }, [allpincode]);

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

  const handleDeliveryTypeChange = (type) => {
    if (deliveryType === type) return;
    setDeliveryType(type);
    clearAll();
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
      <Row className="gx-2 border p-2 rounded mb-2">
        <Col>
          <Form.Check
            type="radio"
            name="deliveryType"
            inline
            label="All India Delivery"
            checked={deliveryType === 'all'}
            onChange={() => handleDeliveryTypeChange('all')}
            className="me-3"
          />
          <Form.Check
            type="radio"
            name="deliveryType"
            inline
            label="State Delivery"
            checked={deliveryType === 'state'}
            onChange={() => handleDeliveryTypeChange('state')}
            className="me-3"
          />
          <Form.Check
            type="radio"
            name="deliveryType"
            inline
            label="Manually Enter Delivery Pincodes"
            checked={deliveryType === 'manual'}
            onChange={() => handleDeliveryTypeChange('manual')}
          />
        </Col>
      </Row>

      {deliveryType === 'state' && (
        <Row className="gx-2 border p-2 rounded mb-2">
          <Col className="col-md">
            <Form.Label className="fw-bold text-dark">
              State Delivery
              <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Enable delivery to selected states only.</Tooltip>}>
                <div className="d-inline-block me-2">
                  <CsLineIcons icon="info-hexagon" size="17" />
                </div>
              </OverlayTrigger>
            </Form.Label>
            <div className="d-flex flex-wrap">
              {statesData.map((stateItem) => (
                <Form.Check
                  key={stateItem.id}
                  type="checkbox"
                  label={stateItem.state}
                  value={stateItem.id}
                  checked={selectedStates.includes(stateItem.id)}
                  onChange={(e) => {
                    const updated = e.target.checked ? [...selectedStates, stateItem.id] : selectedStates.filter((id) => id !== stateItem.id);
                    setSelectedStates(updated);
                    const selectedPincodes = data?.getAllStates.filter((state) => updated.includes(state.id)).flatMap((state) => state.pincode);
                    setTags(selectedPincodes);
                    onPincodeChange(selectedPincodes);
                  }}
                  className="mr-2 mx-2"
                />
              ))}
            </div>
          </Col>
        </Row>
      )}

      {deliveryType === 'manual' && (
        <Row className="gx-2 border p-2 rounded mb-2">
          <Col className="col-md">
            <Form.Label className="fw-bold text-dark">
              Manually Enter Delivery Pincodes
              <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Enter specific pincodes manually.</Tooltip>}>
                <div className="d-inline-block me-2">
                  <CsLineIcons icon="info-hexagon" size="17" />
                </div>
              </OverlayTrigger>
            </Form.Label>
            <Form.Label className="text-muted small">Example: 313001, 313002</Form.Label>
            <Form.Control
              ref={inputRef}
              name="pincode"
              type="text"
              placeholder="Paste Pincode Separated by Commas"
              onChange={handleInputChange}
              value={tags.join(',')}
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

      {deliveryType !== 'all' && tags?.length > 0 && (
        <Row className="gx-2 mt-2" style={{ maxHeight: '100px', overflowY: 'auto' }}>
          {tags.map((tag, index) => (
            <Col xs="auto" key={index} onClick={() => onTagDelete(index)}>
              <div className="mb-1">
                <Form.Control name="pincodeTag" type="text" value={tag} readOnly style={{ cursor: 'pointer' }} />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </>
  );
};

export default DetailAttributeItem;
