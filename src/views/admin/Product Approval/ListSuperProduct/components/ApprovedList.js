import React, { useEffect, useState } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { NavLink, useHistory } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

import { Row, Col, Modal, Button, Form, Card, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';

function ApprovedList({ setApprovedCount }) {
  const history = useHistory();

  const APPROVED_PRODUCT = gql`
    query Approvedsupersellerproduct {
      approvedsupersellerproduct {
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
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);
  const [Approvedsupersellerproduct, { fetchMore, data, refetch }] = useLazyQuery(APPROVED_PRODUCT, {
    onError: (error) => {
      console.log(`APPROVED_PRODUCT!!! : ${error.message}`);
    },
  });
  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    // Update approved count when the list of approved products changes
    setApprovedCount(data?.approvedsupersellerproduct?.filter((product) => !product.reject === true).length || 0);
  }, [data, setApprovedCount]);

  return (
    <>
      <Row className="g-0 pt-2 pb-2 mt-1 mb-1 d-none d-lg-flex bg-white border-bottom">        
        <div>
          <Row className="g-0 h-100 align-content-center">
            <Col xs="6" lg="6" className="d-flex flex-column">
              <div className="fw-bold text-dark text-uppercase small ps-4">Product Name</div>
            </Col>
            <Col xs="3" lg="3" className="d-flex flex-column justify-content-center">
              <div className="fw-bold text-dark text-uppercase small">Brand</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column justify-content-center">
              <div className="fw-bold text-dark text-uppercase small">Action</div>
            </Col>
          </Row>
        </div>
      </Row>
      {data &&
        data.approvedsupersellerproduct
          ?.filter((product) => !product.reject)
          .map((product) => (
            <Card key={product.id} className="mb-3 shadow-sm border rounded-2">
              <Row className="g-0 align-items-center p-3">
                <Col xs="3" lg="2" className="text-center">
                  <NavLink to={`/product/${product.identifier.replace(/\s/g, '_').toLowerCase()}`} target="_blank">
                    <img
                      src={product.thumbnail || (product.images.length && product.images[0])}
                      alt={product.previewName}
                      className="img-fluid rounded shadow-sm border"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  </NavLink>
                </Col>
                <Col xs="6" lg="4">
                  <div className="ps-3">
                    <NavLink to="#" className="fw-semibold text-dark text-truncate d-block">
                      {product.previewName}
                    </NavLink>
                    <div className="text-muted small">SKU: #{product.sku}</div>
                  </div>
                </Col>
                <Col lg="3" className="d-none d-lg-block">
                  <span className="fw-bold text-secondary">{product.brand_name}</span>
                </Col>
                <Col xs="3" lg="3" className="ps-3">
                  <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Product Details</Tooltip>}>
                    <Button
                      variant="dark"
                      size="sm"
                      className="me-2 shadow-sm"
                      onClick={() => history.push(`details/${product.identifier.replace(/\s/g, '_').toLowerCase()}`)}
                    >
                      <CsLineIcons icon="content" size="17" />
                    </Button>
                  </OverlayTrigger>
                </Col>
              </Row>
            </Card>
          ))}

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

export default ApprovedList;
