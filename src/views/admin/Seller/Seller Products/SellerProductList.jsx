import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Badge, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import CheckAll from 'components/check-all/CheckAll';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import DiscountBadge from 'views/storefront/home/DiscountBadge';
import PriceComponent from 'views/storefront/home/PriceComponent';

const SellerProductList = () => {
  const title = 'Seller Product List';
  const description = 'Ecommerce Seller Product List Page';
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(12);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');

  const { sellerID } = useParams();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_SERIES_PRODUCT_BY_SELLER = gql`
    query GetProductBySeller($sellerId: ID!, $search: String, $limit: Int, $offset: Int, $sortBy: String, $sortOrder: String) {
      getProductBySeller(seller_id: $sellerId, search: $search, limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
        id
        previewName
        sku
        brand_name
        catalogue
        identifier
        categories
        fullName
        faq {
          answer
          question
        }
        description
        giftOffer
        images
        variant {
          active
          allPincode
          hsn
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
            sellerId {
              id
            }
          }
          minimunQty
          moq
          silent_features
          variantName
        }
      }
    }
  `;

  const [GetSeriesProductBySeller, { data: sellerProd, fetchMore, refetch }] = useLazyQuery(GET_SERIES_PRODUCT_BY_SELLER, {
    variables: {
      sellerId: sellerID,
      limit,
      offset,
    },
    onError: (err) => {
      console.log('GET_SERIES_PRODUCT_BY_SELLER', err);
    },
  });
  if (sellerProd) {
    console.log(sellerProd);
  } 

  useEffect(() => {
    GetSeriesProductBySeller();
  }, [sellerID]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/admin/seller/detail/${sellerID}`}>
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Seller</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>

      {/* List Items Start */}
      {sellerProd && (
        <Row className="mb-2 g-2 row-cols-2 row-cols-md-3 row-cols-xl-4 row-cols-xxl-7">
          {sellerProd?.getProductBySeller?.map((items, index) => (
            <Col key={items.id}>
              <Card className="hover-border-primary home">
                <DiscountBadge variant={items.variant[0]} name={items.previewName} />
                <Row className="g-0 h-100 ">
                  <img
                    src={items.thumbnail || (items.images && items.images[0])}
                    alt="alternate text"
                    className="card-img card-img-horizontal h-100 px-1 py-1"
                  />
                </Row>
                <Row>
                  <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                    <div>
                      <NavLink
                        style={{ fontWeight: 'bold' }}
                        to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                        className="body-link stretched-link d-block mt-0 mb-2 mx-1 py-0 px-0"
                      >
                        {items.previewName || items.fullName}
                      </NavLink>
                      {items.variant?.length > 0 && (
                        <div className="d-inline card-text mt-0 mb-2 py-0 mx-0 px-0" style={{ fontWeight: 'bold' }}>
                          <PriceComponent variant={items.variant[0]} name={items.previewName} />
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      {/* List Items End */}

      {sellerProd && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={sellerProd?.getProductBySeller?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
    </>
  );
};

export default SellerProductList;
