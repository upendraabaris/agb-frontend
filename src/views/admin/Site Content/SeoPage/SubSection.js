import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Card, Form, Button } from 'react-bootstrap';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';

function SubSection({ title, data, eventKey, refetch }) {
  const [price, setPrice] = useState('');

  const UPDATE_SITE_CONTENT = gql`
    mutation UpdateSiteContent($key: String!, $content: String!) {
      updateSiteContent(key: $key, content: $content) {
        key
        content
      }
    }
  `;

  const [updateContent, { data: updateContentData }] = useMutation(UPDATE_SITE_CONTENT, {
    onCompleted: () => {
      toast(`Data is Updated`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  const handleSave = async (e) => {
    e.preventDefault()
    await updateContent({
      variables: {
        key: eventKey,
        content: price,
      },
    });
  }

  useEffect(() => {
    setPrice(data?.content);
  }, [data, updateContentData]);

  return (
    <>
      <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
        <Card.Body className="mx-4 my-4 px-0 py-0">
          <Form onSubmit={handleSave}>
            <Form.Label>Enter {title} Price</Form.Label>
            <Form.Control type="text" value={price} required onChange={(e) => setPrice(e.target.value)} />
            {eventKey === 'freeDelivery' && <div className="text-danger mt-2">Enter above 5000000 to hide free delivery Banner on the cart Page.</div>}
            <Button className="my-2" type="submit">
              Save
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

export default SubSection;
