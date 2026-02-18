import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useWindowSize } from 'hooks/useWindowSize';
import { Row, Col, Button, Card, Modal } from 'react-bootstrap';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import * as bootstrap from 'bootstrap';
import StoreFeatures from 'globalValue/storeFeatures/StoreFeatures';
import { useLazyQuery, gql } from '@apollo/client';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import CategoryMenuContent from './components/CategoryMenuContent';
import './style.css';
import HomeTrending from './HomeTrending';

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

const GET_PARENT_CATEGORY = gql`
  query GetAllCategories($limit: Int, $offset: Int) {
    getAllCategories(limit: $limit, offset: $offset) {
      id
      image
      name
      order
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

/* Banner/stamp queries removed — ads will display on category pages only */

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

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;

const Home = () => {
  const { dataStoreFeatures1 } = useGlobleContext();
  const history = useHistory();
  const dispatch = useDispatch();
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(6);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const storedata = StoreFeatures();

  // console.log('storedata', storedata);

  // SEO Title and Descriptio found
  const [getSeoTitle, { data: dataSeoTitle }] = useLazyQuery(GET_SITE_CONTENT);
  const [getSeoDescription, { data: dataSeoDescription }] = useLazyQuery(GET_SITE_CONTENT);
  useEffect(() => {
    getSeoTitle({
      variables: {
        key: 'seotitle',
      },
    });
    getSeoDescription({
      variables: {
        key: 'seodescription',
      },
    });
  }, [dataSeoTitle, dataSeoDescription]);
  // SEO Title and Descriptio found -------------

  const [getAdContent1PC, { data: dataAd1PC }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContent2PC, { data: dataAd2PC }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContent3PC, { data: dataAd3PC }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContent1Mobile, { data: dataAd1Mobile }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContent2Mobile, { data: dataAd2Mobile }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContent3Mobile, { data: dataAd3Mobile }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContentDown1, { data: dataAdDown1 }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContentDown2, { data: dataAdDown2 }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContentDown3, { data: dataAdDown3 }] = useLazyQuery(GET_AD_CONTENT);
  const [getAdContentDown4, { data: dataAdDown4 }] = useLazyQuery(GET_AD_CONTENT);
  useEffect(() => {
    getAdContent1PC({
      variables: {
        key: 'Home1',
      },
    });
    getAdContent2PC({
      variables: {
        key: 'Home2',
      },
    });
    getAdContent3PC({
      variables: {
        key: 'Home3',
      },
    });
    getAdContent1Mobile({
      variables: {
        key: 'Home1Mobile',
      },
    });
    getAdContent2Mobile({
      variables: {
        key: 'Home2Mobile',
      },
    });
    getAdContent3Mobile({
      variables: {
        key: 'Home3Mobile',
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

  // GET PARENT CATEGORY

  const [getCategrories, { data: dataParentCat, fetchMore, refetch }] = useLazyQuery(GET_PARENT_CATEGORY);

  // const [getSlides, { error: errorSlider1, data: dataSlider, loading }] = useLazyQuery(GET_HOME_PAGE_SLIDER_IMAGES);

  const [getSlides, { error: errorSlider1, data: dataSlider, loading }] = useLazyQuery(GET_HOME_PAGE_SLIDER_IMAGES);

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

  // Ads are shown only on category pages; home page left unchanged

  useEffect(() => {
    getCategrories({
      variables: {
        limit,
        offset,
      },
    });
    refetch();
  }, [getCategrories, offset, limit]);

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

  // Series Product

  // TMT Series Product

  const sendTo = (event) => {
    window.location.href = event;
  };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  // useEffect(() => {
  //   const orderID = sessionStorage.getItem('orderID') || localStorage.getItem('orderID');
  //   if (!orderID) return;

  //   if (!sessionStorage.getItem('orderID')) {
  //     sessionStorage.setItem('orderID', orderID);
  //     localStorage.removeItem('orderID');
  //   }

  //   history.replace(`/order/${orderID}`, { from: window.location.pathname });
  // }, []);

  return (
    <>
      <HtmlHead title={dataSeoTitle?.getSiteContent?.content} description={dataSeoDescription?.getSiteContent?.content} />
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
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

      <Row>
        {isXlScreen && (
          <Col xl="3" className=" d-none d-xl-block mb-5">
            <Card className="mx-1 px-1">
              <div className="mx-1 px-1 d-flex pt-3 flex-column justify-content-between">
                <CategoryMenuContent />
              </div>
            </Card>
          </Col>
        )}

        <Col xl="9" className="mb-0">
          {/* Home page unchanged - banner ads removed */}
          <Row className="g-2 mb-2">
            <Col sm="6" md="6">
              <div id="carouselExampleAutoplaying" className="carousel slide sh-48 " data-bs-ride="carousel">
                <div onClick={() => sendTo(dataSlider.getHomePageSlider.url)} className="carousel-inner rounded">
                  {dataSlider?.getHomePageSlider?.images?.length > 0 && (
                    <div className="carousel-item active">
                      <img src={dataSlider?.getHomePageSlider?.images[0]} className="responsive card-image h-100 scale" alt="..." />
                    </div>
                  )}
                  {dataSlider &&
                    dataSlider?.getHomePageSlider?.images?.length > 0 &&
                    dataSlider.getHomePageSlider.images.map(
                      (item, index) =>
                        !(index === 0) && (
                          <div key={index} className="carousel-item">
                            <img src={item} className="responsive card-image h-100 scale" alt="..." />
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
              </div>
            </Col>
            <Col sm="6" md="6">
              <div id="carouselExampleAutoplaying1" className="carousel slide  sh-48 " data-bs-ride="carousel">
                <div onClick={() => sendTo(dataSlider2.getHomePageSlider.url)} className="carousel-inner rounded">
                  {dataSlider2?.getHomePageSlider?.images?.length > 0 && (
                    <div className="carousel-item active">
                      <img src={dataSlider2.getHomePageSlider.images[0]} className="responsive card-image h-100 scale" alt="..." />
                    </div>
                  )}
                  {dataSlider2?.getHomePageSlider?.images?.length > 0 &&
                    dataSlider2.getHomePageSlider.images.map(
                      (item, index) =>
                        !(index === 0) && (
                          <div key={index} className="carousel-item">
                            <img src={item} className="responsive card-image h-100 scale" alt="..." />
                          </div>
                        )
                    )}
                </div>
                <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying1" data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true" />
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying1" data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true" />
                  <span className="visually-hidden">Next</span>
                </button>
              </div>
            </Col>
          </Row>
          {dataSlider3?.getHomePageSlider?.images[0] && (
            <Row className="g-2">
              <Col sm="6">
                <div id="carouselExampleAutoplaying2" className="carousel slide sh-48" data-bs-ride="carousel">
                  <div onClick={() => sendTo(dataSlider3.getHomePageSlider.url)} className="carousel-inner rounded">
                    {dataSlider3 && dataSlider3.getHomePageSlider?.images?.length > 0 && (
                      <div className="carousel-item active">
                        <img src={dataSlider3.getHomePageSlider.images[0]} className="responsive card-image scale" alt="..." />
                      </div>
                    )}
                    {dataSlider3 &&
                      dataSlider3.getHomePageSlider?.images?.length > 0 &&
                      dataSlider3.getHomePageSlider.images.map(
                        (item, index) =>
                          !(index === 0) && (
                            <div key={index} className="carousel-item">
                              <img src={item} className="responsive card-image scale" alt="..." />
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
                </div>
              </Col>
              <Col sm="6">
                <div id="carouselExampleAutoplaying3" className="carousel slide sh-48" data-bs-ride="carousel">
                  <div onClick={() => sendTo(dataSlider4.getHomePageSlider.url)} className="carousel-inner rounded">
                    {dataSlider4?.getHomePageSlider?.images?.length > 0 && (
                      <div className="carousel-item active">
                        <img src={dataSlider4.getHomePageSlider.images[0]} className="responsive card-image h-100 scale" alt="..." />
                      </div>
                    )}
                    {dataSlider4?.getHomePageSlider?.images?.length > 0 &&
                      dataSlider4.getHomePageSlider.images.map(
                        (item, index) =>
                          !(index === 0) && (
                            <div key={index} className="carousel-item">
                              <img src={item} className="responsive card-image h-100 scale" alt="..." />
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
                </div>
              </Col>
            </Row>
          )}
        </Col>
      </Row>

      <Card className="px-0 my-2 mt-4">
        <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 fs-5 rounded">Trending</div>
        <Row className="row-cols-2 row-cols-md-3 row-cols-xl-5 row-cols-xxl-7 row-cols-lg-6 g-2 mb-0 mt-0 ms-1 me-1">
          <HomeTrending position={0} section="tranding" />
          <HomeTrending position={1} section="tranding" />
          <HomeTrending position={2} section="tranding" />
          <HomeTrending position={3} section="tranding" />
          <HomeTrending position={4} section="tranding" />
          {!isXlScreen && <HomeTrending position={5} section="tranding" />}
        </Row>
      </Card>

      <Card className="px-0 my-2 mt-4">
        <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 fs-5 rounded">What's New</div>
        <Row className="row-cols-2 row-cols-md-3 row-cols-xl-5 row-cols-xxl-7 row-cols-lg-6 g-2 mb-0 mt-0 ms-1 me-1">
          <HomeTrending position={0} section="disply" />
          <HomeTrending position={1} section="disply" />
          <HomeTrending position={2} section="disply" />
          <HomeTrending position={3} section="disply" />
          <HomeTrending position={4} section="disply" />
          {!isXlScreen && <HomeTrending position={5} section="disply" />}
        </Row>
      </Card>

      {/* Stamp ads removed from home page; stamps show only on category pages */}

      {/* ADVERTISEMENT SLOT  START 1 */}
      {dataAd1PC?.getAds?.active && (
        <aside className="d-none d-md-block">
          <Card className="hover-border-primary card">
            <div id="carouselExampleAutoplaying" data-bs-ride="carousel">
              <div onClick={() => sendTo(dataAd1PC.getAds.url)} className="m-1">
                <img src={dataAd1PC.getAds.images} className="d-block w-100 rounded" alt="PC Ad" />
              </div>
            </div>
          </Card>
        </aside>
      )}
      {dataAd1Mobile?.getAds?.active && (
        <aside className="d-block d-md-none">
          <Card className="hover-border-primary card">
            <div id="carouselExampleAutoplaying" data-bs-ride="carousel">
              <div onClick={() => sendTo(dataAd1Mobile.getAds.url)} className="m-1">
                <img src={dataAd1Mobile.getAds.images} className="d-block w-100 rounded" alt="Mobile Ad" />
              </div>
            </div>
          </Card>
        </aside>
      )}
      {/* ADVERTISEMENT SLOT  END */}

      {/* Popular Categories -------------   Start */}
      <div className="fw-bold py-1 text-center bg_color pt-1 pb-1 fs-5 rounded mt-4">
        {dataParentCat ? (
          <>
            <Button
              variant="outline-link"
              className="d-inline btn-icon-only px-0"
              onClick={() => handlePageChange(Math.max(offset - limit, 0))}
              disabled={offset === 0}
            >
              <CsLineIcons icon="chevron-left" />
            </Button>
            <b className="text-center px-4 px-4">Popular Categories</b>
            <Button
              variant="outline-link"
              className="d-inline btn-icon-only mx-0 px-0"
              onClick={() => handlePageChange(offset + limit)}
              disabled={dataParentCat.getAllCategories?.length < limit}
            >
              <CsLineIcons icon="chevron-right" />
            </Button>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Row className="g-2 row-cols-2 row-cols-md-3 row-cols-xl-5 mb-2 mt-0">
        {dataParentCat &&
          dataParentCat.getAllCategories
            .slice(0, isXlScreen ? 5 : 2)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((cat, index) => (
              <Col key={cat.id}>
                <Card className="hover-border-primary pb-2">
                  <Row className="g-0 h-100">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="rounded p-1" />
                    ) : (
                      <div className="w-100 d-flex justify-content-center align-items-center">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}
                  </Row>
                  <div style={{ marginTop: '-20px' }} className="rounded border mx-3">
                    {cat.image ? (
                      <NavLink
                        to={`/category/${cat.name.replace(/\s/g, '_').toLowerCase()}`}
                        className="body-link stretched-link d-block py-1 px-1 rounded bg-info text-center text-white"
                      >
                        {cat.name}
                      </NavLink>
                    ) : (
                      <div className="d-flex justify-content-center py-1 px-1 bg-info text-center text-white rounded">Loading...</div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
      </Row>

      {!dataParentCat && (
        <Row className="g-2 row-cols-2 row-cols-md-3 row-cols-xl-5 mb-5">
          <Col className="col-auto">
            <div style={{ height: '250px' }} className="card" aria-hidden="true" />
          </Col>
          <Col className="col-auto">
            <div style={{ height: '250px' }} className="card" aria-hidden="true" />
          </Col>
          <Col className="col-auto">
            <div style={{ height: '250px' }} className="card" aria-hidden="true" />
          </Col>
          <Col className="col-auto">
            <div style={{ height: '250px' }} className="card" aria-hidden="true" />
          </Col>
          <Col className="col-auto">
            <div style={{ height: '250px' }} className="card" aria-hidden="true" />
          </Col>
        </Row>
      )}
      {/* Popular Categories -------------   End */}

      {/* ADVERTISEMENT SLOT  START 2 */}
      {dataAd2PC?.getAds?.active && (
        <aside className="d-none d-md-block">
          <Card className="hover-border-primary card">
            <div id="carouselExampleAutoplaying" data-bs-ride="carousel">
              <div onClick={() => sendTo(dataAd2PC.getAds.url)} className="m-1">
                <img src={dataAd2PC.getAds.images} className="d-block w-100 rounded" alt="PC Ad" />
              </div>
            </div>
          </Card>
        </aside>
      )}
      {dataAd2Mobile?.getAds?.active && (
        <aside className="d-block d-md-none">
          <Card className="hover-border-primary card">
            <div id="carouselExampleAutoplaying" data-bs-ride="carousel">
              <div onClick={() => sendTo(dataAd2Mobile.getAds.url)} className="m-1">
                <img src={dataAd2Mobile.getAds.images} className="d-block w-100 rounded" alt="Mobile Ad" />
              </div>
            </div>
          </Card>
        </aside>
      )}
      {/* ADVERTISEMENT SLOT  END */}

      {/* Discover Start */}
      <Card className="px-0 my-2 mt-4">
        <div className="text-center fw-bold py-1 bg_color pt-2 pb-2 fs-5 rounded">Discover</div>
        <Row className="row-cols-2 row-cols-md-3 row-cols-xl-5 row-cols-xxl-7 row-cols-lg-6 g-2 mb-0 mt-0 ms-1 me-1">
          <HomeTrending position={0} section="discover" />
          <HomeTrending position={1} section="discover" />
          <HomeTrending position={2} section="discover" />
          <HomeTrending position={3} section="discover" />
          <HomeTrending position={4} section="discover" />
          {!isXlScreen && <HomeTrending position={5} section="discover" />}
        </Row>
      </Card>

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

      {/* ADVERTISEMENT SLOT  START 3 */}
      {dataAd3PC?.getAds?.active && (
        <aside className="d-none d-md-block">
          <Card className="hover-border-primary card">
            <div id="carouselExampleAutoplaying" data-bs-ride="carousel">
              <div onClick={() => sendTo(dataAd3PC.getAds.url)} className="m-1">
                <img src={dataAd3PC.getAds.images} className="d-block w-100 rounded" alt="PC Ad" />
              </div>
            </div>
          </Card>
        </aside>
      )}
      {dataAd3Mobile?.getAds?.active && (
        <aside className="d-block d-md-none">
          <Card className="hover-border-primary card">
            <div id="carouselExampleAutoplaying" data-bs-ride="carousel">
              <div onClick={() => sendTo(dataAd3Mobile.getAds.url)} className="m-1">
                <img src={dataAd3Mobile.getAds.images} className="d-block w-100 rounded" alt="Mobile Ad" />
              </div>
            </div>
          </Card>
        </aside>
      )}
      {/* ADVERTISEMENT SLOT  END */}

      {/* ADVERTISEMENT SLOT  START STAMP SIZE */}
      <aside>
        <Row className="g-4 mt-4 pb-4 mark">
          {dataAdDown1?.getAds?.active && (
            <Col xs="6" sm="6" lg="3" className="px-1">
              <Card onClick={() => sendTo(dataAdDown1.getAds.url)} className="w-100  hover-img-scale-up hover-border-primary">
                <img src={dataAdDown1.getAds.images} className="img-fluid h-100 scale" alt="card image" />
              </Card>
            </Col>
          )}
          {dataAdDown2?.getAds?.active && (
            <Col xs="6" sm="6" lg="3" className="px-1">
              <Card onClick={() => sendTo(dataAdDown2.getAds.url)} className="w-100 hover-img-scale-up hover-border-primary">
                <img src={dataAdDown2.getAds.images} className="img-fluid   h-100 scale" alt="card image" />
              </Card>
            </Col>
          )}
          {dataAdDown3?.getAds?.active && (
            <Col xs="6" sm="6" lg="3" className="px-1">
              <Card onClick={() => sendTo(dataAdDown3.getAds.url)} className="w-100 hover-img-scale-up hover-border-primary">
                <img src={dataAdDown3.getAds.images} className="img-fluid   h-100 scale" alt="card image" />
              </Card>
            </Col>
          )}
          {dataAdDown4?.getAds?.active && (
            <Col xs="6" sm="6" lg="3" className="px-1">
              <Card onClick={() => sendTo(dataAdDown4.getAds.url)} className="w-100 hover-img-scale-up hover-border-primary">
                <img src={dataAdDown4.getAds.images} className="img-fluid h-100 scale" alt="card image" />
              </Card>
            </Col>
          )}
        </Row>
      </aside>
      {/* ADVERTISEMENT SLOT END STAMP SIZE */}

      {/* Company Title and description */}
      <Row className="mt-2 p-2 pt-4 pb-2 bg-white text-center">
        <div className="text-center bg-white pt-4 pb-3 rounded">
          <h1 className="fs-3 fw-bold pb-2 text-dark">{dataSeoTitle?.getSiteContent?.content}</h1>
        </div>
        <h2 className="fs-6 text-dark">
          <p>{dataSeoDescription?.getSiteContent?.content}</p>
        </h2>
      </Row>
      {/* Company Title and description -------------------*/}
    </>
  );
};

export default Home;
