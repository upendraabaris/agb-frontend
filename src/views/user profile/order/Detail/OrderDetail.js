import React, { useEffect, useState } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Row, Col, Button, Card, Modal, Form } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch, useSelector } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import Tabbed from './component/Tabbed';

const GET_ORDER = gql`
  query GetOrder($getOrderId: ID!) {
    getOrder(id: $getOrderId) {
      id
      createdAt
      orderCancelledDate
      orderCancelledReason
      onlinepaymentStatus
      paymentGatewayResponse
      paymentMethod
      totalAmount
      shippingAmount
      paymentfailedReason
      acutalTotalAmount
      couponDiscount
      couponName
      dmtPaymentDiscount
      onlinePaymentCharge
      user {
        id
        firstName
        lastName
        email
      }
      billingAddress {
        firstName
        lastName
        mobileNo
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        altrMobileNo
        businessName
        gstin
      }
      shippingAddress {
        firstName
        lastName
        mobileNo
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        altrMobileNo
        businessName
        gstin
      }
      status
      paymentStatus
      paymentProof
      paymentId
      paymentmode
      freeDelivery
      orderProducts {
        productId {
          id
          previewName
          fullName
          thumbnail
          brand_name
          images
        }
        variantId {
          id
          variantName
        }
        locationId {
          id
          unitType
          sellerId {
            id
            companyName
            email
            review {
              id
              description
              userRating
              customerName
              ratingDate
            }
          }
        }
        iprice
        igst
        idiscount
        iextraChargeType
        iextraCharge
        itransportChargeType
        itransportCharge
        price
        quantity
        packedImage
        productStatus
        packageIdentifier
        packed
        shippedImage
        shipped
        shippedBy
        trackingNo
        trackingUrl
        pending
        delivered
        cancelled
        packedDate
        shippedDate
        deliveredDate
      }
    }
  }
`;

const ORDER_CANCEL = gql`
  mutation CancelOrder($cancelOrderId: ID!, $orderCancelledReason: String!) {
    cancelOrder(id: $cancelOrderId, orderCancelledReason: $orderCancelledReason) {
      id
    }
  }
`;

const PAYMENT_RESPONSE = gql`
  mutation HandlePaymentResponse($txn: String) {
    handlePaymentResponse(txn: $txn) {
      message
      success
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

const UPDATE_BILLING_ADDRESS = gql`
  mutation UpdateBillingAddress($orderId: ID!, $billingAddress: BillingAddressInput!) {
    updateBillingAddress(orderId: $orderId, billingAddress: $billingAddress) {
      id
      billingAddress {
        firstName
        lastName
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        mobileNo
        altrMobileNo
        businessName
        gstin
      }
    }
  }
