import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useQuery, useMutation } from '@apollo/client';
import { Row, Col, Modal, Button, Form, Card, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import VarientPicker from './components/VarientPicker';

const GET_PRODUCT = gql`
  query GetProduct($name: String!) {
    getProduct(name: $name) {
      active
      brand_name
      cancellationPolicy
      catalogue
      categories
      description
      sku
      classCode
      fixedComm
      productComm
      listingComm
      shippingComm
      faq {
        answer
        question
      }
      fullName
      giftOffer
      id
      images
      previewName
      returnPolicy
      sellerNotes
      shippingPolicy
      thumbnail
      video
      reject
      approve
      youtubeLink
      variant {
        hsn
        minimunQty
        moq
        silent_features
        variantName
        active
        allPincode
        location {
          b2bdiscount
          b2cdiscount
          displayStock
          extraCharge
          extraChargeType
          finalPrice
          gstRate
          gstType
          mainStock
          pincode
          price
          priceType
          transportCharge
          transportChargeType
          unitType
          sellerId {
            companyName
            mobileNo
            whatsAppMobileNo
            email
          }
        }
      }
    }
  }
`;
const GET_CATEGORY = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
      image
      parent {
        id
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
    $productClassNameID: String
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
      productClassNameID: $productClassNameID
    ) {
      id
    }
  }
`;
const ALL_PRODUCT_CLASS = gql`
  query GetAllProductClass {
    getAllProductClass {
      id
      productClassName
      code
      listingCommission
      listingType
      productCommission
      productType
      fixedCommission
      fixedType
      shippingCommission
      shippingType
    }
  }
