import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Card, Form, Button } from 'react-bootstrap';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';

const UPDATE_SITE_CONTENT = gql`
  mutation UpdateSiteContent($key: String!, $content: String!) {
    updateSiteContent(key: $key, content: $content) {
      key
      content
    }
  }
`;

function Commission({ title, data, eventKey, refetch }) {
  const [commission, setCommission] = useState('');
  const [updateContent, { data: updateContentData }] = useMutation(UPDATE_SITE_CONTENT, {
    onCompleted: () => {
      toast(`${updateContentData.updateSiteContent.key} is updated`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  function handleSave() {
    updateContent({
      variables: {
        key: eventKey,
        content: commission,
      },
    });
  }

  useEffect(() => {
    setCommission(data?.content);
  }, [data, updateContentData]);

  return (
    <>
      <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
        <Card.Body className="mx-4 my-4 px-0 py-0">
          <Form.Label>Enter {title}</Form.Label>
          <Form.Control type="number" value={commission} step="0.01" onChange={(e) => setCommission(e.target.value)} />
          <Button
            className="my-2 mx-2"
            onClick={() => {
              handleSave();
            }}
          >
            {' '}
            Save{' '}
          </Button>
        </Card.Body>
      </Card>
    </>
  );
}

export default Commission;
