import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from 'react-bootstrap';

function TMTSectionFalseDiscount({ product }) {
  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const [discount, setDiscount] = useState(currentUser?.role?.some((role) => role === 'b2b') ? product?.tmtseriesvariant[0]?.tmtserieslocation[0]?.b2bdiscount :
    product?.tmtseriesvariant[0]?.tmtserieslocation[0]?.b2cdiscount);


  return (<>
    {/* {discount > 0 && <Badge  style={{ marginRight: '-12px', borderBottomLeftRadius: '50%', paddingBottom: '0.25rem', paddingLeft: '0.5rem' }} className="position-absolute bg-danger mt-1 e-3 z-index-1 ">
      {discount}% <br /> OFF
    </Badge>} */}
    {discount > 0 &&
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
    }
  </>)
}

export default TMTSectionFalseDiscount;