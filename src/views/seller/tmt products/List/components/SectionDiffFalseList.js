import React from 'react';
import { Row, Col, Button, Dropdown, Form, Card, Tooltip, OverlayTrigger, Modal, Tab, Tabs } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

function SectionDiffFalseList({ data, updatePrice, setdeleteproductID, setdeletemodalView, liveThisProduct }) {
  return (
    <>
      {/* List Header Start */}
      <Row className="g-0 mb-2 d-none d-lg-flex bg-white pt-2 pb-2 ">
        <Col xs="auto" className="sw-11 d-none d-lg-flex" />
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" lg="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-dark cursor-pointer sort">Product Full Name</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark cursor-pointer sort">Brand</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark cursor-pointer sort">Action</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark cursor-pointer sort">Status</div>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* List Header End */}

      {data &&
        data
          ?.slice(0)
          .reverse()
          .map((product) => {
            return (
              <Card key={product.id} className="mb-2">
                <Row className="g-0 h-100 sh-lg-9 position-relative">
                  <Col xs="1" className="position-relative h-100 p-2">
                    <NavLink className="d-block h-100" to="#/!">
                      <img
                        src={product.thumbnail || (product.images && product.images[0])}
                        alt="product"
                        className="card-img card-img-horizontal sw-11 mh-100 img-fluid"
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </NavLink>
                  </Col>

                  <Col className="py-4 py-lg-0 ps-5 pe-4 h-100">
                    <Row className="g-0 h-100 align-content-center">
                      <Col xs="11" lg="3" className="d-flex flex-column mb-lg-0 mb-3 pe-3 d-flex order-1 h-lg-100 justify-content-center">
                        <NavLink to={`/product/${product.identifier}`} target="_blank" rel="noopener noreferrer">{product.fullName}</NavLink>
                      </Col>
                      <Col lg="3" className="d-flex flex-column pe-1 mb-2 mb-lg-0 justify-content-center order-3">
                        <div className="lh-1 text-dark">{product.brand_name}</div>
                      </Col>
                      <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4">
                        <div className="text-dark d-lg-none mb-1">Action</div>
                        <div>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}>
                            <div className="d-inline-block me-2">
                              <NavLink className="btn-icon btn-icon-only shadow" variant="outline-primary" to={`details/${product.id}`}>
                                <CsLineIcons icon="edit-square" />
                              </NavLink>
                            </div>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Update TMT Price</Tooltip>}>
                            <div className="d-inline-block me-2">
                              {product.section && (
                                <Button
                                  className="btn-icon btn-icon-only shadow"
                                  variant="outline-primary"
                                  type="button"
                                  onClick={() => updatePrice(product.id)}
                                >
                                  <CsLineIcons icon="content" />
                                </Button>
                              )}
                            </div>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Delete product</Tooltip>}>
                            <div className="d-inline-block me-2">
                              <Button
                                className="btn-icon btn-icon-only shadow"
                                variant="outline-primary"
                                type="button"
                                onClick={() => {
                                  setdeleteproductID(product.id);
                                  setdeletemodalView(true);
                                }}
                              >
                                <CsLineIcons icon="bin" />
                              </Button>
                            </div>
                          </OverlayTrigger>
                        </div>
                      </Col>
                      <Col lg="3" className="d-flex flex-column pe-1 mb-2 mb-lg-0 align-items-start justify-content-center order-5">
                        <Form.Check
                          type="switch"
                          name="active"
                          id="quantitySwitch1"
                          checked={product.active || ''}
                          onChange={(e) => liveThisProduct(e, product.id)}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>
            );
          })}
    </>
  );
}

export default SectionDiffFalseList;
