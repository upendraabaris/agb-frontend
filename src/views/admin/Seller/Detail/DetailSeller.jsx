import { React, useEffect, useState } from 'react';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';
import { Button, Modal, Form, Row, Col, Card, Tooltip, OverlayTrigger, Badge, Table } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import DiscountBadge from 'views/storefront/home/DiscountBadge';
import PriceComponent from 'views/storefront/home/PriceComponent';
import moment from 'moment';
import { useAsyncDebounce } from 'react-table';

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
        dealerId
        pincode
        state
      }
      review {
        id
        description
        userRating
        customerName
        ratingDate
        sellerReply
        sellerReplyDate
        adminReply
        adminReplyDate
      }
      overallrating
    }
  }
`;

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

const DELETE_SELLER = gql`
  mutation DeleteSeller($deleteSellerId: ID!) {
    deleteSeller(id: $deleteSellerId) {
      companyName
      companyDescription
      mobileNo
      email
      gstin
      address
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

const GET_SERIES_PRODUCT_BY_SELLER = gql`
  query GetSeriesProductBySeller($sellerId: ID!) {
    getSeriesProductBySeller(seller_id: $sellerId) {
      id
      identifier
      sku
      seriesType
      seriesvariant {
        serieslocation {
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
          finalPrice
          b2cdiscount
          b2bdiscount
        }
        variantName
        moq
      }
      faq {
        question
        answer
      }
      brand_name
      previewName
      fullName
      thumbnail
      images
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

const SUPER_SELLER = gql`
  mutation ApproveSuperSeller($sellerid: ID, $superSellerId: ID) {
    approveSuperSeller(sellerid: $sellerid, superSellerID: $superSellerId) {
      id
      superSellerId
    }
  }
`;

function DetailSeller() {
  const title = 'Seller Associate';
  const description = 'Seller Associate';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { id } = useParams();
  const history = useHistory();
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
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [superSellerModalView, setSuperSellerModalView] = useState(false);
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
  const [approveSuperSeller] = useMutation(SUPER_SELLER, {
    onCompleted: () => {
      setSuperSellerModalView(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });
  useEffect(() => {
    GetSuperSellerList();
    dispatch(menuChangeUseSidebar(true));
  }, [GetSuperSellerList, dispatch]);
  const handleSuperSeller = () => {
    setSuperSellerModalView(true);
  };
  const [loading, setLoading] = useState(false);
  const superSellerConfirmed = async () => {
    if (!superSellerId) {
      toast.error('Please select a Super Seller.');
      return;
    }

    setLoading(true);
    try {
      await approveSuperSeller({
        variables: {
          sellerid: id,
          superSellerId,
        },
      });
      toast.success('Super Seller approved successfully!');
    } catch (error) {
      toast.error(error.message || 'Something went wrong!');
    } finally {
      setLoading(false);
      setSuperSellerModalView(false);
    }
  };
  const [GetSeller, { data, refetch }] = useLazyQuery(GET_SELLER, {
    variables: {
      getSellerId: id,
    },
    onCompleted: (response) => {
      console.log('✅ GET_SELLER Response:');
    },
    onError: (error) => {
      console.error('❌ GET_SELLER Error:', error.message);
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
  const [deleteSeller, res] = useMutation(DELETE_SELLER, {
    onCompleted: () => {
      setDeleteModalView(false);
      toast(`${res.data.deleteSeller.companyName} is removed from database.!`);
      setTimeout(() => {
        history.push('/admin/seller/list');
      }, 2000);
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const handleDelete = async () => {
    setDeleteModalView(true);
  };

  const deleteSellerConfirmed = async () => {
    if (id) {
      await deleteSeller({
        variables: {
          deleteSellerId: id,
        },
      });
    } else {
      toast.error('something went wrong in deleteCategory!');
    }
  };

  const { data: dataSellProd } = useQuery(GETPRODUCTSBYSELLER, {
    variables: {
      sellerId: id,
    },
    onError: (err) => {
      console.error('GETPRODUCTSBYSELLER', err.message);
    },
  });
  const { data: dataSellProdSeries } = useQuery(GET_SERIES_PRODUCT_BY_SELLER, {
    variables: {
      sellerId: id,
    },
    onError: (error) => {
      console.log('GET_SERIES_PRODUCT_BY_SELLER', error.message);
    },
  });

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

  return (
    <>
      {data && (
        <>
          <HtmlHead title={title} description={description} />
          <div className="page-title-container mb-3">
            <nav className="breadcrumb bg-transparent p-0 m-0">
              <button type="button" className="btn btn-link p-0 text-decoration-none text-dark" onClick={() => window.history.back()}>
                Back
              </button>
              <span className="mx-2 text-muted">/</span>
              <span className="fw-semibold text-dark breadcrumb-item active" aria-current="page">
                {title}
              </span>
            </nav>
          </div>
          <Row>
            <Col xl="4">
              <Row className="m-0 mb-3 p-1 rounded bg-white align-items-center">
                <Col>
                  <span className="fw-bold fs-5 ps-2 pt-2">{title}</span>
                </Col>
              </Row>
              <Card className="mb-5">
                <Card.Body className="mb-n5 p-3">
                  <div className="d-flex align-items-center flex-column mb-5">
                    <div className="mb-5 d-flex align-items-center flex-column">
                      <div className="sw-6 sh-6 mb-3 d-inline-block bg-primary d-flex justify-content-center align-items-center rounded-xl">
                        <div className="text-white">
                          <CsLineIcons icon="user" />
                        </div>
                      </div>
                      <div className="mb-1 fs-6 fw-bold">{data.getSeller.companyName}</div>
                      <div className="text-dark">
                        <CsLineIcons icon="pin" className="me-1" />
                        <span className="align-middle">{`${data.getSeller.city}, ${data.getSeller.state}`}</span>
                      </div>
                    </div>
                    <div className="d-flex flex-row justify-content-between w-100 w-sm-50 w-xl-100">
                      <Button
                        variant="outline-primary"
                        className="w-100 me-2"
                        onClick={() => {
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
                          );
                        }}
                      >
                        Edit Seller
                      </Button>
                      <Button variant="outline-primary" className="w-100" onClick={() => handleDelete()}>
                        Delete Seller
                      </Button>
                    </div>
                    <div className="d-flex mt-2 flex-row justify-content-center w-100 w-sm-50 w-xl-100">
                      <Button onClick={() => history.push(`${id}/commission`)} variant="outline-primary" className="w-100">
                        Seller Commission{' '}
                      </Button>
                      <Button variant="outline-primary" className="w-100" onClick={() => handleSuperSeller()}>
                        Dealer Associate Apporve
                      </Button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <h4 className="mb-2 fs-6 fw-bold text-dark">Customer Information</h4>
                    <div className="mb-1">
                      <div>
                        <strong>Name: </strong> {data.getSeller.user.firstName || 'N/A'}
                      </div>
                    </div>
                    <div className="mb-1">
                      <div>
                        <strong>Mobile Number: </strong> {data.getSeller.user.mobileNo || 'N/A'}
                      </div>
                    </div>
                    <div className="mb-1">
                      <div>
                        <strong>Email:</strong> {data.getSeller.user.email || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="mb-5">
                    <h4 className="mb-2 fs-6 fw-bold text-dark">Seller Information</h4>
                    <div className="mb-1">
                      <div>
                        <strong>Seller Name: </strong> {data.getSeller.companyName || 'N/A'}
                      </div>
                    </div>
                    <div className="mb-1">
                      <div>
                        <strong>Mobile Number: </strong> {data?.getSeller?.mobileNo || 'N/A'}
                      </div>
                    </div>
                    <div className="mb-1">
                      <div>
                        <strong>Email:</strong> {data.getSeller.email || 'N/A'}
                      </div>
                    </div>
                    {data.getSeller.gstin && (
                      <div className="mb-1">
                        <div>
                          <strong>GST Number:</strong> {data.getSeller.gstin}
                        </div>
                      </div>
                    )}
                    {data.getSeller.pancardNo && (
                      <div className="mb-1">
                        <div>
                          <strong>PAN Number:</strong> {data.getSeller.pancardNo}
                        </div>
                      </div>
                    )}
                    <div className="mb-1">
                      <div>
                        {' '}
                        <strong>Address:</strong>
                        {` ${data.getSeller.fullAddress || ''}, ${data.getSeller.city || ''}, ${data.getSeller.state || ''} - ${
                          data.getSeller.pincode || ''
                        }` || 'N/A'}
                      </div>
                    </div>
                    <div className="mb-1">
                      <div>
                        <strong>Bill Format:</strong> {data.getSeller.bill || 'N/A'}
                      </div>
                    </div>
                    <div className="mb-1">
                      <div>
                        <strong>Seller Description:</strong> {data.getSeller.companyDescription || 'No description available.'}
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
                    <span className="fw-bold text-white p-2 ps-3">Seller Orders </span>
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
                  <h4 className="border p-4 w-100 text-center rounded bg-white">No orders found</h4>
                )}
              </div>
              <div className="m-0">
                <Table striped bordered hover responsive className="align-middle">
                  <tbody>
                    {orderData &&
                      orderData?.getOrderBySellerId
                        .slice(0)
                        .reverse()
                        .slice(0, 3)
                        .map((order, index) => (
                          <tr key={index}>
                            <td>
                              <NavLink
                                to={`/admin/seller/${id}/orderdetail/${order.id}`}
                                className="text-truncate d-inline-block"
                                style={{ maxWidth: '150px' }}
                              >
                                {order.id.substring(0, 12)}...
                              </NavLink>
                            </td>
                            <td>
                              <span className="text-small">₹ </span>
                              {order.totalAmount}
                            </td>
                            <td>{moment(parseInt(order.createdAt, 10)).format('DD-MMM-yyyy')}</td>
                            <td className="text-end">
                              <Badge className={getStatusBadgeClass(order?.status)}>{order?.status}</Badge>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-between border rounded bg-primary">
                {orderData?.getOrderBySellerId?.length > 0 ? (
                  <>
                    <span className="fw-bold text-white p-2 ps-3">Seller Reviews </span>
                    <Button
                      onClick={() => {
                        history.push(`/admin/seller/reviewdetail/${id}`);
                      }}
                      variant=""
                      size="xs"
                      className="btn-icon btn-icon-end p-0  btn pt-2 px-2  btn-xs"
                    >
                      <span className="align-bottom">View All</span> <CsLineIcons icon="chevron-right" className="align-middle" size="12" />
                    </Button>
                  </>
                ) : (
                  <h4 className="border p-4 w-100 text-center rounded bg-white">No reviews found</h4>
                )}
              </div>

              <div className="border rounde">
                {data.getSeller.review && data.getSeller.review.length > 0 ? (
                  <Table responsive bordered hover className="align-middle shadow-sm rounded table-sm">
                    <tbody>
                      {data.getSeller.review
                        .slice(-3)
                        .reverse()
                        .map((item) => (
                          <tr key={item.id} className="table-row-hover">
                            <td className="text-truncate" style={{ maxWidth: '150px' }}>
                              <strong>{item.customerName || 'Unknown'}</strong>
                            </td>
                            <td className="text-center" style={{ width: '80px' }}>
                              <span className="text-success">
                                {'★'.repeat(Math.floor(item.userRating))}
                                {'☆'.repeat(5 - Math.floor(item.userRating))}
                                <span className="ms-1 text-dark">({item.userRating})</span>
                              </span>
                            </td>
                            <td className="text-truncate" style={{ maxWidth: '250px' }}>
                              {item.description}
                            </td>
                            <td className="text-end" style={{ width: '130px' }}>
                              {item.ratingDate}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                ) : (
                  ' '
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
                <Table responsive bordered hover className="align-middle shadow-sm rounded table-sm">
                  <tbody>
                    {dataSellProd?.getProductBySeller?.slice(0, 3).map((items) => (
                      <tr key={items.id} className="table-row-hover">
                        <td className="p-2 text-center" style={{ width: '60px' }}>
                          <img
                            src={items.thumbnail || (items.images && items.images[0])}
                            alt={items.previewName || 'product image'}
                            className="img-fluid"
                            style={{
                              maxHeight: '30px',
                              width: 'auto',
                              objectFit: 'contain',
                            }}
                          />
                        </td>
                        <td className="text-truncate" style={{ maxWidth: '200px' }}>
                          {items.previewName || items.fullName}
                        </td>
                        <td>{items.variant?.length > 0 && <PriceComponent variant={items.variant[0]} name={items.previewName} />}</td>
                        <td className="text-end">
                          <NavLink
                            to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                            target="_blank"
                            className="btn btn-primary btn-sm text-white"
                          >
                            View
                          </NavLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}

              <div className="d-flex justify-content-between border rounded bg-primary">
                {dataSellProdSeries?.getSeriesProductBySeller?.length > 0 ? (
                  <>
                    <span className="fw-bold text-white p-2 ps-3">Series Products ({dataSellProdSeries.getSeriesProductBySeller.length})</span>
                    <Button
                      onClick={() => history.push(`/admin/seller/series_list/${id}`)}
                      variant=""
                      size="xs"
                      className="btn-icon btn-icon-end p-0 btn pt-1 px-2 btn-xs"
                    >
                      <span className="text-white align-bottom">View All</span>
                      <CsLineIcons icon="chevron-right" className="align-middle ms-1 text-white" size="12" />
                    </Button>
                  </>
                ) : (
                  <h4 className="border p-4 w-100 text-center rounded bg-white mt-3">No series products found</h4>
                )}
              </div>

              {dataSellProdSeries && dataSellProdSeries.getSeriesProductBySeller.length > 0 && (
                <Table responsive bordered hover className="align-middle shadow-sm rounded table-sm">
                  <tbody>
                    {dataSellProdSeries?.getSeriesProductBySeller?.slice(0, 3).map((items) => (
                      <tr key={items.id} className="table-row-hover">
                        {/* Image */}
                        <td className="p-2 text-center" style={{ width: '60px' }}>
                          <img
                            src={items.thumbnail || (items.images && items.images[0])}
                            alt="product"
                            className="img-fluid"
                            style={{
                              maxHeight: '30px',
                              objectFit: 'contain',
                            }}
                          />
                        </td>

                        {/* Product Name */}
                        <td className="text-truncate" style={{ maxWidth: '200px', fontWeight: '600' }}>
                          <NavLink to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`} className="body-link text-decoration-none">
                            {items.previewName || items.fullName}
                          </NavLink>
                        </td>

                        {/* VIEW PRICE */}
                        <td style={{ fontWeight: '700' }}>VIEW PRICE</td>

                        {/* View Button */}
                        <td className="text-end">
                          <NavLink
                            to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                            target="_blank"
                            className="btn btn-primary btn-sm text-white"
                          >
                            View
                          </NavLink>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Col>
          </Row>

          {/* Seller Details Block End */}

          {/* Seller Edit Modal Start */}
          <Modal className="scroll-out-negative" show={editModal} onHide={() => setEditModal(false)} scrollable dialogClassName="full">
            <Modal.Header closeButton>
              <Modal.Title as="h4" className="fw-bold">
                Seller Information
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
                <Form>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Seller Name</Form.Label>
                    <Form.Control type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Seller Description</Form.Label>
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
                        // Allow only alphanumeric characters
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
          {/* Seller Edit Modal End */}

          {/* delete category modal starts */}
          <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold text-dark">Delete Seller</Modal.Title>
            </Modal.Header>
            {data.getSeller.companyName && <Modal.Body>Are you sure you want to delete {data.getSeller.companyName}?</Modal.Body>}
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
                No, Go Back
              </Button>
              <Button variant="primary" onClick={() => deleteSellerConfirmed()}>
                Yes, Continue
              </Button>
            </Modal.Footer>
          </Modal>
          {/* delete category modal ends */}

          {/* Super Seller modal starts */}
          <Modal show={superSellerModalView} onHide={() => setSuperSellerModalView(false)}>
            <Modal.Header className="p-2 ps-4" closeButton>
              <Modal.Title className="fw-bold p-2">Dealer Associate Approve</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="superSellerSelect">
                <Form.Label className="fw-bold text-dark">Select BA Name</Form.Label>
                <Form.Control as="select" onChange={(e) => setSuperSellerId(e.target.value)}>
                  <option value="">Choose...</option>
                  {superSellers.length > 0 ? (
                    superSellers.map((superSeller) =>
                      superSeller.seller ? (
                        <option key={superSeller.id} value={superSeller.id}>
                          {superSeller.seller.companyName}
                        </option>
                      ) : null
                    )
                  ) : (
                    <option disabled>No Super Sellers available</option>
                  )}
                </Form.Control>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSuperSellerModalView(false)}>
                No
              </Button>
              <Button variant="primary" onClick={superSellerConfirmed} disabled={loading}>
                Yes
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Super Seller modal ends */}
        </>
      )}
    </>
  );
}
export default DetailSeller;
