import React, { useState, useEffect, useRef } from 'react';
import { gql, useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Truck, XOctagon, ArrowCounterclockwise } from 'react-bootstrap-icons';
import 'swiper/css';
import 'swiper/css/navigation';
import './style.css';
/* eslint-disable */
import { Navigation } from 'swiper';
import styled, { ThemeProvider } from 'styled-components';
import { toast } from 'react-toastify';
import { Row, Col, Button, Card, Form, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import 'react-image-lightbox/style.css';
import DOMPurify from 'dompurify';
import AddToCartSingle from './AddToCartSingle';
import Truncate from 'react-truncate-html';
import Rating from 'react-rating';
import { FacebookShareButton, FacebookIcon, WhatsappShareButton, WhatsappIcon } from 'react-share';
import moment from 'moment';
import DiscountBadge from '../home/DiscountBadge';
import PriceComponent from '../home/PriceComponent';
import ReactImageMagnify from 'react-image-magnify';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const GET_AD_CONTENT = gql`
  query GetAds($key: String!) {
    getAds(key: $key) {
      active
      images
      url
      key
    }
  }
`;

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

const GET_REVIEW_OF_PRODUCT = gql`
  query GetReviewByProduct($productId: ID) {
    getReviewByProduct(productId: $productId) {
      id
      productId
      images
      rating
      createdAt
      title
      createdAt
      description
      repliesSeller
      repliesSellerDate
      repliesAdmin
      repliesAdminDate
      user {
        firstName
        lastName
        profilepic
      }
    }
  }
`;

const GETPROUDCT_BY_CATEGORYID = gql`
  query GetProductByCatId($catId: ID!) {
    getProductByCatId(cat_id: $catId) {
      id
      images
      variant {
        location {
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
          b2cdiscount
          b2bdiscount
          finalPrice
        }
        variantName
        id
        moq
      }
      brand_name
      fullName
      identifier
      previewName
    }
  }
`;

const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      companyName
      mobileNo
      companyDescription
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

const theme = {
  colors: {
    heading: 'rgb(24 24 29)',
    text: 'rgba(29 ,29, 29, .8)',
    white: '#fff',
    black: ' #212529',
    helper: '#8490ff',
    bg: '#F6F8FA',
    footer_bg: '#0a1435',
    btn: 'rgb(98 84 243)',
    border: 'rgba(98, 84, 243, 0.5)',
    hr: '#ffffff',
    gradient: 'linear-gradient(0deg, rgb(132 144 255) 0%, rgb(98 189 252) 100%)',
    shadow: 'rgba(0, 0, 0, 0.35) 0px 2px 4px;',
    shadowSupport: ' rgba(0, 0, 0, 0.16) 0px 1px 4px',
  },
  media: {
    mobile: '600px',
    tab: '998px',
  },
};

const Wrapper = styled.section`
  display: grid;
  grid-template-columns: 2.5fr 7.5fr;
  gap: 1rem;

  .grid {
    flex-direction: row;
    justify-items: center;
    align-items: center;
    width: 100%;
    gap: 1rem;
    /* order: 2; */

    img {
      max-width: 100%;
      max-height: 100%;
      margin: 2px;
      background-size: cover;
      object-fit: contain;
      cursor: pointer;
      box-shadow: ${theme.colors.shadow};
    }
  }

  .main-screen {
    display: grid;
    place-items: center;
    order: 1;
    img {
      max-width: 100%;
      height: auto;
      box-shadow: ${theme.colors.shadow};
    }
  }

  .grid-four-column {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
  }

  @media (max-width: ${theme.media.mobile}) {
    .grid-four-column {
      display: none;
    }
    .main-screen {
      display: none;
    }
  }
`;

const SingleDetail = ({ product }) => {
  const title = product?.fullName;
  const description = product?.fullName || ' Brand: ' || product?.brand_name;
  const keyword = product?.fullName || ' Brand: ' || product?.brand_name;
  const history = useHistory();
  const shareURL = window.location.href;
  const { dataStoreFeatures1 } = useGlobleContext();
  const [selectedId, setSelectedId] = useState(0);
  const [getproductDetailsPageSlider, { data: productDetailsPageSlider }] = useLazyQuery(GET_AD_CONTENT);

  useEffect(() => {
    getproductDetailsPageSlider({
      variables: {
        key: 'productDetailsPageSlider',
      },
    });
  }, [getproductDetailsPageSlider]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const [pincode, setPincode] = useState(null);
  const [available, setAvailable] = useState('');
  const [click, setClick] = useState(false);
  const [featureBoxModal, setFeatureBoxModal] = useState(false);
  const [shippingBoxModal, setShippingBoxModal] = useState(false);
  const [returnBoxModal, setReturnBoxModal] = useState(false);
  const [cancelBoxModal, setCancelBoxModal] = useState(false);
  let discountPrice = 0;
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const videoSectionRef = useRef(null);
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

  const DisplayBox = () => {
    return (
      <div className="d-inline hover-container small" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <sup>
          {' '}
          <CsLineIcons icon="info-hexagon" width={15} height={15} />
        </sup>
        <div className={`hover-section ${isHovered ? 'show' : ''}`}>
          <Card className="mx-2 my-2 px-0 py-0 border rounded">
            <Card.Body className="mx-2 my-2 px-0 py-0">
              <div>
                <span className="d-inline" style={{ color: 'black', fontWeight: 'bold' }}>
                  {priceType} :{' '}
                </span>{' '}
                <b className="float-end">₹ {enteredPrice} </b>
              </div>
              <div>
                <span className="d-inline" style={{ color: 'black', fontWeight: 'bold' }}>
                  {extraChargeType}:{' '}
                </span>{' '}
                <b className="float-end"> ₹ {extraCharge}</b>
              </div>
              <div className="border-top pt-1 mt-1">
                <span className="d-inline" style={{ color: 'black', fontWeight: 'bold' }}>
                  {finalPrice} :{' '}
                </span>{' '}
                <b className="float-end"> ₹ {price}</b>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    );
  };

  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const [variantIndex, setVariantIndex] = useState(product?.variant.findIndex((item) => item.active === true));
  const [lowestPrice, setLowestPrice] = useState(Math.min(...product?.variant[variantIndex].location.map((item) => item.price)));
  const [indexOfLowestPrice, setIndexOfLowestPrice] = useState(product?.variant[variantIndex].location.findIndex((item) => item.price === lowestPrice));
  const [location, setLocation] = useState(indexOfLowestPrice);
  const [b2bDiscount, setB2BDiscount] = useState(
    currentUser?.role?.some((role) => role === 'b2b')
      ? product?.variant[variantIndex]?.location[location]?.b2bdiscount
      : product?.variant[variantIndex]?.location[location]?.b2cdiscount
  );
  const [priceType, setPriceType] = useState(product?.variant[variantIndex]?.location[location]?.priceType);
  const [finalPrice, setFinalPrice] = useState(product?.variant[variantIndex]?.location[location]?.finalPrice);
  const [unitType, setUnitType] = useState(product?.variant[variantIndex]?.location[location]?.unitType);
  const [gstRate, setGstRate] = useState(product?.variant[variantIndex]?.location[location]?.gstRate);
  const [extraChargeType, setExtraChargeType] = useState(product?.variant[variantIndex]?.location[location]?.extraChargeType);
  const [extraCharge, setExtraCharge] = useState(product?.variant[variantIndex]?.location[location]?.extraCharge);
  const [transportChargeType, setTransportChargeType] = useState(product?.variant[variantIndex]?.location[location]?.transportChargeType);
  const [transportCharge, setTransportCharge] = useState(product?.variant[variantIndex]?.location[location]?.transportCharge);
  const [enteredPrice, setEnteredPrice] = useState(product?.variant[variantIndex]?.location[location]?.price);
  const totalPrice = extraCharge + lowestPrice;
  const [price, setPrice] = useState(totalPrice);
  const gst = product?.variant[variantIndex]?.location[location]?.gstType;
  const [tempVarName, setTempVarName] = useState(product?.variant[variantIndex]?.variantName);
  const [sellerId, setSellerId] = useState(product?.variant[variantIndex]?.location[location]?.sellerId);
  const oos = product?.variant[variantIndex]?.location[location]?.mainStock < product?.variant[variantIndex]?.moq ? true : false;
  const changeColor = (id) => {
    setSelectedId(id);
  };

  useEffect(() => {
    if (product?.variant[variantIndex]?.allPincode) {
      setAvailable('Available');
    }
  }, [location, variantIndex]);
  const variantSelected = async (e, i) => {
    const tempLow = Math.min(...product?.variant[i]?.location.map((item) => item?.price));
    setLowestPrice(tempLow);
    const tempIndex = product?.variant[i]?.location?.findIndex((item) => item?.price === tempLow);
    setIndexOfLowestPrice(tempIndex);
    setPincode('');
    setAvailable('');
    setLocation(tempIndex);
    setVariantIndex(i);
    setTempVarName(product?.variant[i]?.variantName);
    setPrice(product?.variant[i]?.location[tempIndex]?.price + product?.variant[i]?.location[tempIndex]?.extraCharge);
    setPriceType(product?.variant[i]?.location[tempIndex]?.priceType);
    setUnitType(product?.variant[i]?.location[tempIndex]?.unitType);
    setFinalPrice(product?.variant[i]?.location[tempIndex]?.finalPrice);
    setGstRate(product?.variant[i]?.location[tempIndex]?.gstRate);
    setExtraCharge(product?.variant[i].location[tempIndex]?.extraCharge);
    setTransportCharge(product?.variant[i]?.location[tempIndex]?.transportCharge);
    setEnteredPrice(product?.variant[i]?.location[tempIndex]?.price);
    setExtraChargeType(product?.variant[i]?.location[tempIndex]?.extraChargeType);
    setTransportChargeType(product?.variant[i]?.location[tempIndex]?.transportChargeType);

    await setB2BDiscount(
      currentUser?.role?.some((role) => role === 'b2b')
        ? product?.variant[i]?.location[tempIndex]?.b2bdiscount
        : product?.variant[i]?.location[tempIndex]?.b2cdiscount
    );
  };

  const checkPinCode = product?.variant[variantIndex]?.location?.some((pin, i) => pin?.pincode?.find((pinS) => pinS === pincode));
  const updatedLocation = product?.variant[variantIndex]?.location?.find((pin) => pin?.pincode?.find((pinc) => pinc === pincode));
  const IndexOfUpdatedLocation = product?.variant[variantIndex]?.location?.findIndex((pin) => pin?.pincode?.find((pinc) => pinc === pincode));

  function Display() {
    if (pincode) {
      if (checkPinCode) {
        setAvailable('Available');
        setLocation(IndexOfUpdatedLocation);
        setExtraChargeType(updatedLocation.extraChargeType);
        setPrice(updatedLocation.price + updatedLocation.extraCharge);
        setPriceType(updatedLocation.priceType);
        setFinalPrice(updatedLocation.finalPrice);
        setUnitType(updatedLocation.unitType);
        setGstRate(updatedLocation.gstRate);
        setExtraCharge(updatedLocation.extraCharge);
        setTransportCharge(updatedLocation.transportCharge);
        setTransportChargeType(updatedLocation.transportChargeType);
        setEnteredPrice(updatedLocation.price);
        setB2BDiscount(currentUser?.role?.some((role) => role === 'b2b') ? updatedLocation.b2bdiscount : updatedLocation.b2cdiscount);
      } else {
        setAvailable('Not Available');
      }
    } else {
      setAvailable('Please Enter the Pincode!');
    }
  }

  const [wish, setWish] = useState(false);

  function handleBulkEnquiry(productname) {
    history.push(`/bulk/${productname}`);
  }

  const [checkDuplicacy, resultDuplicacy] = useLazyQuery(CHECK_WISHLIST_DUPLICACY, {
    onCompleted: (resultDup) => {
      // console.log('resultDup', resultDup);
    },
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
      // console.log('No user ID');
    }
  } else {
    // console.log('Product and resultDuplicacy.data is not yet received');
  }
  useEffect(() => {
    setWish(idea);
  }, [idea]);

  const [createWishlist] = useMutation(CREATE_WISHLIST, {
    onCompleted: () => {
      toast.success('Product have been added to wishlist');
    },
    onError: (err) => {
      toast('Already added in Wishlist' || 'Something went wrong!');
    },
  });

  const changeButton = () => {
    return (
      <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip-top">Product already in Wishlist</Tooltip>}>
        <Button variant="primary" className="btn-icon btn-icon-end mx-1 mb-1">
          <span>
            Wishlist <CsLineIcons icon="check" />{' '}
          </span>
        </Button>
      </OverlayTrigger>
    );
  };

  const handleWishlist = async (event) => {
    await createWishlist({
      variables: {
        productId: event,
      },
    });
    await setClick(true);
    changeButton();
  };

  const [mainImage, setMainImage] = useState('');
  const len = product?.categories?.length;
  const catIndex = Math.floor(Math.random() * len);
  const { data: dataCat } = useQuery(GETPROUDCT_BY_CATEGORYID, {
    variables: {
      catId: product?.categories[catIndex],
    },
  });

  const [selected, setSelected] = useState('');

  function ReadMore(event) {
    setSelected(event);
  }

  function handleDownload() {
    if (product?.catalogue) {
      const downloadLink = product?.catalogue;
      window.open(downloadLink, '_blank');
    }
  }

  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: {
        key: 'checkOutMessage',
      },
    });
  }, [dataSiteContent, getContent]);

  const [show, setShow] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAnotherModalVisible, setAnotherModalVisible] = useState(false);
  const closeModal = () => setModalVisible(false);
  const openModal = () => setModalVisible(true);
  const closeAnotherModal = () => {
    setAnotherModalVisible(false);
    setErrorMessage('');
  };
  const openAnotherModal = () => setAnotherModalVisible(true);
  const [mobile, setMobile] = useState('');
  const [productName, setProductName] = useState(product?.fullName || '');
  const [errorMessage, setErrorMessage] = useState('');

  const preCheckout = () => {
    if (transportChargeType === 'Shipping Charge') {
      setShow(true);
    }
  };

  function handleSendEnquiry() {
    history.push(`/send/${product?.fullName}`);
  }

  const [getSellerDetail, { data: sellerDetail }] = useLazyQuery(GET_SELLER);
  useEffect(() => {
    if (sellerId) {
      getSellerDetail({
        variables: { getSellerId: sellerId },
      });
    }
  }, [sellerId]);

  const handleSendEnquiryWhatsApp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      const message = `Hello, I am interested in the product: ${productName}. Please provide more details.`;
      const encodedMessage = encodeURIComponent(message);
      const phoneNumber = sellerId.mobileNo;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const url = isMobile
        ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`
        : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

      window.open(url, '_blank');
    } catch (error) {
      console.error('Error sending enquiry:', error);
      setErrorMessage('Failed to send enquiry. Please try again.');
    }
  };

  const reviewDetailRef = useRef(null);
  const scrollToReviewDetail = () => {
    if (reviewDetailRef.current) {
      reviewDetailRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [getReview, { data: dataReview }] = useLazyQuery(GET_REVIEW_OF_PRODUCT);
  const [averageRating, setAverageRating] = useState(null);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  useEffect(() => {
    if (product?.id) {
      getReview({
        variables: {
          productId: product?.id,
        },
      });
    }
  }, [product]);

  useEffect(() => {
    if (dataReview?.getReviewByProduct?.length > 0) {
      const totalRating = dataReview.getReviewByProduct.reduce((acc, review) => acc + review.rating, 0);
      const avgRating = totalRating / dataReview.getReviewByProduct.length;
      setAverageRating(avgRating.toFixed(1));

      const distribution = dataReview.getReviewByProduct.reduce(
        (acc, review) => {
          if (review.rating >= 1 && review.rating <= 5) {
            acc[review.rating]++;
          }
          return acc;
        },
        { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      );

      setRatingDistribution(distribution);
    }
  }, [dataReview]);
  // const [category, setcategories] = useState([]);
  // const setCategory = useCallback(async (categorydetail) => {
  //   if (categorydetail) {
  //     setcategories([categorydetail.name]);
  //     if (categorydetail?.parent) {
  //       const { parent } = categorydetail;
  //       await setcategories((prev) => [parent.name, ...prev]);
  //       if (parent.parent) {
  //         await setcategories((prev) => [parent.parent.name, ...prev]);
  //         if (parent.parent.parent) {
  //           await setcategories((prev) => [parent.parent.parent.name, ...prev]);
  //         }
  //       }
  //     }
  //   }
  // }, []);

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
        {`
          .btn_color_border {
            clear: both; 
            border: 1px solid #dfdfdf;
            transition: background 0.3s ease;
            padding: 10px 30px;            
            cursor: pointer;            
          }
          .btn_color_border:hover {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: white;
          }
        `}
      </style>
      <div className="page-title-container">
        <Row className="g-0">
          <aside>
            <div className="container-fluid px-0 mb-2">
              {product && (
                <>
                  {productDetailsPageSlider && productDetailsPageSlider.getAds && (
                    <img src={productDetailsPageSlider.getAds.images} className="d-block w-100 rounded" alt={productDetailsPageSlider.getAds.key} />
                  )}
                </>
              )}
            </div>
          </aside>
          <div className="d-flex align-items-center mt-2 mb-sm-0" style={{ gap: '6px', whiteSpace: 'nowrap' }}>
            <button type="button" className="bg-transparent border-0 p-0 m-0 text-dark fw-bold" onClick={() => window.history.back()}>
              Back
            </button>
            <span className="small">/</span>
            <span
              className="fw-bold text_black text-truncate"
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </span>
          </div>
        </Row>
      </div>

      <Card className="mb-5 ">
        <div className="p-2">
          <Row className="g-5">
            {product?.images?.length > 0 && (
              <Col xxl="6" xl="6" lg="6" md="12" sm="12" xs="12">
                <Row className="g-2">
                  {/* Desktop Thumbnails */}
                  <Col lg="3" md="3" className="d-none d-md-block" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                    {product.images.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={product.fullName}
                        className={`p-1 mb-2 ${mainImage === img ? 'border border-primary' : 'border'} rounded`}
                        style={{
                          width: '70px', // 👈 thumbnail fixed width
                          height: '70px', // 👈 uniform square thumbs
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                        onClick={() => setMainImage(img)}
                      />
                    ))}
                  </Col>

                  {/* Main Image */}
                  <Col lg="9" md="9" sm="12" xs="12">
                    <div className="p-2 bg-white rounded">
                      <ReactImageMagnify
                        {...{
                          smallImage: {
                            alt: product.fullName,
                            isFluidWidth: true,
                            src: mainImage || product.images[0],
                          },
                          largeImage: {
                            src: mainImage || product.images[0],
                            width: 1600,
                            height: 1600,
                          },
                          isHintEnabled: true,
                          enlargedImagePosition: 'over',
                        }}
                      />
                    </div>
                  </Col>
                </Row>

                {/* Mobile Thumbnails Slider */}
                <div className="d-md-none mt-2">
                  <Swiper navigation modules={[Navigation]} slidesPerView={4} spaceBetween={10} className="rounded p-2 bg-white">
                    {product.images.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={img}
                          alt={product.fullName}
                          className={`img-fluid rounded p-1 ${mainImage === img ? 'border-dark' : ''}`}
                          style={{
                            objectFit: 'cover',
                            cursor: 'pointer',
                          }}
                          onClick={() => setMainImage(img)}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </Col>
            )}

            <Col xxl="6" xl="6" lg="6" md="12" sm="12" xs="12" className="d-flex flex-column justify-content-between">
              <div>
                {product && (
                  <>
                    <p className="mb-1 d-inline-block d-flex p-0 text_black">BRAND: {product?.brand_name}</p>
                    <h1 className="mb-2 fw-bold text_black fs-5">
                      {product?.fullName} {tempVarName}
                    </h1>
                  </>
                )}
                {averageRating && (
                  <div onClick={scrollToReviewDetail}>
                    <span className="fs-5 mx-3 ms-0 fw-bold text_black">{averageRating}</span>
                    <Rating
                      readonly
                      initialRating={averageRating}
                      emptySymbol={<i className="cs-star text-success" />}
                      fullSymbol={<i className="cs-star-full text-success" />}
                    />
                  </div>
                )}
                <Row className="mb-2 g-3">
                  <Col>
                    <div>
                      {price === 0 || !product.active ? (
                        <>
                          <Button onClick={() => handleSendEnquiry()} className="me-2 font-color my-1  btn_color p-2">
                            Send Enquiry
                          </Button>
                        </>
                      ) : (
                        <div>
                          {gst && b2bDiscount === 0 && (
                            <div>
                              <h5 className="fw-bold text_black fs-3 form-label">
                                {' '}
                                ₹ {(price / ((100 + gstRate) / 100)).toFixed(2)}
                                <p className="d-inline form-label fs-6 text-dark">
                                  {' '}
                                  {DisplayBox()} Per {unitType}
                                </p>
                              </h5>
                              {gst && (
                                <div className="ps-1 text_black">
                                  Price with {gstRate}% GST included: ₹ {price}
                                </div>
                              )}
                              {transportChargeType && transportChargeType === 'Shipping Charge' ? (
                                <>
                                  {' '}
                                  <Button onClick={() => preCheckout()} className="btn-white text-dark fw-bold mx-0 p-1">
                                    {transportChargeType} <CsLineIcons icon="info-hexagon" width="15" />
                                  </Button>{' '}
                                  <p className="d-inline text_black">Extra</p>{' '}
                                </>
                              ) : (
                                <div className="d-inline my-0 py-0 text_black">
                                  <>
                                    {transportChargeType && transportCharge > 0 ? (
                                      <p className="my-1 py-0 d-inline text_black">
                                        {' '}
                                        {transportChargeType} ₹{transportCharge}
                                      </p>
                                    ) : (
                                      <p className="d-inline text_black"> Free Delivery</p>
                                    )}{' '}
                                  </>
                                </div>
                              )}
                            </div>
                          )}
                          {!gst && b2bDiscount === 0 && (
                            <div>
                              <h5 className="fw-bold text_black d-inline fs-3 "> ₹ {price} </h5>
                              {DisplayBox()}
                              <p className="d-inline text_black"> Per {unitType}</p>
                              <p className="my-1 py-0 text_black">Inclusive of all taxes</p>
                              {transportChargeType && transportChargeType === 'Shipping Charge' ? (
                                <>
                                  {' '}
                                  <Button onClick={() => preCheckout()} className="btn-white text-dark fw-bold mx-0 p-1">
                                    {transportChargeType} <CsLineIcons icon="info-hexagon" width="15" />
                                  </Button>{' '}
                                  <p className="d-inline text_black">Extra</p>{' '}
                                </>
                              ) : (
                                <div className="d-inline my-0 py-0 text_black">
                                  <>
                                    {transportChargeType && transportCharge > 0 ? (
                                      <p className="my-1 py-0 d-inline">
                                        {' '}
                                        {transportChargeType} ₹{transportCharge}{' '}
                                      </p>
                                    ) : (
                                      <p className="d-inline"> Free Delivery</p>
                                    )}{' '}
                                  </>
                                </div>
                              )}
                            </div>
                          )}
                          {gst && b2bDiscount !== 0 && (
                            <div>
                              <h5 className="d-inline text_black fs-3 fw-bold form-label">
                                <sup className="fs-6"> ₹ </sup>
                                {(((100 - b2bDiscount) * (price / ((100 + gstRate) / 100))) / 100).toFixed(2)}{' '}
                              </h5>
                              <div className="d-inline text_black">
                                <del> ₹ {(price / ((100 + gstRate) / 100)).toFixed(2)}</del>
                                <p className="small d-inline">
                                  {' '}
                                  {DisplayBox()} Per {unitType}{' '}
                                </p>
                                <p className="d-inline fw-bold text-success "> {b2bDiscount}% off </p>
                              </div>
                              <div className="m-1 text_black">
                                {gst && (
                                  <div className="m-0 p-0">
                                    Price with {gstRate}% GST Included : ₹ {(((100 - b2bDiscount) * price) / 100).toFixed(2)}
                                  </div>
                                )}
                              </div>
                              {transportChargeType && transportChargeType === 'Shipping Charge' ? (
                                <>
                                  {' '}
                                  <Button onClick={() => preCheckout()} className="btn-white text-dark fw-bold mx-0 p-1">
                                    {transportChargeType} <CsLineIcons icon="info-hexagon" width="15" />
                                  </Button>{' '}
                                  <p className="d-inline">Extra</p>{' '}
                                </>
                              ) : (
                                <div className="d-inline my-0 py-0 text_black">
                                  <>
                                    {transportChargeType && transportCharge > 0 ? (
                                      <p className="my-1 py-0 d-inline">
                                        {' '}
                                        {transportChargeType} ₹{transportCharge}{' '}
                                      </p>
                                    ) : (
                                      <p className="d-inline"> Free Delivery</p>
                                    )}{' '}
                                  </>
                                </div>
                              )}
                            </div>
                          )}
                          {!gst && b2bDiscount !== 0 && (
                            <div>
                              <h5 className="d-inline text_black fs-3 fw-bold form-label">
                                <sup className="fs-6"> ₹ </sup> {(((100 - b2bDiscount) * price) / 100).toFixed(2)}{' '}
                              </h5>
                              <div className="d-inline text_black">
                                <del> ₹ {price.toFixed(2)}</del>
                                <div className="d-inline text_black">
                                  {' '}
                                  {DisplayBox()} Per {unitType}{' '}
                                </div>
                                <p className="d-inline fw-bold text-success "> {b2bDiscount}% off </p>
                              </div>
                              <div className="my-2">
                                {transportChargeType && transportChargeType === 'Shipping Charge' ? (
                                  <>
                                    {' '}
                                    <Button onClick={() => preCheckout()} className="btn-white text-dark fw-bold mx-0 p-1">
                                      {transportChargeType} <CsLineIcons icon="info-hexagon" width="15" />
                                    </Button>{' '}
                                    <p className="d-inline">Extra</p>{' '}
                                  </>
                                ) : (
                                  <div className="d-inline my-0 py-0 text_black">
                                    <>
                                      {transportChargeType && transportCharge > 0 ? (
                                        <p className="my-1 py-0 d-inline">
                                          {' '}
                                          {transportChargeType} ₹{transportCharge}{' '}
                                        </p>
                                      ) : (
                                        <p className="d-inline"> Free Delivery</p>
                                      )}{' '}
                                    </>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {product?.variant?.length > 1 &&
                        !(price === 0) &&
                        product?.variant?.map(
                          (variant, index) =>
                            variant.active && (
                              <div key={index} className="d-inline">
                                <Button
                                  onClick={() => {
                                    variantSelected(variant?.id, index), changeColor(index);
                                  }}
                                  variant={selectedId === index ? '' : ''}
                                  className={`my-2 me-2 ${selectedId === index ? 'btn_color' : 'btn_color_border text-dark'}`}
                                >
                                  {variant?.variantName}
                                </Button>
                              </div>
                            )
                        )}
                    </div>
                  </Col>
                </Row>
                {!product?.variant[variantIndex]?.allPincode && !(price === 0) && (
                  <Row>
                    <Col xs={10} md={6} className="d-flex flex-wrap align-items-center  bg-white">
                      <div className="flex-grow-1">
                        <Form.Control
                          className="mb-2"
                          type="text"
                          maxLength={6}
                          value={pincode || ''}
                          placeholder="Enter Delivery Pincode"
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, '');
                            const pincodeValue = parseInt(numericValue, 10);
                            setPincode(pincodeValue);
                          }}
                        />
                      </div>
                      <div>
                        <Button className="mb-2 btn_color" onClick={() => Display()}>
                          Check
                        </Button>
                      </div>
                    </Col>

                    {product?.variant[variantIndex]?.active && !product?.variant[variantIndex]?.allPincode && !oos && !(price === 0) && product.active && (
                      <div className="pb-2">
                        <span className="text-success">{available === 'Available' ? `This product is available in your pincode.` : ''}</span>
                        <span className="text-danger">{available === 'Not Available' ? `Sorry, this product is not available in your pincode.` : ''}</span>
                      </div>
                    )}
                  </Row>
                )}
                <Row className="mx-0">
                  {oos && !(price === 0) && <div className="fw-bold rounded ps-0 text-danger mb-2">Out of Stock</div>}
                  {!oos && !(price === 0) && product.active && (
                    <AddToCartSingle
                      moq={product?.variant[variantIndex]?.moq}
                      productID={product?.id}
                      variantID={product?.variant[variantIndex]?.id}
                      locationID={product?.variant[variantIndex]?.location[location]?.id}
                      available={available}
                      gstRate={gstRate}
                      enteredPrice={enteredPrice}
                      extraCharge={extraCharge}
                      unitType={unitType}
                      extraChargeType={extraChargeType}
                      transportCharge={transportCharge}
                      transportChargeType={transportChargeType}
                      b2bDiscount={b2bDiscount}
                      minimumQty={product?.variant[variantIndex]?.minimunQty}
                      displayStock={product?.variant[variantIndex]?.location[location]?.displayStock}
                      mainStock={product?.variant[variantIndex]?.location[location]?.mainStock}
                    />
                  )}

                  {/* <Col className="mt-4 px-0" sm="12" lg="4" md="4">
                    {' '}
                    {!wish && !click && (
                      <Button variant="outline-primary" className="btn-icon btn-icon-end mx-1 mb-1" onClick={() => handleWishlist(product.id)}>
                        <span>
                          <CsLineIcons icon="heart" />
                        </span>
                      </Button>
                    )}
                    {click && changeButton()}{' '}
                    {wish && (
                      <Button variant="primary" className="btn-icon btn-icon-end mx-1 mb-1">
                        <span>
                          Wishlist <CsLineIcons icon="check" />{' '}
                        </span>
                      </Button>
                    )}
                  </Col> */}
                </Row>

                {product?.variant?.[variantIndex]?.silent_features &&
                  product.variant[variantIndex].silent_features.trim() !== '' &&
                  product.variant[variantIndex].silent_features.trim() !== '<p><br></p>' && (
                    <div
                      className="my-1 mb-2 py-2 px-2 border rounded text_black"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(product.variant[variantIndex].silent_features.replace(/<\/?p>/g, '<div>').replace(/<\/p>/g, '</div>')),
                      }}
                    />
                  )}

                {price === 0 || !product.active ? null : (
                  <div className="d-inline ms-0 ps-0 mt-2 justify-content-between">
                    <Button onClick={() => setShippingBoxModal(true)} className="px-2 border font_color" variant="link">
                      <span>
                        <Truck size={20} className="mb-2 px-0 font_color" />
                      </span>
                      <div className="small font_color">Shipping Policy</div>
                    </Button>
                    <Button onClick={() => setCancelBoxModal(true)} className="px-2 m-1 border " variant="link">
                      <span>
                        <XOctagon size={20} className="mb-2 px-0 font_color" />
                      </span>
                      <div className="small font_color">Cancel Policy</div>
                    </Button>
                    <Button onClick={() => setReturnBoxModal(true)} className="px-2 border" variant="link">
                      <span>
                        <ArrowCounterclockwise size={20} className="mb-2 px-0 font_color" />
                      </span>
                      <div className="small font_color">Return Policy</div>
                    </Button>
                  </div>
                )}
                <>
                  {product?.variant[0]?.location[0]?.sellerId?.companyName && (
                    <div className="my-1 py-0 mb-2">
                      Sold by:{' '}
                      <Button variant="link" className="p-0" as={NavLink} to={`/SellerReview/${product?.variant[0]?.location[0]?.sellerId?.id}`}>
                        {dataStoreFeatures1?.getStoreFeature?.sellerMasking
                          ? product?.variant[0]?.location[0]?.sellerId?.id
                          : product?.variant[0]?.location[0]?.sellerId?.companyName}{' '}
                        <Rating
                          readonly
                          initialRating={product?.variant[0]?.location[0]?.sellerId?.overallrating}
                          emptySymbol={<i className="cs-star text-success" style={{ fontSize: '12px' }} />}
                          fullSymbol={<i className="cs-star-full text-success" style={{ fontSize: '12px' }} />}
                        />
                      </Button>
                      {/* ⭐ Rating Stars */}
                    </div>
                  )}
                </>
                {price === 0 || !product.active ? (
                  product?.variant[0]?.location[0]?.sellerId?.companyName && (
                    <div>
                      <Button onClick={openAnotherModal} className="me-2 font-color my-1 btn_color p-2">
                        Chat on WhatsApp
                      </Button>
                    </div>
                  )
                ) : (
                  <Button className="me-2 font-color my-1 btn_color p-2" onClick={() => handleBulkEnquiry(product?.fullName)}>
                    Bulk Enquiry
                  </Button>
                )}
                <div className="my-1 py-0 mb-2">
                  <div className="w-100">
                    <p className="d-inline fw-bold form-label text_black"> Share on</p>
                  </div>
                  <FacebookShareButton url={shareURL} quote="Dummy text!" hashtag="#muo">
                    <FacebookIcon className="me-2 border p-1 rounded" size={32} round />
                  </FacebookShareButton>
                  <WhatsappShareButton url={shareURL} quote="Dummy text!" hashtag="#muo">
                    <WhatsappIcon className="me-2 border p-1 rounded" size={32} round />
                  </WhatsappShareButton>
                </div>
                {product?.catalogue && (
                  <div>
                    <Button variant="link" className="mx-0 px-0 my-1 py-0 " onClick={() => handleDownload()}>
                      <span className="fw-bold">
                        {' '}
                        Product Catalogue <CsLineIcons icon="download" className="mx-2 font_color" size="17" />{' '}
                      </span>
                    </Button>
                  </div>
                )}
                {product?.youtubeLink && (
                  <div>
                    <Button variant="link" className="mx-0 px-0 my-1 py-0 " onClick={handleScrollToVideoSection}>
                      <span className="fw-bold">
                        YouTube Videos
                        <CsLineIcons icon="youtube" className="mx-2 font_color ms-5" size="17" />
                      </span>
                    </Button>
                  </div>
                )}
                {product?.giftOffer && (
                  <div className="my-2 py-0 mt-3">
                    <b className="fw-bold border rounded p-2 ">{product?.giftOffer}</b>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </Card>
      <Row>
        <Col xl="12" className="mb-0">
          {product?.description && <div className="text-center fw-bold py-1 bg_color text-white pt-2 pb-2 rounded"> Product Details</div>}
          {product && (
            <Card className="mb-2">
              <div className="p-3">
                {!(selected === product?.id) && (
                  <div className="d-inline">
                    <Truncate lines={4} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.description.replace(/<br>/g, '')) }} />
                    <Button className="d-inline mx-0 my-0 px-3 p-2 bg_color" onClick={() => ReadMore(product?.id)}>
                      View More <CsLineIcons icon="chevron-bottom" />
                    </Button>
                  </div>
                )}
                {selected === product?.id && (
                  <div className="d-inline">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.description.replace(/<br>/g, '')) }} className="mb-3" />
                    <Button className="d-inline mx-0 my-0 px-3 p-2 bg_color" onClick={() => ReadMore(0)}>
                      View Less
                      <CsLineIcons icon="chevron-top" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </Col>
      </Row>
      <Row>
        <Col xl="12">
          {product?.youtubeLink && (
            <Card className="mx-0 px-0 pb-2 justify-content-center" ref={videoSectionRef}>
              <iframe height="315" className="sw-auto rounded" src={`${product?.youtubeLink}?&mute=1`}></iframe>
            </Card>
          )}
          {product?.video && (
            <>
              <video className="sw-auto pb-2" width="100%" controls>
                <source src={product?.video} type="video/mp4" />
                <source src={product?.video} type="video/ogg" />
                Your browser does not support the video tag.
              </video>
            </>
          )}
        </Col>
      </Row>
      {/* FAQ ----- Start */}
      {product?.faq?.length > 0 && <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded"> Frequently Asked Questions</div>}
      {/* {product?.faq?.length > 0 && (
        <Card className="mb-3 pt-2 pb-2">
          {product?.faq?.map((faq, index) => (
            <div key={index} className="ms-4 mt-2">
              <Row className="g-0 mb-2">
                <Col xs="auto">
                  <p className="sw-2 mb-2 fw-bold">{index + 1}.</p>
                </Col>
                <Col>
                  <p className="ps-3 mb-2 fw-bold">{faq?.question}</p>
                  <p className="text-body ps-3 mb-0">{faq?.answer}</p>
                </Col>
              </Row>
            </div>
          ))}
        </Card>
      )} */}
      {product?.faq?.filter((faq) => faq.question).length > 0 && (
        <Card className="mb-3 pt-2 pb-2">
          {product?.faq
            ?.filter((faq) => faq.question)
            .map((faq, index) => (
              <div key={index} className="ms-4 mt-2">
                <Row className="g-0 mb-2">
                  <Col xs="auto">
                    <p className="sw-2 mb-2 fw-bold">{index + 1}.</p>
                  </Col>
                  <Col>
                    <p className="ps-3 mb-2 fw-bold">{faq.question}</p>
                    <p className="text-body ps-3 mb-0">{faq.answer}</p>
                  </Col>
                </Row>
              </div>
            ))}
        </Card>
      )}

      {/* FAQ ----- End */}
      {/* Customer reviews ---- Start */}
      {dataReview?.getReviewByProduct?.length > 0 && (
        <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded" ref={reviewDetailRef}>
          {' '}
          Customer Reviews
        </div>
      )}

      {dataReview?.getReviewByProduct?.length > 0 && (
        <div className="container my-2">
          <div className="row">
            <div className="col-md-5">
              <div className="border rounded bg-white">
                <Card.Body>
                  {averageRating && (
                    <div className="text-center mb-3">
                      <h5 className="fw-bold fs-5">Ratings & Reviews</h5>
                      <div className="mb-3">
                        <Rating
                          readonly
                          initialRating={averageRating}
                          emptySymbol={<i className="cs-star font_color" />}
                          fullSymbol={<i className="cs-star-full font_color" />}
                        />
                        <span className="fs-5 ps-2 fw-bold">{averageRating} / 5</span>
                      </div>
                      {Object.keys(ratingDistribution)
                        .reverse()
                        .map((rating) => (
                          <div key={rating} className="d-flex align-items-center mb-2">
                            <span className="me-2">{rating} Star</span>
                            <div className="progress flex-grow-1" style={{ height: '8px' }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${(ratingDistribution[rating] / dataReview.getReviewByProduct.length) * 100}%` }}
                                aria-valuenow={ratingDistribution[rating]}
                                aria-valuemin="0"
                                aria-valuemax={dataReview.getReviewByProduct.length}
                              ></div>
                            </div>
                            <span className="ms-2">{ratingDistribution[rating]}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </Card.Body>
              </div>
            </div>
            <div className="col-md-7">
              {dataReview?.getReviewByProduct
                ?.slice()
                .reverse()
                .map((review) => (
                  <div className="card shadow-sm mb-3 border-0 rounded-3">
                    <div className="card-body p-3">
                      {/* User Profile Row */}
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src={review?.user?.profilepic || '/img/profile/profile-11.webp'}
                          alt="dp"
                          className="rounded-circle me-3"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />

                        <div>
                          <div className="mb-0 fw-bold">
                            {review?.user?.firstName} {review?.user?.lastName}
                          </div>
                          <small className="text-muted">{moment(parseInt(review.createdAt)).format('DD-MMM-YYYY')}</small>
                        </div>
                      </div>

                      {/* Rating + Title */}
                      <div className="d-flex align-items-center mb-2">
                        {review?.rating > 0 && (
                          <Rating
                            readonly
                            initialRating={review?.rating}
                            emptySymbol={<i className="cs-star" />}
                            fullSymbol={<i className="cs-star-full text-success" />}
                          />
                        )}
                        <h5 className="fw-bolder ps-2 mt-1">{review?.title}</h5>
                      </div>

                      {/* Review Images */}
                      {review?.images?.length > 0 && (
                        <div className="d-flex overflow-auto mb-2" style={{ gap: '10px' }}>
                          {review?.images.map((img1, index) => (
                            <img key={index} src={img1} alt="review" className="rounded" style={{ width: '110px', height: '110px', objectFit: 'cover' }} />
                          ))}
                        </div>
                      )}

                      {/* Description */}
                      <p className="mb-2">{review?.description}</p>

                      {/* Seller Reply */}
                      {review?.repliesSeller?.trim() && (
                        <div className="alert alert-primary py-2 mb-2">
                          <strong>Seller Response:</strong> {review.repliesSeller}
                        </div>
                      )}

                      {/* Admin Reply */}
                      {review?.repliesAdmin?.trim() && (
                        <div className="alert alert-info py-2 mb-0">
                          <strong>{dataStoreFeatures1?.getStoreFeature?.storeName}:</strong> {review.repliesAdmin}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      {/* Customer reviews ---- End */}
      {dataCat?.getProductByCatId?.length > 1 && <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded"> Similar Products</div>}
      <Row className="g-2 mt-0 row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-3 row-cols-xl-6 p-2 bg-white rounded shadow-sm">
        {dataCat &&
          dataCat?.getProductByCatId
            ?.filter((item) => item?.id !== product?.id)
            .slice(0, 18)
            .map((item) => (
              <Col key={item?.id}>
                <Card className="h-100 border shadow-sm position-relative hover-shadow">
                  <DiscountBadge variant={item?.variant[0]} name={item?.previewName} />
                  <div className="ratio ratio-1x1">
                    <img
                      src={item?.thumbnail || (item?.images && item?.images[0])}
                      alt={item?.previewName}
                      className="img-fluid rounded-top object-fit-cover p-2"
                    />
                  </div>
                  <Card.Body className="text-center p-2 border-top">
                    <div className="text-truncate fw-bold" title={item?.brand_name}>
                      {item?.brand_name}
                    </div>
                    <OverlayTrigger delay={{ show: 700, hide: 100 }} placement="top" overlay={<Tooltip id={`tooltip-${item?.id}`}>{item?.fullName}</Tooltip>}>
                      <NavLink
                        to={`/product/${item?.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                        className="stretched-link fw-bold fw-semibold text-dark text-decoration-none d-block text-truncate mt-1"
                        style={{ fontSize: '0.95rem' }}
                      >
                        {item?.previewName}
                      </NavLink>
                    </OverlayTrigger>
                    {item?.variant?.length > 0 && (
                      <div className="mt-1 fw-bold text-success fw-semibold text-truncate">
                        <PriceComponent variant={item?.variant[0]} name={item?.previewName} />
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
      </Row>

      <Modal show={featureBoxModal} onHide={() => setFeatureBoxModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">Salient Features</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.variant[variantIndex]?.silent_features) }} />
        </Modal.Body>
      </Modal>
      <Modal show={returnBoxModal} onHide={() => setReturnBoxModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">Return Policy on Seller</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.returnPolicy) }} />
          <div className="small">
            <a href="/return_policy" target="_blank" className="font_color">
              {' '}
              Detailed Return Policy on Website
            </a>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={shippingBoxModal} onHide={() => setShippingBoxModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">Shipping Policy on Seller</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.shippingPolicy) }} />
          <div className="small">
            <a href="/shipping_policy" target="_blank" className="font_color">
              {' '}
              Detailed Shipping Policy on Website
            </a>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={cancelBoxModal} onHide={() => setCancelBoxModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">Cancel Policy on Seller</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.cancellationPolicy) }} />
          <div className="small">
            <a href="/cancellation_policy" target="_blank" className="font_color">
              {' '}
              Detailed Cancel Policy on Website
            </a>
          </div>
        </Modal.Body>
      </Modal>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content) }} className="mb-3" />
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button className="btn-icon btn_color" onClick={() => setShow(false)}>
            <span>Close</span>
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={isModalVisible} onHide={closeModal}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">{product?.variant[0]?.location[0]?.sellerId?.companyName}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2 pb-4">{product?.variant[0]?.location[0]?.sellerId?.companyDescription}</Modal.Body>
      </Modal>
      <Modal show={isAnotherModalVisible} onHide={closeAnotherModal}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">Chat on WhatsApp</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2 pb-4">
          <Form.Control
            className="mb-2"
            type="text"
            maxLength={10}
            value={mobile || ''}
            placeholder="Enter your WhatsApp no."
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, '');
              setMobile(numericValue);
            }}
          />
          {errorMessage && <div className="text-danger mb-2">{errorMessage}</div>}
          <Button className="mb-2 btn_color" onClick={handleSendEnquiryWhatsApp}>
            Chat on WhatsApp
          </Button>
        </Modal.Body>
      </Modal>

      {/* Google code Start */}
      {/* <script type="application/ld+json">
      {
        "@context"= "https://schema.org/",
        "@type"= "Product",
        "name"= product?.fullName, tempVarName,
        "image"= product?.images,
        "description"= product?.description,
        "sku"= product?.fullName,
        "mpn"= price,
        "brand"= {
          "@type": "Brand",
          "name": product?.brand_name
        },
        "review"= {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": 4,
            "bestRating": 5
          },
          "author": {
            "@type": "Person",
            "name": "Fred Benson"
          }
        },
        "aggregateRating"= {
          "@type": "AggregateRating",
          "ratingValue": 4.4,
          "reviewCount": 89
        },
        "offers"= {
          "@type": "AggregateOffer",
          "offerCount": 5,
          "lowPrice": 119.99,
          "highPrice": 199.99,
          "priceCurrency": "INDIA"
        }
      }
    </script> */}
      {/* Google code End */}
    </>
  );
};

export default SingleDetail;
