import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const DetailAttributeItem = ({ onPincodeChange, pincodeValues, allpincode }) => {
  // Tags
  const [tags, setTags] = useState([]);
  const [pincode, setPincode] = useState(pincodeValues || []);
  const inputRef = useRef(null);

  useEffect(() => {
    if (allpincode) {
      onPincodeChange([]);
      setTags([]);
      inputRef.current.value = '';
    }
  }, [allpincode]);

  const clearAll = () => {
    if (inputRef.current) {
      setTags([]);
      inputRef.current.value = '';
      onPincodeChange([]);
    }
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
      inputRef.current.value = '';
    }
    setTags(newTags);
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
      <Row className="gx-2">
        {pincode?.map((pincode1, index) => (
          <Col xs="auto" key={index} onClick={() => onPincodeDelete(index)}>
            <div className="mb-1">
              <Form.Control name="pincode" type="text" value={pincode1} readOnly style={{ cursor: 'pointer' }} />
            </div>
          </Col>
        ))}
      </Row>
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
