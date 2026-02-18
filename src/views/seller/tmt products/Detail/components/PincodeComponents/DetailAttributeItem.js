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

const DetailAttributeItem = ({ onPincodeChange, pincodeValues = [], allpincode }) => {
  const [states, setStates] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
  const [tags, setTags] = useState([]);
  const [pincode, setPincode] = useState(pincodeValues);
  const [statePincodes, setStatePincodes] = useState({});
  const [mode, setMode] = useState('state'); // state | manual
  const inputRef = useRef(null);

  const { data, loading, error } = useQuery(GET_ALL_STATES);

  // Load states & map pincodes
  useEffect(() => {
    if (data) {
      setStates(data.getAllStates);
      setStatePincodes(
        data.getAllStates.reduce((acc, s) => ({ ...acc, [s.id]: s.pincode }), {})
      );
    }
  }, [data]);

  // Reset when allpincode enabled
  useEffect(() => {
    if (allpincode && inputRef.current) {
      setTags([]);
      setPincode([]);
      onPincodeChange([]);
      inputRef.current.value = '';
    }
  }, [allpincode]);

  // Pre-select states if pincodeValues exist
  useEffect(() => {
    if (pincodeValues.length && states.length) {
      const selected = states
        .filter((s) => s.pincode.some((p) => pincodeValues.includes(p)))
        .map((s) => s.id);
      setSelectedStates(selected);
    }
  }, [pincodeValues, states]);

  // Clear states/pincodes when switching modes
  useEffect(() => {
    if (mode === 'manual') {
      setSelectedStates([]);
      setPincode([]);
      onPincodeChange([]);
    } else if (mode === 'state') {
      setTags([]);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [mode]);

  const updatePincode = (arr) => {
    const unique = [...new Set(arr.map(Number))];
    setPincode(unique);
    onPincodeChange(unique);
  };

  const [saved, setSaved] = useState(false);

  const mergeAll = () => {
    updatePincode([...pincode, ...tags]);
    setSaved(true);

    // revert back after 2 seconds
    setTimeout(() => setSaved(false), 2000);
  };

  const handleInputChange = (e) => {
    const input = e.target.value.replace(/[^0-9,]/g, '');
    e.target.value = input;
    setTags(
      input.split(',').filter(Boolean).map(Number)
    );
  };

  const handleStateChange = (id) => {
    const isSelected = selectedStates.includes(id);
    setSelectedStates((prev) =>
      isSelected ? prev.filter((s) => s !== id) : [...prev, id]
    );
    updatePincode(
      isSelected
        ? pincode.filter((p) => !(statePincodes[id] || []).includes(p))
        : [...pincode, ...(statePincodes[id] || [])]
    );
  };



  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <>
      {/* Radio Buttons */}
      <Row className="mb-3">
        <Col xs={12}>
          <Form.Check
            type="radio"
            label="State / Union Territory-wise Delivery"
            name="mode"
            checked={mode === 'state'}
            onChange={() => setMode('state')}
          />

          {/* State Selection Section */}
          {mode === 'state' && (
            <>
              {/* States */}
              <Row className="gx-2 mt-2">
                {states.map((s) => (
                  <Col xs="auto" key={s.id}>
                    <Form.Check
                      type="checkbox"
                      label={s.state}
                      value={s.id}
                      checked={selectedStates.includes(s.id)}
                      onChange={() => handleStateChange(s.id)}
                    />
                  </Col>
                ))}
                <Col xs={12} className="mt-2">
                  <Button
                    onClick={mergeAll}
                    variant={saved ? "success" : "primary"}
                    className="w-100 w-md-auto"
                    disabled={!selectedStates.length}
                  >
                    {saved ? "Saved" : "Save Selected States"}
                  </Button>
                </Col>
              </Row>

              {/* Selected Pincodes */}
              <div style={{ maxHeight: 140, overflowY: 'auto' }} className="mt-3">
                <Row className="gx-2">
                  {pincode.map((pin, i) => (
                    <Col xs="3" key={i} onClick={() => updatePincode(pincode.filter((_, idx) => idx !== i))}>
                      <Form.Control value={pin} readOnly style={{ cursor: 'pointer' }} />
                    </Col>
                  ))}
                </Row>
              </div>
            </>
          )}
          <Form.Check
            type="radio"
            label="Manually enter Pincode where material is to be delivered"
            name="mode"
            checked={mode === 'manual'}
            onChange={() => setMode('manual')}
          />
        </Col>
      </Row>

      {/* Manual Entry Section */}
      {mode === 'manual' && (
        <>
          <Row className="gx-2">
            <Col md>
              <Form.Label>
                Enter your delivery pincode. Example: 313001,313002,313003
              </Form.Label>
              <Form.Control
                ref={inputRef}
                disabled={allpincode}
                type="text"
                placeholder="Paste pincodes separated by commas"
                onChange={handleInputChange}
              />
            </Col>
            <Col xs="auto">
              <label className="d-block form-label">&nbsp;</label>
              <Button onClick={mergeAll} variant="outline-primary" className="mb-1">
                <CsLineIcons icon="save" /> Save
              </Button>{' '}
              <Button
                onClick={() => updatePincode([])}
                variant="outline-danger"
                className="mb-1"
              >
                <CsLineIcons icon="bin" /> Clear
              </Button>
            </Col>
          </Row>

          {/* Tags */}
          <Row className="gx-2 mt-2">
            {tags.map((tag, i) => (
              <Col xs="auto" key={i} onClick={() => setTags(tags.filter((_, idx) => idx !== i))}>
                <Form.Control value={tag} readOnly style={{ cursor: 'pointer' }} />
              </Col>
            ))}
          </Row>
        </>
      )}


    </>
  );
};

export default DetailAttributeItem;
