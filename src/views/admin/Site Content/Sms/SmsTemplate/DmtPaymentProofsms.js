import React, { useState, useEffect, useMemo } from 'react';
import { Button, Row, Form, Col } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import 'quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';

function DmtPaymentProofsms() {
  const title = 'DMT Payment Proof Submit';
  const description = 'Ecommerce DMT  Payment Proof Submit Page';
  const history = useHistory();
  const eventKey = 'dmtPaymentProofsms';
  const [mainContent, setMainContent] = useState('');

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
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/siteContent/sms">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">SMS</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <div className="mb-3 filled form-group tooltip-end-top">
        <Form.Control
          className="p-2 border"
          type="text"
          value={mainContent}
          onChange={(e) => setMainContent(e.target.value)}
          placeholder="DMT Payment Proof Submit"
        />
        <div className="small">(Example: Welcome to your new yourdomainname.com account! We hope you will enjoy it very much!# APNAGM# 1507166365582023762#)</div>
        <div className="small text-danger">
          (Note: After typing the SMS, give # without space, then Sender ID and #, then Template ID and then #. "don't give space after #")
        </div>
        {/* <ReactQuill modules={modules} theme="snow" placeholder="Compose an epic SMS" value={mainContent} onChange={setMainContent} name="content" /> */}
      </div>
      <Button onClick={() => handleEditContent()}>Save Changes</Button>
    </>
  );
}

export default DmtPaymentProofsms;
