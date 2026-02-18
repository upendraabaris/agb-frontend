import React, { useState, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

const ItemCounter = ({ defVal = 1, setformvalue, min = 1, max }) => {
  const [value, setValue] = useState(parseInt(defVal, 10));
  const handleChange = (e) => {
    const regex = /^[0-9\b]+$/;
    if (e.target.value === '' || regex.test(e.target.value)) {
      if (e.target.value >= 0 && e.target.value <= max) {
        setValue(parseInt(e.target.value, 10));
        setformvalue(parseInt(e.target.value, 10));
      }
    }
  };

  useEffect(() => {
    setformvalue(parseInt(defVal, 10));
  }, []);

  const spinUp = () => {
    if (value >= max) {
      return;
    }
    setValue(parseInt(value, 10) + 1);
    setformvalue(parseInt(value, 10) + 1);
  };

  const spinDown = () => {
    if (value <= min) {
      return;
    }
    setValue(parseInt(value, 10) - 1);
    setformvalue(parseInt(value, 10) - 1);
  };

  return (
    <InputGroup className="spinner sw-12">
      <InputGroup.Text id="basic-addon1">
        <button type="button" className="spin-down single px-2" onClick={spinDown}>
          -
        </button>
      </InputGroup.Text>
      <Form.Control value={value || 0} onChange={handleChange} placeholder="Count" className="text-center" />
      <InputGroup.Text id="basic-addon2">
        <button type="button" className="spin-up single px-2" onClick={spinUp}>
          +
        </button>
      </InputGroup.Text>
    </InputGroup>
  );
};

export default ItemCounter;
