import React, { useEffect, useState, useRef } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { NavLink, withRouter } from 'react-router-dom';
import { Row, Col, Form, Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import SeriesCategorySection from './components/SeriesCategorySection';

 const CREATE_SERIES_PRODUCT = gql`
    mutation CreateSeriesProduct(
      $previewName: String
      $table: Boolean
      $fullName: String
      $brandName: String
      $description: String
      $sellerNotes: String
      $giftOffer: String
      $youtubeLink: String
      $cancellationPolicy: String
      $shippingPolicy: String
      $returnPolicy: String
      $productImages: [Upload]
      $categories: [String]
      $faq: [SeriesFaqInput]
      $listingCommType: String
      $listingComm: Float
      $productCommType: String
      $productComm: Float
      $shippingCommType: String
      $shippingComm: Float
      $fixedCommType: String
      $fixedComm: Float
      $seriesType: String 
    ) {
      createSeriesProduct(
        previewName: $previewName
        table: $table
        fullName: $fullName
        brand_name: $brandName
        description: $description
        sellerNotes: $sellerNotes
        giftOffer: $giftOffer
        youtubeLink: $youtubeLink
        cancellationPolicy: $cancellationPolicy
        shippingPolicy: $shippingPolicy
        returnPolicy: $returnPolicy
        productImages: $productImages
        categories: $categories
        faq: $faq
        listingCommType: $listingCommType
        listingComm: $listingComm
        productCommType: $productCommType
        productComm: $productComm
        shippingCommType: $shippingCommType
        shippingComm: $shippingComm
        fixedCommType: $fixedCommType
        fixedComm: $fixedComm
        seriesType: $seriesType 
      ) {
        id
      }
    }
  `;

  const GET_SHIPPING_POLICY = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        key
        content
      }
    }
  `;

function AddSeries({ history }) {
  const title = 'Add Series Product';
  const description = ' Add Series Product';

  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

 

  const initialStates = {
    previewName: '',
    fullName: '',
    brandName: '',
    description: '',
    sellerNotes: '',
    giftOffer: '',
    youtubeLink: '',
    cancellationPolicy: '',
    shippingPolicy: '',
    returnPolicy: '',
    productImages: [],
    categories: [],
    faq: [],
    listingComm: '',
    productComm: '',
    shippingComm: '',
    fixedComm: '',
    productCommType: "percentage",
    listingCommType: "fix",
    fixedCommType: "fix",
    shippingCommType: "percentage",
    table: true,
    seriesType: "normal",
  };

  const [formData, setFormData] = useState(initialStates); 

  const [CreateSeriesProduct] = useMutation(CREATE_SERIES_PRODUCT, {
    onCompleted: () => {
      toast.success('Series Product Created Successfully !');
      setFormData(initialStates);
      setTimeout(() => {
        history.push('/admin/series/list');
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong !'); 
    },
  });

  const [selectedPolicy, setSelectedPolicy] = useState("cancellation");

  const [GetSiteContent] = useLazyQuery(GET_SHIPPING_POLICY, {
    onCompleted: (res) => {
      if (res.getSiteContent.key === 'shipping-policy') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          shippingPolicy: res.getSiteContent?.content,
        }));
      }
      if (res.getSiteContent.key === 'return-policy') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          returnPolicy: res.getSiteContent?.content,
        }));
      }
      if (res.getSiteContent.key === 'cancellation-policy') {
        setFormData((prevFormData) => ({
          ...prevFormData,
          cancellationPolicy: res.getSiteContent?.content,
        }));
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  useEffect(() => {
    const getsiteContent = async () => {
      await GetSiteContent({
        variables: {
          key: 'shipping-policy',
        },
      });

      await GetSiteContent({
        variables: {
          key: 'return-policy',
        },
      });
      await GetSiteContent({
        variables: {
          key: 'cancellation-policy',
        },
      });
    };
    getsiteContent();
  }, [GetSiteContent]);

  const handleSilentFeaturesChange = (silentdesc) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      silentFeatures: silentdesc,
    }));
  };

  const handleDescriptionChange = (desc) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: desc,
    }));
  };

  const handleSellerNoteChange = (sellernote) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      sellerNotes: sellernote,
    }));
  };

  const handleCancellationPolicyChange = (cancellationPolicies) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      cancellationPolicy: cancellationPolicies,
    }));
  };
  const handleShippingPolicyChange = (shippingPolicies) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      shippingPolicy: shippingPolicies,
    }));
  };

  const handlereturnPolicyChange = (returnPolicies) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      returnPolicy: returnPolicies,
    }));
  };

  const handleTableChange = (e) => {
    const value = e.target.value === 'true'; // Convert the string 'true' to a boolean
    setFormData((prevState) => ({ ...prevState, table: value })); // Update the form data with the boolean value
  };

  const fieldRefs = {
    fullName: useRef(null),
    brandName: useRef(null),
    previewName: useRef(null),
    productImages: useRef(null),
    description: useRef(null),
    categories: useRef(null),
    listingCommType: useRef(null),
    listingComm: useRef(null),
    productCommType: useRef(null),
    productComm: useRef(null),
    shippingCommType: useRef(null),
    shippingComm: useRef(null),
    fixedCommType: useRef(null),
    fixedComm: useRef(null),
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    const numericFields = ['listingComm', 'productComm', 'shippingComm', 'fixedComm'];

    if (name === 'productImages') {
      setFormData((prev) => ({ ...prev, [name]: files }));
    } else if (numericFields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : parseFloat(value), // <-- allow empty string
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFaqChange = (index, field, value) => {
    setFormData((prevFormData) => {
      const faq = [...prevFormData.faq];
      faq[index] = {
        ...faq[index],
        [field]: value,
      };
      return {
        ...prevFormData,
        faq,
      };
    });
  };

  const handleAddFaq = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      faq: [...prevFormData.faq, { question: '', answer: '' }],
    }));
  };

  const handleRemoveFaq = (index) => {
    setFormData((prevFormData) => {
      const faq = [...prevFormData.faq];
      faq.splice(index, 1);
      return {
        ...prevFormData,
        faq,
      };
    });
  };

  const [errors, setErrors] = useState({});

  async function handleProduct(e) {
    e.preventDefault();

    const requiredFields = [
      "fullName",
      "brandName",
      "previewName",
      "productImages",
      "description",
      "categories",
      "listingCommType",
      "listingComm",
      "productCommType",
      "productComm",
      "shippingCommType",
      "shippingComm",
      "fixedCommType",
      "fixedComm",
    ];

    const newErrors = {};
    let firstErrorField = null;

    requiredFields.forEach((field) => {
      const value = formData[field];
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty && !firstErrorField) {
        firstErrorField = field;
      }

      // ✅ Field-specific checks
      if (field === "productImages" && (!value || value.length === 0)) {
        newErrors[field] = "Please upload product images!";
      }

      if (field === "categories" && (!value || value.length === 0)) {
        newErrors[field] = "Please choose at least one category!";
      }

      if (field === "fullName" && isEmpty) {
        newErrors[field] = "Product Full Name is required!";
      }

      if (field === "brandName" && isEmpty) {
        newErrors[field] = "Brand Name is required!";
      }

      if (field === "previewName" && isEmpty) {
        newErrors[field] = "Preview Name is required!";
      }

      if (field === "description" && isEmpty) {
        newErrors[field] = "Description is required!";
      }

      if (field === "listingCommType" && isEmpty) {
        newErrors[field] = "Listing Commission Type is required!";
      }

      if (field === "listingComm" && isEmpty) {
        newErrors[field] = "Listing Commission is required!";
      }

      if (field === "productCommType" && isEmpty) {
        newErrors[field] = "Product Commission Type is required!";
      }

      if (field === "productComm" && isEmpty) {
        newErrors[field] = "Product Commission is required!";
      }

      if (field === "shippingCommType" && isEmpty) {
        newErrors[field] = "Shipping Commission Type is required!";
      }

      if (field === "shippingComm" && isEmpty) {
        newErrors[field] = "Shipping Commission is required!";
      }

      if (field === "fixedCommType" && isEmpty) {
        newErrors[field] = "Fixed Commission Type is required!";
      }

      if (field === "fixedComm" && isEmpty) {
        newErrors[field] = "Fixed Commission is required!";
      }
    });

    setErrors(newErrors);

    // scroll & focus first error
    if (firstErrorField && fieldRefs[firstErrorField]?.current) {
      const element = fieldRefs[firstErrorField].current;
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      if (element.focus) element.focus();
    }

    // stop submit if errors exist
    if (Object.keys(newErrors).length > 0) return;

    try {
      await CreateSeriesProduct({
        variables: {
          ...formData,       
        },
      });
    } catch (error) { 
      toast.error(error.message || "Something went wrong while creating the series product!");
    }
  }

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
            <span className="ms-2 fw-semibold text-dark">{title}</span>
          </Col>
        </Row>
      </div>

      <h5 style={{ backgroundColor: "#CEE6EA" }} className="fw-bold text-dark p-2 mb-2 border rounded
       text-center fs-5">
        {title}
      </h5>

      <Card className="mb-3 border rounded">
        <Card.Body>
          <Form onSubmit={(e) => handleProduct(e)}>
            <Card className="mb-3 border rounded">
              <div className="mark">
                <div className=" fw-bold ps-4 p-1 fs-6">Basic Details</div>{' '}
              </div>
              <div className="mb-3 px-3 mt-3">
                <Form.Label className="fw-bold text-dark">
                  Product Full Name <span className="text-danger"> *</span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Full name with clear type and key features. Maximum 100 characters.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block ms-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  maxLength={100}
                  ref={fieldRefs.fullName}
                  placeholder="Product Full Name"
                  value={formData.fullName}
                  onChange={(e) => {
                    if (e.target.value.includes('_')) {
                      e.target.value = e.target.value.replace('_', '');
                    }
                    if (e.target.value.includes('/')) {
                      e.target.value = e.target.value.replace('/', '');
                    }
                    handleChange(e);
                  }}
                />
                {errors.fullName && <span className="text-danger">{errors.fullName}</span>}
              </div>

              <div className="container mb-2 px-3">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <Form.Label className="fw-bold text-dark">
                      Product Preview Name <span className="text-danger"> *</span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Short name shown to customers in listings. Maximum 35 characters.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block ms-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="previewName"
                      maxLength={35}
                      ref={fieldRefs.previewName}
                      placeholder="Product Preview Name"
                      value={formData.previewName ?? ""}
                      onChange={handleChange} />
                    {errors.previewName && <span className="text-danger">{errors.previewName}</span>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <Form.Label className="fw-bold text-dark">
                      Brand Name <span className="text-danger"> *</span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Official brand name of the product.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block ms-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="brandName"
                      ref={fieldRefs.brandName}
                      placeholder="Brand Name"
                      value={formData.brandName ?? ""}
                      onChange={handleChange} />
                    {errors.brandName && <span className="text-danger">{errors.brandName}</span>}
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3 px-3">
                <Form.Label className="fw-bold text-dark">
                  Product Images <span className="text-danger"> * </span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Image that showcases the product from different angles or perspectives for customer viewing.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block ms-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  name="productImages"
                  ref={fieldRefs.productImages}
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    let isValid = true;

                    const checkImage = (file) =>
                      new Promise((resolve) => {
                        const img = new Image();
                        img.src = URL.createObjectURL(file);
                        img.onload = () => {
                          if (img.width !== img.height) {
                            isValid = false;
                          }
                          resolve();
                        };
                      });

                    Promise.all(files.map(checkImage)).then(() => {
                      if (!isValid) {
                        // reset input
                        e.target.value = "";
                        // show error
                        if (setErrors) {
                          setErrors((prev) => ({
                            ...prev,
                            productImages: "Only square images are allowed (equal width and height).",
                          }));
                        }
                      } else {
                        // clear error if valid
                        if (setErrors) {
                          setErrors((prev) => ({ ...prev, productImages: "" }));
                        }
                        handleChange(e);
                      }
                    });
                  }}
                />
                {errors.productImages && (
                  <span className="text-danger">{errors.productImages}</span>
                )}
              </div>

              <div className="mb-3 px-3" ref={fieldRefs.description}>
                <Form.Label className="fw-bold text-dark">
                  Description <span className="text-danger"> *</span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Full details about the product’s features and usage.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block ms-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Form.Label>

                <ReactQuill
                  modules={modules}
                  theme="snow"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleDescriptionChange}
                />

                {errors.description && <span className="text-danger">{errors.description}</span>}
              </div>

              {/* <div className="container px-3">
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <Form.Group controlId="table">
                      <Form.Label className="fw-bold text-dark">
                        Product View <span className="text-danger"> * </span>
                      </Form.Label>
                      <div className="row">
                        <div className="col-md-6">
                          <Form.Check
                            className="col-md-6"
                            type="radio"
                            name="table"
                            label="List"
                            value
                            checked={formData.table === true}
                            onChange={handleTableChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <Form.Check
                            type="radio"
                            name="table"
                            label="Table"
                            value={false}
                            checked={formData.table === false}
                            onChange={handleTableChange}
                            required
                          />
                        </div>
                      </div>
                    </Form.Group>
                  </div>
                </div>
              </div> */}
              <div className="mb-3 border p-3 rounded mx-3" ref={fieldRefs.categories}>
                <Form.Label className="fw-bold text-dark">
                  Select Categories for Product Placement <span className="text-danger"> * </span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Choose the right category for product listing.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block me-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Form.Label>

                {/* Category selector component */}
                <SeriesCategorySection setFormData={setFormData} />

                {/* Inline error message */}
                {errors.categories && (
                  <div className="mt-1">
                    <span className="text-danger">{errors.categories}</span>
                  </div>
                )}
              </div>

            </Card>
            <Card className="mb-3 border rounded">
              <div className="mark">
                <div className="fw-bold ps-4 p-1 fs-6">Policies</div>
              </div>

              <div className="p-3">
                <Form>
                  {/* Cancellation Policy */}
                  <div className="mb-3">
                    <Form.Check
                      type="radio"
                      id="cancellationPolicy"
                      label="Cancellation Policy"
                      name="policy"
                      value="cancellation"
                      checked={selectedPolicy === "cancellation"}
                      onChange={() => setSelectedPolicy("cancellation")}
                    />

                    {selectedPolicy === "cancellation" && (
                      <div className="mt-2">
                        <Form.Label className="fw-bold text-dark">
                          Cancellation Policy <span className="text-danger"> * </span>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-cancel" className="custom-tooltip">
                                Rules for order cancellation of this product.
                              </Tooltip>
                            }
                          >
                            <div className="d-inline-block ms-2">
                              <CsLineIcons icon="info-hexagon" size="17" />
                            </div>
                          </OverlayTrigger>
                        </Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="Cancellation Policy"
                          value={formData.cancellationPolicy}
                          onChange={(val) =>
                            setFormData((prev) => ({ ...prev, cancellationPolicy: val }))
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Shipping Policy */}
                  <div className="mb-3">
                    <Form.Check
                      type="radio"
                      id="shippingPolicy"
                      label="Shipping Policy"
                      name="policy"
                      value="shipping"
                      checked={selectedPolicy === "shipping"}
                      onChange={() => setSelectedPolicy("shipping")}
                    />

                    {selectedPolicy === "shipping" && (
                      <div className="mt-2">
                        <Form.Label className="fw-bold text-dark">
                          Shipping Policy <span className="text-danger"> * </span>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-ship" className="custom-tooltip">
                                Shipping timelines, charges, and coverage.
                              </Tooltip>
                            }
                          >
                            <div className="d-inline-block ms-2">
                              <CsLineIcons icon="info-hexagon" size="17" />
                            </div>
                          </OverlayTrigger>
                        </Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="Shipping Policy"
                          value={formData.shippingPolicy}
                          onChange={(val) =>
                            setFormData((prev) => ({ ...prev, shippingPolicy: val }))
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Return Policy */}
                  <div className="mb-3">
                    <Form.Check
                      type="radio"
                      id="returnPolicy"
                      label="Return Policy"
                      name="policy"
                      value="return"
                      checked={selectedPolicy === "return"}
                      onChange={() => setSelectedPolicy("return")}
                    />

                    {selectedPolicy === "return" && (
                      <div className="mt-2">
                        <Form.Label className="fw-bold text-dark">
                          Return Policy <span className="text-danger"> * </span>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-return" className="custom-tooltip">
                                Terms for return or replacement of the product.
                              </Tooltip>
                            }
                          >
                            <div className="d-inline-block ms-2">
                              <CsLineIcons icon="info-hexagon" size="17" />
                            </div>
                          </OverlayTrigger>
                        </Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="Return Policy"
                          value={formData.returnPolicy}
                          onChange={(val) =>
                            setFormData((prev) => ({ ...prev, returnPolicy: val }))
                          }
                        />
                      </div>
                    )}
                  </div>
                </Form>
              </div>
            </Card>

            <Card className="mb-3 border rounded">
              <div className="mark mb-3">
                <div className="fw-bold ps-4 p-1 fs-6">Commission / Fee Details</div>
              </div>
              <div className="row px-3">

                {/* Product Commission Type */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="productCommType">
                    <Form.Label className="fw-bold text-dark">
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

                    <Form.Select
                      name="productCommType"
                      value="percentage"   // always show Percentage
                      disabled             // makes it readonly
                    >
                      <option value="fix">Fix Rs.</option>
                      <option value="percentage">Percentage (%)</option>
                    </Form.Select>
                  </Form.Group>
                </div>


                {/* Product Commission */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="productComm">
                    <Form.Label className="fw-bold text-dark">
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
                      min={0}   // allows 0 as the minimum
                      name="productComm"
                      ref={fieldRefs.productComm}
                      value={formData.productComm ?? ""}   // use ?? so 0 is not replaced by ""
                      onChange={handleChange}
                      placeholder="Sale Commission Fee"
                    />

                    {errors.productComm && (
                      <div className="text-danger mt-1">{errors.productComm}</div>
                    )}
                  </Form.Group>
                </div>

                {/* Listing Commission Type */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="listingCommType">
                    <Form.Label className="fw-bold text-dark">
                      Listing Fee Type <span className="text-danger"> * </span>
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
                      value="fix"       // always show Fix
                      disabled          // readonly
                    >
                      <option value="fix">Fix Rs.</option>
                      <option value="percentage">Percentage (%)</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Listing Commission */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="listingComm">
                    <Form.Label className="fw-bold text-dark">
                      Listing Fee <span className="text-danger"> * </span>
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
                      min={0}   // allows 0 as minimum
                      name="listingComm"
                      ref={fieldRefs.listingComm}
                      value={formData.listingComm ?? ""}   // ✅ keeps 0 instead of clearing
                      onChange={handleChange}
                      placeholder="Listing Fee"
                    />

                    {errors.listingComm && (
                      <div className="text-danger mt-1">{errors.listingComm}</div>
                    )}
                  </Form.Group>
                </div>

                {/* Fixed Commission Type */}
                <div className="col-md-6 mb-0 pb-3">
                  <Form.Group controlId="fixedCommType">
                    <Form.Label className="fw-bold text-dark">
                      Fixed Closing Fee Type <span className="text-danger"> * </span>
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
                      value="fix"      // always show Fix
                      disabled         // readonly
                    >
                      <option value="fix">Fix Rs.</option>
                      <option value="percentage">Percentage (%)</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Fixed Commission */}
                <div className="col-md-6 mb-0">
                  <Form.Group controlId="fixedComm">
                    <Form.Label className="fw-bold text-dark">
                      Fixed Closing Fee <span className="text-danger"> * </span>
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
                      min={0}   // allows 0 as valid input
                      name="fixedComm"
                      ref={fieldRefs.fixedComm}
                      value={formData.fixedComm ?? ""}   // ✅ keeps 0 instead of clearing
                      onChange={handleChange}
                      placeholder="Fixed Closing Fee"
                    />

                    {errors.fixedComm && (
                      <div className="text-danger mt-1">{errors.fixedComm}</div>
                    )}
                  </Form.Group>
                </div>

                {/* Shipping Fee Type */}
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="shippingCommType">
                    <Form.Label className="fw-bold text-dark">
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

                    <Form.Select
                      name="shippingCommType"
                      value="percentage"   // always show Percentage
                      disabled             // readonly
                    >
                      <option value="fix">Fix Rs.</option>
                      <option value="percentage">Percentage (%)</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Shipping Fee */}
                {/* Shipping Fee */}
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="shippingComm">
                    <Form.Label className="fw-bold text-dark">
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
                      min={0}   // allows 0
                      name="shippingComm"
                      ref={fieldRefs.shippingComm}
                      value={formData.shippingComm ?? ""}   // ✅ keeps 0 instead of clearing
                      onChange={handleChange}
                      placeholder="Shipping Fee"
                    />

                    {errors.shippingComm && (
                      <div className="text-danger mt-1">{errors.shippingComm}</div>
                    )}
                  </Form.Group>
                </div>
              </div>
            </Card>

            <Card className="mb-3 border rounded">
              <div className="mark mb-3">
                <div className="fw-bold ps-4 p-1 fs-6">Extra Features</div>
              </div>
              <div className="mb-3 px-3">
                <Form.Label className="fw-bold text-dark">
                  <span className="ps-0 px-2">Seller Notes</span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Internal notes (not shown to customers).
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block me-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Form.Label>
                <ReactQuill modules={modules} theme="snow" placeholder="Seller Notes" value={formData.sellerNotes} onChange={handleSellerNoteChange} />
              </div>
              {/* <div className="mb-3 px-3">
                <Form.Label className="fw-bold text-dark">
                  <span className="ps-0 px-2">Gift Offer</span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Mention any gift or combo included.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block me-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control type="text" name="giftOffer" placeholder="Gift Offer" value={formData.giftOffer} onChange={handleChange} />
              </div> */}
              <div className="mb-3 px-3">
                <Form.Label className="fw-bold text-dark">
                  <span className="ps-0 px-2">Youtube Link</span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Video link showing product use or unboxing.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block me-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Form.Label>
                <Form.Control type="text" name="youtubeLink" placeholder="Youtube Link" value={formData.youtubeLink} onChange={handleChange} />
              </div>
              <div className="mb-3 border rounded p-3 mx-3">
                <Form.Label className="fw-bold text-dark">
                  <span className="ps-0 px-2">FAQ</span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-top" className="custom-tooltip">
                        Add common customer questions and answers to help them understand the product better.
                      </Tooltip>
                    }
                  >
                    <div className="d-inline-block me-2">
                      <CsLineIcons icon="info-hexagon" size="17" />
                    </div>
                  </OverlayTrigger>
                </Form.Label>
                {formData.faq.map((item, index) => (
                  <div key={index} className="mb-3">
                    <Form.Control
                      type="text"
                      name={`question${index}`}
                      value={item.question}
                      onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                      placeholder="Question"
                    />
                    <Form.Control
                      type="text"
                      name={`answer${index}`}
                      className="mt-2"
                      value={item.answer}
                      onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                      placeholder="Answer"
                    />
                    <Button variant="danger" className="mt-3" size="sm" onClick={() => handleRemoveFaq(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button variant="primary" size="sm" className={formData.faq.length ? '' : 'ms-2'} onClick={handleAddFaq}>
                  Add FAQ
                </Button>
              </div>

            </Card>
            <Button variant="primary" className="float-end mt-2" type="submit">
              Submit
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
export default withRouter(AddSeries);
