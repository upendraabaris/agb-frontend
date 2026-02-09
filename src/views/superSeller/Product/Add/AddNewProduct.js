import React, { useRef, useState, useEffect } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink, withRouter } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { Accordion, Row, Col, Button, Form, Card } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import SelectCategories from './components/SelectCategories';
import VarientPicker from './components/VarientPicker';

const CREATE_SUPER_SELLER_PRODUCT = gql`
  mutation CreateSuperSellerProduct(
    $brand_Name: String
    $previewName: String
    $fullName: String
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
    $silent_features: String
    $faq: [SuperFaqInput]
    $productImages: [Upload]
    $supervariant: [SuperVariantInput]
  ) {
    createSuperSellerProduct(
      brand_name: $brand_Name
      previewName: $previewName
      fullName: $fullName
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
      silent_features: $silent_features
      faq: $faq
      productImages: $productImages
      supervariant: $supervariant
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

function AddNewProduct({ history }) {
  const title = 'Add BA Product';
  const description = 'Add BA Product';
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
  const initialStates = {
    fullName: '',
    previewName: '',
    brand_Name: '',
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
    supervariant: [],
  };

  const [formData, setFormData] = useState(initialStates);
  const [CreateSuperSellerProduct] = useMutation(CREATE_SUPER_SELLER_PRODUCT, {
    onCompleted: () => {
      toast.success('Product Added Successfully !');
      setFormData(initialStates);
      setTimeout(() => {
        history.push('/superSeller/product/list');
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong !');
    },
  });
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
    const { name, value, files } = event.target;
    if (name === 'productImages') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: files,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
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
  const fieldRefs = {
    fullName: useRef(null),
    previewName: useRef(null),
    brand_Name: useRef(null),
    description: useRef(null),
    cancellationPolicy: useRef(null),
    returnPolicy: useRef(null),
    // productImages: useRef(null),
    // categories: useRef(null),
  };
  const [formErrors, setFormErrors] = useState({});
  const validateForm = () => {
    const errors = {};
    const requiredFields = ['fullName', 'previewName', 'brand_Name', 'description', 'cancellationPolicy', 'returnPolicy'];
    requiredFields.forEach((field) => {
      if (!formData[field]?.trim?.() || (Array.isArray(formData[field]) && !formData[field].length)) {
        errors[field] = `This field is required.`;
      }
    });
    setFormErrors(errors);
    const firstErrorField = requiredFields.find((field) => errors[field]);
    if (firstErrorField) fieldRefs[firstErrorField].current?.focus();
    return errors;
  };
  const handleProduct = async () => {
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    if (formData.supervariant.length) {
      await CreateSuperSellerProduct({
        variables: formData,
      });
    } else {
      toast.error('Please fill the variant Details.');
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/superSeller/dashboard">
              <span className="align-middle text-dark ms-1 px-2">BA Dashboard</span>
            </NavLink>
            <span className="small"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/superSeller/product/list">
              <span className="align-middle text-dark ms-1 px-2">BA Products</span>
            </NavLink>
            <span className="small"> / </span>
            <span className="align-middle text-dark ms-1">Add Product </span>
          </Col>
        </Row>
      </div>
      <Accordion defaultActiveKey={['2']} alwaysOpen>
        <Accordion.Item eventKey="1">
          <Accordion.Header className="mark">
            <div className="fs-6">Product Basic Details</div>
          </Accordion.Header>
          <div className="p-1">
            <Card className="border">
              <div>
                <h2 className="small-title bg-info mb-2 text-white p-2 ps-4 pt-2 rounded-1">Required Field</h2>
              </div>
              <Form className="px-4 ps-4 p-2">
                <div className="mb-1">
                  <Form.Label className="fw-bold text-dark">
                    Product Full Name <span className="text-danger"> * </span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    ref={fieldRefs.fullName}
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
                <div className="row">
                  <div className="mb-1 col-6">
                    <Form.Label className="fw-bold text-dark">
                      Product Preview Name <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control type="text" name="previewName" value={formData.previewName} ref={fieldRefs.previewName} onChange={handleChange} />
                    {formErrors.previewName && <div className="mt-1 text-danger">{formErrors.previewName}</div>}
                  </div>
                  <div className="mb-1 col-6">
                    <Form.Label className="fw-bold text-dark">
                      Brand Name <span className="text-danger"> * </span>
                    </Form.Label>
                    <Form.Control type="text" name="brand_Name" value={formData.brand_Name} ref={fieldRefs.brand_Name} onChange={handleChange} />
                    {formErrors.brand_Name && <div className="mt-1 text-danger">{formErrors.brand_Name}</div>}
                  </div>
                </div>
                <div className="mb-1">
                  <Form.Label className="fw-bold text-dark">
                    Description <span className="text-danger"> * </span>
                  </Form.Label>
                  <ReactQuill modules={modules} theme="snow" value={formData.description} ref={fieldRefs.description} onChange={handleDescriptionChange} />
                  {formErrors.description && <div className="mt-1 text-danger">{formErrors.description}</div>}
                </div>
                <div className="mb-1">
                  <Form.Label className="fw-bold text-dark">
                    Cancellation Policy <span className="text-danger"> * </span>
                  </Form.Label>
                  <ReactQuill
                    modules={modules}
                    theme="snow"
                    placeholder="Cancellation Policy"
                    value={formData.cancellationPolicy}
                    ref={fieldRefs.cancellationPolicy}
                    onChange={handleCancellationPolicyChange}
                  />
                  {formErrors.cancellationPolicy && <div className="mt-1 text-danger">{formErrors.cancellationPolicy}</div>}
                </div>
                <div className="mb-1">
                  <Form.Label className="fw-bold text-dark">
                    Shipping Policy <span className="text-danger"> * </span>
                  </Form.Label>
                  <ReactQuill
                    modules={modules}
                    theme="snow"
                    placeholder="Shipping Policy"
                    value={formData.shippingPolicy}
                    ref={fieldRefs.shippingPolicy}
                    onChange={handleShippingPolicyChange}
                  />
                  {formErrors.shippingPolicy && <div className="mt-1 text-danger">{formErrors.shippingPolicy}</div>}
                </div>
                <div className="mb-1">
                  <Form.Label className="fw-bold text-dark">
                    Return Policy <span className="text-danger"> * </span>
                  </Form.Label>
                  <ReactQuill
                    modules={modules}
                    theme="snow"
                    placeholder="Return Policy"
                    ref={fieldRefs.returnPolicy}
                    value={formData.returnPolicy}
                    onChange={handlereturnPolicyChange}
                  />
                  {formErrors.returnPolicy && <div className="mt-1 text-danger">{formErrors.returnPolicy}</div>}
                </div>
                <div className="mb-1">
                  <Form.Label className="fw-bold text-dark">
                    Product Preview Images <span className="text-danger"> * </span>
                  </Form.Label>
                  <Form.Control type="file" accept="image/*" name="productImages" ref={fieldRefs.productImages} onChange={handleChange} multiple />
                  {formErrors.productImages && <div className="mt-1 text-danger">{formErrors.productImages}</div>}
                </div>
                <div className="mb-1 border p-2 rounded">
                  <Form.Label className="fw-bold ps-2 text-dark">
                    Select Categories for Product Placement <span className="text-danger"> * </span>
                  </Form.Label>
                  <SelectCategories setFormData={setFormData} />
                  {formErrors.categories && <div className="mt-1 text-danger">{formErrors.categories}</div>}
                </div>
              </Form>
            </Card>
            <Card className="border mt-2">
              <div>
                <h2 className="small-title bg-info mb-2 text-white ps-4 p-2 pt-2 rounded-1">Advance Field</h2>
              </div>
              <Form className="p-4">
                <div className="mb-1">
                  <Form.Label className="fw-bold text-dark">BA Notes</Form.Label>
                  <ReactQuill modules={modules} theme="snow" value={formData.sellerNotes} onChange={handleSellerNoteChange} />
                </div>
                <div className="mb-1">
                  <Form.Label className="fw-bold text-dark">Gift Offer</Form.Label>
                  <Form.Control type="text" name="giftOffer" value={formData.giftOffer} onChange={handleChange} />
                </div>
                <div className="mb-1">
                  <Form.Label className="fw-bold text-dark">Youtube Link</Form.Label>
                  <Form.Control type="text" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} />
                </div>
                <div className="mb-3 border rounded p-3">
                  <Form.Label className="fw-bold text-dark d-block mb-2">Frequently Asked Questions</Form.Label>
                  {formData.faq.map((item, index) => (
                    <div key={index} className="p-3 mb-3 border rounded bg-white shadow-sm">
                      <Form.Control
                        type="text"
                        name={`question${index}`}
                        value={item.question}
                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                        placeholder="Enter your question"
                        className="mb-2"
                      />
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name={`answer${index}`}
                        value={item.answer}
                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                        placeholder="Enter the answer"
                        className="mb-2"
                      />
                      <Button variant="danger" size="sm" onClick={() => handleRemoveFaq(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="primary" size="sm" className="mt-2" onClick={handleAddFaq}>
                    Add FAQ
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header className="mark">
            {' '}
            <div className="fs-6">Product Variant Details</div>{' '}
          </Accordion.Header>
          <Accordion.Body className="p-0 m-0">
            <VarientPicker setFormData1={setFormData} />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <div className="d-flex justify-content-end mt-2 mx-4">
        <Button onClick={() => handleProduct()}>Save Product</Button>
      </div>
    </>
  );
}
export default withRouter(AddNewProduct);
