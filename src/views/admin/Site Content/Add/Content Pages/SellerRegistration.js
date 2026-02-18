import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Button, Dropdown, Form, Card, Pagination, Tooltip, OverlayTrigger, Tabs, Tab } from 'react-bootstrap';
import DOMPurify from 'dompurify';
import 'quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import 'react-dropzone-uploader/dist/styles.css';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';

function SellerRegistration({ data, theme, modules, eventKey, refetch }) {
  const [mainContent, setMainContent] = useState('');

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
      toast(`${dataSite?.updateSiteContent?.key} is updated.`);
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

  useEffect(() => {
    setMainContent(data?.content);
  },  [data]);

  return (<>
    <h2 className="small-title my-2 py-2">Seller Registration</h2>
    <div className="mb-3 filled form-group tooltip-end-top">
      <ReactQuill modules={modules} theme="snow" placeholder="Write Content" value={mainContent} onChange={setMainContent} name="content" />
    </div>
    <Button onClick={() => handleEditContent()}>Save Changes</Button>
  </>)
}

export default SellerRegistration;
