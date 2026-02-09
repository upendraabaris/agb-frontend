import React, { useState, useEffect, useMemo } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink } from 'react-router-dom';
import 'quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;

const ADD_SITE_CONTENT = gql`
  mutation UpdateSiteContent($key: String!, $content: String!) {
    updateSiteContent(key: $key, content: $content) {
      content
      key
    }
  }
`;

function DealerRegistrationAlready() {
  const title = 'Register New Dealer Associate Request (Customer, Portal Admin)';
  const description = 'Register New Dealer Associate Request (Customer, Portal Admin';
  const eventKey = 'newDealerRegistrationMail';
  const [mainContent, setMainContent] = useState('');
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
  const [editcontent, { data: dataSite }] = useMutation(ADD_SITE_CONTENT, {
    onCompleted: () => {
      toast.success(`The update was successfully!`);
      refetch();
    },
    onError: (error) => {
      toast.error(error?.message || 'Something went wrong!');
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
            <NavLink className="text-dark pb-1 d-inline-block hidden" to="/admin/dashboard">
              <span className="align-middle ms-1">Dashboard</span>
            </NavLink>
            <span className="p-1"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/siteContent/email">
              <span className="align-middle text-dark ms-1">Email</span>
            </NavLink>
            <h1 className="mb-0 fw-bold pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          <div className="pt-2 fw-bold small">
            (Customer Name: $customerName, Email: $email, Password: $password, Mobile No: $mobileNo, Business Associate Name: $baName, Dealer Name: $dealerName,
            GST Number: $gst, Dealer Address: $dealerAddress, Dealer Description: $dealerDescription, Website: $website)
          </div>
        </Row>
      </div>
      <div className="mb-3 filled form-group tooltip-end-top">
        <ReactQuill modules={modules} theme="snow" value={mainContent} onChange={setMainContent} name="content" />
      </div>
      <Button onClick={() => handleEditContent()}>Save Changes</Button>
    </>
  );
}

export default DealerRegistrationAlready;
