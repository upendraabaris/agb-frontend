import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Rating from 'react-rating';
import Clamp from 'components/clamp';
import { Row, Col, Dropdown, Form, Button, Card, Badge } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const GET_PARENT_CATEGORY = gql`
  query GetAllCategories($sortOrder: String, $sortBy: String, $offset: Int, $limit: Int, $search: String) {
    getAllCategories(sortOrder: $sortOrder, sortBy: $sortBy, offset: $offset, limit: $limit, search: $search) {
      id
      image
      name
      parent {
        id
        image
        name
      }
      children {
        id
        image
        name
        children {
          id
          image
          name
          children {
            id
            image
            name
            children {
              id
              image
              name
            }
          }
        }
      }
    }
  }
`;

const Categories = () => {
  const title = 'Categories';
  const description = 'Ecommerce Categories Page';
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);
  // Level 1 Category

  const [getAllCategories, { error: errParentCat, data: dataParentCat }] = useLazyQuery(GET_PARENT_CATEGORY);
  if (dataParentCat) {
    console.log(dataParentCat);
  }
  if (errParentCat) {
    console.log('GET_PARENT_CATEGORY', errParentCat);
  }
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('ac');
  const [sortBy, setSortBy] = useState('name');
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    getAllCategories({
      variables: {
        sortOrder,
        sortBy,
        offset,
        // limit,
        search,
      },
    });
  }, [offset, sortBy, sortOrder]);

  const handleSort = () => {
    if (sortOrder === 'ac') {
      setSortOrder('asc');
    } else {
      setSortOrder('ac');
    }

    getAllCategories({
      variables: {
        offset,
        sortBy,
        sortOrder,
      },
    });
  };

  const handleSearch = () => {
    getAllCategories({ variables: { search: debouncedSearch || undefined, offset } });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      {/* Title Start */}
      <div className="">
        <Row className="g-0">
          {/* Title Start */}
          {/* <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Home</span>
            </NavLink>           
          </Col> */}
          {/* <Col xs="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <div className="btn-group ms-1 check-all-container">
              <Button className="sort" onClick={() => handleSort()}>
                Sort
              </Button>
            </div>
          </Col> */}
          {/* Title End */}
        </Row>
      </div>
      {/* Title End */}
      {/* <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control id="userSearch" type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="search-magnifier-icon" onClick={handleSearch}>
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
        </Col>
      </Row> */}

      {/* Trending Start */}
      {/* <div className="d-flex justify-content-between">
        <Button variant="background" className="btn-icon btn-icon-end pe-0 pt-0">
          <span>View All</span> <CsLineIcons icon="chevron-right" />
        </Button>
      </div> */}
         <h1 className='text-center fw-bold mb-4 pb-2 pt-4'>All <span className='text-primary'>{title}</span></h1>
    
      <Row className="g-2 row-cols-2 row-cols-md-3 row-cols-xl-6 mb-5">
        {dataParentCat &&
          dataParentCat.getAllCategories.map(
            (category) =>
              !category.parent && (
                <Col key={category.id}>
                  <Card className="hover-border-primary">
                    <Row className="g-0 h-100 ">
                      <img src={category.image} alt={category.name} className="card-img card-img-horizontal h-100 px-1 py-1" />
                    </Row>
                    <Row>
                      <Card.Body className="text-center h-100 py-0 px-2 my-1 mx-1">
                        <div>
                          <NavLink
                            style={{ fontWeight: 'bold' }}
                            to={`/category/${category.name.replace(/\s/g, '_').toLowerCase()}`}
                            target="_blank"
                            className="body-link stretched-link fw-bold d-block my-1 mx-1 py-1 px-1"
                          >
                            {category.name}
                          </NavLink>
                        </div>
                      </Card.Body>
                    </Row>
                  </Card>
                </Col>
              )
          )}
      </Row>

      {/* Trending End */}

      {/* Bestsellers Start */}
      {/* <div className="d-flex justify-content-between">
        <h2 className="small-title">Bestsellers</h2> */}
      {/* <Button variant="background" className="btn-icon btn-icon-end pe-0 pt-0">
          <span>View All</span> <CsLineIcons icon="chevron-right" />
        </Button> */}
      {/* </div>
      <Row className="row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-4 g-2 mb-5">
        <Col>
          <Card className="h-100">
            <Card.Img src="/img/product/small/product-1.webp" className="card-img-top sh-22" alt="card image" />
            <Card.Body>
              <h5 className="heading mb-0">
                <NavLink to="/storefront/detail" className="body-link stretched-link">
                  Zopf
                </NavLink>
              </h5>
            </Card.Body>
            <Card.Footer className="border-0 pt-0">
              <div className="mb-2">
                <Rating
                  initialRating={5}
                  readonly
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                />
                <div className="text-muted d-inline-block text-small align-text-top ms-1">(22)</div>
              </div>
              <div className="card-text mb-0">
                <div className="text-muted text-overline text-small" />
                <div>$ 5.75</div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col>
          <Card className="h-100">
            <Card.Img src="/img/product/small/product-2.webp" className="card-img-top sh-22" alt="card image" />
            <Card.Body>
              <h5 className="heading mb-0">
                <NavLink to="/storefront/detail" className="body-link stretched-link">
                  Steirer Brot
                </NavLink>
              </h5>
            </Card.Body>
            <Card.Footer className="border-0 pt-0">
              <div className="mb-2">
                <Rating
                  initialRating={5}
                  readonly
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                />
                <div className="text-muted d-inline-block text-small align-text-top ms-1">(44)</div>
              </div>
              <div className="card-text mb-0">
                <div>$ 2.25</div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col>
          <Card className="h-100">
            <Card.Img src="/img/product/small/product-3.webp" className="card-img-top sh-22" alt="card image" />
            <Card.Body>
              <h5 className="heading mb-0">
                <NavLink to="/storefront/detail" className="body-link stretched-link">
                  Pain de Campagne
                </NavLink>
              </h5>
            </Card.Body>
            <Card.Footer className="border-0 pt-0">
              <div className="mb-2">
                <Rating
                  initialRating={5}
                  readonly
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                />
                <div className="text-muted d-inline-block text-small align-text-top ms-1">(7)</div>
              </div>
              <div className="card-text mb-0">
                <div className="text-muted text-overline text-small">
                  <del>$ 13.00</del>
                </div>
                <div>$ 4.50</div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col>
          <Card className="h-100">
            <Card.Img src="/img/product/small/product-4.webp" className="card-img-top sh-22" alt="card image" />
            <Card.Body>
              <h5 className="heading mb-0">
                <NavLink to="/storefront/detail" className="body-link stretched-link">
                  Bucellato di Lucca
                </NavLink>
              </h5>
            </Card.Body>
            <Card.Footer className="border-0 pt-0">
              <div className="mb-2">
                <Rating
                  initialRating={5}
                  readonly
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                />
                <div className="text-muted d-inline-block text-small align-text-top ms-1">(38)</div>
              </div>
              <div className="card-text mb-0">
                <div>$ 3.50</div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row> */}
      {/* Bestsellers End */}

      {/* Newest Products Start */}
      {/* <div className="d-flex justify-content-between">
        <h2 className="small-title">Newest Products</h2> */}
      {/* <Button variant="background" className="btn-icon btn-icon-end pe-0 pt-0">
          <span>View All</span> <CsLineIcons icon="chevron-right" />
        </Button> */}
      {/* </div>
      <Row className="row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-4 g-2 mb-5">
        <Col>
          <Card className="h-100">
            <Card.Img src="/img/product/small/product-8.webp" className="card-img-top sh-22" alt="card image" />
            <Card.Body>
              <h5 className="heading mb-0">
                <NavLink to="/storefront/detail" className="body-link stretched-link">
                  Toast Bread
                </NavLink>
              </h5>
            </Card.Body>
            <Card.Footer className="border-0 pt-0">
              <div className="mb-2">
                <Rating
                  initialRating={5}
                  readonly
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                />
                <div className="text-muted d-inline-block text-small align-text-top ms-1">(22)</div>
              </div>
              <div className="card-text mb-0">
                <div className="text-muted text-overline text-small" />
                <div>$ 5.75</div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col>
          <Card className="h-100">
            <Card.Img src="/img/product/small/product-10.webp" className="card-img-top sh-22" alt="card image" />
            <Card.Body>
              <h5 className="heading mb-0">
                <NavLink to="/storefront/detail" className="body-link stretched-link">
                  Michetta
                </NavLink>
              </h5>
            </Card.Body>
            <Card.Footer className="border-0 pt-0">
              <div className="mb-2">
                <Rating
                  initialRating={5}
                  readonly
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                />
                <div className="text-muted d-inline-block text-small align-text-top ms-1">(44)</div>
              </div>
              <div className="card-text mb-0">
                <div>$ 2.25</div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col>
          <Card className="h-100">
            <Card.Img src="/img/product/small/product-9.webp" className="card-img-top sh-22" alt="card image" />
            <Card.Body>
              <h5 className="heading mb-0">
                <NavLink to="/storefront/detail" className="body-link stretched-link">
                  Rugbraud
                </NavLink>
              </h5>
            </Card.Body>
            <Card.Footer className="border-0 pt-0">
              <div className="mb-2">
                <Rating
                  initialRating={5}
                  readonly
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                />
                <div className="text-muted d-inline-block text-small align-text-top ms-1">(7)</div>
              </div>
              <div className="card-text mb-0">
                <div className="text-muted text-overline text-small">
                  <del>$ 13.00</del>
                </div>
                <div>$ 4.50</div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
        <Col>
          <Card className="h-100">
            <Card.Img src="/img/product/small/product-7.webp" className="card-img-top sh-22" alt="card image" />
            <Card.Body>
              <h5 className="heading mb-0">
                <NavLink to="/storefront/detail" className="body-link stretched-link">
                  Guernsey Gache
                </NavLink>
              </h5>
            </Card.Body>
            <Card.Footer className="border-0 pt-0">
              <div className="mb-2">
                <Rating
                  initialRating={5}
                  readonly
                  emptySymbol={<i className="cs-star text-primary" />}
                  fullSymbol={<i className="cs-star-full text-primary" />}
                />
                <div className="text-muted d-inline-block text-small align-text-top ms-1">(38)</div>
              </div>
              <div className="card-text mb-0">
                <div>$ 3.50</div>
              </div>
            </Card.Footer>
          </Card>
        </Col>
      </Row> */}
      {/* Newest Products End */}

      {/* Discover Start */}
      {/* <h2 className="small-title">Discover</h2>
      <Row className="g-2 row-cols-1 row-cols-md-2 row-cols-xl-2 row-cols-xxl-3 mb-5">
        <Col>
          <Card>
            <Row className="g-0 sh-16 sh-sm-17">
              <Col xs="auto" className="h-100 position-relative">
                <Badge bg="primary" className="me-1 position-absolute e-n2 t-2 z-index-1">
                  SALE
                </Badge>
                <img src="/img/product/small/product-5.webp" alt="alternate text" className="card-img card-img-horizontal h-100 sw-11 sw-sm-16 sw-lg-20" />
              </Col>
              <Col>
                <Card.Body className="d-flex align-items-center h-100 py-3">
                  <div className="mb-0 h6">
                    <NavLink to="/storefront/detail" className="body-link stretched-link d-block mb-1 sh-3 h6 lh-1-5">
                      <Clamp tag="span" clamp="1">
                        Plain Baguette
                      </Clamp>
                    </NavLink>
                    <div className="card-text mb-2">
                      <div className="text-muted text-overline text-small sh-2">
                        <del>$ 12.25</del>
                      </div>
                      <div>$ 8.50</div>
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
        <Col>
          <Card>
            <Row className="g-0 sh-16 sh-sm-17">
              <Col xs="auto" className="h-100 position-relative">
                <img src="/img/product/small/product-6.webp" alt="alternate text" className="card-img card-img-horizontal h-100 sw-11 sw-sm-16 sw-lg-20" />
              </Col>
              <Col>
                <Card.Body className="d-flex align-items-center h-100 py-3">
                  <div className="mb-0 h6">
                    <NavLink to="/storefront/detail" className="body-link stretched-link d-block mb-1 sh-3 h6 lh-1-5">
                      <Clamp tag="span" clamp="1">
                        Bucellato di Lucca
                      </Clamp>
                    </NavLink>
                    <div className="card-text mb-2">
                      <div className="text-muted text-overline text-small sh-2" />
                      <div>$ 7.50</div>
                    </div>
                    <div>
                      <Rating
                        initialRating={5}
                        readonly
                        emptySymbol={<i className="cs-star text-primary" />}
                        fullSymbol={<i className="cs-star-full text-primary" />}
                      />
                      <div className="text-muted d-inline-block text-small align-text-top">(2)</div>
                    </div>
                  </div>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <Card>
            <Row className="g-0 sh-16 sh-sm-17">
              <Col xs="auto" className="h-100 position-relative">
                <img src="/img/product/small/product-7.webp" alt="alternate text" className="card-img card-img-horizontal h-100 sw-11 sw-sm-16 sw-lg-20" />
              </Col>
              <Col>
                <Card.Body className="d-flex align-items-center h-100 py-3">
                  <div className="mb-0 h6">
                    <NavLink to="/storefront/detail" className="body-link stretched-link d-block mb-1 sh-3 h6 lh-1-5">
                      <Clamp tag="span" clamp="1">
                        Steirer Brot
                      </Clamp>
                    </NavLink>
                    <div className="card-text mb-2">
                      <div className="text-muted text-overline text-small sh-2" />
                      <div>$ 4.25</div>
                    </div>
                    <div>
                      <Rating
                        initialRating={5}
                        readonly
                        emptySymbol={<i className="cs-star text-primary" />}
                        fullSymbol={<i className="cs-star-full text-primary" />}
                      />
                      <div className="text-muted d-inline-block text-small align-text-top">(8)</div>
                    </div>
                  </div>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <Card>
            <Row className="g-0 sh-16 sh-sm-17">
              <Col xs="auto" className="h-100 position-relative">
                <img src="/img/product/small/product-8.webp" alt="alternate text" className="card-img card-img-horizontal h-100 sw-11 sw-sm-16 sw-lg-20" />
              </Col>
              <Col>
                <Card.Body className="d-flex align-items-center h-100 py-3">
                  <div className="mb-0 h6">
                    <NavLink to="/storefront/detail" className="body-link stretched-link d-block mb-1 sh-3 h6 lh-1-5">
                      <Clamp tag="span" clamp="1">
                        Michetta
                      </Clamp>
                    </NavLink>
                    <div className="card-text mb-2">
                      <div className="text-muted text-overline text-small sh-2" />
                      <div>$ 12.25</div>
                    </div>
                    <div>
                      <Rating
                        initialRating={5}
                        readonly
                        emptySymbol={<i className="cs-star text-primary" />}
                        fullSymbol={<i className="cs-star-full text-primary" />}
                      />
                      <div className="text-muted d-inline-block text-small align-text-top">(12)</div>
                    </div>
                  </div>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <Card>
            <Row className="g-0 sh-16 sh-sm-17">
              <Col xs="auto" className="h-100 position-relative">
                <Badge bg="primary" className="me-1 position-absolute e-n2 t-2 z-index-1">
                  SALE
                </Badge>
                <img src="/img/product/small/product-9.webp" alt="alternate text" className="card-img card-img-horizontal h-100 sw-11 sw-sm-16 sw-lg-20" />
              </Col>
              <Col>
                <Card.Body className="d-flex align-items-center h-100 py-3">
                  <div className="mb-0 h6">
                    <NavLink to="/storefront/detail" className="body-link stretched-link d-block mb-1 sh-3 h6 lh-1-5">
                      <Clamp tag="span" clamp="1">
                        Plain Baguette
                      </Clamp>
                    </NavLink>
                    <div className="card-text mb-2">
                      <div className="text-muted text-overline text-small sh-2">
                        <del>$ 3.25</del>
                      </div>
                      <div>$ 2.50</div>
                    </div>
                    <div>
                      <Rating
                        initialRating={5}
                        readonly
                        emptySymbol={<i className="cs-star text-primary" />}
                        fullSymbol={<i className="cs-star-full text-primary" />}
                      />
                      <div className="text-muted d-inline-block text-small align-text-top">(9)</div>
                    </div>
                  </div>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col>
          <Card>
            <Row className="g-0 sh-16 sh-sm-17">
              <Col xs="auto" className="h-100 position-relative">
                <Badge bg="primary" className="me-1 position-absolute e-n2 t-2 z-index-1">
                  SALE
                </Badge>
                <img src="/img/product/small/product-10.webp" alt="alternate text" className="card-img card-img-horizontal h-100 sw-11 sw-sm-16 sw-lg-20" />
              </Col>
              <Col>
                <Card.Body className="d-flex align-items-center h-100 py-3">
                  <div className="mb-0 h6">
                    <NavLink to="/storefront/detail" className="body-link stretched-link d-block mb-1 sh-3 h6 lh-1-5">
                      <Clamp tag="span" clamp="1">
                        Zopf
                      </Clamp>
                    </NavLink>
                    <div className="card-text mb-2">
                      <div className="text-muted text-overline text-small sh-2">
                        <del>$ 5.25</del>
                      </div>
                      <div>$ 2.85</div>
                    </div>
                    <div>
                      <Rating
                        initialRating={5}
                        readonly
                        emptySymbol={<i className="cs-star text-primary" />}
                        fullSymbol={<i className="cs-star-full text-primary" />}
                      />
                      <div className="text-muted d-inline-block text-small align-text-top">(3)</div>
                    </div>
                  </div>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row> */}
      {/* Discover End */}

      {/* Worth Checking Start */}
      {/* <h2 className="small-title">Worth Checking</h2>
      <Row className="g-4">
        <Col sm="6" lg="3">
          <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
            <img src="/img/banner/cta-square-1.webp" className="card-img h-100 scale" alt="card image" />
            <div className="card-img-overlay d-flex flex-column justify-content-between bg-transparent">
              <div className="d-flex flex-column h-100 justify-content-between align-items-start">
                <div className="cta-2 text-black w-80">Seasoned Breads</div>
                <Button variant="primary" className="btn-icon btn-icon-start mt-3 stretched-link">
                  <CsLineIcons icon="chevron-right" /> <span>View</span>
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col sm="6" lg="3">
          <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
            <img src="/img/banner/cta-square-2.webp" className="card-img h-100 scale" alt="card image" />
            <div className="card-img-overlay d-flex flex-column justify-content-between bg-transparent">
              <div className="d-flex flex-column h-100 justify-content-between align-items-start">
                <div className="cta-2 text-black w-80">Herbal and Vegan</div>
                <Button variant="primary" className="btn-icon btn-icon-start mt-3 stretched-link">
                  <CsLineIcons icon="chevron-right" /> <span>View</span>
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col sm="6" lg="3">
          <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
            <img src="/img/banner/cta-square-3.webp" className="card-img h-100 scale" alt="card image" />
            <div className="card-img-overlay d-flex flex-column justify-content-between bg-transparent">
              <div className="d-flex flex-column h-100 justify-content-between align-items-start">
                <div className="cta-2 text-black w-80">Fruit Mixed Dough</div>
                <Button variant="primary" className="btn-icon btn-icon-start mt-3 stretched-link">
                  <CsLineIcons icon="chevron-right" /> <span>View</span>
                </Button>
              </div>
            </div>
          </Card>
        </Col>
        <Col sm="6" lg="3">
          <Card className="w-100 sh-19 sh-sm-25 hover-img-scale-up">
            <img src="/img/banner/cta-square-4.webp" className="card-img h-100 scale" alt="card image" />
            <div className="card-img-overlay d-flex flex-column justify-content-between bg-transparent">
              <div className="d-flex flex-column h-100 justify-content-between align-items-start">
                <div className="cta-2 text-black w-80">Berries, Nuts and Sugar</div>
                <Button variant="primary" className="btn-icon btn-icon-start mt-3 stretched-link">
                  <CsLineIcons icon="chevron-right" /> <span>View</span>
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row> */}
      {/* Worth Checking End */}
    </>
  );
};

export default Categories;
