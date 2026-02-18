import React, { useEffect, useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { NavLink, withRouter } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';

function AddNewProduct({ history }) {
  const title = 'Add TMT Product';
  const description = 'Ecommerce Add TMT Product Page';

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

  const CREATE_TMT_MASTER = gql`
    mutation CreateTMTMater(
      $fullName: String
      $previewName: String
      $sku: String
      $returnPolicy: String
      $shippingPolicy: String
      $cancellationPolicy: String
      $hsn: String
      $silentFeatures: String
      $description: String
      $giftOffer: String
      $sellerNotes: String
      $youtubeLink: String
      $brandCompareCategory: String
      $categories: [String]
      $faq: [TMTSeriesFaqInput]
      $productImages: [Upload]
    ) {
      createTMTMater(
        fullName: $fullName
        previewName: $previewName
        sku: $sku
        returnPolicy: $returnPolicy
        shippingPolicy: $shippingPolicy
        cancellationPolicy: $cancellationPolicy
        hsn: $hsn
        silent_features: $silentFeatures
        description: $description
        giftOffer: $giftOffer
        sellerNotes: $sellerNotes
        youtubeLink: $youtubeLink
        brandCompareCategory: $brandCompareCategory
        categories: $categories
        faq: $faq
        productImages: $productImages
      ) {
        id
      }
    }
  `;

  const initialStates = {
    fullName: '',
    previewName: '',
    silentFeatures: '',
    description: '',
    sku: '',
    hsn: '',
    sellerNotes: '',
    giftOffer: '',
    youtubeLink: '',
    returnPolicy: '',
    shippingPolicy: '',
    cancellationPolicy: '',
    brandCompareCategory: '',
    productImages: [],
    faq: [],
    categories: [],
  };

  const [formData, setFormData] = useState(initialStates);

  const [formErrors, setFormErrors] = useState({});

  const [CreateTMTMater] = useMutation(CREATE_TMT_MASTER, {
    onCompleted: () => {
      toast.success('Product Added Successfully!');
      setFormData(initialStates);
      setTimeout(() => {
        history.push('/admin/tmt_product/list');
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong!'); 
    },
  });
  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'productImages') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: files,
      }));
    } else if (name === 'fullName') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value.trim(),
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };
  const handleDescriptionChange = (desc) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: desc,
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

  const handleSilentFeaturesChange = (silentdesc) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      silentFeatures: silentdesc,
    }));
  };
  const handleSellerNoteChange = (sellernote) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      sellerNotes: sellernote,
    }));
  };

  // handle faq
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

  // handle form errors
  const validateForm = () => {
    const errors = {};

    // Add validation checks for each field
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    }
    if (!formData.previewName.trim()) {
      errors.previewName = 'Preview Name is required.';
    }
    if (!formData.silentFeatures.trim()) {
      errors.silentFeatures = 'Salient Features is required.';
    }

    if (!formData.description.trim()) {
      errors.description = 'description is required.';
    }
    if (!formData.sku.trim()) {
      errors.sku = 'sku is required.';
    }
    if (!formData.hsn) {
      errors.hsn = 'hsn is required.';
    }
    if (!formData.sellerNotes.trim()) {
      errors.sellerNotes = 'sellerNotes is required.';
    }
    if (!formData.sellerNotes.trim()) {
      errors.sellerNotes = 'sellerNotes is required.';
    }
    
    if (!formData.returnPolicy.trim()) {
      errors.returnPolicy = 'returnPolicy is required.';
    }
    if (!formData.shippingPolicy.trim()) {
      errors.shippingPolicy = 'shippingPolicy is required.';
    }
    if (!formData.cancellationPolicy.trim()) {
      errors.cancellationPolicy = 'cancellationPolicy is required.';
    }
    if (!formData.productImages.length) {
      errors.productImages = 'productImages is required.';
    }
    if (!formData.categories.length) {
      errors.categories = 'categories is required.';
    }
    if (!formData.brandCompareCategory.trim()) {
      errors.brandCompareCategory = 'brandCompareCategory is required.';
    }
    // Add more validation checks for other fields if needed

    return errors;
  };

  const handleProduct = async (event) => {
    event.preventDefault();
    const errors = await validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    await CreateTMTMater({
      variables: formData,
    });
  };
  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/tmt_product/list">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">TMT Products</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <Form onSubmit={handleProduct}>
        <Row>
          <Col xl="8">
            <Card className="mb-5">
              <Card.Body>
                <div className="mb-3">
                  <Form.Group controlId="fullName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
                    {formErrors.fullName && <div className="mt-1 text-danger">{formErrors.fullName}</div>}
                  </Form.Group>
                </div>

                <div className="mb-3">
                  <Form.Group controlId="previewName">
                    <Form.Label>Product Preview Name</Form.Label>
                    <Form.Control type="text" name="previewName" value={formData.previewName} onChange={handleChange} />
                    {formErrors.previewName && <div className="mt-1 text-danger">{formErrors.previewName}</div>}
                  </Form.Group>
                </div>

                <div className="mb-3">
                  <Form.Group controlId="silentFeatures">
                    <Form.Label>Salient Features</Form.Label>
                    <ReactQuill
                      modules={modules}
                      theme="snow"
                      placeholder="Salient Features"
                      value={formData.silentFeatures}
                      onChange={handleSilentFeaturesChange}
                    />
                    {formErrors.silentFeatures && <div className="mt-1 text-danger">{formErrors.silentFeatures}</div>}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Group controlId="description">
                    <Form.Label>Description</Form.Label>
                    <ReactQuill
                      modules={modules}
                      theme="snow"
                      value={formData.description}
                      onChange={handleDescriptionChange}
                    />
                    {formErrors.description && <div className="mt-1 text-danger">{formErrors.description}</div>}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Group controlId="sellerNotes">
                    <Form.Label>Seller Notes</Form.Label>
                    <ReactQuill modules={modules} theme="snow" placeholder="Seller's Notes" value={formData.sellerNotes} onChange={handleSellerNoteChange} />
                    {formErrors.sellerNotes && <div className="mt-1 text-danger">{formErrors.sellerNotes}</div>}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Group controlId="returnPolicy">
                    <Form.Label>Return Policy</Form.Label>
                    <ReactQuill modules={modules} theme="snow" placeholder="Return Policy" value={formData.returnPolicy} onChange={handlereturnPolicyChange} />
                    {formErrors.returnPolicy && <div className="mt-1 text-danger">{formErrors.returnPolicy}</div>}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Group controlId="shippingPolicy">
                    <Form.Label>Shipping Policy</Form.Label>

                    <ReactQuill
                      modules={modules}
                      theme="snow"
                      placeholder="Shipping Policy"
                      value={formData.shippingPolicy}
                      onChange={handleShippingPolicyChange}
                    />
                    {formErrors.shippingPolicy && <div className="mt-1 text-danger">{formErrors.shippingPolicy}</div>}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Group controlId="cancellationPolicy">
                    <Form.Label>Cancellation Policy</Form.Label>
                    <ReactQuill
                      modules={modules}
                      theme="snow"
                      placeholder="Cancellation Policy"
                      value={formData.cancellationPolicy}
                      onChange={handleCancellationPolicyChange}
                    />
                    {formErrors.cancellationPolicy && <div className="mt-1 text-danger">{formErrors.cancellationPolicy}</div>}
                  </Form.Group>
                </div>
                <div className="mb-3">
                  <Form.Label className="fs-5">FAQ</Form.Label>
                  {formData?.faq.map((item, index) => (
                    <div key={index} className="mb-3 d-flex">
                      <Form.Control
                        type="text"
                        value={item.question || ''}
                        onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                        placeholder="Question"
                      />
                      <Form.Control
                        type="text"
                        value={item.answer || ''}
                        className="ms-2"
                        onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                        placeholder="Answer"
                      />
                      <Button variant="danger" className="ms-2" onClick={() => handleRemoveFaq(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button variant="primary" size="sm" className={formData.faq.length ? '' : 'ms-2'} onClick={handleAddFaq}>
                    Add FAQ
                  </Button>
                </div>

                <div className="mb-3">
                  <Form.Group controlId="brandCompareCategory">
                    <Form.Label>Brand Compare Category</Form.Label>
                    <Form.Control type="text" name="brandCompareCategory" value={formData.brandCompareCategory} onChange={handleChange} />
                    {formErrors.brandCompareCategory && <div className="mt-1 text-danger">{formErrors.brandCompareCategory}</div>}
                  </Form.Group>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="mb-3">
              <Card.Body>
                <div className="mb-3">
                  <Form.Group controlId="productImages">
                    <Form.Label>productImages</Form.Label>
                    <Form.Control type="file" accept="image/*" name="productImages" onChange={handleChange} multiple />
                    {formErrors.productImages && <div className="mt-1 text-danger">{formErrors.productImages}</div>}
                  </Form.Group>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <div className="row">
                  <div className="mb-3">
                    <Form.Group controlId="sku">
                      <Form.Label>SKU</Form.Label>
                      <Form.Control type="text" name="sku" value={formData.sku} onChange={handleChange} />
                      {formErrors.sku && <div className="mt-1 text-danger">{formErrors.sku}</div>}
                    </Form.Group>
                  </div>
                  <div className="mb-3">
                    <Form.Group controlId="hsn">
                      <Form.Label>HSN</Form.Label>
                      <Form.Control
                        type="number"
                        onWheel={(e) => e.target.blur()}
                        onKeyPress={(e) => {
                          if (e.target.value.length >= 8) e.preventDefault();
                        }}
                        name="hsn"
                        value={formData.hsn}
                        onChange={handleChange}
                      />
                      {formErrors.hsn && <div className="mt-1 text-danger">{formErrors.hsn}</div>}
                    </Form.Group>
                  </div>
                </div>
              </Card.Body>
            </Card>
            <Card className="mb-3">
              <Card.Body>
                <div className="row">
                  <div className="mb-3">
                    <Form.Group controlId="giftOffer">
                      <Form.Label>Gift Offer</Form.Label>
                      <Form.Control type="text" name="giftOffer" value={formData.giftOffer} onChange={handleChange} />
                    </Form.Group>
                  </div>
                  <div className="mb-3">
                    <Form.Group controlId="youtubeLink">
                      <Form.Label>Youtube Link</Form.Label>
                      <Form.Control type="text" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} />
                    </Form.Group>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </>
  );
}

export default withRouter(AddNewProduct);
