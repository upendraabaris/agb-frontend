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

const GET_BILL_BY_PACKED_ID = gql`
  query GetAllBills {
    getAllBills {
      id
      accounts_status
      customer_issue
      customer_issue_date
      orderId
      orderAmount
      packedID
    }
  }
`;

const ListOrder = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  const [orders, setOrders] = useState([]);
  const [billOrders, setBillOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
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

  const [getAllBills] = useLazyQuery(GET_BILL_BY_PACKED_ID, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.getAllBills) {
        const bills = Array.isArray(data.getAllBills) ? data.getAllBills : [data.getAllBills];
        setBillOrders(bills);
      }
    },
    onError: (error) => console.error('Error in GetAllBills:', error.message),
  });

  useEffect(() => {
    getAllOrder({ variables: { sortOrder, sortBy, limit, offset } });
  }, [limit, offset, sortOrder, sortBy, getAllOrder]);

  useEffect(() => {
    getAllBills({ variables: { packedId: '' } });
  }, [getAllBills]);

  const matchedOrders = orders.filter((order) => billOrders.some((bill) => bill.orderId === order.id && bill.accounts_status === false));

  const filteredOrders = matchedOrders.filter((order) => {
    const fullName = `${order?.billingAddress?.firstName || ''} ${order?.billingAddress?.lastName || ''}`.toLowerCase();
    return (
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      fullName.includes(search.toLowerCase()) ||
      moment(parseInt(order.createdAt, 10)).format('LL').toLowerCase().includes(search.toLowerCase()) ||
      order.totalAmount.toString().includes(search)
    );
  });

  const handleLoadMore = () => {
    setOffset((prev) => prev + limit);
  };

  

  return (
    <div className="container-fluid py-3">
      <Row className="align-items-center mb-3">
        <Col>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <NavLink to="/admin/dashboard" className="text-decoration-none">
                  Dashboard
                </NavLink>
              </li>
              <li className="breadcrumb-item active">Orders with Issues List</li>
            </ol>
          </nav>
          <h4 className="fw-bold mb-0">
            Orders with Issues List <span className="text-muted fs-6">({filteredOrders.length})</span>
          </h4>
        </Col>

        <Col md="6">
          <InputGroup>
            <InputGroup.Text className="bg-white border-end-0">
              <CsLineIcons icon="search" />
            </InputGroup.Text>
            <Form.Control type="text" placeholder="Search by Order Id, Name, Date, Amount" value={search} onChange={(e) => setSearch(e.target.value)} />
          </InputGroup>
        </Col>


       
      </Row>

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
                </tr>
              </thead>
              <tbody>
                {loading && offset === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <Spinner animation="border" />
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredOrders.length > 0 &&
                  filteredOrders.map((order, index) => (
                    <tr key={index}>
                      <td>
                        <NavLink to={`issuedetail/${order.id}`} className="fw-semibold text-decoration-none">
                          {order.id}
                        </NavLink>
                      </td>
                      <td>
                        {order?.billingAddress?.firstName} {order?.billingAddress?.lastName}
                      </td>
                      <td>{moment(parseInt(order?.createdAt, 10)).format('LL')}</td>
                      <td>₹ {order?.totalAmount}</td>
                    </tr>
                  ))}

                {!loading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No Orders with issues found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

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
