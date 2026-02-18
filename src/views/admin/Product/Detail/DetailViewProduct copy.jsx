import React, { useState, useEffect } from 'react';
import { useParams, NavLink, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useQuery, useMutation } from '@apollo/client';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import VarientPicker from './components/VarientPicker';

const DetailViewProduct = ({ history }) => {
  const title = 'Product Detail';
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

  // get product details
  const [productdetail, setProductDetail] = useState(null);
  // const [faqData, setFaqData] = useState([]);

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
        giftOffer
        id
        images
        policy
        previewName
        returnPolicy
        sellerNotes
        shippingPolicy
        thumbnail
        video
        youtubeLink
        variant {
          hsn
          minimunQty
          moq
          silent_features
          variantName
          allPincode
          active
          location {
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
      $returnPolicy: String
      $thumbnail: String
      $shippingPolicy: String
      $cancellationPolicy: String
      $description: String
      $giftOffer: String
      $sellerNotes: String
      $policy: String
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
        returnPolicy: $returnPolicy
        thumbnail: $thumbnail
        shippingPolicy: $shippingPolicy
        cancellationPolicy: $cancellationPolicy
        description: $description
        giftOffer: $giftOffer
        sellerNotes: $sellerNotes
        policy: $policy
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
        history.push('/admin/product/list');
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
  const handlePolicyChange = (policies) => {
    setProductDetail((prevFormData) => ({
      ...prevFormData,
      policy: policies,
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

  // HANDLE THUMBNAIL

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

  // HANDLE CATALOGUE

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

  // HANDLE CATEGORIES

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

  const { data: categoryData, error: error1 } = useQuery(GET_CATEGORY);

  if (error1) {
    console.log('GET_CATEGORY', error1);
  }

  const filteredCategories = categoryData?.getAllCategories.filter((category) => productdetail?.categories.includes(category.id));

  // handle variant

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
      {data?.getProduct && productdetail && (
        <>
          <Form>
            <Row>
              <Col xl="8">
                <Card className="mb-5">
                  <Card.Body>
                    <div className="mb-2">
                      <Form.Group controlId="fullName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control type="text" name="fullName" value={productdetail.fullName || ''} onChange={handleChange} />
                      </Form.Group>
                    </div>

                    <div className="row">
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="previewName">
                          <Form.Label>Preview Name</Form.Label>
                          <Form.Control type="text" name="previewName" value={productdetail.previewName || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                      <div className="mb-2 col-md-6">
                        <Form.Group controlId="brand_name">
                          <Form.Label>Brand Name</Form.Label>
                          <Form.Control type="text" name="brand_name" value={productdetail.brand_name || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="description">
                        <Form.Label className="fs-5">Description</Form.Label>
                        <ReactQuill modules={modules} theme="snow" value={productdetail.description || ''} onChange={handleDescriptionChange} />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="sellerNotes">
                        <Form.Label className="fs-5">Seller Notes</Form.Label>
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
                      <Form.Group controlId="policy">
                        <Form.Label className="fs-5">Policy</Form.Label>
                        <ReactQuill modules={modules} theme="snow" placeholder="Policy" value={productdetail.policy || ''} onChange={handlePolicyChange} />
                      </Form.Group>
                    </div>

                    <div className="mb-3">
                      <Form.Group controlId="returnPolicy">
                        <Form.Label className="fs-5">returnPolicy</Form.Label>
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
                        <Form.Label className="fs-5">shippingPolicy</Form.Label>
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
                        <Form.Label className="fs-5">cancellationPolicy</Form.Label>
                        <ReactQuill
                          modules={modules}
                          theme="snow"
                          placeholder="Cancellation Policy"
                          value={productdetail.cancellationPolicy || ''}
                          onChange={handleCancellationPolicyChange}
                        />
                      </Form.Group>
                    </div>
                    <div className="mb-3">
                      <Form.Label className="fs-5">FAQ</Form.Label>
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
                      <Button variant="primary" size="sm" onClick={handleAddFaq}>
                        Add FAQ
                      </Button>
                    </div>

                    <div className="mb-3">
                      <Form.Group controlId="categories">
                        <Form.Label className="fs-5">Categories</Form.Label>
                        <div className="row">
                          {filteredCategories &&
                            filteredCategories.map(
                              (cat, i) =>
                                !cat.parent && (
                                  <div key={i} className="col-auto ms-3">
                                    <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={() => {}}>
                                      <CsLineIcons icon="bin" className="text-primary" size="17" />
                                    </Button>
                                    <div style={{ height: '50px', width: '50px' }}>
                                      <img src={cat.image} alt="categoryImage" className="h-100 w-auto" />
                                    </div>
                                    <p> {cat.name} </p>
                                  </div>
                                )
                            )}
                        </div>
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xl="4">
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row mb-3">
                      {productdetail.thumbnail && (
                        <div style={{ height: '75px', width: '75px' }} className="ms-3">
                          <img src={productdetail.thumbnail} alt="thumbnail" className="h-100 w-auto" />
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="thumbnail">
                        <Form.Label className="fs-5">Thumbnail</Form.Label>
                        <Form.Control type="file" accept="image/*" name="thumbnail" onChange={(e) => setThumbnail(e.target.files[0])} />
                      </Form.Group>
                    </div>
                    <Button
                      variant="foreground-alternate"
                      className="btn-icon btn-icon-only shadow"
                      onClick={() => {
                        handleThumbnailChange(productdetail.thumbnail);
                      }}
                    >
                      <CsLineIcons icon="save" className="text-primary" size="17" />
                    </Button>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row mb-3">
                      {productdetail.images?.map((image, i) => {
                        return (
                          <div key={i} className="col-auto">
                            <Button
                              variant="foreground-alternate"
                              className="btn-icon btn-icon-only shadow"
                              onClick={() => {
                                // deleteImages(i);
                                deleteImg(i, image);
                              }}
                            >
                              <CsLineIcons icon="bin" className="text-primary" size="17" />
                            </Button>
                            <div style={{ height: '75px', width: '75px' }} className="ms-3">
                              <img src={image} alt="productImages" className="h-100 w-auto" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mb-3">
                      <Form.Group controlId="productImages">
                        <Form.Label className="fs-5">productImages</Form.Label>
                        <Form.Control type="file" accept="image/*" name="productImages" onChange={handleChange} multiple />
                      </Form.Group>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    {productdetail.catalogue && (
                      <div className="row mb-3">
                        <div className="col-auto">
                          <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={handleDownload}>
                            <CsLineIcons icon="download" className="text-primary" size="17" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <Form.Group controlId="catalogue">
                        <Form.Label className="fs-5">Catalogue</Form.Label>
                        <Form.Control type="file" name="catalogue" onChange={(e) => setCatalogue(e.target.files[0])} />
                      </Form.Group>
                    </div>
                    <Button
                      variant="foreground-alternate"
                      className="btn-icon btn-icon-only shadow"
                      onClick={() => {
                        handleCatalogueChange(productdetail.catalogue);
                      }}
                    >
                      <CsLineIcons icon="save" className="text-primary" size="17" />
                    </Button>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    {productdetail.video && (
                      <div className="row mb-3">
                        <div className="col-auto">
                          <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={handleVideoDownload}>
                            <CsLineIcons icon="download" className="text-primary" size="17" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <Form.Group controlId="video">
                        <Form.Label className="fs-5">Video</Form.Label>
                        <Form.Control type="file" name="video" onChange={(e) => setVideo(e.target.files[0])} />
                      </Form.Group>
                    </div>
                    <Button
                      variant="foreground-alternate"
                      className="btn-icon btn-icon-only shadow"
                      onClick={() => {
                        handleVideoChange(productdetail.video);
                      }}
                    >
                      <CsLineIcons icon="save" className="text-primary" size="17" />
                    </Button>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="row">
                      <div className="mb-3">
                        <Form.Group controlId="sku">
                          <Form.Label className="fs-5">SKU</Form.Label>
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
                          <Form.Label className="fs-5">Gift Offer</Form.Label>
                          <Form.Control type="text" name="giftOffer" value={productdetail.giftOffer || ''} onChange={handleChange} />
                        </Form.Group>
                      </div>
                      <div className="mb-3">
                        <Form.Group controlId="youtubeLink">
                          <Form.Label className="fs-5">Youtube Link</Form.Label>
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
              <h2 className="small-title">Variant List</h2>
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
