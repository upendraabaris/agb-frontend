import { React, useEffect, useState } from 'react';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';
import { Button, Modal, Form, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import DiscountBadge from 'views/storefront/home/DiscountBadge';
import PriceComponent from 'views/storefront/home/PriceComponent';
import moment from 'moment';
import { useAsyncDebounce } from 'react-table';

/* ===================== SELLER ===================== */

export const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      id
      user {
        firstName
        lastName
        mobileNo
        email
      }
      superSellerId {
        companyName
      }
      companyName
      bill
      gstin
      pancardNo
      gstinComposition
      fullAddress
      city
      pincode
      companyDescription
      mobileNo
      email
      state
      allotted {
        dastatus
        baId
        dealerId
        pincode
        state
      }
      review {
        description
        userRating
        customerName
        ratingDate
      }
      overallrating
    }
  }
`;

/* ===================== DA LIST ================== */

const GETBAALLDA = gql`
  query GetBAallDa($baId: ID!) {
    getBAallDa(baID: $baId) {
      companyName
      companyDescription
      city
      email
      gstin
      fullAddress
      mobileNo
      pincode
      state
      dealerstatus
      allotted {
        dastatus
        baId
        dealerId
        pincode
        state
      }
    }
  }
`;

/* ===================== ORDERS ===================== */

const GET_SELLER_ORDER = gql`
  query GetOrderBySellerId($sellerId: ID) {
    getOrderBySellerId(sellerId: $sellerId) {
      id
      status
      totalAmount
      createdAt
    }
  }
`;

/* ===================== UPDATE ===================== */

const EDIT_SELLER = gql`
  mutation UpdateSeller(
    $updateSellerId: ID!
    $companyName: String
    $bill: String
    $gstin: String
    $pancardNo: String
    $gstinComposition: Boolean
    $fullAddress: String
    $city: String
    $state: String
    $pincode: String
    $companyDescription: String
    $mobileNo: String
    $email: String
    $whatsAppMobileNo: String
    $whatsAppPermission: Boolean
    $emailPermission: Boolean
  ) {
    updateSeller(
      id: $updateSellerId
      companyName: $companyName
      bill: $bill
      gstin: $gstin
      pancardNo: $pancardNo
      gstinComposition: $gstinComposition
      fullAddress: $fullAddress
      city: $city
      state: $state
      pincode: $pincode
      companyDescription: $companyDescription
      mobileNo: $mobileNo
      email: $email
      whatsAppMobileNo: $whatsAppMobileNo
      whatsAppPermission: $whatsAppPermission
      emailPermission: $emailPermission
    ) {
      companyName
      bill
      gstin
      pancardNo
      gstinComposition
      fullAddress
      city
      state
      pincode
      companyDescription
      mobileNo
      email
      emailPermission
      whatsAppPermission
      whatsAppMobileNo
    }
  }
`;

const GETPRODUCTSBYSELLER = gql`
  query GetProductBySeller($sellerId: ID!, $search: String, $limit: Int, $offset: Int, $sortBy: String, $sortOrder: String) {
    getProductBySeller(seller_id: $sellerId, search: $search, limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
      id
      previewName
      sku
      brand_name
      catalogue
      identifier
      categories
      fullName
      faq {
        answer
        question
      }
      description
      giftOffer
      images
      variant {
        active
        allPincode
        hsn
        id
        location {
          id
          pincode
          unitType
          priceType
          price
          gstType
          gstRate
          extraChargeType
          extraCharge
          transportChargeType
          transportCharge
          b2cdiscount
          b2bdiscount
          finalPrice
          mainStock
          displayStock
          sellerId {
            id
          }
        }
        minimunQty
        moq
        silent_features
        variantName
      }
    }
  }
`;

const GET_SUPER_SELLER_LIST = gql`
  query GetSuperSeller {
    getSuperSeller {
      id
      seller {
        companyName
      }
    }
  }
