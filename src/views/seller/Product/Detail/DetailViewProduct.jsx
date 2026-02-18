import React, { useState, useEffect, useRef } from 'react';
import { useParams, NavLink, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Accordion, Row, Col, Button, Spinner, Form, Card, Tooltip, OverlayTrigger } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import VarientPicker from './components/VarientPicker';
import HandleCategory from './components/HandleCategory';

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $updateProductId: ID
    $productImages: [Upload]
    $brandName: String
    $previewName: String
    $fullName: String
    $searchName: String
    $returnPolicy: String
    $thumbnail: String
    $shippingPolicy: String
    $cancellationPolicy: String
    $description: String
    $giftOffer: String
    $sellerNotes: String
    $video: String
    $images: [String]
    $youtubeLink: String
    $catalogue: String
    $categories: [String]
    $faq: [FaqInput]
    $variant: [VariantInput]
  ) {
    updateProduct(
      id: $updateProductId
      productImages: $productImages
      brand_name: $brandName
      previewName: $previewName
      fullName: $fullName
      searchName: $searchName
      returnPolicy: $returnPolicy
      thumbnail: $thumbnail
      shippingPolicy: $shippingPolicy
      cancellationPolicy: $cancellationPolicy
      description: $description
      giftOffer: $giftOffer
      sellerNotes: $sellerNotes
      video: $video
      images: $images
      youtubeLink: $youtubeLink
      catalogue: $catalogue
      categories: $categories
      faq: $faq
      variant: $variant
    ) {
      id
    }
  }
`;

const GET_PRODUCT = gql`
  query GetProduct($name: String!) {
    getProduct(name: $name) {
      brand_name
      cancellationPolicy
      catalogue
      categories
      description
      sku
      faq {
        answer
        question
      }
      fullName
      searchName
      giftOffer
      id
      images
      previewName
      returnPolicy
      sellerNotes
      shippingPolicy
      thumbnail
      video
      youtubeLink
      listingComm
      listingCommType
      fixedComm
      fixedCommType
      shippingComm
      shippingCommType
      productComm
      productCommType
      variant {
        id
        hsn
        minimunQty
        moq
        silent_features
        variantName
        active
        allPincode
        location {
          id
          b2bdiscount
          displayStock
          b2cdiscount
          extraCharge
          extraChargeType
          finalPrice
          gstRate
          gstType
          mainStock
          pincode
          state
          price
          priceType
          transportCharge
          transportChargeType
          unitType
        }
      }
    }
  }
`;

const DELETE_IMAGE = gql`
  mutation Deleteimages($deleteimagesId: ID, $url: String) {
    deleteimages(id: $deleteimagesId, url: $url) {
      message
      success
    }
  }
`;

const DELETE_CATALOGUE = gql`
  mutation Deletecatalogue($deletecatalogueId: ID, $url: String) {
    deletecatalogue(id: $deletecatalogueId, url: $url) {
      message
      success
    }
  }
`;

const UPLOAD_THUMBNAIL = gql`
  mutation UploadThumbnail($uploadThumbnailId: ID, $file: Upload, $filestring: String) {
    uploadThumbnail(id: $uploadThumbnailId, file: $file, filestring: $filestring) {
      message
      success
    }
  }
`;

const UPLOAD_CATALOGUE = gql`
  mutation UploadCatalogue($uploadCatalogueId: ID, $file: Upload, $filestring: String) {
    uploadCatalogue(id: $uploadCatalogueId, file: $file, filestring: $filestring) {
      message
    }
  }
`;

const UPLOAD_VIDEO = gql`
  mutation UploadVideo($uploadVideoId: ID, $filestring: String, $file: Upload) {
    uploadVideo(id: $uploadVideoId, filestring: $filestring, file: $file) {
      message
    }
  }
