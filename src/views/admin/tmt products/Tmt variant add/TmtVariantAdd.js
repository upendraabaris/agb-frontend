import React, { useState, useEffect } from 'react';
import { useParams, NavLink, withRouter } from 'react-router-dom';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const GET_TMT_MASTER_VARIANT_BY_BRANDCAT = gql`
  query GetTmtMasterByBrandCat($brandCompareCategory: String) {
    getTmtMasterByBrandCat(brandCompareCategory: $brandCompareCategory) {
      id
      tmtseriesvariant {
        id
        moq
        hsn
        variantName
      }
    }
  }
`;

const ADD_TMT_MASTER_VARIANT = gql`
  mutation AddTMTMasterVariant($brandCompare: String, $tmtseriesvariant: [TMTMasterSeriesVariantInput]) {
    addTMTMasterVariant(brandCompare: $brandCompare, tmtseriesvariant: $tmtseriesvariant) {
      id
    }
  }
`;

const UPDATE_MASTER_VARIANT = gql`
  mutation UpdateTMTMasterVariant($updateTmtMasterVariantId: ID, $variantId: ID, $hsn: String, $variantName: String, $moq: Int) {
    updateTMTMasterVariant(id: $updateTmtMasterVariantId, variantId: $variantId, hsn: $hsn, variantName: $variantName, moq: $moq) {
      id
    }
  }
`;

const DELETE_MASTER_VARIANT = gql`
  mutation DeleteTMTMasterVariant($deleteTmtMasterVariantId: ID!, $variantId: ID!) {
    deleteTMTMasterVariant(id: $deleteTmtMasterVariantId, variantId: $variantId) {
      id
    }
  }
`;

