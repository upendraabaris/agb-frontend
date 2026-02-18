import React, { useState, useEffect } from 'react';
import { useParams, NavLink, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { Accordion, Row, Col, Button, Spinner, Form, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import VarientPicker from './components/VarientPicker';
import HandleCategory from './components/HandleCategory';

const GET_PRODUCT = gql`
  query GetSuperSellerProductEdit($name: String) {
    getSuperSellerProductEdit(name: $name) {
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
          sellerId {
            id
            companyName
          }
        }
        variantName
        status
        hsn
      }
      faq {
        question
        answer
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
const UPDATE_PRODUCT = gql`
  mutation UpdateSuperSellerProduct(
    $updateSuperSellerProductId: ID
    $productImages: [Upload]
    $silentFeatures: String
    $faq: [SuperFaqInput]
    $brandName: String
    $previewName: String
    $approve: Boolean
    $fullName: String
    $thumbnail: String
    $returnPolicy: String
    $shippingPolicy: String
    $cancellationPolicy: String
    $description: String
    $giftOffer: String
    $sellerNotes: String
    $video: String
    $supervariant: [SuperVariantInput]
    $variant: [SuperVariantInput]
    $youtubeLink: String
    $catalogue: String
    $categories: [String]
    $listingCommType: String
    $listingComm: Float
    $productCommType: String
    $productComm: Float
    $shippingCommType: String
    $shippingComm: Float
    $fixedCommType: String
    $fixedComm: Float
    $active: Boolean
  ) {
    updateSuperSellerProduct(
      brand_name: $brandName
      id: $updateSuperSellerProductId
      productImages: $productImages
      silent_features: $silentFeatures
      faq: $faq
      previewName: $previewName
      approve: $approve
      fullName: $fullName
      thumbnail: $thumbnail
      returnPolicy: $returnPolicy
      shippingPolicy: $shippingPolicy
      cancellationPolicy: $cancellationPolicy
      description: $description
      giftOffer: $giftOffer
      sellerNotes: $sellerNotes
      video: $video
      supervariant: $supervariant
      variant: $variant
      youtubeLink: $youtubeLink
      catalogue: $catalogue
      categories: $categories
      listingCommType: $listingCommType
      listingComm: $listingComm
      productCommType: $productCommType
      productComm: $productComm
      shippingCommType: $shippingCommType
      shippingComm: $shippingComm
      fixedCommType: $fixedCommType
      fixedComm: $fixedComm
      active: $active
    ) {
      id
    }
  }
`;

const DetailViewProduct = ({ history }) => {
  const title = 'Edit BA Product';
  const description = 'Edit BA Product';
  const { productname } = useParams();
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
  const [GetSuperSellerProductEdit, { error, data, refetch }] = useLazyQuery(GET_PRODUCT, {
    variables: {
      name: productname.replace(/_/g, ' '),
    },
    onError: () => {
      toast.error(error.message || 'Something went wrong!');
    },
  });
  useEffect(() => {
    if (data && data.getSuperSellerProductEdit) {
      setProductDetail({
        ...data.getSuperSellerProductEdit,
        faq: data.getSuperSellerProductEdit.faq?.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
        variant: data.getSuperSellerProductEdit.supervariant?.map((variant) => {
          const { __typename, ...variantWithoutTypename } = variant;
          return variantWithoutTypename;
        }),
      });
    }
  }, [data]);
  useEffect(() => {
    if (productname) {
      GetSuperSellerProductEdit();
      refetch();
    }
    // eslint-disable-next-line
  }, [productname]);
  const [updateSuperSellerProduct] = useMutation(UPDATE_PRODUCT, {
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
  const handleChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'productImages') {
      setProductDetail((prevFormData) => ({
        ...prevFormData,
        [name]: files,
      }));
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
  const removeTypename = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(removeTypename);
    }

    if (obj && typeof obj === 'object') {
      return Object.fromEntries(
        Object.entries(obj)
          .filter(([key]) => key !== '__typename')
          .map(([key, value]) => [key, removeTypename(value)])
      );
    }

    return obj;
  };
  const submit = async () => {
    const cleanedData = removeTypename(productdetail);
    const ww = cleanedData;
    ww.variant = ww.variant.map((v) => ({
      ...v,
      superlocation: v.superlocation.map((s) => ({
        ...s,
        sellerId: s.sellerId?.id,
      })),
    }));

    ww.supervariant = ww.supervariant.map((sv) => ({
      ...sv,
      superlocation: sv.superlocation.map((s) => ({
        ...s,
        sellerId: s.sellerId?.id,
      })),
    }));

    await updateSuperSellerProduct({
      variables: {
        updateSuperSellerProductId: ww.id,
        brandName: ww.brand_name,
        ...ww,
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
      toast.success(res.deleteimages.message || 'img Delete successfull!');
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
      return;
    }

    if (url1 && thumbnail) {
      await UploadThumbnail({
        variables: {
          uploadThumbnailId: productdetail.id,
          url: url1,
          file: thumbnail,
        },
      });
    }
    if (!url1 && thumbnail) {
      await UploadThumbnail({
        variables: {
          uploadThumbnailId: productdetail.id,
          file: thumbnail,
        },
      });
    }
  };
  const [catalogue, setCatalogue] = useState(null);
  const [UploadCatalogue] = useMutation(UPLOAD_CATALOGUE, {
    onCompleted: (res) => {
      toast.success(res.uploadCatalogue.message || 'Catalogue Uploaded successfull!');
      setCatalogue(null);
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

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container m-0">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/superSeller/dashboard">
              <span className="align-middle text-dark ms-1 px-2">BA Dashboard</span>
            </NavLink>
            <span className="small p-2"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/superSeller/product/list">
              <span className="align-middle text-dark ms-1 px-2">BA Product</span>
            </NavLink>
            <span className="small p-2"> / </span>
            <span className="align-middle text-dark ms-1">Edit Product</span>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <h1 className="mb-2 fw-bold text-center text-dark bg-white p-2" id="title">
        {title}
      </h1>
      {data?.getSuperSellerProductEdit && productdetail && (
        <>
          {/* <div className='rounded p-4 mb-2 bg-white'>
              <div className='fw-bold pb-2'>Commission Detail</div>
              {productdetail.productComm ? (
                <span className="border bg-light p-1 ps-2 px-2 mx-1 rounded">
                  <span>Product Commission: </span>
                  {productdetail.productComm} {productdetail?.productCommType === "fix" ? ("Rs.") : ("%")}
                </span>
              ) : null}
              {productdetail.listingComm ? (
                <span className="border bg-light p-1 ps-2 px-2 mx-1 rounded">
                  <span>Listing Commission: </span>
                  {productdetail.listingComm} {productdetail?.listingCommType === "fix" ? ("Rs.") : ("%")}
                </span>
              ) : null}
              {productdetail.fixedComm ? (
                <span className="border bg-light p-1 ps-2 px-2 mx-1 rounded">
                  <span>Fixed Commission: </span>
                  {productdetail.fixedComm} {productdetail?.fixedCommType === "fix" ? ("Rs.") : ("%")}
                </span>
              ) : null}
              {productdetail.shippingComm ? (
                <span className="border bg-light p-1 ps-2 px-2 mx-1 rounded">
                  <span>Shipping Fee: </span>
                  {productdetail.shippingComm} {productdetail?.shippingCommType === "fix" ? ("Rs.") : ("%")}
                </span>
              ) : null}
            </div> */}
          

          <Form>
            <Row>
              <Col xl="8">
                <Card className="mb-5">
                  <Card.Body>
                    <div className="mb-2">
                      <Form.Group controlId="fullName">
                        <Form.Label className="fw-bold text-dark">
                          Product Full Name <span className="text-danger"> *</span>
                        </Form.Label>
                        <Form.Control type="text" name="fullName" value={productdetail.fullName || ''} onChange={handleChange} />
                      </Form.Group>
                    </div>
                    <div className="row">
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="previewName">
                          <Form.Label className="fw-bold text-dark">
                            Product Preview Name <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control type="text" name="previewName" value={productdetail.previewName || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="brand_name">
                          <Form.Label className="fw-bold text-dark">
                            Brand Name <span className="text-danger"> *</span>
                          </Form.Label>
                          <Form.Control type="text" name="brand_name" value={productdetail.brand_name || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="description">
                        <Form.Label className="fw-bold text-dark">
                          Description <span className="text-danger"> *</span>
                        </Form.Label>
                        <ReactQuill modules={modules} theme="snow" value={productdetail.description || ''} onChange={handleDescriptionChange} />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="sellerNotes">
                        <Form.Label className="fw-bold text-dark">BA Notes</Form.Label>
                        <ReactQuill modules={modules} theme="snow" value={productdetail.sellerNotes || ''} onChange={handleSellerNoteChange} />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="returnPolicy">
                        <Form.Label className="fw-bold text-dark">
                          Return Policy <span className="text-danger"> *</span>
                        </Form.Label>
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
                        <Form.Label className="fw-bold text-dark">
                          Shipping Policy <span className="text-danger"> *</span>
                        </Form.Label>
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
                        <Form.Label className="fw-bold text-dark">
                          Cancellation Policy <span className="text-danger"> *</span>
                        </Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="Cancellation Policy"
                          value={productdetail.cancellationPolicy || ''}
                          onChange={handleCancellationPolicyChange}
                        />
                      </Form.Group>
                    </div>
                    <Accordion className="mb-3">
                      <Accordion.Item eventKey="1">
                        <Accordion.Header style={{ fontSize: '16px' }} className="text-dark fw-bold">
                          Category Selection{' '}
                        </Accordion.Header>
                        <Accordion.Body>
                          <HandleCategory productdetail={productdetail} setProductDetail={setProductDetail} />
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
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
                  </Card.Body>
                </Card>
              </Col>
              <Col xl="4">
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row mb-3">
                      <Form.Label className="fw-bold text-dark">Product Preview Image</Form.Label>
                      {productdetail.thumbnail && (
                        <div style={{ height: '75px', width: '75px' }} className="ms-3 border p-1">
                          <img src={productdetail.thumbnail} alt="thumbnail" className="h-100 w-auto" />
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="thumbnail">
                        <div>Upload new image (Size: 1000x1000 px | File: .jpg, .jpeg) </div>
                        <Form.Control type="file" accept="image/*" name="thumbnail" onChange={(e) => setThumbnail(e.target.files[0])} />
                      </Form.Group>
                    </div>
                    <Button
                      className="ms-2 btn btn-primary btn-sm w-100"
                      onClick={() => handleButtonClick(() => handleThumbnailChange(productdetail.thumbnail))}
                    >
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                    </Button>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row mb-3">
                      <Form.Label className="fw-bold text-dark">Product Images</Form.Label>
                      {productdetail.images?.map((image, i) => {
                        return (
                          <div key={i} className="col-auto">
                            <div style={{ height: '75px', width: '75px' }} className="border p-1">
                              <img src={image} alt="productImages" className="h-100 w-auto" />
                            </div>
                            <Button
                              className="border w-100 bg-white"
                              onClick={() => {
                                // deleteImages(i);
                                deleteImg(i, image);
                              }}
                            >
                              <CsLineIcons icon="bin" className="text-danger" size="17" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mb-3 w-100">
                      <Form.Group controlId="productImages">
                        <div>Upload new images (Size: 1000x1000 px | File: .jpg, .jpeg) </div>
                        <Form.Control type="file" accept="image/*" name="productImages" onChange={handleChange} multiple />
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <Form.Label className="fw-bold text-dark">Catalogue</Form.Label>
                    {productdetail.catalogue && (
                      <div className="row mb-3">
                        <div className="col-auto">
                          <Button variant="foreground-alternate" className="btn-icon btn-icon-only text-info w-100 border shadow" onClick={handleDownload}>
                            <CsLineIcons icon="file-data" className="text-info" size="44" />
                            View Catalogue
                          </Button>
                          <Button
                            className="border w-100 bg-white"
                            onClick={() => {
                              deleteCatalogue(productdetail.catalogue);
                            }}
                          >
                            <CsLineIcons icon="bin" className="text-danger" size="17" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div className="mb-3">
                      <Form.Group controlId="catalogue">
                        <div>Upload new catalogue (.pdf)</div>
                        <Form.Control type="file" accept=".doc,.docx,application/pdf" name="catalogue" onChange={(e) => setCatalogue(e.target.files[0])} />
                      </Form.Group>
                    </div>
                    <Button
                      className="ms-2 btn btn-primary btn-sm btn btn-primary w-100"
                      onClick={() => handleButtonClick(() => handleCatalogueChange(productdetail.catalogue))}
                    >
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                    </Button>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <Form.Label className="fw-bold text-dark small">Video</Form.Label>
                    {productdetail.video && (
                      <>
                        {/* eslint-disable jsx-a11y/media-has-caption  */}
                        <video className="sw-auto pb-2" width="100%" controls>
                          <source src={productdetail.video} type="video/mp4" />
                          <source src={productdetail.video} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      </>
                    )}
                    <div className="mb-3">
                      <Form.Group controlId="video">
                        <div>Upload new video (.mp4)</div>
                        <Form.Control type="file" accept="video/*" name="video" onChange={(e) => setVideo(e.target.files[0])} />
                      </Form.Group>
                    </div>
                    <Button
                      className="ms-2 btn btn-primary btn-sm btn btn-primary w-100"
                      onClick={() => handleButtonClick(() => handleVideoChange(productdetail.video))}
                    >
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                    </Button>
                  </Card.Body>
                </Card>
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
              <div className="mb-3 bg-white rounded p-2">
                <div>
                  <VarientPicker productVariant={productdetail.supervariant} setProductDetail={setProductDetail} />
                </div>
              </div>
            </Col>

            <Col xl="4" className="order-1 order-xl-2">
              <h2 className="small-title">Variant List</h2>
              <Card className="mb-5">
                <Card.Body>
                  {productdetail.supervariant?.map((supervariant, i) => {
                    return (
                      <div key={i}>
                        <p>{supervariant.variantName}</p>
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
