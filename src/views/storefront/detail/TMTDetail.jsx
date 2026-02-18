import React, { useState, useEffect, useRef } from 'react';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { NavLink, useHistory } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
/* eslint-disable */
import { Truck, XOctagon, XOctagonFill, ArrowCounterclockwise } from 'react-bootstrap-icons';
import 'swiper/css';
import 'swiper/css/navigation';
import './style.css';
import { Navigation } from 'swiper';
import { toast } from 'react-toastify';
import { Row, Col, Button, Card, Form, OverlayTrigger, Tooltip, Modal, Badge } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import 'react-image-lightbox/style.css';
import DOMPurify from 'dompurify';
import Truncate from 'react-truncate-html';
import Rating from 'react-rating';
import { FacebookShareButton, FacebookIcon, WhatsappShareButton, WhatsappIcon } from 'react-share';
import moment from 'moment';
import TableRow from './tmtDetailComponents/TableRow';
import Comparebrand from './tmtDetailComponents/compareBrandComponent/Comparebrand';
import AddToCartTMT from './tmtDetailComponents/AddToCartTMT';
import QuotationTMT from './tmtDetailComponents/QuotationTMT';
import ShareOnInstagram from './ShareOnInstagram';
import returnImage from './pngs/icons_return_apnagharmart.png';
import shippingImage from './pngs/icons_Shipping_apnagharmart.png';
import cancelImage from './pngs/icons_cancel_.png';
import TMTPriceComponent from '../home/TMTPriceComponent';
import TMTDiscountBadge from '../home/TMTDiscountBadge';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { fil } from 'date-fns/locale';

const CHECK_WISHLIST_DUPLICACY = gql`
  query Wishlist {
    wishlist {
      id
      userId {
        id
      }
      updatedAt
      createdAt
      wishlistProducts {
        productId {
          brand_name
          fullName
          id
          identifier
          images
          thumbnail
        }
      }
    }
  }
`;

const CREATE_WISHLIST = gql`
  mutation Mutation($productId: ID!) {
    createWishlist(productId: $productId) {
      userId {
        id
      }
      wishlistProducts {
        productId {
          brand_name
        }
      }
    }
  }
`;

const GET_TMT_PROUDCT_BY_CATEGORYID = gql`
  query GetTMTSeriesProductByCatId($catId: ID!) {
    getTMTSeriesProductByCatId(cat_id: $catId) {
      brand_name
      active
      previewName
      categories
      id
      identifier
      images
      section
      thumbnail
      tmtseriesvariant {
        id
        allPincode
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
        variantName
        active
        hsn
        silent_features
        moq
      }
    }
  }
`;

const GET_TMT_PROUDCT_BY_COMPARE = gql`
  query GetTMTSeriesProductByCompare($name: String, $pincode: Int) {
    getTMTSeriesProductByCompare(name: $name, pincode: $pincode) {
      id
      fullName
      brand_name
      active
      identifier
      tmtseriesvariant {
        id
        variantName
        moq
        tmtserieslocation {
          id
          price
          gstRate
          b2cdiscount
          b2bdiscount
          sellerId {
            companyName
          }
          extraCharge
          mainStock
          displayStock
        }
      }
    }
  }
`;

const GET_REVIEW_OF_PRODUCT = gql`
  query GetReviewByProduct($productId: ID) {
    getReviewByProduct(productId: $productId) {
      id
      user {
        firstName
        lastName
        profilepic
      }
      productId
      images
      createdAt
      rating
      title
      description
    }
  }
`;

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;

