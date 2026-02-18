import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useQuery } from '@apollo/client';

const GET_ALL_STATES = gql`
  query GetAllStates {
    getAllStates {
      id
      state
      pincode
    }
  }
`;

const DetailAttributeItem = ({ onPincodeChange, pincodeValues, allpincode }) => {
  const [states, setStates] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]); // Stores selected state IDs
  const [tags, setTags] = useState([]);
  const [pincode, setPincode] = useState(pincodeValues || []);
  const [statePincodes, setStatePincodes] = useState({}); // Mapping of state IDs to pincodes
  const inputRef = useRef(null);

  // Fetch states data using Apollo's useQuery hook
  const { data, loading, error } = useQuery(GET_ALL_STATES);

  useEffect(() => {
    if (data) {
      setStates(data.getAllStates); // Set states data
      // Create a mapping of state IDs to their respective pincodes
      const statePincodesMap = data.getAllStates.reduce((acc, state) => {
        acc[state.id] = state.pincode; // state.id -> [pincode1, pincode2, ...]
        return acc;
      }, {});
      setStatePincodes(statePincodesMap);
    }
  }, [data]);

  // Reset everything when allpincode changes
  useEffect(() => {
    if (allpincode) {
      onPincodeChange([]);
      setTags([]);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [allpincode]);

  // Update selected states when pincodeValues change
  useEffect(() => {
    if (pincodeValues && states.length) {
      // Find states whose pincodes match any in pincodeValues
      const selected = states.filter(
        (state) => state.pincode.some((pcode) => pincodeValues.includes(pcode)) // Match any pincode in pincodeValues
      );
      // Set selected states' IDs
      setSelectedStates(selected.map((state) => state.id));
    }
  }, [pincodeValues, states]);

  const clearAll = () => {
    if (inputRef.current) inputRef.current.value = '';
    setTags([]);
    onPincodeChange([]);
  };

  const mergeAll = () => {
    const pincodes = [...pincode, ...tags];
    const unique = [...new Set(pincodes)];
    onPincodeChange(unique);
  };

  const onTagDelete = (i) => {
    const newTags = [...tags];
    newTags.splice(i, 1);
    if (!newTags.length && !pincode.length) {
      setTags([]);
      onPincodeChange([]);
      if (inputRef.current) inputRef.current.value = '';
    }
    setTags(newTags);
    onPincodeChange([...pincode, ...newTags]);
  };

  const onPincodeDelete = (i) => {
    const newPincodes = [...pincode];
    newPincodes.splice(i, 1);
    if (!newPincodes.length && !tags.length) {
      setTags([]);
      onPincodeChange([]);
      inputRef.current.value = '';
    }
    setPincode(newPincodes);
  };

  const handleInputChange = (e) => {
    let inputValue = e.target.value;

    // Remove non-numeric characters
    inputValue = inputValue.replace(/[^0-9,]/g, '');

    // Update input field value
    e.target.value = inputValue;

    // Update tags state
    const inputTags = inputValue
      .split(',')
      .filter((tag) => tag !== '')
      .map((num) => Number(num));
    setTags(inputTags);
  };

  const handleStateChange = (stateId) => {
    let updatedSelectedStates;

    // Toggle the selected state
    if (selectedStates.includes(stateId)) {
      updatedSelectedStates = selectedStates.filter((id) => id !== stateId); // Remove state
      // Remove pincodes corresponding to this state from pincode array
      const pincodesToRemove = statePincodes[stateId] || [];
      setPincode((prevPincodes) => prevPincodes.filter((code) => !pincodesToRemove.includes(code)));
    } else {
      updatedSelectedStates = [...selectedStates, stateId]; // Add state
      // Add pincodes corresponding to this state to pincode array
      const pincodesToAdd = statePincodes[stateId] || [];
      setPincode((prevPincodes) => [...new Set([...prevPincodes, ...pincodesToAdd])]);
    }

    setSelectedStates(updatedSelectedStates);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      <Row className="gx-2">
        <Col className="col-md">
          <Form.Label>Enter your delivery pincode. Example: 313001,313002,313003</Form.Label>
          <Form.Control
            ref={inputRef}
            disabled={allpincode}
            name="pincode"
            type="text"
            placeholder="Paste pincode separated by commas"
            onChange={handleInputChange}
          />
        </Col>
        <Col xs="auto">
          <label className="d-block form-label">&nbsp;</label>
          <Button onClick={mergeAll} variant="outline-primary" className="btn-icon btn-icon-only mb-1">
            <CsLineIcons icon="save" />
          </Button>{' '}
          <Button onClick={clearAll} variant="outline-primary" className="btn-icon btn-icon-only mb-1">
            <CsLineIcons icon="bin" />
          </Button>
        </Col>
      </Row>

      {/* Displaying checkboxes for all states */}
      <Row className="gx-2 mt-3">
        {states?.map((state) => (
          <Col xs="auto" key={state.id}>
            <Form.Check
              type="checkbox"
              label={state.state}
              value={state.id}
              checked={selectedStates.includes(state.id)} // Ensure state checkbox is checked based on selectedStates
              onChange={() => handleStateChange(state.id)} // Handle toggle
            />
          </Col>
        ))}
      </Row>

      <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
        <Row className="gx-2">
          {pincode?.map((pincode1, index) => (
            <Col xs="3" key={index} onClick={() => onPincodeDelete(index)}>
              <div className="mb-1">
                <Form.Control name="pincode" type="text" value={pincode1} readOnly style={{ cursor: 'pointer' }} />
              </div>
            </Col>
          ))}
        </Row>
      </div>

      <Row className="gx-2">
        {tags?.map((tag, index) => (
          <Col xs="auto" key={index} onClick={() => onTagDelete(index)}>
            <div className="mb-1">
              <Form.Control name="tag" type="text" value={tag} readOnly style={{ cursor: 'pointer' }} />
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default DetailAttributeItem;
