import React, { useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const USER_NUMBER = gql`
  query GetUsers {
    getUsers {
      id
    }
  }
`;
const SELLER_NUMBER = gql`
  query GetAllSellers {
    getAllSellers {
      id
    }
  }
`;
const GET_SINGLE = gql`
  query GetAllProduct {
    getAllProduct {
      id
    }
  }
`;
const GET_SERIES = gql`
  query GetAllSeriesProduct {
    getAllSeriesProduct {
      id
    }
  }
`;
const GET_TMT = gql`
  query GetAllTMTSeriesProduct {
    getAllTMTSeriesProduct {
      id
    }
  }
`;
const GET_ALL_ORDERS = gql`
  query GetAllOrder {
    getAllOrder {
      id
      totalAmount
      paymentStatus
      orderProducts {
        productId {
          previewName
        }
        variantId {
          variantName
        }      
      }
    }
  }
`;

const Chart = () => {
  const title = 'Dashboard';
  const description = 'Dashboard';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { data } = useQuery(USER_NUMBER);
  const { data: sellerData } = useQuery(SELLER_NUMBER);
  const { data: singleData } = useQuery(GET_SINGLE);
  const { data: seriesData } = useQuery(GET_SERIES);
  const { data: TMTData } = useQuery(GET_TMT);
  // const { data: orderData } = useQuery(GET_ALL_ORDERS);

  const { data: orderData, loading: orderLoading } = useQuery(GET_ALL_ORDERS);

  const totalAmount = orderData?.getAllOrder
    .filter(order => order.paymentStatus === "complete")
    .reduce((sum, order) => sum + order.totalAmount, 0) || 0;

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-containe mt-2 mb-2">
        <h1 className="mb-0 pb-0 fs-5 fw-bold" id="title">
          Portal Admin Dashboard
        </h1>
      </div>
      <Row className="mb-5 g-2">
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="dollar" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">EARNINGS</div>
              {orderLoading ? (
                <Spinner animation="border" role="status" size="sm" className="text-primary">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                <div className="text-dark fw-bold cta-4">{totalAmount.toFixed(2)}</div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="cart" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">USERS</div>
              {data && <div className="text-dark fw-bold cta-4">{data.getUsers.length}</div>}
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="cart" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">SELLER</div>
              {sellerData && <div className="text-dark fw-bold cta-4">{sellerData.getAllSellers.length}</div>}
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="cart" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">TMT</div>
              {TMTData && <div className="text-dark fw-bold cta-4">{TMTData.getAllTMTSeriesProduct.length}</div>}
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="cart" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">SERIES</div>
              {seriesData && <div className="text-dark fw-bold cta-4">{seriesData.getAllSeriesProduct.length}</div>}
            </Card.Body>
          </Card>
        </Col>
        <Col xs="6" md="4" lg="2">
          <Card className="h-100 hover-scale-up cursor-pointer">
            <Card.Body className="d-flex flex-column align-items-center">
              <div className="sw-6 sh-6 rounded-xl d-flex justify-content-center align-items-center border border-primary mb-4">
                <CsLineIcons icon="cart" className="text-primary" />
              </div>
              <div className="mb-1 align-items-center text-dark">SINGLE</div>
              {singleData && <div className="text-dark fw-bold cta-4">{singleData.getAllProduct.length}</div>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Chart;
