import React, { useState, useEffect, useMemo } from 'react';
import { Button, Row, Form, Col } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import 'quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';

function OrderShipWhatsappapi() {
  const title = 'Order Ship WhatsApp';
  const description = 'Order Ship WhatsApp';
  const history = useHistory();
  const eventKey = 'ordershipwhatsapp';
  const [mainContent, setMainContent] = useState('');

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
      variables: {
        key: eventKey,
      },
    });
  }, [dataSiteContent, eventKey]);

  useEffect(() => {
    setMainContent(dataSiteContent?.getSiteContent?.content);
  }, [dataSiteContent]);

  const ADD_SITE_CONTENT = gql`
    mutation UpdateSiteContent($key: String!, $content: String!) {
      updateSiteContent(key: $key, content: $content) {
        content
        key
      }
    }
  `;

  const [editcontent, { data: dataSite }] = useMutation(ADD_SITE_CONTENT, {
    onCompleted: () => {
      toast.success(`The update was successfully!`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  function handleEditContent() {
    editcontent({
      variables: {
        key: eventKey,
        content: mainContent,
      },
    });
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="text-dark ms-1">Dashborad</span>
            </NavLink>
            <span className="p-2"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/siteContent/whatsappapi">
              <span className="text-dark ms-1">Whatsapp API</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4 fw-bold" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>
      <div className="mb-2 filled form-group tooltip-end-top">
        <div className="small pb-2">(Create a WhatsApp template with data in this sequence: 
          1. Customer Name 2. Order Id 3. Order Date 4. Courier Partner 5. Tracking No 6. Live Tracking URL 
          7. Website Name 8. Website Name)</div>
        <div className="row align-items-center">
          <div className="col-auto">Enter Template Name <span className="text-danger">*</span></div>
          <div className="col-6">
            <Form.Control
              className="p-2 border"
              type="text"
              value={mainContent}
              onChange={(e) => setMainContent(e.target.value)}
              placeholder="Customer Registration Whatsapp Message"
            />
          </div>
        </div>
      </div>

      <Button onClick={() => handleEditContent()}>Save Changes</Button>
    </>
  );
}

export default OrderShipWhatsappapi;
