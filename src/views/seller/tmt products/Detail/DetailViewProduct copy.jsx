import React, { useRef, useState, useEffect } from 'react';
import { useParams, NavLink, withRouter } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery, useQuery, useMutation } from '@apollo/client';
import { Row, Col, Button, Form, Card, Spinner, Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import TableRow from './components/TableRow';
import VarientPicker from './components/VarientPicker';

const DetailViewProduct = ({ history }) => {
  const title = 'Edit Series Product';
  const description = 'Edit series Product';
  const { tmtproductId } = useParams();
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
  const GET_TMT_PRODUCT = gql`
    query GetTMTSeriesProduct($getTmtSeriesProductId: ID) {
      getTMTSeriesProduct(id: $getTmtSeriesProductId) {
        id
        fullName
        previewName
        brand_name
        giftOffer
        youtubeLink
        images
        thumbnail
        video
        catalogue
        sku
        description
        brandCompareCategory
        sellerNotes
        active
        returnPolicy
        shippingPolicy
        cancellationPolicy
        faq {
          answer
          question
        }
        tmtseriesvariant {
          id
          allPincode
          variantName
          hsn
          silent_features
          moq
          tmtserieslocation {
            id
            pincode
            unitType
            priceType
            price
            gstType
            gstRate
            extraChargeType
            extraCharge
            transportChargeType
            transportCharge
            finalPrice
            b2cdiscount
            b2bdiscount
            sectionDiff
            mainStock
            displayStock
          }
        }
      }
    }
  `;

  const DELETE_IMAGE = gql`
    mutation DeleteTmtSeriesimages($deleteTmtSeriesimagesId: ID, $url: String) {
      deleteTmtSeriesimages(id: $deleteTmtSeriesimagesId, url: $url) {
        message
        success
      }
    }
  `;

  const UPLOAD_TMT_THUMBNAIL = gql`
    mutation UploadTmtSeriesThumbnail($uploadTmtSeriesThumbnailId: ID, $filestring: String, $file: Upload) {
      uploadTmtSeriesThumbnail(id: $uploadTmtSeriesThumbnailId, filestring: $filestring, file: $file) {
        message
        success
      }
    }
  `;

  const UPLOAD_TMT_CATALOGUE = gql`
    mutation UploadTmtSeriesCatalogue($uploadTmtSeriesCatalogueId: ID, $filestring: String, $file: Upload) {
      uploadTmtSeriesCatalogue(id: $uploadTmtSeriesCatalogueId, filestring: $filestring, file: $file) {
        message
        success
      }
    }
  `;
  const UPLOAD_TMT_VIDEO = gql`
    mutation UploadTmtSeriesVideo($uploadTmtSeriesVideoId: ID, $filestring: String, $file: Upload) {
      uploadTmtSeriesVideo(id: $uploadTmtSeriesVideoId, filestring: $filestring, file: $file) {
        success
        message
      }
    }
  `;

  const UPDATE_TMT_PRODUCT = gql`
    mutation UpdateTMTSereiesProduct(
      $updateTmtSereiesProductId: ID
      $productImages: [Upload]
      $faq: [TMTSeriesFaqInput]
      $brandName: String
      $previewName: String
      $fullName: String
      $returnPolicy: String
      $shippingPolicy: String
      $cancellationPolicy: String
      $brandCompareCategory: String
      $description: String
      $giftOffer: String
      $sellerNotes: String
      $youtubeLink: String
      $categories: [String]
      $active: Boolean
      $tmtseriesvariant: [TMTSeriesVariantInput]
    ) {
      updateTMTSereiesProduct(
        id: $updateTmtSereiesProductId
        productImages: $productImages
        faq: $faq
        brand_name: $brandName
        previewName: $previewName
        fullName: $fullName
        returnPolicy: $returnPolicy
        shippingPolicy: $shippingPolicy
        cancellationPolicy: $cancellationPolicy
        brandCompareCategory: $brandCompareCategory
        description: $description
        giftOffer: $giftOffer
        sellerNotes: $sellerNotes
        youtubeLink: $youtubeLink
        categories: $categories
        active: $active
        tmtseriesvariant: $tmtseriesvariant
      ) {
        id
      }
    }
  `;

  const GET_ALL_TMT_MASTER = gql`
    query GetTmtMaster {
      getTmtMaster {
        brandCompareCategory
        id
        categories
        section
        fixedComm
        fixedCommType
        listingComm
        listingCommType
        productComm
        productCommType
        seriesType
        shippingComm
        shippingCommType
      }
    }
  `;

  const [productdetail, setProductDetail] = useState(null);
  const [allPincode, setAllPincode] = useState(false);

  const initialLocationState = {
    extraCharge: '',
    extraChargeType: '',
    finalPrice: '',
    displayStock: '',
    mainStock: '',
    gstRate: '',
    gstType: false,
    pincode: [],
    priceType: '',
    transportCharge: '',
    transportChargeType: '',
    unitType: 'Kg',
  };

  const [formData, setFormData] = useState({
    fullName: '',
    previewName: '',
    brandName: '',
    description: '',
    returnPolicy: '',
    shippingPolicy: '',
    cancellationPolicy: '',
    brandCompareCategory: '',
    sellerNotes: '',
    // Add other fields you’re using in your form here
  });

  const [locationValue, setLocationValue] = useState(initialLocationState);
  const [locationID, setLocationID] = useState([]);

  const { error, data, refetch } = useQuery(GET_TMT_PRODUCT, {
    variables: {
      getTmtSeriesProductId: tmtproductId,
    },
  });

  // salient features

  const [silentFeatures, setSilentFeatures] = useState('');

  const handleSilentFeaturesChange = (silentdesc) => {
    setSilentFeatures(silentdesc);
  };

  useEffect(() => {
    if (data && data.getTMTSeriesProduct) {
      setProductDetail({
        ...data.getTMTSeriesProduct,
        faq: data.getTMTSeriesProduct.faq?.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        })),
        tmtseriesvariant: data.getTMTSeriesProduct.tmtseriesvariant?.map((tmtseriesvariant) => {
          const { __typename, ...variantWithoutTypename } = tmtseriesvariant;

          // eslint-disable-next-line no-shadow
          const locationWithoutTypename = variantWithoutTypename.tmtserieslocation?.map(({ __typename, ...rest }) => rest);

          return {
            ...variantWithoutTypename,
            tmtserieslocation: locationWithoutTypename,
          };
        }),
      });

      setLocationID({
        tmtseriesvariant: data.getTMTSeriesProduct.tmtseriesvariant?.map((tmtseriesvariant) => {
          const { id, ...variantWithoutTypename } = tmtseriesvariant;

          // eslint-disable-next-line no-shadow
          const locationWithoutTypename = variantWithoutTypename.tmtserieslocation?.map(({ id }) => id);

          return {
            tmtseriesvariantID: id,
            tmtserieslocationID: locationWithoutTypename[0],
          };
        }),
      });

      const { b2bdiscount, b2cdiscount, price, sectionDiff, __typename, ...restValues } = data.getTMTSeriesProduct.tmtseriesvariant[0].tmtserieslocation[0];

      setLocationValue({ ...restValues });

      setAllPincode(data.getTMTSeriesProduct.tmtseriesvariant[0].allPincode);
      setSilentFeatures(data.getTMTSeriesProduct.tmtseriesvariant[0].silent_features);
    }
  }, [data]);

  useEffect(() => {
    if (tmtproductId) {
      refetch();
    }
    // eslint-disable-next-line
  }, [tmtproductId]);

  // Utility function (move this above handleChange)
  const validateSquareImage = (file, callback) => {
    const img = new Image();
    img.onload = () => {
      callback(img.width === img.height);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleChange = (event) => {
    const { name, files, value } = event.target;

    if (name === 'productImages') {
      const validFiles = [];
      let checked = 0;

      Array.from(files).forEach((file) => {
        validateSquareImage(file, (isSquare) => {
          checked += 1; // ✅ replaced checked++

          if (isSquare) {
            validFiles.push(file);
          } else {
            alert(`This image is not a square image and will be skipped.`);
          }

          // When all files are checked, update state
          if (checked === files.length) {
            setProductDetail((prevFormData) => ({
              ...prevFormData,
              [name]: validFiles,
            }));
          }
        });
      });
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

  // HANDLE THUMBNAIL

  const [thumbnail, setThumbnail] = useState(null);
  const [UploadTmtSeriesThumbnail, { loading: loadingThumbnail }] = useMutation(UPLOAD_TMT_THUMBNAIL, {
    onCompleted: (res) => {
      toast.success(res.uploadTmtSeriesThumbnail.message || 'Thumbnail Uploaded successfull!');
      setThumbnail(null);
      refetch();
    },
    onError: (err) => {
      console.log('UPLOAD_TMT_THUMBNAIL', err);
    },
  });

  const handleThumbnailChange = async (url1) => {
    if (!thumbnail) {
      return;
    }

    if (url1 && thumbnail) {
      await UploadTmtSeriesThumbnail({
        variables: {
          uploadTmtSeriesThumbnailId: productdetail.id,
          filestring: url1,
          file: thumbnail,
        },
      });
    }
    if (!url1 && thumbnail) {
      await UploadTmtSeriesThumbnail({
        variables: {
          uploadTmtSeriesThumbnailId: productdetail.id,
          file: thumbnail,
        },
      });
    }
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
        deleteTmtSeriesimagesId: productdetail.id,
        url: url1,
      },
    });
    newImages.splice(index, 1);
    setProductDetail({
      ...productdetail,
      images: newImages,
    });
  };

  const handleDownload = () => {
    if (productdetail.catalogue) {
      const downloadLink = productdetail.catalogue;
      window.open(downloadLink, '_blank');
    }
  };

  // HANDLE CATALOGUE

  const [catalogue, setCatalogue] = useState(null);
  const [UploadTmtSeriesCatalogue, { loading: loadingCatalogue }] = useMutation(UPLOAD_TMT_CATALOGUE, {
    onCompleted: (res) => {
      toast.success(res.uploadTmtSeriesCatalogue.message || 'Catalogue Uploaded successfull!');
      setCatalogue(null);
      refetch();
    },
    onError: (err) => {
      console.log('UPLOAD_TMT_CATALOGUE', err);
    },
  });

  const handleCatalogueChange = async (url1) => {
    if (!catalogue) {
      return;
    }
    if (url1 && catalogue) {
      await UploadTmtSeriesCatalogue({
        variables: {
          uploadTmtSeriesCatalogueId: productdetail.id,
          filestring: url1,
          file: catalogue,
        },
      });
    }
    if (!url1 && catalogue) {
      await UploadTmtSeriesCatalogue({
        variables: {
          uploadTmtSeriesCatalogueId: productdetail.id,
          file: catalogue,
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

  // HANDLE VIDEO

  const [video, setVideo] = useState(null);
  const [UploadTmtSeriesVideo, { loading }] = useMutation(UPLOAD_TMT_VIDEO, {
    onCompleted: (res) => {
      toast.success(res.uploadTmtSeriesVideo.message || 'Video Uploaded successfull!');
      setVideo(null);
      refetch();
    },
    onError: (err) => {
      console.log('UPLOAD_TMT_VIDEO', err);
    },
  });

  const handleVideoChange = async (url1) => {
    if (!video) {
      return;
    }
    if (url1 && video) {
      await UploadTmtSeriesVideo({
        variables: {
          uploadTmtSeriesVideoId: productdetail.id,
          filestring: url1,
          file: video,
        },
      });
    }
    if (!url1 && video) {
      await UploadTmtSeriesVideo({
        variables: {
          uploadTmtSeriesVideoId: productdetail.id,
          file: video,
        },
      });
    }
  };

  const [UpdateProduct] = useMutation(UPDATE_TMT_PRODUCT, {
    onCompleted: () => {
      toast.success('Product Updated Successfully!');
      setTimeout(() => {
        history.push('/seller/tmt_product/list');
      }, 3000);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!');
    },
  });

  const [brandCompareVariant, setbrandCompareVariant] = useState(null);

  // HANDLE BRAND COMPARE
  const [GetTmtMaster, { data: masterData }] = useLazyQuery(GET_ALL_TMT_MASTER, {
    onCompleted: (res) => {
      const brndcmpvrnt = res.getTmtMaster?.find((item) => item.id === productdetail?.brandCompareCategory);

      const { brandCompareCategory, id, ...rest } = brndcmpvrnt;
      setbrandCompareVariant(rest);
    },
    onError: (err) => {
      console.log('GET_ALL_TMT_MASTER', err);
    },
  });

  useEffect(() => {
    GetTmtMaster();
  }, [GetTmtMaster, productdetail]);

  useEffect(() => {
    if (brandCompareVariant) {
      console.log('brandCompareVariant record:', brandCompareVariant);
    }
  }, [brandCompareVariant]);

  // handle price b2b and all

  const [tableValues, setTableValues] = useState([]);

  const handleTableRowChange = (index, field, value, variantName1) => {
    setTableValues((prevTableValues) => {
      const newTableValues = [...prevTableValues];
      let parsedValue;

      // Check if the field is one of the properties to be parsed as a float
      if (['price', 'sectionDiff'].includes(field)) {
        parsedValue = parseFloat(value);
      } else {
        // Parse other fields as integers
        parsedValue = parseInt(value, 10);
      }

      newTableValues[index] = {
        ...newTableValues[index],
        [field]: parsedValue,
        variantName: variantName1,
      };
      return newTableValues;
    });
  };

  // handle all pincode

  const handleAllPincode = (value) => {
    setAllPincode(value);
  };

  // handle location value

  const [formErrors, setFormErrors] = useState({});

  const descriptionRef = useRef(null);
  const fullNameRef = useRef(null);
  const previewNameRef = useRef(null);
  const brandNameRef = useRef(null);
  const productImagesRef = useRef(null);

  const submit = async () => {
    const errors = {};

    // Remove all HTML tags and whitespace from description
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
    if (!productdetail.images || productdetail.images.length === 0) {
      errors.productImages = 'Product image is required.';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (errors.description) {
        descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errors.fullName) {
        fullNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        fullNameRef.current?.focus?.();
      } else if (errors.previewName) {
        previewNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        previewNameRef.current?.focus?.();
      } else if (errors.brand_name) {
        brandNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        brandNameRef.current?.focus?.();
      } else if (errors.productImages) {
        productImagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        productImagesRef.current?.focus?.();
      }
      return; // ❌ Stop submit
    }

    const productdetail1 = { ...productdetail, ...brandCompareVariant };

    const productdetail1Copy = { ...productdetail1 }; // Create a copy to avoid modifying the original object

    if (tableValues.length) {
      const updatedTableValues = tableValues
        .filter((item) => item !== undefined)
        .map(({ variantName, ...res }) => {
          return {
            variantName,
            tmtserieslocation: [{ ...locationValue, ...res }],
          };
        });

      productdetail1Copy.tmtseriesvariant.forEach((variantObj) => {
        const matchingTableValue = updatedTableValues.find((tableValue) => tableValue.variantName === variantObj.variantName);

        variantObj.allPincode = allPincode; // Update allPincode value
        variantObj.silent_features = silentFeatures; // silentFeatures value

        if (matchingTableValue) {
          variantObj.tmtserieslocation[0] = {
            ...variantObj.tmtserieslocation[0],
            ...matchingTableValue.tmtserieslocation[0],
          };
        }
      });
    }
    if (!tableValues.length) {
      productdetail1Copy.tmtseriesvariant.forEach((variantObj) => {
        variantObj.allPincode = allPincode; // Update allPincode value
        variantObj.silent_features = silentFeatures; // silentFeatures value
        variantObj.tmtserieslocation[0] = {
          ...variantObj.tmtserieslocation[0],
          ...locationValue,
        };
      });
    }

    productdetail1Copy.tmtseriesvariant.forEach((variantObj) => {
      const matchingVariantID = locationID.tmtseriesvariant.find((idObj) => {
        return variantObj.id === idObj.tmtseriesvariantID;
      });

      if (matchingVariantID) {
        variantObj.tmtserieslocation[0].id = matchingVariantID.tmtserieslocationID;
      }
    });

    await UpdateProduct({
      variables: {
        updateTmtSereiesProductId: productdetail1Copy.id,
        brandName: productdetail1Copy.brand_name,
        ...productdetail1Copy,
      },
    });
  };

  const PRINT = () => {
    console.log('productdetail1Copy', productdetail);
  };

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
      <div className="page-title-container mb-1">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink
              className="muted-link pb-1 d-inline-block hidden breadcrumb-back"
              to={brandCompareVariant?.section ? '/seller/tmt_product/relationallist' : '/seller/tmt_product/list'}
            >
              <span className="text-dark ms-1">Back</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <h1 className="mb-1 p-2 text-center fw-bold bg-white rounded" id="title">
        {title}
      </h1>
      {data?.getTMTSeriesProduct && productdetail && (
        <>
          <Form>
            <Row>
              <Col xl="12">
                <Card className="mb-5">
                  <Card.Body>
                    <Card className="border mt-2 mb-4">
                      <div className="mark mb-3">
                        <div className="fw-bold ps-4 p-1 fs-6">Basic Details</div>
                      </div>
                      <div className="mb-2 col-md-12 px-3">
                        <Form.Group controlId="brandCompareCategory">
                          <Form.Label className="fw-bold text-dark">
                            Product Master Name<span className="text-danger">*</span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose Product Category, read only mode.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block ms-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          {masterData?.getTmtMaster?.length > 0 && (
                            <Form.Select name="brandCompareCategory" value={productdetail.brandCompareCategory || ''} onChange={handleChange} disabled>
                              <option hidden value="1">
                                Select Product Master Name
                              </option>

                              {masterData.getTmtMaster.map((item, i) => (
                                <option key={i} value={item.id}>
                                  {item.brandCompareCategory}
                                </option>
                              ))}
                            </Form.Select>
                          )}
                        </Form.Group>
                      </div>
                      <Row className="mb-3 ms-2 me-2">
                        <div className="col-md-6">
                          <Form.Group controlId="fullName">
                            <Form.Label className="fw-bold text-dark">
                              Product Full Name <span className="text-danger"> *</span>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Full name with clear type and key features. Maximum 100 characters.
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
                              value={productdetail.fullName || ''}
                              onChange={(e) => {
                                if (e.target.value.includes('_')) {
                                  e.target.value = e.target.value.replace('_', '');
                                }
                                if (e.target.value.includes('/')) {
                                  e.target.value = e.target.value.replace('/', '');
                                }
                                handleChange(e);
                              }}
                              maxLength={100}
                              isInvalid={!!formErrors?.fullName}
                              ref={fullNameRef} // or inputRef={fullNameRef}
                            />

                            {formErrors?.fullName && <Form.Control.Feedback type="invalid">{formErrors.fullName}</Form.Control.Feedback>}
                          </Form.Group>
                        </div>

                        <div className="col-md-6">
                          <Form.Group controlId="brand_name">
                            <Form.Label className="fw-bold text-dark">
                              Brand Name <span className="text-danger"> *</span>
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
                              isInvalid={!!formErrors?.brand_name}
                              ref={brandNameRef}
                            />
                            {formErrors?.brand_name && <Form.Control.Feedback type="invalid">{formErrors.brand_name}</Form.Control.Feedback>}
                          </Form.Group>
                        </div>
                      </Row>

                      <div className="row ms-2 me-2">
                        <div className="mb-2 col-md-6">
                          <Form.Group controlId="previewName">
                            <Form.Label className="fw-bold text-dark">
                              Product Preview Name <span className="text-danger"> *</span>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Short name shown to customers in listings. Maximum 100 characters.
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
                              value={productdetail.previewName || ''}
                              onChange={handleChange}
                              isInvalid={!!formErrors?.previewName}
                              ref={previewNameRef}
                            />
                            {formErrors?.previewName && <Form.Control.Feedback type="invalid">{formErrors.previewName}</Form.Control.Feedback>}
                          </Form.Group>
                        </div>
                      </div>

                      <div className="row ms-2 me-2">
                        {/* Thumbnail Section */}
                        <div className="mb-3 col-6">
                          <Form.Group controlId="thumbnail">
                            <div className="row mb-3 col-6">
                              {productdetail.thumbnail && (
                                <div style={{ height: '75px', width: '75px' }} className="ms-3">
                                  <img src={productdetail.thumbnail} alt="thumbnail" className="h-100 w-auto border rounded" />
                                </div>
                              )}
                            </div>
                            <Form.Label className="text-dark fw-bold">
                              Product Preview Image
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Main representative image of the product, cover photo in product cards, search results, and category pages.
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block ms-2">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>
                            {loadingThumbnail ? (
                              <div className="ms-2">
                                <Spinner />
                              </div>
                            ) : (
                              <Form.Control
                                type="file"
                                accept="image/*"
                                name="thumbnail"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;

                                  validateSquareImage(file, (isSquare) => {
                                    if (isSquare) {
                                      setThumbnail(file);
                                    } else {
                                      alert('Only square images are allowed for thumbnail.');
                                      e.target.value = null; // reset file input
                                    }
                                  });
                                }}
                              />
                            )}
                          </Form.Group>
                          <Button
                            variant="dark"
                            className="btn-icon mt-2 btn-icon-only shadow w-20 d-flex align-items-center justify-content-center"
                            onClick={() => {
                              handleThumbnailChange(productdetail.thumbnail);
                            }}
                          >
                            Save
                          </Button>
                        </div>

                        {/* Product Images Section */}
                        <div className="col-6 mt-n5">
                          <Card className="h-100">
                            <Card.Body>
                              <div className="row mb-3">
                                {productdetail.images?.map((image, i) => (
                                  <div key={i} className="col-auto d-flex align-items-center">
                                    <div style={{ height: '75px', width: '75px' }}>
                                      <img src={image} alt="productImages" className="h-100 w-auto" />
                                    </div>
                                    <Button variant="danger" className="shadow me-2 ms-5" onClick={() => deleteImg(i, image)}>
                                      Delete
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              <Form.Group controlId="productImages">
                                <Form.Label className="text-dark fw-bold">
                                  Product Images <span className="text-danger"> *</span>
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip-top" className="custom-tooltip">
                                        Main image to give a detailed look at the product.
                                      </Tooltip>
                                    }
                                  >
                                    <div className="d-inline-block ms-2">
                                      <CsLineIcons icon="info-hexagon" size="17" />
                                    </div>
                                  </OverlayTrigger>
                                </Form.Label>

                                <Form.Control
                                  type="file"
                                  accept="image/*"
                                  name="productImages"
                                  onChange={handleChange}
                                  multiple
                                  isInvalid={!!formErrors?.productImages}
                                  ref={productImagesRef}
                                />
                                {formErrors?.productImages && <Form.Control.Feedback type="invalid">{formErrors.productImages}</Form.Control.Feedback>}
                              </Form.Group>
                            </Card.Body>
                          </Card>
                        </div>
                      </div>

                      <Row className="g-6 my-1 py-1 gutterRow m-0 ms-2 me-2">
                        <table className="table mt-2 border">
                          <thead className="table-head">
                            <tr className="border">
                              <th className="table-head border">Variant Name</th>
                              <th className="table-head border">MOQ</th>
                              <th className="border">Price</th>
                              <th className="border">B2B Discount</th>
                              <th className="border">B2C Discount</th>
                              {brandCompareVariant?.section && <th className="border">Section diff.</th>}
                            </tr>
                          </thead>
                          <tbody className="table-head">
                            {productdetail?.tmtseriesvariant.map((item, index) => {
                              return (
                                <TableRow
                                  key={index}
                                  variantName={item.variantName}
                                  moq={item.moq}
                                  section={brandCompareVariant?.section}
                                  productdetail={productdetail}
                                  onChange={(field, value) => handleTableRowChange(index, field, value, item.variantName)}
                                />
                              );
                            })}
                          </tbody>
                        </table>
                      </Row>

                      <div className="mb-3 ms-3 me-3">
                        <Form.Group controlId="description">
                          <Form.Label className="text-dark fw-bold">
                            Description <span className="text-danger"> *</span>
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

                          {/* Quill editor wrapped with red border if error exists */}
                          <div ref={descriptionRef} className={formErrors?.description ? 'border border-danger rounded' : ''}>
                            <ReactQuill modules={modules} theme="snow" value={productdetail.description || ''} onChange={handleDescriptionChange} />
                          </div>

                          {/* Error message below editor */}
                          {formErrors?.description && (
                            <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>
                              {formErrors.description}
                            </div>
                          )}
                        </Form.Group>
                      </div>

                      <div className="mb-3 mt-3 ms-3 me-3">
                        <Form.Group controlId="silentFeatures">
                          <Form.Label className="fw-bold text-dark">
                            Salient Features
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Key features or highlights of the product.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block ms-2">
                                {' '}
                                {/* ✅ adds left space */}
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger>
                          </Form.Label>
                          <ReactQuill
                            modules={modules}
                            theme="snow"
                            placeholder="Salient Features"
                            value={silentFeatures || ''}
                            onChange={(silentfeaturesss) => handleSilentFeaturesChange(silentfeaturesss)}
                          />
                          {/* {formErrors.silentFeatures && <div className="mt-1 text-danger">{formErrors.silentFeatures}</div>} */}
                        </Form.Group>
                      </div>
                    </Card>

                    <Card className="border mt-2 mb-4">
                      <div className="mark mb-3">
                        <div className="fw-bold ps-4 p-1 fs-6">Advance Field</div>
                      </div>
                      <Form>
                        <div className="mb-3 ms-3 me-3">
                          <Form.Group controlId="sellerNotes">
                            <Form.Label className="text-dark fw-bold d-flex align-items-center">
                              <span className="me-2">Seller Notes</span>
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip-top" className="custom-tooltip">
                                    Internal notes (not shown to customers).
                                  </Tooltip>
                                }
                              >
                                <div className="d-inline-block">
                                  <CsLineIcons icon="info-hexagon" size="17" />
                                </div>
                              </OverlayTrigger>
                            </Form.Label>

                            <ReactQuill
                              modules={modules}
                              theme="snow"
                              placeholder="Seller Notes"
                              value={productdetail.sellerNotes || ''}
                              onChange={handleSellerNoteChange}
                            />
                          </Form.Group>
                        </div>

                        {/* ✅ Gift Offer + Youtube Link (clean, with spacing) */}
                        {/* <div className='ms-3 me-3'>
                          <div className="mb-3 col-md-12">
                            <Form.Group controlId="giftOffer">
                              <Form.Label className="text-dark fw-bold">Gift Offer</Form.Label>
                              <Form.Control
                                type="text"
                                name="giftOffer"
                                value={productdetail.giftOffer || ''}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </div>
                        </div> */}

                        <div className="ms-3 me-3">
                          <div className="mb-3 col-md-12">
                            <Form.Group controlId="youtubeLink">
                              <Form.Label className="text-dark fw-bold">Youtube Link</Form.Label>
                              <Form.Control type="text" name="youtubeLink" value={productdetail.youtubeLink || ''} onChange={handleChange} />
                            </Form.Group>
                          </div>
                        </div>

                        {/* ✅ Catalogue (no Card, no Col, with Save button) */}
                        <div className="mb-3 ms-3 me-3">
                          {productdetail.catalogue && (
                            <div className="row mb-3">
                              <div className="col-auto">
                                <Button variant="foreground-alternate" className="shadow" onClick={handleDownload}>
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}

                          <Form.Group controlId="catalogue">
                            <Form.Label className="text-dark fw-bold">Catalogue</Form.Label>
                            {loadingCatalogue ? (
                              <div className="ms-2">
                                <Spinner />
                              </div>
                            ) : (
                              <Form.Control
                                type="file"
                                accept=".doc,.docx,application/pdf"
                                name="catalogue"
                                onChange={(e) => setCatalogue(e.target.files[0])}
                              />
                            )}
                          </Form.Group>

                          <Button variant="primary" className="mt-2 shadow" onClick={() => handleCatalogueChange(productdetail.catalogue)}>
                            Save
                          </Button>
                        </div>

                        {/* ✅ Video (no Card, no Col, with text buttons) */}
                        <div className="mb-3 ms-3 me-3">
                          {productdetail.video && (
                            <div className="row mb-3">
                              <div className="col-auto">
                                <Button variant="foreground-alternate" className="shadow" onClick={handleVideoDownload}>
                                  Download
                                </Button>
                              </div>
                            </div>
                          )}

                          <Form.Group controlId="video">
                            <Form.Label className="text-dark fw-bold">Video</Form.Label>
                            {loading ? (
                              <div className="ms-2">
                                <Spinner />
                              </div>
                            ) : (
                              <Form.Control type="file" accept="video/*" name="video" onChange={(e) => setVideo(e.target.files[0])} />
                            )}
                          </Form.Group>

                          <Button variant="primary" className="mt-2 shadow" onClick={() => handleVideoChange(productdetail.video)}>
                            Save
                          </Button>
                        </div>

                        {/* ✅ SKU (no Card, no Col) */}
                        <div className="mb-3 ms-3 me-3">
                          <Form.Group controlId="sku">
                            <Form.Label className="text-dark fw-bold">SKU</Form.Label>
                            <Form.Control type="text" name="sku" value={productdetail.sku || ''} disabled />
                          </Form.Group>
                        </div>
                      </Form>
                    </Card>

                    <Accordion className="mb-3">
                      <Accordion.Item eventKey="1">
                        <Accordion.Header style={{ fontSize: '16px' }} className="text-dark fw-bold border-bottom">
                          Policies
                        </Accordion.Header>
                        <Accordion.Body>
                          <div className="mb-3">
                            <Form.Group controlId="returnPolicy">
                              <Form.Label className="fw-bold text-dark">
                                Return Policy <span className="text-danger"> *</span>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-return" className="custom-tooltip">
                                      Terms for return or replacement of the product.
                                    </Tooltip>
                                  }
                                >
                                  <div className="d-inline-block me-2">
                                    <CsLineIcons icon="info-hexagon" size="17" />
                                  </div>
                                </OverlayTrigger>
                              </Form.Label>
                              <ReactQuill
                                modules={modules}
                                theme="snow"
                                placeholder="Return Policy"
                                value={productdetail.returnPolicy || ''}
                                onChange={handleReturnPolicyChange}
                              />
                            </Form.Group>
                          </div>
                          <div className="mb-3">
                            <Form.Group controlId="shippingPolicy">
                              <Form.Label className="fw-bold text-dark">
                                Shipping Policy <span className="text-danger"> *</span>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-top" className="custom-tooltip">
                                      Shipping timelines, charges, and coverage.
                                    </Tooltip>
                                  }
                                >
                                  <div className="d-inline-block me-2">
                                    <CsLineIcons icon="info-hexagon" size="17" />
                                  </div>
                                </OverlayTrigger>
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
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip-cancel" className="custom-tooltip">
                                      Rules for order cancellation of this product.
                                    </Tooltip>
                                  }
                                >
                                  <div className="d-inline-block me-2">
                                    <CsLineIcons icon="info-hexagon" size="17" />
                                  </div>
                                </OverlayTrigger>
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
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>

                    <div className="mt-4 mb-3 border rounded p-2">
                      <Form.Label className="text-dark fw-bold ps-2">FAQ</Form.Label>
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
                      <Button variant="dark" className="ms-2" size="sm" onClick={handleAddFaq}>
                        Add FAQ
                      </Button>
                    </div>

                    <Form.Label className="fw-bold text-dark">
                      Availble for All Pincode
                      <Form.Check
                        name="allPincode"
                        onChange={(e) => {
                          handleAllPincode(e.target.checked);
                        }}
                        inline
                        value={allPincode}
                        checked={allPincode}
                        style={{ width: '50px' }}
                        className="ms-3"
                        type="checkbox"
                      />
                    </Form.Label>

                    <VarientPicker
                      allPincode={allPincode}
                      section={brandCompareVariant?.section}
                      locationValue={locationValue}
                      setLocationValue={setLocationValue}
                    />
                    {/* <Button onClick={PRINT} type="button">
                      Print
                    </Button> */}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>

          <Button className="float-end" type="button" onClick={submit}>
            Submit
          </Button>
        </>
      )}
    </>
  );
};

export default withRouter(DetailViewProduct);
