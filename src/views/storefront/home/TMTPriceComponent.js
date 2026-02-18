import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

function TMTPriceComponent({ product }) {
  // user is looged in as b2b or customer
  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const [TMTVariant, setTMTVariant] = useState(null);
  const [TMTSeriesLocation, setTMTSeriesLocation] = useState(null);
  const [discount, setDiscount] = useState(null);
  const [extraCharge, setExtraCharge] = useState(0);
  const [gstType, setGstType] = useState(false);
  const [gstRate, setGstRate] = useState(0);
  const [price, setPrice] = useState(0);
  const [valueTMT, setValue] = useState(null);
  const [unitType, setUnitType] = useState('');

  useEffect(() => {
    const TMT = product?.tmtseriesvariant?.find((item) => item.tmtserieslocation[0]?.sectionDiff === 0);
    setTMTVariant(TMT);
  }, [product]);

  useEffect(() => {
    if (TMTVariant) {
      const { tmtserieslocation } = TMTVariant;
      const TMTvalue = { ...tmtserieslocation[0] };
      setValue(TMTvalue);
    }
  }, [TMTVariant]);

  useEffect(() => {
    if (valueTMT) {
      setExtraCharge(valueTMT.extraCharge);
      setDiscount(currentUser?.role?.some((role) => role === 'b2b') ? valueTMT.b2bdiscount : valueTMT.b2cdiscount);
      setGstType(valueTMT.gstType);
      setGstRate(valueTMT.gstRate);
      setPrice(valueTMT.price + valueTMT.extraCharge);
      setUnitType(valueTMT.unitType);
    }
  }, [valueTMT]);

  return (
    <>
      {gstType && discount === 0 && (
        <>
          {/* <p className="d-inline fw-bold fs-6">₹ {(price / ((100 + gstRate) / 100)).toFixed(2)} </p>
          <p className="d-inline small mx-0 px-0">+GST Per {unitType}/ 12 MM</p> */}
          <div className="card-text mb-0">
            VIEW PRICE
          </div>
        </>
      )}

      {!gstType && discount === 0 && (
        <>
          {/* <p className="d-inline fw-bold fs-6">₹ {price.toFixed(2)}</p>
          <p className="d-inline small"> Per {unitType}/ 12 MM</p> */}
          <div className="card-text mb-0">
            VIEW PRICE
          </div>
        </>
      )}

      {gstType && discount !== 0 && (
        <>
          {/* <p className="d-inline fw-bold fs-6"> ₹ {(((100 - discount) * (price / ((100 + gstRate) / 100))) / 100).toFixed(2)} </p>
          <p className="d-inline fs-6 form-bold ">
            <del> ₹ {(price / ((100 + gstRate) / 100)).toFixed(2)} </del>
          </p>
          <p className="d-inline small mx-0 px-0">+GST Per 12{unitType}/ MM</p> */}
          <div className="card-text mb-0">
            VIEW PRICE
          </div>
        </>
      )}

      {!gstType && discount !== 0 && (
        <>
          {/* <p className="d-inline fw-bold fs-6"> ₹ {(((100 - discount) * price) / 100).toFixed(2)} </p>
          <p className="d-inline fs-6 form-bold ">
            <del> ₹ {price.toFixed(2)}</del> Per 12{unitType}/ MM
          </p> */}
          <div className="card-text mb-0">
            VIEW PRICE 
          </div>
        </>
      )}
    </>
  );
}

export default TMTPriceComponent;
