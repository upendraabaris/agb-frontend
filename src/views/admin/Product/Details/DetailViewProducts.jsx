/* eslint-disable react/button-has-type */
/* eslint-disable no-undef */
/* eslint-disable no-shadow */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, NavLink, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';

import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useQuery, useMutation } from '@apollo/client';
import { Accordion, Row, Col, Button, Form, Card, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import HandleCategory from './components/HandleCategory';

const DetailViewProduct = ({ history }) => {
  const title = 'Multiple Seller Product Details';
  const description = 'Ecommerce Series Product Detail Page';
  const { seriesId } = useParams();
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

  const GET_SERIES_PRODUCT = gql`
    query GetSeriesProduct($getSeriesProductId: ID) {
      getSeriesProduct(id: $getSeriesProductId) {
        fullName
        table
        brand_name
        description
        giftOffer
        id
        previewName
        returnPolicy
        cancellationPolicy
        sellerNotes
        shippingPolicy
        thumbnail
        active
        video
        youtubeLink
        sku
        images
        faq {
          answer
          question
        }
        catalogue
        categories
        listingCommType
        listingComm
        productCommType
        productComm
        shippingCommType
        shippingComm
        fixedCommType
        fixedComm
      }
    }
  `;

  const DELETE_IMAGE = gql`
    mutation Deleteseriesimages($deleteseriesimagesId: ID, $url: String) {
      deleteseriesimages(id: $deleteseriesimagesId, url: $url) {
        message
        success
      }
    }
  `;

  const UPLOAD_THUMBNAIL = gql`
    mutation UploadSeriesThumbnail($uploadSeriesThumbnailId: ID, $file: Upload, $filestring: String) {
      uploadSeriesThumbnail(id: $uploadSeriesThumbnailId, file: $file, filestring: $filestring) {
        message
        success
      }
    }
  `;

  const UPLOAD_CATALOGUE = gql`
    mutation UploadSeriesCatalogue($uploadSeriesCatalogueId: ID, $filestring: String, $file: Upload) {
      uploadSeriesCatalogue(id: $uploadSeriesCatalogueId, filestring: $filestring, file: $file) {
        message
      }
    }
  `;
  const UPLOAD_VIDEO = gql`
    mutation UploadSeriesVideo($uploadSeriesVideoId: ID, $filestring: String, $file: Upload) {
      uploadSeriesVideo(id: $uploadSeriesVideoId, filestring: $filestring, file: $file) {
        message
      }
    }
  `;

  const [GetSeriesProduct, { data, refetch }] = useLazyQuery(GET_SERIES_PRODUCT, {
    variables: {
      getSeriesProductId: seriesId,
    }, 
    onError: (error) => {
      console.error('GET_SERIES_PRODUCT', error);
    },
  });

  useEffect(() => {
    if (data && data.getSeriesProduct) {
      setProductDetail({
        ...data.getSeriesProduct,
        faq: data.getSeriesProduct.faq?.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
      });
    }
  }, [data]);

  useEffect(() => {
    if (seriesId) {
      GetSeriesProduct();
    }
    // eslint-disable-next-line
  }, [seriesId]);

  // update the details
  const UPDATE_SERIES_PRODUCT = gql`
  mutation UpdateSeriesProduct(
    $updateSeriesProductId: ID
    $previewName: String
    $fullName: String
    $table: Boolean
    $brandName: String
    $faq: [SeriesFaqInput]
    $active: Boolean
    $returnPolicy: String
    $shippingPolicy: String
    $cancellationPolicy: String
    $description: String
    $giftOffer: String
    $sellerNotes: String
    $youtubeLink: String
    $categories: [String]
    $productImages: [Upload]

    # Commission fields
    $listingCommType: String
    $listingComm: Float
    $productCommType: String
    $productComm: Float
    $shippingCommType: String
    $shippingComm: Float
    $fixedCommType: String
    $fixedComm: Float
  ) {
    updateSeriesProduct(
      id: $updateSeriesProductId
      previewName: $previewName
      fullName: $fullName
      table: $table
      brand_name: $brandName
      faq: $faq
      returnPolicy: $returnPolicy
      active: $active
      shippingPolicy: $shippingPolicy
      cancellationPolicy: $cancellationPolicy
      description: $description
      giftOffer: $giftOffer
      sellerNotes: $sellerNotes
      youtubeLink: $youtubeLink
      categories: $categories
      productImages: $productImages

      # Commission fields
      listingCommType: $listingCommType
      listingComm: $listingComm
      productCommType: $productCommType
      productComm: $productComm
      shippingCommType: $shippingCommType
      shippingComm: $shippingComm
      fixedCommType: $fixedCommType
      fixedComm: $fixedComm
    ) {
      id
    }
  }
`;

  const [UpdateSeriesProduct] = useMutation(UPDATE_SERIES_PRODUCT, {
    onCompleted: () => {
      toast.success('Product Updated Successfully!');
      setTimeout(() => {
        history.push('/admin/product/multiplesellerlist');
      }, 3000);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!'); 
    },
  });

  const [errors, setErrors] = useState({});

  const fieldRefs = {
    fullName: useRef(null),
    brandName: useRef(null),
    previewName: useRef(null),
    productImages: useRef(null),
    description: useRef(null),
    categories: useRef(null),
    listingCommType: useRef(null),
    listingComm: useRef(null),
    productCommType: useRef(null),
    productComm: useRef(null),
    shippingCommType: useRef(null),
    shippingComm: useRef(null),
    fixedCommType: useRef(null),
    fixedComm: useRef(null),
  };

  const parseOrZero = (value) => (value === '' || value == null ? 0 : Number(value));

  const handleChange = async (event) => {
    const { name, files, value } = event.target;
    const numberFields = ['listingComm', 'productComm', 'shippingComm', 'fixedComm'];

    if (name === 'productImages' || name === 'thumbnail') {
      if (!files || files.length === 0) return;

      if (name === 'productImages') {
        const fileArray = Array.from(files);
        const validFiles = await Promise.all(
          fileArray.map(
            (file) =>
              new Promise((resolve) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                  if (img.width === img.height) resolve(file);
                  else {
                    alert(`Image is not square. Please upload square images only.`);
                    resolve(null);
                  }
                };
              })
          )
        );

        const filteredFiles = validFiles.filter(Boolean);
        setProductDetail((prev) => ({
          ...prev,
          [name]: filteredFiles.length > 0 ? filteredFiles : [],
        }));
        if (filteredFiles.length === 0) event.target.value = null;
      } else if (name === 'thumbnail') {
        const file = files[0];
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          setProductDetail((prev) => ({
            ...prev,
            [name]: img.width === img.height ? file : null,
          }));
          if (img.width !== img.height) {
            alert("Image is not square. Please upload square images only.");
            event.target.value = null;
          }
        };
      }
    }
    else if (numberFields.includes(name)) {
      setProductDetail((prev) => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }));
    }
    else {
      setProductDetail((prev) => ({
        ...prev,
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

  const [selectedPolicy, setSelectedPolicy] = useState("cancellation"); // default

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
  useEffect(() => {
    // Function to fetch data from your database
    const fetchData = async () => {
      try {
        const response = await fetch(GetSeriesProduct.table); // Replace with your API endpoint
        const data = await response.json();
        setProductDetail(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [GetSeriesProduct.table]);

  const handleTableChange = (e) => {
    // eslint-disable-next-line prefer-destructuring
    const checked = e.target.checked; // Get the boolean value directly from checked property
    setProductDetail((prevProductDetail) => ({
      ...prevProductDetail,
      table: checked,
    }));
  };
  const printData = () => {
    console.log(productDetail.table);
  };

  const [formErrors, setFormErrors] = useState({});
  const submit = async () => {
    await UpdateSeriesProduct({
      variables: {
        updateSeriesProductId: productdetail.id,
        brandName: productdetail.brand_name,
        ...productdetail,
        listingComm: parseOrZero(productdetail.listingComm),
        productComm: parseOrZero(productdetail.productComm),
        shippingComm: parseOrZero(productdetail.shippingComm),
        fixedComm: parseOrZero(productdetail.fixedComm),
      },
    });
    refetch();
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

  const [Deleteseriesimages] = useMutation(DELETE_IMAGE, {
    onCompleted: (res) => {
      toast.success(res.deleteseriesimages.message || 'img Delete successfull!');
      refetch();
    },
    onError: (err) => {
      console.log('DELETE_IMAGE', err);
    },
  });

  const deleteImg = async (index, url1) => {
    const newImages = [...productdetail.images];

    await Deleteseriesimages({
      variables: {
        deleteseriesimagesId: productdetail.id,
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
  const [isLoading, setIsLoading] = useState(false);
  const [UploadSeriesThumbnail, { loading: loadingThumbnail }] = useMutation(UPLOAD_THUMBNAIL, {
    onCompleted: (res) => {
      toast.success(res.uploadSeriesThumbnail.message || 'Thumbnail Uploaded successfull!');
      setThumbnail(null);
      refetch();
    },
    onError: (err) => {
      console.log('UPLOAD_THUMBNAIL', err);
    },
  });

  const handleThumbnailChange = async (url1) => {
    if (!thumbnail) return;

    // Validate if the thumbnail is square
    const img = new Image();
    img.src = URL.createObjectURL(thumbnail);

    img.onload = async () => {
      if (img.width !== img.height) {
        alert("Image is not square. Please upload square images only.");
        return;
      }

      try {
        if (url1) {
          // If url1 is provided along with thumbnail
          await UploadSeriesThumbnail({
            variables: {
              uploadSeriesThumbnailId: productdetail.id,
              filestring: url1,
              file: thumbnail,
            },
          });
        } else {
          // Only thumbnail file
          await UploadSeriesThumbnail({
            variables: {
              uploadSeriesThumbnailId: productdetail.id,
              file: thumbnail,
            },
          });
        }
        alert("Thumbnail uploaded successfully!");
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
        alert("Failed to upload thumbnail. Please try again.");
      }
    };
  };

  const handleThumbnailUpload = async () => {
    if (!productdetail.thumbnail) return;

    try {
      await UploadSeriesThumbnail({
        variables: {
          uploadSeriesThumbnailId: productdetail.id,
          file: productdetail.thumbnail,
        },
      });
      alert("Thumbnail uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to upload thumbnail.");
    }
  };

  // HANDLE CATALOGUE

  const [catalogue, setCatalogue] = useState(null);
  const [UploadSeriesCatalogue, { loading: loadingCatalogue }] = useMutation(UPLOAD_CATALOGUE, {
    onCompleted: (res) => {
      toast.success(res.uploadSeriesCatalogue.message || 'Catalogue Uploaded successfull!');
      setCatalogue(null);
      refetch();
    },
    onError: (err) => {
      console.log('UPLOAD_CATALOGUE', err);
    },
  });

  const fileInputRef = useRef(null);

  const handleCatalogueChange = async (url1) => {
    try {
      if (!catalogue) return;

      const variables = {
        uploadSeriesCatalogueId: productdetail.id,
        file: catalogue, // file from input
      };

      // if there is an existing catalogue url, include it
      if (url1) {
        variables.filestring = url1;
      }

      await UploadSeriesCatalogue({ variables });
    } catch (err) {
      console.error("Catalogue upload failed:", err);
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
  const [UploadSeriesVideo, { loading }] = useMutation(UPLOAD_VIDEO, {
    onCompleted: (res) => {
      toast.success(res.uploadSeriesVideo.message || 'Video Uploaded successfull!');
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
      await UploadSeriesVideo({
        variables: {
          uploadSeriesVideoId: productdetail.id,
          filestring: url1,
          file: video,
        },
      });
    }
    if (!url1 && video) {
      await UploadSeriesVideo({
        variables: {
          uploadSeriesVideoId: productdetail.id,
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
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/product/multiplesellerlist">
              <span className="align-middle text-dark ms-1 px-2">Back</span>
            </NavLink>
            <span className="small p-2"> / </span>
            <span className="align-middle text-dark ms-1">Multiple Seller Product List</span>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <h1 className="mb-0 fw-bold text-center text-dark pb-3" id="title">
        {title}
      </h1>
      {data?.getSeriesProduct && productdetail && (
        <>
          <Form>
            <Card className="border rounded mb-2">
              <div className="mark">
                <div className=" fw-bold ps-4 p-1 fs-6">Basic Details</div>{' '}
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
                      <Form.Control
                        type="text"
                        name="fullName"
                        maxLength={200}
                        value={productdetail.fullName || ''}
                        onChange={handleChange}
                      />
                      {formErrors.fullName && (
                        <div className="mt-1 text-danger">{formErrors.fullName}</div>
                      )}
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
                      <Form.Control
                        type="text"
                        name="brand_name"
                        value={productdetail.brand_name || ''}
                        onChange={handleChange}
                      />
                      {formErrors.brand_name && (
                        <div className="mt-1 text-danger">{formErrors.brand_name}</div>
                      )}
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
                      <Form.Control
                        type="text"
                        name="previewName"
                        maxLength={35}
                        value={productdetail.previewName || ''}
                        onChange={handleChange}
                      />
                      {formErrors.previewName && (
                        <div className="mt-1 text-danger">{formErrors.previewName}</div>
                      )}
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
                      <Form.Control
                        name="searchName"
                        value={productdetail.searchName || ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-4 mb-3">
                  {/* Product Images */}
                  <Col md={6}>
                    <div className="row mb-3">
                      <Form.Label className="fw-bold text-dark">Product Images</Form.Label>
                      {productdetail.images?.map((image, i) => {
                        return (
                          <div key={i} className="col-auto m-0 ms-2 p-0">
                            <div
                              style={{ height: '75px', width: '75px' }}
                              className="border p-1"
                            >
                              <img
                                src={image}
                                alt="productImages"
                                className="h-100 w-auto"
                              />
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
                      <div className="mb-3 w-100">
                        <Form.Group controlId="productImages">
                          <Form.Control
                            type="file"
                            accept="image/*"
                            name="productImages"
                            onChange={handleChange}
                            multiple
                          />
                          <div>Upload new images (Size: 1000x1000 px | File: .jpg, .jpeg) </div>
                        </Form.Group>
                      </div>
                    </div>
                  </Col>

                  {/* Product Preview Image */}
                  <Col md={6}>
                    <Form.Label className="fw-bold text-dark mb-2">Product Preview Image</Form.Label>

                    {productdetail.thumbnail && (
                      <div
                        style={{ height: '75px', width: '75px' }}
                        className="ms-3 border p-1 mb-2"
                      >
                        <img
                          src={productdetail.thumbnail}
                          alt="thumbnail"
                          className="h-100 w-auto"
                        />
                      </div>
                    )}

                    <Form.Group controlId="thumbnail" className="mb-1">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        name="thumbnail"
                        onChange={handleChange} // <-- Use updated handleChange
                      />
                    </Form.Group>

                    <div className="mb-2">
                      Upload new image (Size: 1000x1000 px | File: .jpg, .jpeg)
                    </div>

                    <Button
                      className="ms-2 btn btn-primary btn-sm w-5"
                      onClick={handleThumbnailUpload} // directly call the upload function
                      disabled={isLoading}
                    >
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                    </Button>

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
                    <ReactQuill
                      modules={modules}
                      theme="snow"
                      value={productdetail.description || ''}
                      onChange={handleDescriptionChange}
                    />
                    {formErrors.description && (
                      <div className="mt-1 text-danger">{formErrors.description}</div>
                    )}
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
                    checked={selectedPolicy === "cancellation"}
                    onChange={() => setSelectedPolicy("cancellation")}
                    className="fw-bold text-dark mb-2"
                  />
                  {selectedPolicy === "cancellation" && (
                    <div className="mb-3">
                      <ReactQuill
                        modules={modules}
                        theme="snow"
                        placeholder="Cancellation Policy"
                        value={productdetail?.cancellationPolicy || ""}
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
                    checked={selectedPolicy === "shipping"}
                    onChange={() => setSelectedPolicy("shipping")}
                    className="fw-bold text-dark mb-2"
                  />
                  {selectedPolicy === "shipping" && (
                    <div className="mb-3">
                      <ReactQuill
                        modules={modules}
                        theme="snow"
                        placeholder="Shipping Policy"
                        value={productdetail?.shippingPolicy || ""}
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
                    checked={selectedPolicy === "return"}
                    onChange={() => setSelectedPolicy("return")}
                    className="fw-bold text-dark mb-2"
                  />
                  {selectedPolicy === "return" && (
                    <div className="mb-3">
                      <ReactQuill
                        modules={modules}
                        theme="snow"
                        placeholder="Return Policy"
                        value={productdetail?.returnPolicy || ""}
                        onChange={handleReturnPolicyChange}
                      />
                    </div>
                  )}
                </Form>
              </div>
            </Card>

            <Card className="mb-3 border rounded">
              <div className="mark mb-3">
                <div className="fw-bold ps-4 p-1 fs-6">Commission / Fee Details</div>
              </div>
              <div className="row px-3">

                {/* Product Commission Type (Read-only: Percentage) */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="productCommType">
                    <Form.Label className="fw-bold text-dark">
                      Sale Commission Fee Type <span className="text-danger"> * </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Choose commission type as Fix or Percentage.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block me-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Select
                      name="productCommType"
                      value="percentage"
                      disabled
                    >
                      <option value="fix">Fix</option>
                      <option value="percentage">Percentage (%)</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Product Commission */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="productComm">
                    <Form.Label className="fw-bold text-dark">
                      Sale Commission Fee <span className="text-danger"> * </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Percentage or amount earned by the platform per product sold.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block me-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="productComm"
                      ref={fieldRefs.productComm}
                      value={productdetail.productComm !== '' ? productdetail.productComm : ''}
                      onChange={handleChange}
                      placeholder="Sale Commission Fee"
                    />
                    {errors.productComm && (
                      <div className="text-danger mt-1">{errors.productComm}</div>
                    )}
                  </Form.Group>
                </div>

                {/* Listing Commission Type (Read-only: Fix) */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="listingCommType">
                    <Form.Label className="fw-bold text-dark">
                      Listing Fee Type <span className="text-danger"> * </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Choose commission type as Fix or Percentage.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block me-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Select
                      name="listingCommType"
                      value="fix"
                      disabled
                    >
                      <option value="fix">Fix (Rs.)</option>
                      <option value="percentage">Percentage (%)</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Listing Commission */}
                <div className="col-md-6 mb-2">
                  <Form.Group controlId="listingComm">
                    <Form.Label className="fw-bold text-dark">
                      Listing Fee <span className="text-danger"> * </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Fee charged for listing a product on a platform.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block me-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="listingComm"
                      ref={fieldRefs.listingComm}
                      value={productdetail.listingComm !== '' ? productdetail.listingComm : ''}
                      onChange={handleChange}
                      placeholder="Listing Fee"
                    />
                    {errors.listingComm && (
                      <div className="text-danger mt-1">{errors.listingComm}</div>
                    )}
                  </Form.Group>
                </div>

                {/* Fixed Commission Type (Read-only: Fix) */}
                <div className="col-md-6 mb-0 pb-3">
                  <Form.Group controlId="fixedCommType">
                    <Form.Label className="fw-bold text-dark">
                      Fixed Closing Fee Type <span className="text-danger"> * </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Choose commission type as Fix or Percentage.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block me-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Select
                      name="fixedCommType"
                      value="fix"
                      disabled
                    >
                      <option value="fix">Fix (Rs.)</option>
                      <option value="percentage">Percentage (%)</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Fixed Commission */}
                <div className="col-md-6 mb-0">
                  <Form.Group controlId="fixedComm">
                    <Form.Label className="fw-bold text-dark">
                      Fixed Closing Fee <span className="text-danger"> * </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Pre-set, unchanging fee charged per sale or transaction.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block me-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="fixedComm"
                      ref={fieldRefs.fixedComm}
                      value={productdetail.fixedComm !== '' ? productdetail.fixedComm : ''}
                      onChange={handleChange}
                      placeholder="Fixed Closing Fee"
                    />
                    {errors.fixedComm && (
                      <div className="text-danger mt-1">{errors.fixedComm}</div>
                    )}
                  </Form.Group>
                </div>

                {/* Shipping Fee Type (Read-only: Percentage) */}
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="shippingCommType">
                    <Form.Label className="fw-bold text-dark">
                      Shipping Fee Type <span className="text-danger"> * </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Choose fees type as Fix or Percentage.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block me-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Select
                      name="shippingCommType"
                      value="percentage"
                      disabled
                    >
                      <option value="fix">Fix (Rs.)</option>
                      <option value="percentage">Percentage (%)</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                {/* Shipping Commission */}
                <div className="col-md-6 mb-3">
                  <Form.Group controlId="shippingComm">
                    <Form.Label className="fw-bold text-dark">
                      Shipping Fee <span className="text-danger"> * </span>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-top" className="custom-tooltip">
                            Cost charged to deliver the product to the buyer.
                          </Tooltip>
                        }
                      >
                        <div className="d-inline-block me-2">
                          <CsLineIcons icon="info-hexagon" size="17" />
                        </div>
                      </OverlayTrigger>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      step="0.01"
                      min={0}
                      name="shippingComm"
                      ref={fieldRefs.shippingComm}
                      value={productdetail.shippingComm !== '' ? productdetail.shippingComm : ''}
                      onChange={handleChange}
                      placeholder="Shipping Fee"
                    />
                    {errors.shippingComm && (
                      <div className="text-danger mt-1">{errors.shippingComm}</div>
                    )}
                  </Form.Group>
                </div>
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
                          <Button
                            variant="foreground-alternate"
                            className="btn-icon btn-icon-only text-info w-100 border shadow"
                            onClick={handleDownload}
                          >
                            <CsLineIcons icon="file-data" className="text-info" size="44" />
                            View Catalogue
                          </Button>
                          {/* <Button
                                              className="border w-100 bg-white"
                                              onClick={() => deleteCatalogue(productdetail.catalogue)}
                                            >
                                              <CsLineIcons icon="bin" className="text-danger" size="17" />
                                            </Button> */}
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
                      {productdetail.catalogue ? (
                        <div>Edit catalogue (.pdf)</div>
                      ) : (
                        <div>Upload new catalogue (.pdf)</div>
                      )}
                    </Form.Group>

                    <Button
                      className="ms-2 btn btn-primary btn-sm w-5"
                      onClick={() => handleCatalogueChange(productdetail.catalogue)}
                    >
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                    </Button>
                  </div>

                  <div className="mb-3">
                    <Form.Group controlId="youtubeLink">
                      <Form.Label className="fw-bold text-dark">Youtube Link</Form.Label>
                      <Form.Control
                        type="text"
                        name="youtubeLink"
                        value={productdetail.youtubeLink || ''}
                        onChange={handleChange}
                      />
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
                      <Form.Control
                        type="file"
                        accept="video/*"
                        name="video"
                        onChange={(e) => setVideo(e.target.files[0])}
                      />
                      <div>Upload new video (.mp4)</div>
                    </Form.Group>

                    <Button
                      className="ms-2 btn btn-primary btn-sm w-5"
                      onClick={() => handleVideoChange(productdetail.video)}
                    >
                      {isLoading ? <Spinner animation="border" size="sm" /> : 'Save'}
                    </Button>

                  </div>

                  {/* SKU */}
                  <div className="mb-3">
                    <Form.Group controlId="sku">
                      <Form.Label className="fw-bold text-dark">SKU</Form.Label>
                      <Form.Control
                        type="text"
                        name="sku"
                        value={productdetail.sku || ''}
                        disabled
                      />
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
          <Button onClick={submit} type="button">
            Submit
          </Button>
          {/* <Button className="ms-3" onClick={print} type="button">
            Print
          </Button> */}
        </>
      )}
    </>
  );
};

export default withRouter(DetailViewProduct);
