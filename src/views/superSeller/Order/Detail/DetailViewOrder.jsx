import React, { useEffect, useState } from 'react';
import { useParams, NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Button, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import moment from 'moment';
import { toast } from 'react-toastify';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import Tabbed from './component/Tabbed';

const ORDER_DETAIL = gql`
  query GetSingleOrderforSuperSeller($getSingleOrderforSuperSellerId: ID) {
    getSingleOrderforSuperSeller(id: $getSingleOrderforSuperSellerId) {
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
          identifier
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
          sellerarray {
            status
            pincode
            sellerId {
              id
              companyName
            }
          }
        }
        sellerId {
          id
          companyName
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
const UPDATE_PAYMENT_PROOF = gql`
  mutation UpdatePaymentProofStatus($updatePaymentProofStatusId: ID!, $paymentStatus: String!, $paymentfailedReason: String) {
    updatePaymentProofStatus(id: $updatePaymentProofStatusId, paymentStatus: $paymentStatus, paymentfailedReason: $paymentfailedReason) {
      id
    }
  }
`;
const UPDATE_SELLER_ID = gql`
  mutation UpdateSellerId($updateSellerIdId: ID!, $sellerId: ID!) {
    updateSellerId(id: $updateSellerIdId, sellerId: $sellerId) {
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
      getSingleOrderforSuperSellerId: id,
    },
    onCompleted: () => {
      if (orderDetailData?.getSingleOrderforSuperSeller?.paymentGatewayResponse) {
        const paymentGatewayResponse1 = JSON.parse(orderDetailData.getSingleOrderforSuperSeller.paymentGatewayResponse);
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
  const [totalCartValue, setTotalCartValue] = useState(0);
  useEffect(() => {
    if (orderDetailData && orderDetailData.getSingleOrderforSuperSeller) {
      const { orderProducts } = orderDetailData.getSingleOrderforSuperSeller;
      const calculatedTotalCartValue = orderProducts.reduce((total, product) => total + product.price, 0);
      setTotalCartValue(calculatedTotalCartValue);
    }
  }, [orderDetailData]);
  const [imagemodal, setImagemodal] = useState(false);
  const [imagepath, setImagepath] = useState('');
  function downloadImage() {
    setImagemodal(true);
    setImagepath(orderDetailData.getSingleOrderforSuperSeller.paymentProof);
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
  const [orderCancelModal, setOrderCancelModal] = useState(false);
  const [orderCancelledReason, setOrdercancelReason] = useState('');
  const [ordercancelerror, setOrdercancelerror] = useState('');
  const history = useHistory();
  const goBack = () => {
    history.goBack();
  };
  const order = orderDetailData?.getSingleOrderforSuperSeller?.orderProducts[0];
  let orderStatus = '⏳ Pending';
  if (order?.pending) {
    orderStatus = '✅ Success';
    if (order?.packed) {
      orderStatus = '📦 Packed';
      if (order?.shipped) {
        orderStatus = '🚚 Shipped';
        if (order?.delivered) {
          orderStatus = '🎉 Delivered';
        }
      }
    }
  }
  const orderId = orderDetailData?.getSingleOrderforSuperSeller?.id;
  const currentSellerId = orderDetailData?.getSingleOrderforSuperSeller?.orderProducts[0]?.sellerId?.id || '';
  const [selectedSellerId, setSelectedSellerId] = useState(currentSellerId);
  const [updateSellerId, { loading }] = useMutation(UPDATE_SELLER_ID, {
    onCompleted: () => alert('Dealer updated successfully!'),
    onError: (err) => alert(`Error: ${err.message}`),
  });
  const handleSubmit = () => {
    if (selectedSellerId) {
      updateSellerId({ variables: { updateSellerIdId: orderId, sellerId: selectedSellerId } });
    } else {
      alert('Please select a dealer.');
    }
  };
  const orderData = orderDetailData?.getSingleOrderforSuperSeller;
  const sellers = orderData?.orderProducts?.[0]?.locationId?.sellerarray || [];
  const pincode = orderData?.shippingAddress?.postalCode;
  const matchedSellers = sellers.filter((seller) => (Array.isArray(seller.pincode) ? seller.pincode.includes(+pincode) : seller.pincode === pincode));

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
          </Row>
        </Row>
      </div>
      {orderDetailData && orderDetailData.getSingleOrderforSuperSeller && (
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
                        <div className="text-dark">{orderDetailData.getSingleOrderforSuperSeller.id}</div>
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
                        <div className="text-dark">{moment(parseInt(orderDetailData.getSingleOrderforSuperSeller?.createdAt, 10)).format('LL')}</div>
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
                        {orderDetailData.getSingleOrderforSuperSeller.paymentMethod === 'ONLINE' ? (
                          paymentGatewayResponse && orderDetailData.getSingleOrderforSuperSeller.onlinepaymentStatus === 'success' ? (
                            <div className="text-dark">{`${orderDetailData.getSingleOrderforSuperSeller.paymentMethod}/ ${
                              paymentGatewayResponse?.transaction_details[id]?.mode
                            }/ ${paymentGatewayResponse?.transaction_details[id]?.status.toUpperCase()}`}</div>
                          ) : (
                            <div className="text-dark">{`${
                              orderDetailData.getSingleOrderforSuperSeller.paymentMethod
                            }/ ${paymentGatewayResponse?.transaction_details[id]?.status.toUpperCase()}`}</div>
                          )
                        ) : (
                          <div className="text-dark">
                            {orderDetailData.getSingleOrderforSuperSeller.paymentMethod}
                            {orderDetailData.getSingleOrderforSuperSeller.paymentStatus === 'pending' && ' / Payment Proof Not Submitted'}
                            {orderDetailData.getSingleOrderforSuperSeller.paymentStatus === 'failed' && (
                              <span>
                                {' '}
                                / Payment Failed: <span className="small">({orderDetailData.getSingleOrderforSuperSeller.paymentfailedReason})</span>
                              </span>
                            )}
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              {orderDetailData?.getSingleOrderforSuperSeller?.status === 'cancelled' && orderDetailData?.getSingleOrderforSuperSeller?.orderCancelledReason && (
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
                          <div>
                            <div className="small">
                              <span className="text-danger"> Date:</span>{' '}
                              {moment(parseInt(orderDetailData.getSingleOrderforSuperSeller.orderCancelledDate, 10)).format('ll')}
                            </div>
                          </div>
                          <div>
                            <div className="small">
                              ( <span className="text-danger"> Reason:</span> {orderDetailData.getSingleOrderforSuperSeller.orderCancelledReason} )
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              )}

              {orderDetailData?.getSingleOrderforSuperSeller?.paymentMethod === 'DMT' && (
                <>
                  {orderDetailData.getSingleOrderforSuperSeller.paymentmode && (
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
                                {`${orderDetailData.getSingleOrderforSuperSeller.paymentmode} ${
                                  orderDetailData.getSingleOrderforSuperSeller.paymentStatus === 'Payment Proof Submited'
                                    ? ' / Payment Verification Pending'
                                    : ''
                                }`}
                                {orderDetailData.getSingleOrderforSuperSeller.paymentStatus === 'failed' ? (
                                  <>
                                    <span> / Payment Verification Failed </span>
                                    <div className="small">
                                      {' '}
                                      ( <span className="text-danger"> Reason:</span> {orderDetailData.getSingleOrderforSuperSeller.paymentfailedReason} )
                                    </div>
                                  </>
                                ) : (
                                  ''
                                )}
                                {orderDetailData.getSingleOrderforSuperSeller.paymentStatus === 'complete' ? '/ Payment Success' : ''}
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  )}

                  {orderDetailData.getSingleOrderforSuperSeller.paymentProof && (
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
            <Tabbed orderDetailData={orderDetailData} />
            <div className="d-flex justify-content-between align-items-center bg-primary p-2 text-white rounded-top fw-bold">
              <div className="d-flex align-items-center">
                <span className="me-2">Dealer: {orderDetailData.getSingleOrderforSuperSeller.orderProducts[0].sellerId.companyName}</span>
              </div>
              <span>Order Status: {orderStatus}</span>
            </div>
            <Card className="mb-2">
              <div className="p-2">
                <div className="mb-2">
                  {orderDetailData.getSingleOrderforSuperSeller.orderProducts.length > 0 &&
                    orderDetailData.getSingleOrderforSuperSeller.orderProducts.map((cart, index) => (
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
                                    <div className="small text-dark">
                                      {' '}
                                      Price : ₹ {parseFloat(cart.iprice).toFixed(2)}
                                      {cart.iextraChargeType === '0' ? (
                                        <span>
                                          {' '}
                                          {' | '} {cart.iextraChargeType} : {cart.iextraCharge}
                                        </span>
                                      ) : null}
                                      <br />
                                      {cart.itransportChargeType} : {cart.itransportCharge} <br />
                                      Qty : {cart.quantity}
                                    </div>
                                  </Col>
                                  <Col xs="3" className="d-flex flex-row align-items-end justify-content-end text-alternate">
                                    <span className="text-dark">
                                      <span className="text-small">₹ </span>
                                      {cart.price}
                                    </span>
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
            <Card className=" mt-2">
              <div>
                <div>
                  <h2 className="small-title bg-primary rounded-top text-white fw-bold p-2">Cart Total</h2>
                  <Row className="g-0 p-2 mb-2 mt-2">
                    <Row className="g-0 mb-2">
                      <Col xs="auto" className="ms-auto ps-3">
                        Total Amount Paid
                      </Col>
                      <Col xs="auto" className="sw-13 text-end">
                        <span className="fw-bold">
                          <span className="text-dark">₹ </span>
                          {orderDetailData.getSingleOrderforSuperSeller.orderProducts.length > 0 && (
                            <>{orderDetailData.getSingleOrderforSuperSeller.orderProducts.reduce((sum, cart) => sum + (cart.price || 0), 0)}</>
                          )}
                        </span>
                      </Col>
                    </Row>
                  </Row>
                </div>
              </div>
            </Card>
            <div>
              <select className="form-select form-select-sm mb-2" value={selectedSellerId} onChange={(e) => setSelectedSellerId(e.target.value)}>
                <option value="">Order transfer to another dealer</option>
                {matchedSellers.map((seller) => (
                  <option key={seller.id} value={seller.sellerId.id} className="text-dark">
                    {seller.sellerId.companyName}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary btn-sm" type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Updating...' : 'Submit'}
              </button>
            </div>
          </Col>

          <Col xl="4" xxl="3">
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
                      {orderDetailData.getSingleOrderforSuperSeller?.user?.firstName && orderDetailData.getSingleOrderforSuperSeller.user.firstName}{' '}
                      {orderDetailData.getSingleOrderforSuperSeller?.user?.lastName && orderDetailData.getSingleOrderforSuperSeller.user.lastName}
                    </Col>
                  </Row>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="email" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-dark">{orderDetailData.getSingleOrderforSuperSeller?.user?.email}</Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
            <Card className="mb-2">
              <Card.Body className="p-3">
                {orderDetailData.getSingleOrderforSuperSeller?.shippingAddress && (
                  <div className="mb-2">
                    <p className="text-normal fw-bold text-dark mb-2">SHIPPING ADDRESS</p>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="user" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.firstName}{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.lastName}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="pin" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.addressLine1},{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.addressLine2},{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.city},{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.state},{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.postalCode}{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.country}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="phone" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.mobileNo}
                        {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.altrMobileNo && (
                          <span>, {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.altrMobileNo}</span>
                        )}
                      </Col>
                    </Row>
                    {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.businessName && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="shop" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getSingleOrderforSuperSeller.shippingAddress.businessName}</Col>
                      </Row>
                    )}
                    {orderDetailData.getSingleOrderforSuperSeller.shippingAddress.gstin && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getSingleOrderforSuperSeller.shippingAddress.gstin}</Col>
                      </Row>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
            <Card className="mb-2">
              <Card.Body className="p-3">
                {orderDetailData.getSingleOrderforSuperSeller.billingAddress && (
                  <div className="mb-2">
                    <p className="text-normal fw-bold text-dark mb-2">BILLING ADDRESS</p>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="user" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderforSuperSeller.billingAddress.firstName}{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.billingAddress.lastName}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="pin" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderforSuperSeller.billingAddress.addressLine1},{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.billingAddress.addressLine2},{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.billingAddress.city}, {orderDetailData.getSingleOrderforSuperSeller.billingAddress.state},{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.billingAddress.postalCode}{' '}
                        {orderDetailData.getSingleOrderforSuperSeller.billingAddress.country}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="phone" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderforSuperSeller.billingAddress.mobileNo}
                        {orderDetailData.getSingleOrderforSuperSeller.billingAddress.altrMobileNo && (
                          <span>, {orderDetailData.getSingleOrderforSuperSeller.billingAddress.altrMobileNo}</span>
                        )}
                      </Col>
                    </Row>
                    {orderDetailData.getSingleOrderforSuperSeller.billingAddress.businessName && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="shop" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getSingleOrderforSuperSeller.billingAddress.businessName}</Col>
                      </Row>
                    )}
                    {orderDetailData.getSingleOrderforSuperSeller.billingAddress.gstin && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getSingleOrderforSuperSeller.billingAddress.gstin}</Col>
                      </Row>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default OrdersDetail;
