import React, { useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const PAYMENT_RESPONSE = gql`
  mutation HandlePaymentResponse($txn: String) {
    handlePaymentResponse(txn: $txn) {
      success
      message
    }
  }
`;

function HandleResponse() {
  const { txnID } = useParams();
  const history = useHistory();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const [HandlePaymentResponse] = useMutation(PAYMENT_RESPONSE, {
    variables: {
      txn: txnID,
    },
    onCompleted: (res) => {
      if (res.handlePaymentResponse.success) {
        setTimeout(() => {
          history.push('/checkout/success', { txnID });
        }, 3000);
      }
      if (!res.handlePaymentResponse.success) {
        setTimeout(() => {
          history.push('/checkout/failure', { txnID });
        }, 3000);
      }
    },
    onError: (err) => {
      setTimeout(() => {
        let orderID = sessionStorage.getItem('orderID');
        if (!orderID) {
          orderID = localStorage.getItem('orderID');
        }
        if (!orderID) {
          history.push('/');
          return;
        }
        history.push('/order/', { orderID });
      }, 1000);
    },
  });

  useEffect(() => {
    HandlePaymentResponse();
  }, [HandlePaymentResponse]);

  return (
    <>
      <div className="text-center">
        <div>
          <span className="spinner spinner-large spinner-blue spinner-slow" />
        </div>
        <br />
        <br />
        <h1 className="p-6 m-6 text-center">
          Loading
          <img src="/loading.webp" alt="" className="loading-gif" width="20" height="20" />{' '}
        </h1>
      </div>
    </>
  );
}

export default HandleResponse;
