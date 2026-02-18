import React, { useEffect, useState, useRef } from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { NavLink, withRouter } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col, Button, Form, Card, Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TableRow from './components/TableRow';
import VarientPicker from './components/VarientPicker';


function AddNewProduct({ history }) {
  const title = 'Add Series Product';
  const description = 'Add Series Product';
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

  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        key
        content
      }
    }
  `;

  const GET_ALL_TMT_MASTER = gql`
    query GetTmtMaster {
      getTmtMaster {
        brandCompareCategory
        id
        tmtseriesvariant {
          id
          moq
          variantName
          hsn
        }
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

  const CREATE_TMT_PRODUCT = gql`
    mutation CreateTMTSeriesProduct(
      $productImages: [Upload]
      $faq: [TMTSeriesFaqInput]
      $brandName: String
      $previewName: String
      $fullName: String
      $returnPolicy: String
      $shippingPolicy: String
      $cancellationPolicy: String
      $description: String
      $giftOffer: String
      $sellerNotes: String
      $section: Boolean
      $youtubeLink: String
      $brandCompareCategory: String
      $categories: [String]
      $listingCommType: String
      $listingComm: Float
      $productCommType: String
      $productComm: Float
      $shippingCommType: String
      $shippingComm: Float
      $fixedCommType: String
      $fixedComm: Float
      $tmtseriesvariant: [TMTSeriesVariantInput]
    ) {
      createTMTSeriesProduct(
        productImages: $productImages
        faq: $faq
        brand_name: $brandName
        previewName: $previewName
        fullName: $fullName
        returnPolicy: $returnPolicy
        shippingPolicy: $shippingPolicy
        cancellationPolicy: $cancellationPolicy
        description: $description
        giftOffer: $giftOffer
        sellerNotes: $sellerNotes
        section: $section
        youtubeLink: $youtubeLink
        brandCompareCategory: $brandCompareCategory
        categories: $categories
        listingCommType: $listingCommType
        listingComm: $listingComm
        productCommType: $productCommType
        productComm: $productComm
        shippingCommType: $shippingCommType
        shippingComm: $shippingComm
        fixedCommType: $fixedCommType
        fixedComm: $fixedComm
        tmtseriesvariant: $tmtseriesvariant
      ) {
        id
      }
    }
  `;
  const initialStates = {
    fullName: '',
    previewName: '',
    description: '',
    sellerNotes: '',
    giftOffer: '',
    brandName: '',
    section: '',
    categories: [],
    youtubeLink: '',
    returnPolicy: '',
    shippingPolicy: '',
    cancellationPolicy: '',
    brandCompareCategory: '',
    productImages: [],
    faq: [],
    tmtseriesvariant: [],
  };

  const [formData, setFormData] = useState(initialStates);

  const [GetSiteContent] = useLazyQuery(GET_SITE_CONTENT, {
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

  const [CreateTMTMater] = useMutation(CREATE_TMT_PRODUCT, {
    onCompleted: () => {
      toast.success('Product Added Successfully!');
      setFormData(initialStates);
      setTimeout(() => {
        history.push('/seller/tmt_product/list');
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || 'Something Went Wrong!'); 
    },
  });

  const [formErrors, setFormErrors] = useState({});
  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === 'productImages') {
      const validFiles = [];
      const errors = [];

      Array.from(files).forEach((file) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
          if (img.width === img.height) {
            validFiles.push(file);

            // Only update form data if all files have been processed
            if (validFiles.length + errors.length === files.length) {
              setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: validFiles,
              }));
              setFormErrors((prevErrors) => ({
                ...prevErrors,
                [name]: errors.length ? errors.join(', ') : '',
              }));
            }
          } else {
            errors.push(`Image is not a square image`);
            if (validFiles.length + errors.length === files.length) {
              setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: validFiles,
              }));
              setFormErrors((prevErrors) => ({
                ...prevErrors,
                [name]: errors.join(', '),
              }));
            }
          }
        };
      });
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    }
  };


  // handle brandCompareCategory

  const [GetTmtMaster, { error, data }] = useLazyQuery(GET_ALL_TMT_MASTER);

  useEffect(() => {
    GetTmtMaster();
  }, [GetTmtMaster]);

  if (error) {
    console.error('GET_ALL_TMT_MASTER', error);
  }

  const [brandCompareVariant, setbrandCompareVariant] = useState(null);

  const handlebrandcompare = async (brndcmpId) => {
    const brndcmpvrnt = data?.getTmtMaster?.find((item) => item.id === brndcmpId);
    setbrandCompareVariant(brndcmpvrnt);

    const { brandCompareCategory, ...rest } = brndcmpvrnt;

    setFormData((prevFormData) => {
      return { ...prevFormData, ...rest };
    });
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

  // handle price b2b and all

  const [tableValues, setTableValues] = useState([]);
  const [section, setSection] = useState(false);

  const handleTableRowChange = (index, field, value, variantName1, moq1, hsn1) => {
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
        moq: moq1,
        hsn: hsn1,
      };
      return newTableValues;
    });
  };

  // handle location value
  const initialLocationState = {
    extraCharge: 0,
    extraChargeType: '',
    finalPrice: '',
    displayStock: 0,
    mainStock: 0,
    gstRate: '',
    gstType: false,
    price: 0,
    b2bdiscount: 0,
    b2cdiscount: 0,
    sectionDiff: 0,
    pincode: [],
    priceType: '',
    transportCharge: 0,
    transportChargeType: '',
    unitType: 'Kg',
  };

  const [locationValue, setLocationValue] = useState(initialLocationState);

  // salient features

  const [silentFeatures, setSilentFeatures] = useState('');

  const handleSilentFeaturesChange = (silentdesc) => {
    setSilentFeatures(silentdesc);
  };

  // handle error

  const validateForm = (validateFormValues, validateLocationValues) => {
    const errors = {};

    // Add validation checks for each field
    if (!validateFormValues.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }
    if (!validateFormValues.previewName.trim()) {
      errors.previewName = 'Preview name is required.';
    }
    if (!validateFormValues.brandName.trim()) {
      errors.brandName = 'Brand name is required.';
    }

    if (!validateFormValues.description.trim()) {
      errors.description = 'Description is required.';
    }
    if (!validateFormValues.productImages.length) {
      errors.productImages = 'Product images is required.';
    }
    if (!validateFormValues.returnPolicy.trim()) {
      errors.returnPolicy = 'Return policy is required.';
    }
    if (!validateFormValues.shippingPolicy.trim()) {
      errors.shippingPolicy = 'shipping policy is required.';
    }

    if (!validateFormValues.cancellationPolicy.trim()) {
      errors.cancellationPolicy = 'Cancellation policy is required.';
    }
    if (!formData.brandCompareCategory.trim()) {
      errors.brandCompareCategory = 'Product master name is required.';
    }


    // handle silentfeature
    if (!silentFeatures.trim()) {
      errors.silentFeatures = 'Salient Features is required.';
    }

    // handle location value

    if (!validateLocationValues.gstRate) {
      errors.gstRate = 'Gst Rate is required.';
    }
    // if (!validateLocationValues.displayStock) {
    //   errors.displayStock = 'display Stock is required.';
    // }
    // if (!validateLocationValues.mainStock) {
    //   errors.mainStock = 'main Stock is required.';
    // }
    if (!validateLocationValues.priceType.trim()) {
      errors.priceType = 'Price Type is required.';
    }
    if (!validateLocationValues.extraChargeType.trim()) {
      errors.extraChargeType = 'Extra charge type is required.';
    }
    if (!validateLocationValues.transportChargeType.trim()) {
      errors.transportChargeType = 'Transport charge type is required.';
    }
    if (!validateLocationValues.finalPrice.trim()) {
      errors.finalPrice = 'Final price is required.';
    }
    if (!validateLocationValues.unitType.trim()) {
      errors.unitType = 'Unit type is required.';
    }

    return errors;
  };

  const fullNameRef = useRef(null);
  const previewNameRef = useRef(null);
  const brandNameRef = useRef(null);
  const descriptionRef = useRef(null);
  const productImagesRef = useRef(null);
  const silentFeaturesRef = useRef(null);
  const gstRateRef = useRef(null);
  const priceTypeRef = useRef(null);
  const extraChargeTypeRef = useRef(null);
  const transportChargeTypeRef = useRef(null);
  const finalPriceRef = useRef(null);
  const unitTypeRef = useRef(null);


  const handleProduct = async (event) => {
    event.preventDefault();

    // handle basic details

    const errors = await validateForm(formData, locationValue);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);

      if (errors.fullName) fullNameRef.current?.focus();
      else if (errors.previewName) previewNameRef.current?.focus();
      else if (errors.brandName) brandNameRef.current?.focus();
      else if (errors.description) descriptionRef.current?.getEditor().focus();
      else if (errors.silentFeatures) silentFeaturesRef.current?.getEditor().focus();
      else if (errors.productImages) productImagesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      else if (errors.gstRate) gstRateRef.current?.focus();
      else if (errors.priceType) priceTypeRef.current?.focus();
      else if (errors.extraChargeType) extraChargeTypeRef.current?.focus();
      else if (errors.transportChargeType) transportChargeTypeRef.current?.focus();
      else if (errors.finalPrice) finalPriceRef.current?.focus();
      else if (errors.unitType) unitTypeRef.current?.focus();

      return;
    }
    setFormErrors({});

    const updatedTableValues = tableValues
      .filter((item) => item !== undefined)
      .map(({ variantName, moq, hsn, allPincode, ...res }) => {
        return {
          variantName,
          moq,
          hsn,
          silent_features: silentFeatures,
          allPincode: !!allPincode,
          tmtserieslocation: { ...locationValue, ...res },
        };
      });

    if (updatedTableValues.length) {
      const value1 = { ...formData, tmtseriesvariant: [...updatedTableValues] };

      await CreateTMTMater({
        variables: value1,
      });
    } else {
      toast.error('Please fill values in the table.');
    }
  };

  useEffect(() => {
    setTableValues([]);
    setLocationValue(initialLocationState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandCompareVariant]);

  // handle all pincode

  const [allPincode, setAllPincode] = useState(false);

  const handleAllPincode = (value) => {
    setAllPincode(value);

    const updatedTableValues = tableValues.map((item) => ({
      ...item,
      allPincode: value,
    }));

    setTableValues(updatedTableValues);
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
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/tmt_product/list">
              <span className="text-dark ms-1">Series Product List</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      {/* <h1 className="mb-1 p-2 text-center fw-bold bg-white rounded" id="title">{title}</h1> */}
      <h5
        style={{ backgroundColor: '#CEE6EA' }}
        className="fw-bold text-dark p-2 mb-2 border rounded
       text-center fs-5" id="title"
      >
        {title}
      </h5>
      <Form onSubmit={handleProduct}>
        <Row>
          <Col>
            <Card className="mb-5">
              <Card.Body className="p-4">
                <Card className="border mt-2">
                  <div className="mark">
                    <div className=" fw-bold ps-4 p-1 fs-6">Basic Details</div>{' '}
                  </div>
                  <Card.Body>
                    {data?.getTmtMaster.length > 0 && (
                      <div className="mb-2 col-md-12">
                        <Form.Group controlId="brandCompareCategory">
                          <Form.Label className="fw-bold text-dark">Product Master Name <span className="text-danger">*</span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Choose Product Category
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block ms-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger></Form.Label>
                          <Form.Select
                            name="brandCompareCategory"
                            value={formData.brandCompareCategory || ''}
                            onChange={(e) => {
                              handleChange(e);
                              handlebrandcompare(e.target.value);
                            }}
                          >
                            <option hidden value="1">
                              Select Product Master Name
                            </option>
                            {data.getTmtMaster.map((item, i) => {
                              if (item.tmtseriesvariant?.length > 0) {
                                return (
                                  <option key={i} value={item.id}>
                                    {item.brandCompareCategory}
                                  </option>
                                );
                              }
                              return null;
                            })}
                          </Form.Select>
                          {formErrors.brandCompareCategory && <div className="mt-1 text-danger">{formErrors.brandCompareCategory}</div>}
                        </Form.Group>
                      </div>
                    )}
                    <div className="mb-3 mt-4">
                      <Form.Group controlId="fullName">
                        <Form.Label className="fw-bold text-dark">Product Full Name <span className="text-danger">*</span>
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
                          </OverlayTrigger></Form.Label>
                        <Form.Control
                          type="text"
                          name="fullName"
                          ref={fullNameRef}
                          value={formData.fullName}
                          onChange={(e) => {
                            if (e.target.value.includes('_')) {
                              e.target.value = e.target.value.replace('_', '');
                            } else if (e.target.value.includes('/')) {
                              e.target.value = e.target.value.replace('/', '');
                            }
                            handleChange(e);
                          }}
                        />
                        {formErrors.fullName && <div className="mt-1 text-danger">{formErrors.fullName}</div>}
                      </Form.Group>
                    </div>
                    <div className="row mb-3">
                      <div className="col-6">
                        <Form.Group controlId="previewName">
                          <Form.Label className="fw-bold text-dark">Product Preview Name<span className="text-danger"> *</span>
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
                            </OverlayTrigger></Form.Label>
                          <Form.Control
                            type="text"
                            name="previewName"
                            ref={previewNameRef}
                            value={formData.previewName}
                            onChange={handleChange} />
                          {formErrors.previewName && <div className="mt-1 text-danger">{formErrors.previewName}</div>}
                        </Form.Group>
                      </div>
                      <div className="col-6">
                        <Form.Group controlId="brandName">
                          <Form.Label className="fw-bold text-dark">Brand Name<span className="text-danger"> *</span>
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
                            </OverlayTrigger></Form.Label>
                          <Form.Control
                            type="text"
                            name="brandName"
                            ref={brandNameRef}
                            value={formData.brandName}
                            onChange={handleChange} />
                          {formErrors.brandName && <div className="mt-1 text-danger">{formErrors.brandName}</div>}
                        </Form.Group>
                      </div>
                      <div className="mb-3">
                        <Form.Group controlId="productImages">
                          <Form.Label className="fw-bold text-dark">Product Images<span className="text-danger"> *</span>
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
                            </OverlayTrigger></Form.Label>
                          <Form.Control type="file"
                            accept="image/*"
                            name="productImages"
                            ref={productImagesRef}
                            onChange={handleChange} multiple />
                          {formErrors.productImages && <div className="mt-1 text-danger">{formErrors.productImages}</div>}
                        </Form.Group>
                      </div>
                      <div className="mb-3">
                        <Form.Group controlId="description">
                          <Form.Label className="fw-bold text-dark">Description <span className="text-danger">*</span>
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
                            </OverlayTrigger></Form.Label>
                          <ReactQuill
                            modules={modules}
                            theme="snow"
                            ref={descriptionRef}
                            value={formData.description}
                            onChange={handleDescriptionChange}
                          />
                          {formErrors.description && <div className="mt-1 text-danger">{formErrors.description}</div>}
                        </Form.Group>
                      </div>
                      <div className="mb-3">
                        <Form.Group controlId="silentFeatures">
                          <Form.Label className="fw-bold text-dark">Salient Features <span className="text-danger">* </span>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top" className="custom-tooltip">
                                  Key features or highlights of the product.
                                </Tooltip>
                              }
                            >
                              <div className="d-inline-block me-2">
                                <CsLineIcons icon="info-hexagon" size="17" />
                              </div>
                            </OverlayTrigger></Form.Label>
                          <ReactQuill
                            modules={modules}
                            theme="snow"
                            ref={silentFeaturesRef}
                            placeholder="Salient Features"
                            value={silentFeatures || ''}
                            onChange={(silentfeaturesss) => handleSilentFeaturesChange(silentfeaturesss)}
                          />
                          {formErrors.silentFeatures && <div className="mt-1 text-danger">{formErrors.silentFeatures}</div>}
                        </Form.Group>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {brandCompareVariant && brandCompareVariant.tmtseriesvariant.length > 0 && (
                  <>
                    <Row className="g-6 my-1 py-1 gutterRow">
                      <Col className='mt-0'>
                        <table className="table mt-2 border">
                          <thead className="table-head">
                            <tr className="border">
                              <th className="table-head border">Variant Name</th>
                              <th className="table-head border">MOQ</th>
                              <th className="border">Price with GST</th>
                              <th className="border">B2B Discount</th>
                              <th className="border">B2C Discount</th>
                              {brandCompareVariant.section && <th className="border">Section diff.</th>}
                            </tr>
                          </thead>
                          <tbody className="table-head">
                            {brandCompareVariant.tmtseriesvariant.map((item, index) => (
                              <TableRow
                                key={index}
                                variantName={item.variantName}
                                moq={item.moq}
                                section={brandCompareVariant.section}
                                brandCompareVariant={brandCompareVariant}
                                onChange={(field, value) =>
                                  handleTableRowChange(index, field, value, item.variantName, item.moq, item.hsn)
                                }
                              />
                            ))}
                          </tbody>
                        </table>
                      </Col>
                    </Row>

                    <VarientPicker
                      formErrors={formErrors}
                      section={section}
                      locationValue={locationValue}
                      setLocationValue={setLocationValue}
                      allPincode={allPincode}
                      refs={{
                        gstRateRef,
                        priceTypeRef,
                        extraChargeTypeRef,
                        transportChargeTypeRef,
                        finalPriceRef,
                        unitTypeRef
                      }}
                    />
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

                  </>
                )}

                <Card className="border mt-2">
                  <div className="mark">
                    <div className=" fw-bold ps-4 p-1 fs-6">Advance Field</div>{' '}
                  </div>
                  <Form className="p-4">
                    <div className="mb-3">
                      <Form.Label className="fw-bold text-dark">
                        <span className="ps-0 px-2">Seller Notes</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              Internal notes (not shown to customers).
                            </Tooltip>
                          }
                        >
                          <div className="d-inline-block me-2">
                            <CsLineIcons icon="info-hexagon" size="17" />
                          </div>
                        </OverlayTrigger>
                      </Form.Label>
                      <ReactQuill modules={modules} theme="snow" value={formData.sellerNotes} onChange={handleSellerNoteChange} />
                    </div>
                    {/* <div className="mb-3">
                      <Form.Label className="fw-bold text-dark">
                        <span className="ps-0 px-2">Gift Offer</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              Mention any gift or combo included.
                            </Tooltip>
                          }
                        >
                          <div className="d-inline-block me-2">
                            <CsLineIcons icon="info-hexagon" size="17" />
                          </div>
                        </OverlayTrigger>
                      </Form.Label>
                      <Form.Control type="text" name="giftOffer" value={formData.giftOffer} onChange={handleChange} />
                    </div> */}
                    <div className="mb-3">
                      <Form.Label className="fw-bold text-dark">
                        <span className="ps-0 px-2">Youtube Link</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              Video link showing product use or unboxing.
                            </Tooltip>
                          }
                        >
                          <div className="d-inline-block me-2">
                            <CsLineIcons icon="info-hexagon" size="17" />
                          </div>
                        </OverlayTrigger>
                      </Form.Label>
                      <Form.Control type="text" name="youtubeLink" value={formData.youtubeLink} onChange={handleChange} />
                    </div>
                    <div className="mb-3">
                      <Form.Label className="fw-bold text-dark">
                        <span className="ps-0 px-2">FAQ</span>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-top" className="custom-tooltip">
                              Add common customer questions and answers to help them understand the product better.
                            </Tooltip>
                          }
                        >
                          <div className="d-inline-block me-2">
                            <CsLineIcons icon="info-hexagon" size="17" />
                          </div>
                        </OverlayTrigger>
                      </Form.Label>
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
                </Card>
              </Card.Body>

              <div className='ms-4 me-4 mb-4'>
                <Accordion defaultActiveKey="0">
                  <Accordion.Item eventKey="0">
                    <Accordion.Header style={{ fontSize: '16px' }} className="text-dark fw-bold border-bottom">
                      <span>
                        Policies
                      </span>
                    </Accordion.Header>

                    <Accordion.Body>
                      {/* Cancellation Policy */}
                      <div className="mb-3">
                        <Form.Label className="fw-bold text-dark">
                          Cancellation Policy <span className="text-danger"> * </span>
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
                          value={formData.cancellationPolicy}
                          onChange={(val) =>
                            setFormData((prev) => ({ ...prev, cancellationPolicy: val }))
                          }
                        />
                      </div>

                      {/* Shipping Policy */}
                      <div className="mb-3">
                        <Form.Label className="fw-bold text-dark">
                          Shipping Policy <span className="text-danger"> * </span>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-ship" className="custom-tooltip">
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
                          value={formData.shippingPolicy}
                          onChange={(val) =>
                            setFormData((prev) => ({ ...prev, shippingPolicy: val }))
                          }
                        />
                      </div>

                      {/* Return Policy */}
                      <div className="mb-3">
                        <Form.Label className="fw-bold text-dark">
                          Return Policy <span className="text-danger"> * </span>
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
                          value={formData.returnPolicy}
                          onChange={(val) =>
                            setFormData((prev) => ({ ...prev, returnPolicy: val }))
                          }
                        />
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            </Card>
          </Col>
        </Row>
        <Button variant="primary" type="submit" className="float-end">
          Submit
        </Button>
      </Form>
    </>
  );
}

export default withRouter(AddNewProduct);
