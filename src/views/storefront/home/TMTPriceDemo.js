import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function TMTPriceComponent({ product }) { 
  // user is looged in as b2b or customer
  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const [TMT, setTMT] = useState(null)
  const [tmtserieslocation1, settmtserieslocation1] = useState(null)
  useEffect(() => {

    const tmt = product.tmtseriesvariant.find(item => item.tmtserieslocation[0]?.sectionDiff === 0);
    setTMT(tmt)
    // if (tmt) {
    //   const { tmtserieslocation } = TMT
    // }
  }, [product])


  useEffect(() => {

    // const tmt = TMT
    if (TMT) {
      const { tmtserieslocation } = TMT
      const test = { ...tmtserieslocation[0] }
      settmtserieslocation1(test);
    }
  }, [TMT])
    // const TMT = product.tmtseriesvariant.find((item) => item.tmtserieslocation[0].sectionDiff === 0);
    // const { gstType, gstRate, b2bdiscount, b2cdiscount, extraCharge } =  TMT.tmtserieslocation[0];
    // const price = TMT.tmtserieslocation[0].price + extraCharge; 
    // const discount = currentUser?.role?.some((role) => role === 'b2b')
    //     ? b2bdiscount
    //     : b2cdiscount;

  return (<>
    {/* {gstType && discount === 0 && (<>
      <p className="d-inline">₹ {(price / ((100 + gstRate) / 100)).toFixed(2)} </p>
      <p style={{ backgroundColor: 'black', color: 'white' }} className="d-inline mx-0 px-0">
        +GST
      </p>
      <p className="d-inline mx-1">{gstRate}%</p>
    </>)}

    {!gstType && discount === 0 && (<>
      <p className="d-inline">₹ {price} </p>
    </>)}

    {gstType && discount !== 0 && (<>
      <p className="d-inline"> ₹ {((100 - discount) * (price / ((100 + gstRate) / 100)) / 100).toFixed(2)} </p>
      <p className="d-inline fs-6 form-bold ">
        <del> ₹  {(price / ((100 + gstRate) / 100)).toFixed(2)} </del>
      </p>
      <p style={{ backgroundColor: 'black', color: 'white' }} className="d-inline mx-0 px-0">
        +GST
      </p>
      <p className="d-inline mx-1">{gstRate}%</p>
    </>)}

    {!gstType && discount !== 0 && (<>
      <p className="d-inline"> ₹ {(((100 - discount) * price) / 100).toFixed(2)} </p>
      <p className="d-inline fs-6 form-bold ">
        <del> ₹ {price.toFixed(2)} </del>
      </p>
    </>)} */}

  </>)
}

export default TMTPriceComponent;
