import React, { useEffect, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { NavLink, withRouter } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col, Button, Form, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import SelectCategories from './components/SelectCategories';

function AddNewProduct({ history }) {
  const title = 'Add Product Master';
  const description = 'Add Product Master';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const CREATE_TMT_MASTER = gql`
    mutation CreateTMTMaster(
      $brandCompareCategory: String
      $section: Boolean
      $categories: [String]
      $listingCommType: String
      $fixedComm: Float
      $fixedCommType: String
      $shippingComm: Float
      $shippingCommType: String
      $productComm: Float
      $productCommType: String
      $listingComm: Float
    ) {
      createTMTMaster(
        brandCompareCategory: $brandCompareCategory
        section: $section
        categories: $categories
        listingCommType: $listingCommType
        fixedComm: $fixedComm
        fixedCommType: $fixedCommType
        shippingComm: $shippingComm
        shippingCommType: $shippingCommType
        productComm: $productComm
        productCommType: $productCommType
        listingComm: $listingComm
      ) {
        id
      }
    }
  `;

  const initialStates = {
    brandCompareCategory: '',
    section: false,
    categories: [],
    listingCommType: 'fix',      // Default = Fix(Rs.)
    listingComm: '',
    productCommType: 'percentage', // Example default, set as you want
    productComm: '',
    shippingCommType: 'percentage',     // Example default
    shippingComm: '',
    fixedCommType: 'fix',        // Example default
    fixedComm: '',
  };


  const [formData, setFormData] = useState(initialStates);

  const [formErrors, setFormErrors] = useState({});

  const [CreateTMTMaster] = useMutation(CREATE_TMT_MASTER, {
    onCompleted: () => {
      toast.success('Product Master Name Added Successfully!');
      setFormData(initialStates);
      setTimeout(() => {
        history.push('/admin/tmt/list_master');
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong!'); 
    },
  });

  // handle form errors
  const validateForm = () => {
    const errors = {};

    // Add validation checks for each field

    if (!formData.categories.length) {
      errors.categories = 'Categories is required.';
    }
    if (!formData.brandCompareCategory.trim()) {
      errors.brandCompareCategory = 'Product Master Name is required.';
    }

    if (!formData.listingComm) {
      errors.listingComm = 'Listing Feeis required.';
    }

    if (!formData.productComm) {
      errors.productComm = 'Sale Commission Fee is required.';
    }

    if (!formData.shippingComm) {
      errors.shippingComm = 'Shipping Fee is required.';
    }

    if (!formData.fixedComm) {
      errors.fixedComm = 'Fixed closing Fee is required.';
    }
    return errors;
  };
  const handleChange = (event) => {
    const { name, value, checked } = event.target;

    if (name === 'section') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: checked,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };

  const handleProduct = async (event) => {
    event.preventDefault();

    const errors = await validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const tmtMaster = { ...formData };

    const numericFields = ['listingComm', 'productComm', 'shippingComm', 'fixedComm'];
    numericFields.forEach((field) => {
      const valueToParse = tmtMaster[field];
      // eslint-disable-next-line no-restricted-globals
      if (valueToParse !== null && valueToParse !== '' && !isNaN(valueToParse)) {
        tmtMaster[field] = parseFloat(valueToParse);
      } else {
        tmtMaster[field] = 0;
      }
    });

    await CreateTMTMaster({
      variables: tmtMaster,
    });
  };
  return (
    <>
      <style>{`
        .custom-tooltip .tooltip-inner {
          background-color: #000 !important;
          color: #fff !important;
        }
        .custom-tooltip.bs-tooltip-top .tooltip-arrow::before,
        .custom-tooltip.bs-tooltip-bottom .tooltip-arrow::before,
        .custom-tooltip.bs-tooltip-start .tooltip-arrow::before,
        .custom-tooltip.bs-tooltip-end .tooltip-arrow::before {
          background-color: #000 !important;
        }
      `}</style>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="align-items-center">
          <Col className="col-auto d-flex align-items-center">
            <NavLink className="text-decoration-none d-flex align-items-center me-2" to="/admin/dashboard">
              <span className="fw-medium text-dark">Dashboard</span>
            </NavLink>
            <span className="text-dark">/</span>
            <NavLink className="text-decoration-none d-flex align-items-center ms-2 me-2" to="/admin/tmt/list_master">
              <span className="fw-medium text-dark">Product Master List</span>
            </NavLink>
            <span className="text-dark">/</span>
            <span className="ms-2 fw-semibold text-dark">{title}</span>
          </Col>
        </Row>
      </div>

      <h5
        style={{ backgroundColor: '#CEE6EA' }}
        className="fw-bold text-dark p-2 mb-2 border rounded
       text-center fs-5"
      >
        {title}
      </h5>
      <Form onSubmit={handleProduct}>
        <Row>
          <Col className="col-12">
            <Card className="mb-5">
              <Card.Body>
                <div className="row">
                  <div className="mb-3 col-6">
                    <Form.Group controlId="brandCompareCategory">
                      <Form.Label className="fw-bold text-dark">
                        Product Master Name <span className="text-danger"> * </span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="brandCompareCategory"
                        value={formData.brandCompareCategory}
                        onChange={(e) => {
                          // Remove any non-alphanumeric characters
                          const newValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                          handleChange({ target: { name: e.target.name, value: newValue } });
                        }}
                        placeholder="Enter Product Master Name"
                      />

                      {formErrors.brandCompareCategory && <div className="mt-1 text-danger">{formErrors.brandCompareCategory}</div>}
                    </Form.Group>
                  </div>
                  <div className="mb-3 col-6">
                    <div className="fw-bold text-dark">Do you want "Relational Pricing" ?</div>
                    <div className="d-flex align-items-center mt-3">
                      <Form.Check className="mt-0" type="checkbox" name="section" id="section" checked={formData.section} onChange={handleChange} />
                      <span className="ms-2">{formData.section ? 'Yes, I prefer Relational Pricing.' : 'No, Relational Pricing is not necessary.'}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3 mt-1 border rounded p-3">
                  <Form.Label className="fw-bold text-dark">
                    Select Categories for Product Placement <span className="text-danger"> * </span>
                  </Form.Label>
                  <SelectCategories setFormData={setFormData} />
                  {formErrors.categories && <div className="mt-1 text-danger">{formErrors.categories}</div>}
                </div>

                <Card className="mb-3 border rounded">
                  <div className="mark mb-3">
                    <div className="fw-bold ps-4 p-1 fs-6">Commission / Fee Details</div>
                  </div>
                  <div className="mb-3 px-3">
                    <div className="row">
                      <div className=" col-md-6 mb-2">
                        <Form.Group controlId="productCommType">
                          <Form.Label className="text-dark fw-bold">
                            Sale Commission Fee Type <span className="text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose commision type as Fix or Percentage.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select name="productCommType" value={formData.productCommType} disabled>
                            <option value="percentage">Percentage (%)</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId="productComm">
                          <Form.Label className="text-dark fw-bold">
                            Sale Commission Fee <span className="text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Percentage or amount earned by the platform per product sold.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            min={0}
                            name="productComm"
                            value={formData.productComm || ''}
                            onChange={handleChange}
                            placeholder="Sale Commission Fee"
                          />
                          {formErrors.productComm && <div className="mt-1 text-danger">{formErrors.productComm}</div>}
                        </Form.Group>
                      </div>
                      <div className=" col-md-6 mb-2">
                        <Form.Group controlId="listingCommType">
                          <Form.Label className="text-dark fw-bold">
                            Listing FeeType <span className="text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose commision type as Fix or Percentage.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select name="listingCommType" value={formData.listingCommType} disabled>
                            <option value="fix">Fix (Rs.)</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId="listingComm">
                          <Form.Label className="text-dark fw-bold">
                            Listing Fee<span className="text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Fee charged for listing a product on a platform.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            min={0}
                            name="listingComm"
                            value={formData.listingComm || ''}
                            onChange={handleChange}
                            placeholder="Listing Fee"
                          />
                          {formErrors.listingComm && <div className="mt-1 text-danger">{formErrors.listingComm}</div>}
                        </Form.Group>
                      </div>

                      <div className=" col-md-6 mb-2">
                        <Form.Group controlId="fixedCommType">
                          <Form.Label className="text-dark fw-bold">
                            Fixed closing Fee Type <span className="text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose commision type as Fix or Percentage.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select name="fixedCommType" value={formData.fixedCommType} disabled>
                            <option value="fix">Fix (Rs.)</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId="fixedComm">
                          <Form.Label className="text-dark fw-bold">
                            Fixed closing Fee <span className="text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Pre-set, unchanging fee charged per sale or transaction.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            min={0}
                            name="fixedComm"
                            value={formData.fixedComm || ''}
                            onChange={handleChange}
                            placeholder="Fixed closing Fee"
                          />
                          {formErrors.fixedComm && <div className="mt-1 text-danger">{formErrors.fixedComm}</div>}
                        </Form.Group>
                      </div>

                      <div className=" col-md-6 mb-2">
                        <Form.Group controlId="shippingCommType">
                          <Form.Label className="text-dark fw-bold">
                            Shipping Fee Type <span className="text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose fees type as Fix or Percentage.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select name="shippingCommType" value={formData.shippingCommType} disabled>
                            <option value="fix">Percentage (%)</option>
                          </Form.Select>
                        </Form.Group>
                      </div>

                      <div className="col-md-6 mb-2">
                        <Form.Group controlId="shippingComm">
                          <Form.Label className="text-dark fw-bold">
                            Shipping Fee <span className="text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Cost charged to deliver the product to the buyer.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            onWheel={(e) => e.target.blur()}
                            step="0.01"
                            min={0}
                            name="shippingComm"
                            value={formData.shippingComm || ''}
                            onChange={handleChange}
                            placeholder="Shipping Fee"
                          />
                          {formErrors.shippingComm && <div className="mt-1 text-danger">{formErrors.shippingComm}</div>}
                        </Form.Group>
                      </div>
                    </div>
                  </div>
                </Card>
                <Button className="float-end" variant="primary" type="submit">
                  Submit
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default withRouter(AddNewProduct);