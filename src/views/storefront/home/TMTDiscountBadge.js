import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from 'react-bootstrap';

function TMTDiscountBadge({ product }) {
  // user is looged in as b2b or customer
  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const [TMTVariant, setTMTVariant] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [valueTMT, setValue] = useState(null);

  useEffect(() => {
    const TMT = product?.tmtseriesvariant?.find(item => item?.tmtserieslocation[0]?.sectionDiff === 0);
    setTMTVariant(TMT);
  }, [product]);

  useEffect(() => {
    if (TMTVariant) {
      const { tmtserieslocation } = TMTVariant;
      const TMTvalue = { ...tmtserieslocation[0] }
      setValue(TMTvalue);
    }
  }, [TMTVariant]);

  useEffect(() => {
    if (valueTMT) {
      setDiscount(currentUser?.role?.some((role) => role === 'b2b') ? valueTMT?.b2bdiscount : valueTMT?.b2cdiscount);
    }
  }, [valueTMT]);


  return (<>
    {/* {discount > 0 && <Badge style={{ marginRight: '-12px', borderBottomLeftRadius: '50%', paddingBottom: '0.25rem', paddingLeft: '0.5rem' }} className="position-absolute bg-danger mt-1 e-3 z-index-1 ">
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

export default TMTDiscountBadge;
