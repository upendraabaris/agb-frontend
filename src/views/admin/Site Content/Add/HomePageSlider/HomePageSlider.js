import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Form, Card, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useLazyQuery, gql, useMutation } from '@apollo/client';

function HomePageSlider({ data, eventKey, title, refetchAgain }) {
  const [images, setImages] = useState([]);
  const [sliderContent, setSliderContent] = useState('');
  const [sliderUrl, setSliderUrl] = useState('');

  // UPDATE HOME PAGE SLIDER
  const HOME_PAGE_SLIDER = gql`
    mutation UpdateHomePageSlider($key: String!, $content: String!, $sliderimages: [Upload], $url: String) {
      updateHomePageSlider(key: $key, content: $content, sliderimages: $sliderimages, url: $url) {
        key
        images
        content
        url
      }
    }
  `;

  const [updateHomePage, { loading: loadImages, error: errorImages, data: dataImages }] = useMutation(HOME_PAGE_SLIDER, {
    onCompleted: () => {
      toast(`${dataImages.updateHomePageSlider.key} is updated.`);
      refetchAgain();
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  // if (loadImages) {
  //  console.log('Loading', loadImages);
  // }
  // if (errorImages) {
  //  console.log('error', errorImages.message);
  // }
  // if (dataImages) {
  //  console.log(dataImages);
  // }

  function handleSlider() {
    updateHomePage({
      variables: {
        key: eventKey,
        content: sliderContent,
        sliderimages: images,
        url: sliderUrl,
      },
    });
  }

  useEffect(() => {
    setImages(data.images);
    setSliderContent(data.content);
    setSliderUrl(data.url);
  }, [data, eventKey, title]);

  return (
    <>
      <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
        <Card.Body className="mx-4 my-0 px-0 py-0">
          <div className="my-4">
            <Form.Label className="small-title fs-6 mt-4"> First Image Slider </Form.Label>
            <Form.Control type="file" multiple onChange={(e) => setImages(e.target.files)} />
            {data?.images?.length > 0 && (
              <div>
                {data.images.map((img) => (
                  <img className="mx-1 my-1" style={{ height: '60px', width: 'auto' }} key={img} src={img} alt="image" />
                ))}
              </div>
            )}
            <Form.Label className="small-title fs-6 mt-4">Content for {title}</Form.Label>
            {/* {data && (<div><p>{data.content}</p></div>)} */}
            <Form.Control
              className="my-2"
              type="text"
              value={sliderContent}
              onChange={(e) => setSliderContent(e.target.value)}
              placeholder="Content for Slider"
            />
            <Form.Label className="small-title fs-6 mt-4">Link for {title}</Form.Label>
            {/* {data && (<div><p>{data.url}</p></div>)} */}
            <Form.Control className="my-2" type="text" value={sliderUrl} onChange={(e) => setSliderUrl(e.target.value)} placeholder="URL for Slider" />
            <Button onClick={() => handleSlider()}>Save Changes</Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default HomePageSlider;
