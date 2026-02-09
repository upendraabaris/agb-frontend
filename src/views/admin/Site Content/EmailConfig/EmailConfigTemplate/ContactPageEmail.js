import React, { useState, useEffect, useMemo } from 'react';
import { Button, Row, Col, Tab, Tabs, Card, Form } from 'react-bootstrap';

import HtmlHead from 'components/html-head/HtmlHead';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import 'quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';

function ContactPageEmail() {
  const title = 'Contact Page Email';
  const description = 'Contact Page Email Page';
  const history = useHistory();
  const eventKey = 'contactPageEmail';
  const [mainContent, setMainContent] = useState('');

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

  // if(dataSiteContent){
  //   console.log(dataSiteContent.getSiteContent.content);
  //   console.log(dataSiteContent.getSiteContent.key);
  // }

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
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
          <NavLink className="text-dark pb-1 d-inline-block hidden" to="/admin/dashboard">
            <span className="align-middle ms-1">Dashboard</span>
          </NavLink>
          <span className="p-1"> / </span>
          <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/siteContent/email">
            <span className="align-middle text-dark ms-1">Email</span>
          </NavLink>
          <h1 className="mb-0 fw-bold pb-0 display-4" id="title">{title}</h1>
        </Col>
          {/* Title End */}
        </Row>
      </div>
      <div>
        <Card className="mb-5">
          <Card.Body>
            <div className="mb-3 mx-2">
              <Form.Label>{title}</Form.Label>
              <Form.Control type="email" value={mainContent} onChange={(e) => setMainContent(e.target.value)} />
            </div>
            <Button onClick={() => handleEditContent()}>Save Changes</Button>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default ContactPageEmail;
