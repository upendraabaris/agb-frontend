import React, { useState, useEffect } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink, withRouter } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import '../product.css';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { Accordion, Row, Col, Button, Form, Card, Tooltip, OverlayTrigger } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import SelectCategories from './components/SelectCategories';
import VarientPicker from './componentsvariant/VarientPicker';

function AddNewProduct({ history }) {
  const title = 'Add Product with Variant';
  const description = 'Ecommerce Add Individual Product Page';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

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

  const CREATE_PRODUCT = gql`
    mutation CreateProduct(
      $brandName: String
      $previewName: String
      $fullName: String
      $searchName: String
      $returnPolicy: String
      $shippingPolicy: String
      $cancellationPolicy: String
      $description: String
      $giftOffer: String
      $sellerNotes: String
      $youtubeLink: String
      $approve: Boolean
      $active: Boolean
      $categories: [String]
      $faq: [FaqInput]
      $productImages: [Upload]
      $variant: [VariantInput]
    ) {
      createProduct(
        brand_name: $brandName
        previewName: $previewName
        fullName: $fullName
        searchName: $searchName
        returnPolicy: $returnPolicy
        shippingPolicy: $shippingPolicy
        cancellationPolicy: $cancellationPolicy
        description: $description
        giftOffer: $giftOffer
        sellerNotes: $sellerNotes
        youtubeLink: $youtubeLink
        approve: $approve
        active: $active
        categories: $categories
        faq: $faq
        productImages: $productImages
        variant: $variant
      ) {
        id
      }
    }
  `;

  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        key
        content
      }
    }
  `;

  const initialStates = {
    fullName: '',
    searchName: '',
    previewName: '',
    brandName: '',
    description: '',
    sellerNotes: '',
    shippingPolicy: '',
    returnPolicy: '',
    cancellationPolicy: '',
    giftOffer: '',
    youtubeLink: '',
    approve: false,
    active: true,
    productImages: [],
    faq: [],
    categories: [],
    variant: [],
  };

  const [formData, setFormData] = useState(initialStates);

  const [CreateProduct] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => {
      toast.success('Product Added Successfully !');
      setFormData(initialStates);
      setTimeout(() => {
        history.push('/seller/product/list');
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong !'); 
    },
  });

  const [selectedPolicy, setSelectedPolicy] = useState('cancellation'); // default

  const [GetSiteContent] = useLazyQuery(GET_SITE_CONTENT, {
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

  const handleChange = (event) => {
    const { name, files } = event.target;

    if (name === 'productImages') {
      const selectedFiles = Array.from(files);
      const validFiles = [];
      let invalidFound = false;

      const checks = selectedFiles.map((file) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
            if (img.width === img.height) {
              validFiles.push(file);
            } else {
              invalidFound = true;
            }
            resolve();
          };
          img.onerror = () => resolve(); // in case image fails to load
        });
      });

      Promise.all(checks).then(() => {
        if (invalidFound || validFiles.length !== selectedFiles.length) {
          alert('⚠️ Please upload only square images (equal width and height).');
          event.target.value = ''; // reset file input
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: [],
          }));
        } else {
          setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: validFiles,
          }));
        }
      });
    } else {
      // Other input fields
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: event.target.value,
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

  // handle validation

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }
    if (!formData.previewName.trim()) {
      errors.previewName = 'Preview Name is required.';
    }
    if (!formData.brandName.trim()) {
      errors.brandName = 'Brand Name is required.';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required.';
    }
    if (!formData.cancellationPolicy.trim()) {
      errors.cancellationPolicy = 'Cancellation Policy is required.';
    }
    if (!formData.returnPolicy.trim()) {
      errors.returnPolicy = 'Return Policy is required.';
    }
    if (!formData.productImages.length) {
      errors.productImages = 'Product Preview Images are required.';
    }
    if (!formData.categories.length) {
      errors.categories = 'Categories are required.';
    }
    if (!formData.productImages.length) {
      errors.productImages = 'Product Preview Images are required.';
    }
    if (!formData.categories.length) {
      errors.categories = 'Categories are required.';
    }
    return errors;
  };

  const handleProduct = async () => {
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      // ✅ Scroll to the first error field
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }

      return; // Stop execution if validation fails
    }

    setFormErrors({});

    if (formData.variant.length) {
      await CreateProduct({
        variables: formData,
      });
    } else {
      toast.error('Please fill the variant details.');
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <button type="button" className="muted-link pb-1 d-inline-block bg-transparent border-0" onClick={() => window.history.back()}>
              <span className="text-dark ms-1">Back</span>
            </button>
            <spna className="small p-2"> / </spna>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="#">
              <span className="text-dark ms-1">{title}</span>
            </NavLink>
          </Col>
        </Row>
      </div>

      <div className="mb-3 border rounded">
        <div>
          <div className="mark">
            {' '}
            <div className="alert alert-info d-flex align-items-center mb-2" role="alert">
              <div className="fw-semibold text-dark fw-bold fs-6">Product Details</div>
            </div>
            {/* <div className=" fw-bold ps-4 p-1 fs-6">Required Field</div>{' '} */}
          </div>

          <div className="p-1">
            <Card className="border">
              <div className="mark">
                <div className=" fw-bold ps-4 p-1 fs-6">Basic Details</div>{' '}
              </div>
              <Form className="px-4 ps-4 p-2">
                <div className="row px-2">
                  <div className="col-md-6 mb-2 mt-2">
                    <Form.Group controlId="active">
                      <Form.Label className="fw-bold text-dark">
                        <Form.Check
                          type="checkbox"
                          name="active"
                          inline
                          value="true"
                          checked={formData.active || false}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              active: e.target.checked,
                            }))
                          }
                        />
                        Product Active{' '}
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              Enable or disable this product for sale.
                            </Tooltip>
                          }
                        >
                          <div className="d-inline-block me-2">
                            <CsLineIcons icon="info-hexagon" size="17" />
                          </div>
                        </OverlayTrigger>
                      </Form.Label>
                    </Form.Group>
                  </div>
                </div>
                <Row>
                  <div className="mb-3 col-md-6 mt-3">
                    <Form.Label className="fw-bold text-dark">
                      Product Full Name <span className="text-danger"> * </span>
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
                      id="fullName"
                      type="text"
                      name="fullName"
                      maxLength={100}
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
                    {formErrors.fullName && <div className="mt-1 text-danger">{formErrors.fullName}</div>}
                  </div>

                  {/* 2. Brand Name */}
                  <div className="mb-3 col-md-6 mt-3">
                    <Form.Label className="fw-bold text-dark">
                      Brand Name <span className="text-danger"> * </span>
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
                    <Form.Control id="brandName" type="text" name="brandName" value={formData.brandName} onChange={handleChange} />
                    {formErrors.brandName && <div className="mt-1 text-danger">{formErrors.brandName}</div>}
                  </div>
                </Row>

                <Row>
                  {/* Product Preview Name */}
                  <div className="mb-3 col-md-6">
                    <Form.Label className="fw-bold text-dark">
                      Product Preview Name <span className="text-danger"> * </span>
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
                    <Form.Control id="previewName" type="text" name="previewName" maxLength={35} value={formData.previewName} onChange={handleChange} />
                    {formErrors.previewName && <div className="mt-1 text-danger">{formErrors.previewName}</div>}
                  </div>

                  {/* Product Preview Images */}
                  <div className="mb-3 col-md-6">
                    <Form.Label className="fw-bold text-dark">
                      Product Preview Images <span className="text-danger"> * </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Front-facing images shown to customers.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block ms-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Control id="productImages" type="file" accept="image/*" name="productImages" onChange={handleChange} multiple />
                    {formErrors.productImages && <div className="mt-1 text-danger">{formErrors.productImages}</div>}
                  </div>
                </Row>

                <div className="mb-3 col-md-6">
                  <Form.Label className="fw-bold text-dark">
                    <span className="ps-0 px-2">Product Search Tags</span>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-top" className="custom-tooltip">
                          Keywords to help customers find the product.
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
                    name="searchName"
                    value={formData.searchName}
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
                  {formErrors.searchName && <div className="mt-1 text-danger">{formErrors.searchName}</div>}
                </div>

                {/* 5. Description */}
                <div className="mb-3">
                  <Form.Label className="fw-bold text-dark">
                    Description <span className="text-danger"> * </span>
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
                  <ReactQuill id="description" modules={modules} theme="snow" value={formData.description} onChange={handleDescriptionChange} />
                  {formErrors.description && <div className="mt-1 text-danger">{formErrors.description}</div>}
                </div>

                {/* <div className="mb-3">
                  <Form.Label className="fw-bold text-dark">
                    Cancellation Policy <span className="text-danger"> * </span>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-top" className="custom-tooltip">
                          Rules for order cancellation of this product.
                        </Tooltip>
                      }
                    >
                      <div className="d-inline-block me-2">
                        <CsLineIcons icon="info-hexagon" size="17" />
                      </div>
                    </OverlayTrigger>
                  </Form.Label>
                  <ReactQuill
                    modules={modules}
                    theme="snow"
                    placeholder="Cancellation Policy"
                    value={formData.cancellationPolicy}
                    onChange={handleCancellationPolicyChange}
                  />
                  {formErrors.cancellationPolicy && <div className="mt-1 text-danger">{formErrors.cancellationPolicy}</div>}
                </div>
                <div className="mb-3">
                  <Form.Label className="fw-bold text-dark">
                    Shipping Policy <span className="text-danger"> * </span>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-top" className="custom-tooltip">
                          Shipping timelines, charges, and coverage.
                        </Tooltip>
                      }
                    >
                      <div className="d-inline-block me-2">
                        <CsLineIcons icon="info-hexagon" size="17" />
                      </div>
                    </OverlayTrigger>
                  </Form.Label>
                  <ReactQuill
                    modules={modules}
                    theme="snow"
                    placeholder="Shipping Policy"
                    value={formData.shippingPolicy}
                    onChange={handleShippingPolicyChange}
                  />
                  {formErrors.shippingPolicy && <div className="mt-1 text-danger">{formErrors.shippingPolicy}</div>}
                </div>
                <div className="mb-3">
                  <Form.Label className="fw-bold text-dark">
                    Return Policy <span className="text-danger"> * </span>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-top" className="custom-tooltip">
                          Terms for return or replacement of the product.
                        </Tooltip>
                      }
                    >
                      <div className="d-inline-block me-2">
                        <CsLineIcons icon="info-hexagon" size="17" />
                      </div>
                    </OverlayTrigger>
                  </Form.Label>
                  <ReactQuill modules={modules} theme="snow" placeholder="Return Policy" value={formData.returnPolicy} onChange={handlereturnPolicyChange} />
                  {formErrors.returnPolicy && <div className="mt-1 text-danger">{formErrors.returnPolicy}</div>}
                </div> */}

                <div className="mb-3 border p-2 rounded">
                  <Form.Label className="fw-bold ps-2 text-dark">
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
                  <div id="categories">
                    {' '}
                    {/* ✅ Added id here */}
                    <SelectCategories setFormData={setFormData} />
                  </div>
                  {formErrors.categories && <div className="mt-1 text-danger">{formErrors.categories}</div>}
                </div>
              </Form>
            </Card>
            <Card className="mt-2">
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
                      checked={selectedPolicy === 'cancellation'}
                      onChange={() => setSelectedPolicy('cancellation')}
                    />

                    {selectedPolicy === 'cancellation' && (
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
                          onChange={(val) => setFormData((prev) => ({ ...prev, cancellationPolicy: val }))}
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
                      checked={selectedPolicy === 'shipping'}
                      onChange={() => setSelectedPolicy('shipping')}
                    />

                    {selectedPolicy === 'shipping' && (
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
                          onChange={(val) => setFormData((prev) => ({ ...prev, shippingPolicy: val }))}
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
                      checked={selectedPolicy === 'return'}
                      onChange={() => setSelectedPolicy('return')}
                    />

                    {selectedPolicy === 'return' && (
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
                          onChange={(val) => setFormData((prev) => ({ ...prev, returnPolicy: val }))}
                        />
                      </div>
                    )}
                  </div>
                </Form>
              </div>
            </Card>

            <Card className="border mt-2">
              <div className="mark">
                <div className=" fw-bold ps-4 p-1 fs-6">Extra Features</div>{' '}
              </div>
              <Form className="p-4">
                <div className="mb-3">
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
                  <ReactQuill modules={modules} theme="snow" value={formData.sellerNotes} onChange={handleSellerNoteChange} />
                </div>
                <div className="mb-3">
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
                  <Form.Control type="text" name="giftOffer" value={formData.giftOffer} onChange={handleChange} />
                </div>
                <div className="mb-3">
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
                  <Form.Control type="text" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} />
                </div>
                <div className="mb-3">
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
                        value={item.answer}
                        className="mt-2"
                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                        placeholder="Answer"
                      />
                      <Button variant="danger" className="mt-2" size="sm" onClick={() => handleRemoveFaq(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="primary" size="sm" className={formData.faq.length ? '' : 'ms-2'} onClick={handleAddFaq}>
                    Add FAQ
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        </div>
        <div>
          {/* <div className="mark">
            <div className=" fw-bold ps-4 p-1 fs-6">Product Variant Details</div>{' '}
          </div> */}
          <div>
            <VarientPicker setFormData1={setFormData} />
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center mt-4">
        <Button onClick={() => handleProduct()}>Save Product</Button>
      </div>
    </>
  );
}
export default withRouter(AddNewProduct);
