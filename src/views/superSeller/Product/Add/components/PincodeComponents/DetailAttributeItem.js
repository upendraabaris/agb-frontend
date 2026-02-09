import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const DetailAttributeItem = ({ onPincodeChange, pincodeValues, allpincode }) => {
  // Tags
  const [tags, setTags] = useState(pincodeValues || []);

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
  const onTagDelete = (i) => {
    const newTags = [...tags];
    newTags.splice(i, 1);
    if (!newTags.length) {
      setTags([]);
      onPincodeChange([]);
      inputRef.current.value = '';
    }
    setTags(newTags);
    onPincodeChange(newTags);
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
    onPincodeChange(inputTags);
  };

  return (
    <>
      <Row className="gx-2">
        <Col className="col-md">
          <Form.Label>Paste Pincode with Comma (exm. 313001, 413001, 513001)</Form.Label>
          <Form.Control
            ref={inputRef}
            disabled={allpincode}
            name="pincode"
            type="text"
            placeholder="Paste Pincode Separated by commas"
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
      <Row className="gx-2">
        {tags?.map((tag, index) => (
          <Col xs="auto" key={index} onClick={() => onTagDelete(index)}>
            <div className="mb-1">
              <Form.Control name="pincode1" type="text" value={tag} readOnly style={{ cursor: 'pointer' }} />
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default DetailAttributeItem;
