import { gql, useMutation } from '@apollo/client';
import React, { useState, useEffect } from 'react';
import { Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const UPDATE_AD = gql`
  mutation UpdateAds($key: String!, $url: String!, $adimage: Upload, $active: Boolean) {
    updateAds(key: $key, url: $url, adimage: $adimage, active: $active) {
      key
      images
      url
      active
    }
  }
`;

function SubSectionAD({ eventKey, data, refetch }) {
  const [images, setImages] = useState('');
  const [AdURL, setAdURL] = useState('');
  const [active, setActive] = useState(false);

  const [updateAdvertisement, { data: dataUpdate }] = useMutation(UPDATE_AD, {
    onCompleted: () => {
      toast(`${dataUpdate.updateAds.key} is updated.`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  const handleChanges = () => {
    updateAdvertisement({
      variables: {
        key: eventKey,
        url: AdURL,
        adimage: images,
        active,
      },
    });
  };

  useEffect(() => {
    setAdURL(data.url);
    setActive(data.active);
    setImages(data.images);
  }, [data, eventKey]);

  return (
    <>
      <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
        <Card.Body className="mx-4 my-0 px-0 py-0">
          <div className="my-4">
            <Form.Label className="text-dark fs-6 mt-4"> Ads Image </Form.Label>
            <Form.Control name="images" type="file" onChange={(e) => setImages(e.target.files[0])} />
            <div>{data?.images && <img className="mx-1 my-1" style={{ height: '60px', width: 'auto' }} src={data.images} alt="image" />}</div>
            <Form.Label className="text-dark fs-6 mt-4">Ads URL </Form.Label>
            <Form.Control className="my-2" name="url" type="text" value={AdURL} onChange={(e) => setAdURL(e.target.value)} placeholder="Content for Slider" />
            <div className="mb-3 text-dark">
              <Form.Label>
                {' '}
                Current Status:{' '}
                <b>
                  <strong> {data.active ? 'True' : 'False'}</strong>
                </b>
              </Form.Label>
              <Form.Check className="form-check" name="active" type="checkbox" onChange={(e) => setActive(e.currentTarget.checked)} checked={active} />
            </div>
            <Button type="submit" onClick={() => handleChanges()}>
              {' '}
              Save Changes
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default SubSectionAD;
