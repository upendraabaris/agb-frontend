/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect } from 'react';
import { withRouter, NavLink, useLocation } from 'react-router-dom';
import { Card, Button, Collapse, Col, Form, Row, Spinner, Modal } from 'react-bootstrap';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch, useSelector } from 'react-redux';
import Cartitems from 'globalValue/CartItems/Cartitems';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import { toast } from 'react-toastify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CheckoutSumary from './components/CheckoutSumary';
import AddressForm from './AddressForm';

const MINIMUM_ORDER = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      key
      content
    }
  }
`;
const MAKE_PAYMENT = gql`
  mutation MakePayment($amount: String, $firstname: String, $email: String, $phone: String, $orderId: String) {
    makePayment(amount: $amount, firstname: $firstname, email: $email, phone: $phone, orderId: $orderId) {
      success
      redirectUrl
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
const GET_ACCOUNT_DETAIL = gql`
  query GetAllAccountdetails {
    getAllAccountdetails {
      notedmtstates
    }
  }
`;
const GET_ADDRESS_DETAILS = gql`
  query GetAllAddressesByUser {
    getAllAddressesByUser {
      id
      addressLine1
      addressLine2
      postalCode
      city
      state
      country
      firstName
      lastName
      mobileNo
      altrMobileNo
      businessName
      gstin
    }
  }
`;
const CREATE_ORDER = gql`
  mutation CreateOrder(
    $paymentMethod: String
    $totalAmount: Float
    $acutalTotalAmount: Float
    $shippingAmount: Float
    $orderProducts: [OrderProducts]
    $shippingAddress: ID
    $billingAddress: ID
    $status: String
    $freeDelivery: Boolean
    $couponName: String
    $couponDiscount: Float
    $onlinePaymentCharge: Float
    $dmtPaymentDiscount: Float
    $couponDiscountPercentage: Float
    $onlinePaymentChargePercentage: Float
    $dmtPaymentDiscountPercentage: Float
  ) {
    createOrder(
      paymentMethod: $paymentMethod
      totalAmount: $totalAmount
      acutalTotalAmount: $acutalTotalAmount
      shippingAmount: $shippingAmount
      orderProducts: $orderProducts
      shippingAddress: $shippingAddress
      billingAddress: $billingAddress
      status: $status
      freeDelivery: $freeDelivery
      couponName: $couponName
      couponDiscount: $couponDiscount
      onlinePaymentCharge: $onlinePaymentCharge
      dmtPaymentDiscount: $dmtPaymentDiscount
      couponDiscountPercentage: $couponDiscountPercentage
      onlinePaymentChargePercentage: $onlinePaymentChargePercentage
      dmtPaymentDiscountPercentage: $dmtPaymentDiscountPercentage
    ) {
      id
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

const Checkout = ({ history }) => {
  const title = 'Check Out';
  const description = 'Ecommerce Check Out Page';
  const dispatch = useDispatch();
  let freeDeliveryValue = 0;
  let minCartValue = 0;
  const storeFeaturess = StoreFeatures();
  const location = useLocation();
  const couponDiscount = location?.state?.state;
  const couponCode = location?.state?.couponCode;
  const couponDiscountAmount = location?.state?.couponDiscountAmount;
  const { dataStoreFeatures1 } = useGlobleContext();
  const { cartData, error, refetch } = Cartitems();

  const [open, setOpen] = useState(false);
  const [openOnline, setOpenOnline] = useState(false);
  const [openCheck, setOpenCheck] = useState(false);
  const [openOnlineCheck, setOpenOnlineCheck] = useState(false);
  const [showOnline, setShowOnline] = useState(true);
  const [showDMT, setShowDMT] = useState(false);
  const [showCOD, setShowCOD] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalShipping, setShowModalShipping] = useState(false);
  const [showModalDMT, setShowModalDMT] = useState(false);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    refetch();
  }, [refetch]);
  useEffect(() => {
    if (cartData) {
      if (!cartData.cartProducts?.length) {
        toast.error('Empty Cart!');
        history.push('/');
      }
    }
    if (error?.message === 'Authorization header is missing' || error?.message === 'jwt expired') {
      setTimeout(() => {
        history.push('/login');
      }, 2000);
    }
  }, [cartData, error, history]);
  const [getMinimum, { data: DataMinimum }] = useLazyQuery(MINIMUM_ORDER);
  const [getFreeDelivery, { data: DataFreeDelivery }] = useLazyQuery(MINIMUM_ORDER);
  useEffect(() => {
    getMinimum({
      variables: {
        key: 'minimumOrder',
      },
    });
    getFreeDelivery({
      variables: {
        key: 'freeDelivery',
      },
    });
  }, [DataMinimum, getMinimum, DataFreeDelivery, getFreeDelivery]);
  if (DataMinimum) {
    minCartValue = parseInt(DataMinimum.getSiteContent.content, 10);
  }
  if (DataFreeDelivery) {
    freeDeliveryValue = parseInt(DataFreeDelivery.getSiteContent.content, 10);
  }
  const { currentUser } = useSelector((state) => state.auth);
  const [b2b, setB2B] = useState(false);
  useEffect(() => {
    const role = currentUser?.role?.some((role1) => role1 === 'b2b');
    setB2B(role);
  }, [currentUser]);
  const [message, setMessage] = useState('');
  const [addressDetail, setAddressDetail] = useState([]);
  const [addNewBillingAddress, setAddNewBillingAddress] = useState(false);
  const [billingAddress, setBillingAddress] = useState(null);
  const [addNewShippingAddress, setAddNewShippingAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [sameAddress, setSameAddress] = useState(true);
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const handleShowShipping = () => setShowModalShipping(true);
  const handleCloseShipping = () => setShowModalShipping(false);
  const handleShowDMT = () => setShowModalDMT(true);
  const handleCloseDMT = () => setShowModalDMT(false);

  const [GetStoreFeature, { data: dataStoreFeatures }] = useLazyQuery(GET_STORE_FEATURES);
  const videoUrl = dataStoreFeatures?.getStoreFeature?.dtmHelpVideo;
  useEffect(() => {
    GetStoreFeature();
  }, []);

  const [GetAllAddressesByUser, { refetch: refetchAddress }] = useLazyQuery(GET_ADDRESS_DETAILS, {
    onCompleted(res) {
      setAddressDetail(res.getAllAddressesByUser);
    },
    onError(err) {
      console.error('GET_ADDRESS_DETAILS', err);
    },
  });
  useEffect(() => {
    if (addressDetail.length === 0) {
      setMessage('Billing address not available!');
    } else {
      setMessage('');
    }
  }, [addressDetail]);
  const fetchAddresses = () => {
    GetAllAddressesByUser();
  };
  useEffect(() => {
    GetAllAddressesByUser();
    if (sameAddress) {
      setShippingAddress({ ...billingAddress });
    }
  }, [GetAllAddressesByUser, billingAddress, sameAddress]);
  const handleBillingaddressChange = (addressId) => {
    const address1 = addressDetail?.find((address) => address.id === addressId);
    setBillingAddress(address1);
  };
  const handleShippingaddressChange = (addressId) => {
    const address1 = addressDetail?.find((address) => address.id === addressId);
    setShippingAddress(address1);
  };
  const [paymentCharge, setPaymentCharge] = useState(0);
  const [dmtCommission, setdmtCommission] = useState(0);
  const [getContent, { refetch: refetchOnlineCommission }] = useLazyQuery(GET_SITE_CONTENT, {
    onCompleted: (res) => {
      if (res.getSiteContent.key === 'onlineCommission') {
        setPaymentCharge(res.getSiteContent.content);
      }
      if (res.getSiteContent.key === 'dmtCommission') {
        setdmtCommission(parseFloat(res.getSiteContent.content));
      }
    },
  });
  useEffect(() => {
    const getcommisssion = async () => {
      await getContent({
        variables: {
          key: 'onlineCommission',
        },
      });
      await getContent({
        variables: {
          key: 'dmtCommission',
        },
      });
    };
    getcommisssion();
  }, []);
  const [accountDetails, setAccountDetails] = useState(null);
  const [getAccountDetails, { data }] = useLazyQuery(GET_ACCOUNT_DETAIL, {
    onCompleted: (res) => {
      setAccountDetails(res.getAllAccountdetails);
    },
    onError: (err) => console.error('❌ GET_ACCOUNT_DETAIL Error:', err.message),
  });
  useEffect(() => {
    const fetchAccountDetails = async () => {
      await getAccountDetails();
    };
    fetchAccountDetails();
  }, []);
  useEffect(() => {
    if (data) console.log('🔄');
  }, [data]);
  useEffect(() => {
    if (error) console.error('⚠️ GraphQL Query Error:', error.message);
  }, [error]);

  const [orderProduct, setOrderProduct] = useState([]);
  const [cartValue, setCartValue] = useState(null);
  const [shippingValue, setshippingValue] = useState(null);
  const [cartValueWithoutShipping, setCartValueWithoutShipping] = useState(null);
  const [paymentGatwayCharge, setPaymentGatwayCharge] = useState(0);
  const [paymentAfterCharges, setPaymentAfterCharges] = useState(0);
  const [dmtCommissionCharge, setdmtCommissionCharge] = useState(0);
  const [paymentAfterdmtCommissionCharge, setpaymentAfterdmtCommissionCharge] = useState(0);
  const handlePaymentAfterCharges = (cartvalue1, orderedItems, amountWoShipping, shippingvalue) => {
    setOrderProduct(orderedItems);
    setCartValue(cartvalue1.toFixed(2));
    setshippingValue(shippingvalue.toFixed(2));
    setCartValueWithoutShipping(1 * amountWoShipping.toFixed(2));
    const onlineCharge = (cartvalue1 * paymentCharge) / 100;
    const dmtdeducationcharge = (cartvalue1 * dmtCommission) / 100;
    const paymentaftercharges = cartvalue1 + onlineCharge;
    const paymentafterdmtdeducation = cartvalue1 - dmtdeducationcharge;
    setPaymentGatwayCharge(onlineCharge.toFixed(2));
    setPaymentAfterCharges(paymentaftercharges.toFixed(2));
    setdmtCommissionCharge(dmtdeducationcharge);
    setpaymentAfterdmtCommissionCharge(paymentafterdmtdeducation);
  };
  const [checkoutError, setcheckoutError] = useState({});
  const [MakePayment, { loading: loadingmakePayment }] = useMutation(MAKE_PAYMENT, {
    onCompleted: (res) => {
      window.location.href = res.makePayment.redirectUrl;
    },
    onError: (err) => {
      toast.error(err.message || 'Payment Error!'); 
    },
  });
  const [CreateOrder, { loading }] = useMutation(CREATE_ORDER, {
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });
  const validateForm = () => {
    const errors = {};
    if (!billingAddress) {
      errors.billingAddressID = 'Billing Address is required!';
      toast.error('Billing Address is required!', {
        autoClose: 4000,
      });
    }
    if (!shippingAddress) {
      errors.shippingAddressID = 'Shipping Address is required!.';
    }
    if (cartValue <= minCartValue) {
      toast.error(`Minimum Cart Value must be ₹ ${minCartValue}`, {
        autoClose: 4000,
      });
      errors.minCartValueError = `Minimum Cart Value must be ₹ ${minCartValue}`;
    }
    return errors;
  };
  // CCavenue payment gateway ---- Start
  const handleSubmit = async (paymentType, finalPayment) => {
    let deliverFree = false;
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setcheckoutError(errors);
      setTimeout(() => {
        const el = document.querySelector('.error');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (cartValueWithoutShipping >= freeDeliveryValue) {
      deliverFree = true;
    }
    setcheckoutError({});
    const updatedOrderProducts = orderProduct.map((item) => ({
      ...item,
      price: deliverFree ? item.price : item.price + item.shipping,
      itransportCharge: deliverFree ? 0 : item.itransportCharge,
    }));
    const orderProductsWithoutShipping = updatedOrderProducts.map(({ shipping, ...rest }) => rest);
    const response = await CreateOrder({
      variables: {
        paymentMethod: paymentType,
        orderProducts: orderProductsWithoutShipping,
        totalAmount: parseFloat(finalPayment),
        acutalTotalAmount: parseFloat(cartValue),
        shippingAmount: parseFloat(shippingValue),
        shippingAddress: shippingAddress?.id,
        billingAddress: billingAddress?.id,
        status: 'pending',
        freeDelivery: deliverFree,
        couponName: couponCode,
        couponDiscount: 1 * couponDiscountAmount.toFixed(2),
        onlinePaymentCharge: paymentType === 'ONLINE' ? parseFloat(paymentGatwayCharge) : 0,
        dmtPaymentDiscount: paymentType === 'DMT' ? parseFloat(dmtCommissionCharge.toFixed(2)) : 0,
        couponDiscountPercentage: 1 * couponDiscount.toFixed(2),
        onlinePaymentChargePercentage: paymentType === 'ONLINE' ? parseFloat(paymentCharge) : 0,
        dmtPaymentDiscountPercentage: paymentType === 'DMT' ? parseFloat(dmtCommission.toFixed(2)) : 0,
      },
    });
    // sessionStorage.setItem('orderID', response?.data?.createOrder?.id);
    // localStorage.setItem('orderID', response?.data?.createOrder?.id);
    if (response?.data && paymentType === 'ONLINE') {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = process.env.REACT_APP_PAYMENT_GATWAY_URL;
      const paymentGatwayFormData = {
        merchant_id: process.env.REACT_APP_PAYMENT_MERCHANT_ID,
        order_id: response?.data?.createOrder?.id,
        currency: 'INR',
        amount: finalPayment,
        redirect_url: process.env.REACT_APP_PAYMENT_RESPONSE_URL,
        cancel_url: process.env.REACT_APP_PAYMENT_RESPONSE_URL,
        language: 'EN',
        billing_name: billingAddress?.firstName,
        billing_address: billingAddress?.addressLine1,
        billing_city: billingAddress?.city,
        billing_state: billingAddress?.state,
        billing_zip: billingAddress?.postalCode,
        billing_country: 'India',
        billing_tel: currentUser.mobileNo,
        billing_email: currentUser.email,
        delivery_name: shippingAddress?.customerName,
        delivery_address: shippingAddress?.addressLine1,
        delivery_city: shippingAddress?.city,
        delivery_state: shippingAddress?.state,
        delivery_zip: shippingAddress?.postalCode,
        delivery_country: 'India',
        delivery_tel: currentUser.mobileNo,
      };
      for (const key in paymentGatwayFormData) {
        // eslint-disable-next-line no-prototype-builtins
        if (paymentGatwayFormData.hasOwnProperty(key)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = paymentGatwayFormData[key];
          form.appendChild(input);
        }
      }
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    }
  };
  // CCavenue payment gateway ---- End
  const handleCheckout = async (paymentType, finalPayment) => {
    let deliverFree = false;
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setcheckoutError(errors);
      setTimeout(() => {
        const el = document.querySelector('.error');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (cartValueWithoutShipping >= freeDeliveryValue) {
      deliverFree = true;
    }
    setcheckoutError({});
    const updatedOrderProducts = orderProduct.map((item) => ({
      ...item,
      price: deliverFree ? item.price : item.price + item.shipping,
      itransportCharge: deliverFree ? 0 : item.itransportCharge,
    }));
    const orderProductsWithoutShipping = updatedOrderProducts.map(({ shipping, ...rest }) => rest);
    const response = await CreateOrder({
      variables: {
        paymentMethod: paymentType,
        orderProducts: orderProductsWithoutShipping,
        totalAmount: parseFloat(finalPayment),
        acutalTotalAmount: parseFloat(cartValue),
        shippingAmount: parseFloat(shippingValue),
        shippingAddress: shippingAddress?.id,
        billingAddress: billingAddress?.id,
        status: 'pending',
        freeDelivery: deliverFree,
        couponName: couponCode,
        couponDiscount: 1 * couponDiscountAmount.toFixed(2),
        onlinePaymentCharge: paymentType === 'ONLINE' ? parseFloat(paymentGatwayCharge) : 0,
        dmtPaymentDiscount: paymentType === 'DMT' ? parseFloat(dmtCommissionCharge.toFixed(2)) : 0,
        couponDiscountPercentage: 1 * couponDiscount.toFixed(2),
        onlinePaymentChargePercentage: paymentType === 'ONLINE' ? parseFloat(paymentCharge) : 0,
        dmtPaymentDiscountPercentage: paymentType === 'DMT' ? parseFloat(dmtCommission.toFixed(2)) : 0,
      },
    });
    if (response?.data && paymentType === 'DMT') {
      history.push(`/checkout/directpayment/${response?.data?.createOrder.id}`, { totalAmount: parseFloat(finalPayment) });
    }
    if (response?.data && paymentType === 'COD') {
      history.push('/user/orders', { tabvalue: 'cod' });
    }
    if (response?.data && paymentType === 'ONLINE') {
      // sessionStorage.setItem('orderID', response?.data?.createOrder?.id);
      // localStorage.setItem('orderID', response?.data?.createOrder?.id);
      await MakePayment({
        variables: {
          orderId: response?.data.createOrder.id,
          amount: finalPayment,
          firstname: currentUser.firstName,
          email: currentUser.email,
          phone: currentUser.mobileNo,
        },
      });
    }
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
        {`
            @keyframes iconPulse {
            0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .icon-animate {
          animation: iconPulse 1s infinite ease-in-out;
        }
        `}
      </style>
      <Row>
        <Col xs="12" className="col-lg order-1 order-lg-0">
          <div className="text-center fw-bold py-1 bg_color pt-2 pb-2  rounded">Select a Billing Address </div>
          <Card className="mb-2">
            <Card.Body>
              <div className="row">
                {message && (
                  <div>
                    <Button size="sm" className="bg-success p-0" onClick={handleShow}>
                      + Add a Billing Address
                    </Button>{' '}
                    <div className="text-danger pt-1">{message}</div>
                  </div>
                )}
                {addressDetail?.length > 0 && (
                  <div className="filled form-group col-10 px-0">
                    <div className="fw-bold">
                      Billing Address <span className="text-danger"> *</span>
                    </div>
                    <Form.Select name="address" value={billingAddress?.id || ''} onChange={(e) => handleBillingaddressChange(e.target.value)}>
                      <option>Select your billing address.</option>
                      {addressDetail.map((address, index) => (
                        <option key={index} value={address.id}>
                          {`${address.firstName ? `${address.firstName} ` : ''}${address.lastName ? `${address.lastName}, ` : ''}${
                            address.addressLine1 ? `${address.addressLine1}, ` : ''
                          }${address.addressLine2 ? `${address.addressLine2}, ` : ''}${address.city ? `${address.city}, ` : ''}${
                            address.state ? `${address.state}, ` : ''
                          }${address.postalCode ? `${address.postalCode}, ` : ''}${address.mobileNo ? `${address.mobileNo}, ` : ''}${
                            address.businessName ? `${address.businessName}, ` : ''
                          }${address.gstin ? address.gstin : ''}`}
                        </option>
                      ))}
                    </Form.Select>
                    {!billingAddress && checkoutError?.billingAddressID && <div className="mt-2 rounded error bg-danger">{checkoutError.billingAddressID}</div>}
                  </div>
                )}
                {addressDetail && !message && (
                  <div className="filled form-group col-2 mt-4 px-1">
                    <Button size="sm" className="bg-dark p-1" onClick={handleShow}>
                      <CsLineIcons icon="plus" className="w-70" />
                    </Button>
                  </div>
                )}
                {billingAddress && (
                  <div className="pt-2">
                    <div>
                      <strong>
                        {' '}
                        Billing to {billingAddress.firstName} {billingAddress.lastName}
                      </strong>
                    </div>
                    <div>
                      {billingAddress.addressLine1}, {billingAddress.addressLine2},{billingAddress.city},{billingAddress.state} -{billingAddress.postalCode}
                    </div>
                    <div>{billingAddress.mobileNo}</div>
                    {billingAddress.businessName && (
                      <div>
                        <strong>Business Name:</strong> {billingAddress.businessName}
                      </div>
                    )}
                    {billingAddress.gstin && (
                      <div>
                        <strong>GSTIN:</strong> {billingAddress.gstin}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                {!message && (
                  <Form.Group controlId="123" className="pt-3">
                    <Form.Label className="me-5 fw-bold text-dark">Same as shipping address</Form.Label>
                    <Form.Check
                      name="samebillandship"
                      type="checkbox"
                      checked={sameAddress}
                      inline
                      id="quantitySwitch1"
                      onChange={(e) => setSameAddress(e.target.checked)}
                    />
                  </Form.Group>
                )}
              </div>
              {!sameAddress && (
                <>
                  <div className="mt-2">
                    <>
                      <div className="row">
                        {addressDetail?.length > 0 && (
                          <div className="filled form-group col-9 px-0">
                            <div className="fw-bold">Shipping Address</div>
                            <Form.Select name="address" value={shippingAddress?.id || ''} onChange={(e) => handleShippingaddressChange(e.target.value)}>
                              <option>Select your shipping address.</option>
                              {addressDetail.map((address, index) => (
                                <option key={index} value={address.id}>
                                  {`${address.firstName ? `${address.firstName} ${address.lastName}, ` : ''}${address.addressLine1 || ''}${
                                    address.addressLine2 ? `, ${address.addressLine2}` : ''
                                  }${address.city ? `, ${address.city}` : ''}${address.state ? `, ${address.state}` : ''}${
                                    address.postalCode ? `, ${address.postalCode}` : ''
                                  }${address.mobileNo ? `, ${address.mobileNo}` : ''}${address.businessName ? `, ${address.businessName}` : ''}${
                                    address.gstin ? `, ${address.gstin}` : ''
                                  }`}
                                </option>
                              ))}
                            </Form.Select>
                            {checkoutError?.shippingAddressID && <p className="mt-2 text-danger error">{checkoutError.shippingAddressID}</p>}
                          </div>
                        )}
                        {addressDetail && (
                          <div className="filled form-group col-3 mt-4 px-1">
                            <Button size="sm" className="bg-dark p-1" onClick={handleShowShipping}>
                              <CsLineIcons icon="plus" className="w-70" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  </div>
                  <Modal show={showModalShipping} onHide={handleCloseShipping} centered>
                    <Modal.Header closeButton className="p-4">
                      <Modal.Title className="fw-bold">Shipping Address</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-1">
                      <AddressForm
                        setAddNewShippingAddress={setShowModalShipping}
                        refetchAddress={refetchAddress}
                        type="Shipping"
                        setShippingAddress={setShippingAddress}
                      />
                    </Modal.Body>
                  </Modal>
                </>
              )}
            </Card.Body>
          </Card>
          <>
            {billingAddress?.gstin && cartData?.cartProducts?.filter((item) => item.locationId?.sellerId?.gstin === '' && item.variantId).length > 0 && (
              <div className="alert alert-danger" role="alert">
                <strong>GST input will not be available for the following products:</strong>
                <ul className="mb-0 mt-2">
                  {cartData.cartProducts
                    .filter((item) => item.locationId?.sellerId?.gstin === '' && item.variantId)
                    .map((item, index) => (
                      <li key={index}>
                        {item.productId?.fullName || item.productId?.previewName} {item.variantId?.variantName && `- ${item.variantId.variantName}`}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </>

          <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header closeButton className="p-4">
              <Modal.Title className="fw-bold">Billing Address</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-1">
              <AddressForm setAddNewBillingAddress={setShowModal} refetchAddress={refetchAddress} type="Billing" setBillingAddress={setBillingAddress} />
            </Modal.Body>
          </Modal>
          <div className="text-center fw-bold py-1 mt-3 bg_color text-white pt-2 pb-2 rounded">Select a Payment Method </div>
          {loading || loadingmakePayment ? (
            <div className="position-fixed top-0 start-0 vw-100 vh-100 d-flex justify-content-center align-items-center bg-light opacity-75 pointer-events-none">
              <Spinner />
            </div>
          ) : (
            <>
              <Card className="mb-2">
                <Card.Body className="p-3">
                  <Row>
                    <div className="mb-3">
                      {storeFeaturess?.online && (
                        <div className="border rounded p-2 mb-1">
                          <input
                            type="radio"
                            id="online"
                            name="paymentMethod"
                            checked={showOnline}
                            onChange={() => {
                              setShowOnline(true);
                              setShowDMT(false);
                              setShowCOD(false);
                            }}
                          />
                          <label htmlFor="online" className="ms-2 fw-bold">
                            Online Payment: Rs. {paymentAfterCharges}
                          </label>
                          <Button variant="link" onClick={() => setOpenOnlineCheck(!openOnlineCheck)} className="p-0 align-items-center">
                            <CsLineIcons className="ps-2" icon="info-hexagon" />
                          </Button>
                          <Collapse in={openOnlineCheck}>
                            <div className="ms-0 mt-2 border-top pt-2">
                              {cartValue && paymentAfterCharges && (
                                <div className="ps-2">
                                  {paymentGatwayCharge === '0.00' ? (
                                    <div>
                                      You have to pay only : Rs. <span className="fw-bold">{paymentAfterCharges}</span>
                                    </div>
                                  ) : (
                                    <div>
                                      <div>
                                        You will have to pay <span> {paymentCharge}</span> % Payment Gateway Charge extra.
                                      </div>
                                      <div>Cart Total : Rs. {cartValue}</div>
                                      <div>{`Payment Gateway Charge : Rs. ${paymentGatwayCharge}`}</div>
                                      <div>
                                        Amount to be paid : Rs. {cartValue} + Rs. {paymentGatwayCharge} = Rs.{' '}
                                        <span className="fw-bold">{paymentAfterCharges}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </Collapse>
                        </div>
                      )}
                      {storeFeaturess?.dmt && (
                        <div className="border rounded p-2 mb-1">
                          <input
                            type="radio"
                            id="dmt"
                            name="paymentMethod"
                            checked={showDMT}
                            onChange={() => {
                              setShowOnline(false);
                              setShowDMT(true);
                              setShowCOD(false);
                            }}
                          />
                          <label htmlFor="dmt" className="ms-2 fw-bold">
                            DMT Payment: Rs.
                            {dmtCommissionCharge ? <>{paymentAfterdmtCommissionCharge.toFixed(2)}</> : <>{cartValue}</>}
                          </label>
                          <Button variant="link" onClick={() => setOpenCheck(!openCheck)} className="p-0 align-items-center">
                            <CsLineIcons className="ps-2" icon="info-hexagon" />
                          </Button>
                          {videoUrl && (
                            <Button size="sm" className="float-end bg-transparent pt-0 small" onClick={handleShowDMT}>
                              <CsLineIcons className="ps-2 text-danger icon-animate" icon="video" />
                            </Button>
                          )}
                          <div className="small text-dark mt-1">
                            <span className="fw-bold">Direct Money Transfer (DMT):</span> Pay amount directly to our bank account by QR / UPI / Net Banking etc.
                          </div>
                          <Collapse in={openCheck}>
                            <div className="ms-0 mt-2 border-top pt-2">
                              {dmtCommissionCharge ? (
                                <div className="ps-2">
                                  <div>
                                    Deposit the amount directly in our bank account / payment wallets / UPI and Get <span>{dmtCommission}</span>% extra
                                    discount.
                                  </div>
                                  <div>Cart Total : Rs. {cartValue}</div>
                                  <div>{`DMT Discount : Rs. ${dmtCommissionCharge.toFixed(2)}`}</div>
                                  <div>
                                    Amount to be paid : Rs. {cartValue} - Rs. {dmtCommissionCharge.toFixed(2)} = Rs.
                                    <span className="fw-bold">{paymentAfterdmtCommissionCharge.toFixed(2)}</span>
                                  </div>
                                  {accountDetails?.notedmtstates ? (
                                    <div className="mt-2 small">
                                      <span className="fw-bold text-dark">Note: </span>
                                      If you are using a credit card to make DMT payments then you would have to pay Rs. {(cartValue * 1.0236).toFixed(2)}
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="mb-3">
                                  <div>Deposit the amount directly in our bank account / payment wallets / UPI.</div>
                                  <div>
                                    You have to pay only : Rs. <span className="fw-bold">{cartValue}</span>
                                  </div>
                                  {accountDetails?.notedmtstates ? (
                                    <div className="mt-2 small">
                                      <span className="fw-bold text-dark">Note: </span>
                                      If you are using a credit card to make DMT payments, you would have to pay Rs. {(cartValue * 1.0236).toFixed(2)}
                                    </div>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </Collapse>
                        </div>
                      )}
                      {storeFeaturess?.cod && (
                        <div className="border rounded p-2 mb-1">
                          <input
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            checked={showCOD}
                            onChange={() => {
                              setShowOnline(false);
                              setShowDMT(false);
                              setShowCOD(true);
                            }}
                          />
                          <label htmlFor="cod" className="ms-2">
                            Cash On Delivery (COD)
                          </label>
                        </div>
                      )}
                    </div>
                    {showOnline && storeFeaturess?.online && (
                      <div className="col-md-4 col-6">
                        {/* PayuMoney Button Start */}
                        {storeFeaturess?.key == null || storeFeaturess?.key === '' ? (
                          ' '
                        ) : (
                          <>
                            <Button className="btn-icon btn-icon-end btn_color x-100 mt-3" onClick={() => handleCheckout('ONLINE', paymentAfterCharges)}>
                              <span>Make Payment {paymentAfterCharges}</span> <CsLineIcons icon="chevron-right" />
                            </Button>
                            {/* <div className="small">(Payment Method: PayU)</div> */}
                          </>
                        )}
                        {/* PayuMoney Button End */}
                        {/* CCavenue Button Start */}
                        {storeFeaturess?.ccKey == null || storeFeaturess?.ccKey === '' ? (
                          ' '
                        ) : (
                          <>
                            <Button className="btn-icon btn-icon-end btn_color x-100 mt-3" onClick={() => handleSubmit('ONLINE', paymentAfterCharges)}>
                              <span>Make Payment {paymentAfterCharges}</span> <CsLineIcons icon="chevron-right" />
                            </Button>
                          </>
                        )}
                        {/* CCavenue Button End */}
                      </div>
                    )}
                    {showDMT && storeFeaturess?.dmt && (
                      <div>
                        {' '}
                        {dmtCommissionCharge ? (
                          <>
                            <div className="col-md-4 col-6">
                              <Button
                                className="btn-icon btn-icon-end btn_color x-100 mt-3"
                                onClick={() => handleCheckout('DMT', paymentAfterdmtCommissionCharge.toFixed(2))}
                              >
                                <span>Make Payment {paymentAfterdmtCommissionCharge.toFixed(2)}</span> <CsLineIcons icon="chevron-right" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="mb-3">
                            <div className="col-md-4 col-6">
                              <Button className="btn-icon btn-icon-end x-100 mt-3 btn_color" onClick={() => handleCheckout('DMT', cartValue)}>
                                <span>Make Payment {cartValue}</span> <CsLineIcons icon="chevron-right" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {showCOD && storeFeaturess?.cod && (
                      <div className="col-md-4 col-6">
                        <Button className="btn-icon btn-icon-end w-100 mt-3 btn_color" onClick={() => handleCheckout('COD', cartValue)}>
                          <span>Make Payment</span> <CsLineIcons icon="chevron-right" />
                        </Button>
                      </div>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}

          {/* PAYMENT OPTIONS End */}
        </Col>

        {cartData && (
          <CheckoutSumary
            b2b={b2b}
            cartData={cartData}
            currentUser={currentUser}
            shippingAddressID={shippingAddress?.id}
            billingAddressID={billingAddress?.id}
            handlePaymentAfterCharges={handlePaymentAfterCharges}
            checkoutError={checkoutError}
            setcheckoutError={setcheckoutError}
            setOrderProduct={setOrderProduct}
            freeDeliveryValue={freeDeliveryValue}
            paymentCharge={paymentCharge}
            dmtCommission={dmtCommission}
          />
        )}

        <Modal show={showModalDMT} onHide={handleCloseDMT} centered size="lg">
          <Modal.Header closeButton className="p-2">
            <Modal.Title className="text-dark fw-bold small">DMT Help Video</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-1">
            <div className="ratio ratio-16x9">
              <iframe src={`${videoUrl}?rel=0`} title="DMT Help Video" allowFullScreen className="w-100 h-100" style={{ border: 'none' }} />
            </div>
          </Modal.Body>
        </Modal>
      </Row>
    </>
  );
};

export default withRouter(Checkout);
