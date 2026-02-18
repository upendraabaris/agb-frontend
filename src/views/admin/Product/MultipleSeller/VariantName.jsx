import React, { useState, useEffect } from 'react';
import { useParams, NavLink, withRouter } from 'react-router-dom';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import GstTypeData from 'globalValue/attributes dropdown data/GstTypeData';
import PriceTypeData from 'globalValue/attributes dropdown data/PriceTypeData';
import ExtraChargeTypeData from 'globalValue/attributes dropdown data/ExtraChargeTypeData';
import TransportChargeData from 'globalValue/attributes dropdown data/TransportChargeData';
import FinalPriceTypeData from 'globalValue/attributes dropdown data/FinalPriceTypeData';
import UnitTypeData from 'globalValue/attributes dropdown data/UnitTypeData';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

/* ================= GraphQL ================= */
const GET_TMT_MASTER_VARIANT_BY_BRANDCAT = gql`
  query GetSeriesVariantByForSeller($productId: ID) {
    getSeriesVariantByForSeller(productId: $productId) {
      product {
        id
        fullName
      }
      id
      variantName
      hsn
      moq
      finalPrice
      gstRate
      gstType
      priceType
      unitType
      transportChargeType
      extraChargeType
      silent_features
    }
  }
`;

const GET_SERIES_PRODUCT = gql`
  query GetSeriesProduct($getSeriesProductId: ID!) {
    getSeriesProduct(id: $getSeriesProductId) {
      id
      fullName
    }
  }
`;

const UPDATE_SERIES_VARIANT = gql`
  mutation UpdateSeriesVariantById(
    $variantId: ID!
    $variantName: String
    $hsn: String
    $moq: Int
    $active: Boolean
    $silentFeatures: String
    $finalPrice: String
    $transportChargeType: String
    $extraChargeType: String
    $gstType: Boolean
    $gstRate: Float
    $unitType: String
    $priceType: String
  ) {
    updateSeriesVariantById(
      variantId: $variantId
      variantName: $variantName
      hsn: $hsn
      moq: $moq
      active: $active
      silent_features: $silentFeatures
      finalPrice: $finalPrice
      transportChargeType: $transportChargeType
      extraChargeType: $extraChargeType
      gstType: $gstType
      gstRate: $gstRate
      unitType: $unitType
      priceType: $priceType
    ) {
      variantName
    }
  }
`;

const MULTIPLE_SELLER_ADD_VARIANT = gql`
  mutation MultipleSellerAddVariant($multipleSellerAddVariantId: ID, $seriesvariant: [SeriesVariantInput]) {
    multipleSellerAddVariant(id: $multipleSellerAddVariantId, seriesvariant: $seriesvariant) {
      brand_name
    }
  }
`;

const DELETE_SERIES_VARIANT = gql`
  mutation DeleteSeriesVariant($variantId: ID!) {
    deleteSeriesVariant(variantId: $variantId) {
      id
      message
    }
  }
`;