function TMTDetail({ product }) {
  const [colSpan, setColSpan] = useState(2);
  const { dataStoreFeatures1 } = useGlobleContext();
  useEffect(() => {
    if (product?.section) {
      setColSpan(1);
    } else {
      setColSpan(2);
    }
  }, []);

  const title = product?.fullName;
  const description = product?.fullName || ' Brand: ' || product?.brand_name;
  const keyword = product?.fullName || ' Brand: ' || product?.brand_name;
  const history = useHistory();
  const [pincode, setPincode] = useState(null);
  const [available, setAvailable] = useState('');
  const [click, setClick] = useState(false);
  const [trigger, setTrigger] = useState(0);
  const shareURL = window.location.href;
  const [shippingBoxModal, setShippingBoxModal] = useState(false);
  const [returnBoxModal, setReturnBoxModal] = useState(false);
  const [cancelBoxModal, setCancelBoxModal] = useState(false);
  const allPincodeCheck = product?.tmtseriesvariant?.some((item) => item?.allPincode === true);
  const [checkMessage, setCheckMessage] = useState('');

  function Display() {
    setTrigger((tri) => tri + 1);
    const isPincodeAvailable = product?.tmtseriesvariant[0]?.tmtserieslocation[0]?.pincode.find((location) => location === pincode) === pincode;
    if (!isPincodeAvailable) {
      setCheckMessage(`Not Available`);
      setAvailable('Not Available');
    } else {
      setCheckMessage(`Available`);
      setAvailable('Available');
      if (videoSectionRef?.current && !hasScrolled) {
        videoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        setHasScrolled(true);
      }
    }
    if (allPincodeCheck) {
      setCheckMessage(`Available`);
      setAvailable('Available');
      if (videoSectionRef?.current && !hasScrolled) {
        videoSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        setHasScrolled(true);
      }
    }
  }
  const [wish, setWish] = useState(false);
  const [checkDuplicacy, resultDuplicacy] = useLazyQuery(CHECK_WISHLIST_DUPLICACY, {
    onCompleted: (resultDup) => {},
    onError(error) {
      console.error('GET_ITEM_DETAIL', error);
    },
  });
  useEffect(() => {
    checkDuplicacy();
  }, [checkDuplicacy]);
  let idea = '';
  if (product && resultDuplicacy?.data) {
    if (resultDuplicacy?.data?.wishlist && resultDuplicacy?.data?.wishlist?.userId.id) {
      idea = resultDuplicacy?.data?.wishlist?.wishlistProducts?.some((c) => c?.productId?.id === product?.id);
    } else {
    }
  } else {
    // console.log('Product and resultDuplicacy.data is not yet received');
  }
  useEffect(() => {
    setWish(idea);
  }, [idea]);
  const [createWishlist, result] = useMutation(CREATE_WISHLIST, {
    onCompleted: () => {
      toast.success('Product have been added to wishlist');
    },
    onError: (err) => {
      console.log('CREATE_WISHLIST', err.message);
    },
  });
  const changeButton = () => {
    return (
      <Button variant="primary" className="btn-icon btn-icon-end me-2 my-0">
        <span>
          Wishlist <CsLineIcons icon="check" />
        </span>
      </Button>
    );
  };
  function handleBulkEnquiry(productname) {
    history.push(`/bulk/${productname}`);
  }
  const handleWishlist = async (id) => {
    await createWishlist({
      variables: {
        productId: id,
      },
    });
    setClick(true);
    changeButton();
  };
  const [mainImage, setMainImage] = useState('');
  const len = product?.categories?.length;
  const catIndex = Math.floor(Math.random() * len);
  const { data: dataCat } = useQuery(GET_TMT_PROUDCT_BY_CATEGORYID, {
    variables: {
      catId: product?.categories[catIndex],
    },
  });
  const [variantQuantities, setVariantQuantities] = useState([]);
  const [quotationData, setQuotationData] = useState([]);
  const [totalsum, setTotalSum] = useState(0);
  const [totalQty, setTotalQty] = useState(0);
  useEffect(() => {
    const variantwithQty = variantQuantities.filter((item) => item.rateofvariant !== 0);
    const sum = variantwithQty.reduce((sum1, item) => {
      const individualPrice = ((100 - item.discount) * item.rateofvariant) / 100;
      return sum1 + individualPrice;
    }, 0);
    setTotalSum(sum);
    const qty = variantwithQty.reduce((prevQty, item) => {
      const individualQty = item.quantity;
      return prevQty + individualQty;
    }, 0);

    setTotalQty(qty);
  }, [variantQuantities]);
  const [showCompareTable, setShowCompareTable] = useState(false);
  const [GetTMTSeriesProductByCompare, { data: data1 }] = useLazyQuery(GET_TMT_PROUDCT_BY_COMPARE, {
    variables: {
      name: product?.brandCompareCategory,
      pincode: pincode,
    },
    onCompleted: () => {
      // console.log('product', product);
    },
  });
  const sameBrand = data1?.getTMTSeriesProductByCompare?.filter((item) => item.brand_name === product?.brand_name);
  const otherBrand = data1?.getTMTSeriesProductByCompare?.filter((item) => item.brand_name !== product?.brand_name);
  useEffect(() => {
    GetTMTSeriesProductByCompare();
  }, [GetTMTSeriesProductByCompare, product]);
  function handleDownload() {
    if (product?.catalogue) {
      const downloadLink = product?.catalogue;
      window.open(downloadLink, '_blank');
    }
  }
  const [selected, setSelected] = useState('');
  function ReadMore(event) {
    setSelected(event);
  }
  const [getReview, { data: dataReview }] = useLazyQuery(GET_REVIEW_OF_PRODUCT);
  useEffect(() => {
    if (product?.id) {
      getReview({
        variables: {
          productId: product?.id,
        },
      });
    }
  }, [product]);
  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT, {
    variables: {
      key: 'checkOutMessage',
    },
  });
  useEffect(() => {
    getContent();
  }, [dataSiteContent, getContent]);
  const [show, setShow] = useState(false);
  const company_name = product?.tmtseriesvariant[0].tmtserieslocation[0].sellerId.companyName;

  const videoSectionRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const handleScrollToVideoSection = () => {
    if (videoSectionRef.current) {
      const offset = 100;
      const top = videoSectionRef.current.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: top,
        behavior: 'smooth',
      });
    }
  };
  const [searchTerm, setSearchTerm] = useState('');
  const filteredVariants = product?.tmtseriesvariant?.filter((item) => item.variantName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <HtmlHead title={title} description={description} />
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`.text_black {
          color: black;
        }`}
        {`
          .btn_color {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
            transition: background 0.3s ease;
            padding: 10px 30px;
            border: none;
            cursor: pointer;            
          }
          .btn_color:hover {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            filter: brightness(80%);       
          }
        `}
      </style>
      <aside>
        <div className="container-fluid px-0 mb-2">
          {product && (
            <>
              <img src="/img/advertisement/2.jpg" className="d-block w-100 rounded" alt={product?.fullName} />
            </>
          )}
        </div>
      </aside>
      <div className="page-title-container p-1 m-0">
        <Row className="g-0">
          <Col className="col-auto mb-sm-0 me-auto">
            <NavLink className="pb-1 d-inline-block hidden breadcrumb-back me-2" to="/">
              <span className=" ms-1 small text_black">Home</span>
            </NavLink>
            <span className="me-1 small"> / </span>
            <span className=" ms-1 small text_black">{product?.fullName}</span>
          </Col>
        </Row>
      </div>

      <Card className="mb-5 mt-2" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="p-2 mt-2">
          <Row className="g-5">
            {product && product?.images && (
              <Col xxl="7" xl="6" lg="8" sm="12" md="12" xs="12">
                <Row className="mx-0 my-0 px-2 py-0">
                  <Col sm="2" md="2" lg="3" xxl="4" className="mx-0 my-0 px-0 py-0 thumbnail">
                    {product?.images?.map((curElm, index) => {
                      return (
                        <div key={index} className="mx-0 my-0 px-0 py-0">
                          <img
                            className="inner mx-0 my-1 px-0 py-0"
                            style={{ height: '80px', width: '80px', borderRadius: '8px' }}
                            src={curElm}
                            alt={product?.fullName}
                            key={index}
                            onClick={() => setMainImage(curElm)}
                          />
                        </div>
                      );
                    })}
                  </Col>

                  <Col sm="6" md="7" lg="9" xxl="8" className="main-Image mx-0 my-0 px-1 py-0">
                    <img
                      className="box mx-0 my-1 px-0 py-0"
                      style={{ height: '400px', width: '400px', borderRadius: '15px' }}
                      src={mainImage === '' ? product?.images[0] : mainImage}
                      alt={product?.fullName}
                    />
                  </Col>
                </Row>

                <Swiper navigation modules={[Navigation]} className="mySwiper">
                  {product.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img src={image} alt={mainImage?.filename} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Col>
            )}
            <Col xxl="5" xl="6" lg="4" md="12" sm="12" xs="12" className="sh-xl-60 d-flex flex-column justify-content-between">
              <div>
                {product && (
                  <>
                    <p className="mb-2 d-inline-block text_black d-flex h6 p-0">BRAND: {product?.brand_name}</p>
                    <h4 className="mb-2 fw-bold text_black">{product?.fullName}</h4>
                  </>
                )}
                {product?.tmtseriesvariant && (
                  <div className="mt-2 py-0">
                    <p className="form-label text-dark fw-bold"> Sold by : {company_name}</p>
                  </div>
                )}
                <Row className="mb-4 g-3">
                  <Col>
                    {product.tmtseriesvariant[0].silent_features && (
                      <div className="my-1 py-2 px-2 border rounded text-dark">
                        {/* eslint-disable-next-line */}
                        <p className="mb-n3" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.tmtseriesvariant[0].silent_features) }} />
                      </div>
                    )}
                    <div>
                      <>
                        <div className="d-flex flex-column align-items-start mb-1">
                          <div className="fw-bold text-start pb-2 text_black">Enter Delivery Pincode to check availability and to Show Price</div>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="text"
                              maxLength={6}
                              placeholder="Enter Pincode"
                              className="me-2"
                              style={{ width: '180px' }}
                              value={pincode || ''}
                              onChange={(e) => {
                                const numericValue = e.target.value.replace(/\D/g, '');
                                const pincodeValue = parseInt(numericValue, 10);
                                setPincode(pincodeValue);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  Display();
                                }
                              }}
                            />
                            <Button className="btn_color" onClick={() => Display()}>
                              Check
                            </Button>
                          </div>
                        </div>
                      </>
                      {checkMessage && (
                        <div className="text-start pt-1 pb-1">
                          {checkMessage === 'Available' ? (
                            <span className="text-success">Delivery available at pincode: {pincode} 🚚</span>
                          ) : (
                            <>
                              <span className="text-danger">
                                Sorry, this product is not sold by this {product?.tmtseriesvariant && <> {company_name}</>} at pincode {pincode}. However, other
                                sellers available for at {pincode} are...
                              </span>

                              {/* Suggested Table styled like Compare Table */}
                              {/* Same Brand Table */}
                              {sameBrand?.length > 0 && (
                                <>
                                  <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                    <table className="table table-bordered">
                                      <thead className="table-head bg-primary fw-bold">
                                        <tr>
                                          <th className="text-white">
                                            {sameBrand?.length > 0
                                              ? `${sameBrand
                                                  .map((item) => `${item.brand_name} - ${item.fullName}`)
                                                  .join(' / ')} available at pincode ${pincode}`
                                              : `Brand available at pincode ${pincode}`}
                                          </th>
                                          <th className="text-white text-center" style={{ verticalAlign: 'middle' }}>
                                            Action
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {sameBrand.map((item, idx) => (
                                          <tr key={`same-${idx}`} className="table-success">
                                            <td style={{ border: '1px solid #dee2e6' }}>
                                              <div>
                                                <strong>
                                                  {item.brand_name} - {item.fullName}
                                                </strong>
                                                <br />
                                                <small>Sold by: {item.tmtseriesvariant?.[0]?.tmtserieslocation?.[0]?.sellerId?.companyName || 'N/A'}</small>
                                              </div>
                                            </td>
                                            <td
                                              style={{
                                                border: '1px solid #dee2e6',
                                                width: '150px',
                                                display: 'flex',
                                                justifyContent: 'center', // horizontal centering
                                                alignItems: 'center', // vertical centering
                                                height: '60px', // optional: gives vertical space for centering
                                              }}
                                            >
                                              <a
                                                href={`/product/${item.identifier}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-primary"
                                              >
                                                View More
                                              </a>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}

                              {/* Other Brand Table */}
                              {otherBrand?.length > 0 && (
                                <>
                                  <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                                    <table className="table table-bordered">
                                      <thead className="fw-bold" style={{ backgroundColor: '#0657a9ff' }}>
                                        {' '}
                                        {/* Dodger Blue */}
                                        <tr>
                                          <th className="text-white">
                                            {/* {otherBrand?.length > 0
                                              ? `Alternative Brands - ${[...new Set(otherBrand.map((item) => item.fullName))].join(
                                                  ' / '
                                                )} available at ${pincode}`
                                              : `Alternative Brands available at ${pincode}`} */}
                                            Alternative Brands of {product?.previewName} available at {pincode} are as follows:
                                          </th>
                                          <th className="text-white text-center align-middle">Action</th>
                                        </tr>
                                      </thead>

                                      <tbody>
                                        {otherBrand.map((item, idx) => (
                                          <tr key={`other-${idx}`}>
                                            <td style={{ border: '1px solid #dee2e6' }}>
                                              <div>
                                                <strong>
                                                  {item.brand_name} - {item.fullName}
                                                </strong>
                                                <br />
                                                <small>Sold by: {item.tmtseriesvariant?.[0]?.tmtserieslocation?.[0]?.sellerId?.companyName || 'N/A'}</small>
                                              </div>
                                            </td>
                                            <td
                                              style={{
                                                border: '1px solid #dee2e6',
                                                width: '150px',
                                                display: 'flex',
                                                justifyContent: 'center', // horizontal centering
                                                alignItems: 'center', // vertical centering
                                                height: '60px', // optional: gives vertical space for centering
                                              }}
                                            >
                                              <a
                                                href={`/product/${item.identifier}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-primary"
                                                style={{ backgroundColor: '#0657a9ff' }}
                                              >
                                                View More
                                              </a>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {available === 'Available' && (
                      <div className="w-100 border rounded mb-1 pt-0 pb-0 ps-2">
                        {product.tmtseriesvariant[0]?.tmtserieslocation[0]?.transportChargeType &&
                        product.tmtseriesvariant[0]?.tmtserieslocation[0]?.transportChargeType === 'Shipping Charge' ? (
                          <>
                            <Button onClick={() => setShow(true)} className="btn-white text_black fw-bold mx-0 p-1 mt-1">
                              Shipping Charge Extra <CsLineIcons icon="info-hexagon" width="15" />
                            </Button>
                          </>
                        ) : (
                          <div className="pt-2 pb-1 text-dark">
                            {product.tmtseriesvariant[0]?.tmtserieslocation[0]?.transportChargeType &&
                            product.tmtseriesvariant[0]?.tmtserieslocation[0]?.transportCharge > 0 ? (
                              <p className="my-1 py-0 d-inline">
                                {' '}
                                Delivery ₹{product.tmtseriesvariant[0]?.tmtserieslocation[0]?.transportCharge} Per{' '}
                                {product.tmtseriesvariant[0]?.tmtserieslocation[0]?.unitType}
                              </p>
                            ) : (
                              <div className="d-inline"> Free Delivery</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="row g-2 mt-2">
                      <div className="d-flex flex-wrap gap-3 align-items-center justify-content-start mt-1 mb-2">
                        <Button
                          onClick={() => setShippingBoxModal(true)}
                          className="px-4 py-2 fw-bold text-primary border border-primary rounded-pill shadow-sm"
                          variant="outline-primary"
                        >
                          Shipping Policy
                        </Button>
                        <Button
                          onClick={() => setCancelBoxModal(true)}
                          className="px-4 py-2 fw-bold text-danger border border-danger rounded-pill shadow-sm"
                          variant="outline-danger"
                        >
                          Cancellation Policy
                        </Button>
                        <Button
                          onClick={() => setReturnBoxModal(true)}
                          className="px-4 py-2 fw-bold text-success border border-success rounded-pill shadow-sm"
                          variant="outline-success"
                        >
                          Return Policy
                        </Button>
                      </div>
                    </div>
                    <Button className="me-2 font-color my-1  btn_color p-2" onClick={() => handleBulkEnquiry(product?.fullName)}>
                      Bulk Enquiry
                    </Button>
                    <div className="d-flex align-items-center my-3 py-2 bg-light rounded shadow-sm px-3">
                      <span className="fw-bold me-3 text-dark"> Share on: </span>
                      <FacebookShareButton url={shareURL} quote="Dummy text!" hashtag="#muo">
                        <FacebookIcon className="me-2 border border-primary p-1 rounded-circle shadow-sm" size={40} round />
                      </FacebookShareButton>
                      <WhatsappShareButton url={shareURL} quote="Dummy text!" hashtag="#muo">
                        <WhatsappIcon className="me-2 border border-success p-1 rounded-circle shadow-sm" size={40} round />
                      </WhatsappShareButton>
                    </div>
                    {product?.giftOffer && (
                      <Card className="mx-0 px-0 mt-2 border">
                        <p className="my-1 text_black mx-1 p-1"> {product?.giftOffer} </p>
                      </Card>
                    )}
                    {product?.catalogue && (
                      <Button variant="link" className="btn-icon btn-icon-only shadow mx-0 px-0 py-0 " onClick={() => handleDownload()}>
                        Product Catalogue <CsLineIcons icon="download" className="mx-0 text-primary" size="17" />
                      </Button>
                    )}
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {available === 'Available' && (
            <div>
              <Row className="gutterRow mt-4">
                {product && (
                  <div style={{ overflowX: 'auto' }} ref={videoSectionRef}>
                    <div className="d-flex align-items-center gap-2 w-100">
                      <div className="mark p-2 rounded border fw-bold flex-grow-1">
                        {product?.brand_name} - {product?.previewName} Price List
                      </div>
                    </div>
                    <table className="table mt-2 border ">
                      <thead className="table-head mark">
                        <tr className="border">
                          <th className="table-head border">Item</th>
                          {product.section ? (
                            <th className="border text-center">Pre GST Price (Per {product?.tmtseriesvariant[0]?.tmtserieslocation[0]?.unitType})</th>
                          ) : (
                            <th className="border text-center">Pre GST List Price</th>
                          )}
                          {!product.section && <th className="border text-center">Discount %</th>}
                          <th className="border text-center">GST %</th>
                          <th className="border text-center">GST Paid Price</th>
                          <th className="border text-center">Enter Qty (Per {product?.tmtseriesvariant[0]?.tmtserieslocation[0]?.unitType})</th>
                          <th className="border text-center">GST Paid Amount</th>
                        </tr>
                      </thead>
                      <tbody className="table-head">
                        {filteredVariants.map((item, index) => {
                          const { id, moq, variantName, tmtserieslocation, allPincode, active } = item;
                          return (
                            <TableRow
                              key={index}
                              moq={moq}
                              variantID={id}
                              pincode={pincode}
                              trigger={trigger}
                              variantName1={variantName}
                              tmtserieslocation={tmtserieslocation}
                              setVariantQuantities={setVariantQuantities}
                              setQuotationData={setQuotationData}
                              pId={product?.id}
                              allPincode={allPincode}
                              active={active}
                              section={product?.section}
                            />
                          );
                        })}
                        <tr className="mark">
                          <td className="border mx-4" colSpan={3}>
                            {product?.priceUpdateDate && <>Price Update Date : {moment(parseInt(product.priceUpdateDate, 10)).format('DD-MMM-YYYY')}</>}
                          </td>
                          <td className="border mx-4 text-center" colSpan={colSpan}>
                            Total
                          </td>
                          <td className="border text-center">
                            {totalQty} {product?.tmtseriesvariant[0]?.tmtserieslocation[0]?.unitType}
                          </td>
                          <td className="border text-center"> {totalsum.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </Row>
              <Row className="p-2 ">
                <div className="mb-0 mt-2 float-end">
                  <AddToCartTMT className="float-end mx-3" variantQuantities={variantQuantities} productID={product?.id} />
                </div>
              </Row>
              <Row className="mb-2 mt-2 mx-2 float-end">
                <QuotationTMT className="float-end mx-3" variantQuantities={variantQuantities} productID={product?.id} quotationData={quotationData} />
              </Row>
            </div>
          )}
          {available === 'Available' && (
            <Row className="g-6 my-1 py-1 w-100 gutterRow mark m-0">
              <Col className="mt-2">
                <p className="fw-bold mb-1 text-dark">Rate Comparison at {pincode}</p>
                <div className="d-flex">
                  <p className="fw-normal text_black">To get comparative rates of required quantity offered by other Sellers, Click here</p>
                  <Form.Check
                    className="form-check ps-5"
                    type="checkbox"
                    checked={showCompareTable}
                    onChange={() => {
                      setShowCompareTable(!showCompareTable);
                    }}
                  />
                </div>
              </Col>
              {showCompareTable && data1 && sameBrand && (
                <div className="p-2 m-0">
                  {sameBrand.length <= 1 ? (
                    <div className="p-2 m-0"></div>
                  ) : (
                    <table className="table border" style={{ tableLayout: 'fixed', width: '100%' }}>
                      <thead className="table-head">
                        <tr className="border mark">
                          <th className="table-head border">Same Brands available at this {pincode}</th>
                          <th className="border">Total Order Value</th>
                          <th className="border">Select Brand to Buy</th>
                        </tr>
                      </thead>
                      <tbody className="table-head">
                        {showCompareTable &&
                          sameBrand?.map((value, index) => {
                            return (
                              <Comparebrand
                                key={index}
                                otherBrand={value}
                                name={company_name}
                                product={sameBrand}
                                variantQuantities={variantQuantities}
                                pincode={pincode}
                              />
                            );
                          })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
              {showCompareTable && data1 && otherBrand?.length > 0 && (
                <div className="p-2 m-0">
                  <table className="table border" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <thead className="table-head">
                      <tr className="border mark">
                        <th className="table-head border">Alternative Brands available at this {pincode}</th>
                        <th className="border">Total Order Value</th>
                        <th className="border">Select Brand to Buy</th>
                      </tr>
                    </thead>
                    <tbody className="table-head">
                      {showCompareTable &&
                        otherBrand?.map((value, index) => {
                          return (
                            <Comparebrand
                              key={index}
                              otherBrand={value}
                              name={company_name}
                              product={otherBrand}
                              variantQuantities={variantQuantities}
                              pincode={pincode}
                            />
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
              {showCompareTable && data1 && sameBrand?.length <= 1 && otherBrand?.length === 0 && (
                <div className="text-danger fw-bold p-2">🚫 Comparison Rate Not Available</div>
              )}
            </Row>
          )}
        </div>
      </Card>

      <aside>
        <Row className="g-4">
          <Col xl="12" className="mb-5">
            {product?.description && <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded">Product Details</div>}
            {product?.description && (
              <Card className="mb-2">
                <Card.Body>
                  {!(selected === product?.id) && (
                    <div className="d-inline">
                      <Truncate lines={3} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.description) }} />
                      <Button className="btn_color p-2  px-3 " onClick={() => ReadMore(product?.id)}>
                        View More <CsLineIcons icon="chevron-bottom" />
                      </Button>
                    </div>
                  )}
                  {selected === product?.id && (
                    <div className="d-inline">
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.description) }} className="mb-3" />
                      <Button className="btn_color p-2  px-3 " onClick={() => ReadMore(0)}>
                        View Less
                        <CsLineIcons icon="chevron-top" />
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
            {product?.faq?.length > 0 && <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded">Frequently Asked Questions</div>}
            {product?.faq?.length > 0 && (
              <Card className="pb-4">
                {product?.faq?.map((faq, index) => (
                  <Card.Body key={index} className="mb-n6">
                    <Row className="g-0 mb-0">
                      <Col xs="auto">
                        <p className="sw-2 font_color mb-2 fw-bold">{index + 1}.</p>
                      </Col>
                      <Col>
                        <p className="font_color ps-3 mb-2 fw-bold">{faq?.question}</p>
                        <p className="text-body ps-3 mb-0">{faq?.answer}</p>
                      </Col>
                    </Row>
                  </Card.Body>
                ))}
              </Card>
            )}
            {dataReview?.getReviewByProduct?.length > 0 && <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded">Review Section</div>}
            {dataReview?.getReviewByProduct?.length > 0 && (
              <Card>
                <Card.Body>
                  {dataReview?.getReviewByProduct?.map((review, index) => {
                    if (index < 5) {
                      return (
                        <div key={review.id} className="mb-2">
                          {review?.user?.profilepic ? (
                            <img className="profile" style={{ height: '50px', width: '50px', borderRadius: '35px' }} alt="dp" src={review?.user?.profilepic} />
                          ) : (
                            <img
                              className="profile"
                              style={{ height: '50px', width: '50px', borderRadius: '35px' }}
                              alt="dp"
                              src="/img/profile/profile-11.webp"
                            />
                          )}
                          <div className="name d-inline ms-3">
                            {review?.user?.firstName && review?.user.firstName} {review?.user?.lastName && review?.user.lastName}
                          </div>
                          <div className="name d-inline mx-2">{moment(parseInt(review.createdAt, 10)).format('DD/MM/YYYY')}</div>

                          {review?.rating > 0 && (
                            <Rating
                              className="me-2 mt-0 pt-0"
                              readonly
                              initialRating={review?.rating}
                              value={review?.rating}
                              emptySymbol={<i className="cs-star text-primary" />}
                              fullSymbol={<i className="cs-star-full text-primary" />}
                            />
                          )}
                          <strong> {review?.title}</strong>

                          {review?.images?.length > 0 && (
                            <div className="d-flex">
                              {review?.images.map((img1, index) => (
                                <div key={index} className="me-2">
                                  <img src={img1} alt="reviewImg" style={{ width: '100px' }} className="h-auto" />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* <p className="mb-0 pb-0">Author :- {`${review?.user?.firstName} ${review?.user?.lastName}`}</p> */}
                          <p className="mb-0 pb-0">{review?.description}</p>
                        </div>
                      );
                    }
                  })}
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col xl="12">
            {product?.youtubeLink && (
              <Card className="mx-0 px-0 mb-2 justify-content-center">
                <iframe height="auto" title="video" className="sw-auto" src={`${product?.youtubeLink}?mute=1`} />
              </Card>
            )}
            {product?.video && (
              <Card>
                <video className="sw-auto pb-2" height="auto" controls>
                  <source src={product?.video} type="video/mp4" />
                  <track label="English" kind="captions" src="captions.vtt" default />
                </video>
              </Card>
            )}
          </Col>
          <Col xl="12">
            {dataCat?.getTMTSeriesProductByCatId?.length > 1 && <div className=" text-center fw-bold py-1 bg_color pt-2 pb-2 rounded">Similar Products</div>}
            <Row className="row-cols-2 row-cols-md-3 row-cols-xl-5 rounded-bottom p-1 bg-white pb-2 mt-0 ms-0 mx-0 ">
              {dataCat &&
                dataCat?.getTMTSeriesProductByCatId?.map(
                  (item, index) =>
                    index < 5 &&
                    !(item.id === product?.id) && (
                      <Col key={item?.id}>
                        <Card className="hover-border-primary border">
                          {item?.section && <TMTDiscountBadge product={item} />}
                          <Row className="g-0 h-100">
                            <img
                              src={item?.thumbnail || (item?.images && item?.images[0])}
                              alt={item?.fullName}
                              className="card-img rounded card-img-horizontal h-100"
                            />
                            <div>
                              {item?.brandCompareCategory && (
                                <p
                                  style={{
                                    position: 'absolute',
                                    backgroundColor: '#1ea9e8',
                                    color: 'black',
                                    marginTop: '-24px',
                                    marginLeft: '0px',
                                    paddingBottom: '0px',
                                    fontSize: '14px',
                                    borderTopRightRadius: '8px',
                                  }}
                                  className="px-1 pb-0 mx-1 mb-1"
                                >
                                  {' '}
                                  Compare Brands{' '}
                                </p>
                              )}{' '}
                            </div>
                          </Row>
                          <Row>
                            <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                              <div className="border-top pb-2"></div>
                              <div className="mb-0 h6">
                                <div className="card-text mb-0 text-truncate p-1 text_black">{item?.brand_name}</div>
                                <OverlayTrigger
                                  delay={{ show: 1000, hide: 0 }}
                                  placement="top"
                                  overlay={<Tooltip id="tooltip-top">{item?.previewName}</Tooltip>}
                                >
                                  <NavLink
                                    to={`/product/${item?.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                                    className="body-link stretched-link d-block my-1 py-0 mx-1 px-1"
                                  >
                                    <div className="card-text mb-0 text-truncate p-1 text_black">
                                      {item?.fullName} {item?.previewName}
                                    </div>
                                  </NavLink>
                                </OverlayTrigger>
                                <div className=" my-1 py-0 mx-1 px-1 text-truncate text_black">
                                  {item && item?.section ? <TMTPriceComponent product={item} /> : <p className="d-inline">VIEW PRICE</p>}
                                </div>
                              </div>
                            </Card.Body>
                          </Row>
                        </Card>
                      </Col>
                    )
                )}
            </Row>
          </Col>
          {/* ADVERTISEMENT SLOT  START */}
          <aside>
            <Row className="g-4 mt-2">
              <Col sm="6" lg="3">
                <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
                  <img
                    src="https://images.unsplash.com/photo-1487491424367-7571f9afbb30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNpdmlsJTIwY29uc3RydWN0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
                    className="card-img img_1 h-100 scale"
                    alt="card image"
                  />
                  <div className="card-img-overlay d-flex flex-column justify-content-between bg-transparent">
                    <div className="d-flex flex-column h-100 justify-content-between align-items-start">
                      {/* <div className="cta-2 text-black w-80">Seasoned Breads</div> */}
                      {/* <Button variant="primary" className="btn-icon btn-icon-start mt-3 stretched-link">
                  <CsLineIcons icon="chevron-right" /> <span>View</span>
                </Button> */}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col sm="6" lg="3">
                <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
                  <img
                    src="https://images.unsplash.com/photo-1556894769-b9a5dab851c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2l2aWwlMjBjb25zdHJ1Y3Rpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
                    className="card-img  img_1 h-100 scale"
                    alt="card image"
                  />
                  <div className="card-img-overlay d-flex flex-column justify-content-between bg-transparent">
                    <div className="d-flex flex-column h-100 justify-content-between align-items-start">
                      {/* <div className="cta-2 text-black w-80">Herbal and Vegan</div> */}
                      {/* <Button variant="primary" className="btn-icon btn-icon-start mt-3 stretched-link">
                  <CsLineIcons icon="chevron-right" /> <span>View</span>
                </Button> */}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col sm="6" lg="3">
                <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
                  <img
                    src="https://images.unsplash.com/photo-1593786267484-d138cb026c50?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGNpdmlsJTIwY29uc3RydWN0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
                    className="card-img img_1 h-100 scale"
                    alt="card image"
                  />
                  <div className="card-img-overlay d-flex flex-column justify-content-between bg-transparent">
                    <div className="d-flex flex-column h-100 justify-content-between align-items-start">
                      {/* <div className="cta-2 text-black w-80">Fruit Mixed Dough</div> */}
                      {/* <Button variant="primary" className="btn-icon btn-icon-start mt-3 stretched-link">
                  <CsLineIcons icon="chevron-right" /> <span>View</span>
                </Button> */}
                    </div>
                  </div>
                </Card>
              </Col>
              <Col sm="6" lg="3">
                <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1681823803918-c449fa3e1f2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGNpdmlsJTIwY29uc3RydWN0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
                    className="card-img  img_1 h-100 scale"
                    alt="card image"
                  />
                  <div className="card-img-overlay d-flex flex-column justify-content-between bg-transparent">
                    <div className="d-flex flex-column h-100 justify-content-between align-items-start">
                      {/* <div className="cta-2 text-black w-80">Berries, Nuts and Sugar</div> */}
                      {/* <Button variant="primary" className="btn-icon btn-icon-start mt-3 stretched-link">
                  <CsLineIcons icon="chevron-right" /> <span>View</span>
                </Button> */}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </aside>
          {/* ADVERTISEMENT SLOT  END */}

          <Modal show={returnBoxModal} onHide={() => setReturnBoxModal(false)}>
            <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
              <Modal.Title>Return Policy</Modal.Title>
            </Modal.Header>
            <Modal.Body className="mx-2 my-2 px-2 py-2">
              <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.returnPolicy) }} />
              <div className="small font_color">
                <a href="/return_policy"> Detailed Return Policy </a>
              </div>
            </Modal.Body>
          </Modal>
          <Modal show={shippingBoxModal} onHide={() => setShippingBoxModal(false)}>
            <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
              <Modal.Title>Shipping Policy on Seller</Modal.Title>
            </Modal.Header>
            <Modal.Body className="mx-2 my-2 px-2 py-2">
              <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.shippingPolicy) }} />
              <div className="small font_color">
                <a href="/shipping_policy"> Detailed Shipping Policy </a>
              </div>
            </Modal.Body>
          </Modal>
          <Modal show={cancelBoxModal} onHide={() => setCancelBoxModal(false)}>
            <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
              <Modal.Title>Cancel Policy</Modal.Title>
            </Modal.Header>
            <Modal.Body className="mx-2 my-2 px-2 py-2">
              <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.cancellationPolicy) }} />
              <div className="small font_color">
                <a href="/privacy_policy"> Detailed Cancel Policy </a>
              </div>
            </Modal.Body>
          </Modal>
        </Row>
      </aside>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content) }} className="mb-3" />
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button className="btn-icon btn_color" onClick={() => setShow(false)}>
            <span>Close</span>
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default TMTDetail;
