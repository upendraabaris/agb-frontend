import React, { useEffect, useState } from 'react';
import { useParams, NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Card, Modal, Form, Spinner } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import moment from 'moment';
import { toast } from 'react-toastify';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import Tabbed from './component/Tabbed';

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
const ORDER_DETAIL = gql`
  query GetOrder($getOrderId: ID!) {
    getOrder(id: $getOrderId) {
      id
      orderCancelledDate
      orderCancelledReason
      onlinepaymentStatus
      paymentGatewayResponse
      paymentMethod
      totalAmount
      paymentfailedReason
      shippingAmount
      acutalTotalAmount
      couponDiscount
      couponName
      dmtPaymentDiscount
      onlinePaymentCharge
      createdAt
      user {
        firstName
        lastName
        email
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
const UPDATE_PAYMENT_PROOF = gql`
  mutation UpdatePaymentProofStatus($updatePaymentProofStatusId: ID!, $paymentStatus: String!, $paymentfailedReason: String) {
    updatePaymentProofStatus(id: $updatePaymentProofStatusId, paymentStatus: $paymentStatus, paymentfailedReason: $paymentfailedReason) {
      id
    }
  }
`;

const OrdersDetail = () => {
  const title = 'Order Detail';
  const description = 'Ecommerce Order Detail Page';
  const { id } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);
  const [paymentGatewayResponse, setPaymentGatewayResponse] = useState(null);
  const [getOrderDetail, { data: orderDetailData, refetch }] = useLazyQuery(ORDER_DETAIL, {
    variables: {
      getOrderId: id,
    },
    onCompleted: () => {
      if (orderDetailData?.getOrder?.paymentGatewayResponse) {
        const paymentGatewayResponse1 = JSON.parse(orderDetailData.getOrder.paymentGatewayResponse);
        setPaymentGatewayResponse(paymentGatewayResponse1);
      }
    },
    onError: (error) => {
      console.log('error', error);
    },
  });
  useEffect(() => {
    getOrderDetail();
  }, [getOrderDetail]);
  const [HandlePaymentResponse] = useMutation(PAYMENT_RESPONSE, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => {
      console.error('err', err);
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
  const [totalCartValue, setTotalCartValue] = useState(0);
  useEffect(() => {
    if (orderDetailData && orderDetailData.getOrder) {
      const { orderProducts } = orderDetailData.getOrder;
      const calculatedTotalCartValue = orderProducts.reduce((total, product) => total + product.price, 0);
      setTotalCartValue(calculatedTotalCartValue);
    }
  }, [orderDetailData]);
  const [imagemodal, setImagemodal] = useState(false);
  const [imagepath, setImagepath] = useState('');
  function downloadImage() {
    setImagemodal(true);
    setImagepath(orderDetailData.getOrder.paymentProof);
  }
  const [modalshow, setmodalshow] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submitproofmodal, setsubmitproofmodal] = useState(false);
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
  const handleSelect = (orderkaStatus) => {
    setFormErrors({});
    setFormData(initialState);
    setCancelReason('');
    if (orderkaStatus === 'complete') {
      setmodalshow(true);
    }
    if (orderkaStatus === 'submittheproof') {
      setsubmitproofmodal(true);
    }
  };
  const [UpdatePaymentProofStatus] = useMutation(UPDATE_PAYMENT_PROOF, {
    onCompleted: () => {
      setmodalshow(false);
      refetch();
      toast.success('Payment Status updated !');
    },
    onError: (error) => { 
      toast.error(error.message || 'Something went wrong !');
    },
  });
  const [error, seterror] = useState('');
  const submitproof = async (paymentStatus) => {
    seterror('');
    if (paymentStatus === 'failed') {
      if (cancelReason.trim() === '') {
        seterror('Select reason for disapproval');
      } else {
        await UpdatePaymentProofStatus({
          variables: {
            updatePaymentProofStatusId: id,
            paymentStatus,
            paymentfailedReason: cancelReason,
          },
        });
      }
    } else {
      await UpdatePaymentProofStatus({
        variables: {
          updatePaymentProofStatusId: id,
          paymentStatus,
        },
      });
    }
  };
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
  const [orderCancelModal, setOrderCancelModal] = useState(false);
  const [orderCancelledReason, setOrdercancelReason] = useState('');
  const [ordercancelerror, setOrdercancelerror] = useState('');
  const [CancelOrder, { loading: cancelOrderLoading }] = useMutation(ORDER_CANCEL, {
    onCompleted: () => {
      refetch();
      setOrderCancelModal(false);
      setOrdercancelReason('');
      toast.success('Successfully Cancelled Order !!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something Went Wrong !!'); 
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
  const history = useHistory();
  const goBack = () => {
    history.goBack();
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-3">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" onClick={goBack} to="">
              <span className="text-dark ms-1"> Go Back</span>
            </NavLink>
          </Col>
          <Row className="m-0 p-1 rounded bg-white align-items-center">
            <Col md="6">
              <span className="fw-bold fs-5 ps-2 pt-2">{title}</span>
            </Col>
            {orderDetailData?.getOrder?.paymentMethod === 'DMT' && (
              <Col md="6" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
                <Dropdown onSelect={handleSelect} className="w-100 w-md-auto">
                  <Dropdown.Toggle className="w-100 w-md-auto" variant="outline-primary">
                    Payment Proof
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {orderDetailData?.getOrder?.paymentStatus === 'Payment Proof Submited' && (
                      <Dropdown.Item eventKey="complete">Change Payment Status </Dropdown.Item>
                    )}
                    {orderDetailData?.getOrder?.paymentStatus === 'pending' && <Dropdown.Item eventKey="complete">Change Payment Status </Dropdown.Item>}
                    {orderDetailData?.getOrder?.paymentStatus === 'pending' && <Dropdown.Item eventKey="submittheproof">Submit Payment Proof</Dropdown.Item>}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            )}
          </Row>
        </Row>
      </div>
      {orderDetailData && orderDetailData.getOrder && (
        <Row>
          <Col xl="8" xxl="9">
            <Row className="g-2 mb-2">
              <Col sm="6">
                <Card className="sh-13 sh-lg-15 sh-xl-14">
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="tag" className="text-primary" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Order Id</div>
                        <div className="text-dark">{orderDetailData.getOrder.id}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col sm="6">
                <Card className="sh-13 sh-lg-15 sh-xl-14">
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="note" className="text-primary" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Order Date</div>
                        <div className="text-dark">{moment(parseInt(orderDetailData.getOrder?.createdAt, 10)).format('LL')}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col sm="6">
                <Card className="sh-13 sh-lg-15 sh-xl-14">
                  <Card.Body className="h-100 py-3 d-flex align-items-center">
                    <Row className="g-0 align-items-center">
                      <Col xs="auto" className="pe-3">
                        <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                          <CsLineIcons icon="calendar" className="text-primary" />
                        </div>
                      </Col>
                      <Col>
                        <div className="d-flex align-items-center lh-1-25">Payment Method</div>

                        {/* eslint-disable-next-line no-nested-ternary */}
                        {orderDetailData.getOrder.paymentMethod === 'ONLINE' ? (
                          paymentGatewayResponse && orderDetailData.getOrder.onlinepaymentStatus === 'success' ? (
                            <div className="text-dark">{`${orderDetailData.getOrder.paymentMethod}/ ${
                              paymentGatewayResponse?.transaction_details[id]?.mode
                            }/ ${paymentGatewayResponse?.transaction_details[id]?.status.toUpperCase()}`}</div>
                          ) : (
                            <div className="text-dark">{`${orderDetailData.getOrder.paymentMethod}/ ${paymentGatewayResponse?.transaction_details[
                              id
                            ]?.status.toUpperCase()}`}</div>
                          )
                        ) : (
                          <div className="text-dark">
                            {orderDetailData.getOrder.paymentMethod}
                            {orderDetailData.getOrder.paymentStatus === 'pending' && ' / Payment Proof Not Submitted'}
                            {orderDetailData.getOrder.paymentStatus === 'failed' && (
                              <span>
                                {' '}
                                / Payment Failed: <span className="small">({orderDetailData.getOrder.paymentfailedReason})</span>
                              </span>
                            )}
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              {orderDetailData?.getOrder?.status === 'cancelled' && orderDetailData?.getOrder?.orderCancelledReason && (
                <Col sm="6">
                  <Card className="sh-13 sh-lg-15 sh-xl-14">
                    <Card.Body className="h-100 py-3 d-flex align-items-center">
                      <Row className="g-0 align-items-center">
                        <Col xs="auto" className="pe-3">
                          <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                            <CsLineIcons icon="shipping" className="text-primary" />
                          </div>
                        </Col>
                        <Col>
                          <div className="d-flex align-items-center lh-1-25">Order Cancelled </div>
                          {/* <div className="text-primary"> {orderDetailData?.getOrder?.orderCancelledReason}</div> */}
                          <div>
                            <div className="small">
                              <span className="text-danger"> Date:</span> {moment(parseInt(orderDetailData.getOrder.orderCancelledDate, 10)).format('ll')}
                            </div>
                          </div>
                          <div>
                            <div className="small">
                              ( <span className="text-danger"> Reason:</span> {orderDetailData.getOrder.orderCancelledReason} )
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
                      <Card className="sh-13 sh-lg-15 sh-xl-14">
                        <Card.Body className="h-100 py-3 d-flex align-items-center">
                          <Row className="g-0 align-items-center">
                            <Col xs="auto" className="pe-3">
                              <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                                <CsLineIcons icon="sort" className="text-primary" />
                              </div>
                            </Col>
                            <Col>
                              <div className="d-flex align-items-center lh-1-25">Transaction Details</div>
                              <div>
                                {`${orderDetailData.getOrder.paymentmode} ${
                                  orderDetailData.getOrder.paymentStatus === 'Payment Proof Submited' ? ' / Payment Verification Pending' : ''
                                }`}
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
                      <Card className="sh-13 sh-lg-15 sh-xl-14">
                        <Card.Body className="h-100 py-3 d-flex align-items-center">
                          <Row className="g-0 align-items-center">
                            <Col xs="auto" className="pe-3">
                              <div className="border border-primary sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center">
                                <CsLineIcons icon="money" className="text-primary" />
                              </div>
                            </Col>
                            <Col>
                              <div className="d-flex align-items-center lh-1-25">Payment Proof</div>
                              <Button variant="link" onClick={() => downloadImage()} className="btn btn-link p-0 sh-3">
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
            <Tabbed orderDetailData={orderDetailData} />

            {/* Cart Start */}
            <h2 className="small-title bg-primary p-2 text-white rounded-top fw-bold">Cart</h2>
            <Card className="mb-2">
              <div className="p-2">
                <div className="mb-2">
                  {orderDetailData.getOrder.orderProducts.length > 0 &&
                    orderDetailData.getOrder.orderProducts.map((cart, index) => (
                      <Row key={index} className="g-0 mb-3 pb-2 border-bottom">
                        <Col xs="auto">
                          <img
                            src={cart.productId.thumbnail || (cart.productId.images.length > 0 && cart.productId.images[0])}
                            className="border p-1 rounded-md sw-10"
                            alt="thumb"
                          />
                        </Col>
                        <Col>
                          <div className="ps-4 pt-0 pb-0 pe-0 h-100">
                            <Row className="g-0 h-100 align-items-start align-content-center">
                              <Col xs="12" className="d-flex flex-column">
                                <div>
                                  {cart.productId.brand_name} : {cart.productId.fullName} {cart.variantId.variantName}
                                </div>
                              </Col>
                              <Col xs="12" className="d-flex flex-column mb-md-0">
                                <Row className="g-0">
                                  <Col xs="9" className="d-flex flex-row pe-2 align-items-end">
                                    <div className="text-dark">
                                      Price : ₹ {((cart.iprice + cart.iextraCharge) * (1 - cart.idiscount / 100)).toFixed(2)}
                                      <br />
                                      {cart.itransportChargeType} : {cart.itransportCharge}
                                      <br />
                                      Qty : {cart.quantity}
                                    </div>
                                  </Col>
                                  <Col xs="3" className="d-flex flex-row align-items-end justify-content-end text-alternate">
                                    <span className="text-dark">₹ {cart.price.toFixed(2)}</span>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </div>
                        </Col>
                      </Row>
                    ))}
                </div>
              </div>
            </Card>
            {/* Cart End */}
            <Card className=" mt-2">
              <div>
                <div>
                  <h2 className="small-title bg-primary rounded-top text-white fw-bold p-2">Cart Total</h2>
                  {/* <hr /> */}
                  <Row className="g-0 p-2 mb-2 mt-2">
                    <Row className="g-0 mb-2">
                      <Col xs="auto" className="ms-auto ps-3">
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
                          <Col xs="auto" className="ms-auto ps-3">
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
                        <Col xs="auto" className="ms-auto ps-3">
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
                    {orderDetailData.getOrder.paymentMethod === 'DMT' ? (
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
                    ) : null}
                    {orderDetailData.getOrder.paymentMethod === 'ONLINE' ? (
                      <Row className="g-0 mb-2">
                        <Col xs="auto" className="ms-auto ps-3">
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
                      <Col xs="auto" className="ms-auto ps-3">
                        Total Amount Paid
                      </Col>
                      <Col xs="auto" className="sw-13 text-end">
                        <span className="fw-bold">
                          <span className="text-dark">₹ </span>
                          {orderDetailData.getOrder.totalAmount}
                        </span>
                      </Col>
                    </Row>
                  </Row>
                </div>
              </div>
            </Card>
            <Col xs="auto" className="d-flex align-items-center justify-content-start mb-2 mb-sm-0">
              <Button variant="outline-danger" className="fw-bold px-4 py-2 rounded-pill shadow-sm border-2" onClick={() => setOrderCancelModal(true)}>
                Cancel Order
              </Button>
            </Col>
            {/* )} */}
          </Col>

          <Col xl="4" xxl="3">
            {/* Address Start */}
            {/* <h2 className="small-title">Address</h2> */}
            <Card className="mb-2">
              <Card.Body className="p-3">
                <div className="mb-2">
                  <p className="text-normal fw-bold text-dark mb-2">CUSTOMER</p>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="user" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-dark">
                      {orderDetailData.getOrder?.user?.firstName && orderDetailData.getOrder.user.firstName}{' '}
                      {orderDetailData.getOrder?.user?.lastName && orderDetailData.getOrder.user.lastName}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="email" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-dark">{orderDetailData.getOrder?.user?.email}</Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
            <Card className="mb-2">
              <Card.Body className="p-3">
                {orderDetailData.getOrder?.shippingAddress && (
                  <div className="mb-2">
                    <p className="text-normal fw-bold text-dark mb-2">SHIPPING ADDRESS</p>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="user" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getOrder.shippingAddress.firstName} {orderDetailData.getOrder.shippingAddress.lastName}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="pin" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getOrder.shippingAddress.addressLine1}, {orderDetailData.getOrder.shippingAddress.addressLine2},{' '}
                        {orderDetailData.getOrder.shippingAddress.city}, {orderDetailData.getOrder.shippingAddress.state},{' '}
                        {orderDetailData.getOrder.shippingAddress.postalCode} {orderDetailData.getOrder.shippingAddress.country}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="phone" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getOrder.shippingAddress.mobileNo}
                        {orderDetailData.getOrder.shippingAddress.altrMobileNo && <span>, {orderDetailData.getOrder.shippingAddress.altrMobileNo}</span>}
                      </Col>
                    </Row>
                    {orderDetailData.getOrder.shippingAddress.businessName && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="shop" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getOrder.shippingAddress.businessName}</Col>
                      </Row>
                    )}
                    {orderDetailData.getOrder.shippingAddress.gstin && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getOrder.shippingAddress.gstin}</Col>
                      </Row>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
            <Card className="mb-2">
              <Card.Body className="p-3">
                {orderDetailData.getOrder.billingAddress && (
                  <div className="mb-2">
                    <p className="text-normal fw-bold text-dark mb-2">BILLING ADDRESS</p>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="user" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getOrder.billingAddress.firstName} {orderDetailData.getOrder.billingAddress.lastName}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="pin" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getOrder.billingAddress.addressLine1}, {orderDetailData.getOrder.billingAddress.addressLine2},{' '}
                        {orderDetailData.getOrder.billingAddress.city}, {orderDetailData.getOrder.billingAddress.state},{' '}
                        {orderDetailData.getOrder.billingAddress.postalCode} {orderDetailData.getOrder.billingAddress.country}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="phone" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getOrder.billingAddress.mobileNo}
                        {orderDetailData.getOrder.billingAddress.altrMobileNo && <span>, {orderDetailData.getOrder.billingAddress.altrMobileNo}</span>}
                      </Col>
                    </Row>
                    {orderDetailData.getOrder.billingAddress.businessName && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="shop" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getOrder.billingAddress.businessName}</Col>
                      </Row>
                    )}
                    {orderDetailData.getOrder.billingAddress.gstin && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getOrder.billingAddress.gstin}</Col>
                      </Row>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      <Modal show={modalshow} onHide={() => setmodalshow(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title>Payment Proof</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <div className="row">
            <div className="fs-6 text-dark">Once the payment is received, kindly proceed with the approval</div>
            <div className="d-flex justify-content-around mt-4">
              {loading ? (
                <Button>Loading</Button>
              ) : (
                <Button type="submit" onClick={() => submitproof('complete')}>
                  Approve
                </Button>
              )}
            </div>
            <div className="mb-2 mt-4">
              <Form.Group controlId="disapproval">
                <div className="fs-6 mt-4 mb-4">Select Reason for disapproval</div>
                <Form.Select name="disapproval" onChange={(e) => setCancelReason(e.target.value)}>
                  <option hidden>Reason for disapproval</option>
                  <option>Payment proof not submitted.</option>
                  <option>
                    We have not received the payment of your Buy-Request as per payment mode mentioned by you and thus we have cancelled the same.
                  </option>
                  <option>
                    We have not received the payment of your Buy-Request as per payment proof submitted by you and thus we have cancelled the same.
                  </option>
                </Form.Select>
              </Form.Group>
            </div>
            {error && <div className="text-danger">{error}</div>}
          </div>
          <div className="d-flex justify-content-around mt-4">
            {loading ? (
              <Button>Loading</Button>
            ) : (
              <Button type="submit" variant="danger" onClick={() => submitproof('failed')}>
                Disapprove
              </Button>
            )}
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={submitproofmodal} onHide={() => setsubmitproofmodal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title>Submit Payment Proof</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2">
          <Form onSubmit={submit}>
            <div className="row">
              <div className="col-md-6">
                <Form.Label>Payment Mode *</Form.Label>
              </div>
              <div className="col-md-6">
                <Form.Select name="paymentmode" value={formData.paymentmode} onChange={handleChange}>
                  <option hidden>Select Payment Mode</option>
                  <option value="GPay">GPay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Paytm">Paytm</option>
                  <option value="RTGS/IMPS/NEFT">RTGS/IMPS/NEFT</option>
                  <option value="Cash Deposit">Cash Deposit</option>
                  <option value="Cheque">Cheque</option>
                </Form.Select>
                {formErrors.paymentmode && <div className="mt-1 text-danger">{formErrors.paymentmode}</div>}
              </div>
            </div>
            <div className="row my-3">
              <div className=" col-md-6">
                <Form.Label>Payment Transaction Id *</Form.Label>
              </div>
              <div className=" col-md-6">
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
              <div className=" col-md-6">
                <Form.Label>Upload Payment Proof *</Form.Label>
              </div>
              <div className=" col-md-6">
                <Form.Control type="file" accept="image/*" name="file" onChange={handleChange} />
                {formErrors.file && <div className="mt-1 text-danger">{formErrors.file}</div>}
              </div>
            </div>
            <div className="row justify-content-end my-3">
              <div className="col-md-6">{loading ? <Button>Loading</Button> : <Button type="submit">Submit</Button>}</div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      {imagepath && (
        <Modal show={imagemodal} onHide={() => setImagemodal(false)}>
          <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
            <Modal.Title>Payment Proof</Modal.Title>
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
          <Modal.Title className="fw-bold text-dark">Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body className="m-2 p-2">
          <Form onSubmit={cancelTheOrder}>
            <div className="row">
              <div className="col-md-12">
                <Form.Control
                  value={orderCancelledReason}
                  onChange={(e) => setOrdercancelReason(e.target.value)}
                  placeholder="Please submit your reason for cancelling the order"
                  as="textarea"
                  type="text"
                  style={{ fontSize: 14 }}
                  name="orderCancelledReason"
                />
                {ordercancelerror && <div className="mt-1 text-danger">{ordercancelerror}</div>}
              </div>
            </div>
            <div className="row my-3">
              <div className="col-md-12 text-end">{cancelOrderLoading ? <Button>Loading</Button> : <Button type="submit">Submit</Button>}</div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OrdersDetail;
