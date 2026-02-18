import React, { useEffect, useState } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const UPDATE_ADS = gql`
  mutation UpdateAds($key: String!, $url: String!, $adimage: Upload) {
    updateAds(key: $key, url: $url, adimage: $adimage) {
      key
    }
  }
`;

const GET_ADS = gql`
  query GetAds($key: String!) {
    getAds(key: $key) {
      images
    }
  }
`;

function HandleNavLogo() {
  const title = 'Website Logo';
  const description = 'Website Logo Page';
  const [navlogoImage, setNavlogoImage] = useState(null);
  const [faviconImage, setFaviconImage] = useState(null);
  const [getNavlogoImage, setGetNavlogoImage] = useState(null);
  const [getFaviconImage, setGetFaviconImage] = useState(null);
  const [navlogoError, setNavlogoError] = useState('');
  const [faviconError, setFaviconError] = useState('');

  const [GetAds, { data: navlogoData, refetch: refetchNavlogo }] = useLazyQuery(GET_ADS, {
    variables: { key: 'navlogo' },
  });

  const [GetFavicon, { data: faviconData, refetch: refetchFavicon }] = useLazyQuery(GET_ADS, {
    variables: { key: 'favicon' },
  });

  useEffect(() => {
    GetAds();
    GetFavicon();
  }, []);

  useEffect(() => {
    if (navlogoData && navlogoData.getAds) {
      setGetNavlogoImage(navlogoData.getAds.images);
    }
  }, [navlogoData]);

  useEffect(() => {
    if (faviconData && faviconData.getAds) {
      setGetFaviconImage(faviconData.getAds.images);
    }
  }, [faviconData]);

  const [UpdateAds] = useMutation(UPDATE_ADS, {
    onCompleted: (res) => {
      toast.success(`${res.updateAds.key} is updated successfully!`, {
        style: { backgroundColor: 'green', color: 'white' },
      });
      if (res.updateAds.key === 'navlogo') refetchNavlogo();
      if (res.updateAds.key === 'favicon') refetchFavicon();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const handleFileChange = (e, setImage, setError) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      const fileType = file.type;
      const fileSize = file.size;
      if (!fileType.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }
      if (fileSize > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB.');
        return;
      }
      setImage(file);
    }
  };

  const handleNavlogoUpdate = () => {
    if (!navlogoImage) {
      setNavlogoError('Please select a logo image.');
      return;
    }
    UpdateAds({
      variables: {
        key: 'navlogo',
        url: '/',
        adimage: navlogoImage,
      },
    });
  };

  const handleFaviconUpdate = () => {
    if (!faviconImage) {
      setFaviconError('Please select a favicon image.');
      return;
    }
    UpdateAds({
      variables: {
        key: 'favicon',
        url: '/',
        adimage: faviconImage,
      },
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4 fw-bold" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>
      <div className="row">
        <div className="col-xl-6 col-12">
          <Card className="mb-1">
            <Card.Body>
              <div className="mb-3 mx-2">
                <Form.Label className="fw-bold">Website Logo Image</Form.Label>
                <Form.Control type="file" onChange={(e) => handleFileChange(e, setNavlogoImage, setNavlogoError)} />
                {navlogoError && <div style={{ color: 'red' }}>{navlogoError}</div>}
              </div>
              <Button onClick={handleNavlogoUpdate} className="ms-2">
                Save
              </Button>
            </Card.Body>
          </Card>
          {getNavlogoImage && (
            <Row>
              <Col xl="12">
                <Card className="mb-1">
                  <Card.Body>
                    <div className="mx-auto" style={{ height: '100px', width: '100%' }}>
                      <img src={getNavlogoImage} className="h-100" alt="Existing navlogo" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </div>

        <div className="col-xl-6 col-12">
          <Card className="mb-1">
            <Card.Body>
              <div className="mb-3 mx-2">
                <Form.Label className="fw-bold">Favicon Image</Form.Label>
                <Form.Control type="file" onChange={(e) => handleFileChange(e, setFaviconImage, setFaviconError)} />
                {faviconError && <div style={{ color: 'red' }}>{faviconError}</div>}
              </div>
              <Button onClick={handleFaviconUpdate} className="ms-2">
                Save
              </Button>
            </Card.Body>
          </Card>
          {getFaviconImage && (
            <Row>
              <Col xl="12">
                <Card className="mb-1">
                  <Card.Body>
                    <div className="mx-auto" style={{ height: '100px', width: '100px' }}>
                      <img src={getFaviconImage} className="w-100 h-100" alt="Existing favicon" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </div>
    </>
  );
}

export default HandleNavLogo;
