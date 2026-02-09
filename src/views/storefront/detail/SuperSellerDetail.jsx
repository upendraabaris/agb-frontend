import React, { useState, useEffect, useRef } from 'react';
import { gql, useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { useSelector } from 'react-redux';
import { NavLink, useHistory } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Truck, XOctagon, ArrowCounterclockwise, InfoCircle } from 'react-bootstrap-icons';
import 'swiper/css';
import 'swiper/css/navigation';
import './style.css';
/* eslint-disable */
import { Navigation } from 'swiper';
import styled, { ThemeProvider } from 'styled-components';
import { toast } from 'react-toastify';
import { Row, Col, Button, Card, Accordion, Table, Form, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import 'react-image-lightbox/style.css';
import DOMPurify from 'dompurify';
import AddToCartSingle from './AddToCartSingle';
import AddToCartSuperSeller from './AddToCartSuperSeller';
import Truncate from 'react-truncate-html';
import Rating from 'react-rating';
import { FacebookShareButton, FacebookIcon, WhatsappShareButton, WhatsappIcon } from 'react-share';
import moment from 'moment';
import DiscountBadge from '../home/DiscountBadge';
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

const GET_SELLER = gql`
  query GetSeller($getSellerId: ID!) {
    getSeller(id: $getSellerId) {
      id
      companyName
      sellerMasking
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
  const [pincode, setPincode] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [getproductDetailsPageSlider, { data: productDetailsPageSlider }] = useLazyQuery(GET_AD_CONTENT);

  useEffect(() => {
    getproductDetailsPageSlider({
      variables: {
        key: 'productDetailsPageSlider',
      },
    });
  }, [getproductDetailsPageSlider]);

  const [companyNames, setCompanyNames] = useState({});
  const [sellerMasking, setSellerMasking] = useState({});
  const [getSeller] = useLazyQuery(GET_SELLER);
  const fetchCompanyName = async (superSellerId) => {
    try {
      const { data: responseData } = await getSeller({
        variables: { getSellerId: superSellerId },
      });
      if (responseData?.getSeller) {
        setCompanyNames((prev) => ({
          ...prev,
          [superSellerId]: responseData.getSeller.companyName,
        }));
      }
      if (responseData?.getSeller) {
        setSellerMasking((prev) => ({
          ...prev,
          sellerMasking: responseData.getSeller.sellerMasking,
        }));
      }
    } catch (error) {
      console.error('Error fetching company name:', error);
    }
  };

  useEffect(() => {
    if (product?.superSellerId) {
      fetchCompanyName(product.superSellerId);
    }
  }, [product]);

  const [shippingBoxModal, setShippingBoxModal] = useState(false);
  const [returnBoxModal, setReturnBoxModal] = useState(false);
  const [cancelBoxModal, setCancelBoxModal] = useState(false);
  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const [variantIndex, setVariantIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product?.supervariant[0]);
  const [b2bDiscount, setB2BDiscount] = useState(
    currentUser?.role?.some((role) => role === 'b2b') ? product?.supervariant[0]?.b2bdiscount : product?.supervariant[0]?.b2cdiscount
  );
  const locationData = selectedVariant?.superlocation?.filter((loc) => loc?.status) || [];
  const matchingLocation = locationData.find((loc) => loc.pincode.includes(+pincode));
  const [varinatID, setVarinatID] = useState(selectedVariant?.id);
  const [tempVarName, setTempVarName] = useState(selectedVariant?.variantName);
  const [price, setPrice] = useState(matchingLocation?.price);
  const [unitType, setUnitType] = useState(matchingLocation?.unitType);
  const [gstRate, setGstRate] = useState(matchingLocation?.gstRate);
  const [gstType, setGstType] = useState(matchingLocation?.gstType);
  const [extraCharge, setExtraCharge] = useState(matchingLocation?.extraCharge);
  const [extraChargeType, setExtraChargeType] = useState(matchingLocation?.extraChargeType);
  const [transportCharge, setTransportCharge] = useState(matchingLocation?.transportCharge);
  const [transportChargeType, setTransportChargeType] = useState(matchingLocation?.transportChargeType);

  const variantSelected = async (e, i) => {
    const selectedVariant = product?.supervariant[i];
    const locationData = selectedVariant?.superlocation?.filter((loc) => loc?.status) || [];
    const matchingLocation = locationData.find((loc) => loc.pincode.includes(+pincode));
    setSelectedVariant(selectedVariant);
    setVariantIndex(i);
    setTempVarName(selectedVariant?.variantName);
    setVarinatID(selectedVariant?.id);
    setPrice(matchingLocation?.price);
    setUnitType(matchingLocation?.unitType);
    setGstRate(matchingLocation?.gstRate);
    setGstType(matchingLocation?.gstType);
    setExtraCharge(matchingLocation?.extraCharge);
    setExtraChargeType(matchingLocation?.extraChargeType);
    setTransportCharge(matchingLocation?.transportCharge);
    setTransportChargeType(matchingLocation?.transportChargeType);

    await setB2BDiscount(currentUser?.role?.some((role) => role === 'b2b') ? matchingLocation?.b2bdiscount : matchingLocation?.b2cdiscount);
  };

  const [quantities, setQuantities] = useState({});
  const handleQtyChange = (index, value, variantName, discount, displayStock, discountedPrice, seller, variantID, locationId) => {
    setQuantities((prevQuantities) => {
      const updatedQuantities = {
        ...prevQuantities,
        [index]: {
          quantity: value,
          variantName,
          discount,
          displayStock,
          rateofvariant: parseFloat(parseFloat(discountedPrice).toFixed(2)),
          // seller,
          variantID,
          locationId,
          moq: 1,
          availability: 'Available',
        },
      };
      return updatedQuantities;
    });
  };

  const [mainImage, setMainImage] = useState('');
  const [selected, setSelected] = useState('');
  function ReadMore(event) {
    setSelected(event);
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
  const preCheckout = () => {
    if (transportChargeType === 'Shipping Charge') {
      setShow(true);
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showTable, setShowTable] = useState(false);
  const [error, setError] = useState(false);
  const [filteredSellers, setFilteredSellers] = useState([]);
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const [seconds, setSeconds] = useState(3);
  useEffect(() => {
    if (showTable && seconds > 0) {
      const timer = setTimeout(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (seconds === 0) {
      setIsModalOpen(false);
    }
  }, [showTable, seconds]);
  const handlePincodeChange = (e) => {
    let enteredPincode = e.target.value;
    enteredPincode = enteredPincode.replace(/\D/g, '');
    setPincode(enteredPincode);
    if (enteredPincode.length === 6) {
      const matchedSellers =
        selectedVariant?.superlocation
          ?.filter(
            (seller) =>
              seller.allPincode === true ||
              (seller.allPincode === false && seller.pincode && seller.pincode.map((pin) => String(pin).trim()).includes(String(enteredPincode).trim()))
          )
          .map((seller) => ({
            ...seller,
            allPincode: seller.allPincode,
          })) || [];
      if (matchedSellers.length > 0) {
        setFilteredSellers(matchedSellers);
        setShowTable(true);
        setError(false);
      } else {
        setFilteredSellers([]);
        setShowTable(false);
        setError(true);
      }
    } else {
      setShowTable(false);
      setError(false);
      setFilteredSellers([]);
    }
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
  const len = product?.categories?.length;
  const catIndex = Math.floor(Math.random() * len);
  const { data: dataCat } = useQuery(GET_TMT_PROUDCT_BY_CATEGORYID, {
    variables: {
      catId: product?.categories[catIndex],
    },
  });
  var avalseller = [];

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
        {`.text-dark {
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
          <Col className="col-auto mt-2 mb-sm-0 me-auto">
            <NavLink className="pb-1 d-inline-block hidden breadcrumb-back me-2" to="/">
              <span className=" ms-1 fw-bold text-dark">Home</span>
            </NavLink>
            <span className="me-1 small"> / </span>
            <span className=" ms-1 fw-bold text-dark">{title}</span>
          </Col>
        </Row>
      </div>

      <Card className="mb-5 ">
        <div className="p-2">
          <Row className="g-5">
            {product && product?.images && (
              <Col xxl="6" xl="6" lg="6" sm="12" md="12" xs="12">
                <Row className="mx-0 my-0 px-2 py-0">
                  <Col sm="2" md="2" lg="3" xxl="4" className="mx-0 my-0 px-0 py-0 thumbnail">
                    {product?.images?.map((curElm, index) => {
                      return (
                        <div key={index} className="mx-0 my-0 px-0 py-0 ">
                          <img
                            style={{ height: '80px', widht: '80px' }}
                            src={curElm}
                            alt={product?.fullName}
                            className="border rounded p-1 mb-1"
                            key={index}
                            onClick={() => setMainImage(curElm)}
                          />
                        </div>
                      );
                    })}
                  </Col>
                  <Col sm="6" md="7" lg="9" xxl="8" className="main-Image pb-1 pt-1 mx-0 my-0 px-1 py-0">
                    <ReactImageMagnify
                      {...{
                        smallImage: {
                          alt: product?.fullName,
                          isFluidWidth: true,
                          src: mainImage === '' ? product?.images[0] : mainImage,
                          sizes: '(max-width: 480px) 100vw, (max-width: 1200px) 30vw, 360px',
                        },
                        largeImage: {
                          src: mainImage === '' ? product?.images[0] : mainImage,
                          width: 1600,
                          height: 1600,
                        },
                        isHintEnabled: true,
                        enlargedImagePosition: 'over',
                      }}
                    />
                  </Col>
                </Row>
                <Swiper navigation modules={[Navigation]} className="mySwiper border rounded">
                  {product?.images?.map((image, index) => (
                    <SwiperSlide key={index}>
                      <ReactImageMagnify
                        {...{
                          smallImage: {
                            alt: product?.fullName,
                            isFluidWidth: true,
                            src: image,
                          },
                          largeImage: {
                            src: image,
                            width: 1200,
                            height: 1200,
                          },
                          isHintEnabled: true,
                          enlargedImagePosition: 'over',
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Col>
            )}
            <Col xxl="6" xl="6" lg="6" md="12" sm="12" xs="12" className="d-flex flex-column justify-content-between">
              <div>
                {product && (
                  <>
                    <p className="mb-1 d-inline-block d-flex p-0 text-dark fw-bold">BRAND: {product?.brand_name}</p>
                    <h1 className="mb-2 fw-bold text-dark fs-5">
                      {product?.fullName}
                      {/* {tempVarName} */}
                    </h1>
                  </>
                )}
                {/* {showTable && (
                  <Row className="g-3">
                    <Col>
                      <div>
                        <div className="text-dark fs-3">
                          <h6 className="fw-bold d-inline m-0">
                            <span style={{ fontSize: '14px', position: 'relative', top: '-2px' }}>₹</span>{' '}
                            {b2bDiscount > 1 ? (price - (price * b2bDiscount) / 100).toFixed(2) : price}
                          </h6>
                          {price > 1 && <del className="d-inline fs-6 ps-2 text-dark fw-bold">₹ {price}</del>}
                          <span className="d-inline fs-6 text-dark fw-bold small"> Per {unitType} </span>
                          {b2bDiscount > 1 && <div className="d-inline fs-6 text-dark text-success fw-bold">{b2bDiscount}% off</div>}
                        </div>
                        {gstType && (
                          <div className="ps-1 text-dark fw-bold">
                            Price with {gstRate}% GST included: ₹{' '}
                            {(b2bDiscount > 1 ? (price - (price * b2bDiscount) / 100) * (1 + gstRate / 100) : price * (1 + gstRate / 100)).toFixed(2)}
                          </div>
                        )}
                        {product?.supervariant?.length > 1 &&
                          product?.supervariant?.map((variant, index) => (
                            <div key={index} className="d-inline w-100">
                              <Button
                                onClick={() => variantSelected(variant?.id, index)}
                                className={`my-2 me-2 ${variantIndex === index ? 'btn_color' : 'btn_color_border text-dark'}`}
                              >
                                {variant?.variantName}
                              </Button>
                            </div>
                          ))}
                        {transportChargeType && (
                          <div className="my-0 py-0 text-dark w-100">
                            {transportChargeType === 'Shipping Charge' ? (
                              <>
                                <Button onClick={() => preCheckout()} className="btn-white text-dark fw-bold mx-0 p-1">
                                  {transportChargeType} Extra <CsLineIcons icon="info-hexagon" width="15" />
                                </Button>
                              </>
                            ) : (
                              <div className="d-inline text-dark fw-bold ps-1">
                                {transportCharge > 0 ? `${transportChargeType} ₹${transportCharge}` : 'Free Delivery'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                )} */}
                <div className="fw-bold text-dark ps-1 m-0 pb-1">Product Offered by: {companyNames[product.superSellerId]}</div>
                <div className="fw-bold text-dark ms-1 mt-0">
                  <div>
                    <div className="pb-2 text-dark fw-bold blink-text d-flex align-items-center">
                      Enter Delivery Pincode to check availability and to Show Price
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            To check the product price, it is necessary to enter your delivery pincode so that we can show you the accurate price specific to
                            your area and confirm delivery availability.
                          </Tooltip>
                        }
                        show={showTooltip}
                      >
                        <InfoCircle
                          className="ms-2 text-primary"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                          onClick={() => setShowTooltip(!showTooltip)}
                        />
                      </OverlayTrigger>
                    </div>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        className="form-control w-80 w-md-50"
                        placeholder="Enter Delivery Pincode"
                        maxLength="6"
                        value={pincode}
                        onChange={handlePincodeChange}
                      />
                    </div>
                    {showTable && (
                      <div className="d-flex align-items-center gap-2">
                        <div className="text-success pt-2 pb-2">
                          Delivery available at pincode: <span className="fw-bold"> {pincode} </span> 🚚{' '}
                        </div>
                      </div>
                    )}
                    {showTable && (
                      <Row className="g-3" ref={videoSectionRef}>
                        <Col>
                          <table className="table-responsive w-100 border">
                            <thead className="table-head mark">
                              <tr className="border align-top">
                                <th className="table-head border p-2">Item</th>
                                <th className="border text-center">Pre GST Price</th>
                                <th className="border text-center">Discount %</th>
                                <th className="border text-center">GST %</th>
                                <th className="border text-center">GST Paid Price</th>
                                <th className="border text-center">Enter Qty ({product?.supervariant[0]?.superlocation[0]?.unitType})</th>
                                <th className="border text-center">GST Paid Amount</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {product?.supervariant?.map((variant, index) => {
                                const locationData = variant?.superlocation?.filter((loc) => loc?.status) || [];
                                const matchingLocation = locationData.find((loc) => loc.pincode.includes(+pincode));
                                const { price, extraCharge, b2bdiscount, b2cdiscount, gstRate, id: superVariantID } = matchingLocation;
                                const basePrice = (price || 0) + (extraCharge || 0);
                                const discount = currentUser?.role?.includes('b2b') ? b2bdiscount : b2cdiscount;
                                const discountedPrice = discount > 0 ? (basePrice * (1 - discount / 100)).toFixed(2) : basePrice.toFixed(2);
                                const qty = quantities[index]?.quantity || 0;
                                const totalPrice = (discountedPrice * qty).toFixed(2);
                                const preGSTPrice = (basePrice / (1 + (gstRate || 0) / 100)).toFixed(2);
                                const locationId = matchingLocation?.id || variant?.superlocation?.[0]?.id || variant?.id;
                                const displayStock = matchingLocation?.displayStock || variant?.superlocation?.[0]?.displayStock || variant?.displayStock;
                                const seller = matchingLocation?.sellerId || variant?.superlocation?.[0]?.sellerId || variant?.sellerId;
                                const variantID = variant?.id;
                                matchingLocation.sellerarray.map((d, index) => {
                                  if (d.pincode.includes(+pincode)) {
                                    avalseller.push(d);
                                  }
                                });
                                return (
                                  <tr key={index}>
                                    <td className="border p-2">{variant?.variantName}</td>
                                    <td className="border text-center">{preGSTPrice}</td>
                                    <td className="border text-center">{discount || 0}</td>
                                    <td className="border text-center">{gstRate}</td>
                                    <td className="border text-center">{discountedPrice}</td>
                                    <td className="border text-center">
                                      <input
                                        type="number"
                                        value={qty}
                                        min="0"
                                        onChange={(e) =>
                                          handleQtyChange(
                                            index,
                                            +e.target.value,
                                            variant?.variantName,
                                            discount,
                                            displayStock,
                                            discountedPrice,
                                            seller,
                                            variantID,
                                            locationId
                                          )
                                        }
                                        style={{ width: '50px' }}
                                      />
                                    </td>
                                    <td className="border text-center">{totalPrice}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan="5" className="text-end border p-2">
                                  Total
                                </td>
                                <td className="border text-center">{Object.values(quantities).reduce((acc, item) => acc + (item?.quantity || 0), 0)}</td>
                                <td className="border text-center">
                                  {product?.supervariant
                                    ?.reduce((acc, variant, index) => {
                                      const locationData = variant?.superlocation?.find((loc) => loc?.status && loc.pincode.includes(+pincode)) || {};
                                      const { price, extraCharge, b2bdiscount, b2cdiscount } = locationData;
                                      const basePrice = (price || 0) + (extraCharge || 0);
                                      const discount = currentUser?.role?.includes('b2b') ? b2bdiscount : b2cdiscount;
                                      const discountedPrice = (basePrice * (1 - (discount || 0) / 100)).toFixed(2);
                                      const qty = quantities[index]?.quantity || 0;
                                      const totalPrice = (discountedPrice * qty).toFixed(2);
                                      return acc + parseFloat(totalPrice);
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                          {(() => {
                            const uniqueSellers = Array.from(new Set(avalseller.map((s) => s.sellerId.id))).map((id) =>
                              avalseller.find((s) => s.sellerId.id === id)
                            );

                            return (
                              <>
                                <div className="table-responsive mt-0">
                                  <table className="table-responsive w-100 mt-2 border">
                                    <thead className="table-head mark">
                                      <tr>
                                        <th className="ps-3 p-1 border">Order Fulfillment by</th>
                                        <th className="ps-3 p-1 border">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {uniqueSellers.length > 0 ? (
                                        uniqueSellers.map((s, index) =>
                                          uniqueSellers.length > 1 && index === 0 ? null : (
                                            <tr key={index} className="align-middle">
                                              <td className="ps-3 border fw-bold text-dark">
                                                {sellerMasking.sellerMasking ? s.sellerId.id.toUpperCase() : s.sellerId.companyName}
                                                {s.sellerId.overallrating > 0 && (
                                                  <Rating
                                                    readonly
                                                    initialRating={s.sellerId.overallrating}
                                                    // initialRating="4"
                                                    emptySymbol={<i className="cs-star text-success" />}
                                                    fullSymbol={<i className="cs-star-full text-success" />}
                                                    className="w-100"
                                                  />
                                                )}
                                              </td>
                                              <td className="ps-3 border fw-bold text-dark">
                                                <AddToCartSuperSeller
                                                  className="btn btn-success fw-bold px-4 py-2"
                                                  variantQuantities={{ ...quantities, seller: s.sellerId.id }}
                                                  productID={product?.id}
                                                >
                                                  🛒 Add to Cart
                                                </AddToCartSuperSeller>
                                              </td>
                                            </tr>
                                          )
                                        )
                                      ) : (
                                        <tr>
                                          <td colSpan="2" className="text-center text-muted p-3">
                                            No dealer available
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>

                                    {/* <tbody>
                                    {uniqueSellers.length > 0 ? (
                                      uniqueSellers.map((s, index) => (
                                        <tr key={index} className="align-middle">
                                          <td className=" ps-3 border fw-bold text-dark">{s.sellerId.companyName}</td>
                                          <td className=" ps-3 border fw-bold text-dark">
                                            <AddToCartSuperSeller
                                              className="btn btn-success fw-bold px-4 py-2"
                                              variantQuantities={{ ...quantities, seller: s.sellerId.id }}
                                              productID={product?.id}
                                            >
                                              🛒 Add to Cart
                                            </AddToCartSuperSeller>
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan="2" className="text-center text-muted p-3">
                                          No dealer available
                                        </td>
                                      </tr>
                                    )}
                                  </tbody> */}
                                  </table>
                                </div>
                                <div className="text-dark mt-1">
                                  Do you want to become a dealer of <span className="fw-bold">{companyNames[product.superSellerId]}</span>? Please{' '}
                                  <a href="/business_associate_sub_dealer" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                    fill out this form
                                  </a>
                                </div>
                              </>
                            );
                          })()}
                        </Col>
                      </Row>
                    )}
                    {error && (
                      <>
                        <div className="text-danger mt-2">Sorry, No dealers available at this pincode {pincode}. Try another pincode</div>
                        <div className="text-dark mt-1">
                          Do you want to become a "{companyNames[product.superSellerId]}" dealer? Please{' '}
                          <a href="/business_associate_sub_dealer" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            fill out this form
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                  {/* <div>
                    {isModalOpen && (
                      <>
                        <div className="modal fade show d-block" tabIndex="-1">
                          <div className="modal-dialog modal-dialog-top mt-6">
                            <div className="modal-content shadow-lg border-0 rounded-3">
                              <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title fw-bold">Enter Delivery Pincode</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setIsModalOpen(false)}></button>
                              </div>
                              <div className="modal-body p-4 ">
                                <input
                                  type="number"
                                  className="form-control form-control-lg rounded-2 mb-4"
                                  placeholder="Enter Delivery Pincode"
                                  maxLength="6"
                                  value={pincode}
                                  onChange={handlePincodeChange}
                                />
                                {showTable && (
                                  <div className="text-success fw-semibold pt-2">
                                    This product is available in your location. <span className="float-end text-dark">Auto-close in {seconds}s</span>
                                  </div>
                                )}
                                {error && (
                                  <div className="mt-3">
                                    <div className="text-danger fw-semibold">Sorry, No dealers found for the entered pincode. Please try another pincode.</div>
                                    <div className="text-dark mt-2">
                                      Do you want to become a <b>{companyNames[product.superSellerId]}</b> dealer? Please{' '}
                                      <a
                                        href="/business_associate_sub_dealer"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-decoration-none fw-bold text-primary"
                                      >
                                        fill out this form
                                      </a> 
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="modal-backdrop fade show"></div>
                      </>
                    )}
                    {isModalOpen && <div className="modal-backdrop fade show"></div>}
                  </div> */}
                  <div>
                    {showTable && product.fullName === null && (
                      <table className="mt-2 border ">
                        <thead className="mark">
                          <tr>
                            <th>Dealer Name</th>
                            <th>Add to Cart</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSellers.map((seller) => (
                            <tr key={seller.id}>
                              <td>{seller.sellerId.companyName}</td>
                              <td>
                                <div className="ms-3">
                                  <AddToCartSingle
                                    moq={1}
                                    productID={product?.id}
                                    variantID={varinatID}
                                    locationID={seller.id}
                                    available="Available"
                                    gstRate={gstRate}
                                    enteredPrice={price}
                                    extraCharge={extraCharge}
                                    unitType={unitType}
                                    extraChargeType={extraChargeType}
                                    transportCharge={transportCharge}
                                    transportChargeType={transportChargeType}
                                    b2bDiscount={b2bDiscount}
                                    minimumQty={1}
                                    displayStock={100000}
                                    mainStock={seller.mainStock}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
                <div className="row g-2 mt-1">
                  <div className="col-12 col-md-4">
                    <Button
                      onClick={() => setShippingBoxModal(true)}
                      className="d-flex w-100 align-items-center p-2 border rounded-2 shadow-sm bg-white text-dark "
                    >
                      <Truck size={20} className="text-primary me-2" />
                      <span className="small">Shipping Policy</span>
                    </Button>
                  </div>
                  <div className="col-12 col-md-4">
                    <Button
                      onClick={() => setCancelBoxModal(true)}
                      className="d-flex w-100 align-items-center p-2 border rounded-2 shadow-sm bg-white text-dark"
                    >
                      <XOctagon size={20} className="text-danger me-2" />
                      <span className="small">Cancel Policy</span>
                    </Button>
                  </div>
                  <div className="col-12 col-md-4">
                    <Button
                      onClick={() => setReturnBoxModal(true)}
                      className="d-flex w-100 align-items-center p-2 border rounded-2 shadow-sm bg-white text-dark"
                    >
                      <ArrowCounterclockwise size={20} className="text-success me-2" />
                      <span className="small">Return Policy</span>
                    </Button>
                  </div>
                </div>
                <div className="d-flex align-items-center my-3 py-2 bg-white rounded shadow-sm px-3">
                  <span className="fw-bold me-3 text-dark"> Share on: </span>
                  <FacebookShareButton url={shareURL} quote="Dummy text!" hashtag="#muo">
                    <FacebookIcon className="me-2 border border-primary p-1 rounded-circle shadow-sm" size={40} round />
                  </FacebookShareButton>
                  <WhatsappShareButton url={shareURL} quote="Dummy text!" hashtag="#muo">
                    <WhatsappIcon className="me-2 border border-success p-1 rounded-circle shadow-sm" size={40} round />
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
                    <a
                      href="#"
                      className="d-inline mx-0 my-0 px-3 p-2 ps-0 text-decoration-none text-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        ReadMore(product?.id);
                      }}
                    >
                      View More <CsLineIcons icon="chevron-bottom" />
                    </a>
                  </div>
                )}
                {selected === product?.id && (
                  <div className="d-inline">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product?.description.replace(/<br>/g, '')) }} className="mb-3" />
                  </div>
                )}
              </div>
            </Card>
          )}
        </Col>
      </Row>
      {/* <Row>
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
      </Row> */}
      {product?.faq?.length > 0 && <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded"> Frequently Asked Questions</div>}

      {product?.faq?.filter((faq) => faq.question).length > 0 && (
        <Accordion defaultActiveKey={null}>
          {product?.faq
            ?.filter((faq) => faq.question)
            .map((faq, index) => (
              <Card key={index} className="mb-1">
                <Accordion.Item eventKey={index.toString()}>
                  <Accordion.Header>
                    <span className="text-dark" style={{ fontSize: '13px' }}>
                      {index + 1}. <span className="ps-2">{faq.question}</span>
                    </span>
                  </Accordion.Header>
                  <Accordion.Body className="pt-0">
                    <div className="text-dark">{faq.answer}</div>
                  </Accordion.Body>
                </Accordion.Item>
              </Card>
            ))}
        </Accordion>
      )}

      {/* {dataCat?.getProductByCatId?.length > 1 && <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 rounded"> Similar Products</div>}
      <Row className="g-2 row-cols-2 row-cols-md-3 row-cols-xl-5 rounded-bottom p-1 bg-white pb-2 mt-0 ms-0 mx-0 ">
        {dataCat &&
          dataCat?.getProductByCatId?.map(
            (item, index) =>
              index < 6 &&
              !(item.id === product?.id) && (
                <Col key={item?.id} className="my-1 py-1">
                  <Card className="hover-border-primary border">
                    <DiscountBadge variant={item?.variant[0]} name={item?.previewName} />
                    <Row className="g-0">
                      <img
                        src={item?.thumbnail || (item?.images && item?.images[0])}
                        alt={item?.previewName}
                        className="rounded card-img-horizontal h-100 px-1 py-1"
                      />
                      <hr className="my-0" />
                    </Row>
                    <Row>
                      <Card.Body className="text-center h-100 my-1 py-0 px-2 mx-1">
                        <div className="card-text mb-0 text-truncate p-1" style={{ fontWeight: 'bold' }}>
                          {item?.brand_name}
                        </div>
                        <div>
                          <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">{item?.fullName}</Tooltip>}>
                            <NavLink
                              style={{ fontWeight: 'bold' }}
                              to={`/product/${item?.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                              target="_blank"
                              className="body-link stretched-link d-block my-1 py-0 mx-1 px-1 text-truncate"
                            >
                              {item?.previewName.length > 11 ? `${item?.previewName}` : item?.previewName}
                            </NavLink>
                          </OverlayTrigger>
                        </div>
                        <div>
                          {item?.variant?.length > 0 && (
                            <div className="small px-2 card-text my-1 py-0 mx-1 px-1 text-truncate">
                              <PriceComponent variant={item?.variant[0]} name={item?.previewName} />
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Row>
                  </Card>
                </Col>
              )
          )}
      </Row> */}

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
      {/* <Modal show={isModalVisible} onHide={closeModal}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title className="fw-bold">
            {product?.variant[0]?.location[0]?.sellerId?.companyName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2 pb-4">
          {product?.variant[0]?.location[0]?.sellerId?.companyDescription}
        </Modal.Body>
      </Modal>     */}
    </>
  );
};

export default SingleDetail;
