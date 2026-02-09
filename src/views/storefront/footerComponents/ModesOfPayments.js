import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, gql } from '@apollo/client';
import DOMPurify from 'dompurify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import './style.css';
import { useGlobleContext } from 'context/styleColor/ColorContext';

function PaymentModes() {
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <h1 className="Header">Payment Modes Page</h1>
    </>
  );
}
export default PaymentModes;
