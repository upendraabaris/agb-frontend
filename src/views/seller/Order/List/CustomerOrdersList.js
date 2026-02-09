import React from 'react';
import { NavLink } from 'react-router-dom';
import { Table, Badge, Spinner, Pagination } from 'react-bootstrap';
import moment from 'moment';

const CustomerOrdersList = ({ orderData, loading }) => {
  const [offset, setOffset] = React.useState(0);
  const limit = 50;

  if (loading) {
    return (
      <div className="text-center py-5 bg-white border rounded">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading Orders...</p>
      </div>
    );
  }

  if (!orderData?.length) {
    return (
      <div className="text-center py-5 bg-white border rounded">
        <h5>No Orders Found</h5>
      </div>
    );
  }

  const sortedOrders = [...orderData].reverse(); // latest first
  const paginatedOrders = sortedOrders.slice(offset, offset + limit);

  const totalOrders = orderData.length;
  const totalPages = Math.ceil(totalOrders / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    const newOffset = (page - 1) * limit;
    setOffset(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calcAmount = (order) => {
    const base = order?.orderProducts?.reduce((total, item) => total + (item.price || 0), 0);
    const factor = 1 + (order?.onlinePaymentChargePercentage || 0) / 100;
    return (base * factor).toFixed(2);
  };

  return (
    <>
      <div className="bg-white border rounded p-2">
        <div className="table-responsive">
          <Table bordered hover size="sm" className="mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ minWidth: 140 }}>Order Id</th>
                <th style={{ minWidth: 180 }}>Customer</th>
                <th style={{ minWidth: 140 }}>Order</th>
                <th style={{ minWidth: 120 }}>Amount</th>
                <th style={{ minWidth: 140 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <NavLink to={`detail?orderID=${order.id}`}>{order.id?.slice(-12)}</NavLink>
                  </td>
                  <td>
                    {order?.shippingAddress?.firstName} {order?.shippingAddress?.lastName}
                  </td>
                  <td>{moment(parseInt(order?.createdAt, 10)).format('DD-MMM-yyyy')}</td>
                  <td>₹{calcAmount(order)}</td>
                  <td className="text-uppercase">
                    {order?.status === 'pending' && (
                      <Badge bg="warning" text="white">
                        {order?.status}
                      </Badge>
                    )}
                    {order?.status === 'packed' && <Badge bg="secondary">{order?.status}</Badge>}
                    {order?.status === 'shipped' && (
                      <Badge bg="info" text="white">
                        {order?.status}
                      </Badge>
                    )}
                    {order?.status === 'delivered' && <Badge bg="success">{order?.status}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                {page}
              </Pagination.Item>
            ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      )}
    </>
  );
};

export default CustomerOrdersList;