`;

const DetailViewProduct = ({ history }) => {
  const title = 'Edit Product';
  const description = 'Ecommerce Product Detail Page';
  const { productname } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  // Editor
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
  const [selectedPolicy, setSelectedPolicy] = useState('cancellation');

  const [GetProduct, { error, data, refetch }] = useLazyQuery(GET_PRODUCT, {
    variables: {
      name: productname.replace(/_/g, ' '),
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
    if (productname) {
      GetProduct();
      refetch();
    }
    // eslint-disable-next-line
  }, [productname]);

  const [UpdateProduct] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => {
      toast.success('Product Updated Successfully!');
      setTimeout(() => {
        history.push('/seller/product/list');

        window.close();
      }, 3000);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!');
    },
  });

  const handleChange = async (event) => {
    const { name, value, files } = event.target;
    if (name === 'productImages' || name === 'thumbnail') {
      if (!files || files.length === 0) return;
      if (name === 'productImages') {
        const fileArray = Array.from(files);
        const validFiles = await Promise.all(
          fileArray.map((file) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.src = URL.createObjectURL(file);
              img.onload = () => {
                if (img.width === img.height) {
                  resolve(file);
                } else {
                  alert(`Image is not a square image. Please upload a square image.`);
                  resolve(null);
                }
              };
              img.onerror = () => resolve(null);
            });
          })
        );

        const filteredFiles = validFiles.filter(Boolean);
        setProductDetail((prev) => ({
          ...prev,
          [name]: filteredFiles.length > 0 ? filteredFiles : [],
        }));

        if (filteredFiles.length === 0) {
          event.target.value = null;
        }
      } else if (name === 'thumbnail') {
        const file = files[0];
        const isSquare = await new Promise((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => resolve(img.width === img.height);
          img.onerror = () => resolve(false);
        });

        if (isSquare) {
          setProductDetail((prev) => ({
            ...prev,
            [name]: file,
          }));
        } else {
          alert('Image is not a square image. Please upload a square image.');
          event.target.value = null;
          setProductDetail((prev) => ({
            ...prev,
            [name]: null,
          }));
        }
      }
    } else {
      setProductDetail((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
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

  const [formErrors, setFormErrors] = useState({});
  const submit = async () => {
    const errors = {};
    const descriptionText = productdetail.description ? productdetail.description.replace(/<[^>]+>/g, '').trim() : '';
    if (!descriptionText) {
      errors.description = 'Description is required.';
    }

    if (!productdetail.fullName?.trim()) {
      errors.fullName = 'Product Full Name is required.';
    }

    if (!productdetail.previewName?.trim()) {
      errors.previewName = 'Product Preview Name is required.';
    }

    if (!productdetail.brand_name?.trim()) {
      errors.brand_name = 'Brand Name is required.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    await UpdateProduct({
      variables: {
        updateProductId: productdetail.id,
        brandName: productdetail.brand_name,
        ...productdetail,
      },
    });
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

  const handleAddFaq = () => {
    setProductDetail({
      ...productdetail,
      faq: [...productdetail.faq, { question: '', answer: '' }],
    });
  };

  const handleRemoveFaq = (index) => {
    const updatedFaq = [...productdetail.faq];
    updatedFaq.splice(index, 1);
    setProductDetail({
      ...productdetail,
      faq: updatedFaq,
    });
  };

  const [Deleteimages] = useMutation(DELETE_IMAGE, {
    onCompleted: (res) => {
      toast.success(res.deleteimages.message || 'Image Delete successfull!');
      refetch();
    },
    onError: (err) => {
      console.log('DELETE_IMAGE', err);
    },
  });
  const deleteImg = async (index, url1) => {
    const newImages = [...productdetail.images];
    await Deleteimages({
      variables: {
        deleteimagesId: productdetail.id,
        url: url1,
      },
    });
    newImages.splice(index, 1);
    setProductDetail({
      ...productdetail,
      images: newImages,
    });
  };

  const [Deletecatalogue] = useMutation(DELETE_CATALOGUE, {
    onCompleted: (res) => {
      toast.success(res.deletecatalogue.message || 'Catalogue Delete successfull!');
      refetch();
    },
    onError: (err) => {
      console.log('DELETE_CATALOGUE', err);
    },
  });
  const deleteCatalogue = async (url1) => {
    await Deletecatalogue({
      variables: {
        deletecatalogueId: productdetail.id,
        url: url1,
      },
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [UploadThumbnail] = useMutation(UPLOAD_THUMBNAIL, {
    onCompleted: (res) => {
      toast.success(res.uploadThumbnail.message || 'Thumbnail Uploaded successfull!');
      setThumbnail(null);
      refetch();
    },
    onError: (err) => {
      console.log('UPLOAD_THUMBNAIL', err);
    },
  });

  const handleButtonClick = async (action) => {
    setIsLoading(true);
    await action();
    setIsLoading(false);
  };

  const handleThumbnailChange = async (url1) => {
    if (!thumbnail) {
      console.warn('Thumbnail is not set. Aborting upload.');
      return;
    }

    if (!productdetail || !productdetail.id) {
      console.error('Product detail is missing. Cannot proceed with upload.');
      return;
    }

    const variables = url1
      ? {
          uploadThumbnailId: productdetail.id,
          url: url1,
          file: thumbnail,
        }
      : {
          uploadThumbnailId: productdetail.id,
          file: thumbnail,
        };

    try {
      await UploadThumbnail({ variables });
    } catch (uploadError) {
      console.error('Error uploading thumbnail:', uploadError);
    }
  };

  // HANDLE CATALOGUE
  const [catalogue, setCatalogue] = useState(null);
  const fileInputRef = useRef(null);
  const [UploadCatalogue] = useMutation(UPLOAD_CATALOGUE, {
    onCompleted: (res) => {
      toast.success(res.uploadCatalogue.message || 'Catalogue Uploaded successfull!');
      setCatalogue(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      refetch();
    },
    onError: (err) => {
      console.log('UPLOAD_CATALOGUE', err);
    },
  });

  const handleCatalogueChange = async (url1) => {
    if (!catalogue) {
      return;
    }
    if (url1 && catalogue) {
      await UploadCatalogue({
        variables: {
          uploadCatalogueId: productdetail.id,
          filestring: url1,
          file: catalogue,
        },
      });
    }
    if (!url1 && catalogue) {
      await UploadCatalogue({
        variables: {
          uploadCatalogueId: productdetail.id,
          file: catalogue,
        },
      });
    }
  };

  const handleDownload = () => {
    if (productdetail.catalogue) {
      const downloadLink = productdetail.catalogue;
      window.open(downloadLink, '_blank');
    }
  };

  // HANDLE VIDEO

  const [video, setVideo] = useState(null);
  const [UploadVideo] = useMutation(UPLOAD_VIDEO, {
    onCompleted: (res) => {
      toast.success(res.uploadVideo.message || 'Video Uploaded successfull!');
      setVideo(null);
      refetch();
    },
    onError: (err) => {
      console.log('UPLOAD_VIDEO', err);
    },
  });

  const handleVideoChange = async (url1) => {
    if (!video) {
      return;
    }
    if (url1 && video) {
      await UploadVideo({
        variables: {
          uploadVideoId: productdetail.id,
          filestring: url1,
          file: video,
        },
      });
    }
    if (!url1 && video) {
      await UploadVideo({
        variables: {
          uploadVideoId: productdetail.id,
          file: video,
        },
      });
    }
  };

  const handleVideoDownload = () => {
    if (productdetail.video) {
      const downloadLink = productdetail.video;
      window.open(downloadLink, '_blank');
    }
  };
  // handle variant

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
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/dashboard">
              <span className="text-dark ms-1">SA Dashboard</span>
            </NavLink>

            <spna className="small p-2"> / </spna>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="#">
              <span className="text-dark ms-1">{title}</span>
            </NavLink>

            <spna className="small p-2"> / </spna>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/list">
              <span className="text-dark ms-1">Single Seller Products List</span>
            </NavLink>

            <spna className="small p-2"> / </spna>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/list">
              <span className="text-dark ms-1">Edit</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <h1 className="mb-0 fw-bold text-center text-dark pb-3" id="title">
        {title} 
      </h1>
      {data?.getProduct && productdetail && (
        <>
          <div className="rounded p-4 mb-2 bg-white border">
            <div className="fw-bold pb-2">Commission Detail</div>
            {productdetail.productComm ? (
              <span className="border bg-light p-1 ps-2 px-2 mx-1 rounded">
                <span>Product Commission: </span>
                {productdetail.productComm} {productdetail?.productCommType === 'fix' ? 'Rs.' : '%'}
              </span>
            ) : null}
            {productdetail.listingComm ? (
              <span className="border bg-light p-1 ps-2 px-2 mx-1 rounded">
                <span>Listing Commission: </span>
                {productdetail.listingComm} {productdetail?.listingCommType === 'fix' ? 'Rs.' : '%'}
              </span>
            ) : null}
            {productdetail.fixedComm ? (
              <span className="border bg-light p-1 ps-2 px-2 mx-1 rounded">
                <span>Fixed Commission: </span>
                {productdetail.fixedComm} {productdetail?.fixedCommType === 'fix' ? 'Rs.' : '%'}
              </span>
            ) : null}
            {productdetail.shippingComm ? (
              <span className="border bg-light p-1 ps-2 px-2 mx-1 rounded">
                <span>Shipping Fee: </span>
                {productdetail.shippingComm} {productdetail?.shippingCommType === 'fix' ? 'Rs.' : '%'}
              </span>
            ) : null}
          </div>
          <Form>
            <Card className="border rounded mb-2">
              <div className="mark">
                <div className=" fw-bold ps-4 p-1 fs-6">Basic Details </div>{' '}
              </div>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="fullName">
                      <Form.Label className="fw-bold text-dark">
                        Product Full Name <span className="text-danger">*</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              Full name with clear type and key features. Maximum 200 characters.
                            </Tooltip>
                          }
                        >
                          <div className="d-inline-block ms-2">
                            <CsLineIcons icon="info-hexagon" size="17" />
                          </div>
                        </OverlayTrigger>
                      </Form.Label>
                      <Form.Control type="text" name="fullName" maxLength={200} value={productdetail.fullName || ''} onChange={handleChange} />
                      {formErrors.fullName && <div className="mt-1 text-danger">{formErrors.fullName}</div>}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="brand_name">
                      <Form.Label className="fw-bold text-dark">
                        Brand Name <span className="text-danger">*</span>
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
                      <Form.Control type="text" name="brand_name" value={productdetail.brand_name || ''} onChange={handleChange} />
                      {formErrors.brand_name && <div className="mt-1 text-danger">{formErrors.brand_name}</div>}
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group controlId="previewName">
                      <Form.Label className="fw-bold text-dark">
                        Product Preview Name <span className="text-danger">*</span>
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
                      <Form.Control type="text" name="previewName" maxLength={35} value={productdetail.previewName || ''} onChange={handleChange} />
                      {formErrors.previewName && <div className="mt-1 text-danger">{formErrors.previewName}</div>}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="searchName">
                      <Form.Label className="fw-bold text-dark">
                        Product Search Tags
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
                      <Form.Control name="searchName" value={productdetail.searchName || ''} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-3 align-items-stretch">
                  <Col md={6} className="mb-0">
                    <div className="border rounded p-2 h-100 d-flex flex-column">
                      <Form.Label className="fw-bold text-dark mb-2">Product Images</Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        {productdetail.images?.map((image, i) => (
                          <div key={i} className="position-relative" style={{ height: '75px', width: '75px' }}>
                            <img src={image} alt="productImages" className="img-fluid border rounded w-100 h-100 object-fit-cover" />
                            <Button
                              onClick={() => deleteImg(i, image)}
                              className="btn p-0 bg-white border-0 position-absolute"
                              style={{
                                top: '-5px',
                                right: '-5px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                boxShadow: '0 0 3px rgba(0,0,0,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CsLineIcons icon="bin" className="text-danger" size={12} />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Form.Group controlId="productImages" className="mt-3">
                        <Form.Control type="file" accept="image/*" name="productImages" onChange={handleChange} multiple />
                        <small className="text-muted">Upload new images (Size: 1000x1000 px | File: .jpg, .jpeg)</small>
                      </Form.Group>
                    </div>
                  </Col>

                  <Col md={6} className="mb-0">
                    <div className="border rounded p-2 h-100 d-flex flex-column justify-content-between">
                      <div>
                        <Form.Label className="fw-bold text-dark mb-2">Product Preview Image</Form.Label>
                        {productdetail.thumbnail && (
                          <div className="border rounded p-1" style={{ height: '75px', width: '75px' }}>
                            <img src={productdetail.thumbnail} alt="thumbnail" className="img-fluid w-100 h-100 object-fit-cover rounded" />
                          </div>
                        )}

                        <Form.Group controlId="thumbnail" className="mt-3">
                          <Form.Control type="file" accept="image/*" name="thumbnail" onChange={(e) => setThumbnail(e.target.files[0])} />
                          <small className="text-muted">Upload new image (Size: 1000x1000 px | File: .jpg, .jpeg)</small>
                        </Form.Group>
                      </div>

                      <Button
                        className="btn btn-primary btn-sm mt-3 w-25"
                        onClick={() => handleButtonClick(() => handleThumbnailChange(productdetail.thumbnail))}
                      >
                        {isLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                      </Button>
                    </div>
                  </Col>
                </Row>

                <div className="mb-3">
                  <Form.Group controlId="description" className="mt-3">
                    <Form.Label className="fw-bold text-dark">
                      Description <span className="text-danger">*</span>
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
                    <ReactQuill modules={modules} theme="snow" value={productdetail.description || ''} onChange={handleDescriptionChange} />
                    {formErrors.description && <div className="mt-1 text-danger">{formErrors.description}</div>}
                  </Form.Group>
                </div>

                <Accordion className="mb-3">
                  <Accordion.Item eventKey="1">
                    <Accordion.Header style={{ fontSize: '16px' }} className="text-dark fw-bold border-bottom">
                      Category Selection
                    </Accordion.Header>
                    <Accordion.Body>
                      <HandleCategory productdetail={productdetail} setProductDetail={setProductDetail} />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Card.Body>
            </Card>

            <Card className="border rounded mb-2">
              <div className="mark">
                <div className=" fw-bold ps-4 p-1 fs-6">Policies</div>{' '}
              </div>

              <div className="p-3">
                <Form>
                  {/* Cancellation Policy */}
                  <Form.Check
                    type="radio"
                    name="policy"
                    id="cancellationPolicyRadio"
                    label="Cancellation Policy"
                    checked={selectedPolicy === 'cancellation'}
                    onChange={() => setSelectedPolicy('cancellation')}
                    className="fw-bold text-dark mb-2"
                  />
                  {selectedPolicy === 'cancellation' && (
                    <div className="mb-3">
                      <ReactQuill
                        modules={modules}
                        theme="snow"
                        placeholder="Cancellation Policy"
                        value={productdetail?.cancellationPolicy || ''}
                        onChange={handleCancellationPolicyChange}
                      />
                    </div>
                  )}

                  {/* Shipping Policy */}
                  <Form.Check
                    type="radio"
                    name="policy"
                    id="shippingPolicyRadio"
                    label="Shipping Policy"
                    checked={selectedPolicy === 'shipping'}
                    onChange={() => setSelectedPolicy('shipping')}
                    className="fw-bold text-dark mb-2"
                  />
                  {selectedPolicy === 'shipping' && (
                    <div className="mb-3">
                      <ReactQuill
                        modules={modules}
                        theme="snow"
                        placeholder="Shipping Policy"
                        value={productdetail?.shippingPolicy || ''}
                        onChange={handleShippingPolicyChange}
                      />
                    </div>
                  )}

                  {/* Return Policy */}
                  <Form.Check
                    type="radio"
                    name="policy"
                    id="returnPolicyRadio"
                    label="Return Policy"
                    checked={selectedPolicy === 'return'}
                    onChange={() => setSelectedPolicy('return')}
                    className="fw-bold text-dark mb-2"
                  />
                  {selectedPolicy === 'return' && (
                    <div className="mb-3">
                      <ReactQuill
                        modules={modules}
                        theme="snow"
                        placeholder="Return Policy"
                        value={productdetail?.returnPolicy || ''}
                        onChange={handleReturnPolicyChange}
                      />
                    </div>
                  )}
                </Form>
              </div>
            </Card>

            <Card className="border mb-4">
              <div className="mark mb-3">
                <div className="fw-bold ps-4 p-1 fs-6">Extra Features</div>
              </div>

              <Form>
                <div className="mb-3 px-3">
                  <Form.Group controlId="sellerNotes">
                    <Form.Label className="fw-bold text-dark">
                      Seller Notes
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Internal notes (not shown to customers).
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
                      placeholder="Seller's Notes"
                      value={productdetail.sellerNotes || ''}
                      onChange={handleSellerNoteChange}
                    />
                  </Form.Group>
                </div>

                <div className="px-3">
                  {/* <div className="mb-3">
                    <Form.Group controlId="giftOffer">
                      <Form.Label className="fw-bold text-dark">Gift Offer</Form.Label>
                      <Form.Control
                        type="text"
                        name="giftOffer"
                        value={productdetail.giftOffer || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </div> */}

                  {/* Catalogue */}
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark">Catalogue</Form.Label>

                    {productdetail.catalogue && (
                      <div className="row mb-3">
                        <div className="col-auto w-100">
                          <Button variant="foreground-alternate" className="btn-icon btn-icon-only text-info w-100 border shadow" onClick={handleDownload}>
                            <CsLineIcons icon="file-data" className="text-info" size="44" />
                            View Catalogue
                          </Button>
                          <Button className="border w-100 bg-white" onClick={() => deleteCatalogue(productdetail.catalogue)}>
                            <CsLineIcons icon="bin" className="text-danger" size="17" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <Form.Group controlId="catalogue" className="mb-3">
                      <Form.Control
                        type="file"
                        ref={fileInputRef}
                        accept=".doc,.docx,application/pdf"
                        name="catalogue"
                        onChange={(e) => setCatalogue(e.target.files[0])}
                      />
                      {productdetail.catalogue ? <div>Edit catalogue (.pdf)</div> : <div>Upload new catalogue (.pdf)</div>}
                    </Form.Group>

                    <Button className="ms-2 btn btn-primary btn-sm w-5" onClick={() => handleCatalogueChange(productdetail.catalogue)}>
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                    </Button>
                  </div>

                  <div className="mb-3">
                    <Form.Group controlId="youtubeLink">
                      <Form.Label className="fw-bold text-dark">Youtube Link</Form.Label>
                      <Form.Control type="text" name="youtubeLink" value={productdetail.youtubeLink || ''} onChange={handleChange} />
                    </Form.Group>
                  </div>

                  {/* Video */}
                  <div className="mb-3">
                    <Form.Label className="fw-bold text-dark small">Video</Form.Label>

                    {productdetail.video && (
                      <>
                        {/* eslint-disable jsx-a11y/media-has-caption */}
                        <video className="sw-auto pb-2" width="100%" controls>
                          <source src={productdetail.video} type="video/mp4" />
                          <source src={productdetail.video} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      </>
                    )}

                    <Form.Group controlId="video" className="mb-3">
                      <Form.Control type="file" accept="video/*" name="video" onChange={(e) => setVideo(e.target.files[0])} />
                      <div>Upload new video (.mp4)</div>
                    </Form.Group>

                    <Button className="ms-2 btn btn-primary btn-sm w-5" onClick={() => handleVideoChange(productdetail.video)}>
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                    </Button>
                  </div>

                  {/* SKU */}
                  <div className="mb-3">
                    <Form.Group controlId="sku">
                      <Form.Label className="fw-bold text-dark">SKU</Form.Label>
                      <Form.Control type="text" name="sku" value={productdetail.sku || ''} disabled />
                    </Form.Group>
                  </div>

                  <div className="mb-3 p-2 border rounded">
                    <Form.Label className="fs-6 ps-3 text-dark">FAQ</Form.Label>
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
                        <Button variant="danger" className="ms-2" onClick={() => handleRemoveFaq(index)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button variant="primary" className={productdetail.faq.length ? '' : 'ms-2 float-end'} size="sm" onClick={handleAddFaq}>
                      Add FAQ
                    </Button>
                  </div>
                </div>
              </Form>
            </Card>
          </Form>

          <Row>
            <Col xl="8" className="order-2 order-xl-1">
              <Card className="mb-3">
                <Card.Body className="border rounded">
                  <VarientPicker productVariant={productdetail.variant} setProductDetail={setProductDetail} />
                </Card.Body>
              </Card>
            </Col>
            <Col xl="4" className="order-1 order-xl-2">
              <Card className="mb-5">
                <Card.Body className="border rounded">
                  <h2 className=" fs-6 fw-bold">Variant List</h2>
                  {productdetail.variant?.map((variant, i) => {
                    return (
                      <div className="ps-4" key={i}>
                        <p>{variant.variantName}</p>
                      </div>
                    );
                  })}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Button onClick={submit} type="button">
            Submit
          </Button>
          {/* <Button onClick={print} type="button">
            Print
          </Button> */}
        </>
      )}
    </>
  );
};

export default withRouter(DetailViewProduct);
