import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { CheckCircleFill } from 'react-bootstrap-icons';

function ThankYouPage() {
  const location = useLocation();
  const { orderID: orderIdParam } = useParams();
  const { color } = useGlobleContext();
  const orderID = location.state?.orderID || orderIdParam;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const goToOrderPage = () => {
    window.location.href = `/order/${orderID}`;
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-white"
      style={{ minHeight: '100vh' }} // Full-screen view without header/footer
    >
      <Card className="shadow border-0 rounded-4" style={{ maxWidth: '650px', width: '100%', padding: '20px' }}>
        <Card.Body className="text-center px-4 py-5">
          <style>{`
            .success-zoom {
              display: inline-block;
              animation: zoomEffect 1.6s ease-in-out infinite;
            }
            @keyframes zoomEffect {
              0% { transform: scale(1); }
              50% { transform: scale(1.12); }
              100% { transform: scale(1); }
            }
          `}</style>

          <div className="mb-4">
            <CheckCircleFill size={70} color="#28a745" className="mb-3 success-zoom" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }} />
          </div>

          <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>
            Thank you for your order!
          </h2>

          <p className="text-dark mb-4 small">Your order is placed. We’ll email after payment is verified.</p>

          <div
            className="rounded-4 px-4 py-4 mx-auto mb-5"
            style={{
              background: '#f7faff',
              border: '1px solid #e6ecf5',
              maxWidth: '420px',
            }}
          >
            <p className="text-uppercase small text-muted mb-2">ORDER ID</p>
            <h4 className="fw-semibold">{orderID}</h4>
          </div>

          <Row className="g-3 justify-content-center mb-4">
            <Col xs={12} sm={6}>
              <Button className="w-100 fw-bold py-3" style={{ background: color, border: 'none', fontSize: '1.1rem' }} onClick={goToOrderPage}>
                View Order
              </Button>
            </Col>

            <Col xs={12} sm={6}>
              <NavLink to="/">
                <Button variant="light" className="w-100 fw-bold py-3 border" style={{ fontSize: '1.1rem' }}>
                  Continue Shopping
                </Button>
              </NavLink>
            </Col>
          </Row>

          <p className="text-muted mt-4 mb-0">
            Need help?{' '}
            <NavLink to="/contact_us" className="fw-semibold text-decoration-none">
              Contact Support
            </NavLink>
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ThankYouPage;
