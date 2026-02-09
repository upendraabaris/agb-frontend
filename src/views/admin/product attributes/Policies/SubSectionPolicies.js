import React, { useState, useEffect } from 'react';
import 'quill/dist/quill.snow.css';
import { Row, Col, Button, Dropdown, Form, Card, Pagination, Tooltip, OverlayTrigger, Tabs, Tab } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import { toast } from 'react-toastify';
import { useLazyQuery, gql, useMutation, useQuery } from '@apollo/client';

function SubSectionPolicies({data, theme, modules, eventKey, refetch, title}) {
    const [mainContent, setMainContent] = useState("");
    
    const ADD_SITE_CONTENT = gql`
      mutation UpdateSiteContent($key: String!, $content: String!) {
        updateSiteContent(key: $key, content: $content) {
          content
          key
        }
      }
    `;
  
    const [editcontent, {data: dataSite}] = useMutation(ADD_SITE_CONTENT, {
      onCompleted: () => {
        toast.success(`The update was successfully!`);
        refetch();
      }, 
      onError: (error) => {
        toast.error(error.message || 'Something went wrong!');
      },
    });  
  
    function handleEditContent(){
      editcontent({
        variables: {  
          key: eventKey,
          content: mainContent,
        }
      });
    }
  
    useEffect(() => {
      setMainContent(data.content);
    },  [data]);

  return (<>
    <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
      <Card.Body className="mx-4 my-4 px-0 py-0">
        <h2 className="small-title my-2 py-2">{title}</h2>
        <div className="mb-3 filled form-group tooltip-end-top">
          <ReactQuill modules={modules} theme="snow" placeholder="Write Policy here" value={mainContent} onChange={setMainContent} name="content" />
        </div>
      <Button onClick={() => handleEditContent()}>Save Changes</Button> 
      </Card.Body>
    </Card>
  </>)
}

export default SubSectionPolicies;
