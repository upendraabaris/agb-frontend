import { gql, useLazyQuery } from '@apollo/client';
import React, { useEffect } from 'react';
import { Row, Placeholder, Col, Card, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import TMTPriceComponent from './TMTPriceComponent';
import DiscountBadge from './DiscountBadge';
import TMTDiscountBadge from './TMTDiscountBadge';
import PriceComponent from './PriceComponent';
import TMTSectionFalseDiscount from './TMTSectionFalseDiscount';

const GET_PRODUCT_HOME_ORDER = gql`
  query GetProductHomeOrder($displaySection: String, $displayOrder: Int) {
    getProductHomeOrder(displaySection: $displaySection, displayOrder: $displayOrder) {
      displaySection
      displayOrder
      productType
      productId
    }
  }
`;

const GET_SINGLE_PRODUCT = gql`
  query GetProductByID($getProductByIdId: ID) {
    getProductByID(id: $getProductByIdId) {
      brand_name
      id
      images
      previewName
      thumbnail
      fullName
      identifier
      variant {
        id
        location {
          b2cdiscount
          b2bdiscount
          gstRate
          gstType
          price
          unitType
          extraCharge
        }
      }
    }
  }
`;

const GET_ALL_SERIES_PRODUCT = gql`
  query GetSeriesProduct($getSeriesProductId: ID) {
    getSeriesProduct(id: $getSeriesProductId) {
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

const GET_TMT_PRODUCTS = gql`
  query GetTMTSeriesProduct($getTmtSeriesProductId: ID) {
    getTMTSeriesProduct(id: $getTmtSeriesProductId) {
      fullName
      id
      previewName
      brand_name
      thumbnail
      images
      identifier
      section
      brandCompareCategory
      approve
      active
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

function HomeTrending({ position, section }) {
  const [getProductHomeOrder, { data }] = useLazyQuery(GET_PRODUCT_HOME_ORDER);

  useEffect(() => {
    getProductHomeOrder({
      variables: {
        displaySection: section,
        displayOrder: position,
      },
    });
  }, []);

  const [getSingleProduct, { data: singleData, loading }] = useLazyQuery(GET_SINGLE_PRODUCT);

  const [getSeriesProduct, { data: seriesData, loading: seriesLoading }] = useLazyQuery(GET_ALL_SERIES_PRODUCT);

  const [getTMTSeriesProduct, { data: item, loading: tmtLoading }] = useLazyQuery(GET_TMT_PRODUCTS);

  useEffect(() => {
    getSeriesProduct({
      variables: {
        getSeriesProductId: data?.getProductHomeOrder?.productId,
      },
    });

    getTMTSeriesProduct({
      variables: {
        getTmtSeriesProductId: data?.getProductHomeOrder?.productId,
      },
    });

    getSingleProduct({
      variables: {
        getProductByIdId: data?.getProductHomeOrder?.productId,
      },
    });
  }, [data?.getProductHomeOrder?.productId, item?.getTMTSeriesProduct?.id]);

  if (loading || tmtLoading || seriesLoading) {
    return (
      <>
        {/* <Col className="my-1 py-1">
          <Card className="hover-border-primary">
            <Row className="g-0">
              <img src="https://fakeimg.pl/250x350?text=_" alt="check" className="card-img rounded card-img-horizontal h-100 px-1 py-1" />
              <hr className="my-0" />
            </Row>
          </Card>
        </Col> */}
        <Card className="hover-border-primary my-1 py-1">
          <div style={{ height: '250px' }} className="card" aria-hidden="true" />
        </Card>
      </>
    );
  }
  return (
    <>
      {data?.getProductHomeOrder?.productType === 'fix series' && item && (
        <Col className="my-1 py-1">
          <Card className="hover-border-primary">
            {item && item?.getTMTSeriesProduct?.section ? (
              <TMTDiscountBadge product={item?.getTMTSeriesProduct} />
            ) : (
              <TMTSectionFalseDiscount product={item?.getTMTSeriesProduct} />
            )}
            <Row className="g-0">
              <img
                src={item?.getTMTSeriesProduct?.thumbnail || (item?.getTMTSeriesProduct?.images && item?.getTMTSeriesProduct?.images[0])}
                alt={item?.getTMTSeriesProduct?.name}
                className=" rounded card-img-horizontal h-100 px-1 py-1"
              />
              <div>
                {item?.getTMTSeriesProduct?.brandCompareCategory && (
                  <p
                    style={{
                      position: 'absolute',
                      backgroundColor: '#1ea9e8',
                      color: 'white',
                      marginTop: '-24px',
                      marginLeft: '0px',
                      paddingBottom: '0px',
                      fontSize: '14px',
                      borderTopRightRadius: '8px',
                    }}
                    className="px-1 pb-0 mx-1 mb-1"
                  >
                    Compare Brands
                  </p>
                )}
              </div>
              <hr className="my-0" />
            </Row>
            <Row>
              <Card.Body className="text-center h-100 py-0 px-2 mx-1">
                <div className="card-text mb-0 text-truncate mx-1 p-1" style={{ fontWeight: 'bold' }}>
                  {item?.getTMTSeriesProduct?.brand_name}
                </div>
                <div>
                  <OverlayTrigger
                    delay={{ show: 1000, hide: 0 }}
                    placement="top"
                    overlay={<Tooltip id="tooltip-top">{item?.getTMTSeriesProduct?.fullName}</Tooltip>}
                  >
                    <NavLink
                      style={{ fontWeight: 'bold' }}
                      to={`/product/${item?.getTMTSeriesProduct?.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                      className="body-link stretched-link d-block my-1 py-0 mx-1 px-1 text-truncate"
                    >
                      {item?.getTMTSeriesProduct?.previewName.length > 11
                        ? `${item?.getTMTSeriesProduct?.previewName}`
                        : item?.getTMTSeriesProduct?.previewName}
                    </NavLink>
                  </OverlayTrigger>
                </div>
                <div className="text-truncate small m-2 py-0 mx-1 px-1">
                  {item && item?.getTMTSeriesProduct?.section ? (
                    <TMTPriceComponent product={item?.getTMTSeriesProduct} />
                  ) : (
                    <p className="d-inline small fs-6">VIEW PRICE</p>
                  )}
                </div>
              </Card.Body>
            </Row>
          </Card>
        </Col>
      )}

      {data?.getProductHomeOrder?.productType === 'single' && singleData && (
        <Col className="my-1 py-1">
          <Card className="hover-border-primary">
            <DiscountBadge variant={singleData?.getProductByID?.variant[0]} name={singleData?.getProductByID?.previewName} />
            <Row className="g-0">
              <img
                src={singleData?.getProductByID?.thumbnail || (singleData?.getProductByID?.images && singleData?.getProductByID?.images[0])}
                alt={singleData?.getProductByID?.name}
                className="  rounded card-img-horizontal h-100 px-1 py-1"
              />
              <hr className="my-0" />
            </Row>
            <Row>
              <Card.Body className="text-center h-100 my-1 py-0 px-2 mx-1">
                <div className="card-text mb-0 text-truncate mx-1 p-1" style={{ fontWeight: 'bold' }}>
                  {singleData?.getProductByID?.brand_name}
                </div>
                <div>
                  <OverlayTrigger
                    delay={{ show: 1000, hide: 0 }}
                    placement="top"
                    overlay={<Tooltip id="tooltip-top">{singleData?.getProductByID?.fullName}</Tooltip>}
                  >
                    <NavLink
                      style={{ fontWeight: 'bold' }}
                      to={`/product/${singleData?.getProductByID?.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                      className="body-link stretched-link d-block my-1 py-0 mx-1 px-1 text-truncate"
                    >
                      {singleData?.getProductByID?.previewName.length > 11
                        ? `${singleData?.getProductByID?.previewName}`
                        : singleData?.getProductByID?.previewName}
                    </NavLink>
                  </OverlayTrigger>
                </div>
                <div>
                  {singleData?.getProductByID?.variant?.length > 0 && (
                    <div className="small px-2 card-text my-1 py-0 mx-1 px-1 text-truncate">
                      <PriceComponent variant={singleData?.getProductByID?.variant[0]} name={singleData?.getProductByID?.previewName} />
                    </div>
                  )}
                </div>
              </Card.Body>
            </Row>
          </Card>
        </Col>
      )}

      {data?.getProductHomeOrder?.productType === 'custom series' && seriesData && (
        <Col className="my-1 py-1">
          <Card className="hover-border-primary border">
            <Row className="g-0">
              <img
                src={seriesData?.getSeriesProduct?.thumbnail || (seriesData?.getSeriesProduct?.images && seriesData?.getSeriesProduct?.images[0])}
                alt={seriesData?.getSeriesProduct?.name}
                className="  rounded card-img-horizontal h-100 px-1 py-1"
              />
              <hr className="my-0" />
            </Row>
            <Row>
              <Card.Body className="text-center h-100 my-1 py-0 px-2 mx-1">
                <div className="card-text mb-0 text-truncate mx-1 p-1" style={{ fontWeight: 'bold' }}>
                  {seriesData?.getSeriesProduct?.brand_name}
                </div>
                <div>
                  <OverlayTrigger
                    delay={{ show: 1000, hide: 0 }}
                    placement="top"
                    overlay={<Tooltip id="tooltip-top">{seriesData?.getSeriesProduct?.fullName}</Tooltip>}
                  >
                    <NavLink
                      style={{ fontWeight: 'bold' }}
                      to={`/product/${seriesData?.getSeriesProduct?.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                      className="body-link stretched-link d-block my-1 py-0 mx-1 px-1 text-truncate"
                    >
                      {seriesData?.getSeriesProduct?.previewName.length > 11
                        ? `${seriesData?.getSeriesProduct?.previewName} `
                        : seriesData?.getSeriesProduct?.previewName}
                    </NavLink>
                  </OverlayTrigger>
                </div>
                <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                  VIEW PRICE
                </div>
              </Card.Body>
            </Row>
          </Card>
        </Col>
      )}
    </>
  );
}

export default HomeTrending;
