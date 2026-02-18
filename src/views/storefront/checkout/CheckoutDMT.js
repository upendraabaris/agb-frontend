import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation, useParams, withRouter, useNavigate } from 'react-router-dom';
import { gql, useLazyQuery, useMutation, useSubscription } from '@apollo/client';
import { toast } from 'react-toastify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Clamp from 'components/clamp';
import { Accordion, Modal, Row, Col, Button, Form, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import DOMPurify from 'dompurify';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { vi } from 'date-fns/locale';
import { CheckCircleFill } from 'react-bootstrap-icons';

const GET_ACCOUNT_DETAIL = gql`
  query GetAllAccountdetails {
    getAllAccountdetails {
      account_name
      account_no
      bank_name
      id
      ifsc_code
      phone_no
      qr
      upi
      note
      notedmtstates
    }
  }
`;

const SUBMIT_PAYMENT_PROOF = gql`
  mutation SubmutPaymentProof($paymentMethod: String, $orderId: ID, $file: Upload, $paymentId: String, $paymentStatus: String, $paymentmode: String) {
    submutPaymentProof(
      paymentMethod: $paymentMethod
      orderId: $orderId
      file: $file
      paymentId: $paymentId
      paymentStatus: $paymentStatus
      paymentmode: $paymentmode
    ) {
      id
    }
  }
`;

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;

const GET_STORE_FEATURES = gql`
  query GetStoreFeature {
    getStoreFeature {
      dtmHelpVideo
    }
  }
`;

function CheckoutDMT({ history }) {
  const title = 'DMT Check Out Page';
  const description = 'Ecommerce DMT Check Out Page';
  const dispatch = useDispatch();
  const { orderID } = useParams();
  const { dataStoreFeatures1 } = useGlobleContext();
  const { color } = useGlobleContext();
  const location = useLocation();
  const { totalAmount } = location.state || 0;
  const [modalShow, setModalShow] = useState(false);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);
  const [accountDetails, setAccountDetails] = useState(null);
  const [GetAllAccountdetails] = useLazyQuery(GET_ACCOUNT_DETAIL, {
    onCompleted: (res) => {
      setAccountDetails(res.getAllAccountdetails);
    },
    onError: (error) => {
      console.log('GET_ACCOUNT_DETAIL');
    },
  });
  useEffect(() => {
    GetAllAccountdetails();
  }, [GetAllAccountdetails]);
  const initialState = {
    orderId: orderID,
    file: '',
    paymentId: '',
    paymentmode: '',
    paymentStatus: 'Payment Proof Submited',
    paymentMethod: 'DMT',
  };
  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  const validateForm = () => {
    const errors = {};
    if (!formData.paymentId.trim()) {
      errors.paymentId = 'Transaction Id is required.';
    }
    if (!formData.paymentmode.trim()) {
      errors.paymentmode = 'Payment Mode is required.';
    }

    if (!formData.file) {
      errors.file = 'Payment Proof is required.';
    }
    return errors;
  };
  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'file') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: files[0],
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
  const [SubmutPaymentProof, { loading }] = useMutation(SUBMIT_PAYMENT_PROOF, {
    onCompleted: () => {
      setFormData(initialState);
      setModalShow(true);
    },
    onError: (err) => {
      console.log('SUBMIT_PAYMENT_PROOF');
    },
  });
  const submit = async (e) => {
    e.preventDefault();
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    await SubmutPaymentProof({
      variables: formData,
    });
  };

  const pushToOrderPage = () => {
    setModalShow(!modalShow);
    // history.go(`/order/${orderID}`);
    window.location.href = `/order/${orderID}`;
  };

  const pushToThankYouPage = () => {
    setModalShow(false);
    history.push(`/checkout/directpayment/thankyou/${orderID}`, { orderID });
  };

  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);
  useEffect(() => {
    getContent({
      variables: {
        key: 'DMTPayMessage',
      },
    });
  }, [dataSiteContent, getContent]);

  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (key, value) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const [GetStoreFeature, { data: dataStoreFeatures }] = useLazyQuery(GET_STORE_FEATURES);
  const videoUrl = dataStoreFeatures?.getStoreFeature?.dtmHelpVideo;
  useEffect(() => {
    GetStoreFeature();
  }, []);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCollapsedNote, setIsCollapsedNote] = useState(true);
  const [isCollapsedYT, setIsCollapsedYT] = useState(true);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`
          .btn_color {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
            transition: background 0.3s ease;
            padding: 10px 30px;
            border: none;
            cursor: pointer;            
          }
          .btn_color:hover {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            filter: brightness(80%);       
          }
        `}
      </style>
      <Card className="mb-2">
        <Row className="g-0">
          <Col className="position-relative h-100">
            <div className="p-2 bg-white rounded">
              {' '}
              {accountDetails && (
                <div className="row">
                  {/* Step 1: Payment Details */}
                  <div className="col-md-6">
                    <div className="card shadow-sm border-0">
                      <div className="text-center fw-bold py-2 bg_color text-white rounded"> STEP 1: Make Payment of Rs. {totalAmount}</div>
                      <div className="card-body bg-white p-1 pt-0 rounded-bottom">
                        <>
                          {/* QR code displayed in big screen */}
                          {accountDetails?.qr && (
                            <div className="mb-3 text-center">
                              <img
                                src={accountDetails.qr}
                                alt="QR Code"
                                width="250"
                                height="250"
                                className="cursor-pointer border rounded"
                                onClick={() => setShowModal(true)}
                              />
                              <div className="text-primary fw-bold mt-2 cursor-pointer small" onClick={() => setShowModal(true)}>
                                🔍 Full Screen
                              </div>
                            </div>
                          )}

                          {/* Zoom QR Code */}
                          <Button
                            className="btn btn-light w-100 mb-0 p-1 mt-2 d-flex justify-content-between align-items-center"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            aria-expanded={!isCollapsed}
                            aria-controls="bank-details-collapse"
                            style={{
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #e0e0e0',
                              boxShadow: 'none',
                            }}
                          >
                            <span className="ps-2 fw-bold text-dark">{isCollapsed ? 'Bank & UPI Details' : 'Bank & UPI Details'}</span>
                            <CsLineIcons icon={isCollapsed ? 'chevron-bottom' : 'chevron-top'} />
                          </Button>

                          {/* Account Detail */}
                          <div className={`collapse ${!isCollapsed ? 'show' : ''}`} id="bank-details-collapse">
                            <table className="table table-sm mt-0">
                              <tbody>
                                {['bank_name', 'account_name', 'account_no', 'ifsc_code', 'phone_no', 'upi'].map((key) => {
                                  const displayName = key === 'phone_no' ? 'PhonePe, G-Pay, Paytm' : key.replace('_', ' ').toUpperCase();

                                  return (
                                    accountDetails?.[key] && (
                                      <tr key={key}>
                                        <th className="bg-light text-start text-dark small ps-2 pt-2">{displayName}</th>
                                        <td className="text-dark fw-bold small d-flex align-items-center">
                                          {accountDetails[key]}
                                          <Button className="btn btn-sm btn-white p-0 ms-2" onClick={() => handleCopy(key, accountDetails[key])} title="Copy">
                                            <CsLineIcons className="mx-2" icon="duplicate" />
                                          </Button>
                                          {copiedKey === key && <span className="text-success small ms-2">Copied!</span>}
                                        </td>
                                      </tr>
                                    )
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>

                        <Modal show={showModal} onHide={() => setShowModal(false)}>
                          <Modal.Body className="text-center p-4 position-relative">
                            {accountDetails?.qr && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-outline-light rounded-circle position-absolute top-0 end-0 mt-2 me-2 p-0"
                                  style={{ width: '25px', height: '25px' }}
                                  onClick={() => setShowModal(false)}
                                >
                                  <span className="text-danger">✖</span>
                                </button>
                                <img src={accountDetails.qr} alt="QR Code" className="img-fluid p-2 border rounded shadow-sm w-100" />
                                <div className="mt-3 fw-bold text-dark">
                                  Scan & Pay <span className="text-dark fs-6 fw-bold">₹{totalAmount}</span>
                                </div>
                              </>
                            )}
                          </Modal.Body>
                        </Modal>

                        {/* IMP Note */}
                        <Button
                          className="btn btn-light w-100 mb-0 p-1 mt-2 d-flex justify-content-between align-items-center"
                          onClick={() => setIsCollapsedNote(!isCollapsedNote)}
                          aria-expanded={!isCollapsedNote}
                          aria-controls="note-details-collapse"
                          style={{
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e0e0e0',
                            boxShadow: 'none',
                          }}
                        >
                          <span className="ps-2 fw-bold text-dark">Important Note</span>
                          <CsLineIcons icon={isCollapsedNote ? 'chevron-bottom' : 'chevron-top'} />
                        </Button>

                        <div className={`collapse border ${!isCollapsedNote ? 'show' : ''}`} id="note-details-collapse">
                          {accountDetails?.note ? (
                            <div className="mt-0 pt-2 small">
                              {accountDetails?.notedmtstates === true && (
                                <div className="p-2">
                                  Note 1. If you are using a credit card to make DMT payments then you would have to pay Rs. {(totalAmount * 1.0236).toFixed(2)}
                                  . <br />[ यदि आप DMT भुगतान क्रेडिट कार्ड के माध्यम से करते हैं, तो आपको ₹{(totalAmount * 1.0236).toFixed(2)} का भुगतान करना
                                  होगा ]
                                </div>
                              )}
                              <div className="p-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(accountDetails.note.replace(/<br>/g, '')) }} />
                            </div>
                          ) : null}
                        </div>

                        {/* Youtube Video */}
                        {videoUrl && (
                          <>
                            <Button
                              className="btn btn-light w-100 mb-0 p-1 mt-2 d-flex justify-content-between align-items-center"
                              onClick={() => setIsCollapsedYT(!isCollapsedYT)}
                              aria-expanded={!isCollapsedYT}
                              aria-controls="note-details-collapse"
                              style={{
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #e0e0e0',
                                boxShadow: 'none',
                              }}
                            >
                              <span className="ps-2 fw-bold text-dark">
                                {' '}
                                How to Use DMT Feature <CsLineIcons className="ps-2 text-danger icon-animate" icon="video" />
                              </span>
                              <CsLineIcons icon={isCollapsedYT ? 'chevron-bottom' : 'chevron-top'} />
                            </Button>

                            <div className={`collapse border ${!isCollapsedYT ? 'show' : ''}`} id="note-details-collapse">
                              <div className="card shadow-sm border-0 ">
                                <div className="card-body p-0">
                                  <div className="ratio ratio-16x9">
                                    <iframe src={videoUrl} title="DMT Help Video" allowFullScreen className="border-0" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Step 2: Payment Proof Submission */}
                  <div className="col-md-6">
                    <div className="text-center fw-bold py-2 bg_color text-white rounded">STEP 2: Submit Payment Proof</div>
                    <Form onSubmit={submit} className="border p-3 bg-white shadow-sm rounded">
                      {/* Payment Mode */}
                      <div className="mb-3">
                        <Form.Label className="fw-bold text-dark">
                          Payment Mode <span className="text-danger"> *</span>
                        </Form.Label>
                        <Form.Select name="paymentmode" value={formData.paymentmode} onChange={handleChange}>
                          <option hidden>Select Payment Mode</option>
                          {['GPay', 'PhonePe', 'Paytm', 'RTGS/IMPS/NEFT', 'Cash Deposit', 'Cheque', 'Other'].map((mode) => (
                            <option key={mode} value={mode}>
                              {mode}
                            </option>
                          ))}
                        </Form.Select>
                        {formErrors.paymentmode && <div className="mt-1 text-danger">{formErrors.paymentmode}</div>}
                      </div>

                      {/* Transaction ID */}
                      <div className="mb-3">
                        <Form.Label className="fw-bold text-dark">
                          Payment Transaction ID <span className="text-danger"> *</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="paymentId"
                          value={formData.paymentId}
                          onChange={handleChange}
                          placeholder="Transaction ID/ UTR no/ Cheque no"
                        />
                        {formErrors.paymentId && <div className="mt-1 text-danger">{formErrors.paymentId}</div>}
                      </div>

                      {/* Upload Payment Proof */}
                      <div className="mb-3">
                        <Form.Label className="fw-bold text-dark">
                          Upload Payment Proof <span className="text-danger"> *</span>
                        </Form.Label>
                        <Form.Control type="file" accept="image/*" name="file" onChange={handleChange} />
                        {formErrors.file && <div className="mt-1 text-danger">{formErrors.file}</div>}
                      </div>

                      {/* Submit Button */}
                      <div className="text-end">
                        <Button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Loading...' : 'Submit'}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      <Modal show={modalShow} backdrop="static" keyboard={false} onHide={pushToOrderPage} size="lg" aria-labelledby="order-success-modal" centered>
        <Modal.Body className="p-0">
          <Card className="shadow border-0 rounded-4 text-center">
            {/* Animated Check Icon */}
            <div className="py-5" style={{ background: '#f0fdf4', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}>
              <CheckCircleFill size={80} color="#28a745" className="success-zoom mb-3" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }} />
              <style>{`
          .success-zoom {
            display: inline-block;
            animation: zoomEffect 1.6s ease-in-out infinite;
          }
          @keyframes zoomEffect {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }
        `}</style>
              <h2 className="fw-bold mb-2">Thank You for Your Order!</h2>
              {dataSiteContent?.getSiteContent?.content && (
                <div className="p-4 text-dark small mb-0" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent.getSiteContent.content) }} />
              )}

              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center px-3 py-3">
                <Button
                  className="btn-success fw-semibold py-2"
                  style={{ color: '#28a745', border: 'none', minWidth: '120px', fontSize: '1rem' }}
                  onClick={pushToOrderPage}
                >
                  View Order Summary
                </Button>
              </div>
            </div>
          </Card>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default withRouter(CheckoutDMT);
