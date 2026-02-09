import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { NavLink, useHistory } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Button, Row, Col, Card, Pagination, Tooltip, OverlayTrigger, Spinner } from 'react-bootstrap';

function RejectedList({ setRejectedCount }) {
  const history = useHistory();

  const REJECTED_PRODUCT = gql`
    query pendingsupersellerproduct {
      pendingsupersellerproduct {
        brand_name
        fullName
        id
        approve
        sku
        thumbnail
        images
        previewName
        identifier
        reject
      }
    }
  `;

  const [loadRejectedProducts, { fetchMore, data, refetch, loading }] = useLazyQuery(REJECTED_PRODUCT, {
    onError: (error) => {
      console.log(`REJECTED_PRODUCT!!! : ${error.message}`);
    },
  });

  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  useEffect(() => {
    loadRejectedProducts();
  }, [loadRejectedProducts]);

  useEffect(() => {
    setRejectedCount(data?.pendingsupersellerproduct?.filter((product) => product.reject === true).length || 0);
  }, [data, setRejectedCount]);

  return (
    <>
      {/* List Header Start */}
      <Row className="g-0 pt-2 pb-2 mt-1 mb-1 d-none d-lg-flex bg-white">
        <Col xs="auto" className="sw-11 d-none d-lg-flex" />
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-dark text-small">Product Full Name</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-small">Brand</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-small">Action</div>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* List Header End */}

      {/* Loading Indicator */}
      {loading && (
        <div className="d-flex justify-content-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {/* No Results Found */}
      {!loading && data?.pendingsupersellerproduct?.filter((product) => product.reject === true).length === 0 && (
        <div className="text-center text-muted mt-5">
          <h5>No rejected products found.</h5>
        </div>
      )}

      {/* Single Card Begins Here */}
      {data && (
        <>
          {data.pendingsupersellerproduct
            ?.filter((product) => product.reject === true)
            .map((product) => {
              return (
                <Card key={product.id} className="mb-2">
                  <Row className="g-0 h-100 sh-lg-9 position-relative">
                    <Col xs="1" className="position-relative h-100">
                      <NavLink to="#/!" className="d-block h-100">
                        <img
                          src={product.thumbnail || (product.images.length && product.images[0])}
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
                            <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Product Details</Tooltip>}>
                              <div className="d-inline-block me-2">
                                <Button
                                  variant="foreground-alternate"
                                  className="btn-icon btn-icon-only shadow"
                                  onClick={() => {
                                    history.push(`details/${product.identifier?.replace(/\s/g, '_').toLowerCase()}`);
                                  }}
                                >
                                  <CsLineIcons icon="content" className="text-primary" size="17" />
                                </Button>
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
      {data && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getUsers?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
      {/* Pagination End */}
    </>
  );
}

export default RejectedList;
