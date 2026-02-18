/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { gql, useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useParams, useHistory } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import './style.css';
import { Navigation } from 'swiper';
import styled, { ThemeProvider } from 'styled-components';
import Truncate from 'react-truncate-html';
import { toast } from 'react-toastify';
import Rating from 'react-rating';
import { Row, Col, Button, Card, Form, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Clamp from 'components/clamp';
import { FacebookShareButton, FacebookIcon, WhatsappShareButton, WhatsappIcon, TwitterShareButton, TwitterIcon } from 'react-share';
import 'react-image-lightbox/style.css';
import DOMPurify from 'dompurify';
import SeriesTableRow from './SeriesProduct/SeriesTableRow';
import AddToCartSeries from './SeriesProduct/AddToCartSeries';
import returnImage from './pngs/icons_return_apnagharmart.png';
import shippingImage from './pngs/icons_Shipping_apnagharmart.png';
import cancelImage from './pngs/icons_cancel_.png';
import MultiSeller from './MultiSeller';

const SeriesDetail = ({ product }) => {
  const title = 'Product Details';
  const description = 'Ecommerce Product Detail Page';
  const history = useHistory();
  const [click, setClick] = useState(false);
  const [run, setRun] = useState(0);
  const [trigger, setTrigger] = useState(0);
  const [pincode, setPincode] = useState(null);
  const shareURL = window.location.href;
  const [sellerID, setsellerID] = useState('');
  const [sellerId, setSellerId] = useState(product?.seriesvariant[0]?.serieslocation[0]?.sellerId);
  const [variantQuantities, setVariantQuantities] = useState([]);
  const [totalSum, setTotalSum] = useState(0);
  const [shippingBoxModal, setShippingBoxModal] = useState(false);
  const [returnBoxModal, setReturnBoxModal] = useState(false);
  const [cancelBoxModal, setCancelBoxModal] = useState(false);
  const [featureBoxModal, setFeatureBoxModal] = useState(false);
  const [tableView, setTableView] = useState(product?.table);

  const [isCatalogueVisible, setIsCatalogueVisible] = useState(false);

  const handleCatalogueClick = () => {
    if (product?.catalogue) {
      // Open the catalogue URL in a new tab
      window.open(product?.catalogue, '_blank');
    }
  };

  useEffect(() => {
    const variantwithQty = variantQuantities.filter((item) => item.rateofvariant !== 0);
    const sum = variantwithQty.reduce((sum1, item) => {
      const individualPrice = ((100 - item.discount) * item.rateofvariant) / 100;
      return sum1 + individualPrice;
      // return sum1 + item.rateofvariant;
    }, 0);
    setTotalSum(sum);
  }, [variantQuantities]);

  // Check Wishlist Duplicacy

  const [selected, setSelected] = useState('');

  function ReadMore(event) {
    setSelected(event);
  }

  const CHECK_WISHLIST_DUPLICACY = gql`
    query Wishlist {
      wishlist {
        id
        userId {
          id
        }
        wishlistProducts {
          productId {
            brand_name
            fullName
            id
            images
          }
        }
      }
    }
  `;
  const [wish, setWish] = useState(false);

  const [checkDuplicacy, resultDuplicacy] = useLazyQuery(CHECK_WISHLIST_DUPLICACY, {
    onCompleted: (resultDup) => {
      // console.log("resultDup", resultDup);
      // console.log(resultDuplicacy);
    },
    onError(error) {
      // toast.error(error.message || 'Something went wrong!');
      console.error('GET_ITEM_DETAIL', error);
    },
  });

  useEffect(() => {
    checkDuplicacy();
  }, [checkDuplicacy]);

  let idea = '';

  if (product && resultDuplicacy.data) {
    if (resultDuplicacy.data.wishlist && resultDuplicacy.data.wishlist.userId.id) {
      idea = resultDuplicacy.data.wishlist.wishlistProducts.some((c) => c.productId.id === product.id);
      // console.log(idea);
    } else {
      // console.log('No user ID');
    }
  } else {
    // console.log('Product and resultDuplicacy.data is not yet received');
  }

  useEffect(() => {
    setWish(idea);
  }, [idea]);

  // Create a wishlist

  const CREATE_WISHLIST = gql`
    mutation Mutation($productId: ID!) {
      createWishlist(productId: $productId) {
        wishlistProducts {
          productId {
            cancellationPolicy
            fullName
            id
          }
        }
      }
    }
  `;

  const [createWishlist, result] = useMutation(CREATE_WISHLIST, {
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
        <Button variant="primary" className="btn-icon btn-icon-end mx-1 mb-1 mt-1">
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
    setClick(true);
    changeButton();
  };

  // Theme and Wrapper and Main-Images

  const [mainImage, setMainImage] = useState('');

  // Get category by category id from product
  const GETSERIESPROUDCT_BY_CATEGORYID = gql`
    query GetSeriesProductByCatId($catId: ID!) {
      getSeriesProductByCatId(cat_id: $catId) {
        brand_name
        fullName
        active
        identifier
        id
        previewName
        images
        seriesvariant {
          serieslocation {
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
            mainStock
            displayStock
          }
          variantName
          moq
        }
      }
    }
  `;
  // console.log('GETSERIESPROUDCT_BY_CATEGORYID', GETSERIESPROUDCT_BY_CATEGORYID);

  const { data: dataCat } = useQuery(GETSERIESPROUDCT_BY_CATEGORYID, {
    variables: {
      catId: product.categories[0],
    },
  });

  function handleSellerChange() {
    setFeatureBoxModal(true);
    setRun((run) => run + 1);
  }

  function handleChangeSeller(id) {
    setFeatureBoxModal(false);
    setsellerID(id);
    // const sellerVariantLocation1 =  product?.seriesvariant?.map((item ) => item.serieslocation.findIndex((seller) => seller.sellerId === id));
  }

  const GET_SELLER = gql`
    query GetSeller($getSellerId: ID!) {
      getSeller(id: $getSellerId) {
        companyName
      }
    }
  `;

  const [getSellerDetail, { data: sellerDetail }] = useLazyQuery(GET_SELLER);
  useEffect(() => {
    getSellerDetail({
      variables: {
        getSellerId: sellerId,
      },
    });
  }, [sellerId]);

  // Review Section

  const GET_REVIEW_OF_PRODUCT = gql`
    query GetReviewByProduct($productId: ID) {
      getReviewByProduct(productId: $productId) {
        id
        createdAt
        user {
          firstName
          lastName
          profilepic
        }
        productId
        images
        rating
        title
        description
      }
    }
  `;

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

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="text-small ms-1">HOME</span>
            </NavLink>
          </Col>

          {/* Title End */}

          {/* Top Buttons Start */}
          <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button variant="outline-primary" onClick={() => history.push('/cart')} className="btn-icon btn-icon-start w-100 w-md-auto">
              <CsLineIcons icon="cart" /> <span>Cart</span>
            </Button>
          </Col>
          {/* Top Buttons End */}
        </Row>
      </div>
      {/* ADVERTISEMENT SLOT  START */}
      <aside>
        <div className="container-fluid px-0 mb-2">
          <img src="/img/advertisement/2.jpg" className="d-block w-100" alt="..." />
        </div>
      </aside>

      {/* ADVERTISEMENT SLOT  END */}

      {/* Product Start */}
      <Card className="mb-5 mt-4">
        <Card.Body>
          {/* // First Row containing Product Display Image */}
          {/* // and thumbail and basic detail of product  */}
          <Row className="g-5">
            {product && product.images && (
              //  Product Images
              <Col xxl="7" xl="6" lg="8" sm="12" md="12" xs="12">
                {/* // Row for Product Images */}
                <Row className="mx-0 my-0 px-2 py-0">
                  {/* // Thumbail Column */}
                  <Col sm="2" md="2" lg="3" xxl="4" className="mx-0 my-0 px-0 py-0 thumbnail">
                    {product.images.map((curElm, index) => {
                      return (
                        <div key={index} className="mx-0 my-0 px-0 py-0">
                          <img
                            className="inner mx-0 my-1 px-0 py-0"
                            style={{ height: '80px', width: '80px', borderRadius: '8px' }}
                            src={curElm}
                            alt={curElm.filename}
                            key={index}
                            onClick={() => setMainImage(curElm)}
                          />
                        </div>
                      );
                    })}
                  </Col>

                  {/* // Main Image Column */}
                  <Col sm="6" md="7" lg="9" xxl="8" className="main-Image mx-0 my-0 px-1 py-0">
                    <img
                      className="box mx-0 my-1 px-0 py-0"
                      style={{ height: '400px', width: '400px', borderRadius: '15px' }}
                      src={mainImage === '' ? product.images[0] : mainImage}
                      alt={mainImage.filename}
                    />
                  </Col>
                </Row>

                {/* // Swiper section is a slider for Display images in Mobile screens */}
                <Swiper navigation modules={[Navigation]} className="mySwiper">
                  {product.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img src={image} alt={mainImage.filename} />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Col>
            )}
            {/* // Basic Product Detail */}
            <Col xxl="5" xl="6" lg="4" md="12" sm="12" xs="12">
              <div className="d-flex flex-column h-100">
                {product && product.active && (
                  <>
                    <p className="mb-2 d-inline-block d-flex h6 p-0">BRAND: {product.brand_name}</p>
                    <h4 className="mb-2 fw-bold">{product.fullName}</h4>
                  </>
                )}
                <MultiSeller product={product} />
                <Row className="mb-4 g-3">
                  <Col className="mt-4">
                    {sellerDetail?.getSeller?.companyName && (
                      <div className="my-1 py-0">
                        <p className="d-inline fw-bold form-label">Sold by {sellerDetail?.getSeller?.companyName}</p>{' '}
                      </div>
                    )}
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
                    <div className="d-flex align-items-center my-3 py-2 bg-light rounded shadow-sm px-3">
                      <span className="fw-bold me-3 text-dark"> Share on: </span>
                      <FacebookShareButton url={shareURL} quote="Dummy text!" hashtag="#muo">
                        <FacebookIcon className="me-2 border border-primary p-1 rounded-circle shadow-sm" size={40} round />
                      </FacebookShareButton>
                      <WhatsappShareButton url={shareURL} quote="Dummy text!" hashtag="#muo">
                        <WhatsappIcon className="me-2 border border-success p-1 rounded-circle shadow-sm" size={40} round />
                      </WhatsappShareButton>
                    </div>
                    {/* Catalogue Section */}
                    {product?.catalogue && (
                      <div className="my-2 mt-2">
                        {' '}
                        {/* Reduced margin */}
                        <div className="p-2 rounded-3 shadow-sm border text-center bg-light">
                          <h6 className="fw-bold text-primary mb-0 cursor-pointer" onClick={handleCatalogueClick}>
                            <CsLineIcons icon="book" className="me-1" />
                            Catalogue
                          </h6>
                        </div>
                      </div>
                    )}

                    {product?.giftOffer && (
                      <div className="my-4 py-0">
                        <h5 className="fw-bold form-label">{product?.giftOffer}</h5>
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Variant Table */}
          <Row className="g-6 my-1 py-1 gutterRow ">
            {tableView
              ? product && (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table mt-2 border ">
                      <thead className="table-head">
                        <tr className="border">
                          <th className="table-head border">Item</th>
                          <th className="border">Pre GST Price ({product.seriesvariant[0].serieslocation[0].unitType})</th>
                          <th className="border">Discount</th>
                          <th className="border">GST %</th>
                          <th className="border">GST Paid Price ({product.seriesvariant[0].serieslocation[0].unitType})</th>
                          <th className="border">Enter Qty ({product.seriesvariant[0].serieslocation[0].unitType})</th>
                          <th className="border">Availability</th>
                          <th className="border">Qty in Cart ({product.seriesvariant[0].serieslocation[0].unitType})</th>
                          <th className="border">GST Paid Amount</th>
                        </tr>
                      </thead>
                      <tbody className="table-head">
                        {product.seriesvariant?.map((item, index) => {
                          const { id, variantName, serieslocation, moq, allPincode, active } = item;
                          return (
                            <SeriesTableRow
                              setVariantQuantities={setVariantQuantities}
                              key={index}
                              index={index}
                              variantName={variantName}
                              serieslocation={serieslocation}
                              moq={moq}
                              variantID={id}
                              pincode={pincode}
                              trigger={trigger}
                              allPincode={allPincode}
                              active={active}
                              sellerID={sellerID}
                              run={run}
                              setPincode={setPincode}
                            />
                          );
                        })}
                        <tr>
                          <td className="border" colSpan="7">
                            Total
                          </td>
                          <td className="border"> {totalSum.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                    {/* add to cart, wishlist, availability section */}
                    <Button className="mb-2 ms-0 ps-0" variant="link" onClick={() => handleSellerChange()}>
                      View All Seller
                    </Button>
                    <Row>
                      <Col xs="12" sm="6" className=" my-2 me-2">
                        {/* <Form.Label className="mt-2 mb-2">Enter Pincode here </Form.Label> */}
                        <Form.Control
                          className="mb-2"
                          type="text"
                          maxLength={6}
                          value={pincode || ''}
                          placeholder="Enter Delivery Pincode here"
                          // onChange={(e) => setPincode(parseInt(e.target.value, 10))}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, '');
                            const pincodeValue = parseInt(numericValue, 10);
                            setPincode(pincodeValue);
                          }}
                        />
                      </Col>
                      <Col className="col-auto my-2 me-2">
                        <Button
                          className="d-inline"
                          onClick={() => {
                            setTrigger((trigger) => trigger + 1);
                          }}
                        >
                          {' '}
                          Check
                        </Button>
                      </Col>
                      <Col className="col-auto my-2 me-2">
                        <AddToCartSeries variantQuantities={variantQuantities} productID={product.id} />
                      </Col>
                      <Col className="col-auto my-2 me-2">
                        {!wish && !click && (
                          <Button variant="outline-primary" className="btn-icon btn-icon-end" onClick={() => handleWishlist(product.id)}>
                            <span>
                              {' '}
                              <CsLineIcons icon="heart" />{' '}
                            </span>
                          </Button>
                        )}
                        {click && changeButton()}
                        {wish && (
                          <Button variant="primary" className="btn-icon btn-icon-end">
                            <span>
                              Wishlist <CsLineIcons icon="check" />{' '}
                            </span>
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </div>
                )
              : null}
          </Row>
        </Card.Body>
      </Card>
      {/* Product End */}

      <aside>
        <Row className="g-4">
          <Col xl="12" className="mb-5">
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

            {product?.faq?.length > 0 && <h2 className="small-title">Frequently Asked Questions</h2>}
            <Card>
              {product &&
                product.faq.map((faq, index) => (
                  <Card.Body key={index} className="mb-n4">
                    <Row className="g-0 mb-4">
                      <Col xs="auto">
                        <p className="sw-2 text-primary mb-2 fw-bold">{index + 1}.</p>
                      </Col>
                      <Col>
                        <p className="text-primary ps-3 mb-2 fw-bold">{faq.question}</p>
                        <p className="text-body ps-3 mb-0">{faq.answer}</p>
                      </Col>
                    </Row>
                  </Card.Body>
                ))}
            </Card>

            {dataReview?.getReviewByProduct?.length > 0 && <h2 className="small-title">Review Section</h2>}
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

            {/* Faq End */}
          </Col>
          <Col xl="12">
            {/* {product?.youtubeLink && <h2 className='my-2 py-2'>YouTube Video</h2>} */}
            {product?.youtubeLink && (
              <Card className="mx-0 px-0 justify-content-center mb-4">
                {' '}
                {/* 👈 added mb-4 */}
                <iframe height="315" className="sw-auto" src={`${product.youtubeLink}?mute=1`}></iframe>
              </Card>
            )}

            {product?.video && (
              <Card className="mt-2">
                {' '}
                {/* 👈 added mt-2 */}
                <video className="sw-auto" height="315" controls>
                  <source src={product.video} type="video/mp4" />
                  <source src={product.video} type="video/ogg" />
                  Your browser does not support the video tag.
                </video>
              </Card>
            )}

            {dataCat?.getSeriesProductByCatId.length > 1 && <h2 className="my-2 small-title">Similar Products</h2>}
            <Row className="g-2 mt-0 row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-3 row-cols-xl-6 p-2 bg-white rounded shadow-sm">
              {dataCat &&
                dataCat.getSeriesProductByCatId.map(
                  (item, index) =>
                    index < 3 &&
                    !(item.id === product.id) && (
                      <Col key={item.id}>
                        <Card className="h-100 border shadow-sm position-relative hover-shadow">
                          <Row className="g-0 h-100 ">
                            <img src={item.images[0]} alt="alternate text" className="card-img rounded card-img-horizontal h-100" />
                          </Row>
                          <Row>
                            <Card.Body className="text-center p-2 border-top">
                              <div className="mb-0 h6">
                                <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">{item.fullName}</Tooltip>}>
                                  <NavLink
                                    to={`/product/${item.identifier.replace(/\s/g, '_').toLowerCase()}`}
                                    className="stretched-link fw-bold fw-semibold text-dark text-decoration-none d-block text-truncate mt-1"
                                    style={{ fontSize: '0.95rem' }}
                                  >
                                    {item.fullName}
                                  </NavLink>
                                </OverlayTrigger>
                                <div className="card-text mb-2 mx-2"> &#8377; {item.seriesvariant[0].serieslocation[0].price}</div>
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
              <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.returnPolicy) }} />
            </Modal.Body>
          </Modal>
          <Modal show={shippingBoxModal} onHide={() => setShippingBoxModal(false)}>
            <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
              <Modal.Title>Shipping Policy</Modal.Title>
            </Modal.Header>
            <Modal.Body className="mx-2 my-2 px-2 py-2">
              <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.shippingPolicy) }} />
            </Modal.Body>
          </Modal>
          <Modal show={cancelBoxModal} onHide={() => setCancelBoxModal(false)}>
            <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
              <Modal.Title>Cancel Policy </Modal.Title>
            </Modal.Header>
            <Modal.Body className="mx-2 my-2 px-2 py-2">
              <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.cancellationPolicy) }} />
            </Modal.Body>
          </Modal>
        </Row>
      </aside>
      <Modal show={featureBoxModal} onHide={() => setFeatureBoxModal(false)}>
        <Modal.Header className="mx-2 my-2 px-2 py-2" closeButton>
          <Modal.Title>Salient Features</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mx-2 my-2 px-2 py-2">
          {product && (
            <ul>
              {product?.seriesvariant?.map((item) =>
                item.serieslocation?.map((seller) => (
                  <li style={{ listStyle: 'none' }} className="fs-6 cursor-pointer" key={seller.id} onClick={() => handleChangeSeller(seller.sellerId)}>
                    {seller.sellerId}
                  </li>
                ))
              )}
            </ul>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SeriesDetail;
