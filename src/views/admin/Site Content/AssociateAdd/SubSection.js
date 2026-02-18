import React, { useState, useEffect, useMemo } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';

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
      toast.success(`Data is Updated`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  const handleSave = async (e) => {
    e.preventDefault();
    await updateContent({
      variables: {
        key: eventKey,
        content: price,
      },
    });
  };

  useEffect(() => {
    setPrice(data?.content);
  }, [data, updateContentData]);

  // Define ReactQuill modules
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

  return (
    <>
      <Card className="mx-0 my-0 px-0 py-0">
        <Card.Body className="mx-4 my-4 px-0 py-0">
          <Form onSubmit={handleSave}>
            {/* Replace Form.Control with ReactQuill */}
            <ReactQuill
              modules={modules}
              theme="snow"
              value={price}
              onChange={setPrice}
              placeholder="Enter content here"
            />
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
