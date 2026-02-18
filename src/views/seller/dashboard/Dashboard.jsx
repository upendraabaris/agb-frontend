import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Row, Col, Dropdown, Card, Badge } from 'react-bootstrap';
import Rating from 'react-rating';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import Clamp from 'components/clamp';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const Chart = () => {
  const title = 'Dashboard';
  const description = 'Dashboard Page';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GETPRODUCTSLIST = gql`
    query GetProductByForSeller {
      getProductByForSeller {
        id
        variant {
          location {
            pincode
            priceType
            price
            gstType
            gstRate
            extraChargeType
            extraCharge
            transportChargeType
            transportCharge
            finalPrice
          }
          variantName
          moq
        }
        brand_name
        previewName
        fullName
        thumbnail
        description
        giftOffer
        sellerNotes
        video
        youtubeLink
        catalogue
        images
        categories
      }
    }
  `;

  const GET_SERIES_PRODUCT = gql`
    query GetSeriesProductByForSeller {
      getSeriesProductByForSeller {
        brand_name
        fullName
        id
        images
        seriesvariant {
          id
          serieslocation {
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
          }
          variantName
          moq
        }
      }
    }
  `;

  const GET_DELIVERED_ORDER_SUMMARY = gql`
    query GetDeliveredOrderSummary {
      getDeliveredOrderSummary {
        count
        totalAmount
      }
    }
  `;

  const { data } = useQuery(GETPRODUCTSLIST, {
    onError: (err) => {
      console.log('GETPRODUCTSLIST', err);
    },
  });
  const { data: seriesData } = useQuery(GET_SERIES_PRODUCT, {
    onError: (err) => {
      console.log('GET_SERIES_PRODUCT', err);
    },
  });

  const { data: deliveredOrderSummaryData } = useQuery(GET_DELIVERED_ORDER_SUMMARY, {
    onError: (err) => {
      console.log('GET_DELIVERED_ORDER_SUMMARY', err);
    },
  });

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mt-2 d-flex justify-content-between align-items-center">
        <h1 className="mb-0 pb-0 fs-5 fw-bold" id="title">
          Seller Associate Dashboard
        </h1>

        <NavLink to="/seller/profile" className="btn btn-outline-primary">
          Profile
        </NavLink>
      </div>

      <Row className="mb-5 g-2">
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="dollar" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">EARNINGS</div>
              <div className="text-dark fw-bold cta-4"> {deliveredOrderSummaryData?.getDeliveredOrderSummary?.totalAmount?.toFixed(2)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <NavLink to="/seller/order/list" className="text-decoration-none">
            <Card className="h-100 hover-scale-up cursor-pointer">
              <Card.Body className="d-flex flex-column align-items-center">
                <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                  <CsLineIcons icon="cart" className="text-primary" />
                </div>
                <div className="mb-1 align-items-center text-dark">ORDERS</div>
                <div className="text-dark fw-bold cta-4">{deliveredOrderSummaryData?.getDeliveredOrderSummary?.count}</div>
              </Card.Body>
            </Card>
          </NavLink>
        </Col>
        <Col xs="6" md="4" lg="2">
          <NavLink to="/seller/product/list" className="text-decoration-none">
            <Card className="h-100 hover-scale-up cursor-pointer">
              <Card.Body className="d-flex flex-column align-items-center">
                <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                  <CsLineIcons icon="server" className="text-primary" />
                </div>
                <div className="mb-1 align-items-center text-dark">SINGLE</div>
                {data?.getProductByForSeller && <div className="text-dark fw-bold cta-4">{data.getProductByForSeller.length}</div>}
              </Card.Body>
            </Card>
          </NavLink>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="user" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">SERIES</div>
              {seriesData?.getSeriesProductByForSeller && <div className="text-dark fw-bold cta-4">{seriesData.getSeriesProductByForSeller.length}</div>}
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="arrow-top-left" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">RETURNS</div>
              <div className="text-dark fw-bold cta-4">2</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="message" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">TMT</div>
              <div className="text-dark fw-bold cta-4">5</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div>
        {data && seriesData && (
          <Row className="g-2 row-cols-1 row-cols-md-2 row-cols-xl-2 row-cols-xxl-3">
            {data.getProductByForSeller.map((items) => (
              <Col key={items.id}>
                <Card>
                  <Row className="g-0 sh-16 sh-sm-17">
                    <Col xs="auto" className="h-100 position-relative">
                      <img src={items.thumbnail || (items.images && items.images[0])} alt="alternate text" className="p-2 h-100 sw-11 sw-sm-16 sw-lg-20" />
                    </Col>
                    <Col>
                      <Card.Body className="d-flex align-items-center h-100 py-3">
                        <div className="mb-0 h6">
                          <NavLink to="#/!" className="body-link stretched-link d-block mb-1 sh-3 h6 lh-1-5">
                            <Clamp tag="span" clamp="1">
                              {items.fullName}
                            </Clamp>
                          </NavLink>
                          <div className="card-text mb-2">
                            <div className="text-muted text-overline text-small sh-2">
                              <del>₹ {items.variant[0].location[0].price - 3}</del>
                            </div>
                            <div>₹ {items.variant[0].location[0].price}</div>
                          </div>
                          <div>
                            <Rating
                              initialRating={5}
                              readonly
                              emptySymbol={<i className="cs-star text-primary" />}
                              fullSymbol={<i className="cs-star-full text-primary" />}
                            />
                            <div className="text-muted d-inline-block text-small align-text-top">(5)</div>
                          </div>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
            {seriesData.getSeriesProductByForSeller.map((items) => (
              <Col key={items.id}>
                <Card>
                  <Row className="g-0 sh-16 sh-sm-17">
                    <Col xs="auto" className="h-100 position-relative">
                      <Badge bg="primary" className="me-1 position-absolute e-n2 t-2 z-index-1">
                        SALE
                      </Badge>
                      <img
                        src={items.thumbnail || items.images[0]}
                        alt="alternate text"
                        className="card-img card-img-horizontal h-100 sw-11 sw-sm-16 sw-lg-20"
                      />
                    </Col>
                    <Col>
                      <Card.Body className="d-flex align-items-center h-100 py-3">
                        <div className="mb-0 h6">
                          <NavLink to="#/!" className="body-link stretched-link d-block mb-1 sh-3 h6 lh-1-5">
                            <Clamp tag="span" clamp="1">
                              {items.fullName}
                            </Clamp>
                          </NavLink>
                          <div className="card-text mb-2">
                            <div className="text-muted text-overline text-small sh-2">
                              <del>₹ {items.price - 3}</del>
                            </div>
                            <div>₹ {items.price}</div>
                          </div>
                          <div>
                            <Rating
                              initialRating={5}
                              readonly
                              emptySymbol={<i className="cs-star text-primary" />}
                              fullSymbol={<i className="cs-star-full text-primary" />}
                            />
                            <div className="text-muted d-inline-block text-small align-text-top">(5)</div>
                          </div>
                        </div>
                      </Card.Body>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </>
  );
};

export default Chart;
