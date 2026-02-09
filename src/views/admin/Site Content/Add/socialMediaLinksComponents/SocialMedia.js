import React, { useState, useEffect } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLazyQuery, gql, useMutation } from '@apollo/client';

function SocialMedia({ title, data1 }) {
//  if(data1){
//   console.log(data1);
//  }
 // console.log(data1)
  
  const [link, setLink] = useState({ content: '', key: title });

  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        content
        key
      }
    }
  `;

  const [getContent, { error, data, refetch }] = useLazyQuery(GET_SITE_CONTENT, {
    variables: {
      key: title,
    },
  });

  useEffect(() => {
    if (title) {
      getContent();
    }
  }, [getContent, title]);

  useEffect(() => {
    if (data && data.getSiteContent) {
      setLink({
        content: data.getSiteContent.content,
        key: data.getSiteContent.key,
      });
    }
  }, [data]);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setLink((prevLinkData) => ({
      ...prevLinkData,
      [name]: value,
    }));
  };

  // update the Social Media Links

  const UPDATE_SOCIAL_LINK = gql`
    mutation UpdateSiteContent($key: String!, $content: String!) {
      updateSiteContent(key: $key, content: $content) {
        content
        key
      }
    }
  `;

  const [UpdateSiteContent] = useMutation(UPDATE_SOCIAL_LINK, {
    onCompleted: (res) => {
      toast(`${res.updateSiteContent.key} is updated.`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const Submit = (e) => {
    e.preventDefault();
    UpdateSiteContent({
      variables: link,
    });
  };
  return (
    <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
      <Card.Body className="mx-4 my-4 px-0 py-0">
        <Form onSubmit={Submit}>
          <Form.Label className="small-title fs-6 mt-4">Enter Your {title.toUpperCase()} URL</Form.Label>
          <Form.Control className="my-2" name="content" type="text" value={link.content || ''} onChange={handleChange} placeholder={title} />
          <Button type="submit">Save Changes</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default SocialMedia;
