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

const DetailViewProduct = ({ history }) => {
  const title = 'Product Enquiry Detail';
  const description = 'Product Enquiry Detail';
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

  // get product details
  const [productdetail, setProductDetail] = useState(null);
  // const [faqData, setFaqData] = useState([]);

  const GET_PRODUCT = gql`
    query GetProduct($name: String!) {
      getProduct(name: $name) {
        brand_name        
        catalogue
        categories
        description
        sku
        faq {
          answer
          question
        }
        fullName
        giftOffer
        id
        images
        previewName
        sellerNotes       
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
          moq
          silent_features         
          active
          allPincode
          location {
            id            
            extraCharge           
            finalPrice
            gstRate
            pincode
            price
            transportCharge
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

  // update the details
  const UPDATE_PRODUCT = gql`
    mutation UpdateProduct(
      $updateProductId: ID
      $productImages: [Upload]
      $brandName: String
      $previewName: String
      $fullName: String
      $thumbnail: String     
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
        thumbnail: $thumbnail            
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

  const submit = async () => {
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

  // HANDLE IMAGES
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
  // handle variant

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container m-0">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/product/list">
              <span className="align-middle text-dark ms-1 px-2">Back</span>
            </NavLink>
            <span className="small p-2"> / </span>
            <span className="align-middle text-dark ms-1">Individual Product List</span>
          </Col>
          {/* Title End */}
        </Row>
      </div >
      <h1 className="mb-0 fw-bold text-center text-dark pb-3" id="title">
        {title}
      </h1>
      {
        data?.getProduct && productdetail && (
          <>
            <Form>
              <Row>
                <Col xl="12">
                  <Card className="mb-2">
                    <Card.Body>
                      <div className="mb-2">
                        <Form.Group controlId="fullName">
                          <Form.Label className="fw-bold text-dark">Product Full Name <span className='text-danger'> *</span></Form.Label>
                          <Form.Control type="text" name="fullName" value={productdetail.fullName || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                      <div className="row">
                        <div className="mb-2 col-md-6">
                          <Form.Group controlId="previewName">
                            <Form.Label className="fw-bold text-dark">Product Preview Name <span className='text-danger'> *</span></Form.Label>
                            <Form.Control type="text" name="previewName" value={productdetail.previewName || ''} onChange={handleChange} />
                          </Form.Group>
                        </div>
                        <div className="mb-2 col-md-6">
                          <Form.Group controlId="brand_name">
                            <Form.Label className="fw-bold text-dark">Brand Name <span className='text-danger'> *</span></Form.Label>
                            <Form.Control type="text" name="brand_name" value={productdetail.brand_name || ''} onChange={handleChange} />
                          </Form.Group>
                        </div>
                      </div>
                      <div className="mb-3">
                        <Form.Group controlId="description">
                          <Form.Label className="fw-bold text-dark">Description <span className='text-danger'> *</span></Form.Label>
                          <ReactQuill
                            modules={modules}
                            theme="snow"
                            value={productdetail.description || ''}
                            onChange={handleDescriptionChange}
                          />
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
                      <Accordion className="mb-3">
                        <Accordion.Item eventKey="1">
                          <Accordion.Header style={{ fontSize: '16px' }} className='text-dark fw-bold'>Category Selection </Accordion.Header>
                          <Accordion.Body>
                            <HandleCategory productdetail={productdetail} setProductDetail={setProductDetail} />
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>

                      <div className="mb-3 p-2 border rounded">
                        <Form.Label className="fs-6 ps-3">FAQ</Form.Label>
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
                  <div className="row m-0">
                    <Card className="mb-3 col-md-6">
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
                    <Card className="mb-3 col-md-6">
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
                  </div>
                  <div className="row m-0">
                    <Card className="mb-3 col-md-6">
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
                    <Card className="mb-3 col-md-6">
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
                  </div>
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
              <Col xl="12" className="order-2 order-xl-1">
                <Card className="mb-3">
                  <Card.Body>
                    <VarientPicker productVariant={productdetail.variant} setProductDetail={setProductDetail} />
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Button onClick={submit} type="button" className="float-end">
            Submit
            </Button>
            {/* <Button onClick={print} type="button">
            Print
          </Button> */}
          </>
        )
      }
    </>
  );
};

export default withRouter(DetailViewProduct);
