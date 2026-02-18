import { React, useState, useEffect } from 'react';
import { useQuery, gql, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import moment from 'moment';
import { NavLink, withRouter } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { Row, Col, Button, Form, Card, Modal, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';

function QuotationList({ history }) {
  const title = 'List Quotation';
  const description = 'Ecommerce List Quotation Page';
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteTitle, setTitleDelete] = useState('');

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_QUOTATION = gql`
    query Quatation {
      quatation {
        id
        quatationProducts {
          productId {
            previewName
            brand_name
          }
          variantId {
            id
            variantName
          }
        }
        createdAt
      }
    }
  `;

  const [quatationdata, setQuatationdata] = useState([]);

  const [Quatation, { refetch }] = useLazyQuery(GET_QUOTATION, {
    onCompleted: (res) => {
      setQuatationdata(res.quatation);
    },
    onError: (error) => {
      console.error('error', error);
    },
  });

  useEffect(() => {
    Quatation();
  }, []);

  if (quatationdata) {
    console.log('quatationdata', quatationdata);
  }

  const DELETE_QUOTATION = gql`
    mutation DeleteQuatation($deleteQuatationId: ID) {
      deleteQuatation(id: $deleteQuatationId) {
        quatationProducts {
          productId {
            fullName
          }
        }
      }
    }
  `;

  const [deleteQuote, { data: deleteData }] = useMutation(DELETE_QUOTATION, {
    onCompleted: () => {
      toast(`${deleteData.deleteQuatation.quatationProducts[0].productId.fullName} is removed from database.!`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  function handleDelete(ids, name) {
    setDeleteModalView(true);
    setDeleteId(ids);
    setTitleDelete(name);
  }

  const deleteQuoteConfirmed = async () => {
    setDeleteModalView(true);
    await deleteQuote({
      variables: {
        deleteQuatationId: deleteId,
      },
    });
    setDeleteModalView(false);
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>

      <Row className="g-0 mb-2 d-none d-lg-flex">
        <Col xs="auto" className="sw-11 d-none d-lg-flex" />
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-5 pe-4 h-100">
            <Col xs="3" lg="3" className="d-flex flex-column mb-lg-0 pe-3">
              <div className="text-muted text-small cursor-pointer">Quatation ID</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer">Brand Name</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer">No of Products</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer">Date</div>
            </Col>
            <Col xs="2" lg="2" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-muted text-small cursor-pointer">Action</div>
            </Col>
          </Row>
        </Col>
      </Row>

      {quatationdata.length > 0 &&
        quatationdata
          .slice(0)
          .reverse()
          .map((item, index1) => (
            <Card key={index1} className="mb-2">
              <Row className="g-0 h-100 sh-lg-9 position-relative">
                <Col className="py-4 py-lg-0 ps-5 pe-4 h-100">
                  <Row className="g-0 h-100 align-content-center">
                    <Col xs="11" lg="3" className="d-flex flex-column mb-lg-0 mb-3 pe-3 d-flex order-1 h-lg-100 justify-content-center">
                      <NavLink to={`detail?quatationID=${item.id}`} className="text-truncate h-100 d-flex align-items-center">
                        {item.id}
                      </NavLink>
                    </Col>
                    {item.quatationProducts.length > 0 && (
                      <Col lg="2" className="d-flex flex-column pe-1 mb-2 mb-lg-0 justify-content-center order-2">
                        <div className="text-muted text-small d-md-none">Brand Name </div>
                        <div className="text-alternate">{item.quatationProducts[0].productId.brand_name}</div>
                      </Col>
                    )}
                    <Col lg="2" className="d-flex flex-column pe-1 mb-2 mb-lg-0 justify-content-center order-3">
                      <div className="text-muted text-small d-md-none">No of Products </div>
                      <div className="text-alternate">{item.quatationProducts.length}</div>
                    </Col>
                    <Col lg="2" className="d-flex flex-column pe-1 mb-2 mb-lg-0 justify-content-center order-4">
                      <div className="text-muted text-small d-md-none">Date</div>
                      <div className="text-alternate">{moment(parseInt(item.createdAt, 10)).format('LL')}</div>
                    </Col>
                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-5">
                      <div className="text-muted text-small d-lg-none mb-1">Action</div>
                      <div>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Delete Quatation</Tooltip>}>
                          <div className="d-inline-block me-2">
                            <Button
                              variant="foreground-alternate"
                              onClick={() => handleDelete(item.id, item.quatationProducts[0].productId.brand_name)}
                              className="btn-icon btn-icon-only shadow"
                            >
                              <CsLineIcons icon="bin" className="text-primary" size="17" />
                            </Button>
                          </div>
                        </OverlayTrigger>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          ))}
      {/* Delete Blog Modal Starts */}
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Quotation</Modal.Title>
        </Modal.Header>
        {deleteTitle && (
          <Modal.Body>
            <span className="fs-5">{deleteTitle}</span> will be deleted?
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
            No, Go Back!
          </Button>
          <Button variant="primary" onClick={() => deleteQuoteConfirmed()}>
            Yes, Continue!
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delete Blog Modal Ends */}
    </>
  );
}

export default withRouter(QuotationList);
