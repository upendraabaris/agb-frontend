import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

function PriceComponent({ variant, name }) {
  // user is looged in as b2b or customer
  const { isLogin, currentUser } = useSelector((state) => state.auth);

  const minPrice = Math.min(variant.location.map((item) => item.price));
  const minPriceIndex = variant.location.findIndex((item) => item.price === minPrice);
  const { gstType, gstRate, extraCharge, unitType } = variant.location[minPriceIndex];
  const price = minPrice + extraCharge;
  const discount = currentUser?.role?.some((role) => role === 'b2b')
    ? variant.location[minPriceIndex].b2bdiscount
    : variant.location[minPriceIndex].b2cdiscount;

  const helloEnquiry = () => {
    console.log('Send Enquiry Button clicked');
  };

  if (price === 0) {
    return (
      <Button className="m-0 p-0 pb-1 fw-bold text-dark" variant="link" onClick={() => helloEnquiry()}>
        Send Enquiry
      </Button>
    );
  }
  return (
    <>
      {gstType && discount === 0 && (
        <>
          <p className="d-inline small fw-bold fs-6" style={{ color: 'black' }}>₹ {(price / ((100 + gstRate) / 100)).toFixed(2)} </p>
          <p className="d-inline small mx-0 px-0" style={{ color: 'black' }}>+GST</p>
          <p className="d-inline small mx-1" style={{ color: 'black' }}>Per {unitType}</p>
          {/* <p className="d-inline mx-1">{gstRate}%</p> */}
        </>
      )}

      {!gstType && discount === 0 && (
        <>
          <p className="d-inline small fw-bold fs-6" style={{ color: 'black' }}>₹ {price.toFixed(2)}</p>
          <p className="d-inline small" style={{ color: 'black' }}> Per {unitType}</p>
        </>
      )}

      {gstType && discount !== 0 && (
        <>
          <p className="d-inline small fw-bold fs-6" style={{ color: 'black' }}> ₹ {(((100 - discount) * (price / ((100 + gstRate) / 100))) / 100).toFixed(2)} </p>
          <p className="d-inline small form-bold " style={{ color: 'black' }}>
            <del> ₹ {(price / ((100 + gstRate) / 100)).toFixed(2)} </del>
          </p>
          <p className="d-inline small mx-0 px-0" style={{ color: 'black' }}>+GST</p>
          <p className="d-inline small mx-1" style={{ color: 'black' }}>Per {unitType}</p>
          {/* <p className="d-inline mx-1">{gstRate}%</p> */}
        </>
      )}

      {!gstType && discount !== 0 && (
        <>
          <p className="d-inline small fw-bold fs-6" style={{ color: 'black' }}> ₹ {(((100 - discount) * price) / 100).toFixed(2)} </p>
          <p className="d-inline small form-bold " style={{ color: 'black' }}>
            <del  style={{ color: 'black' }}> ₹ {price.toFixed(2)} </del> Per {unitType}
          </p>
        </>
      )}
    </>
  );
}

export default PriceComponent;
