import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Card, Modal, Form } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch } from 'react-redux';
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

const OrdersDetail = () => {
  const title = 'Order Detail';
  const description = ' Order Detail';
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderID = queryParams.get('orderID');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const [paymentGatewayResponse, setPaymentGatewayResponse] = useState(null);

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

  const [orderStatus, setorderStatus] = useState('Pending');
  const [formErrors, setFormErrors] = useState({});
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

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-3">
        <nav className="breadcrumb bg-transparent p-0 m-0">
          <button type="button" className="btn btn-link p-0 text-decoration-none text-dark" onClick={() => window.history.back()}>
            Back
          </button>
          <span className="mx-2 text-muted">/</span>
          <NavLink to="/seller/dashboard" className="text-decoration-none text-dark breadcrumb-item">
            Dashboard
          </NavLink>
          <span className="mx-2 text-muted">/</span>
          <NavLink to="/seller/order/issuelist" className="text-decoration-none text-dark breadcrumb-item">
            Orders with Issues
          </NavLink>
          <span className="mx-2 text-muted">/</span>
          <span className="fw-semibold text-dark breadcrumb-item active" aria-current="page">
            {title}
          </span>
        </nav>
      </div>

      {orderDetailData?.getSingleOrderForseller && (
        <Row>
          <Col xl="8" xxl="9">
            {/* Status Start */}
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
                          <span>{moment(parseInt(orderDetailData.getSingleOrderForseller.createdAt, 10)).format('LL')}</span>
                          {/* {((orderDetailData.getSingleOrderForseller.createdAt, 10)).format('LL')} */}
                        </div>
                        {/* eslint-disable-next-line no-nested-ternary */}
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
                                    <NavLink to={`/product/${product.productId.identifier}`} target="_blank" rel="noopener noreferrer">
                                      {product.productId.brand_name} : {product.productId.fullName} {product.variantId.variantName}
                                    </NavLink>
                                  </div>
                                  <Row className="g-0">
                                    <Col xs="9" className="d-flex flex-row pe-2 align-items-end text-dark">
                                      <div className="text-dark">
                                        {' '}
                                        Price : ₹{' '}
                                        {(product.iprice + product.iextraCharge - ((product.iprice + product.iextraCharge) * product.idiscount) / 100).toFixed(
                                          2
                                        )}
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
                        {orderDetailData.getSingleOrderForseller.shippingAddress.mobileNo}
                        {orderDetailData.getSingleOrderForseller.shippingAddress.altrMobileNo && (
                          <span> ,{orderDetailData.getSingleOrderForseller.shippingAddress.altrMobileNo}</span>
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
                        <Col className="text-dark">{orderDetailData.getSingleOrderForseller.shippingAddress.businessName}</Col>
                      </Row>
                    )}
                    {orderDetailData.getSingleOrderForseller.shippingAddress.gstin && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getSingleOrderForseller.shippingAddress.gstin}</Col>
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
                        {orderDetailData.getSingleOrderForseller.billingAddress.mobileNo}
                        {orderDetailData.getSingleOrderForseller.billingAddress.altrMobileNo && (
                          <span>, {orderDetailData.getSingleOrderForseller.billingAddress.altrMobileNo}</span>
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
                        <Col className="text-dark">{orderDetailData.getSingleOrderForseller.billingAddress.businessName}</Col>
                      </Row>
                    )}
                    {orderDetailData.getSingleOrderForseller.billingAddress.gstin && (
                      <Row className="g-0 mb-2">
                        <Col xs="auto">
                          <div className="sw-3 me-1">
                            <CsLineIcons icon="credit-card" size="17" className="text-primary" />
                          </div>
                        </Col>
                        <Col className="text-dark">{orderDetailData.getSingleOrderForseller.billingAddress.gstin}</Col>
                      </Row>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default OrdersDetail;
