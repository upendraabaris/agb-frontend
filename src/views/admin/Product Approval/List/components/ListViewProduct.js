import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Modal, Button, Form, Card, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { gql, useMutation, useLazyQuery } from '@apollo/client';

const ListViewProduct = () => {
  const history = useHistory();

  const PENDING_APPROVAL_PRODUCT = gql`
    query Pendingapprove {
      pendingapprove {
        brand_name
        fullName
        id
        approve
        sku
        thumbnail
        images
        previewName
        identifier
        variant {
          location {
            sellerId {
              companyName
            }
          }
        }
      }
    }
  `;

  const ADD_COMMISSION_AND_APPROVE = gql`
    mutation Addcommandapprove(
      $addcommandapproveId: ID
      $reject: Boolean
      $rejectReason: String
      $approve: Boolean
      $fixedComm: Float
      $fixedCommType: String
      $shippingComm: Float
      $productComm: Float
      $productCommType: String
      $listingComm: Float
      $shippingCommType: String
      $listingCommType: String
    ) {
      addcommandapprove(
        id: $addcommandapproveId
        reject: $reject
        rejectReason: $rejectReason
        approve: $approve
        fixedComm: $fixedComm
        fixedCommType: $fixedCommType
        shippingComm: $shippingComm
        productComm: $productComm
        productCommType: $productCommType
        listingComm: $listingComm
        shippingCommType: $shippingCommType
        listingCommType: $listingCommType
      ) {
        id
      }
    }
  `;

  // const { error, data, refetch } = useQuery(PENDING_APPROVAL_PRODUCT);

  const [Pendingapprove, { data, refetch }] = useLazyQuery(PENDING_APPROVAL_PRODUCT, {
    onError: (error) => {
      console.log(`Error!!! : ${error.message}`);
    },
  });

  useEffect(() => {
    refetch();
  }, []);

  // add commission to the Product
  const initialFormData = {
    listingCommType: '',
    listingComm: '',
    productCommType: '',
    productComm: '',
    shippingCommType: '',
    shippingComm: '',
    fixedCommType: '',
    fixedComm: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [ModalView, setModalView] = useState(false);
  const [addcommandapproveId, setAddcommandapproveId] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [Addcommandapprove] = useMutation(ADD_COMMISSION_AND_APPROVE, {
    onCompleted: () => {
      refetch();
    },
  });

  const fillCommission = (prodId) => {
    setModalView(true);
    setAddcommandapproveId(prodId);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    const parsedItem = ['listingComm', 'productComm', 'shippingComm', 'fixedComm'].includes(name);

    if (parsedItem) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: parseFloat(value),
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (addcommandapproveId) {
      try {
        await Addcommandapprove({
          variables: {
            addcommandapproveId,
            ...formData,
            approve: true,
          },
        });
        setFormData(initialFormData);
        toast('Approved successfully!');
        setModalView(false);
      } catch (error) {
        toast.error(error.message || 'Something went wrong!');
      }
    } else {
      toast.error('Something went wrong in ADD_COMMISSION_AND_APPROVE!');
    }
  };

  // reject the product

  const rejectProduct = (prodId) => {
    setRejectModal(true);
    setAddcommandapproveId(prodId);
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (addcommandapproveId && rejectReason.trim()) {
      try {
        await Addcommandapprove({
          variables: {
            addcommandapproveId,
            reject: true,
            approve: false,
            rejectReason,
          },
        });
        toast('Product Rejected !');
        setRejectModal(false);
        setRejectReason('');
      } catch (error) {
        toast.error(error.message || 'Something went wrong!');
      }
    } else {
      toast.error('Fill the reason for Rejection.');
    }
  };
  return (
    <>
      {/* List Header Start */}
      <Row className="g-0 mb-2 d-none d-lg-flex">
        <Col xs="auto" className="sw-11 d-none d-lg-flex" />
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-muted text-small cursor-pointer sort">PRODUCT FULL NAME</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer sort">BRAND</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer sort">ACTION</div>
            </Col>
            {/* <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer sort">STATUS</div>
            </Col> */}
          </Row>
        </Col>
      </Row>
      {/* List Header End */}

      {/* Single Card Begins Here */}
      {data && (
        <>
          {data.pendingapprove?.map((product) => {
            return (
              <Card key={product.id} className="mb-2">
                <Row className="g-0 h-100 sh-lg-9 position-relative">
                  <Col xs="1" className="position-relative h-100">
                    <NavLink to="#/!" className="d-block h-100">
                      <img src={product.images[0]} alt="product" className="card-img card-img-horizontal sw-11 mh-100" />
                    </NavLink>
                  </Col>
                  <Col className="py-4 py-lg-0 ps-5 pe-4 h-100">
                    <Row className="g-0 h-100 align-content-center">
                      <Col xs="11" lg="3" className="d-flex flex-column mb-lg-0 mb-3 pe-3 d-flex order-1 h-lg-100 justify-content-center">
                        <NavLink to="#/!">
                          {product.previewName}
                          <div className="text-small text-muted text-truncate">Sold by: {product.variant[0]?.location[0]?.sellerId.companyName}</div>
                        </NavLink>
                      </Col>
                      <Col lg="3" className="d-flex flex-column pe-1 mb-2 mb-lg-0 justify-content-center order-3">
                        <div className="lh-1 text-alternate">{product.brand_name}</div>
                      </Col>
                      <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4">
                        <div className="text-muted text-small d-lg-none mb-1">Action</div>
                        <div>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Product Details</Tooltip>}>
                            <div className="d-inline-block me-2">
                              <Button
                                variant="foreground-alternate"
                                className="btn-icon btn-icon-only shadow"
                                onClick={() => {
                                  history.push(`details/${product.identifier?.replace(/\s/g, '_').toLowerCase()}`);
                                }}
                              >
                                <CsLineIcons icon="edit-square" className="text-primary" size="17" />
                              </Button>
                            </div>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Submit Commission</Tooltip>}>
                            <div className="d-inline-block me-2">
                              <Button
                                variant="foreground-alternate"
                                className="btn-icon btn-icon-only shadow"
                                onClick={() => {
                                  fillCommission(product.id);
                                }}
                              >
                                <CsLineIcons icon="content" className="text-primary" size="17" />
                              </Button>
                            </div>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Reject This Product </Tooltip>}>
                            <div className="d-inline-block me-2">
                              <Button
                                className="btn-icon btn-icon-only shadow"
                                variant="foreground-alternate"
                                onClick={() => {
                                  rejectProduct(product.id);
                                }}
                              >
                                <CsLineIcons icon="close-circle" className="text-primary" size="17" />
                              </Button>
                            </div>
                          </OverlayTrigger>
                        </div>
                      </Col>
                      {/* <Col xs="1" className="d-flex flex-column mb-2 mb-lg-0 align-items-end order-2 order-lg-last justify-content-lg-center">
                        <Form.Check
                          className="form-check mt-2 ps-7 ps-md-2"
                          type="checkbox"
                          checked={selectedItems.includes(product)}
                          onChange={() => checkItem(product)}
                        />
                      </Col> */}
                    </Row>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </>
      )}
      {/* Single Card Ends Here */}

      {/* Pagination Start */}
      <div className="d-flex justify-content-center mt-5">
        <Pagination>
          <Pagination.Prev className="shadow" disabled>
            <CsLineIcons icon="chevron-left" />
          </Pagination.Prev>
          <Pagination.Item className="shadow" active>
            1
          </Pagination.Item>
          <Pagination.Item className="shadow">2</Pagination.Item>
          <Pagination.Item className="shadow">3</Pagination.Item>
          <Pagination.Next className="shadow">
            <CsLineIcons icon="chevron-right" />
          </Pagination.Next>
        </Pagination>
      </div>
      {/* Pagination End */}

      <Modal show={ModalView} onHide={() => setModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Fill Commission</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="my-3">
            <Form onSubmit={handleSubmit}>
              <div className="row">
                <div className=" col-md-6 mb-2">
                  <Form.Group controlId="listingCommType">
                    <Form.Label className="fs-6">Listing Commission Type</Form.Label>
                    <Form.Select name="listingCommType" required value={formData.listingCommType} onChange={handleChange}>
                      <option>Listing Commission Type</option>
                      <option value="fix">Fix</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="listingComm">
                    <Form.Label className="fs-6">Listing Commission</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="listingComm"
                      value={formData.listingComm}
                      onChange={handleChange}
                      placeholder="Listing Commission"
                    />
                  </Form.Group>
                </div>

                <div className=" col-md-6 mb-2">
                  <Form.Group controlId="productCommType">
                    <Form.Label className="fs-6">Product Commission Type</Form.Label>
                    <Form.Select name="productCommType" required value={formData.productCommType} onChange={handleChange}>
                      <option>Product Commission Type</option>
                      <option value="fix">Fix</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="productComm">
                    <Form.Label className="fs-6">Product Commission</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="productComm"
                      value={formData.productComm}
                      onChange={handleChange}
                      placeholder="Product Commission"
                    />
                  </Form.Group>
                </div>
                <div className=" col-md-6 mb-2">
                  <Form.Group controlId="shippingCommType">
                    <Form.Label className="fs-6">Shipping Fee Type</Form.Label>
                    <Form.Select name="shippingCommType" required value={formData.shippingCommType} onChange={handleChange}>
                      <option>Shipping Fee Type</option>
                      <option value="fix">Fix</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="shippingComm">
                    <Form.Label className="fs-6">Shipping Fee</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="shippingComm"
                      value={formData.shippingComm}
                      onChange={handleChange}
                      placeholder="Shipping Fee"
                    />
                  </Form.Group>
                </div>
                <div className=" col-md-6 mb-2">
                  <Form.Group controlId="fixedCommType">
                    <Form.Label className="fs-6">Fixed Commission Type</Form.Label>
                    <Form.Select name="fixedCommType" required value={formData.fixedCommType} onChange={handleChange}>
                      <option>Fixed Commission Type</option>
                      <option value="fix">Fix</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="fixedComm">
                    <Form.Label className="fs-6">Fixed Commission</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="fixedComm"
                      value={formData.fixedComm}
                      onChange={handleChange}
                      placeholder="Fixed Commission"
                    />
                  </Form.Group>
                </div>
                <Button className="mt-2" variant="primary" type="submit">
                  Save
                </Button>
              </div>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={rejectModal} onHide={() => setRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Product</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleReject}>
            <div className="row">
              <div className="mb-2">
                <Form.Group controlId="rejectReason">
                  <Form.Label className="fs-6">Reject Product</Form.Label>
                  <Form.Control
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                    name="rejectReason"
                    placeholder="Reason for Rejection!"
                  />
                </Form.Group>
              </div>
              <Button className="mt-2" variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ListViewProduct;
