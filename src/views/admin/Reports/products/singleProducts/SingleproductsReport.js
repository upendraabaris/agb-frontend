import React from 'react';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';

function SingleproductsReport() {
  return (
    <>
      <Form>
        <Row>
          <Col>
            <Card className="mb-5">
              <Card.Body>
                <div className="mb-2">
                  <Form.Group controlId="categories">
                    <Form.Label className="ms-3">
                      <Form.Check type="checkbox" name="categories" id="categories" inline />
                      category
                    </Form.Label>
                  </Form.Group>
                </div>

                <div className="row">
                  <div className="mb-2 col-md-6">
                    <Form.Group controlId="previewName">
                      <Form.Label className="ms-3">
                        <Form.Check type="checkbox" name="previewName" id="previewName" inline />
                        Preview Name
                      </Form.Label>
                    </Form.Group>
                  </div>
                  <div className="mb-2 col-md-6">
                    <Form.Group controlId="brand_name">
                      <Form.Label className="ms-3">
                        <Form.Check type="checkbox" name="brand_name" id="brand_name" inline />
                        Brand Name
                      </Form.Label>
                    </Form.Group>
                  </div>
                </div>
                <div className="mb-3">
                  <Form.Group controlId="description">
                    <Form.Label className="ms-3">
                      <Form.Check type="checkbox" name="description" id="description" inline />
                      Description
                    </Form.Label>
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Group controlId="sellerNotes">
                    <Form.Label className="fs-5">Seller Notes</Form.Label>
                  </Form.Group>
                </div>

                <div className="mb-3">
                  <Form.Group controlId="returnPolicy">
                    <Form.Label className="fs-5">returnPolicy</Form.Label>
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Group controlId="shippingPolicy">
                    <Form.Label className="fs-5">shippingPolicy</Form.Label>
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Group controlId="cancellationPolicy">
                    <Form.Label className="fs-5">cancellationPolicy</Form.Label>
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Label className="fs-5">FAQ</Form.Label>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default SingleproductsReport;
