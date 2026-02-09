import React, { useEffect, useState } from 'react';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

function ProductAd() {
  const title = 'Product Details Page Slider';
  const description = 'Product Details Page Slider';
  const [image, setImage] = useState(null);
  const [getimage, setGetimage] = useState(null);

  const GET_SITE_LOGO = gql`
    query GetAds($key: String!) {
      getAds(key: $key) {
        images
      }
    }
  `;

  const [GetAds, { data, refetch }] = useLazyQuery(GET_SITE_LOGO);

  useEffect(() => {
    GetAds({
      variables: {
        key: 'productDetailsPageSlider',
      },
    });
  }, []);

  useEffect(() => {
    if (data && data.getAds) {
      setGetimage(data.getAds.images);
    }
  }, [data]);

  const UPDATE_LOGO = gql`
    mutation UpdateAds($key: String!, $url: String!, $adimage: Upload) {
      updateAds(key: $key, url: $url, adimage: $adimage) {
        key
      }
    }
  `;

  const [UpdateAds] = useMutation(UPDATE_LOGO, {
    onCompleted: (res) => {
      toast(`Product Details Page Slider is updated successfully!`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  function handleTeam() {
    UpdateAds({
      variables: {
        key: 'productDetailsPageSlider',
        url: '/',
        adimage: image,
      },
    });
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
            {/* Title End */}
          </Col>
        </Row>
      </div>
      <div>
        <Card className="mb-5">
          <Card.Body>
            <div className="mb-3 mx-2">
              <Form.Label>
                <CsLineIcons icon="palette" /> Image
              </Form.Label>
              <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} />
            </div>
            <Button onClick={() => handleTeam()}>Save</Button>
          </Card.Body>
        </Card>

        {getimage && (
          <Row>
            <Col xl="6">
              <Card className="mb-5">
                <Card.Body>
                  <div className="mx-auto" style={{ height: '100px', width: '100%' }}>
                    <img src={getimage} className="w-100 h-100" alt="navlogo" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
}

export default ProductAd;
