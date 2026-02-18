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
  const title = 'Service Associate Dashboard';
  const description = 'Service Associate Dashboard';
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

  return (
    <>
      <HtmlHead title={title} description={description} />
      {/* Title Start */}
      <div className="page-title-container mt-2">        
        <h1 className="mb-0 pb-0 fs-5 fw-bold" id="title">
          Service Associate Dashboard
        </h1>
      </div>
      {/* Title End */}

      {/* Stats Start */}
      {/* <div className="d-flex">
        <Dropdown>
          <Dropdown.Toggle className="small-title p-0 align-top h-auto me-2" variant="link">
            Today's
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item>Weekly</Dropdown.Item>
            <Dropdown.Item>Monthly</Dropdown.Item>
            <Dropdown.Item>Yearly</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <h2 className="small-title">Stats</h2>
      </div> */}
      <Row className="mb-5 g-2">
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="dollar" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">EARNINGS</div>
              <div className="text-dark fw-bold cta-4"> 3150.20</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="cart" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">ORDERS</div>
              <div className="text-dark fw-bold cta-4">
                16
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="server" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">SINGLE</div>
              {data?.getProductByForSeller && <div className="text-dark fw-bold cta-4">{data.getProductByForSeller.length}</div>}
            </Card.Body>
          </Card>
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


    </>
  );
};

export default Chart;
