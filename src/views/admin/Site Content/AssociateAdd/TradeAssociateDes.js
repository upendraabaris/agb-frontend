import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';

function TradeAssociate({ title, data, eventKey, refetch }) {
  const [tradeassociatedes, setTradeAssociateDes] = useState(''); // Correct state variable

  const UPDATE_SITE_CONTENT = gql`
    mutation UpdateSiteContent($key: String!, $content: String!) {
      updateSiteContent(key: $key, content: $content) {
        key
        content
      }
    }
  `;

  const [updateContent] = useMutation(UPDATE_SITE_CONTENT, {
    onCompleted: (response) => {
      toast(`${response.updateSiteContent.key} is updated`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  async function handleSave() {
    try {
      await updateContent({
        variables: {
          key: eventKey,
          content: tradeassociatedes, // Use the correct state variable here
        },
      });
    } catch (error) {
      console.error('Error saving content:', error);
    }
  }

  useEffect(() => {
    setTradeAssociateDes(data?.content || '');
  }, [data]);

  return (
    <>
      <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
        <Card.Body className="mx-4 my-4 px-0 py-0">
          <Form.Label>Enter {title}</Form.Label>
          <Form.Control
            type="text"
            value={tradeassociatedes} // Correct state variable here
            onChange={(e) => setTradeAssociateDes(e.target.value)} // Correct setter function
          />
          <Button className="my-2 mx-2" onClick={handleSave}>
            Save
          </Button>
        </Card.Body>
      </Card>
    </>
  );
}

export default TradeAssociate;
