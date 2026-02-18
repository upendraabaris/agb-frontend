import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { Row, Col, Button, Dropdown, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import TMTPriceComponent from 'views/storefront/home/TMTPriceComponent';
import TMTDiscountBadge from 'views/storefront/home/TMTDiscountBadge';
import TMTSectionFalseDiscount from 'views/storefront/home/TMTSectionFalseDiscount';
import { useSelector } from 'react-redux';
import { useWindowSize } from 'hooks/useWindowSize';
import FilterMenuContent from '../components/FilterMenuContent';
import { GETTMTBYCATEGORYNAME } from '../SubCategoryL2';

function TMT() {
  const params = useParams();
  const title = 'TMT';
  const description = 'TMT Page'; 

  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');

  function getSortLabel(sortBy1) {
    switch (sortBy1) {
      case 'asc':
        return 'A to Z';
      case 'desc':
        return 'Z to A';
      case '':
      default:
        return 'Default';
    }
  }

  const [GetTMTByCategoryName, { data: sellerProd, fetchMore, refetch }] = useLazyQuery(
    GETTMTBYCATEGORYNAME,
    {
      variables: { categoryName: params.categoryname.replace(/_/g, ' ') },
    },
    {
      onError(error) {
        toast.error(error.message || 'Something went wrong!');
        console.error('GET_TMT_BY_CATEGORY_NAME', error);
      },
    }
  );

  useEffect(() => {
    GetTMTByCategoryName();
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

    await GetTMTByCategoryName({
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
      <div className="page-title-container m-0">
        <div className="">
          <Row className="g-0">
            <div className="col-12 pt-2 pb-2">
              <div className=" align-items-center">
                <NavLink className="text-dark pb-1 d-inline-block hidden breadcrumb-back" to={`/category/${params.categoryname}`}>
                  <span className="ms-1 fw-bold text-dark">Go Back</span>
                </NavLink>
                <span className="ps-2"> / </span>
                <NavLink to="/">
                  <span className="ms-1 fw-bold text-dark">Home</span>
                </NavLink>
                <NavLink to={`/category/${params.categoryname}`} className="ps-2">
                  <span className="me-1 text-dark"> / </span>
                  <span className="align-middle  ms-1 fw-bold text-dark"> {params.categoryname.replaceAll('_', ' ').toUpperCase()}</span>
                </NavLink>
              </div>
            </div>
          </Row>
        </div>
      </div>
      <div className="page-title-container mb-1">
        <Row className="g-0">
          <Col xs="12" className="col-2 d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <div className="d-flex justify-content-around">
              <Button className="btn-icon btn-icon-only ms-1 d-inline-block d-lg-none btn_color" onClick={() => setIsOpenFiltersModal(true)}>
                <CsLineIcons icon="filter" />
              </Button>
            </div>
            <Dropdown onSelect={handleSelect} className="ms-1 d-block d-md-none w-100" align="end">
              <Dropdown.Toggle className="w-100 w-md-auto btn_color">Sort By: {getSortLabel(productFilters.sortBy)}</Dropdown.Toggle>
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
                  GetTMTByCategoryName={GetTMTByCategoryName}
                  setProductFilters={setProductFilters}
                />
              </Card.Body>
            </Card>
          </Col>
        )}
        <Col lg="8" xl="9" className="bg-white pt-3 rounded">
          <div className="d-flex bg-white rounded border justify-content-between align-items-center">
            <h1 className="fw-bold ps-2 pt-2 fs-5 text-center w-100">
              <span className=" font_black">{params.categoryname.replaceAll('_', ' ').toUpperCase()}</span>
            </h1>
            <Dropdown onSelect={handleSelect} className="ms-1 d-none d-md-block" align="end">
              <Dropdown.Toggle className="w-100 w-md-auto btn_color">Sort By: {getSortLabel(productFilters.sortBy)}</Dropdown.Toggle>
              <Dropdown.Menu align="end" className="w-100 w-md-auto">
                <Dropdown.Item eventKey="">Default</Dropdown.Item>
                <Dropdown.Item eventKey="asc">A to Z</Dropdown.Item>
                <Dropdown.Item eventKey="desc">Z to A</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <Row className="my-2 g-2 row-cols-2 row-cols-md-3 row-cols-xl-4 row-cols-xxl-7">
            {sellerProd?.getTMTSeriesProductByCat?.map((items, index) => (
              <Col className="my-2" key={items.id}>
                <Card className="hover-border-primary border">
                  {items && items?.section ? <TMTDiscountBadge product={items} /> : <TMTSectionFalseDiscount product={items} />}
                  <Row className="g-0 h-100">
                    <img
                      src={items.thumbnail || (items.images && items.images[0])}
                      alt="alternate text"
                      className="card-img card-img-horizontal h-100 px-1 py-1"
                    />
                    <div>
                      {items?.brandCompareCategory && (
                        <p
                          style={{
                            position: 'absolute',
                            backgroundColor: '#1ea9e8',
                            color: 'white',
                            marginTop: '-24px',
                            marginLeft: '0px',
                            paddingBottom: '0px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            borderTopRightRadius: '8px',
                          }}
                          className="px-1 pb-0 mx-1 mb-1"
                        >
                          {' '}
                          Compare Brands{' '}
                        </p>
                      )}{' '}
                    </div>
                    <hr />
                  </Row>
                  <Row>
                    <Card.Body className="text-center pt-0 pb-2 px-2 my-1 mx-1">
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
                        <div>{items && items?.section ? <TMTPriceComponent product={items} /> : <p className="d-inline">VIEW PRICE</p>}</div>
                      </div>
                    </Card.Body>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      {!isLgScreen && (
        <Modal className="modal-left" show={isOpenFiltersModal} onHide={() => setIsOpenFiltersModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title as="h5">Filters</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FilterMenuContent
              setIsOpenFiltersModal={setIsOpenFiltersModal}
              productFilters={productFilters}
              GetTMTByCategoryName={GetTMTByCategoryName}
              setProductFilters={setProductFilters}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
}

export default TMT;
