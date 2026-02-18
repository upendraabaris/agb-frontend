import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useHistory } from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { Row, Col, Button, Dropdown, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';

import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useSelector } from 'react-redux';
import { useWindowSize } from 'hooks/useWindowSize';
import FilterMenuContent from '../components/FilterMenuContent';
import { SERIES_PRODUCT_BY_CATEGORY_NAME } from '../SubCategoryL2';

function Series() {
  const params = useParams();
  const title = 'Series';
  const description = 'Series Page';

  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');

  const [GetSeriesProductByCategoryName, { data: sellerProd, fetchMore, refetch }] = useLazyQuery(
    SERIES_PRODUCT_BY_CATEGORY_NAME,
    { variables: { categoryName: params.categoryname.replace(/_/g, ' ') } },
    {
      // onCompleted: (result2) => {
      //   console.log(result2);
      // },
      onError(error) {
        toast.error(error.message || 'Something went wrong!');
        console.error('SERIES_PRODUCT_BY_CATEGORY_NAME', error);
      },
    }
  );

  useEffect(() => {
    GetSeriesProductByCategoryName();
    // eslint-disable-next-line
  }, [params]);

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  const { themeValues } = useSelector((state) => state.settings);
  const lgBreakpoint = parseInt(themeValues.lg.replace('px', ''), 10);
  const { width } = useWindowSize();
  const [isLgScreen, setIsLgScreen] = useState(false);
  const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false);
  const [isOpenFiltersModal, setIsOpenFiltersModal] = useState(false);

  useEffect(() => {
    if (width) {
      if (width >= lgBreakpoint) {
        if (!isLgScreen) setIsLgScreen(true);
        if (isOpenCategoryModal) setIsOpenCategoryModal(false);
        if (isOpenFiltersModal) setIsOpenFiltersModal(false);
      } else if (isLgScreen) setIsLgScreen(false);
    }
    return () => {};
    // eslint-disable-next-line
  }, [width]);

  const productsFilterValue = {
    categoryName: params.categoryname.replace(/_/g, ' '),
    sortBy: '',
    discountPercentage: '',
    minPrice: '',
    maxPrice: '',
  };

  const [productFilters, setProductFilters] = useState(productsFilterValue);

  const handleSelect = async (sortBy1) => {
    setProductFilters((prev) => ({
      ...prev,
      sortBy: sortBy1,
    }));

    await GetSeriesProductByCategoryName({
      variables: {
        ...productFilters,
        sortBy: sortBy1,
        minPrice: parseFloat(productFilters.minPrice),
        maxPrice: parseFloat(productFilters.maxPrice),
        discountPercentage: parseFloat(productFilters.discountPercentage),
      },
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to={`/category/${params.categoryname}`}>
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Category</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <div className="page-title-container">
        <Row className="g-0">
          <Col xs="12" className="col-2 d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <div className="d-flex justify-content-around">
              <Button variant="outline-primary" className="btn-icon btn-icon-only ms-1 d-inline-block d-lg-none" onClick={() => setIsOpenFiltersModal(true)}>
                <CsLineIcons icon="filter" />
              </Button>
            </div>
            <Dropdown onSelect={handleSelect} className="ms-1 w-100 w-md-auto" align="end">
              <Dropdown.Toggle variant="outline-primary" className="w-100 w-md-auto">
                Order: {productFilters.sortBy}
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="w-100 w-md-auto">
                <Dropdown.Item eventKey="">Default</Dropdown.Item>
                <Dropdown.Item eventKey="asc">A to Z</Dropdown.Item>
                <Dropdown.Item eventKey="desc">Z to A</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </div>
      <Row>
        {isLgScreen && (
          <Col lg="4" xl="3" className="d-none d-lg-block">
            <Card className="mb-5">
              <Card.Body>
                <FilterMenuContent
                  setIsOpenFiltersModal={setIsOpenFiltersModal}
                  productFilters={productFilters}
                  GetSeriesProductByCategoryName={GetSeriesProductByCategoryName}
                  setProductFilters={setProductFilters}
                />
              </Card.Body>
            </Card>
          </Col>
        )}
        <Col lg="8" xl="9" className="bg-white pt-3 rounded">
          <Row className="my-2 g-2 row-cols-2 row-cols-md-3 row-cols-xl-4 row-cols-xxl-7">
            {sellerProd?.getSeriesProductByCat?.map((items, index) => (
              <Col key={items.id} className="my-2">
                <Card className="hover-border-primary">
                  <Row className="g-0 h-100">
                    <img
                      src={items.thumbnail || (items.images && items.images[0])}
                      alt="alternate text"
                      className="card-img card-img-horizontal h-100 px-1 py-1"
                    />
                    <hr />
                  </Row>
                  <Row>
                    <Card.Body className="text-center h-100 pt-0 pb-2 px-2 my-1 mx-1">
                      <div className="card-text mb-0" style={{ fontWeight: 'bold' }}>
                        {items.brand_name}
                      </div>
                      <div>
                        <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">{items.fullName}</Tooltip>}>
                          <NavLink
                            style={{ fontWeight: 'bold' }}
                            to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1"
                          >
                            {items.previewName || items.fullName}
                          </NavLink>
                        </OverlayTrigger>
                        <div className="d-inline card-text my-1 mx-1 py-1 px-1">VIEW PRICE</div>
                      </div>
                    </Card.Body>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* List Items Start */}
      {/* {sellerProd && <Row className="mb-2 g-2 row-cols-2 row-cols-md-3 row-cols-xl-5 row-cols-xxl-7"></Row>} */}
      {/* List Items End */}
      {/* {sellerProd && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={sellerProd.getSeriesProductBySeller?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )} */}

      {!isLgScreen && (
        <Modal className="modal-left" show={isOpenFiltersModal} onHide={() => setIsOpenFiltersModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">Filters</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FilterMenuContent
              setIsOpenFiltersModal={setIsOpenFiltersModal}
              productFilters={productFilters}
              GetSeriesProductByCategoryName={GetSeriesProductByCategoryName}
              setProductFilters={setProductFilters}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}

export default Series;
