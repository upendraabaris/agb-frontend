import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import 'quill/dist/quill.snow.css';
import { Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useLazyQuery, gql } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import PrivacyPolicy from './Content Pages/PrivacyPolicy';
import ShippingPolicy from './Content Pages/ShippingPolicy';
import ReturnPolicy from './Content Pages/ReturnPolicy';
import CancellationPolicy from './Content Pages/CancellationPolicy';
import TandC from './Content Pages/TandC';

function AddSiteContent() {
  const title = 'User Policies';
  const description = 'User Policies';
  const [eventKey, setEventKey] = useState('privacy-policy');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  // GET SITE CONTENT
  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        content
        key
      }
    }
  `;

  const [getContent, { data: dataSiteContent, refetch }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: { key: eventKey },
    });
  }, [getContent, eventKey]);

  // REACT Quill Themes and Modules
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    }),
    []
  );

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>
      <Tabs justify onSelect={(e) => setEventKey(e)}>
        <Tab eventKey="privacy-policy" title="Privacy Policy">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <PrivacyPolicy eventKey="privacy-policy" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="shipping" title="Shipping Policy">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <ShippingPolicy eventKey="shipping" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="return" title="Return Policy">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <ReturnPolicy eventKey="return" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="cancellation" title="Cancellation Policy">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <CancellationPolicy eventKey="cancellation" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="t&c" title="Cookie Policy">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && <TandC eventKey="t&c" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </>
  );
}

export default AddSiteContent;
