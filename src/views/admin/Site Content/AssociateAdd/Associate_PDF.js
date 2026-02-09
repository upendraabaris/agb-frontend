import React, { useEffect, useState } from 'react';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { NavLink, useHistory } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const GET_ADS = gql`
  query GetAds($key: String!) {
    getAds(key: $key) {
      images
    }
  }
`;

const UPDATE_ADS = gql`
  mutation UpdateAds($key: String!, $url: String!, $adimage: Upload) {
    updateAds(key: $key, url: $url, adimage: $adimage) {
      key
    }
  }
`;

function HandleNavLogo() {
  const title = 'Associate PDF';
  const description = 'Associate PDF';
  const history = useHistory();

  const [enquiryPdfImage, setEnquiryPdfImage] = useState(null);
  const [servicePdfImage, setServicePdfImage] = useState(null);
  const [tradePdfImage, setTradePdfImage] = useState(null);
  const [businessPdfImage, setBusinessPdfImage] = useState(null);
  const [dealerPdfImage, setDealerPdfImage] = useState(null);

  const [getEnquiryPdfImage, setGetEnquiryPdfImage] = useState(null);
  const [getServicePdfImage, setGetServicePdfImage] = useState(null);
  const [getTradePdfImage, setGetTradePdfImage] = useState(null);
  const [getBusinessPdfImage, setGetBusinessPdfImage] = useState(null);
  const [getDealerPdfImage, setGetDealerPdfImage] = useState(null);

  const [enquiryPdfError, setEnquiryPdfError] = useState('');
  const [servicePdfError, setServicePdfError] = useState('');
  const [tradePdfError, setTradePdfError] = useState('');
  const [businessPdfError, setBusinessPdfError] = useState('');
  const [dealerPdfError, setDealerPdfError] = useState('');

  const [GetEnquiryPdf, { data: enquiryPdfData, refetch: refetchEnquiryPdf }] = useLazyQuery(GET_ADS, { variables: { key: 'enquirypdf' } });
  const [GetServicePdf, { data: servicePdfData, refetch: refetchServicePdf }] = useLazyQuery(GET_ADS, { variables: { key: 'servicepdf' } });
  const [GetTradePdf, { data: tradePdfData, refetch: refetchTradePdf }] = useLazyQuery(GET_ADS, { variables: { key: 'tradepdf' } });
  const [GetBusinessPdf, { data: businessPdfData, refetch: refetchBusinessPdf }] = useLazyQuery(GET_ADS, { variables: { key: 'businesspdf' } });
  const [GetDealerPdf, { data: dealerPdfData, refetch: refetchDealerPdf }] = useLazyQuery(GET_ADS, { variables: { key: 'dealerpdf' } });

  useEffect(() => {
    GetEnquiryPdf();
    GetServicePdf();
    GetTradePdf();
    GetBusinessPdf();
    GetDealerPdf();
  }, []);

  useEffect(() => {
    if (enquiryPdfData?.getAds) setGetEnquiryPdfImage(enquiryPdfData.getAds.images);
  }, [enquiryPdfData]);

  useEffect(() => {
    if (servicePdfData?.getAds) setGetServicePdfImage(servicePdfData.getAds.images);
  }, [servicePdfData]);

  useEffect(() => {
    if (tradePdfData?.getAds) setGetTradePdfImage(tradePdfData.getAds.images);
  }, [tradePdfData]);

  useEffect(() => {
    if (businessPdfData?.getAds) setGetBusinessPdfImage(businessPdfData.getAds.images);
  }, [businessPdfData]);

  useEffect(() => {
    if (dealerPdfData?.getAds) setGetDealerPdfImage(dealerPdfData.getAds.images);
  }, [dealerPdfData]);

  const [UpdateAds] = useMutation(UPDATE_ADS, {
    onCompleted: (res) => {
      toast.success(`PDF file is updated successfully!`, {
        style: { backgroundColor: 'green', color: 'white' },
      });

      if (res.updateAds.key === 'enquirypdf') refetchEnquiryPdf();
      if (res.updateAds.key === 'servicepdf') refetchServicePdf();
      if (res.updateAds.key === 'tradepdf') refetchTradePdf();
      if (res.updateAds.key === 'businesspdf') refetchBusinessPdf();
      if (res.updateAds.key === 'dealerpdf') refetchBusinessPdf();
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

      if (fileType !== 'application/pdf') {
        toast.error('Please select a valid PDF file.');
        return;
      }

      if (fileSize > 5 * 1024 * 1024) {
        // 5 MB
        toast.error('File size should be less than 5MB.');
        return;
      }

      setImage(file);
    }
  };

  const handleUpdate = (key, pdfImage, setError) => {
    if (!pdfImage) {
      setError(`Please select a PDF file for ${key}.`);
      return;
    }
    UpdateAds({
      variables: {
        key,
        url: '/',
        adimage: pdfImage,
      },
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <Button onClick={() => history.goBack()} className="mb-2 ps-2 px-2 p-1 border text-dark bg-light">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Back</span>
            </Button>
            <h1 className="mb-0 pb-0 display-4 fw-bold" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>
      <div className="row">
        {[
          {
            label: 'Enquiry Associate PDF',
            image: enquiryPdfImage,
            setImage: setEnquiryPdfImage,
            error: enquiryPdfError,
            setError: setEnquiryPdfError,
            update: () => handleUpdate('enquirypdf', enquiryPdfImage, setEnquiryPdfError),
            link: getEnquiryPdfImage,
          },
          {
            label: 'Service Provider Associate PDF',
            image: servicePdfImage,
            setImage: setServicePdfImage,
            error: servicePdfError,
            setError: setServicePdfError,
            update: () => handleUpdate('servicepdf', servicePdfImage, setServicePdfError),
            link: getServicePdfImage,
          },
          {
            label: 'Seller Associate PDF',
            image: tradePdfImage,
            setImage: setTradePdfImage,
            error: tradePdfError,
            setError: setTradePdfError,
            update: () => handleUpdate('tradepdf', tradePdfImage, setTradePdfError),
            link: getTradePdfImage,
          },
          {
            label: 'Business Associate PDF',
            image: businessPdfImage,
            setImage: setBusinessPdfImage,
            error: businessPdfError,
            setError: setBusinessPdfError,
            update: () => handleUpdate('businesspdf', businessPdfImage, setBusinessPdfError),
            link: getBusinessPdfImage,
          },
          {
            label: 'Dealer Associate PDF',
            image: dealerPdfImage,
            setImage: setDealerPdfImage,
            error: dealerPdfError,
            setError: setDealerPdfError,
            update: () => handleUpdate('dealerpdf', dealerPdfImage, setDealerPdfError),
            link: getDealerPdfImage,
          },
        ].map(({ label, image, setImage, error, setError, update, link }, index) => (
          <div key={index} className="col-xl-6 col-12">
            <Card className="mb-1">
              <Card.Body>
                <Row className="align-items-center">
                  <Col className="col-6">
                    <Form.Label className="fw-bold text-dark">{label}</Form.Label>
                    <Form.Control type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setImage, setError)} />
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    <Button onClick={update} className="w-100 mt-2">
                      Save
                    </Button>
                  </Col>
                  <Col className="col-6 text-center">
                    {link && (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                        View {label}
                      </a>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
}

export default HandleNavLogo;
