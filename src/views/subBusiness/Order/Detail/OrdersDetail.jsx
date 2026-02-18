import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Card, Modal, Form } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch, useSelector } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import moment from 'moment';
import Tabbed from './component/Tabbed';

const GET_ORDER = gql`
  query GetSingleOrderForseller($getSingleOrderForsellerId: ID) {
    getSingleOrderForseller(id: $getSingleOrderForsellerId) {
      id
      onlinepaymentStatus
      paymentGatewayResponse
      status
      paymentMethod
      paymentStatus
      freeDelivery
      totalAmount
      onlinePaymentCharge
      onlinePaymentChargePercentage
      createdAt
      orderProducts {
        iprice
        igst
        idiscount
        iextraChargeType
        iextraCharge
        itransportChargeType
        itransportCharge
        price
        quantity
        packed
        pending
        packageIdentifier
        shippedImage
        shippedBy
        trackingNo
        trackingUrl
        cancelled
        shippedDate
        shipped
        packedDate
        delivered
        deliveredDate
        packedImage
        productStatus
        sellerId {
          companyName
          fullAddress
          city
          state
          pincode
          pancardNo
          gstin
          gstinComposition
          mobileNo
          email
          address
        }
        productId {
          id
          identifier
          listingCommType
          listingComm
          productComm
          productCommType
          shippingCommType
          shippingComm
          fixedCommType
          fixedComm
          fullName
          previewName
          brand_name
          thumbnail
          images
        }
        variantId {
          id
          variantName
          hsn
        }
        locationId {
          id
          unitType
          sellerId {
            id
            companyName
            email
            mobileNo
            address
          }
        }
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
      user {
        firstName
        lastName
        mobileNo
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
    }
  }
`;

const ORDER_SHIPPED = gql`
  mutation OrderShipped(
    $orderShippedId: ID
    $status: String
    $file: Upload
    $shippedBy: String
    $trackingNo: String
    $trackingUrl: String
    $shippedDate: String
    $orderProducts: [OrderProducts]
  ) {
    orderShipped(
      id: $orderShippedId
      status: $status
      file: $file
      shippedBy: $shippedBy
      trackingNo: $trackingNo
      trackingUrl: $trackingUrl
      shippedDate: $shippedDate
      orderProducts: $orderProducts
    ) {
      id
    }
  }
`;

const ORDER_PACKED = gql`
  mutation OrderPacked($orderPackedId: ID, $status: String, $file: Upload, $packedDate: String, $orderProducts: [OrderProducts]) {
    orderPacked(id: $orderPackedId, status: $status, file: $file, packedDate: $packedDate, orderProducts: $orderProducts) {
      id
    }
  }
`;

const SHIPPING = gql`
  query GetAllShipping {
    getAllShipping {
      id
      shipping_company
      url
    }
  }
`;

const ORDER_DELIVERED = gql`
  mutation OrderDelivered($orderDeliveredId: ID, $status: String, $deliveredDate: String, $orderProducts: [OrderProducts]) {
    orderDelivered(id: $orderDeliveredId, status: $status, deliveredDate: $deliveredDate, orderProducts: $orderProducts) {
      id
    }
  }
`;

