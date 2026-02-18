import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useHistory } from 'react-router-dom';
import { gql, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { Row, Col, Button, Dropdown, Form, Card, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { useWindowSize } from 'hooks/useWindowSize';
import { useSelector } from 'react-redux';
import PriceComponent from 'views/storefront/home/PriceComponent';
import DiscountBadge from 'views/storefront/home/DiscountBadge';
import FilterMenuContent from '../components/FilterMenuContent';
import { GETPRODUCTBYCATEGORYNAME } from '../SubCategoryL2';

function Single() {
  const title = 'Category | Products ';
  const description = 'Category | Products';
  const params = useParams();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');
  const { dataStoreFeatures1 } = useGlobleContext();

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
  const [GetProductByCategoryName, { data: sellerProd, fetchMore, refetch }] = useLazyQuery(GETPRODUCTBYCATEGORYNAME, {
    variables: {
      categoryName: params.categoryname.replace(/_/g, ' '),
    },
    onError(error) {
      toast.error(error.message || 'Something went wrong!');
      console.error('GETPRODUCTBYCATEGORYNAME', error);
    },
  });

  useEffect(() => {
    GetProductByCategoryName();
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

    await GetProductByCategoryName({
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
      <HtmlHead title={params.categoryname.replaceAll('_', ' ').toUpperCase()} description={params.categoryname.replaceAll('_', ' ').toUpperCase()} />
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`.font_black {
         color: black;
       }`}
        {`
        .hover-border-color:hover {
          border: 1px solid ${dataStoreFeatures1?.getStoreFeature?.bgColor} !important;
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor} !important;
        }
        `}
        {`
        .hover-font-color:hover {          
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor} !important;
        }
        `}
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
      <div className="">
        <Row className="g-0">
          <div className="col-12 pt-2 pb-2">
            <div className=" align-items-center">
              <NavLink to="/">
                <span className="ms-1 fw-bold font_black">Home</span>
              </NavLink>
              <NavLink to={`/category/${params.categoryname}`} className="ps-2">
                <span className="me-1 text-black"> / </span>
                <span className="align-middle  ms-1 fw-bold font_black"> {params.categoryname.replaceAll('_', ' ').toUpperCase()}</span>
              </NavLink>
            </div>
          </div>
        </Row>
      </div>

      <div className="page-title-container">
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
            {/* Filters Start */}
            <Card className="mb-5">
              <Card.Body>
                <FilterMenuContent
                  setIsOpenFiltersModal={setIsOpenFiltersModal}
                  productFilters={productFilters}
                  GetProductByCategoryName={GetProductByCategoryName}
                  setProductFilters={setProductFilters}
                />
              </Card.Body>
            </Card>
            {/* Filters End */}
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
            {sellerProd?.getProductByCat?.map((items, index) => (
              <Col key={items.id} className="my-2">
                <Card className="hover-border-primary border">
                  <DiscountBadge variant={items.variant[0]} name={items.previewName} />
                  <Row className="g-0 h-100">
                    <img
                      src={items.thumbnail || (items.images && items.images[0])}
                      alt={items.previewName || items.fullName}
                      className="  rounded card-img-horizontal h-100 px-1 py-1"
                    />
                    <hr />
                  </Row>
                  <Row>
                    <Card.Body className="text-center h-100 pt-0 pb-2 px-2 my-1 mx-1">
                      <div className="card-text mb-0 mx-2 text-truncate" style={{ fontWeight: 'bold' }}>
                        {items.brand_name}
                      </div>
                      <div>
                        <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">{items.fullName}</Tooltip>}>
                          <NavLink
                            style={{ fontWeight: 'bold' }}
                            to={`/product/${items.identifier?.replace(/\s/g, '_').toLowerCase()}`}
                            className="body-link stretched-link d-block my-1 mx-1 py-1 px-1 text-truncate"
                          >
                            {items.previewName || items.fullName}
                          </NavLink>
                        </OverlayTrigger>
                        {items.variant?.length > 0 && (
                          <div className="card-text my-1 py-0 mx-1 px-1 text-truncate">
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
        </Col>
      </Row>
      {/* Filters Modal Start */}
      {!isLgScreen && (
        <Modal className="modal-left" show={isOpenFiltersModal} onHide={() => setIsOpenFiltersModal(false)}>
          <Modal.Body closeButton>
            <FilterMenuContent
              setIsOpenFiltersModal={setIsOpenFiltersModal}
              productFilters={productFilters}
              GetProductByCategoryName={GetProductByCategoryName}
              setProductFilters={setProductFilters}
            />
          </Modal.Body>
        </Modal>
      )}
      {/* Filters Modal End */}
    </>
  );
}

export default Single;