`;

const DetailViewProduct = () => {
  const title = 'Product Detail';
  const description = 'Ecommerce Product Detail Page';
  const { identifier } = useParams();
  const history = useHistory();
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
  const [productdetail, setProductDetail] = useState(null);
  const [GetProduct, { error, data, refetch }] = useLazyQuery(GET_PRODUCT, {
    variables: {
      name: identifier.replace(/_/g, ' '),
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!'); 
    },
  });
  useEffect(() => {
    if (data && data.getProduct) {
      setProductDetail({
        ...data.getProduct,
        faq: data.getProduct.faq?.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
        variant: data.getProduct.variant?.map((variant) => {
          const { __typename, ...variantWithoutTypename } = variant;
          // eslint-disable-next-line no-shadow
          const locationWithoutTypename = variantWithoutTypename.location.map(({ __typename, ...rest }) => rest);
          return {
            ...variantWithoutTypename,
            location: locationWithoutTypename,
          };
        }),
      });
    }
  }, [data]);
  useEffect(() => {
    if (identifier) {
      GetProduct();
    }
    // eslint-disable-next-line
  }, [identifier]);
  const handleChange = (event) => {
    event.preventDefault();
  };
  const handleDescriptionChange = (desc) => {
    setProductDetail((prevFormData) => ({
      ...prevFormData,
      description: desc,
    }));
  };
  const handleSellerNoteChange = (sellernote) => {
    setProductDetail((prevFormData) => ({
      ...prevFormData,
      sellerNotes: sellernote,
    }));
  };
  const handleReturnPolicyChange = (returnPolicies) => {
    setProductDetail((prevFormData) => ({
      ...prevFormData,
      returnPolicy: returnPolicies,
    }));
  };
  const handleShippingPolicyChange = (shippingPolicies) => {
    setProductDetail((prevFormData) => ({
      ...prevFormData,
      shippingPolicy: shippingPolicies,
    }));
  };
  const handleCancellationPolicyChange = (cancellationPolicies) => {
    setProductDetail((prevFormData) => ({
      ...prevFormData,
      cancellationPolicy: cancellationPolicies,
    }));
  };
  const handleFaqChange = (index, field, value) => {
    const updatedFaq = [...productdetail.faq];
    updatedFaq[index] = {
      ...updatedFaq[index],
      [field]: value,
    };
    setProductDetail({
      ...productdetail,
      faq: updatedFaq,
    });
  };
  const handleDownload = () => {
    if (productdetail.catalogue) {
      const downloadLink = productdetail.catalogue;
      window.open(downloadLink, '_blank');
    }
  };
  const handleVideoDownload = () => {
    if (productdetail.video) {
      const downloadLink = productdetail.video;
      window.open(downloadLink, '_blank');
    }
  };
  const { data: categoryData, error: error1 } = useQuery(GET_CATEGORY);
  if (error1) {
    console.log('GET_CATEGORY', error1);
  }
  const filteredCategories = categoryData?.getAllCategories.filter((category) => productdetail?.categories.includes(category.id));
  const { data: productClassData, error: errorProductClass } = useQuery(ALL_PRODUCT_CLASS);
  if (errorProductClass) {
    console.log('GET_ALL_PRODUCT_CLASS', errorProductClass);
  }
  const initialFormData = {
    listingCommType: '',
    listingComm: '',
    productCommType: '',
    productComm: '',
    shippingCommType: '',
    shippingComm: '',
    fixedCommType: '',
    fixedComm: '',
    productClassNameID: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [ModalView, setModalView] = useState(false);
  const [addcommandapproveId, setAddcommandapproveId] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [Addcommandapprove] = useMutation(ADD_COMMISSION_AND_APPROVE, {
    onCompleted: () => {
      setTimeout(() => {
        history.push('/admin/product_approval/list');
      }, 2000);
    },
  });
  const fillCommission = (prodClassId) => {
    const selectedProdClass = productClassData?.getAllProductClass.find((classItem) => classItem.id === prodClassId);
    if (selectedProdClass) {
      setFormData({
        listingCommType: selectedProdClass.listingType,
        listingComm: selectedProdClass.listingCommission,
        productCommType: selectedProdClass.productType,
        productComm: selectedProdClass.productCommission,
        shippingCommType: selectedProdClass.shippingType,
        shippingComm: selectedProdClass.shippingCommission,
        fixedCommType: selectedProdClass.fixedType,
        fixedComm: selectedProdClass.fixedCommission,
        productClassNameID: selectedProdClass.id,
      });
    }
  };
  const handleCommissionChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
    if (name === 'productClassNameID') {
      fillCommission(value);
    }
  };
  const handleApproveClick = (id) => {
    setAddcommandapproveId(id);
    setModalView(true);
  };
  const handleApproveConfirm = (e) => {
    e.preventDefault();
    Addcommandapprove({
      variables: {
        addcommandapproveId: productdetail.id,
        approve: true,
        reject: false,
        rejectReason: '',
        fixedComm: parseFloat(formData.fixedComm),
        fixedCommType: formData.fixedCommType,
        shippingComm: parseFloat(formData.shippingComm),
        productComm: parseFloat(formData.productComm),
        productCommType: formData.productCommType,
        listingComm: parseFloat(formData.listingComm),
        shippingCommType: formData.shippingCommType,
        listingCommType: formData.listingCommType,
        productClassNameID: formData.productClassNameID,
      },
    });
    setModalView(false);
  };
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
      } catch (err) {
        toast.error(err.message || 'Something went wrong!'); 
      }
    } else {
      toast.error('Fill the reason for Rejection.');
    }
  };
  let matchedClass = null;

  if (productdetail?.approve) {
    matchedClass = productClassData?.getAllProductClass.find((item) => item.code === productdetail?.classCode);
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link text-dark pb-1 d-inline-block hidden breadcrumb-back" to="/admin/product_approval/list">
              <span className="align-middle text-small text-dark ms-1">Product List</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <h1 className="mb-0 pb-3 text-center fw-bold" id="title">
        {title}
      </h1>
      {data?.getProduct && productdetail && (
        <>
          <Form>
            <Row>
              <Col xl="8">
                <Card className="mb-5">
                  <Card.Body>
                    {matchedClass && (
                      <div className="container px-3 py-4 bg-white border rounded shadow-sm mb-4">
                        <h5 className="mb-4 text-dark fw-bold">Commission Details</h5>

                        {/* Price & Commission Summary */}
                        <div>
                          {productdetail?.variant?.length > 0 ? (
                            productdetail.variant.map((variant, variantIndex) =>
                              variant.location?.map((loc, locIndex) => {
                                const sum = (loc.price ?? 0) + (loc.extraCharge ?? 0) + (loc.transportCharge ?? 0);
                                const commissionPercent = matchedClass?.productCommission ?? 0;

                                // Calculate commission directly on sum
                                const commissionValue = (sum * commissionPercent) / 100;

                                const listingCommission = matchedClass?.listingCommission ?? 0;
                                const fixedCommission = matchedClass?.fixedCommission ?? 0;

                                const totalCommission = commissionValue + listingCommission + fixedCommission;
                                const netAmount = sum - totalCommission;

                                return (
                                  <div key={`${variantIndex}-${locIndex}`} className="mb-4 p-3 border rounded bg-light">
                                    <h6 className="fw-semibold text-primary mb-2">
                                      {productdetail?.fullName} {variant?.variantName}
                                    </h6>
                                    <div className="row">
                                      <div className="col-md-4 mb-2">
                                        <span className="fw-medium text-muted">Selling Price:</span>
                                        <div className="text-dark">₹{sum.toFixed(2)}</div>
                                      </div>
                                      <div className="col-md-4 mb-2">
                                        <span className="fw-medium text-muted">Total Commission:</span>
                                        <div className="text-dark">₹{totalCommission.toFixed(2)}</div>
                                      </div>
                                      <div className="col-md-4 mb-2">
                                        <span className="fw-medium text-muted">Net Settled Amount:</span>
                                        <div className="text-success fw-bold">₹{netAmount.toFixed(2)}</div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            )
                          ) : (
                            <div className="text-muted">No price data available.</div>
                          )}
                        </div>

                        {/* Class Details */}
                        <div className="mt-4 border-top pt-3">
                          <h6 className="fw-bold mb-3">Class Info</h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between">
                                <span className="fw-medium text-muted">Class Name:</span>
                                <span className="text-dark">{matchedClass.productClassName}</span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between">
                                <span className="fw-medium text-muted">Code:</span>
                                <span className="text-dark">{matchedClass.code}</span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between">
                                <span className="fw-medium text-muted">Sale Commission Fee:</span>
                                <span className="text-dark">{matchedClass.productCommission}%</span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between">
                                <span className="fw-medium text-muted">Listing Fee:</span>
                                <span className="text-dark">₹{matchedClass.listingCommission}</span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between">
                                <span className="fw-medium text-muted">Fixed Closing Fee:</span>
                                <span className="text-dark">₹{matchedClass.fixedCommission}</span>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="d-flex justify-content-between">
                                <span className="fw-medium text-muted">Shipping Fee:</span>
                                <span className="text-dark">{matchedClass.shippingCommission}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-2">
                      <Form.Group controlId="fullName">
                        <Form.Label className="fw-bold text-dark">Full Name</Form.Label>
                        <Form.Control disabled type="text" name="fullName" value={productdetail.fullName || ''} onChange={handleChange} />
                      </Form.Group>
                    </div>
                    <div className="row">
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="previewName">
                          <Form.Label className="fw-bold text-dark">Preview Name</Form.Label>
                          <Form.Control disabled type="text" name="previewName" value={productdetail.previewName || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="brand_name">
                          <Form.Label className="fw-bold text-dark">Brand Name</Form.Label>
                          <Form.Control disabled type="text" name="brand_name" value={productdetail.brand_name || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                    </div>
                    {/* <div className="mb-3">
                      <Form.Group controlId="description">
                        <Form.Label className="fw-bold text-dark">Description</Form.Label>
                        <ReactQuill modules={modules} theme="snow" value={productdetail.description || ''} onChange={handleDescriptionChange } />
                      </Form.Group>
                    </div> */}
                    <div className="mb-3">
                      <Form.Group controlId="description">
                        <Form.Label className="fw-bold text-dark">Description</Form.Label>
                        <div
                          className="border p-3 bg-light rounded"
                          dangerouslySetInnerHTML={{ __html: productdetail.description || 'No description available.' }}
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-3">
                      <Form.Group controlId="sellerNotes">
                        <Form.Label className="fw-bold text-dark">Seller Notes</Form.Label>
                        <div className="border p-2 bg-light rounded" dangerouslySetInnerHTML={{ __html: productdetail.sellerNotes || 'No notes available.' }} />
                      </Form.Group>
                    </div>

                    <div className="mb-3">
                      <Form.Group controlId="returnPolicy">
                        <Form.Label className="fw-bold text-dark">Return Policy</Form.Label>
                        <div
                          className="border p-2 bg-light rounded"
                          dangerouslySetInnerHTML={{ __html: productdetail.returnPolicy || 'No return policy available.' }}
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-3">
                      <Form.Group controlId="shippingPolicy">
                        <Form.Label className="fw-bold text-dark">Shipping Policy</Form.Label>
                        <div
                          className="border p-2 bg-light rounded"
                          dangerouslySetInnerHTML={{ __html: productdetail.shippingPolicy || 'No shipping policy available.' }}
                        />
                      </Form.Group>
                    </div>

                    <div className="mb-3">
                      <Form.Group controlId="cancellationPolicy">
                        <Form.Label className="fw-bold text-dark">Cancellation Policy</Form.Label>
                        <div
                          className="border p-2 bg-light rounded"
                          dangerouslySetInnerHTML={{ __html: productdetail.cancellationPolicy || 'No cancellation policy available.' }}
                        />
                      </Form.Group>
                    </div>
                    {productdetail?.faq?.length > 0 && (
                      <div className="mb-3">
                        <Form.Label className="fw-bold text-dark">FAQ</Form.Label>
                        {productdetail?.faq.map((item, index) => (
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
                          </div>
                        ))}
                      </div>
                    )}
                    {/* <div className="mb-3">
                      <Form.Group controlId="categories">
                        <Form.Label className="fw-bold text-dark">Categories</Form.Label>
                        <div className="row">
                          {filteredCategories &&
                            filteredCategories.map((cat, i) => (
                              <div key={i} className="col-6">
                                <p> {cat.name} </p>
                              </div>
                            ))}
                        </div>
                      </Form.Group>
                    </div> */}
                    <div className="mb-3">
                      <Form.Group controlId="categories">
                        <Form.Label className="fw-bold text-dark">Categories</Form.Label>
                        <div className="border p-3 bg-light rounded">
                          {filteredCategories && filteredCategories.length > 0 ? (
                            <div className="row">
                              {filteredCategories.map((cat, i) => (
                                <div key={i} className="col-3 mb-2">
                                  {' '}
                                  {/* 👈 4 columns in a row */}
                                  <span className="d-block p-2 bg-white border rounded shadow-sm text-center fw-medium">{cat.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-dark">No categories available.</p>
                          )}
                        </div>
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl="4">
                <div className="mb-2 p-3 bg-white rounded shadow-sm">
                  <h6 className="fw-bold text-primary mb-2">📢 Seller Associate Information</h6>
                  <div className="d-flex flex-column">
                    <div>
                      <span className="fw-bold">🏢 Seller Associate Name: </span> {productdetail?.variant[0]?.location[0]?.sellerId?.companyName || 'N/A'}
                    </div>
                    <div>
                      <span className="fw-bold">📧 Email: </span> {productdetail?.variant[0]?.location[0]?.sellerId?.email || 'N/A'}
                    </div>
                    <div>
                      <span className="fw-bold">📞 Mobile No.: </span> {productdetail?.variant[0]?.location[0]?.sellerId?.mobileNo || 'N/A'}
                    </div>
                    <div>
                      <span className="fw-bold">💬 WhatsApp No.: </span> {productdetail?.variant[0]?.location[0]?.sellerId?.whatsAppMobileNo || 'N/A'}
                    </div>
                  </div>
                </div>
                {productdetail.thumbnail && (
                  <Card className="mb-3">
                    <Card.Body>
                      <div className="row mb-3">
                        <>
                          <div className="mb-3">
                            <Form.Group controlId="thumbnail">
                              <Form.Label className="fw-bold text-dark">Thumbnail</Form.Label>
                            </Form.Group>
                          </div>
                          <div style={{ height: '75px', width: '75px' }} className="ms-3">
                            <img src={productdetail.thumbnail} alt="thumbnail" className="h-100 border p-1 w-auto" />
                          </div>
                        </>
                      </div>
                    </Card.Body>
                  </Card>
                )}
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row mb-3">
                      <div className="mb-3">
                        <Form.Group controlId="productImages">
                          <Form.Label className="fw-bold text-dark">Product Preview Images</Form.Label>
                        </Form.Group>
                      </div>
                      {productdetail.images?.map((image, i) => {
                        return (
                          <div key={i} className="col-auto p-1">
                            <div style={{ height: '75px', width: '75px' }} className="ms-0">
                              <img src={image} alt="productImages" className="h-100 w-auto border rounded" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card.Body>
                </Card>
                {productdetail.catalogue && (
                  <Card className="mb-3">
                    <Card.Body>
                      <div className="row mb-3">
                        <div className="col-auto mb-3">
                          <Form.Group controlId="catalogue">
                            <Form.Label className="fw-bold text-dark">Catalogue</Form.Label>
                          </Form.Group>
                        </div>
                        <div className="col-auto">
                          <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={handleDownload}>
                            <CsLineIcons icon="download" className="text-primary" size="17" />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}
                {productdetail.video && (
                  <Card className="mb-3">
                    <Card.Body>
                      <div className="row mb-3">
                        <div className="mb-3">
                          <Form.Group controlId="video">
                            <Form.Label className="fw-bold text-dark">Video</Form.Label>
                          </Form.Group>
                        </div>
                        <div className="col-auto">
                          <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={handleVideoDownload}>
                            <CsLineIcons icon="download" className="text-primary" size="17" />
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row">
                      <div className="mb-3">
                        <Form.Group controlId="sku">
                          <Form.Label className="fw-bold text-dark">SKU</Form.Label>
                          <Form.Control type="text" name="sku" value={productdetail.sku || ''} disabled />
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
                          <Form.Label className="fw-bold text-dark">Gift Offer</Form.Label>
                          <Form.Control type="text" name="giftOffer" value={productdetail.giftOffer || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                      <div className="mb-3">
                        <Form.Group controlId="youtubeLink">
                          <Form.Label className="fw-bold text-dark">Youtube Link</Form.Label>
                          <Form.Control type="text" name="youtubeLink" value={productdetail.youtubeLink || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>
          <Row>
            <Col xl="8" className="order-2 order-xl-1">
              <Card className="mb-3">
                <Card.Body>
                  <VarientPicker productVariant={productdetail.variant} setProductDetail={setProductDetail} />
                </Card.Body>
              </Card>
            </Col>
            <Col xl="4" className="order-1 order-xl-2">
              <h2 className="fw-bold text-dark">Variant List</h2>
              <Card className="mb-5">
                <Card.Body>
                  {productdetail.variant?.map((variant, i) => {
                    return (
                      <div key={i}>
                        <p>{variant.variantName}</p>
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl="8" className="order-2 order-xl-1">
              <Card className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-around">
                    {!productdetail?.approve && (
                      <Button variant="success" onClick={() => handleApproveClick(productdetail.id)}>
                        Approve
                      </Button>
                    )}

                    {!productdetail?.reject && (
                      <Button
                        variant="danger"
                        onClick={() => {
                          rejectProduct(productdetail.id);
                        }}
                      >
                        Reject
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
      {/* <Modal show={ModalView} onHide={() => setModalView(false)}>
        <Modal.Header closeButton className="p-3">
          <Modal.Title className="fw-bold">Fill Commission</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="my-0">
            <Form onSubmit={handleApproveConfirm}>
              <div className="row">
                <div className=" col-md-12 mb-2">
                  <Form.Group controlId="formProductClass">
                    <Form.Label>Product Class</Form.Label>
                    <Form.Select as="select" name="productClassNameID" required value={formData.productClassNameID} onChange={handleCommissionChange}>
                      <option value="">Select Product Class</option>
                      {productClassData?.getAllProductClass
                        ?.slice()
                        .sort((a, b) => a.productClassName.localeCompare(b.productClassName))
                        .map((productClass) => (
                          <option key={productClass.id} value={productClass.id}>
                            {productClass.productClassName}
                          </option>
                        ))}
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className=" col-md-6 mb-2">
                  <Form.Group controlId="listingCommType">
                    <Form.Label className="text-dark fw-bold">Listing Commission Type</Form.Label>
                    <Form.Select
                      as="select"
                      name="listingCommType"
                      required
                      disabled={formData.listingCommType}
                      value={formData.listingCommType}
                      onChange={handleCommissionChange}
                    >
                      <option>Listing Commission Type</option>
                      <option value="fix">Fix</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="listingComm">
                    <Form.Label className="text-dark fw-bold">Listing Commission</Form.Label>
                    <Form.Control
                      type="number"
                      // required
                      // onWheel={(e) => e.target.blur()}
                      // step="0.01"
                      // min={0}
                      name="listingComm"
                      disabled={formData.listingComm}
                      value={formData.listingComm}
                      onChange={handleCommissionChange}
                      placeholder="Listing Commission"
                    />
                  </Form.Group>
                </div>

                <div className=" col-md-6 mb-2">
                  <Form.Group controlId="productCommType">
                    <Form.Label className="text-dark fw-bold">Product Commission Type</Form.Label>
                    <Form.Select
                      name="productCommType"
                      required
                      disabled={formData.productCommType}
                      value={formData.productCommType}
                      onChange={handleCommissionChange}
                    >
                      <option>Product Commission Type</option>
                      <option value="fix">Fix</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="productComm">
                    <Form.Label className="text-dark fw-bold">Product Commission</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      disabled={formData.productComm}
                      name="productComm"
                      value={formData.productComm}
                      onChange={handleCommissionChange}
                      placeholder="Product Commission"
                    />
                  </Form.Group>
                </div>

                <div className=" col-md-6 mb-2">
                  <Form.Group controlId="fixedCommType">
                    <Form.Label className="text-dark fw-bold">Fixed Commission Type</Form.Label>
                    <Form.Select
                      name="fixedCommType"
                      required
                      disabled={formData.fixedCommType}
                      value={formData.fixedCommType}
                      onChange={handleCommissionChange}
                    >
                      <option>Fixed Commission Type</option>
                      <option value="fix">Fix</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="fixedComm">
                    <Form.Label className="text-dark fw-bold">Fixed Commission</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="fixedComm"
                      disabled={formData.fixedComm}
                      value={formData.fixedComm}
                      onChange={handleCommissionChange}
                      placeholder="Fixed Commission"
                    />
                  </Form.Group>
                </div>
                <div className=" col-md-6 mb-2">
                  <Form.Group controlId="shippingCommType">
                    <Form.Label className="text-dark fw-bold">Shipping Fee Type</Form.Label>
                    <Form.Select
                      name="shippingCommType"
                      disabled={formData.shippingCommType}
                      required
                      value={formData.shippingCommType}
                      onChange={handleCommissionChange}
                    >
                      <option>Shipping Fee Type</option>
                      <option value="fix">Fix</option>
                      <option value="percentage">Percentage</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="shippingComm">
                    <Form.Label className="text-dark fw-bold">Shipping Fee</Form.Label>
                    <Form.Control
                      type="number"
                      required
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="shippingComm"
                      disabled={formData.shippingComm}
                      value={formData.shippingComm}
                      onChange={handleCommissionChange}
                      placeholder="Shipping Fee"
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
      </Modal> */}
      <Modal show={ModalView} onHide={() => setModalView(false)} centered>
        <Modal.Header closeButton className="border-0 shadow-sm ps-4 p-3 ">
          <Modal.Title className="fw-bold text-dark ">Fill Commission Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleApproveConfirm}>
            <div className="row g-3">
              <div className="col-md-12">
                <Form.Group controlId="formProductClass">
                  <Form.Label className="fw-bold text-dark text-dark">Product Class</Form.Label>
                  <Form.Select name="productClassNameID" required value={formData.productClassNameID} onChange={handleCommissionChange} className="shadow-sm">
                    <option value="">Select Product Class</option>
                    {productClassData?.getAllProductClass
                      ?.slice()
                      .sort((a, b) => a.productClassName.localeCompare(b.productClassName))
                      .map((productClass) => (
                        <option key={productClass.id} value={productClass.id}>
                          {productClass.productClassName}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="listingCommType">
                  <Form.Label className="fw-bold text-dark">Listing Commission Type</Form.Label>
                  <Form.Select
                    name="listingCommType"
                    required
                    disabled={formData.listingCommType}
                    value={formData.listingCommType}
                    onChange={handleCommissionChange}
                    className="shadow-sm"
                  >
                    <option>Listing Commission Type</option>
                    <option value="fix">Fix</option>
                    <option value="percentage">Percentage</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="listingComm">
                  <Form.Label className="fw-bold text-dark">Listing Commission</Form.Label>
                  <Form.Control
                    type="number"
                    name="listingComm"
                    disabled={formData.listingComm}
                    value={formData.listingComm}
                    onChange={handleCommissionChange}
                    placeholder="Enter Listing Commission"
                    className="shadow-sm"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group controlId="productCommType">
                  <Form.Label className="fw-bold text-dark">Product Commission Type</Form.Label>
                  <Form.Select
                    name="productCommType"
                    required
                    disabled={formData.productCommType}
                    value={formData.productCommType}
                    onChange={handleCommissionChange}
                    className="shadow-sm"
                  >
                    <option>Product Commission Type</option>
                    <option value="fix">Fix</option>
                    <option value="percentage">Percentage</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="productComm">
                  <Form.Label className="fw-bold text-dark">Product Commission</Form.Label>
                  <Form.Control
                    type="number"
                    name="productComm"
                    required
                    disabled={formData.productComm}
                    value={formData.productComm}
                    onChange={handleCommissionChange}
                    placeholder="Enter Product Commission"
                    className="shadow-sm"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group controlId="fixedCommType">
                  <Form.Label className="fw-bold text-dark">Fixed Commission Type</Form.Label>
                  <Form.Select
                    name="fixedCommType"
                    required
                    disabled={formData.fixedCommType}
                    value={formData.fixedCommType}
                    onChange={handleCommissionChange}
                    className="shadow-sm"
                  >
                    <option>Fixed Commission Type</option>
                    <option value="fix">Fix</option>
                    <option value="percentage">Percentage</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="fixedComm">
                  <Form.Label className="fw-bold text-dark">Fixed Commission</Form.Label>
                  <Form.Control
                    type="number"
                    name="fixedComm"
                    required
                    disabled={formData.fixedComm}
                    value={formData.fixedComm}
                    onChange={handleCommissionChange}
                    placeholder="Enter Fixed Commission"
                    className="shadow-sm"
                  />
                </Form.Group>
              </div>

              <div className="col-md-6">
                <Form.Group controlId="shippingCommType">
                  <Form.Label className="fw-bold text-dark">Shipping Fee Type</Form.Label>
                  <Form.Select
                    name="shippingCommType"
                    disabled={formData.shippingCommType}
                    required
                    value={formData.shippingCommType}
                    onChange={handleCommissionChange}
                    className="shadow-sm"
                  >
                    <option>Shipping Fee Type</option>
                    <option value="fix">Fix</option>
                    <option value="percentage">Percentage</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group controlId="shippingComm">
                  <Form.Label className="fw-bold text-dark">Shipping Fee</Form.Label>
                  <Form.Control
                    type="number"
                    name="shippingComm"
                    required
                    disabled={formData.shippingComm}
                    value={formData.shippingComm}
                    onChange={handleCommissionChange}
                    placeholder="Enter Shipping Fee"
                    className="shadow-sm"
                  />
                </Form.Group>
              </div>
              <div className="col-md-12 d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={() => setModalView(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Approve Product
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={rejectModal} onHide={() => setRejectModal(false)} centered>
        <Modal.Header closeButton className="border p-4 pb-3 mb-3">
          <Modal.Title className="fw-bold text-dark">Reject Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Form onSubmit={handleReject}>
            <Form.Group controlId="rejectReason" className="mb-3">
              <Form.Label className="text-dark fw-bold">Rejection Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                name="rejectReason"
                placeholder="Enter the reason for rejection..."
                className="border rounded-2 shadow-sm"
              />
            </Form.Group>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setRejectModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Reject Product
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DetailViewProduct;
