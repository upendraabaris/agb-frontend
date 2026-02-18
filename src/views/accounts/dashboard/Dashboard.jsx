import React, { useEffect, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Row, Col, Card } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

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

const GET_ALL_BILLS = gql`
  query GetAllBills {
    getAllBills {
      id
      payment_status
    }
  }
`;

const Chart = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  const { data: orderData } = useQuery(GET_ALL_ORDERS);
  const { data: billData } = useQuery(GET_ALL_BILLS);
  const [completedCount, setCompletedCount] = useState(0);
  const [paymentCompleteCount, setPaymentCompleteCount] = useState(0);
  const [billSuccessCount, setBillPendingCount] = useState(0);

  useEffect(() => {
    if (orderData?.getAllOrder) {
      const submittedCount = orderData.getAllOrder.filter((order) => order.paymentStatus === 'Payment Proof Submited').length;
      setCompletedCount(submittedCount);

      const completeCount = orderData.getAllOrder.filter((order) => order.paymentStatus === 'complete').length;
      setPaymentCompleteCount(completeCount);
      
    }
  }, [orderData]);

  useEffect(() => {
    if (billData?.getAllBills) {
      const pendingOrNullCount = billData.getAllBills.filter((bill) => bill.payment_status === 'Pending' || !bill.payment_status).length;
      setBillPendingCount(pendingOrNullCount);
    }
  }, [billData]);

  const cards = [ 
    { icon: 'cart', value: paymentCompleteCount, label: 'ORDERS', note: 'Payment Success' },
    { icon: 'cart', value: completedCount, label: 'DMT ORDER', note: 'Payment Verification Pending' },
    { icon: 'wallet', value: billSuccessCount, label: 'PAYMENT DUE', note: 'Payment Transfer Due' },
  ];

  return (
    <>
      <HtmlHead title="Accounts Dashboard" description="Accounts Dashboard" />
      <h1 className="mb-4 fs-5 fw-bold">Accounts Dashboard</h1>
      <Row className="g-3">
        {cards.map((card, idx) => (
          <Col xs={6} md={4} lg={2} key={idx}>
            <Card className="h-100 hover-scale-up cursor-pointer text-center">
              <Card.Body className="d-flex flex-column align-items-center">
                <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-3">
                  <CsLineIcons icon={card.icon} className="text-primary" />
                </div>
                <div className="text-dark mb-1">{card.label}</div>
                <div className="fw-bold cta-4 text-dark">{card.value}</div>
                {card.note && <div className="text-muted text-small">{card.note}</div>}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Chart;
