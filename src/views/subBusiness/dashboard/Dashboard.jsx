import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

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

const Chart = () => {
  const title = 'Dealer Dashboard';
  const description = 'Dealer Dashboard';
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

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
      <div className="page-title-container mt-2">
        <h1 className="mb-0 pb-0 fs-5 fw-bold" id="title">
          Dealer Dashboard
        </h1>
      </div>
      {currentUser?.seller?.dealerstatus ? (
        <Row className="mb-5 g-2">
          <Col xs="6" md="4" lg="2">
            <Card className="h-100 hover-scale-up cursor-pointer">
              <Card.Body className="d-flex flex-column align-items-center">
                <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                  <CsLineIcons icon="dollar" className="text-primary" />
                </div>
                <div className="mb-1 align-items-center text-dark">EARNINGS</div>
                <div className="text-dark fw-bold cta-4"> 0</div>
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
                <div className="text-dark fw-bold cta-4"> 0</div>
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
                <div className="text-dark fw-bold cta-4"> 0</div>
                {/* {data?.getProductByForSeller && <div className="text-dark fw-bold cta-4">{data.getProductByForSeller.length}</div>} */}
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
                <div className="text-dark fw-bold cta-4"> 0</div>
                {/* {seriesData?.getSeriesProductByForSeller && <div className="text-dark fw-bold cta-4">{seriesData.getSeriesProductByForSeller.length}</div>} */}
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
                <div className="text-dark fw-bold cta-4"> 0</div>
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
                <div className="text-dark fw-bold cta-4"> 0</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Card className="border-0 shadow-sm mt-5">
          <Card.Body className="text-center py-5">
            <CsLineIcons icon="clock" className="text-danger mb-3" size="24" />
            <h5 className="fw-semibold text-danger">Account Approval Pending</h5>
            <p className="text-muted mb-1">Your account is currently under review.</p>
            <p className="text-muted">Please wait for approval or contact our support team for help.</p>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default Chart;
