import React, { useState, useEffect } from 'react';
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

function AddNewProduct({ history }) {
  const title = 'Add Individual Product';
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

  const GET_SHIPPING_POLICY = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        key
        content
      }
    }
  `;

  const initialStates = {
    fullName: '',
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
        history.push('/admin/product/list');
      }, 3000);
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong !'); 
    },
  });

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

  const handleDescriptionChange = (desc) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: desc,
    }));
  };

  // const handleSilentFeaturesChange = (silentdesc) => {
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     silentFeatures: silentdesc,
  //   }));
  // };
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
      errors.description = 'description is required.';
    }
    if (!formData.cancellationPolicy.trim()) {
      errors.cancellationPolicy = 'cancellationPolicy is required.';
    }
    if (!formData.returnPolicy.trim()) {
      errors.returnPolicy = 'returnPolicy is required.';
    }
    if (!formData.productImages.length) {
      errors.productImages = 'productImages is required.';
    }
    if (!formData.categories.length) {
      errors.categories = 'categories is required.';
    }
    return errors;
  };

  const handleProduct = async () => {
    const errors = await validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    if (formData.variant.length) {
      await CreateProduct({
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
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/product/list">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Individual Product List</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>

      <Accordion defaultActiveKey={['1']} alwaysOpen>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Product Basic Details </Accordion.Header>
          <Accordion.Body>
            <Card className="mb-5">
              <Card.Body>
                <Form>
                  <div className="mb-3">
                    <Form.Label className="fs-5">Product Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
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
                  <div className="mb-3">
                    <Form.Label className="fs-5">Product Preview Name</Form.Label>
                    <Form.Control type="text" name="previewName" value={formData.previewName} onChange={handleChange} />
                    {formErrors.previewName && <div className="mt-1 text-danger">{formErrors.previewName}</div>}
                  </div>

                  <div className="mb-3">
                    <Form.Label className="fs-5">Brand Name</Form.Label>
                    <Form.Control type="text" name="brandName" value={formData.brandName} onChange={handleChange} />
                    {formErrors.brandName && <div className="mt-1 text-danger">{formErrors.brandName}</div>}
                  </div>

                  {/* <div className="mb-3">
                    <Form.Label className="fs-5">Salient Features</Form.Label>
                    <ReactQuill
                      modules={modules}
                      theme="snow"
                      placeholder="Compose an epic silentFeatures"
                      value={formData.silentFeatures}
                      onChange={handleSilentFeaturesChange}
                    />
                  </div> */}
                  <div className="mb-3">
                    <Form.Label className="fs-5">Description</Form.Label>
                    <ReactQuill
                      modules={modules}
                      theme="snow"
                      value={formData.description}
                      onChange={handleDescriptionChange}
                    />
                    {formErrors.description && <div className="mt-1 text-danger">{formErrors.description}</div>}
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fs-5">Seller Notes</Form.Label>
                    <ReactQuill modules={modules} theme="snow" placeholder="Seller's Notes" value={formData.sellerNotes} onChange={handleSellerNoteChange} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fs-5">Gift Offer</Form.Label>
                    <Form.Control type="text" name="giftOffer" value={formData.giftOffer} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fs-5">Youtube Link</Form.Label>
                    <Form.Control type="text" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fs-5"> Cancellation Policy</Form.Label>
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
                    <Form.Label className="fs-5">Shipping Policy</Form.Label>

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
                    <Form.Label className="fs-5">Return Policy</Form.Label>

                    <ReactQuill modules={modules} theme="snow" placeholder="Return Policy" value={formData.returnPolicy} onChange={handlereturnPolicyChange} />
                    {formErrors.returnPolicy && <div className="mt-1 text-danger">{formErrors.returnPolicy}</div>}
                  </div>

                  <div className="mb-3">
                    <Form.Label className="fs-5">Product Images</Form.Label>
                    <Form.Control type="file" accept="image/*" name="productImages" onChange={handleChange} multiple />
                    {formErrors.productImages && <div className="mt-1 text-danger">{formErrors.productImages}</div>}
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fs-5">Select Categories for Product Placement</Form.Label>
                    <SelectCategories setFormData={setFormData} />
                    {formErrors.categories && <div className="mt-1 text-danger">{formErrors.categories}</div>}
                  </div>
                  <div className="mb-3">
                    <Form.Label className="fs-5">FAQ</Form.Label>
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
              </Card.Body>
            </Card>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Accordion.Header>Product variant Details </Accordion.Header>
          <Accordion.Body>
            <VarientPicker setFormData1={setFormData} />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <div className="d-flex justify-content-center mt-4">
        <Button onClick={() => handleProduct()}>Save Product</Button>
      </div>
    </>
  );
}
export default withRouter(AddNewProduct);