`;

const OrderDetail = () => {
  const title = 'Order Detail';
  const description = 'Order Detail Page';
  const { dataStoreFeatures1 } = useGlobleContext();
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const sessionId = sessionStorage.getItem('orderID');
    const localId = localStorage.getItem('orderID');
    if (sessionId) {
      sessionStorage.removeItem('orderID');
    }
    if (localId) {
      localStorage.removeItem('orderID');
    }
  }, []);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const [paymentGatewayResponse, setPaymentGatewayResponse] = useState(null);
  // const [errorMessage, setErrorMessage] = useState('');
  const [getOrderDetail, { data: orderDetailData, refetch }] = useLazyQuery(GET_ORDER, {
    variables: {
      getOrderId: id,
    },

    onCompleted: () => {
      if (orderDetailData?.getOrder?.paymentGatewayResponse) {
        const paymentGatewayResponse1 = JSON.parse(orderDetailData.getOrder.paymentGatewayResponse);
        setPaymentGatewayResponse(paymentGatewayResponse1);
      }
    },
    onError: () => {
      toast.error('Invalid Order Id. Please enter the correct Order Id.');
    },
  });
  useEffect(() => {
    getOrderDetail();
  }, [getOrderDetail]);

  const { currentUser } = useSelector((state) => state.auth);
  const isLoggedIn = currentUser?.id === orderDetailData?.getOrder?.user?.id;

  const [HandlePaymentResponse] = useMutation(PAYMENT_RESPONSE, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => {
      console.log('err', err);
    },
  });

  useEffect(() => {
    if (
      orderDetailData?.getOrder?.id &&
      orderDetailData?.getOrder?.paymentMethod === 'ONLINE' &&
      (!orderDetailData?.getOrder?.paymentGatewayResponse || !orderDetailData?.getOrder?.onlinepaymentStatus)
    ) {
      HandlePaymentResponse({
        variables: {
          txn: orderDetailData.getOrder.id,
        },
      });
    }
  }, [HandlePaymentResponse, orderDetailData]);

  const [imagemodal, setImagemodal] = useState(false);

  const [imagepath, setImagepath] = useState('');
  function downloadImage() {
    setImagemodal(true);
    setImagepath(orderDetailData.getOrder.paymentProof);
    // const paymentProofUrl = orderDetailData.getOrder.paymentProof;
    // if (paymentProofUrl) {
    //   const link = document.createElement('a');
    //   link.href = paymentProofUrl;
    //   link.target = '_blank';
    //   link.click();
    // }
  }

  // handle payment proof

  const initialState = {
    orderId: id,
    file: '',
    paymentId: '',
    paymentmode: '',
    paymentStatus: 'Payment Proof Submited',
    paymentMethod: 'DMT',
  };

  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  const [submitproofmodal, setsubmitproofmodal] = useState(false);

  const [SubmutPaymentProof, { loading }] = useMutation(SUBMIT_PAYMENT_PROOF, {
    onCompleted: () => {
      setFormData(initialState);
      refetch();
      toast.success('Payment Proof Submitted Successfully!');
      setsubmitproofmodal(false);
    },
    onError: (err) => {
      console.log('SUBMIT_PAYMENT_PROOF', err);
    },
  });

  const handleSelect = (orderkaStatus) => {
    setFormErrors({});
    setFormData(initialState);
    if (orderkaStatus === 'submittheproof') {
      setsubmitproofmodal(true);
    }
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

  let pendingOrder = false;

  // order cancel

  const [orderCancelModal, setOrderCancelModal] = useState(false);
  const [orderCancelledReason, setOrdercancelReason] = useState('');
  const [ordercancelerror, setOrdercancelerror] = useState('');

  const [CancelOrder, { loading: cancelOrderLoading }] = useMutation(ORDER_CANCEL, {
    onCompleted: () => {
      refetch();
      setOrderCancelModal(false);
      setOrdercancelReason('');
      toast.success('Your order has been successfully cancelled.', {
        autoClose: 5000,
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong !!');
    },
  });
  const cancelTheOrder = async (e) => {
    e.preventDefault();

    if (!orderCancelledReason.trim()) {
      setOrdercancelerror('Please enter reason for cancelling the order.');
      return;
    }
    await CancelOrder({
      variables: { cancelOrderId: orderDetailData.getOrder.id, orderCancelledReason },
    });
  };

  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [billingForm, setBillingForm] = useState(orderDetailData?.getOrder?.billingAddress || {});

  useEffect(() => {
    if (orderDetailData?.getOrder?.billingAddress) {
      setBillingForm(orderDetailData.getOrder.billingAddress);
    }
  }, [orderDetailData]);

  // Mutation for updating billing address
  const [UpdateBillingAddress] = useMutation(UPDATE_BILLING_ADDRESS, {
    onCompleted: () => {
      toast.success('Billing Address updated successfully!');
      refetch();
      setIsEditingBilling(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveBillingAddress = async () => {
    await UpdateBillingAddress({
      variables: {
        orderId: orderDetailData.getOrder.id,
        billingAddress: billingForm,
      },
    });
  };

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
        {`.border_color {
            border: 1px solid ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        `}
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
      <div>
        <Row className="g-0 mb-2">
          {/* Title Start */}
          <Col className="col-auto mb-sm-0 me-auto">
            <button type="button" className="bg-transparent border-0 p-0 m-0 text-dark" onClick={() => window.history.back()}>
              Back
            </button>
            <span className="p-1 small"> / </span>
            <NavLink className="" to="/user/orders">
              <span className="align-middle text-dark ms-1">Orders</span>
            </NavLink>
            <span className="p-1 small"> / </span>
            <span className="align-middle ms-1">Order Details</span>
          </Col>
        </Row>
      </div>

      {orderDetailData?.getOrder && (
        <Row>
          <Col xl="8" xxl="9">
            {/* Status Start */}
            <Row className="g-2 mb-5">
              <Col sm="6">
                <Card>
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border_color sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="tag" className="font_color" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Order Id</div>
                        <div className="text-dark">{id}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm="6">
                <Card>
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border_color sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="watch" className="font_color" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Order Date</div>
                        <div className="text-dark">{moment(parseInt(orderDetailData.getOrder.createdAt, 10)).format('DD-MMM-YYYY')}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm="6">
                <Card>
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border_color sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="calendar" className="font_color" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Payment Method</div>
                        {/* eslint-disable-next-line no-nested-ternary */}
                        {orderDetailData.getOrder.paymentMethod === 'ONLINE' ? (
                          paymentGatewayResponse && orderDetailData.getOrder.onlinepaymentStatus === 'success' ? (
                            <div className="text-dark">{`${orderDetailData.getOrder.paymentMethod} / ${
                              paymentGatewayResponse?.transaction_details[id]?.mode
                            } / ${paymentGatewayResponse?.transaction_details[id]?.status.toUpperCase()}`}</div>
                          ) : (
                            <div className="text-danger">
                              {paymentGatewayResponse?.transaction_details?.[id]?.status
                                ? `${orderDetailData.getOrder.paymentMethod} / ${paymentGatewayResponse.transaction_details[id].status.toUpperCase()}`
                                : `${orderDetailData.getOrder.paymentMethod} / PAYMENT NOT CONFIRMED`}
                              {!paymentGatewayResponse?.transaction_details?.[id]?.status && (
                                <div className="text-muted small">
                                  If you have completed the payment and status is not updated, please check your bank statement or contact support.
                                </div>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="text-dark">
                            {orderDetailData.getOrder.paymentMethod}
                            {orderDetailData?.getOrder?.paymentStatus === 'pending' && (
                              <Button type="button" className="border-transparent p-1 bg-transparent text-dark" onClick={() => handleSelect('submittheproof')}>
                                /{' '}
                                <span className="p-1 font_color">
                                  Submit Payment Proof <CsLineIcons icon="next" size="17" className="font_color" />
                                </span>
                              </Button>
                            )}
                            {orderDetailData?.getOrder?.paymentStatus === 'failed' && <div className="text-danger small">Order Failed</div>}
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              {orderDetailData?.getOrder?.status === 'cancelled' && orderDetailData?.getOrder?.orderCancelledReason && (
                <Col sm="6">
                  <Card>
                    <Card.Body className="h-100 py-3 d-flex align-items-center">
                      <Row className="g-0 align-items-center">
                        <Col xs="auto" className="pe-3">
                          <div className="border_color sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                            <CsLineIcons icon="shipping" className="font_color" />
                          </div>
                        </Col>
                        <Col>
                          <div className="d-flex align-items-center lh-1-25">Order Cancelled </div>
                          <div>
                            <div className="small">
                              <span className="text-danger"> Date:</span>{' '}
                              {moment(parseInt(orderDetailData.getOrder.orderCancelledDate, 10)).format('DD-MM-YYYY')}
                            </div>
                          </div>
                          <div>
                            <div className="small">
                              <span className="text-danger"> Reason:</span> {orderDetailData.getOrder.orderCancelledReason}
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              )}
              {orderDetailData?.getOrder?.paymentMethod === 'DMT' && (
                <>
                  {orderDetailData.getOrder.paymentmode && (
                    <Col sm="6">
                      <Card>
                        <Card.Body className="h-100 py-3 d-flex align-items-center">
                          <Row className="g-0 align-items-center">
                            <Col xs="auto" className="pe-3">
                              <div className="border_color sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                                <CsLineIcons icon="sort" className="font_color" />
                              </div>
                            </Col>
                            <Col>
                              <div className="d-flex align-items-center lh-1-25">Transaction Details</div>
                              <div>
                                <span>
                                  {orderDetailData?.getOrder?.paymentmode && <>{orderDetailData.getOrder.paymentmode}</>}{' '}
                                  {orderDetailData.getOrder.paymentStatus === 'Payment Proof Submited' && (
                                    <>
                                      / <span className="text-info fw-semibold"> Payment Verification Pending</span>
                                    </>
                                  )}
                                </span>
                                {orderDetailData.getOrder.paymentStatus === 'failed' ? (
                                  <>
                                    <span> / Payment Verification Failed </span>
                                    <div className="small">
                                      {' '}
                                      ( <span className="text-danger"> Reason:</span> {orderDetailData.getOrder.paymentfailedReason} )
                                    </div>
                                  </>
                                ) : (
                                  ''
                                )}
                                {orderDetailData.getOrder.paymentStatus === 'complete' ? '/ Payment Success' : ''}
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}

                  {orderDetailData.getOrder.paymentProof && (
                    <Col sm="6">
                      <Card>
                        <Card.Body className="h-100 py-3 d-flex align-items-center">
                          <Row className="g-0 align-items-center">
                            <Col xs="auto" className="pe-3">
                              <div className="border_color sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                                <CsLineIcons icon="money" className="font_color" />
                              </div>
                            </Col>
                            <Col>
                              <div className="d-flex align-items-center lh-1-25">Payment Proof</div>
                              <Button variant="link" onClick={() => downloadImage()} className="btn btn-link p-0">
                                Click To See
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}
                </>
              )}
            </Row>
            {/* Status End */}
            <Tabbed orderDetailData={orderDetailData} id={id} />
            {/* Pending Order Start */}

            <Card className="">
              <div className="">
                <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded"> Ordered Items</div>

                <div className="p-2">
                  {orderDetailData?.getOrder?.orderProducts.map((cart, index) => {
                    if (cart.pending && !cart.packed) {
                      pendingOrder = true;
                      return (
                        <Row key={index} className="g-0 mt-2">
                          <Col xs="auto">
                            <img
                              src={cart.productId.thumbnail || (cart.productId.images.length > 0 && cart.productId.images[0])}
                              className="mx-auto img-thumbnail rounded-md w-100 sw-10"
                              alt="thumb"
                            />
                          </Col>
                          <Col>
                            <div className="ps-4 pt-0 pb-0 pe-0 h-100">
                              <Row className="g-0 h-100 align-items-start align-content-center">
                                <Col xs="12" className="d-flex flex-column">
                                  <div>
                                    {cart.productId.fullName} {cart.variantId.variantName}
                                  </div>
                                  <div className="text-dark text-normal">Brand: {cart.productId.brand_name}</div>
                                </Col>
                                <Col xs="12" className="d-flex flex-column mb-md-0 pt-1">
                                  <Row className="g-0">
                                    <Col xs="8" className="d-flex small flex-row pe-2 align-items-end ">
                                      <span>Price: {((cart.price - cart.itransportCharge * cart.quantity) / cart.quantity).toFixed(2)}</span>
                                      <span className="text-dark ms-1 me-1">x</span>
                                      <span>{cart.quantity}</span>
                                    </Col>
                                    <Col xs="4" className="d-flex small flex-row align-items-end justify-content-end ">
                                      <span>
                                        <span className="text-normal">₹ </span>
                                        {(cart.price - cart.itransportCharge * cart.quantity).toFixed(2)}
                                      </span>
                                    </Col>
                                  </Row>

                                  {!orderDetailData.getOrder.freeDelivery && cart.itransportCharge ? (
                                    <Row className="g-0">
                                      <Col xs="8" className="d-flex small flex-row pe-2 align-items-end ">
                                        <span>
                                          {cart.itransportChargeType} : {cart.itransportCharge} x {cart.quantity}
                                        </span>
                                      </Col>
                                      <Col xs="4" className="d-flex small flex-row align-items-end justify-content-end ">
                                        <span>
                                          <span className="text-normal">₹ </span>
                                          <span>{cart.quantity * cart.itransportCharge}</span>
                                        </span>
                                      </Col>
                                    </Row>
                                  ) : null}
                                </Col>
                              </Row>
                            </div>
                          </Col>
                          <hr className="mt-2" />
                        </Row>
                      );
                    }
                    return null;
                  })}
                  {orderDetailData?.getOrder?.orderProducts && !pendingOrder && <div className="text-center my-3">No Pending Orders</div>}
                </div>
              </div>
            </Card>
            {/* Pennding Order End */}

            {/* Cart Start */}

            <Card className=" mt-2">
              <div>
                <div>
                  <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded"> Cart Total</div>

                  {/* <hr /> */}
                  <Row className="g-0 p-2 mb-2 mt-2">
                    <Row className="g-0 mb-2">
                      <Col xs="auto" className="ms-auto ps-3 fw-bold text-dark">
                        Amount
                      </Col>
                      <Col xs="auto" className="sw-13 text-end">
                        <span>
                          <span className="text-dark">₹ </span>
                          {(
                            orderDetailData.getOrder.acutalTotalAmount -
                            orderDetailData.getOrder.shippingAmount +
                            orderDetailData.getOrder.couponDiscount
                          ).toFixed(2)}
                        </span>
                      </Col>
                    </Row>
                    {orderDetailData.getOrder.couponDiscount ? (
                      <>
                        <Row className="g-0 mb-2">
                          <Col xs="auto" className="ms-auto ps-3 fw-bold text-dark">
                            Coupon Appiled ({orderDetailData.getOrder.couponName})
                          </Col>
                          <Col xs="auto" className="sw-13 text-end">
                            <span>
                              <span className="text-dark">- ₹ </span>
                              {orderDetailData.getOrder.couponDiscount}
                            </span>
                          </Col>
                        </Row>
                      </>
                    ) : null}
                    {orderDetailData.getOrder.shippingAmount ? (
                      <Row className="g-0 mb-2">
                        <Col xs="auto" className="ms-auto ps-3 fw-bold text-dark">
                          Delivery Charge
                        </Col>
                        <Col xs="auto" className="sw-13 text-end">
                          <span>
                            <span className="text-dark">+ ₹ </span>
                            {orderDetailData.getOrder.shippingAmount}
                          </span>
                        </Col>
                      </Row>
                    ) : null}
                    {/* {orderDetailData.getOrder.paymentMethod === 'DMT' ? (
                      <Row className="g-0 mb-2">
                        <Col xs="auto" className="ms-auto ps-3">
                          DMT Payment Discount
                        </Col>
                        <Col xs="auto" className="sw-13 text-end">
                          <span>
                            <span className="text-dark">- ₹ </span>
                            {orderDetailData.getOrder.dmtPaymentDiscount}
                          </span>
                        </Col>
                      </Row>
                    ) : null} */}
                    {orderDetailData.getOrder.paymentMethod === 'DMT' && orderDetailData.getOrder.dmtPaymentDiscount > 0 ? (
                      <Row className="g-0 mb-2">
                        <Col xs="auto" className="ms-auto ps-3 fw-bold text-dark">
                          DMT Payment Discount
                        </Col>
                        <Col xs="auto" className="sw-13 text-end">
                          <span>
                            <span className="text-dark">- ₹ </span>
                            {orderDetailData.getOrder.dmtPaymentDiscount}
                          </span>
                        </Col>
                      </Row>
                    ) : null}

                    {orderDetailData.getOrder.paymentMethod === 'ONLINE' && orderDetailData.getOrder.onlinePaymentCharge > 0 ? (
                      <Row className="g-0 mb-2">
                        <Col xs="auto" className="ms-auto ps-3 fw-bold text-dark">
                          Online Payment Charge
                        </Col>
                        <Col xs="auto" className="sw-13 text-end">
                          <span>
                            <span className="text-dark">+ ₹ </span>
                            {orderDetailData.getOrder.onlinePaymentCharge}
                          </span>
                        </Col>
                      </Row>
                    ) : null}
                    <hr />
                    <Row className="g-0 mb-2">
                      <Col xs="auto" className="ms-auto ps-3 fw-bold text-dark">
                        Total Amount Paid
                      </Col>
                      <Col xs="auto" className="sw-13 text-end">
                        <span className="fw-bold">
                          <span className="text-dark fw-bold text-dark">₹ </span>
                          {orderDetailData.getOrder.totalAmount}
                        </span>
                      </Col>
                    </Row>
                  </Row>
                </div>
              </div>
            </Card>
            {/* Cart End */}

            {orderDetailData?.getOrder?.status === 'pending' && orderDetailData?.getOrder?.paymentStatus !== 'failed' && isLoggedIn && (
              <Col xs="auto" className="d-flex align-items-end justify-content-start mb-2 mb-sm-0">
                <Button onClick={() => setOrderCancelModal(true)} className="border bg-white">
                  <div className="text-danger">Cancel Order</div>
                </Button>
              </Col>
            )}
          </Col>

          <Col xl="4" xxl="3">
            <Card className="mb-5">
              <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded">Address</div>
              <div className="p-3">
                {orderDetailData.getOrder?.user && (
                  <div className="mb-2 p-2">
                    <p className="text-normal fw-bold text-dark mb-2">Customer</p>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="user" size="17" className="font_color" />
                        </div>
                      </Col>
                      <Col className="">
                        {orderDetailData.getOrder.user.firstName} {orderDetailData.getOrder.user.lastName}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="email" size="17" className="font_color" />
                        </div>
                      </Col>
                      <Col className="">{orderDetailData.getOrder.user.email}</Col>
                    </Row>
                  </div>
                )}
                {orderDetailData.getOrder.shippingAddress && (
                  <div className="mb-2 p-2 pt-3 border-top">
                    <p className="text-normal fw-bold mb-2 rounded ">Shipping Address</p>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="user" size="17" className="font_color" />
                        </div>
                      </Col>
                      <Col className="">
                        {orderDetailData.getOrder.shippingAddress.firstName} {orderDetailData.getOrder.shippingAddress.lastName}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="pin" size="17" className="font_color" />
                        </div>
                      </Col>
                      <Col className="">
                        {orderDetailData.getOrder.shippingAddress.addressLine1}, {orderDetailData.getOrder.shippingAddress.addressLine2},{' '}
                        {orderDetailData.getOrder.shippingAddress.city}, {orderDetailData.getOrder.shippingAddress.state}{' '}
                        {orderDetailData.getOrder.shippingAddress.postalCode} {orderDetailData.getOrder.shippingAddress.country}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="phone" size="17" className="font_color" />
                        </div>
                      </Col>
                      <Col className="">
                        {orderDetailData.getOrder.shippingAddress.mobileNo}
                        {orderDetailData.getOrder.shippingAddress.altrMobileNo && <span>, {orderDetailData.getOrder.shippingAddress.altrMobileNo}</span>}{' '}
                      </Col>
                    </Row>
                    {orderDetailData.getOrder.shippingAddress.businessName && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="shop" size="17" className="font_color" />
                          </div>
                        </Col>
                        <Col className="">{orderDetailData.getOrder.shippingAddress.businessName}</Col>
                      </Row>
                    )}
                    {orderDetailData.getOrder.shippingAddress.gstin && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="credit-card" size="17" className="font_color" />
                          </div>
                        </Col>
                        <Col className="">{orderDetailData.getOrder.shippingAddress.gstin}</Col>
                      </Row>
                    )}
                  </div>
                )}
                {orderDetailData.getOrder.billingAddress && (
                  <div className="mb-2 p-2 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <p className="text-normal fw-bold mb-0">Billing Address</p>
                    </div>
                    {!isEditingBilling ? (
                      <>
                        <Row className="g-0 mb-2">
                          <Col xs="auto" className="pe-2">
                            <CsLineIcons icon="user" size="17" className="font_color" />
                          </Col>
                          <Col>
                            {billingForm.firstName} {billingForm.lastName}
                          </Col>
                        </Row>
                        <Row className="g-0 mb-2">
                          <Col xs="auto" className="pe-2">
                            <CsLineIcons icon="pin" size="17" className="font_color" />
                          </Col>
                          <Col>
                            {billingForm.addressLine1}, {billingForm.addressLine2}, {billingForm.city}, {billingForm.state} {billingForm.postalCode}{' '}
                            {billingForm.country}
                          </Col>
                        </Row>
                        <Row className="g-0 mb-2">
                          <Col xs="auto" className="pe-2">
                            <CsLineIcons icon="phone" size="17" className="font_color" />
                          </Col>
                          <Col>
                            {billingForm.mobileNo}
                            {billingForm.altrMobileNo && <span>, {billingForm.altrMobileNo}</span>}
                          </Col>
                        </Row>
                        {billingForm.businessName && (
                          <Row className="g-0 mb-2">
                            <Col xs="auto" className="pe-2">
                              <CsLineIcons icon="shop" size="17" className="font_color" />
                            </Col>
                            <Col>{billingForm.businessName}</Col>
                          </Row>
                        )}
                        {billingForm.gstin && (
                          <Row className="g-0 mb-2">
                            <Col xs="auto" className="pe-2">
                              <CsLineIcons icon="credit-card" size="17" className="font_color" />
                            </Col>
                            <Col>{billingForm.gstin}</Col>
                          </Row>
                        )}
                      </>
                    ) : (
                      <form>
                        <Row className="mb-2">
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="firstName"
                              value={billingForm.firstName || ''}
                              onChange={handleBillingChange}
                              placeholder="First Name"
                            />
                          </Col>
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="lastName"
                              value={billingForm.lastName || ''}
                              onChange={handleBillingChange}
                              placeholder="Last Name"
                            />
                          </Col>
                        </Row>
                        <Row className="mb-2">
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="addressLine1"
                              value={billingForm.addressLine1 || ''}
                              onChange={handleBillingChange}
                              placeholder="Address Line 1"
                            />
                          </Col>
                        </Row>
                        <Row className="mb-2">
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="addressLine2"
                              value={billingForm.addressLine2 || ''}
                              onChange={handleBillingChange}
                              placeholder="Address Line 2"
                            />
                          </Col>
                        </Row>
                        <Row className="mb-2">
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="city"
                              value={billingForm.city || ''}
                              onChange={handleBillingChange}
                              placeholder="City"
                            />
                          </Col>
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="state"
                              value={billingForm.state || ''}
                              onChange={handleBillingChange}
                              placeholder="State"
                            />
                          </Col>
                        </Row>
                        <Row className="mb-2">
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="postalCode"
                              value={billingForm.postalCode || ''}
                              onChange={handleBillingChange}
                              placeholder="Postal Code"
                            />
                          </Col>
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="country"
                              value={billingForm.country || ''}
                              onChange={handleBillingChange}
                              placeholder="Country"
                            />
                          </Col>
                        </Row>
                        <Row className="mb-2">
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="mobileNo"
                              value={billingForm.mobileNo || ''}
                              onChange={handleBillingChange}
                              placeholder="Mobile No"
                            />
                          </Col>
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="altrMobileNo"
                              value={billingForm.altrMobileNo || ''}
                              onChange={handleBillingChange}
                              placeholder="Alternate Mobile No"
                            />
                          </Col>
                        </Row>
                        <Row className="mb-2">
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="businessName"
                              value={billingForm.businessName || ''}
                              onChange={handleBillingChange}
                              placeholder="Business Name"
                            />
                          </Col>
                          <Col>
                            <input
                              type="text"
                              className="form-control"
                              name="gstin"
                              value={billingForm.gstin || ''}
                              onChange={handleBillingChange}
                              placeholder="GSTIN"
                            />
                          </Col>
                        </Row>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      )}
      <Modal show={submitproofmodal} onHide={() => setsubmitproofmodal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fs-6 text-dark fw-bold">Submit Payment Proof</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 p-2">
          <Form onSubmit={submit}>
            <div className="row">
              <div className="col-md-5">
                <Form.Label className="text-dark fw-bold">
                  Payment Mode <span className="text-danger"> * </span>{' '}
                </Form.Label>
              </div>
              <div className="col-md-7">
                <Form.Select name="paymentmode" value={formData.paymentmode} onChange={handleChange}>
                  <option hidden>Select Payment Mode</option>
                  <option value="QR Code">QR Code</option>
                  <option value="GPay">GPay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">PayTM</option>
                  <option value="RTGS/IMPS/NEFT">RTGS/IMPS/NEFT</option>
                  <option value="Others">Others</option>
                  {/* <option value="Cash Deposit">Cash Deposit</option> */}
                  {/* <option value="Cheque">Cheque</option> */}
                </Form.Select>
                {formErrors.paymentmode && <div className="mt-1 text-danger">{formErrors.paymentmode}</div>}
              </div>
            </div>
            <div className="row my-3">
              <div className=" col-md-5">
                <Form.Label className="text-dark fw-bold">
                  Payment Transaction Id <span className="text-danger"> * </span>{' '}
                </Form.Label>
              </div>
              <div className=" col-md-7">
                <Form.Control
                  value={formData.paymentId}
                  onChange={handleChange}
                  placeholder="Transaction ID/ UTR no/ Cheque no"
                  type="text"
                  style={{ fontSize: 14 }}
                  name="paymentId"
                />
                {formErrors.paymentId && <div className="mt-1 text-danger">{formErrors.paymentId}</div>}
              </div>
            </div>
            <div className="row my-3">
              <div className=" col-md-5">
                <Form.Label className="text-dark fw-bold">
                  Upload Payment Proof <span className="text-danger"> * </span>{' '}
                </Form.Label>
              </div>
              <div className=" col-md-7">
                <Form.Control type="file" accept="image/*" name="file" onChange={handleChange} />
                {formErrors.file && <div className="mt-1 text-danger">{formErrors.file}</div>}
              </div>
            </div>
            <div className="row justify-content-end my-3">
              <div className="col-md-6">
                {loading ? (
                  <Button className="btn_color float-end">Loading </Button>
                ) : (
                  <Button className="btn_color float-end" type="submit">
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {imagepath && (
        <Modal show={imagemodal} onHide={() => setImagemodal(false)}>
          <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
            <Modal.Title className="fw-bold">Payment Proof</Modal.Title>
          </Modal.Header>
          <Modal.Body className="mx-2 my-2">
            <div className="row">
              <picture>
                <img src={imagepath} className="img-fluid" alt="image desc" />
              </picture>
            </div>
          </Modal.Body>
        </Modal>
      )}

      <Modal show={orderCancelModal} onHide={() => setOrderCancelModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">Cancel Order</Modal.Title>
        </Modal.Header>
        <div className="m-3 mt-2">
          <Form onSubmit={cancelTheOrder}>
            <div className="row">
              <div className="w-100">
                <Form.Control
                  as="textarea"
                  value={orderCancelledReason}
                  onChange={(e) => setOrdercancelReason(e.target.value)}
                  placeholder="Please submit your reasons for cancelling the order."
                  type="text"
                  style={{ fontSize: 14 }}
                  name="orderCancelledReason"
                />

                {ordercancelerror && <div className="mt-1 text-danger">{ordercancelerror}</div>}
              </div>
            </div>
            <div className="row my-3 float-end">
              <div className="col-md-6">
                {cancelOrderLoading ? (
                  <Button className="btn_color">Loading</Button>
                ) : (
                  <Button type="submit" className="btn_color">
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default OrderDetail;
