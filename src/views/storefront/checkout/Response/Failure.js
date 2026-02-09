import React, { useEffect, useState } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Modal } from 'react-bootstrap';
import img from './failure.png';

const GET_ALL_ACCOUNT_DETAILS = gql`
  query {
    getAllAccountdetails {
      id
      account_no
      ifsc_code
      account_name
      upi
      phone_no
      bank_name
      qr
      note
      notedmt
      notedmtstates
    }
  }
`;
const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
    }
  }
`;
const GET_ALL_ORDERS = gql`
  query GetUserAllOrder($userId: ID) {
    getUserAllOrder(userId: $userId) {
      id
      totalAmount
      acutalTotalAmount
      user {
        id
      }
    }
  }
`;
const GET_USER_DETAIL = gql`
  query GetProfile {
    getProfile {
      id
      firstName
      lastName
      email
      mobileNo
    }
  }
`;

function Failure() {
  const history = useHistory();
  const { state } = useLocation();
  const { loading, error, data } = useQuery(GET_ALL_ACCOUNT_DETAILS);
  const { loading: contentLoading, error: contentError, data: contentData } = useQuery(GET_SITE_CONTENT, { variables: { key: 'whatsapp' } });
  const [showModal, setShowModal] = useState(false);
  const whatsappMessage = contentData?.getSiteContent?.content || '';
  const phoneNumber = whatsappMessage.replace(/\D/g, '').slice(-10);
  const { data: userData, refetch } = useQuery(GET_USER_DETAIL);
  const userId = userData?.getProfile?.id || null;
  const {
    loading: orderLoading,
    error: orderError,
    data: orderData,
  } = useQuery(GET_ALL_ORDERS, {
    variables: { userId },
    skip: !userId,
  });
  const userOrders = Array.isArray(orderData?.getUserAllOrder) ? orderData.getUserAllOrder.filter((order) => order.user?.id?.toString() === userId) : [];
  const lastOrder = userOrders.length > 0 ? userOrders[userOrders.length - 1] : null;
  const totalAmount = lastOrder ? lastOrder.totalAmount : '';
  useEffect(() => {
    if (state?.txnID) {
      const timeout = setTimeout(() => history.push(`/order/${state?.txnID}`));
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [history, state]);
  if (loading || contentLoading) return <p className="text-center mt-4">Loading...</p>;
  if (error || contentError) return <p className="text-center text-danger mt-4">Error loading data</p>;

  return (
    <div className="d-flex justify-content-center align-items-center bg-light">
      <div className="text-center p-1 shadow rounded bg-white" style={{ maxWidth: '600px', width: '100%' }}>
        <img alt="Failed" className="pt-5" src={img} style={{ width: '50px' }} />
        <h2 className="my-3 text-danger fw-bold">Payment Failed</h2>
        <p className="text-dark fw-bold mb-4">Something went wrong with your transaction.</p>
        <div className="d-flex justify-content-center gap-3">
          <NavLink to="/" className="btn btn-outline-dark px-4 py-2 fw-bold">
            Go to Home
          </NavLink>
          <NavLink to="/cart" className="btn btn-danger px-4 py-2 fw-bold">
            Try Again
          </NavLink>
        </div>
        <h6 className="mt-6 fw-bold">Or</h6>

        {data?.getAllAccountdetails && (
          <div className="border p-4 mt-3 rounded text-dark text-start">
            <h4 className="fw-bold text-primary mb-3">Payment Instructions</h4>
            <p className="fw-bold">
              Please transfer
              <span className="text-success">{totalAmount ? ` ₹ ${totalAmount}` : 'the order amount'} </span> to the given account and inform us at
              <a href={whatsappMessage} target="_blank" rel="noopener noreferrer" className="text-success fw-bold px-2">
                <img src="/img/background/chat-whatsapp.gif" width="18px" className="rounded" alt="WhatsApp" /> {phoneNumber}
              </a>
              after completing the transaction.
            </p>
            <table className="table table-bordered mt-3">
              <tbody>
                {['bank_name', 'account_name', 'account_no', 'ifsc_code', 'phone_no', 'upi'].map((key) => {
                  const displayName = key === 'phone_no' ? 'PhonePe, G-Pay, Paytm' : key.replace('_', ' ').toUpperCase();
                  return (
                    data?.getAllAccountdetails?.[key] && (
                      <tr key={key}>
                        <th className="bg-info text-white">{displayName}</th>
                        <td>{data.getAllAccountdetails[key]}</td>
                      </tr>
                    )
                  );
                })}
                {data?.getAllAccountdetails?.qr && (
                  <tr>
                    <th className="bg-info text-white">QR Code</th>
                    <td>
                      <div className="d-flex flex-column">
                        <img
                          src={data.getAllAccountdetails.qr}
                          alt="QR Code"
                          width="100"
                          height="100"
                          className="cursor-pointer border rounded"
                          onClick={() => setShowModal(true)}
                        />
                        <div className="text-primary fw-bold mt-2 cursor-pointer" onClick={() => setShowModal(true)}>
                          🔍 Full Screen
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-4">
              <h5 className="fw-bold text-dark">Note:</h5>
              {data?.getAllAccountdetails?.notedmt ? (
                <div className="border p-3 rounded bg-white text-dark" dangerouslySetInnerHTML={{ __html: data.getAllAccountdetails.notedmt }} />
              ) : (
                <p className="text-muted">N/A</p>
              )}
            </div>
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Body className="text-center p-4 position-relative">
          {data?.getAllAccountdetails?.qr && (
            <>
              <button
                type="button"
                className="btn btn-outline-light rounded-circle position-absolute top-0 end-0 mt-2 me-2 p-0"
                style={{ width: '25px', height: '25px' }}
                onClick={() => setShowModal(false)}
              >
                <span className="text-danger">✖</span>
              </button>
              <img src={data.getAllAccountdetails.qr} alt="QR Code" className="img-fluid p-2 border rounded shadow-sm w-100" />
              <p className="mt-3 fw-bold text-dark">
                Please transfer <span className="text-success">{totalAmount ? ` ₹ ${totalAmount}` : 'the order amount'}</span> to the given account and inform
                us at
                <a href={whatsappMessage} target="_blank" rel="noopener noreferrer" className="text-success fw-bold px-2">
                  <img src="/img/background/chat-whatsapp.gif" width="18px" className="rounded" alt="WhatsApp" /> {phoneNumber}
                </a>{' '}
                after completing the transaction.
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Failure;
