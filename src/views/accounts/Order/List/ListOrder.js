import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Form, Row, Tab, Tabs, Col, Card, Badge, Table, Pagination, Spinner } from 'react-bootstrap';
import moment from 'moment';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useLazyQuery, gql } from '@apollo/client';

const GET_ALL_ORDERS = gql`
  query GetAllOrder($sortOrder: String, $sortBy: String, $limit: Int, $offset: Int) {
    getAllOrder(sortOrder: $sortOrder, sortBy: $sortBy, limit: $limit, offset: $offset) {
      id
      createdAt
      user {
        firstName
        lastName
        email
      }
      billingAddress {
        firstName
        lastName
      }
      paymentMethod
      totalAmount
      status
      onlinepaymentStatus
      paymentStatus
    }
  }
`;

const ListOrder = () => {
  const title = 'Orders List';
  const dispatch = useDispatch();
  /* eslint-disable no-shadow */
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(200);
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('createdAt');

  const [getAllOrder, { data, loading, refetch }] = useLazyQuery(GET_ALL_ORDERS, {
    variables: { sortOrder, sortBy, limit, offset },
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data) {
        setOrders(data.getAllOrder);
      }
    },
    onError: (error) => {
      console.log('Error!!!', error.message);
    },
  });

  useEffect(() => {
    refetch();
  }, [limit, offset, sortOrder, sortBy, refetch]);

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order?.billingAddress?.firstName} ${order?.billingAddress?.lastName}`.toLowerCase();
    return (
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      fullName.includes(search.toLowerCase()) ||
      moment(parseInt(order.createdAt, 10)).format('LL').toLowerCase().includes(search.toLowerCase()) ||
      order.totalAmount.toString().includes(search)
    );
  });

  const handleSearch = () => {};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSort = (event) => {
    setSortBy(event);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    getAllOrder({
      variables: {
        limit,
        offset,
        sortBy,
        sortOrder,
      },
    });
  };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
  };

  const getBadgeClass = (status, paymentStatus) => {
    if (paymentStatus === 'failed') {
      return 'bg-danger';
    }
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'packed':
        return 'bg-dark';
      case 'shipped':
        return 'bg-info';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };
  const getPaymentStatus = (order) => {
    let statusText = '';
    if (order.paymentMethod === 'ONLINE') {
      statusText = order.onlinepaymentStatus;
    } else if (order.paymentMethod === 'DMT') {
      statusText = order.paymentStatus;
    }
    if (!statusText) return '';

    const normalized = statusText.toLowerCase();
    if (normalized === 'failure') return '❌ FAILED';
    if (normalized === 'failed') return '❌ FAILED';
    if (normalized === 'complet' || normalized === 'complete' || normalized === 'completed') return '✅ SUCCESS';
    if (normalized === 'success') return '✅ SUCCESS';
    if (normalized === 'pending') return '⏳ PENDING';
    return statusText.toUpperCase();
  };

  return (
    <>
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/accounts/dashboard">
              <span className="align-middle text-dark ms-1">Accounts Dashboard</span>
            </NavLink>
            <span className="text-dark ps-2"> / </span>
            <span className="align-middle text-dark ms-1">Orders List</span>
          </Col>
        </Row>
      </div>
      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="6">
          <span className="fw-bold fs-5 ps-2 pt-2">Order List</span>
          <span className="small ps-2">{filteredOrders ? `(${filteredOrders.length})` : ''}</span>
        </Col>
        <Col md="6">
          <div className="input-group shadow-sm rounded border bg-light">
            <span className="input-group-text bg-white border-0">
              <CsLineIcons icon="search" className="text-muted" />
            </span>
            <Form.Control
              id="userSearch"
              type="text"
              placeholder="Search by Order Id, Customer Name, Order Date and Amount"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </Col>
      </Row>
      <Tabs defaultActiveKey="online_orders" id="justify-tab-example" className="mb-3" justify>
        <Tab eventKey="online_orders">
          <div className="table-responsive">
            <Table bordered hover className="align-middle bg-white">
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th>Customer Name</th>
                  <th>Order Date</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <Spinner animation="border" variant="primary" />
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order, index) => (
                        <tr key={index}>
                          <td>
                            <NavLink to={`detail/${order.id}`}>{order.id}</NavLink>
                          </td>
                          <td>
                            {order?.billingAddress?.firstName} {order?.billingAddress?.lastName}
                          </td>
                          <td>{moment(parseInt(order?.createdAt, 10)).format('LL')}</td>
                          <td>₹ {order?.totalAmount}</td>
                          <td>{order.paymentMethod}</td>
                          <td>{getPaymentStatus(order)}</td>
                          <td>
                            <Badge className={`text-uppercase ${getBadgeClass(order.status, order.paymentStatus)}`}>{order.status}</Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          Order Not Found
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </Table>
          </div>
        </Tab>
      </Tabs>

      <div className="d-flex justify-content-center mt-5">
        <Pagination>
          <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
            <CsLineIcons icon="chevron-left" />
          </Pagination.Prev>
          <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={orders.length < limit}>
            <CsLineIcons icon="chevron-right" />
          </Pagination.Next>
        </Pagination>
      </div>
    </>
  );
};

export default ListOrder;
