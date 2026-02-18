import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Form, Row, Tab, Tabs, Col, Badge, Table, Spinner, InputGroup, Button } from 'react-bootstrap';
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
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100); // Default to 100
  const [sortOrder] = useState('desc');
  const [sortBy] = useState('createdAt');
  const [hasMore, setHasMore] = useState(true);

  const [getAllOrder, { loading }] = useLazyQuery(GET_ALL_ORDERS, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getAllOrder) {
        if (offset === 0) {
          setOrders(data.getAllOrder);
        } else {
          setOrders((prev) => [...prev, ...data.getAllOrder]);
        }
        // Check if there are more results
        if (data.getAllOrder.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    },
    onError: (error) => {
      console.error('Error!!!', error.message);
    },
  });

  // Fetch orders when limit or offset changes
  useEffect(() => {
    getAllOrder({ variables: { sortOrder, sortBy, limit, offset } });
  }, [limit, offset, sortOrder, sortBy, getAllOrder]);

  const getPaymentStatus = (order) => {
    let statusText = '';
    if (order.paymentMethod === 'ONLINE') statusText = order.onlinepaymentStatus;
    else if (order.paymentMethod === 'DMT') statusText = order.paymentStatus;

    if (!statusText) return '';
    const normalized = statusText.toLowerCase();
    if (['failure', 'failed'].includes(normalized)) return '❌ FAILED';
    if (['complet', 'complete', 'completed', 'success'].includes(normalized)) return '✅ SUCCESS';
    if (normalized === 'pending') return '⏳ PENDING';
    return statusText.toUpperCase();
  };

  const getBadgeClass = (status, paymentStatus) => {
    if (paymentStatus === 'failed') return 'bg-danger';
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

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order?.billingAddress?.firstName || ''} ${order?.billingAddress?.lastName || ''}`.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      fullName.includes(search.toLowerCase()) ||
      moment(parseInt(order.createdAt, 10)).format('LL').toLowerCase().includes(search.toLowerCase()) ||
      order.totalAmount.toString().includes(search);

    const paymentStatusText = getPaymentStatus(order).toUpperCase();

    const matchesPaymentFilter =
      paymentFilter === 'all' ||
      (paymentFilter === 'success' && paymentStatusText.includes('SUCCESS')) ||
      (paymentFilter === 'failed' && paymentStatusText.includes('FAILED')) ||
      (paymentFilter === 'pending' && paymentStatusText.includes('PENDING')) ||
      (paymentFilter === 'proof' && paymentStatusText.includes('PAYMENT PROOF SUBMITED')) ||
      (paymentFilter === 'notfound' && paymentStatusText.includes('NOT FOUND'));

    return matchesSearch && matchesPaymentFilter;
  });

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setOffset(0); // Reset offset
    setOrders([]); // Clear old data before fetching
  };

  return (
    <div className="container-fluid py-3">
      {/* Page Header */}
      <Row className="align-items-center mb-3">
        <Col>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <NavLink to="/admin/dashboard" className="text-decoration-none">
                  Dashboard
                </NavLink>
              </li>
              <li className="breadcrumb-item active">Orders List</li>
            </ol>
          </nav>
          <h4 className="fw-bold mb-0">
            Orders List <span className="text-muted fs-6">({filteredOrders.length})</span>
          </h4>
        </Col>

        <Col md="3">
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <CsLineIcons icon="search" />
            </InputGroup.Text>
            <Form.Control type="text" placeholder="Search by Order Id, Name, Date, Amount" value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
        </Col>

        <Col md="3">
          <Form.Select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)}>
            <option value="all">All Payments</option>
            <option value="success">Payment Success</option>
            <option value="failed">Payment Failed</option>
            <option value="pending">Pending</option>
            <option value="proof">Payment Proof Submitted</option>
            <option value="notfound">Not Found</option>
          </Form.Select>
        </Col>

        {/* Results per page selector */}
        <Col md="2">
          <Form.Select value={limit} onChange={(e) => handleLimitChange(Number(e.target.value))}>
            <option value={100}>Show 100</option>
            <option value={200}>Show 200</option>
            <option value={500}>Show 500</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs defaultActiveKey="online_orders" className="mb-3">
        <Tab eventKey="online_orders">
          <div className="table-responsive shadow-sm rounded bg-white">
            <Table bordered hover className="align-middle mb-0 table-bordered">
              <thead className="table-light ">
                <tr>
                  <th>Order Id</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading State */}
                {loading && offset === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <Spinner animation="border" />
                    </td>
                  </tr>
                )}

                {/* Orders Found */}
                {!loading &&
                  filteredOrders.length > 0 &&
                  filteredOrders.map((order, index) => (
                    <tr key={index}>
                      <td>
                        <NavLink to={`detail/${order.id}`} className="fw-semibold text-decoration-none">
                          {order.id}
                        </NavLink>
                      </td>
                      <td>
                        {order?.billingAddress?.firstName} {order?.billingAddress?.lastName}
                      </td>
                      <td>{moment(parseInt(order?.createdAt, 10)).format('DD-MMM-YYYY')}</td>
                      <td>₹{Number(order?.totalAmount).toFixed(2)}</td>
                      <td>{order.paymentMethod}</td>
                      <td>{getPaymentStatus(order)}</td>
                      <td>
                        <Badge className={`text-uppercase ${getBadgeClass(order.status, order.paymentStatus)}`}>{order.status}</Badge>
                      </td>
                    </tr>
                  ))}

                {/* No Orders */}
                {!loading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No Orders Found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-3">
              <Button variant="outline-primary" onClick={handleLoadMore} disabled={loading}>
                {loading ? 'Loading...' : `Load More (${limit})`}
              </Button>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default ListOrder;
