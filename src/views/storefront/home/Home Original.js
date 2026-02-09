import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWindowSize } from 'hooks/useWindowSize';
import { Row, Col, Button, Card, Modal, Badge } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import * as bootstrap from 'bootstrap';
import { useLazyQuery, gql, useQuery } from '@apollo/client';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CategoryMenuContent from './components/CategoryMenuContent';
import './style.css';

const Home = () => {
  const title = 'Home';
  const description = 'Ecommerce Home Page';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

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

  const [getAdContent1, { data: dataAd1 }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContent2, { data: dataAd2 }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContentDown1, { data: dataAdDown1 }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContentDown2, { data: dataAdDown2 }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContentDown3, { data: dataAdDown3 }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContentDown4, { data: dataAdDown4 }] = useLazyQuery(GET_AD_CONTENT);

  useEffect(() => {
    getAdContent1({
      variables: {
        key: 'Home1',
      },
    });
    getAdContent2({
      variables: {
        key: 'Home2',
      },
    });
    getAdContentDown1({
      variables: {
        key: 'DownAd1',
      },
    });
    getAdContentDown2({
      variables: {
        key: 'DownAd2',
      },
    });
    getAdContentDown3({
      variables: {
        key: 'DownAd3',
      },
    });
    getAdContentDown4({
      variables: {
        key: 'DownAd4',
      },
    });
  }, []);

  const GET_HOME_PAGE_SLIDER_IMAGES = gql`
    query GetHomePageSlider($key: String!) {
      getHomePageSlider(key: $key) {
        images
        content
        key
        url
      }
    }
  `;

  const [getSlides, { error: errorSlider1, data: dataSlider }] = useLazyQuery(GET_HOME_PAGE_SLIDER_IMAGES);
  const [getSlides2, { error: errorSlider2, data: dataSlider2 }] = useLazyQuery(GET_HOME_PAGE_SLIDER_IMAGES);
  const [getSlides3, { error: errorSlider3, data: dataSlider3 }] = useLazyQuery(GET_HOME_PAGE_SLIDER_IMAGES);
  const [getSlides4, { error: errorSlider4, data: dataSlider4 }] = useLazyQuery(GET_HOME_PAGE_SLIDER_IMAGES);

  useEffect(() => {
    getSlides({
      variables: {
        key: 'slider1',
      },
    });
    getSlides2({
      variables: {
        key: 'slider2',
      },
    });
    getSlides3({
      variables: {
        key: 'slider3',
      },
    });
    getSlides4({
      variables: {
        key: 'slider4',
      },
    });
    // Execute the getUsers function when the component mounts
  }, []);

  // if (errorSlider1) {
  //   console.log(errorSlider1);
  // }

  // if (errorSlider2) {
  //   console.log(errorSlider2);
  // }

  // if (errorSlider3) {
  //   console.log(errorSlider3);
  // }

  // if (errorSlider4) {
  //   console.log(errorSlider4);
  // }

  // GET PARENT CATEGORY

  const GET_PARENT_CATEGORY = gql`
    query GetAllCategories {
      getAllCategories {
        id
        image
        name
        parent {
          id
          image
          name
        }
        children {
          id
          image
          name
          children {
            id
            image
            name
            children {
              id
              image
              name
              children {
                id
                image
                name
              }
            }
          }
        }
      }
    }
  `;

  const { data: dataParentCat } = useQuery(GET_PARENT_CATEGORY);

  const [isLoaded, setIsLoaded] = useState(false);

  const { themeValues } = useSelector((state) => state.settings);
  const xlBreakpoint = parseInt(themeValues.xl.replace('px', ''), 10);
  const { width } = useWindowSize();
  const [isXlScreen, setIsXlScreen] = useState(false);
  const [isOpenCategoriesModal, setIsOpenCategoriesModal] = useState(false);

  useEffect(() => {
    if (width) {
      if (width >= xlBreakpoint) {
        if (!isXlScreen) setIsXlScreen(true);
        if (isOpenCategoriesModal) setIsOpenCategoriesModal(false);
      } else if (isXlScreen) setIsXlScreen(false);
    }
    return () => {};
    // eslint-disable-next-line
  }, [width]);

  // form on load of the page
  useEffect(() => {
    // Simulating successful page load after 2 seconds
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 5000);

    // Clean up the timer when the component is unmounted
    return () => clearTimeout(timer);
  }, []);

  // Product

  const GET_ALL_INDIVIDUAL_PRODUCT = gql`
    query Approvedproducts {
      approvedproducts {
        id
        variant {
          id
          location {
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
            b2cdiscount
            b2bdiscount
            finalPrice
            mainStock
            displayStock
          }
          variantName
          active
          hsn
          silent_features
          moq
          allPincode
          minimunQty
        }
        faq {
          id
          question
          answer
        }
        brand_name
        previewName
        fullName
        thumbnail
        sku
        returnPolicy
        shippingPolicy
        cancellationPolicy
        description
        giftOffer
        sellerNotes
        identifier
        video
        youtubeLink
        catalogue
        approve
        images
        categories
      }
    }
  `;

  const { error, data } = useQuery(GET_ALL_INDIVIDUAL_PRODUCT);
  if (error) {
    console.log(error);
  }
  // Series Product

  const GET_ALL_SERIES_PRODUCT = gql`
    query GetAllSeriesProduct {
      getAllSeriesProduct {
        id
        previewName
        thumbnail
        brand_name
        identifier
        sku
        fullName
        images
        seriesvariant {
          serieslocation {
            price
          }
        }
      }
    }
  `;

  const { error: seriesError, data: seriesData } = useQuery(GET_ALL_SERIES_PRODUCT);

  if (seriesError) {
    console.log('GET_ALL_SERIES_PRODUCT', seriesError);
  }

  // TMT Series Product
  const GET_ALL_TMT_PRODUCTS = gql`
    query GetAllTMTSeriesProduct {
      getAllTMTSeriesProduct {
        brand_name
        fullName
        id
        identifier
        images
        previewName
        sku
        section
        thumbnail
        tmtseriesvariant {
          tmtserieslocation {
            price
          }
        }
      }
    }
  `;

  const { error: ErrorTMT, data: DataTMT } = useQuery(GET_ALL_TMT_PRODUCTS);
  if (ErrorTMT) {
    console.log('GET_ALL_TMT_PRODUCTS', ErrorTMT);
  }
  const sendTo = (event) => { 
    window.location.href = event;
    // return(
    // <a href={event} />
    // );
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      {/* Title Start */}
      <div className="page-title-container">
        <Row className="g-0">
          <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button
              variant="outline-primary"
              className="btn-icon btn-icon-start w-100 w-md-auto d-inline-block d-xl-none"
              onClick={() => setIsOpenCategoriesModal(true)}
            >
              <CsLineIcons icon="more-horizontal" /> <span>Categories</span>
            </Button>
          </Col>
          {/* Top Buttons End */}
        </Row>
      </div>
      {/* Title End */}

      <Row>
        {/* In Page Menu Start */}
        {isXlScreen && (
          <Col xl="3" className=" d-none d-xl-block mb-5">
            <Card className="mx-1 px-1">
              <div className="mx-1 px-1 d-flex pt-3 flex-column justify-content-between">
                <CategoryMenuContent />
              </div>
            </Card>
          </Col>
        )}
        {/* {isXlScreen && (
          <Col xl="3" className=" d-none d-xl-block mb-5">
            <Card>
              <Card.Body className="d-flex flex-column justify-content-between">
                <CategoryMenuContent />
              </Card.Body>
            </Card>
          </Col>
        )} */}
        {/* In Page Menu End */}

        {/* Cta Banners Start */}
        <Col xl="9" className="mb-5">
          <Row className="g-2 mb-2">
            <Col sm="6" md="8">
              <Card id="carouselExampleAutoplaying" className="carousel slide sh-30 sh-sm-45 " data-bs-ride="carousel">
                <div onClick={() => sendTo(dataSlider.getHomePageSlider.url)} className="carousel-inner rounded">
                  {dataSlider && (
                    <div className="carousel-item active">
                      <img src={dataSlider.getHomePageSlider.images[0]} className="card-image h-100 scale" alt="..." />
                    </div>
                  )}
                  {dataSlider &&
                    dataSlider.getHomePageSlider.images.map(
                      (item, index) =>
                        !(index === 0) && (
                          <div key={index} className="carousel-item">
                            <img src={item} className="card-image h-100 scale" alt="..." />
                          </div>
                        )
                    )}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true" />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true" />
                  <span className="visually-hidden">Next</span>
                </button>
              </Card>
            </Col>
            <Col sm="6" md="4">
              <Card id="carouselExampleAutoplaying1" className="carousel slide sh-30 sh-sm-45 " data-bs-ride="carousel">
                <div onClick={() => sendTo(dataSlider2.getHomePageSlider.url)} className="carousel-inner rounded">
                  {dataSlider2 && (
                    <div className="carousel-item active">
                      <img src={dataSlider2.getHomePageSlider.images[0]} className="card-image h-100 scale" alt="..." />
                    </div>
                  )}
                  {dataSlider2 &&
                    dataSlider2.getHomePageSlider.images.map(
                      (item, index) =>
                        !(index === 0) && (
                          <div key={index} className="carousel-item">
                            <img src={item} className="card-image h-100 scale" alt="..." />
                          </div>
                        )
                    )}
                </div>
                <div className="card-img-overlay d-flex flex-column justify-content-between bg-transparent">
                  <div style={{ color: 'black', fontWeight: 'bold', textShadow: '2px 2px 20px white' }} className="cta-3 mb-3 w-75 w-md-50">
                    20% Discount for Bagged Products
                  </div>
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying1" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true" />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying1" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true" />
                  <span className="visually-hidden">Next</span>
                </button>
              </Card>
            </Col>
          </Row>
          <Row className="g-2">
            <Col sm="6">
              <Card id="carouselExampleAutoplaying2" className="carousel slide sh-22 sh-xl-19" data-bs-ride="carousel">
                <div onClick={() => sendTo(dataSlider3.getHomePageSlider.url)} className="carousel-inner rounded ">
                  {dataSlider3 && (
                    <div className="carousel-item active">
                      <img src={dataSlider3.getHomePageSlider.images[0]} className="card-image h-100 scale" alt="..." />
                    </div>
                  )}
                  {dataSlider3 &&
                    dataSlider3.getHomePageSlider.images.map(
                      (item, index) =>
                        !(index === 0) && (
                          <div key={index} className="carousel-item">
                            <img src={item} className="card-image h-100 scale" alt="..." />
                          </div>
                        )
                    )}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying2" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true" />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying2" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true" />
                  <span className="visually-hidden">Next</span>
                </button>
              </Card>
            </Col>
            <Col sm="6">
              <Card id="carouselExampleAutoplaying3" className="carousel slide sh-22 sh-xl-19 " data-bs-ride="carousel">
                <div onClick={() => sendTo(dataSlider4.getHomePageSlider.url)} className="carousel-inner rounded">
                  {dataSlider4 && (
                    <div className="carousel-item active">
                      <img src={dataSlider4.getHomePageSlider.images[0]} className="card-image h-100 scale" alt="..." />
                    </div>
                  )}
                  {dataSlider4 &&
                    dataSlider4.getHomePageSlider.images.map(
                      (item, index) =>
                        !(index === 0) && (
                          <div key={index} className="carousel-item">
                            <img src={item} className="card-image h-100 scale" alt="..." />
                          </div>
                        )
                    )}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying3" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true" />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying3" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true" />
                  <span className="visually-hidden">Next</span>
                </button>
              </Card>
            </Col>
          </Row>
        </Col>
        {/* Cta Banners End */}
      </Row>

      {/* ADVERTISEMENT SLOT  START */}
      {dataAd1?.getAds?.active && (
        <aside>
          <div className="container-fluid px-0 mb-2">
            <div className=" container-advertisement">
              <div className="my-0">
                <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
                  <div className="carousel-inner rounded-2">
                    <div className="carousel-item active">
                      <img src={dataAd1.getAds.images} className="d-block w-100" alt="..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ADVERTISEMENT SLOT  END */}

      {/* Trending Start */}
      <h2 className="small-title">Trending</h2>
      {data && seriesData && (
        // row-cols-2 row-cols-md-3 row-cols-xl-5 row-cols-xxl-7
        <Row className="row-cols-2 row-cols-md-3 row-cols-xl-5 row-cols-xxl-7 row-cols-lg-6 g-2 mb-5">
          {data.approvedproducts?.map(
            (item, index) =>
              index < 3 && (
                <Col key={item.id}>
                  <Card className="hover-border-primary home">
                    <Badge bg="primary" className="me-1 position-absolute e-3 t-n2 z-index-1">
                      SALE
                    </Badge>
                    <Row className="g-0 h-100">
                      <img src={item.thumbnail || item.images[0]} alt={item.name} className="card-img img_1 rounded card-img-horizontal h-100 px-1 py-1" />
                    </Row>
                    <Row>
                      <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                        <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                          {item.brand_name}
                        </div>
                        <div>
                          <NavLink
                            style={{ fontWeight: 'bold' }}
                            to={`/product/${item.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                            target="_blank"
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1"
                          >
                            {item.previewName}
                          </NavLink>
                        </div>
                        {/* <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                          ₹{' '}
                          {item.variant?.length > 0 &&
                            //  item.variant[0].location[0].price}
                            Math.min(...item.variant[0].location.map((item) => item.price))}
                        </div> */}

                        {item.variant?.length > 0 && (
                          <div className="d-inline card-text my-1 mx-1 py-1 px-1">
                            {/* eslint-disable-next-line no-shadow */}
                            <p className="d-inline">₹ {Math.min(...item.variant[0].location.map((item) => item.price))} </p>
                            {/* {item.variant[0].location[0].gstType && (
                              <>
                                <p style={{ backgroundColor: 'black', color: 'white' }} className="d-inline mx-0 px-0">
                                  +GST
                                </p>
                                <p className="d-inline mx-1">{item.variant[0].location[0].gstRate}%</p>{' '}
                              </>
                            )} */}
                          </div>
                        )}
                      </Card.Body>
                    </Row>
                  </Card>
                </Col>
              )
          )}

          {seriesData.getAllSeriesProduct?.map(
            (seriesItem, index) =>
              seriesItem.seriesvariant?.length > 0 &&
              index < 3 && (
                <Col key={seriesItem.id}>
                  <Card className="hover-border-primary home">
                    <Row className="g-0 h-100 ">
                      <img
                        src={seriesItem.thumbnail || seriesItem.images[0]}
                        alt={seriesItem.name}
                        className="rounded card-img img_1 card-img-horizontal h-100 px-1 py-1"
                      />
                    </Row>
                    <Row>
                      <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                        <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                          {seriesItem.brand_name}
                        </div>
                        <div>
                          <NavLink
                            style={{ fontWeight: 'bold' }}
                            to={`/product/${seriesItem.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                            target="_blank"
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1"
                          >
                            {seriesItem.previewName}
                          </NavLink>
                        </div>
                        {/* <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                          ₹ {seriesItem.seriesvariant?.length > 0 && seriesItem.seriesvariant[0].serieslocation[0].price}
                        </div> */}
                        <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                          VIEW PRICE
                        </div>
                      </Card.Body>
                    </Row>
                  </Card>
                </Col>
              )
          )}
        </Row>
      )}

      {/* {data && seriesData && (
        <Row className="row-cols-2 row-cols-md-3 row-cols-lg-6 g-2 mb-5">
          {data.getAllProduct?.map(
            (item, index) =>
              index < 3 && (
                <Col key={item.id} className="sh-28">
                  <Card className="h-100">
                    <Card.Img src={item.images[0]} className="card-img-top sh-24" alt="card image" />
                    <Card.Body className="my-0 py-1 mx-0 px-2">
                      <h5 className="heading mb-0">
                        <NavLink to={`/product/${item.fullName.replace(/\s/g, '_').toLowerCase()}`} style={{ fontWeight: 'bold' }} className="body-link stretched-link  my-0 py-0">
                          {item.fullName}
                        </NavLink>
                      </h5>
                    </Card.Body>
                    <Card.Footer className="border-0 py-1 my-2  mx-2 px-0">
                      <div className="card-text mb-0">
                        <div style={{ fontWeight: 'bold' }}>₹ {item.variant?.length > 0 && item.variant[0].location[0].price}</div>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              )
          )}
          {seriesData.getAllSeriesProduct?.map(
            (seriesItem, index) =>
              seriesItem.seriesvariant?.length > 0 &&
              index < 3 && (
                <Col key={seriesItem.id} className="sh-28">
                  <Card className="h-100">
                    <Card.Img src={seriesItem.images[0]} className="card-img-top sh-24" alt="card image" />
                    <Card.Body className="my-0 py-1 mx-0 px-2">
                      <h5 className="heading  my-0 py-0">
                        <NavLink to={`/product/${seriesItem.fullName}`} style={{ fontWeight: 'bold' }} className="body-link stretched-link my-0 py-0">
                          {seriesItem.fullName}
                        </NavLink>
                      </h5>
                    </Card.Body>
                    <Card.Footer className="border-0 py-1 my-2  mx-2 px-0">
                      <div className="card-text">
                        <div style={{ fontWeight: 'bold' }}>
                          ₹ {seriesItem.seriesvariant?.length > 0 && seriesItem.seriesvariant[0].serieslocation[0].price}
                        </div>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              )
          )}
        </Row>
      )} */}
      {/* Trending End */}

      {/* Popular Categories Start */}
      <h2 className="small-title">Popular Categories</h2>
      <Row className="g-2 row-cols-2 row-cols-md-3 row-cols-xl-5 mb-5">
        {dataParentCat &&
          dataParentCat.getAllCategories.map(
            (cat, index) =>
              !cat.parent &&
              index < 9 && (
                <Col key={cat.id}>
                  <Card className="hover-border-primary">
                    <Row className="g-0 h-100 ">
                      <img src={cat.image} alt={cat.name} className="card-img img_1 rounded card-img-horizontal h-100 px-1 py-1" />
                    </Row>
                    <Row>
                      <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                        <div>
                          <NavLink
                            style={{ fontWeight: 'bold' }}
                            to={`/category/${cat.name.replace(/\s/g, '_').toLowerCase()}`}
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1"
                          >
                            {cat.name}
                          </NavLink>
                        </div>
                      </Card.Body>
                    </Row>
                  </Card>
                </Col>
              )
          )}
        <Col className="sh-28">
          <Card className="h-100 hover-border-primary home">
            <Card.Body className="text-center all">
              <NavLink to="/categories">
                <CsLineIcons icon="diagram-1" className="mt-6 text-primary" />
                <p className="heading mt-2 mb-0 text-body">View All</p>
                <p className="heading mt-0 text-body">Categories</p>
              </NavLink>
            </Card.Body>
          </Card>
        </Col>
        {/* <Col>
                <Card className="hover-border-primary">
                    <Row>
                      <Card.Body className="d-flex align-items-left h-100 py-0 px-2 my-1 mx-1">
                        <div>
                          <NavLink
                            style={{ fontWeight: 'bold' }}
                            to="/categories"
                            target="_blank" 
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1"
                          >
                           View All Categories
                          </NavLink>
                        </div>
                      </Card.Body>
                    </Row>
                </Card>
              </Col> */}
      </Row>

      {/* ADVERTISEMENT SLOT  START */}
      {dataAd2?.getAds?.active && (
        <aside>
          <div className="container-fluid px-0 mb-2">
            <div className="container-advertisement">
              <div className="my-0">
                <div id="carouselExampleAutoplaying" className="carousel slide" data-bs-ride="carousel">
                  <div className="carousel-inner rounded-2">
                    <div className="carousel-item active">
                      <img src={dataAd2.getAds.images} className="d-block w-100" alt="..." />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ADVERTISEMENT SLOT  END */}

      {/* <Row className="g-2 row-cols-2 row-cols-md-3 row-cols-xl-6 mb-5">
        {dataParentCat &&
          dataParentCat.getAllCategories.map(
            (cat, index) =>
              !cat.parent &&
              index < 8 && (
                <Col key={cat.id} className="py-1 px-1 mx-0 my-0 sh-28">
                  <Card className="h-100 hover-border-primary py-1 px-1 mx-0 my-0 ">
                    <Card.Body className="text-center py-1 px-1 mx-0 my-0">
                      <img alt="Cat Images" src={cat.image} className="py-0 my-0 align-items-left card-img sh-24" />
                      <NavLink
                        to={`/category/${cat.name.replace(/\s/g, '_').toLowerCase()}`}
                        style={{ fontWeight: 'bold' }}
                        className="body-link stretched-link"
                      >
                       
                        <p className="heading my-1 mx-1 px-0 py-0">{cat.name}</p>
                       
                      </NavLink>
                    </Card.Body>
                  </Card>
                </Col>
              )
          )}
        <Col className="sh-28">
          <Card className="h-100 hover-border-primary">
            <Card.Body className="text-center">
              <NavLink to="/categories">
                <CsLineIcons icon="diagram-1" className="mt-6 text-primary" />
                <p className="heading mt-2 mb-0 text-body">View All</p>
                <p className="heading mt-0 text-body">Categories</p>
                
              </NavLink>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
      {/* Popular Categories End */}

      {/* Discover Start */}
      <h2 className="small-title">Discover</h2>
      {data && seriesData && DataTMT && (
        <Row className="g-2 row-cols-2 row-cols-md-3 row-cols-xl-5 row-cols-xxl-7">
          {/* // Single Products  */}
          {data.approvedproducts?.map(
            (item) =>
              item.variant.length > 0 && (
                <Col key={item.id}>
                  <Card className="hover-border-primary home">
                    <Row className="g-0 h-100 ">
                      <img
                        src={item.thumbnail || (item.images && item.images[0])}
                        alt={item.fullName}
                        className="card-img img_1 rounded card-img-horizontal h-100 px-1 py-1"
                      />
                    </Row>
                    <Row>
                      <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                        <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                          {item.brand_name}
                        </div>
                        <div>
                          <NavLink
                            style={{ fontWeight: 'bold' }}
                            to={`/product/${item.identifier.replace(/\s/g, '_').toLowerCase()}`}                            
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1"
                          >
                            {item.previewName}
                          </NavLink>
                          {item.variant?.length > 0 && (
                            <div className="d-inline card-text my-1 mx-1 py-1 px-1">
                              {/* eslint-disable-next-line no-shadow */}
                              <p className="d-inline">₹ {Math.min(...item.variant[0].location.map((item) => item.price))} </p>
                              {item.variant[0].location[0].gstType && (
                                <>
                                  <p style={{ backgroundColor: 'black', color: 'white' }} className="d-inline mx-0 px-0">
                                    +GST
                                  </p>
                                  <p className="d-inline mx-1">{item.variant[0].location[0].gstRate}%</p>{' '}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Row>
                  </Card>
                </Col>
              )
          )}
          {/* // Series Products */}
          {seriesData.getAllSeriesProduct?.map(
            (seriesItem) =>
              seriesItem.seriesvariant?.length > 0 && (
                <Col key={seriesItem.id}>
                  <Card className="hover-border-primary home">
                    <Row className="g-0  h-100 ">
                      <img
                        src={seriesItem.thumbnail || seriesItem.images[0]}
                        alt={seriesItem.fullName}
                        className="rounded card-img img_1 card-img-horizontal h-100 px-1 py-1"
                      />
                    </Row>
                    <Row>
                      <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                        <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                          {seriesItem.brand_name}
                        </div>
                        <div>
                          <NavLink
                            to={`/product/${seriesItem.identifier?.replace(/\s/g, '_').toLowerCase()}`}                            
                            style={{ fontWeight: 'bold' }}
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1"
                          >
                            {seriesItem.previewName}
                          </NavLink>
                          {/* {seriesItem.seriesvariant?.length > 0 && (
                            <div className="d-inline card-text my-1 mx-1 py-1 px-1">
                              <p className="d-inline">₹{Math.min(...seriesItem.seriesvariant[0].serieslocation.map((item) => item.price))}</p>
                              {seriesItem.seriesvariant[0].serieslocation[0].gstType && (
                                <>
                                  <p style={{ backgroundColor: 'black', color: 'white' }} className="d-inline mx-0 px-0">
                                    +GST
                                  </p>
                                  <p className="d-inline mx-1">{seriesItem.seriesvariant[0].serieslocation[0].gstRate}%</p>{' '}
                                </>
                              )}
                            </div>
                          )} */}

                          <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                            VIEW PRICE
                          </div>
                        </div>
                      </Card.Body>
                    </Row>
                  </Card>
                </Col>
              )
          )}
          {DataTMT.getAllTMTSeriesProduct.map(
            (itemTMT) =>
              itemTMT.tmtseriesvariant?.length > 0 && (
                <Col key={itemTMT.id}>
                  <Card className="hover-border-primary home">
                    <Row className="g-0 h-100 ">
                      <img
                        src={itemTMT.thumbnail || (itemTMT.images && itemTMT.images[0])}
                        alt={itemTMT.fullName}
                        className="card-img  img_1 rounded card-img-horizontal h-100  px-1 py-1"
                      />
                    </Row>
                    <Row>
                      <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                        <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                          {itemTMT.brand_name}
                        </div>
                        <div>
                          <NavLink
                            to={`/product/${itemTMT.identifier?.replace(/\s/g, '_').toLowerCase()}`}                           
                            style={{ fontWeight: 'bold' }}
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1"
                          >
                            {itemTMT.previewName}
                          </NavLink>

                          {!itemTMT.section ? (
                            <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                              VIEW PRICE
                            </div>
                          ) : (
                            itemTMT.tmtseriesvariant?.length > 0 && (
                              <div className="d-inline card-text my-1 mx-1 py-1 px-1">
                                <p className="d-inline">₹{Math.min(...itemTMT.tmtseriesvariant[0].tmtserieslocation.map((item) => item.price))}</p>
                                {itemTMT.tmtseriesvariant[0].tmtserieslocation[0].gstType && (
                                  <>
                                    <p style={{ backgroundColor: 'black', color: 'white' }} className="d-inline mx-0 px-0">
                                      +GST
                                    </p>
                                    <p className="d-inline mx-1">{itemTMT.tmtseriesvariant[0].tmtserieslocation[0].gstRate}%</p>{' '}
                                  </>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </Card.Body>
                    </Row>
                  </Card>
                </Col>
              )
          )}
        </Row>
      )}

      {/* Categories Modal Start */}
      {!isXlScreen && (
        <Modal className="modal-right" show={isOpenCategoriesModal} onHide={() => setIsOpenCategoriesModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">Categories</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CategoryMenuContent />
          </Modal.Body>
        </Modal>
      )}
      {/* Categories Modal End */}
      {/* <Modal size="sm" aria-labelledby="contained-modal-title-vcenter" centered show={isLoaded} onHide={() => setIsLoaded(!isLoaded)}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Connect with us !</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="userdetail" className="tooltip-end-bottom">
            <div className="mb-3 filled form-group tooltip-end-top">
              <CsLineIcons icon="suitcase" />
              <Form.Control type="text" name="username" placeholder="Enter User Name" />
            </div>

            <div className="mb-3 filled form-group tooltip-end-top">
              <CsLineIcons icon="phone" />
              <Form.Control type="phone" name="phone" placeholder="Enter Mobile No" />
            </div>

            <div className="text-center">
              <button className="btn btn-primary btn-lg" type="submit">
                Submit
              </button>
            </div>
          </form>
        </Modal.Body>
       <Modal.Footer>
          <Button onClick={() => setIsLoaded(!isLoaded)}>Close</Button>
        </Modal.Footer> 
      </Modal> */}

      {/* ADVERTISEMENT SLOT  START */}
      <aside>
        <Row className="g-4 mt-2">
          {dataAdDown1?.getAds?.active && (
            <Col sm="6" lg="3">
              <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
                <img src={dataAdDown1.getAds.images} className="card-img img_1 h-100 scale" alt="card image" />
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
          )}
          {dataAdDown2?.getAds?.active && (
            <Col sm="6" lg="3">
              <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
                <img src={dataAdDown2.getAds.images} className="card-img  img_1 h-100 scale" alt="card image" />
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
          )}
          {dataAdDown3?.getAds?.active && (
            <Col sm="6" lg="3">
              <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
                <img src={dataAdDown3.getAds.images} className="card-img img_1 h-100 scale" alt="card image" />
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
          )}
          {dataAdDown4?.getAds?.active && (
            <Col sm="6" lg="3">
              <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
                <img src={dataAdDown4.getAds.images} className="card-img  img_1 h-100 scale" alt="card image" />
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
          )}
        </Row>
      </aside>

      {/* ADVERTISEMENT SLOT  END */}
    </>
  );
};

export default Home;
