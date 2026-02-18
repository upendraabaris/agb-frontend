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
  query GetSuperSellerProduct($name: String) {
    getSuperSellerProduct(name: $name) {
      id
      superSellerId
      seriesType
      silent_features
      supervariant {
        id
        superlocation {
          id
          pincode
          mainStock
          displayStock
          sellerId {
            companyName
          }
          allPincode
          status
          unitType
          finalPrice
          priceType
          price
          gstRate
          extraChargeType
          extraCharge
          transportChargeType
          transportCharge
          b2cdiscount
          b2bdiscount
          state
          sellerarray {
            pincode
            sellerId {
              companyName
            }
            status
          }
        }
        variantName
        status
        hsn
      }
      faq {
        answer
        question
      }
      brand_name
      approve
      previewName
      fullName
      identifier
      thumbnail
      sku
      active
      reject
      rejectReason
      returnPolicy
      shippingPolicy
      cancellationPolicy
      description
      giftOffer
      sellerNotes
      video
      youtubeLink
      catalogue
      images
      categories
      listingCommType
      listingComm
      fixedComm
      fixedCommType
      shippingComm
      shippingCommType
      productComm
      productCommType
      priceUpdateDate
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
  mutation Suppersellerproductapprove(
    $suppersellerproductapproveId: ID
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
    suppersellerproductapprove(
      id: $suppersellerproductapproveId
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
  const title = 'BA Product Detail';
  const description = 'BA Product Detail';
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
  const [productdetail, setSuperSellerProductDetail] = useState(null);
  const [GetSuperSellerProduct, { error, data, refetch }] = useLazyQuery(GET_PRODUCT, {
    variables: {
      name: identifier.replace(/_/g, ' '),
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!'); 
    },
  });
  useEffect(() => {
    if (data && data.getSuperSellerProduct) {
      setSuperSellerProductDetail({
        ...data.getSuperSellerProduct,
        faq: data.getSuperSellerProduct.faq?.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
        variant: data.getSuperSellerProduct.variant?.map((variant) => {
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
      GetSuperSellerProduct();
    }
    // eslint-disable-next-line
  }, [identifier]);
  const handleChange = (event) => {
    event.preventDefault();
  };
  const handleDescriptionChange = (desc) => {
    setSuperSellerProductDetail((prevFormData) => ({
      ...prevFormData,
      description: desc,
    }));
  };
  const handleSellerNoteChange = (sellernote) => {
    setSuperSellerProductDetail((prevFormData) => ({
      ...prevFormData,
      sellerNotes: sellernote,
    }));
  };
  const handleReturnPolicyChange = (returnPolicies) => {
    setSuperSellerProductDetail((prevFormData) => ({
      ...prevFormData,
      returnPolicy: returnPolicies,
    }));
  };
  const handleShippingPolicyChange = (shippingPolicies) => {
    setSuperSellerProductDetail((prevFormData) => ({
      ...prevFormData,
      shippingPolicy: shippingPolicies,
    }));
  };
  const handleCancellationPolicyChange = (cancellationPolicies) => {
    setSuperSellerProductDetail((prevFormData) => ({
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
    setSuperSellerProductDetail({
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

  // HANDLE VIDEO
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

  // Handle approval
  const { data: productClassData, error: errorProductClass } = useQuery(ALL_PRODUCT_CLASS);
  if (errorProductClass) {
    console.log('GET_ALL_PRODUCT_CLASS', errorProductClass);
  }

  // Add commission to the Product
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
  const [suppersellerproductapproveId, setSuppersellerproductapproveId] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [Suppersellerproductapprove] = useMutation(ADD_COMMISSION_AND_APPROVE, {
    onCompleted: () => {
      setTimeout(() => {
        history.push('/admin/product_approval/listSuperProduct');
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
    setSuppersellerproductapproveId(id);
    setModalView(true);
  };
  const handleApproveConfirm = (e) => {
    e.preventDefault();
    Suppersellerproductapprove({
      variables: {
        suppersellerproductapproveId: productdetail.id,
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

  // Reject the product
  const rejectProduct = (prodId) => {
    setRejectModal(true);
    setSuppersellerproductapproveId(prodId);
  };
  const handleReject = async (e) => {
    e.preventDefault();
    if (suppersellerproductapproveId && rejectReason.trim()) {
      try {
        await Suppersellerproductapprove({
          variables: {
            suppersellerproductapproveId,
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
      {data?.getSuperSellerProduct && productdetail && (
        <>
          <Form>
            <Row>
              <Col xl="8">
                <Card className="mb-5">
                  <Card.Body>
                    <div className="mb-2">
                      <Form.Group controlId="fullName">
                        <Form.Label className="fw-bold text-dark">Full Name</Form.Label>
                        <Form.Control type="text" name="fullName" value={productdetail.fullName || ''} onChange={handleChange} />
                      </Form.Group>
                    </div>
                    <div className="row">
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="previewName">
                          <Form.Label className="fw-bold text-dark">Preview Name</Form.Label>
                          <Form.Control type="text" name="previewName" value={productdetail.previewName || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="brand_name">
                          <Form.Label className="fw-bold text-dark">Brand Name</Form.Label>
                          <Form.Control type="text" name="brand_name" value={productdetail.brand_name || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="description">
                        <Form.Label className="fw-bold text-dark">Description</Form.Label>
                        <ReactQuill modules={modules} theme="snow" value={productdetail.description || ''} onChange={handleDescriptionChange} />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="sellerNotes">
                        <Form.Label className="fw-bold text-dark">Seller Notes</Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="Seller's Notes"
                          value={productdetail.sellerNotes || ''}
                          onChange={handleSellerNoteChange}
                        />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="returnPolicy">
                        <Form.Label className="fw-bold text-dark">Return Policy</Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="return Policy"
                          value={productdetail.returnPolicy || ''}
                          onChange={handleReturnPolicyChange}
                        />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="shippingPolicy">
                        <Form.Label className="fw-bold text-dark">Shipping Policy</Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="Shipping Policy"
                          value={productdetail.shippingPolicy || ''}
                          onChange={handleShippingPolicyChange}
                        />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="cancellationPolicy">
                        <Form.Label className="fw-bold text-dark">Cancellation Policy</Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="Cancellation Policy"
                          value={productdetail.cancellationPolicy || ''}
                          onChange={handleCancellationPolicyChange}
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
                    <div className="mb-3">
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
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl="4">
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

          {/* <Row>
            <Col xl="8" className="order-2 order-xl-1">
              <Card className="mb-3">
                <Card.Body>
                  <VarientPicker productVariant={productdetail.variant} setSuperSellerProductDetail={setSuperSellerProductDetail} />
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
          </Row> */}

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

      <Modal show={ModalView} onHide={() => setModalView(false)}>
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
                        ?.slice() // Create a shallow copy of the array to avoid mutating the original data
                        .sort((a, b) => a.productClassName.localeCompare(b.productClassName)) // Sort alphabetically
                        .map(
                          (
                            productClass // Map sorted array to option elements
                          ) => (
                            <option key={productClass.id} value={productClass.id}>
                              {productClass.productClassName}
                            </option>
                          )
                        )}
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
      </Modal>
      <Modal show={rejectModal} onHide={() => setRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Product</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={handleReject}>
            <div className="row">
              <div className="mb-2">
                <Form.Group controlId="rejectReason">
                  <Form.Label className="text-dark fw-bold">Reject Product</Form.Label>
                  <Form.Control
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                    name="rejectReason"
                    placeholder="Reason for Rejection!"
                  />
                </Form.Group>
              </div>
              <Button className="mt-2" variant="primary" type="submit">
                Submit
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DetailViewProduct;
