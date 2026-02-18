import React, { useState, useEffect } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLazyQuery, gql, useMutation } from '@apollo/client';

function SocialMedia({ title }) {
  const [link, setLink] = useState({});

  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        content
        key
      }
    }
  `;

  const [getContent, { data, refetch }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: {
        key: title,
      },
    });
  }, [getContent, title]);

  useEffect(() => {
    if (data?.getSiteContent) {
      setLink(data.getSiteContent);
    }
  }, [data]);

  const ADD_SITE_CONTENT = gql`
    mutation UpdateSiteContent($key: String!, $content: String!) {
      updateSiteContent(key: $key, content: $content) {
        content
        key
      }
    }
  `;

  const [editcontent] = useMutation(ADD_SITE_CONTENT, {
    onCompleted: (res) => {
      toast(`${res.updateSiteContent.key} is updated.`);
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  const handleContent = (e) => {
    setLink((prevState) => {
      const updatedVariant = {
        ...prevState,
        content: e.target.value,
      };
      return updatedVariant;
    });
  };
  function handleLink() {
    editcontent({
      variables: {
        key: link.key,
        content: link.content,
      },
    });
  }

  return (
    <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
      <Card.Body className="mx-4 my-4 px-0 py-0">
        <Form.Label className="small-title fs-6 mt-4">Paste {title} Link below</Form.Label>
        <Form.Control className="my-2" type="text" value={link.content} onChange={(e) => handleContent(e)} placeholder={title} />
        <Button
          onClick={() => {
            handleLink();
          }}
        >
          Save Changes
        </Button>
      </Card.Body>
    </Card>
  );
}

export default SocialMedia;
