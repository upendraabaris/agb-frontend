import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';

const ListViewProduct = () => (
  <>
    <HtmlHead title="Product Management" description="Manage Single and Multiple Seller Products" />

    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <Row className="g-4 justify-content-center w-100">
        <Col md={5}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h5 className="fw-bold text-primary">Single Seller Products List</h5>
              <p className="text-muted small mb-3">Manage products of a single seller.</p>
              <Button as={NavLink} to="/seller/product/list" variant="outline-primary" size="sm">
                View List
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <h5 className="fw-bold text-success">Multiple Seller Products List</h5>
              <p className="text-muted small mb-3">Manage products shared by multiple sellers.</p>
              <Button as={NavLink} to="/seller/product/multiplelist" variant="outline-success" size="sm">
                View List
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  </>
);

export default ListViewProduct;
