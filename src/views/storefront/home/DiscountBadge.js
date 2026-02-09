import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from 'react-bootstrap';

function DiscountBadge({ variant, name }) {
  // user is looged in as b2b or customer
  const { isLogin, currentUser } = useSelector((state) => state?.auth);
  const minPrice = Math.min(variant?.location?.map((item) => item?.price));
  const minPriceIndex = variant?.location?.findIndex((item) => item?.price === minPrice);
  const discount = currentUser?.role?.some((role) => role === 'b2b')
    ? variant?.location[minPriceIndex]?.b2bdiscount
    : variant?.location[minPriceIndex]?.b2cdiscount;

  return (
    <>
      {discount > 0 && (
        // <Badge style={{ marginRight: '-12px', borderBottomLeftRadius: '50%', paddingBottom: '0.25rem', paddingLeft: '0.5rem' }} className="position-absolute bg-danger mt-1 e-3 z-index-1 ">
        //   {discount}% <br /> OFF
        // </Badge>
        <Badge
          style={{
            paddingBottom: '0.25rem',
            paddingLeft: '0.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            position: 'absolute',
            marginRight: '-12px',
          }}
          className="bg-danger mt-1 e-3 z-index-1"
        >
          {discount}% OFF
        </Badge>
      )}
    </>
  );
}

export default DiscountBadge;
