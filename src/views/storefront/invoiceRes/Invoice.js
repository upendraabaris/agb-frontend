import React, { useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import HtmlHead from 'components/html-head/HtmlHead';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import ReactToPdf from './components/ReactToPdf';

const Invoice = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const title = 'Invoice';
  const description = 'Invoice Page';

  const goBack = () => {
    history.goBack();
  };

  return (
    <>
      <HtmlHead title={title} description={description} />     
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" onClick={goBack} to="#">
              <span className="align-middle text-dark ms-1">Go Back</span>
            </NavLink>          
          </Col>
        </Row>
      </div>
      <div className="fs-6 mb-1 fw-bold">
        <ReactToPdf />
      </div>
    </>
  );
};

export default Invoice;