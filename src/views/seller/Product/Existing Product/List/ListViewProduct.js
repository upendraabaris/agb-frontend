import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { gql, useLazyQuery } from '@apollo/client';

const ListViewProduct = () => {
  const title = 'Existing Product List';
  const description = 'Ecommerce Existing Product List Page';
  const history = useHistory();

  const GET_ALL_PRODUCT = gql`
    query GetAllProduct {
      getAllProduct {
        brand_name
        fullName
        id
        identifier
        thumbnail
        sku
        images
        active
        previewName
      }
    }
  `;

  const [GetAllProduct, { data, refetch }] = useLazyQuery(GET_ALL_PRODUCT, {
    onError: (error) => {
      console.log(`Error!!! : ${error.message}`);
    },
  });

  useEffect(() => {
    GetAllProduct();
  }, [GetAllProduct]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>

      <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          {/* Search Start */}
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control type="text" placeholder="Search" />
            <span className="search-magnifier-icon">
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
          {/* Search End */}
        </Col>
        <Col md="7" lg="9" xxl="10" className="mb-1 text-end">
          {/* Length Start */}
          <Dropdown align={{ xs: 'end' }} className="d-inline-block ms-1">
            <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">Item Count</Tooltip>}>
              <Dropdown.Toggle variant="foreground-alternate" className="shadow sw-13">
                10 Items
              </Dropdown.Toggle>
            </OverlayTrigger>
            <Dropdown.Menu className="shadow dropdown-menu-end">
              <Dropdown.Item href="#">5 Items</Dropdown.Item>
              <Dropdown.Item href="#">10 Items</Dropdown.Item>
              <Dropdown.Item href="#">20 Items</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {/* Length End */}
        </Col>
      </Row>

      {/* List Header Start */}
      <Row className="g-0 mb-2 d-none d-lg-flex">
        <Col xs="auto" className="sw-11 d-none d-lg-flex" />
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-muted text-small cursor-pointer sort">PRODUCT FULL NAME</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer sort">BRAND</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer sort">ACTION</div>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* List Header End */}

      {/* Single Card Begins Here */}
      {data && (
        <>
          {data.getAllProduct
            ?.slice(0)
            .reverse()
            .map((product) => {
              return (
                <Card key={product.id} className="mb-2">
                  <Row className="g-0 h-100 sh-lg-9 position-relative">
                    <Col xs="1" className="position-relative h-100">
                      <NavLink to="#/!" className="d-block h-100">
                        <img
                          src={product.thumbnail || (product.images && product.images[0])}
                          alt="product"
                          className="card-img card-img-horizontal sw-11 mh-100"
                        />
                      </NavLink>
                    </Col>
                    <Col className="py-4 py-lg-0 ps-5 pe-4 h-100">
                      <Row className="g-0 h-100 align-content-center">
                        <Col xs="11" lg="3" className="d-flex flex-column mb-lg-0 mb-3 pe-3 d-flex order-1 h-lg-100 justify-content-center">
                          <NavLink to="#/!">
                            {product.previewName}
                            <div className="text-small text-muted text-truncate">#{product.sku}</div>
                          </NavLink>
                        </Col>
                        <Col lg="3" className="d-flex flex-column pe-1 mb-2 mb-lg-0 justify-content-center order-3">
                          <div className="lh-1 text-alternate">{product.brand_name}</div>
                        </Col>
                        <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4">
                          <div className="text-muted text-small d-lg-none mb-1">Action</div>
                          <div>
                            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add location for this Product</Tooltip>}>
                              <div className="d-inline-block me-2">
                                <NavLink
                                  className="btn-icon btn-icon-only shadow"
                                  to={`add_from_existing_product/details/${product.identifier.replace(/\s/g, '_').toLowerCase()}`}
                                >
                                  <CsLineIcons icon="arrow-right" className="text-primary" size="17" />
                                </NavLink>
                              </div>
                            </OverlayTrigger>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card>
              );
            })}
        </>
      )}
      {/* Single Card Ends Here */}

      {/* Pagination Start */}
      <div className="d-flex justify-content-center mt-5">
        <Pagination>
          <Pagination.Prev className="shadow" disabled>
            <CsLineIcons icon="chevron-left" />
          </Pagination.Prev>
          <Pagination.Item className="shadow" active>
            1
          </Pagination.Item>
          <Pagination.Item className="shadow">2</Pagination.Item>
          <Pagination.Item className="shadow">3</Pagination.Item>
          <Pagination.Next className="shadow">
            <CsLineIcons icon="chevron-right" />
          </Pagination.Next>
        </Pagination>
      </div>
      {/* Pagination End */}
    </>
  );
};

export default ListViewProduct;