`;

/* ===================== DA UPDATE ===================== */

const DA_APPROVE_BY_PORTAL_ADMIN = gql`
  mutation DaApproveByPortalAdmin($sellerid: ID!, $baId: ID!) {
    daApproveByPortalAdmin(sellerid: $sellerid, baID: $baId) {
      allotted {
        state
      }
    }
  }
`;

function DetailSeller() {
  const title = 'BA Details';
  const description = 'BA Details';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { id } = useParams();
  const history = useHistory();

  /* ===================== UI STATE ===================== */
  const [editModal, setEditModal] = useState(false);
  const [company, setCompany] = useState('');
  const [desc, setDesc] = useState('');
  const [mail, setMail] = useState('');
  const [phone, setPhone] = useState('');
  const [faddress, setfAddress] = useState('');
  const [citys, setCitys] = useState('');
  const [states, setStates] = useState('');
  const [pincodes, setPincodes] = useState('');
  const [gst, setGST] = useState('');
  const [bil, setBil] = useState('');
  const [superSellerId, setSuperSellerId] = useState(null);
  const [superSellers, setSuperSellers] = useState([]);
  const [GetSuperSellerList] = useLazyQuery(GET_SUPER_SELLER_LIST, {
    onCompleted: (data) => {
      setSuperSellers(data.getSuperSeller);
    },
    onError: (error) => {
      console.error('GET_SUPER_SELLER_LIST error:', error);
    },
  });

  useEffect(() => {
    GetSuperSellerList();
    dispatch(menuChangeUseSidebar(true));
  }, [GetSuperSellerList, dispatch]);
  const [loading, setLoading] = useState(false);

  const [GetSeller, { data, refetch }] = useLazyQuery(GET_SELLER, {
    variables: {
      getSellerId: id,
    },
  });

  const [GetOrderBySellerId, { data: orderData }] = useLazyQuery(GET_SELLER_ORDER, {
    variables: {
      sellerId: id,
    },
    onError: (err) => {
      console.log('GET_SELLER_ORDER', err);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      await GetSeller();
      await GetOrderBySellerId();
    };
    fetchData();
  }, [GetOrderBySellerId, GetSeller]);

  const [editSeller, { error: errorEdit, data: dataEdit }] = useMutation(EDIT_SELLER, {
    onCompleted: () => {
      setEditModal(false);
      refetch();
      toast.success(`${dataEdit.updateSeller.companyName} is updated successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  if (errorEdit) {
    console.log(`EDIT_SELLER : ${errorEdit.message}`);
  }

  const handleSave = async () => {
    await editSeller({
      variables: {
        updateSellerId: id,
        companyName: company,
        gstin: gst,
        fullAddress: faddress,
        city: citys,
        state: states,
        pincode: pincodes,
        companyDescription: desc,
        mobileNo: phone,
        email: mail,
        bill: bil,
      },
    });
  };

  function handleEdit(event, event2, event3, event4, event5, event6, event7, event8, event9, event10) {
    setEditModal(true);
    setCompany(event);
    setDesc(event2);
    setPhone(event3);
    setMail(event4);
    setGST(event5);
    setfAddress(event6);
    setCitys(event7);
    setStates(event8);
    setPincodes(event9);
    setBil(event10);
  }

  const { data: dataSellProd } = useQuery(GETPRODUCTSBYSELLER, {
    variables: {
      sellerId: id,
    },
    onError: (err) => {
      console.error('GETPRODUCTSBYSELLER', err.message);
    },
  });

  // Define a function or variable before JSX
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-uppercase';
      case 'packed':
        return 'bg-secondary text-uppercase';
      case 'shipped':
        return 'bg-info text-uppercase';
      case 'delivered':
        return 'bg-success text-uppercase';
      case 'cancelled':
        return 'bg-danger text-uppercase';
      default:
        return 'bg-outline-tertiary text-uppercase';
    }
  };

  const [expanded, setExpanded] = useState(false);
  const descriptions = data?.getSeller?.companyDescription || 'No description available.';

  /* ================ Display BA data ====================== */
  const [getBAallDa, { data: DAdata }] = useLazyQuery(GETBAALLDA, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (id) {
      getBAallDa({
        variables: { baId: id },
      });
    }
  }, [id, getBAallDa]);

  const ba = DAdata?.getBAallDa;

  /* ================ DA STATUS UPDATE ====================== */

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState(null);
  const [selectedBaId, setSelectedBaId] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyDetailModal, setShowCompanyDetailModal] = useState(false);

  const [daApproveByPortalAdmin, { loading: approveLoading }] = useMutation(DA_APPROVE_BY_PORTAL_ADMIN, {
    refetchQueries: ['GetBAallDa'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast.success('Dealer Associate Approved Successfully');
      setShowApproveModal(false);
    },
    onError: (err) => {
      console.error(err.message);
    },
  });

  const handleApprove = (dealerIda, baidss) => {
    daApproveByPortalAdmin({
      variables: {
        sellerid: dealerIda,
        baId: baidss,
      },
    });
  };

  return (
    <>
      {data && (
        <>
          <HtmlHead title={title} description={description} />
          <div className="page-title-container mb-2">
            <Row className="g-0">
              <Col className="col-auto mb-3 mb-sm-0 me-auto">
                <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
                  <span className="align-middle text-dark ms-1">Dashboard</span>
                </NavLink>
                <span className="text-dark text-small ps-2"> / </span>
                <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/associate/business">
                  <span className="align-middle text-dark ms-1">BA</span>
                </NavLink>
                <span className="text-dark text-small ps-2"> / </span>
                <span className="text-dark ps-2 pt-3"> BA Details</span>
              </Col>
            </Row>
          </div>
          <Row className="m-0 mb-3 p-1 rounded bg-white align-items-center">
            <Col md="6">
              <span className="fw-bold fs-5 ps-2 pt-2">{title}</span>
            </Col>
          </Row>
          <Row>
            <Col xl="4">
              <Card className="mb-5">
                <Card.Body className="mb-n5 p-3">
                  <div className="d-flex align-items-center flex-column">
                    <div className="mb-5 d-flex align-items-center flex-column">
                      <div className="sw-6 sh-6 mb-3 d-inline-block bg-primary d-flex justify-content-center align-items-center rounded-xl">
                        <div className="text-white">
                          <CsLineIcons icon="user" />
                        </div>
                      </div>
                      <div className="h5 mb-1">{data.getSeller.companyName}</div>
                      <div className="text-dark">
                        <CsLineIcons icon="pin" className="me-1" />
                        <span className="align-middle">{`${data.getSeller.city}, ${data.getSeller.state}`}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h4 className="mb-2 fs-6 pb-2 fw-bold text-dark border-bottom">Profile Details</h4>
                    {[
                      { label: 'Name', value: data.getSeller.user.firstName },
                      { label: 'Mobile Number', value: data.getSeller.user.mobileNo },
                      { label: 'Email', value: data.getSeller.user.email },
                    ].map((item, i) => (
                      <div key={i} className="mb-1">
                        <strong>{item.label}: </strong> {item.value || 'N/A'}
                      </div>
                    ))}
                  </div>
                  <div className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-2 border-bottom pb-1">
                      <h4 className="fs-6 fw-bold text-dark mb-0">BA Information</h4>

                      <Button
                        className="text-primary bg-white btn btn-sm"
                        onClick={() =>
                          handleEdit(
                            data.getSeller.companyName,
                            data.getSeller.companyDescription,
                            data.getSeller.mobileNo,
                            data.getSeller.email,
                            data.getSeller.gstin,
                            data.getSeller.fullAddress,
                            data.getSeller.city,
                            data.getSeller.state,
                            data.getSeller.pincode,
                            data.getSeller.bill
                          )
                        }
                      >
                        ✏️
                      </Button>
                    </div>

                    {[
                      { label: 'BA Name', value: data.getSeller.companyName },
                      { label: 'Mobile Number', value: data?.getSeller?.mobileNo },
                      { label: 'Email', value: data.getSeller.email },
                      { label: 'GST Number', value: data.getSeller.gstin },
                      { label: 'PAN Number', value: data.getSeller.pancardNo },
                    ]
                      .filter((item) => item.value)
                      .map((item, i) => (
                        <div key={i} className="mb-1">
                          <strong>{item.label}: </strong> {item.value || 'N/A'}
                        </div>
                      ))}

                    <div className="mb-1">
                      <strong>Address:</strong>{' '}
                      {`${data.getSeller.fullAddress || ''}, ${data.getSeller.city || ''}, ${data.getSeller.state || ''} - ${data.getSeller.pincode || ''}` ||
                        'N/A'}
                    </div>

                    <div className="mb-1">
                      <strong>BA Description:</strong>
                      <div
                        style={{
                          overflow: expanded ? 'visible' : 'hidden',
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: expanded ? 'unset' : 2,
                          whiteSpace: 'pre-line',
                          marginTop: '4px',
                        }}
                      >
                        {descriptions}
                      </div>

                      {descriptions?.length > 100 && (
                        <button type="button" className="btn btn-link p-0 mt-1" onClick={() => setExpanded(!expanded)}>
                          {expanded ? 'View Less' : 'View More'}
                        </button>
                      )}
                    </div>
                    <div className="mb-1 mt-3">
                      <div>
                        <h4 className="mb-2 fs-6 fw-bold text-dark border-bottom pb-2">Dealer Associate Lists</h4>
                        <div>
                          {loading && <div>Loading...</div>}

                          {!loading &&
                            Array.isArray(ba) &&
                            ba.map((item, index) => {
                              const allottedEntry = item.allotted?.find((a) => a.baId === id);

                              let statusSymbol = '';
                              let baidss = '';
                              let dealerIda = '';

                              if (allottedEntry) {
                                baidss = allottedEntry.baId;
                                dealerIda = allottedEntry.dealerId;

                                if (allottedEntry.dastatus) {
                                  statusSymbol = '✅';
                                }
                              }

                              return (
                                <div key={index}>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div
                                      className="fw-semibold text-primary pt-1 pb-1"
                                      style={{ cursor: 'pointer' }}
                                      onClick={() => {
                                        setSelectedCompany(item);
                                        setShowCompanyDetailModal(true);
                                      }}
                                    >
                                      {index + 1}. {item.companyName}
                                    </div>

                                    <div className="d-flex align-items-center gap-2">
                                      {!allottedEntry?.dastatus && (
                                        <Button
                                          className="btn btn-sm btn-white p-0"
                                          disabled={approveLoading}
                                          onClick={() => {
                                            setSelectedDealerId(dealerIda);
                                            setSelectedBaId(baidss);
                                            setSelectedCompany(item);
                                            setShowApproveModal(true);
                                          }}
                                        >
                                          ✏️
                                        </Button>
                                      )}
                                      <span>{statusSymbol}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xl="8">
              <div className="d-flex justify-content-between border rounded bg-primary">
                {orderData?.getOrderBySellerId?.length > 0 ? (
                  <>
                    <span className="fw-bold text-white p-2 ps-3">Recent Orders </span>
                    <Button
                      onClick={() => {
                        history.push(`/admin/seller/orderlist/${id}`);
                      }}
                      variant=""
                      size="xs"
                      className="btn-icon btn-icon-end p-0  btn pt-2 px-2  btn-xs"
                    >
                      <span className="align-bottom">View All</span> <CsLineIcons icon="chevron-right" className="align-middle" size="12" />
                    </Button>
                  </>
                ) : (
                  <h4 className="border p-4 w-100 text-center rounded bg-white">No orders</h4>
                )}
              </div>
              <div className="mb-5">
                {orderData &&
                  orderData?.getOrderBySellerId
                    .slice(0)
                    .reverse()
                    .map(
                      (order, index) =>
                        index < 4 && (
                          <Card key={index} className="mb-2">
                            <Card.Body className="sh-16 sh-md-8 py-0">
                              <Row className="g-0 h-100 align-content-center">
                                <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 h-md-100">
                                  <div className="text-dark text-small d-md-none">Id</div>
                                  <NavLink to={`/admin/seller/${id}/orderdetail/${order.id}`} className="text-truncate h-100 d-flex align-items-center">
                                    <span maxLength={2}>{order.id.substring(0, 12)}...</span>
                                  </NavLink>
                                </Col>
                                <Col xs="6" md="2" className="d-flex flex-column justify-content-center mb-2 mb-md-0">
                                  <div className="text-dark text-small d-md-none">Total Amount</div>
                                  <div className="">
                                    <span>
                                      <span className="text-small">₹ </span>
                                      {order.totalAmount}
                                    </span>
                                  </div>
                                </Col>
                                <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0">
                                  <div className="text-dark text-small d-md-none">Date</div>
                                  <div className="">{moment(parseInt(order.createdAt, 10)).format('LL')}</div>
                                </Col>
                                <Col xs="6" md="3" className="d-flex flex-column justify-content-center mb-2 mb-md-0 align-items-md-end">
                                  <div className="text-dark text-small d-md-none">Status</div>
                                  <Badge className={getStatusBadgeClass(order?.status)}>{order?.status}</Badge>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        )
                    )}
              </div>

              <div className="d-flex justify-content-between border rounded bg-primary">
                {dataSellProd?.getProductBySeller?.length > 0 ? (
                  <>
                    <span className="fw-bold text-white p-2 ps-3">Individual Products ({dataSellProd.getProductBySeller.length})</span>
                    <Button
                      onClick={() => {
                        history.push(`/admin/seller/product_list/${id}`);
                      }}
                      variant=""
                      size="xs"
                      className="btn-icon btn-icon-end p-0  btn pt-2 px-2  btn-xs btn btn-xs"
                    >
                      <span className="align-bottom">View All</span> <CsLineIcons icon="chevron-right" className="align-middle" size="12" />
                    </Button>
                  </>
                ) : (
                  <h4 className="border p-4 w-100 text-center rounded bg-white">No individual products from this seller</h4>
                )}
              </div>
              {dataSellProd && dataSellProd.getProductBySeller.length > 0 && (
                <Row className="row row-cols-2 row-cols-md-3 g-3">
                  {dataSellProd?.getProductBySeller?.map(
                    (items, index) =>
                      index < 6 && (
                        <Col key={items.id} className="d-flex justify-content-center">
                          <Card className="hover-border-primary home w-100">
                            <DiscountBadge variant={items.variant[0]} name={items.previewName} />
                            <div className="text-center">
                              <img
                                src={items.thumbnail || (items.images && items.images[0])}
                                alt={items.previewName || 'product image'}
                                className="img-fluid p-2"
                              />
                            </div>
                            <Card.Body className="text-center py-2 px-3">
                              <NavLink
                                style={{ fontWeight: 'bold' }}
                                to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                                className="body-link stretched-link d-block"
                              >
                                {items.previewName || items.fullName}
                              </NavLink>
                              {items.variant?.length > 0 && (
                                <div className="card-text my-2" style={{ fontWeight: 'bold' }}>
                                  <PriceComponent variant={items.variant[0]} name={items.previewName} />
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      )
                  )}
                </Row>
              )}
            </Col>
          </Row>

          {/* Seller Details Block End */}

          {/* Seller Edit Modal Start */}
          <Modal className="scroll-out-negative" show={editModal} onHide={() => setEditModal(false)} scrollable dialogClassName="full">
            <Modal.Header closeButton className="p-3">
              <Modal.Title as="h4" className="fw-bold">
                Seller Information
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">
              <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
                <Form>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">BA Name</Form.Label>
                    <Form.Control type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">BA Description</Form.Label>
                    <Form.Control type="text" as="textarea" value={desc} onChange={(e) => setDesc(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Email</Form.Label>
                    <Form.Control type="text" value={mail} onChange={(e) => setMail(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Mobile no.</Form.Label>
                    <Form.Control
                      type="tel"
                      onKeyDown={(e) => {
                        if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                          e.preventDefault();
                        }
                      }}
                      maxLength="10"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">GST No.</Form.Label>
                    <Form.Control
                      type="text"
                      onKeyPress={(e) => {
                        const { key } = e;
                        if (!/^[0-9a-zA-Z]*$/.test(key)) {
                          e.preventDefault();
                        }
                      }}
                      name="gst"
                      maxLength="15"
                      value={gst}
                      onChange={(e) => setGST(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Address</Form.Label>
                    <Form.Control type="text" name="address" value={faddress} onChange={(e) => setfAddress(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">City</Form.Label>
                    <Form.Control type="text" name="city" value={citys} onChange={(e) => setCitys(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Pincode</Form.Label>
                    <Form.Control
                      type="text"
                      onKeyDown={(e) => {
                        if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                          e.preventDefault();
                        }
                      }}
                      maxLength="6"
                      name="pincode"
                      value={pincodes}
                      onChange={(e) => setPincodes(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">State</Form.Label>
                    <Form.Select name="state" onChange={(e) => setStates(e.target.value)} value={states} aria-label="Default select example">
                      <option hidden>Select State</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
                      <option value="Daman and Diu">Daman and Diu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Puducherry">Puducherry</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </Form.Select>
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Bill Format</Form.Label>
                    <Form.Control type="text" value={bil} onChange={(e) => setBil(e.target.value)} />
                  </div>
                </Form>
              </OverlayScrollbarsComponent>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => handleSave()}>
                <span>Save</span>
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Dealer Approval Modal Start */}
          <Modal show={showApproveModal} onHide={() => setShowApproveModal(false)} centered>
            <Modal.Header closeButton className="p-3">
              <Modal.Title className="fw-bold">Confirm DA Approval</Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3">
              {selectedCompany && (
                <>
                  <div className="row g-2">
                    <div className="col-md-12 text-dark fw-bold">{selectedCompany.companyName}</div>
                    <div className="col-md-6">
                      <strong>Email:</strong> {selectedCompany.email}
                    </div>
                    <div className="col-md-6">
                      <strong>Mobile:</strong> {selectedCompany.mobileNo}
                    </div>
                    <div className="col-md-6">
                      <strong>GSTIN:</strong> {selectedCompany.gstin}
                    </div>
                    <div className="col-12">
                      <strong>Address:</strong> {selectedCompany.fullAddress}, {selectedCompany.state}, {selectedCompany.city}, {selectedCompany.pincode}
                    </div>
                    <div className="col-12 border-top pt-2 text-end">Are you sure you want to approve this dealer?</div>
                  </div>
                </>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowApproveModal(false)}>
                No
              </Button>

              <Button variant="success" disabled={approveLoading} onClick={() => handleApprove(selectedDealerId, selectedBaId)}>
                {approveLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Approving...
                  </>
                ) : (
                  'Yes'
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Dealer Details Modal Start */}
          <Modal show={showCompanyDetailModal} onHide={() => setShowCompanyDetailModal(false)} centered size="lg">
            <Modal.Header closeButton className="p-3">
              <Modal.Title className="fw-bold">Dealer Associate Details</Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3">
              {selectedCompany && (
                <>
                  <h5 className="text-dark fw-bold mb-2">{selectedCompany.companyName}</h5>

                  <p className="text-muted">
                    <strong>DA Description: </strong> {selectedCompany.companyDescription || '—'}
                  </p>

                  <div className="row g-2">
                    <div className="col-md-6">
                      <strong>Email:</strong> {selectedCompany.email}
                    </div>
                    <div className="col-md-6">
                      <strong>Mobile:</strong> {selectedCompany.mobileNo}
                    </div>
                    <div className="col-md-6">
                      <strong>GSTIN:</strong> {selectedCompany.gstin}
                    </div>
                    <div className="col-md-6">
                      <strong>City:</strong> {selectedCompany.city}
                    </div>
                    <div className="col-md-6">
                      <strong>State:</strong> {selectedCompany.state}
                    </div>
                    <div className="col-md-6">
                      <strong>Pincode:</strong> {selectedCompany.pincode}
                    </div>
                    <div className="col-12">
                      <strong>Address:</strong> {selectedCompany.fullAddress}
                    </div>
                  </div>
                </>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCompanyDetailModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </>
  );
}
export default DetailSeller;