const TmtVariantAdd = ({ history }) => {
  const title = 'Add Product Master Variant';
  const description = 'Add Product Master Variant';
  const { brandcompcat } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const [GetTmtMasterByBrandCat, { error, data, refetch }] = useLazyQuery(GET_TMT_MASTER_VARIANT_BY_BRANDCAT, {
    variables: {
      brandCompareCategory: brandcompcat,
    },
    onError() {
      console.log(`GET_TMT_MASTER_VARIANT_BY_BRANDCAT!!! : ${error.message}`);
    },
  });

  useEffect(() => {
    if (brandcompcat) {
      GetTmtMasterByBrandCat();
    }
  }, [GetTmtMasterByBrandCat, brandcompcat]);

  const initialVariantState = {
    hsn: '',
    variantName: '',
    moq: '',
  };

  const [formData, setFormData] = useState({
    brandCompare: brandcompcat,
    tmtseriesvariant: [initialVariantState],
  });

  const [AddTMTMasterVariant] = useMutation(ADD_TMT_MASTER_VARIANT, {
    onCompleted: () => {
      toast.success('Product Variant added successfully!');
      setFormData({
        brandCompare: brandcompcat,
        tmtseriesvariant: [initialVariantState],
      });
      refetch();
    },
    onError: (err) => {
      console.log('ADD_TMT_MASTER_VARIANT', err);
    },
  });
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};
    formData.tmtseriesvariant.forEach((variant, index) => {
      if (!variant.variantName?.trim()) {
        newErrors[`variantName_${index}`] = 'Variant Name is required';
      }
      if (!variant.moq || Number.isNaN(Number(variant.moq))) {
        newErrors[`moq_${index}`] = 'MOQ is required';
      }
      if (!variant.hsn) {
        newErrors[`hsn_${index}`] = 'HSN is required';
      } else if (!/^\d{4,8}$/.test(variant.hsn)) {
        newErrors[`hsn_${index}`] = 'HSN must be between 4 to 8 digits';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    await AddTMTMasterVariant({
      variables: {
        brandCompare: formData.brandCompare,
        tmtseriesvariant: formData.tmtseriesvariant.map((variant) => ({
          ...variant,
          moq: variant.moq !== '' ? parseInt(variant.moq, 10) : 0,
        })),
      },
    });
  };

  const handleFormChange = (event, variantIndex) => {
    const { name, value } = event.target;
    setFormData((prevState) => {
      const updatedVariant = {
        ...prevState.tmtseriesvariant[variantIndex],
        [name]: value,
      };
      const updatedForm = {
        ...prevState,
        tmtseriesvariant: prevState.tmtseriesvariant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
      };
      return updatedForm;
    });
  };

  const [modalView, setModalView] = useState(false);
  const [itemEdit, setItemEdit] = useState(null);
  const [UpdateTMTMasterVariant] = useMutation(UPDATE_MASTER_VARIANT, {
    onCompleted: () => {
      toast.success('Product Variant updated successfully!');
      setModalView(!modalView);
      setItemEdit(null);
      refetch();
    },
    onError: (err) => {
      console.log('UPDATE_MASTER_VARIANT', err);
    },
  });

  const editMasterVariant = (item1) => {
    setItemEdit(item1);
    setModalView(!modalView);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'moq') {
      setItemEdit((prevState) => ({
        ...prevState,
        [name]: parseInt(value, 10),
      }));
    } else {
      setItemEdit((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    await UpdateTMTMasterVariant({
      variables: {
        updateTmtMasterVariantId: data?.getTmtMasterByBrandCat.id,
        variantId: itemEdit.id,
        ...itemEdit,
      },
    });
  };

  const [DeleteTMTMasterVariant] = useMutation(DELETE_MASTER_VARIANT, {
    onCompleted: () => {
      toast.success('Product Variant deleted successfully!');
      refetch();
    },
  });

  const deleteTMTMasterVariant = async (item1) => {
    if (!data?.getTmtMasterByBrandCat?.id) return;

    await DeleteTMTMasterVariant({
      variables: {
        deleteTmtMasterVariantId: data.getTmtMasterByBrandCat.id,
        variantId: item1.id,
      },
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="text-dark pb-1" to="/admin/dashboard">
              <span className="ms-1">Dashboard</span>
            </NavLink>
            <span className="p-2 small"> / </span>
            <NavLink className="text-dark pb-1" to="/admin/tmt/list_master">
              <span className="ms-1">Product Master List</span>
            </NavLink>
            <span className="p-2 small"> / </span>
            <NavLink className="text-dark pb-1" to="#">
              <span className="ms-1">{title}</span>
            </NavLink>
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
      <Row>
        <Col className="col-12">
          <Card className="mb-5">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {formData.tmtseriesvariant.map((variant, variantIndex) => (
                  <div key={variantIndex} className="mb-3">
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`tmtseriesvariant[${variantIndex}].variantName`}>
                          <Form.Label className="fw-bold text-dark">Product Master Name</Form.Label>
                          <Form.Control
                            required
                            type="text"
                            name="variantName"
                            value={brandcompcat || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            readOnly
                          />
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`tmtseriesvariant[${variantIndex}].variantName`}>
                          <Form.Label className="fw-bold text-dark">
                            Variant Name <span className="fw-bold text-danger"> * </span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="variantName"
                            value={variant.variantName || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[`variantName_${variantIndex}`]}
                          />
                          <Form.Control.Feedback type="invalid">{errors[`variantName_${variantIndex}`]}</Form.Control.Feedback>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`tmtseriesvariant[${variantIndex}].moq`}>
                          <Form.Label className="fw-bold text-dark">
                            MOQ <span className="fw-bold text-danger"> * </span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="moq"
                            value={variant.moq || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[`moq_${variantIndex}`]}
                          />
                          <Form.Control.Feedback type="invalid">{errors[`moq_${variantIndex}`]}</Form.Control.Feedback>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 mb-2">
                        <Form.Group controlId={`tmtseriesvariant[${variantIndex}].hsn`}>
                          <Form.Label className="fw-bold text-dark">
                            HSN <span className="fw-bold text-danger"> * </span>
                          </Form.Label>
                          <Form.Control
                            type="number"
                            name="hsn"
                            value={variant.hsn || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            onWheel={(e) => e.target.blur()}
                            isInvalid={!!errors[`hsn_${variantIndex}`]}
                          />
                          <Form.Control.Feedback type="invalid">{errors[`hsn_${variantIndex}`]}</Form.Control.Feedback>
                        </Form.Group>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="submit" className="float-end">
                  Submit
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col className="col-12">
          <Row className="g-0 align-content-center d-none d-lg-flex fw-bold p-3 bg-white mb-1 rounded pe-5 mb-2">
            <Col xs="3" lg="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-dark">Product Master Name</div>
            </Col>
            <Col xs="3" lg="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-dark">Variant Name</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark">MOQ</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark">HSN</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark"> Action</div>
            </Col>
          </Row>
          {data?.getTmtMasterByBrandCat?.tmtseriesvariant && data.getTmtMasterByBrandCat.tmtseriesvariant.length > 0 ? (
            data.getTmtMasterByBrandCat.tmtseriesvariant.map((item, index) => (
              <Card className="mb-2" key={index}>
                <Card.Body className="pt-0 pb-0 sh-8 sh-lg-6">
                  <Row className="g-0 h-100 align-content-center">
                    <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1 ">
                      <div className="text-alternate">{brandcompcat}</div>
                    </Col>
                    <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1 ">
                      <div className="text-alternate">{item.variantName}</div>
                    </Col>
                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-2 ">
                      <div className="text-alternate">{item.moq}</div>
                    </Col>
                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 ">
                      <div className="text-alternate">{item.hsn}</div>
                    </Col>
                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4 ">
                      <div>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit Variant Name</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button
                              onClick={() => {
                                editMasterVariant(item);
                              }}
                              variant="foreground-alternate"
                              className="btn-icon btn-icon-only shadow"
                            >
                              <CsLineIcons icon="edit-square" className="text-primary" size="17" />
                            </Button>
                          </div>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Delete Variant</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button
                              variant="foreground-alternate"
                              className="btn-icon btn-icon-only shadow"
                              onClick={() => {
                                deleteTMTMasterVariant(item);
                              }}
                            >
                              <CsLineIcons icon="bin" className="text-primary" size="17" />
                            </Button>
                          </div>
                        </OverlayTrigger>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          ) : (
            <div className="d-flex justify-content-center rounded bg-white p-5">
              <p className="text-center">No variants found.</p>
            </div>
          )}
        </Col>
      </Row>
      <Modal show={modalView} onHide={() => setModalView(!modalView)}>
        <Modal.Header closeButton className="p-3">
          <Modal.Title className="fw-bold text-dark">Edit Variant Name</Modal.Title>
        </Modal.Header>
        <div className="p-4 pt-2">
          {itemEdit && (
            <Form onSubmit={submitEdit}>
              <div className="my-3">
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="variantName">
                      <Form.Label className="fw-bold text-dark">Product Master Name</Form.Label>
                      <Form.Control type="text" name="variantName" value={brandcompcat || ''} readOnly />
                    </Form.Group>
                  </div>
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="variantName">
                      <Form.Label className="fw-bold text-dark">
                        Variant Name <span className="fw-bold text-danger"> * </span>
                      </Form.Label>
                      <Form.Control required type="text" name="variantName" value={itemEdit.variantName || ''} onChange={handleEditChange} />
                    </Form.Group>
                  </div>
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="moq">
                      <Form.Label className="fw-bold text-dark">
                        MOQ <span className="fw-bold text-danger"> * </span>
                      </Form.Label>
                      <Form.Control type="number" required onWheel={(e) => e.target.blur()} name="moq" value={itemEdit.moq || 0} onChange={handleEditChange} />
                    </Form.Group>
                  </div>
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="hsn">
                      <Form.Label className="fw-bold text-dark">
                        HSN <span className="fw-bold text-danger"> * </span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="hsn"
                        required
                        onWheel={(e) => e.target.blur()}
                        onKeyPress={(e) => {
                          if (e.target.value.length >= 8) e.preventDefault();
                        }}
                        value={itemEdit.hsn || ''}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>
              <Button type="submit" className="float-end">
                Submit
              </Button>
            </Form>
          )}
        </div>
      </Modal>
    </>
  );
};

export default withRouter(TmtVariantAdd);