const OrdersDetail = () => {
  const title = 'Order Detail';
  const description = 'Order Detail';
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderID = queryParams.get('orderID');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const [paymentGatewayResponse, setPaymentGatewayResponse] = useState(null);
  const { currentUser } = useSelector((state) => state.auth);

  const [GetSingleOrderForseller, { data: orderDetailData, refetch }] = useLazyQuery(GET_ORDER, {
    variables: {
      getSingleOrderForsellerId: orderID,
    },
    onCompleted: () => {
      if (orderDetailData?.getSingleOrderForseller?.paymentGatewayResponse) {
        const paymentGatewayResponse1 = JSON.parse(orderDetailData.getSingleOrderForseller.paymentGatewayResponse);
        setPaymentGatewayResponse(paymentGatewayResponse1);
      }
    },
    onError: (error) => {
      console.error('GetSingleOrderForseller', error);
    },
  });

  useEffect(() => {
    GetSingleOrderForseller();
  }, []);

  const [totalCartValue, setTotalCartValue] = useState(0);

  useEffect(() => {
    if (orderDetailData && orderDetailData.getSingleOrderForseller) {
      const { orderProducts } = orderDetailData.getSingleOrderForseller;

      const calculatedTotalCartValue = orderProducts.reduce((total, product) => total + product.price, 0);

      setTotalCartValue(calculatedTotalCartValue);
    }
  }, [orderDetailData]);

  const hasSellerProduct = orderDetailData?.getSingleOrderForseller?.orderProducts?.some((item) => item?.locationId?.sellerId?.id === currentUser?.seller?.id);

  const hasPackedProduct = orderDetailData?.getSingleOrderForseller?.orderProducts?.some(
    (item) => item?.locationId?.sellerId?.id === currentUser?.seller?.id && item?.packed === true
  );

  const [listingComm1, setListingComm] = useState(0);
  const [productComm1, setProductComm] = useState(0);
  const [shippingComm1, setShippingComm] = useState(0);
  const [fixedComm1, setFixedComm] = useState(0);

  useEffect(() => {
    if (orderDetailData && orderDetailData.getSingleOrderForseller) {
      const { orderProducts } = orderDetailData.getSingleOrderForseller;

      const list = orderProducts.map(({ quantity, productId }) => {
        let listing = 0;
        let productComm = 0;
        let shippingComm = 0;
        let fixedComm = 0;

        if (productId.listingCommType === 'fix') {
          listing = productId.listingComm;
        } else if (productId.listingCommType === 'percentage') {
          listing = productId.listingComm / 100;
        }

        if (productId.productCommType === 'fix') {
          productComm = productId.productComm * quantity;
        } else if (productId.productCommType === 'percentage') {
          productComm = (productId.productComm / 100) * quantity;
        }

        if (productId.shippingCommType === 'fix') {
          shippingComm = productId.shippingComm * quantity;
        } else if (productId.shippingCommType === 'percentage') {
          shippingComm = (productId.shippingComm / 100) * quantity;
        }

        if (productId.fixedCommType === 'fix') {
          fixedComm = productId.fixedComm * quantity;
        } else if (productId.fixedCommType === 'percentage') {
          fixedComm = (productId.fixedComm / 100) * quantity;
        }

        return { listing, productComm, shippingComm, fixedComm };
      });

      // Update the state variables

      const totalListingComm = list.reduce((total, item) => total + item.listing, 0);
      const totalProductComm = list.reduce((total, item) => total + item.productComm, 0);
      const totalShippingComm = list.reduce((total, item) => total + item.shippingComm, 0);
      const totalFixedComm = list.reduce((total, item) => total + item.fixedComm, 0);

      setListingComm(parseFloat(totalListingComm.toFixed(2)));
      setProductComm(parseFloat(totalProductComm.toFixed(2)));
      setShippingComm(parseFloat(totalShippingComm.toFixed(2)));
      setFixedComm(parseFloat(totalFixedComm.toFixed(2)));
    }
  }, [orderDetailData]);

  // handle dropdown

  const [orderStatus, setorderStatus] = useState('Pending');
  const [formErrors, setFormErrors] = useState({});

  // all modals

  const [packedmodalShow, setpackedModalShow] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [shippedmodalShow, setshippedModalShow] = useState(false);
  const [deliveredmodalShow, setdeliveredModalShow] = useState(false);

  const initialFormData = {
    orderPackedId: orderID,
    status: '',
  };
  const initialshippedFormData = {
    orderShippedId: orderID,
    status: '',
    file: null,
    shippedBy: '',
    trackingNo: '',
    trackingUrl: '',
    shippedDate: '',
  };
  const initialdeliveredFormData = {
    orderDeliveredId: orderID,
    status: '',
    deliveredDate: '',
  };

  const [packedFormData, setpackedFormData] = useState(initialFormData);
  const [shippedformData, setshippedFormData] = useState(initialshippedFormData);
  const [deliveredformData, setdeliveredFormData] = useState(initialdeliveredFormData);
  const [checkProductList, setcheckProductList] = useState({ orderProducts: [] });
  const [selectedPackageIdentifiers, setSelectedPackageIdentifiers] = useState([]);

  const [OrderPacked, { loading }] = useMutation(ORDER_PACKED, {
    onCompleted: () => {
      refetch();
      toast.success('Order Packed Successully! ');
      setpackedModalShow(false);
      setConfirmModal(false);
      setpackedFormData(initialFormData);
      setcheckProductList({ orderProducts: [] });
    },
    onError: (error) => {
      console.error('ORDER_PACKED', error);
    },
  });
  const handleSelect = (orderkaStatus) => {
    setFormErrors({});
    setcheckProductList({ orderProducts: [] });
    setSelectedPackageIdentifiers([]);

    if (orderkaStatus === 'pending') {
      return;
    }
    if (orderkaStatus === 'packed') {
      setpackedModalShow(true);
      setpackedFormData((prevValue) => ({
        ...prevValue,
        status: orderkaStatus,
      }));
    }
    if (orderkaStatus === 'shipped') {
      setshippedModalShow(true);
      setshippedFormData((prevValue) => ({
        ...prevValue,
        status: orderkaStatus,
      }));
    }
    if (orderkaStatus === 'delivered') {
      setdeliveredModalShow(true);
      setdeliveredFormData((prevValue) => ({
        ...prevValue,
        status: orderkaStatus,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setpackedFormData((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (event, variantId) => {
    const { name, checked } = event.target;
    if (checked) {
      const productToAdd = { variantId };

      setcheckProductList((prevData) => ({
        ...prevData,
        orderProducts: [...prevData.orderProducts, productToAdd],
      }));
    } else {
      setcheckProductList((prevData) => ({
        ...prevData,
        orderProducts: prevData.orderProducts.filter((product) => product.variantId !== variantId),
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!packedFormData.status.trim()) {
      errors.status = 'Status is required.';
    }

    if (!checkProductList.orderProducts.length) {
      errors.productlist = 'Product Selection is required.';
    }

    return errors;
  };

  const confimationModal = async (e) => {
    e.preventDefault();
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setConfirmModal(true);
  };

  const handlepackedSubmit = async (e) => {
    e.preventDefault();

    await OrderPacked({
      variables: {
        ...packedFormData,
        orderProducts: checkProductList.orderProducts,
      },
    });
  };

  const [shippingData, setShippingData] = useState([]);
  const [GetAllShipping] = useLazyQuery(SHIPPING, {
    onCompleted: (res) => {
      setShippingData(res.getAllShipping);
      // console.log('res', res);
    },
    onError: (error) => {
      console.error('SHIPPING', error);
    },
  });

  useEffect(() => {
    GetAllShipping();
  }, [GetAllShipping]);

  const [OrderShipped, { loading: shippedLoading }] = useMutation(ORDER_SHIPPED, {
    onCompleted: () => {
      refetch();
      toast.success('Order Shipped Successully! ');
      setshippedModalShow(false);
      setshippedFormData(initialshippedFormData);
      setcheckProductList({ orderProducts: [] });
    },
    onError: (error) => {
      console.error('ORDER_SHIPPED', error);
    },
  });

  const handleshippedItemChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setshippedFormData((prevValue) => ({
        ...prevValue,
        [name]: files[0],
      }));
    } else if (name === 'shippedBy') {
      const shipping1 = shippingData.find((shipping) => shipping.shipping_company === value);
      setshippedFormData((prevValue) => ({
        ...prevValue,
        trackingUrl: shipping1.url,
        [name]: value,
      }));
    } else {
      setshippedFormData((prevValue) => ({
        ...prevValue,
        [name]: value,
      }));
    }
  };

  const validateShippedForm = () => {
    const errors = {};
    if (!shippedformData.status.trim()) {
      errors.status = 'Status is required.';
    }
    if (!shippedformData.shippedBy.trim()) {
      errors.shippedBy = 'Shipped By is required.';
    }
    if (!shippedformData.trackingNo.trim()) {
      errors.trackingNo = 'Tracking No is required.';
    }
    if (!shippedformData.trackingUrl.trim()) {
      errors.trackingUrl = 'Tracking Url is required.';
    }
    if (!shippedformData.file) {
      errors.file = 'Package Image is required.';
    }
    if (!shippedformData.shippedDate.trim()) {
      errors.shippedDate = 'Date is required.';
    }
    if (!checkProductList.orderProducts.length) {
      errors.productlist = 'Product Selection is required.';
    }
    return errors;
  };

  const handleshippedSubmit = async (e) => {
    e.preventDefault();
    const errors = await validateShippedForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    await OrderShipped({
      variables: {
        ...shippedformData,
        orderProducts: checkProductList.orderProducts,
      },
    });
  };

  const [OrderDelivered, { loading: deliveryLoading }] = useMutation(ORDER_DELIVERED, {
    onCompleted: () => {
      refetch();
      toast.success('Order Delivered Successully! ');
      setdeliveredModalShow(false);
      setdeliveredFormData(initialdeliveredFormData);
      setcheckProductList({ orderProducts: [] });
    },
    onError: (error) => {
      console.error('ORDER_DELIVERED', error);
    },
  });
  const handledeliveredItemChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setdeliveredFormData((prevValue) => ({
        ...prevValue,
        [name]: files[0],
      }));
    } else {
      setdeliveredFormData((prevValue) => ({
        ...prevValue,
        [name]: value,
      }));
    }
  };

  const validateDeliveredForm = () => {
    const errors = {};
    if (!deliveredformData.status.trim()) {
      errors.status = 'Status is required.';
    }
    if (!deliveredformData.deliveredDate.trim()) {
      errors.deliveredDate = 'Date is required.';
    }
    if (!checkProductList.orderProducts.length) {
      errors.productlist = 'Product Selection is required.';
    }
    return errors;
  };

  const handledeliveredSubmit = async (e) => {
    e.preventDefault();
    const errors = await validateDeliveredForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    await OrderDelivered({
      variables: {
        ...deliveredformData,
        orderProducts: checkProductList.orderProducts,
      },
    });
  };

  const handlemultipleCheckboxChange = (packageIdentifier) => {
    if (selectedPackageIdentifiers.includes(packageIdentifier)) {
      setSelectedPackageIdentifiers(selectedPackageIdentifiers.filter((id) => id !== packageIdentifier));
    } else {
      setSelectedPackageIdentifiers([...selectedPackageIdentifiers, packageIdentifier]);
    }
  };

  useEffect(() => {
    if (orderDetailData?.getSingleOrderForseller?.orderProducts) {
      const selectedProducts = orderDetailData.getSingleOrderForseller.orderProducts
        .filter((product) => selectedPackageIdentifiers.includes(product.packageIdentifier))
        .map((product) => ({
          variantId: product.variantId.id,
        }));

      setcheckProductList((prevData) => ({
        ...prevData,
        orderProducts: selectedProducts,
      }));
    }
  }, [selectedPackageIdentifiers]);

  const rawDate = orderDetailData?.getSingleOrderForseller?.createdAt;
  const orderDate = rawDate ? moment(parseInt(rawDate, 10)).format('YYYY-MM-DD') : '';
  const todayDate = moment().format('YYYY-MM-DD');
  const minDate = moment(orderDate).isAfter(todayDate) ? todayDate : orderDate;

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <button type="button" className="bg-transparent border-0 p-0 m-0 text-dark fw-bold" onClick={() => window.history.back()}>
              Back
            </button>
          </Col>

          {/* Top Buttons Start */}
          <div className="float-end">
            {' '}
            {orderDetailData?.getSingleOrderForseller && (
              <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
                <Dropdown onSelect={handleSelect} className="w-100 w-md-auto">
                  <Dropdown.Toggle className="w-100 w-md-auto" variant="outline-primary">
                    Order Status Update
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item eventKey="packed">Packed</Dropdown.Item>
                    <Dropdown.Item eventKey="shipped">Shipped</Dropdown.Item>
                    <Dropdown.Item eventKey="delivered">Delivered</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>
            )}
          </div>
          {/* Top Buttons End */}
        </Row>
      </div>

      {orderDetailData?.getSingleOrderForseller && (
        <Row>
          <Col xl="8" xxl="9">
            {/* Status Start */}
            <Row className="g-2 mb-5">
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
                        <div className="text-dark">{orderDetailData.getSingleOrderForseller.id}</div>
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
                        <div className="d-flex align-items-center lh-1-25">Order Date</div>
                        <div className="text-dark">
                          <span>{moment(parseInt(orderDetailData.getSingleOrderForseller.createdAt, 10)).format('DD-MMM-YYYY')}</span>
                          {/* {((orderDetailData.getSingleOrderForseller.createdAt, 10)).format('LL')} */}
                        </div>
                        {/* eslint-disable-next-line no-nested-ternary */}
                        {/* {orderDetailData.getSingleOrderForseller.paymentMethod === 'ONLINE' ? (
                          paymentGatewayResponse && orderDetailData.getSingleOrderForseller.onlinepaymentStatus === 'success' ? (
                            <div className="text-dark">{`${orderDetailData.getSingleOrderForseller.paymentMethod}/ ${
                              paymentGatewayResponse?.transaction_details[orderID]?.bankcode
                            }/ ${paymentGatewayResponse?.transaction_details[orderID]?.status.toUpperCase()}`}</div>
                          ) : (
                            <div className="text-dark">{`${
                              orderDetailData.getSingleOrderForseller.paymentMethod
                            }/ ${paymentGatewayResponse?.transaction_details[orderID]?.status.toUpperCase()}`}</div>
                          )
                        ) : (
                          <div className="text-dark">{orderDetailData.getSingleOrderForseller.paymentMethod} </div>
                        )} */}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Tabbed orderDetailData={orderDetailData} OrderPacked={OrderPacked} loading={loading} />

            <h2 className="small-title mt-3 p-2 bg-primary text-white rounded-top">All Order</h2>
            <Card className="mb-5">
              <div className="p-2">
                <div className="mb-5">
                  {orderDetailData.getSingleOrderForseller.orderProducts.length > 0 && (
                    <table className="table">
                      <tbody>
                        {orderDetailData.getSingleOrderForseller.orderProducts.map((product, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={product.productId.thumbnail || (product.productId.images.length > 0 && product.productId.images[0])}
                                  className="border p-1 rounded-md h-100 sw-10"
                                  alt={product.productId.fullName}
                                />
                                <div className="ps-3 col">
                                  <div>
                                    {product.productId.brand_name} : {product.productId.fullName} {product.variantId.variantName}
                                  </div>
                                  <Row className="g-0">
                                    <Col xs="9" className="d-flex flex-row pe-2 align-items-end text-dark">
                                      <div className="text-dark">
                                        {' '}
                                        Price : ₹ {product.iprice + product.iextraCharge - ((product.iprice + product.iextraCharge) * product.idiscount) / 100}
                                        {product.itransportCharge === '0' ? null : (
                                          <span>
                                            {' '}
                                            <br /> {product.itransportChargeType} : ₹ {product.itransportCharge}{' '}
                                          </span>
                                        )}
                                        <br />
                                        Qty : {product.quantity}
                                      </div>
                                    </Col>
                                    <Col xs="3" className="d-flex flex-row align-items-end justify-content-end text-dark">
                                      <span className="text-dark"> ₹ {product.price.toFixed(2)} </span>
                                    </Col>
                                  </Row>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                <div>
                  <Row className="g-0 mb-2">
                    <Col xs="auto" className="ms-auto ps-3 text-dark">
                      Total
                    </Col>
                    <Col xs="auto" className="sw-13 text-end px-2">
                      <span>
                        <span className="text-dark">₹ </span>
                        <span>{totalCartValue ? totalCartValue.toFixed(2) : '0.00'}</span>
                      </span>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
          </Col>

          <Col xl="4" xxl="3">
            {orderDetailData?.getSingleOrderForseller?.orderProducts[0]?.packed === true && (
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
                      <Col className="text-dark">{orderDetailData?.getSingleOrderForseller?.user.firstName}</Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="email" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">{orderDetailData?.getSingleOrderForseller?.user.email}</Col>
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            )}
            <Card className="mb-5">
              <div className="mb-n5 p-2">
                <h2 className="small-title bg-primary rounded-top text-white p-2 mb-2">Address</h2>
                {orderDetailData?.getSingleOrderForseller?.shippingAddress && (
                  <div className="mb-5 ps-2 px-2">
                    <p className=" text-dark mb-2 fw-bold">SHIPPING ADDRESS</p>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="user" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderForseller.shippingAddress.firstName} {orderDetailData.getSingleOrderForseller.shippingAddress.lastName}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="pin" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderForseller.shippingAddress.addressLine1}{' '}
                        {orderDetailData.getSingleOrderForseller.shippingAddress.addressLine2}
                        <br />
                        {orderDetailData.getSingleOrderForseller.shippingAddress.city}, {orderDetailData.getSingleOrderForseller.shippingAddress.postalCode},{' '}
                        {orderDetailData.getSingleOrderForseller.shippingAddress.state}, {orderDetailData.getSingleOrderForseller.shippingAddress.country}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="phone" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {hasPackedProduct ? (
                          <span>
                            {orderDetailData.getSingleOrderForseller.shippingAddress.mobileNo}
                            {orderDetailData.getSingleOrderForseller.shippingAddress.altrMobileNo && (
                              <span>, {orderDetailData.getSingleOrderForseller.shippingAddress.altrMobileNo}</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-muted">Shown after order is packed</span>
                        )}
                      </Col>
                    </Row>
                    {orderDetailData.getSingleOrderForseller.shippingAddress.businessName && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="shop" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">
                          {hasPackedProduct ? (
                            orderDetailData?.getSingleOrderForseller?.shippingAddress?.businessName
                          ) : (
                            <span className="text-muted">******</span>
                          )}
                        </Col>
                      </Row>
                    )}
                    {orderDetailData.getSingleOrderForseller.shippingAddress.gstin && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">
                          {hasPackedProduct ? (
                            orderDetailData?.getSingleOrderForseller?.shippingAddress?.gstin
                          ) : (
                            <span className="text-muted">Shown after order is packed</span>
                          )}
                        </Col>
                      </Row>
                    )}
                  </div>
                )}
                {orderDetailData.getSingleOrderForseller.billingAddress && (
                  <div className="mb-5 ps-2 px-2">
                    <p className="text-dark mb-2 fw-bold">BILLING ADDRESS</p>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="user" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderForseller.billingAddress.firstName} {orderDetailData.getSingleOrderForseller.billingAddress.lastName}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="pin" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {orderDetailData.getSingleOrderForseller.billingAddress.addressLine1}{' '}
                        {orderDetailData.getSingleOrderForseller.billingAddress.addressLine2},
                        <br />
                        {orderDetailData.getSingleOrderForseller.billingAddress.city}, {orderDetailData.getSingleOrderForseller.billingAddress.postalCode},
                        {orderDetailData.getSingleOrderForseller.billingAddress.state}, {orderDetailData.getSingleOrderForseller.billingAddress.country}
                      </Col>
                    </Row>
                    <Row className="g-0 mb-2">
                      <Col xs="auto">
                        <div className="sw-3 me-1">
                          <CsLineIcons icon="phone" size="17" className="text-primary" />
                        </div>
                      </Col>
                      <Col className="text-dark">
                        {hasPackedProduct ? (
                          <>
                            {orderDetailData?.getSingleOrderForseller?.billingAddress?.mobileNo}
                            {orderDetailData?.getSingleOrderForseller?.billingAddress?.altrMobileNo && (
                              <span>, {orderDetailData.getSingleOrderForseller.billingAddress.altrMobileNo}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted">Shown after order is packed</span>
                        )}
                      </Col>
                    </Row>
                    {orderDetailData.getSingleOrderForseller.billingAddress.businessName && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="shop" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">
                          {hasPackedProduct ? (
                            orderDetailData?.getSingleOrderForseller?.billingAddress?.businessName
                          ) : (
                            <span className="text-muted">Shown after order is packed</span>
                          )}
                        </Col>
                      </Row>
                    )}
                    {orderDetailData.getSingleOrderForseller.billingAddress.gstin && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">
                          {hasPackedProduct ? (
                            orderDetailData?.getSingleOrderForseller?.billingAddress?.gstin
                          ) : (
                            <span className="text-muted">Shown after order is packed</span>
                          )}
                        </Col>
                      </Row>
                    )}
                  </div>
                )}

                {/* <div className="mb-5">
                  <p className=" text-dark mb-2">PAYMENT</p>
                  <Row className="g-0 mb-2">
                    <Col xs="auto">
                      <div className="sw-3 me-1">
                        <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                      </div>
                    </Col>
                    <Col className="text-dark">{orderDetailData.getSingleOrderForseller.paymentMethod}</Col>
                  </Row>
                </div> */}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Modal show={packedmodalShow} onHide={() => setpackedModalShow(false)}>
        <Modal.Header closeButton className="border-bottom bg-light p-3">
          <Modal.Title className="fs-6 fw-bold text-dark">Packed</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={confimationModal}>
            {/* <div className="mb-4">
              <Form.Label className="fw-semibold text-dark">Order Status</Form.Label>
              <Form.Control
                type="text"
                name="status"
                className="text-uppercase fw-bold bg-white border text-dark p-2 rounded"
                value={packedFormData.status}
                disabled
              />
              {formErrors.status && <div className="text-danger mt-1">{formErrors.status}</div>}
            </div> */}

            {orderDetailData?.getSingleOrderForseller?.orderProducts.length > 0 && (
              <div className="mb-4">
                {formErrors.productlist && <div className="text-danger mb-2">{formErrors.productlist}</div>}
                <div className="border rounded p-2 bg-light">
                  <table className="table table-borderless">
                    <thead className="bg-white text-dark border-bottom">
                      <tr>
                        <th>Product</th>
                        <th className="text-center">Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetailData.getSingleOrderForseller.orderProducts
                        .filter((item) => item.pending === true && !item.packed === true)
                        .map((product, index) => (
                          <tr key={index} className="border-bottom">
                            <td className="text-dark py-2">
                              <div>{product.productId.previewName}</div>
                              <small className="text-muted">{product.variantId.variantName}</small>
                            </td>
                            <td className="text-center">
                              <Form.Check type="checkbox" onChange={(event) => handleCheckboxChange(event, product.variantId.id)} />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="d-flex justify-content-center">
              <Button type="submit" variant="primary" className="fw-bold px-4 py-2">
                Confirm Packing
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={confirmModal} onHide={() => setConfirmModal(false)}>
        <Modal.Header closeButton className="border-bottom bg-light p-3">
          <Modal.Title className="fs-6 fw-bold text-dark">Confirm Order Packed</Modal.Title>
        </Modal.Header>
        <Modal.Body className="my-2 py-2">
          <Form onSubmit={handlepackedSubmit}>
            Are you sure you want to Pack selected products? <br /> (क्या आप वाकई चयनित उत्पाद को पैक करना चाहते हैं?) <br />
            <br /> Note: Once the order is packed, there can be no alterations. <br /> (नोट: एक बार ऑर्डर पैक हो जाने के बाद, इसमें कोई बदलाव नहीं किया जा सकता
            है|)
            <div className="d-flex justify-content-around mt-3">
              <Button variant="danger" onClick={() => setConfirmModal(false)}>
                Cancel
              </Button>
              {loading ? <Button>Loading</Button> : <Button type="submit">Submit</Button>}
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* status shipped handle  */}
      <Modal show={shippedmodalShow} onHide={() => setshippedModalShow(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold text-dark fs-6">Order Shipped </Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <Form onSubmit={handleshippedSubmit}>
            <div className="mb-3">
              <Form.Label className="fw-bold text-dark">Order Status</Form.Label>
              <Form.Control type="text" name="status" className="text-uppercase" value={shippedformData.status} disabled />
              {formErrors.status && <div className="mt-1 text-danger">{formErrors.status}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fw-bold text-dark">Shipped By</Form.Label>
              <Form.Select name="shippedBy" value={shippedformData.shippedBy} onChange={handleshippedItemChange}>
                <option hidden>Select Shipping Partner</option>
                {shippingData?.length > 0 &&
                  shippingData.map((shipping, index) => (
                    <option key={index} value={shipping.shipping_company}>
                      {shipping.shipping_company}
                    </option>
                  ))}
              </Form.Select>
              {formErrors.shippedBy && <div className="mt-1 text-danger">{formErrors.shippedBy}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fw-bold text-dark">Tracking Url</Form.Label>
              <Form.Control type="text" name="trackingUrl" disabled value={shippedformData.trackingUrl || ''} onChange={handleshippedItemChange} />
              {formErrors.trackingUrl && <div className="mt-1 text-danger">{formErrors.trackingUrl}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fw-bold text-dark">Tracking No</Form.Label>
              <Form.Control type="text" name="trackingNo" value={shippedformData.trackingNo} onChange={handleshippedItemChange} />
              {formErrors.trackingNo && <div className="mt-1 text-danger">{formErrors.trackingNo}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fw-bold text-dark">Shipment Slip Image</Form.Label>
              <Form.Control type="file" accept="image/*" name="file" onChange={handleshippedItemChange} />
              {formErrors.file && <div className="mt-1 text-danger">{formErrors.file}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fw-bold text-dark">Shipping Date</Form.Label>
              <Form.Control type="date" name="shippedDate" onChange={handleshippedItemChange} min={minDate} max={todayDate} />
              {formErrors.shippedDate && <div className="mt-1 text-danger">{formErrors.shippedDate}</div>}
            </div>

            <div className="mb-3">
              {orderDetailData?.getSingleOrderForseller?.orderProducts.length > 0 && (
                <>
                  {formErrors.productlist && <div className="mt-1 text-danger">{formErrors.productlist}</div>}
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetailData.getSingleOrderForseller.orderProducts
                        .filter((item) => item.packed === true && !item.shipped === true)
                        .map((product, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="ps-3">
                                  <div>{product.productId.previewName}</div>
                                  <Row className="g-0">
                                    <Col xs="6" className="d-flex flex-row pe-2 align-items-end text-dark">
                                      {product.variantId.variantName}
                                    </Col>
                                  </Row>
                                  <div className="text-dark text-small">{product.packageIdentifier}</div>
                                </div>
                                <div className="mb-2 ms-5">
                                  <Form.Check
                                    type="checkbox"
                                    name="orderProducts"
                                    inline
                                    onChange={() => handlemultipleCheckboxChange(product.packageIdentifier)}
                                    checked={selectedPackageIdentifiers.includes(product.packageIdentifier)}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="d-flex justify-content-center mt-4">{shippedLoading ? <Button>Loading</Button> : <Button type="submit">Submit</Button>}</div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* status delivered handle  */}
      <Modal show={deliveredmodalShow} onHide={() => setdeliveredModalShow(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold text-dark fs-6">Order Delivered </Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <Form onSubmit={handledeliveredSubmit}>
            <div className="mb-3">
              <Form.Label className="fw-bold text-dark">Order Status</Form.Label>
              <Form.Control type="text" name="status" className="text-uppercase" value={deliveredformData.status} disabled />
              {formErrors.status && <div className="mt-1 text-danger">{formErrors.status}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fw-bold text-dark">Delivered Date</Form.Label>
              <Form.Control type="date" name="deliveredDate" onChange={handledeliveredItemChange} min={minDate} max={todayDate} />
              {formErrors.deliveredDate && <div className="mt-1 text-danger">{formErrors.deliveredDate}</div>}
            </div>

            <div className="mb-3">
              {orderDetailData?.getSingleOrderForseller?.orderProducts.length > 0 && (
                <>
                  {formErrors.productlist && <div className="mt-1 text-danger">{formErrors.productlist}</div>}
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetailData.getSingleOrderForseller.orderProducts
                        .filter((item) => item.shipped === true && !item.delivered === true)
                        .map((product, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="ps-3">
                                  <div>{product.productId.previewName}</div>
                                  {/* <div className="text-dark text-small">{}</div> */}
                                  <Row className="g-0">
                                    <Col xs="6" className="d-flex flex-row pe-2 align-items-end text-dark">
                                      {product.variantId.variantName}
                                    </Col>
                                  </Row>
                                  <div className="text-dark text-small">{product.packageIdentifier}</div>
                                </div>
                                <div className="mb-2 ms-5">
                                  <Form.Check
                                    type="checkbox"
                                    name="orderProducts"
                                    inline
                                    onChange={() => handlemultipleCheckboxChange(product.packageIdentifier)}
                                    checked={selectedPackageIdentifiers.includes(product.packageIdentifier)}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>

            <div className="d-flex justify-content-center mt-4">{deliveryLoading ? <Button>Loading</Button> : <Button type="submit">Submit</Button>}</div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default OrdersDetail;