const TmtVariantAdd = ({ history }) => {
  const title = 'Add Variant Details';
  const description = 'Add Variant Details';
  const { seriesId } = useParams();
  const dispatch = useDispatch();
  const [modalView, setModalView] = useState(false);
  const [itemEdit, setItemEdit] = useState(null);
  const gstdata = GstTypeData();
  const pricedata = PriceTypeData();
  const unitData = UnitTypeData();
  const extraChargedata = ExtraChargeTypeData();
  const transportChargedata = TransportChargeData();
  const finalPricedata = FinalPriceTypeData();
  const editMasterVariant = (variant) => {
    setItemEdit(variant);
    setModalView(true);
  };

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const [GetTmtMasterByBrandCat, { error, data, refetch }] = useLazyQuery(GET_TMT_MASTER_VARIANT_BY_BRANDCAT, {
    variables: {
      productId: seriesId,
    },
    fetchPolicy: 'network-only',
    onError(err) {
      console.log(`GET_TMT_MASTER_VARIANT_BY_BRANDCAT Error: ${err.message}`);
    },
  });

  const {
    data: productData,
    loading: productLoading,
    error: productError,
  } = useQuery(GET_SERIES_PRODUCT, {
    variables: { getSeriesProductId: seriesId },
    skip: !seriesId,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (seriesId) {
      GetTmtMasterByBrandCat();
    }
  }, [seriesId, GetTmtMasterByBrandCat]);

  /* ================= Helpers ================= */
  const initialVariantState = {
    hsn: '',
    variantName: '',
    moq: 1,
    finalPrice: '',
    gstRate: '',
    gstType: false,
    priceType: '',
    unitType: '',
    transportChargeType: '',
    extraChargeType: '',
  };

  const [formData, setFormData] = useState({
    seriesvariant: [initialVariantState],
  });

  const [lockedHsn, setLockedHsn] = useState(null);

  useEffect(() => {
    if (data?.getSeriesVariantByForSeller?.length > 0) {
      const existingHsn = data.getSeriesVariantByForSeller[0]?.hsn;
      if (existingHsn) {
        setLockedHsn(existingHsn);
        setFormData((prev) => ({
          ...prev,
          seriesvariant: prev.seriesvariant.map((v) => ({ ...v, hsn: existingHsn })),
        }));
      }
    }
  }, [data]);

  const [MultipleSellerAddVariant] = useMutation(MULTIPLE_SELLER_ADD_VARIANT, {
    onCompleted: () => {
      toast.success('Variant added successfully!');
      setFormData({
        seriesvariant: [initialVariantState],
      });
      refetch();
    },
    onError: (err) => {
      console.log('MULTIPLE_SELLER_ADD_VARIANT Error:', err);
    },
  });

  const [errors, setErrors] = useState([]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const newErrors = [];
    formData.seriesvariant.forEach((variant, i) => {
      const variantErrors = {};
      if (!variant.moq || Number.isNaN(variant.moq) || parseInt(variant.moq, 10) <= 0) {
        variantErrors.moq = 'MOQ is required and must be greater than 0';
      }
      if (!variant.hsn || !/^\d{4,8}$/.test(variant.hsn)) {
        variantErrors.hsn = 'HSN is required and must be of minimum 4 and maximum 8 digits';
      }
      if (variant.finalPrice === '' || variant.finalPrice === null) variantErrors.finalPrice = 'Final Price is required';
      if (variant.gstRate === '' || variant.gstRate === null) variantErrors.gstRate = 'GST Rate is required';
      if (variant.gstType === '' || variant.gstType === null) variantErrors.gstType = 'GST Type is required';
      if (!variant.priceType?.trim()) variantErrors.priceType = 'Price Type is required';
      if (!variant.unitType?.trim()) variantErrors.unitType = 'Unit Type is required';
      if (!variant.transportChargeType?.trim()) variantErrors.transportChargeType = 'Transport Charge Type is required';
      if (!variant.extraChargeType?.trim()) variantErrors.extraChargeType = 'Extra Charge Type is required';
      newErrors[i] = variantErrors;
    });

    setErrors(newErrors);
    const hasErrors = newErrors.some((err) => Object.keys(err).length > 0);
    if (hasErrors) return;

    await MultipleSellerAddVariant({
      variables: {
        multipleSellerAddVariantId: seriesId,
        seriesvariant: formData.seriesvariant.map((variant) => ({
          ...variant,
          hsn: lockedHsn || variant.hsn,
          moq: variant.moq !== '' ? parseInt(variant.moq, 10) : 0,
          gstRate: variant.gstRate !== '' ? parseFloat(variant.gstRate) : 0,
          gstType: Boolean(variant.gstType),
        })),
      },
    });
  };

  const handleFormChange = (event, variantIndex) => {
    const { name, value } = event.target;
    setFormData((prevState) => {
      const updatedVariant = {
        ...prevState.seriesvariant[variantIndex],
        [name]: value,
      };
      const updatedForm = {
        ...prevState,
        seriesvariant: prevState.seriesvariant.map((variant, index) => (index === variantIndex ? updatedVariant : variant)),
      };
      return updatedForm;
    });
  };

  const [UpdateSeriesVariantById] = useMutation(UPDATE_SERIES_VARIANT, {
    onCompleted: () => {
      toast.success('Variant updated successfully!');
      setModalView(false);
      setItemEdit(null);
      refetch();
    },
    onError: (err) => {
      console.log('UPDATE_SERIES_VARIANT Error:', err);
    },
  });

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setItemEdit((prev) => ({
      ...prev,
      [name]: name === 'moq' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!itemEdit?.id) return;
    try {
      await UpdateSeriesVariantById({
        variables: {
          variantId: itemEdit.id,
          variantName: itemEdit.variantName,
          moq: itemEdit.moq,
          hsn: itemEdit.hsn,
          active: true,
          finalPrice: itemEdit.finalPrice,
          gstRate: parseFloat(itemEdit.gstRate) || 0,
          gstType: itemEdit.gstType,
          priceType: itemEdit.priceType,
          unitType: itemEdit.unitType,
          transportChargeType: itemEdit.transportChargeType,
          extraChargeType: itemEdit.extraChargeType,
          silentFeatures: itemEdit.silentFeatures,
        },
      });
    } catch (err) {
      console.error('Mutation failed:', err);
      toast.error('Failed to update variant. Check console for details.');
    }
  };

  const [deleteSeriesVariant] = useMutation(DELETE_SERIES_VARIANT, {
    refetchQueries: ['GetSeriesVariantByForSeller'],
  });
  const deletemasterVariant = async (variant) => {
    try {
      const res = await deleteSeriesVariant({
        variables: { variantId: variant.id },
      });

      if (res.data?.deleteSeriesVariant?.message) {
        toast.success('Variant deleted successfully');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting variant');
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
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="text-dark pb-1" to="/admin/dashboard">
              <span className="ms-1">Dashboard</span>
            </NavLink>
            <span className="p-2 small"> / </span>
            <NavLink className="text-dark pb-1" to="/admin/Product/MultipleSellerList">
              <span className="ms-1">Add Variant</span>
            </NavLink>
            <span className="p-2 small"> / </span>
            <NavLink className="text-dark pb-1" to="#">
              <span className="ms-1">{title}</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <h5 className="fw-bold text-dark p-2 bg-white mb-2 text-center fs-5">{title}</h5>
      <Row>
        <Col className="col-12">
          <Card className="mb-5">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {formData.seriesvariant.map((variant, variantIndex) => (
                  <div key={variantIndex} className="mb-3">
                    <div className="row">
                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].productName`}>
                          <Form.Label className="fw-bold text-dark">Product Full Name</Form.Label>
                          <Form.Control type="text" value={productData?.getSeriesProduct?.fullName || ''} readOnly />
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].moq`}>
                          <Form.Label className="fw-bold text-dark">
                            MOQ <span className="fw-bold text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Minimum order quantity for wholesale (B2B).
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
                            readOnly
                            required
                            onWheel={(e) => e.target.blur()}
                            name="moq"
                            value={variant.moq || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[variantIndex]?.moq}
                          />
                          <Form.Control.Feedback type="invalid">{errors[variantIndex]?.moq}</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].hsn`}>
                          <Form.Label className="fw-bold text-dark">
                            HSN <span className="fw-bold text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Harmonized System of Nomenclature code for tax purposes.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="hsn"
                            maxLength={8}
                            value={lockedHsn || variant.hsn || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[variantIndex]?.hsn}
                            readOnly={!!lockedHsn}
                          />
                          <Form.Control.Feedback type="invalid">{errors[variantIndex]?.hsn}</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].variantName`}>
                          <Form.Label className="fw-bold text-dark">
                            Variant Name <span className="fw-bold text-danger"> </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Name for this specific product variant.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Control type="text" name="variantName" value={variant.variantName || ''} onChange={(e) => handleFormChange(e, variantIndex)} />
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].gstType`}>
                          <Form.Label className="fw-bold text-dark">
                            GST Type<span className="fw-bold text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose how price is shown to customers (inclusive or exclusive of GST).
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select
                            name="gstType"
                            value={variant.gstType ? 'true' : 'false'}
                            onChange={(e) => handleFormChange({ target: { name: 'gstType', value: e.target.value === 'true' } }, variantIndex)}
                            isInvalid={!!errors[variantIndex]?.gstType}
                          >
                            <option value="false">Inclusive</option>
                            <option value="true">Exclusive</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors[variantIndex]?.gstType}</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].gstRate`}>
                          <Form.Label className="fw-bold text-dark">
                            GST Rate<span className="fw-bold text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Applicable GST percentage for this product.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select
                            name="gstRate"
                            value={variant.gstRate || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[variantIndex]?.gstRate}
                          >
                            <option hidden>Select</option>
                            {gstdata.map((gst, i) => (
                              <option key={i} value={gst.gstRate}>
                                {gst.gstRate}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors[variantIndex]?.gstRate}</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].priceType`}>
                          <Form.Label className="fw-bold text-dark">
                            Price Type<span className="fw-bold text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose price type: MRP, Selling Price, etc.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select
                            name="priceType"
                            value={variant.priceType || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[variantIndex]?.priceType}
                          >
                            <option hidden>Select</option>
                            {pricedata.map((price, i) => (
                              <option key={i} value={price.symbol}>
                                {price.title}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors[variantIndex]?.priceType}</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].extraChargeType`}>
                          <Form.Label className="fw-bold text-dark">
                            Extra Charge Type<span className="fw-bold text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Type of additional charge like packing.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select
                            name="extraChargeType"
                            value={variant.extraChargeType || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[variantIndex]?.extraChargeType}
                          >
                            <option hidden>Select</option>
                            {extraChargedata.map((extra, i) => (
                              <option key={i} value={extra.title}>
                                {extra.title}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors[variantIndex]?.extraChargeType}</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].finalPrice`}>
                          <Form.Label className="fw-bold text-dark">
                            Final Price Type<span className="fw-bold text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose which price is final for billing.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select
                            name="finalPrice"
                            value={variant.finalPrice || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[variantIndex]?.finalPrice}
                          >
                            <option hidden>Select</option>
                            {finalPricedata.map((finalPrice, i) => (
                              <option key={i} value={finalPrice.title}>
                                {finalPrice.title}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors[variantIndex]?.finalPrice}</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].transportChargeType`}>
                          <Form.Label className="fw-bold text-dark">
                            Transport Charge Type<span className="fw-bold text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose how delivery charge is applied.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select
                            name="transportChargeType"
                            value={variant.transportChargeType || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[variantIndex]?.transportChargeType}
                          >
                            <option hidden>Select</option>
                            {transportChargedata.map((transport, i) => (
                              <option key={i} value={transport.title}>
                                {transport.title}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors[variantIndex]?.transportChargeType}</Form.Control.Feedback>
                        </Form.Group>
                      </div>

                      <div className="col-md-3 mb-2">
                        <Form.Group controlId={`seriesvariant[${variantIndex}].unitType`}>
                          <Form.Label className="fw-bold text-dark">
                            Unit Type<span className="fw-bold text-danger"> * </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Select unit of measurement (e.g., piece, kg).
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <Form.Select
                            name="unitType"
                            value={variant.unitType || ''}
                            onChange={(e) => handleFormChange(e, variantIndex)}
                            isInvalid={!!errors[variantIndex]?.unitType}
                          >
                            <option hidden>Select</option>
                            {unitData.map((unit, i) => (
                              <option key={i} value={unit.symbol}>
                                {unit.title}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{errors[variantIndex]?.unitType}</Form.Control.Feedback>
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
            <Col xs="3" lg="3" className="d-flex flex-column mb-lg-0 pe-3">
              <div className="text-dark">Product Full Name</div>
            </Col>
            <Col xs="3" lg="3" className="d-flex flex-column mb-lg-0 pe-3">
              <div className="text-dark">Variant Name</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark">MOQ</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark">HSN</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark">Action</div>
            </Col>
          </Row>

          {data?.getSeriesVariantByForSeller && data.getSeriesVariantByForSeller.length > 0 ? (
            data.getSeriesVariantByForSeller.map((item, index) => (
              <Card className="mb-2" key={index}>
                <Card.Body className="pt-0 pb-0 sh-8 sh-lg-6">
                  <Row className="g-0 h-100 align-content-center">
                    <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1">
                      <div className="text-alternate">{item.product?.fullName || '-'}</div>
                    </Col>

                    <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1">
                      <div className="text-alternate">{item.variantName}</div>
                    </Col>

                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-2">
                      <div className="text-alternate">{item.moq}</div>
                    </Col>

                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3">
                      <div className="text-alternate">{item.hsn}</div>
                    </Col>

                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4">
                      <div>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit Variant</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button onClick={() => editMasterVariant(item)} variant="foreground-alternate" className="btn-icon btn-icon-only shadow">
                              <CsLineIcons icon="edit-square" className="text-primary" size="17" />
                            </Button>
                          </div>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Delete Variant</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={() => deletemasterVariant(item)}>
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
              <p className="text-center">loading...</p>
            </div>
          )}
        </Col>
      </Row>
      <Modal show={modalView} onHide={() => setModalView(false)}>
        <Modal.Header closeButton className="p-3">
          <Modal.Title className="fw-bold text-dark">Edit Variant</Modal.Title>
        </Modal.Header>
        <div className="p-4 pt-2">
          {itemEdit && (
            <Form onSubmit={submitEdit}>
              <div className="row">
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="productName">
                    <Form.Label className="fw-bold text-dark">Product Full Name</Form.Label>
                    <Form.Control type="text" value={data?.getSeriesVariantByForSeller?.[0]?.product?.fullName || ''} readOnly />
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="moq">
                    <Form.Label className="fw-bold text-dark">
                      MOQ <span className="fw-bold text-danger">*</span>
                    </Form.Label>
                    <Form.Control type="number" required onWheel={(e) => e.target.blur()} name="moq" value={itemEdit.moq || 0} onChange={handleEditChange} />
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="hsn">
                    <Form.Label className="fw-bold text-dark">
                      HSN<span className="fw-bold text-danger">*</span>
                    </Form.Label>
                    <Form.Control type="text" required name="hsn" maxLength={8} value={itemEdit.hsn || ''} onChange={handleEditChange} readOnly={!!lockedHsn} />
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="variantName">
                    <Form.Label className="fw-bold text-dark">
                      Variant Name <span className="fw-bold text-danger">*</span>
                    </Form.Label>
                    <Form.Control required type="text" name="variantName" value={itemEdit.variantName || ''} onChange={handleEditChange} />
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="gstType">
                    <Form.Label className="fw-bold text-dark">GST Type</Form.Label>
                    <Form.Select
                      name="gstType"
                      value={itemEdit.gstType ? 'true' : 'false'}
                      onChange={(e) =>
                        setItemEdit((prev) => ({
                          ...prev,
                          gstType: e.target.value === 'true',
                        }))
                      }
                    >
                      <option value="false">Inclusive</option>
                      <option value="true">Exclusive</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="gstRate">
                    <Form.Label className="fw-bold text-dark">GST Rate (%)</Form.Label>
                    <Form.Select type="number" step="0.01" name="gstRate" value={itemEdit.gstRate || ''} onChange={handleEditChange}>
                      <option hidden>GST Rate</option>
                      {gstdata.map((gst, i) => (
                        <option key={i} value={gst.gstRate}>
                          {gst.gstRate}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="priceType">
                    <Form.Label className="fw-bold text-dark">Price Type</Form.Label>
                    <Form.Select type="text" name="priceType" value={itemEdit.priceType || ''} onChange={handleEditChange}>
                      <option hidden>Price Type </option>
                      {pricedata.map((price, i) => (
                        <option key={i} value={price.symbol}>
                          {price.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="extraChargeType">
                    <Form.Label className="fw-bold text-dark">Extra Charge Type</Form.Label>
                    <Form.Select type="text" name="extraChargeType" value={itemEdit.extraChargeType || ''} onChange={handleEditChange}>
                      <option hidden>Extra Charge Type</option>
                      {extraChargedata.map((extra, i) => (
                        <option key={i} value={extra.title}>
                          {extra.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="finalPrice">
                    <Form.Label className="fw-bold text-dark">Final Price</Form.Label>
                    <Form.Select type="text" name="finalPrice" value={itemEdit.finalPrice || ''} onChange={handleEditChange}>
                      <option hidden>Final Price Type</option>
                      {finalPricedata.map((finalPrice, i) => (
                        <option key={i} value={finalPrice.title}>
                          {finalPrice.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="transportChargeType">
                    <Form.Label className="fw-bold text-dark">Transport Charge Type</Form.Label>
                    <Form.Select type="text" name="transportChargeType" value={itemEdit.transportChargeType || ''} onChange={handleEditChange}>
                      <option hidden>Delivery Charge Type</option>
                      {transportChargedata.map((transport, i) => (
                        <option key={i} value={transport.title}>
                          {transport.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-2">
                  <Form.Group controlId="unitType">
                    <Form.Label className="fw-bold text-dark">Unit Type</Form.Label>
                    <Form.Select type="text" name="unitType" value={itemEdit.unitType || ''} onChange={handleEditChange}>
                      <option hidden>Unit Type</option>
                      {unitData.map((unit, i) => (
                        <option key={i} value={unit.symbol}>
                          {unit.title}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className="col-md-12 mb-2">
                  <Form.Group controlId="silentFeatures">
                    <Form.Label className="fw-bold text-dark">Silent Features</Form.Label>
                    <Form.Control as="textarea" rows={3} name="silentFeatures" value={itemEdit.silentFeatures || ''} onChange={handleEditChange} />
                  </Form.Group>
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
