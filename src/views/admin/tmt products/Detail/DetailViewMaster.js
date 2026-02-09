import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useHistory } from 'react-router-dom';
import { Row, Col, Button, Form, Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useQuery, useMutation } from '@apollo/client';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useDispatch } from 'react-redux';
import HandleCategory from './components/HandleCategory';

function DetailViewMaster() {
  const title = 'Edit Product Master';
  const description = 'Edit Product Master';
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { masterID } = useParams();
  const [updateTMTMaster, setUpdateTMTMaster] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const GET_ALL_TMT_MASTER = gql`
    query GetTmtMaster {
      getTmtMaster {
        id
        section
        brandCompareCategory
        categories
        listingCommType
        listingComm
        fixedComm
        fixedCommType
        shippingComm
        shippingCommType
        productComm
        productCommType
      }
    }
  `;

  const { error, data, refetch } = useQuery(GET_ALL_TMT_MASTER, {
    onCompleted: () => {
      const updatetmt = data.getTmtMaster.map(({ __typename, ...res }) => res);
      const tmt = updatetmt.find((item) => item.id === masterID);
      setUpdateTMTMaster(tmt);
    },
  });

  useEffect(() => {
    refetch();
  }, []);

  if (error) {
    console.log(`GET_ALL_TMT_MASTER!!! : ${error.message}`);
  }

  const UPDATE_TMT_MASTER = gql`
    mutation UpdateTMTMaster(
      $updateTmtMasterId: ID
      $section: Boolean
      $brandCompareCategory: String
      $listingComm: Float
      $listingCommType: String
      $fixedComm: Float
      $fixedCommType: String
      $shippingComm: Float
      $shippingCommType: String
      $productComm: Float
      $productCommType: String
      $categories: [String]
    ) {
      updateTMTMaster(
        id: $updateTmtMasterId
        section: $section
        brandCompareCategory: $brandCompareCategory
        listingComm: $listingComm
        listingCommType: $listingCommType
        fixedComm: $fixedComm
        fixedCommType: $fixedCommType
        shippingComm: $shippingComm
        shippingCommType: $shippingCommType
        productComm: $productComm
        productCommType: $productCommType
        categories: $categories
      ) {
        id
        brandCompareCategory
      }
    }
  `;

  const [UpdateTMTMaster] = useMutation(UPDATE_TMT_MASTER, {
    onCompleted: (res) => {
      refetch();
      toast.success(`${res.updateTMTMaster.brandCompareCategory} updated successfull!`);
      setTimeout(() => {
        history.push('/admin/tmt/list_master');
      }, 3000);
    },
    onError: (err) => {
      console.error('UPDATE_TMT_MASTER', err);
      toast.error(err.message || 'Something went wrong!');
    },
  });
  const isEmpty = (val) => {
    return val === null || val === undefined || val === "";
  };

  const validateForm = () => {
    const errors = {};

    if (isEmpty(updateTMTMaster.listingCommType)) {
      errors.listingCommType = "listingCommType is required.";
    }
    if (isEmpty(updateTMTMaster.listingComm)) {
      errors.listingComm = "Listing Fee is required.";
    }
    if (isEmpty(updateTMTMaster.productCommType)) {
      errors.productCommType = "productCommType is required.";
    }
    if (isEmpty(updateTMTMaster.productComm)) {
      errors.productComm = "Sale Commission Fee is required.";
    }
    if (isEmpty(updateTMTMaster.shippingCommType)) {
      errors.shippingCommType = "shippingCommType is required.";
    }
    if (isEmpty(updateTMTMaster.shippingComm)) {
      errors.shippingComm = "Shipping Fee is required.";
    }
    if (isEmpty(updateTMTMaster.fixedCommType)) {
      errors.fixedCommType = "fixedCommType is required.";
    }
    if (isEmpty(updateTMTMaster.fixedComm)) {
      errors.fixedComm = "Fixed Closing Fee is required.";
    }

    return errors;
  };

  const updateTMT = async (e) => {
    e.preventDefault();

    const errors = await validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    const tmtMaster = { ...updateTMTMaster };

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

    await UpdateTMTMaster({
      variables: {
        updateTmtMasterId: tmtMaster.id,
        ...tmtMaster,
      },
    });
  };

  const handleChange = (event) => {
    const { name, value, checked } = event.target;

    if (name === 'section') {
      setUpdateTMTMaster((prevFormData) => ({
        ...prevFormData,
        [name]: checked,
      }));
    } else {
      setUpdateTMTMaster((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
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
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="text-dark pb-1" to="/admin/dashboard">
              <span className="ms-1">Dashboard</span>
            </NavLink>
            <span className='p-2 small'> / </span>
            <NavLink className="text-dark pb-1" to="/admin/tmt/list_master">
              <span className="ms-1">Product Master List</span>
            </NavLink>
            <span className='p-2 small'> / </span>
            <NavLink className="text-dark pb-1" to="#">
              <span className="ms-1">{title}</span>
            </NavLink>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <h5
        style={{ backgroundColor: '#CEE6EA' }}
        className="fw-bold text-dark p-2 mb-2 border rounded
       text-center fs-5"
      >
        {title}
      </h5>
      <Form onSubmit={updateTMT}>
        <Row>
          {updateTMTMaster && (
            <Card className="mb-5">
              <Card.Body>
                <div className="row">
                  <div className="mb-3 col-6">
                    <Form.Label className="fw-bold text-dark">Product Master Name <span className='text-danger'> *</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="brandCompareCategory"
                      required
                      value={updateTMTMaster.brandCompareCategory || ''}
                      onChange={(e) => {
                        const cleanValue = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                        handleChange({ target: { name: e.target.name, value: cleanValue } });
                      }}
                    />
                  </div>
                  <div className="mb-3 col-6">
                    <div className="fw-bold text-dark">Do you want "Relational Pricing" ?</div>
                    <div className="d-flex align-items-center mt-3">
                      <Form.Check
                        type="checkbox"
                        name="section"
                        id="section"
                        checked={updateTMTMaster.section || ''}
                        onChange={handleChange}
                      />
                      <span className="ms-2">{updateTMTMaster.section ? 'Yes, I prefer Relational Pricing.' : 'No, Relational Pricing is not necessary.'}</span>
                    </div>
                  </div>
                </div>
                <HandleCategory productdetail={updateTMTMaster} setProductDetail={setUpdateTMTMaster} />
                <div className="mb-3">
                  <div className="row">
                    <div className=" col-md-6 mb-2">
                      <Form.Group controlId="productCommType">
                        <Form.Label className="text-dark fw-bold">Sale Commission Fee Type <span className='text-danger'> *</span>
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
                        <Form.Select
                          name="productCommType"
                          value="percentage"
                          disabled
                        >
                          <option value="fix">Fix</option>
                          <option value="percentage">Percentage (%)</option>
                        </Form.Select>
                        {formErrors.productCommType && <div className="mt-1 text-danger">{formErrors.productCommType}</div>}
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId="productComm">
                        <Form.Label className="text-dark fw-bold">Sale Commission Fee <span className='text-danger'> *</span>
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
                          value={updateTMTMaster.productComm ?? 0}
                          onChange={handleChange}
                          placeholder="Sale Commission Fee"
                        />
                        {formErrors.productComm && <div className="mt-1 text-danger">{formErrors.productComm}</div>}
                      </Form.Group>
                    </div>
                    <div className=" col-md-6 mb-2">
                      <Form.Group controlId="listingCommType">
                        <Form.Label className="text-dark fw-bold">Listing Fee Type <span className='text-danger'> *</span>
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
                        <Form.Select
                          name="listingCommType"
                          value="fix"
                          disabled
                        >
                          <option value="fix">Fix (Rs.)</option>
                          <option value="percentage">Percentage (%)</option>
                        </Form.Select>
                        {formErrors.listingCommType && <div className="mt-1 text-danger">{formErrors.listingCommType}</div>}
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId="listingComm">
                        <Form.Label className="text-dark fw-bold">Listing Fee <span className='text-danger'> *</span>
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
                          required
                          name="listingComm"
                          value={updateTMTMaster.listingComm ?? 0}
                          onChange={handleChange}
                          placeholder="Listing Fee"
                        />
                        {formErrors.listingComm && <div className="mt-1 text-danger">{formErrors.listingComm}</div>}
                      </Form.Group>
                    </div>
                    <div className=" col-md-6 mb-2">
                      <Form.Group controlId="fixedCommType">
                        <Form.Label className="text-dark fw-bold">Fixed Closing Fee Type <span className='text-danger'> *</span>
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
                        <Form.Select
                          name="fixedCommType"
                          value="fix"
                          disabled
                        >
                          <option value="fix">Fix (Rs.)</option>
                          <option value="percentage">Percentage (%)</option>
                        </Form.Select>
                        {formErrors.fixedCommType && <div className="mt-1 text-danger">{formErrors.fixedCommType}</div>}
                      </Form.Group>
                    </div>
                    <div className="col-md-6 mb-2">
                      <Form.Group controlId="fixedComm">
                        <Form.Label className="text-dark fw-bold">Fixed Closing Fee <span className='text-danger'> *</span>
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
                          value={updateTMTMaster.fixedComm ?? 0}
                          onChange={handleChange}
                          placeholder="Fixed Closing Fee"
                        />
                        {formErrors.fixedComm && <div className="mt-1 text-danger">{formErrors.fixedComm}</div>}
                      </Form.Group>
                    </div>

                    <div className=" col-md-6 mb-2">
                      <Form.Group controlId="shippingCommType">
                        <Form.Label className="text-dark fw-bold">Shipping Fee Type <span className='text-danger'> *</span>
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
                        <Form.Select
                          name="shippingCommType"
                          value="percentage"
                          disabled
                        >
                          <option value="fix">Fix (Rs.)</option>
                          <option value="percentage">Percentage (%)</option>
                        </Form.Select>
                        {formErrors.shippingCommType && <div className="mt-1 text-danger">{formErrors.shippingCommType}</div>}
                      </Form.Group>
                    </div>

                    <div className="col-md-6 mb-2">
                      <Form.Group controlId="shippingComm">
                        <Form.Label className="text-dark fw-bold">Shipping Fee <span className='text-danger'> *</span>
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
                          value={updateTMTMaster.shippingComm ?? 0}
                          onChange={handleChange}
                          placeholder="Shipping Fee"
                        />
                        {formErrors.shippingComm && <div className="mt-1 text-danger">{formErrors.shippingComm}</div>}
                      </Form.Group>
                    </div>

                  </div>
                </div>
                <Button variant="primary" type="submit" className="btn-icon btn-icon-start float-end">
                  <span> Submit</span>
                </Button>
              </Card.Body>
            </Card>
          )}
        </Row>
      </Form>
    </>
  );
}

export default DetailViewMaster;
