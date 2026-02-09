import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import 'quill/dist/quill.snow.css';
import { Row, Col, Button, Form, Card, Tabs, Tab } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import 'react-dropzone-uploader/dist/styles.css';
import AboutUs from './Content Pages/AboutUs';
import ContactUs from './Content Pages/ContactUs';
import MeetOurTeam from './Content Pages/MeetOurTeam';
import PrivacyPolicy from './Content Pages/PrivacyPolicy';
import ShippingPolicy from './Content Pages/ShippingPolicy';
import ReturnPolicy from './Content Pages/ReturnPolicy';
import FAQ from './Content Pages/FAQ';
import TandC from './Content Pages/TandC';
import FooterAddress from './Content Pages/FooterAddress';
import FooterContent from './Content Pages/FooterContent';
import LoginPageContent from './Content Pages/LoginPageContent';
import SocialMedia from './socialMediaLinksComponents/SocialMedia';
import HomePageSlider from './HomePageSlider/HomePageSlider';
import CancellationPolicy from './Content Pages/CancellationPolicy';
import B2BRegistration from './Content Pages/B2BRegistration';
import SellerRegistration from './Content Pages/SellerRegistration';
import RegisterPageContent from './Content Pages/RegisterPageContent';

function AddSiteContent() {
  const title = 'Site Content';
  const description = 'Ecommerce Site Content Page';
  const [eventKey, setEventKey] = useState('about-us');
  // const [mainContent, setMainContent] = useState("");
  const [eventKeyImages, setEventKeyImages] = useState('slider1');
  const [images, setImages] = useState([]);
  const [sliderContent, setSliderContent] = useState('');
  const [sliderUrl, setSliderUrl] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  // GET SITE CONTENT
  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        content
        key
      }
    }
  `;

  const [getContent, { data: dataSiteContent, refetch }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: {
        key: eventKey,
      },
    });
  }, [dataSiteContent, eventKey]);

  // REACT Quill Themes and Modules
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

  // GET HOME PAGE SLIDER IMAGES AND CONTENT
  const GET_HOME_PAGE_SLIDER_IMAGES = gql`
    query GetHomePageSlider($key: String!) {
      getHomePageSlider(key: $key) {
        images
        content
        key
        url
      }
    }
  `;

  const [getSlides, { data: dataSlider, refetch: refetchAgain }] = useLazyQuery(GET_HOME_PAGE_SLIDER_IMAGES);

  useEffect(() => {
    getSlides({
      variables: {
        key: eventKeyImages,
      },
    });
  }, [dataSlider, eventKeyImages]);

  // UPDATE HOME PAGE SLIDER
  // const HOME_PAGE_SLIDER = gql`
  //   mutation UpdateHomePageSlider($key: String!, $content: String!, $sliderimages: [Upload], $url: String) {
  //     updateHomePageSlider(key: $key, content: $content, sliderimages: $sliderimages, url: $url) {
  //       key
  //       images
  //       content
  //       url
  //     }
  //   }
  // `;

  // const [updateHomePage, { loading: loadImages, error: errorImages, data: dataImages }] = useMutation(HOME_PAGE_SLIDER, {
  //   onCompleted: () => {
  //     toast(`${dataImages.updateHomePageSlider.key} is updated.`);
  //     refetchAgain();
  //   },
  //   onError: (error) => {
  //     toast.error(error.message || 'Something went wrong!');
  //   },
  // });

  // if (loadImages) {
  //   console.log('Loading', loadImages);
  // }
  // if (errorImages) {
  //   console.log('error', errorImages.message);
  // }
  // if (dataImages) {
  //   console.log(dataImages);
  // }

  // function handleSlider() {
  //   console.log(images);
  //   updateHomePage({
  //     variables: {
  //       key: eventKeyImages,
  //       content: sliderContent,
  //       sliderimages: images,
  //       url: sliderUrl
  //     },
  //   });
  // }

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
      {/* <h2 className="small-title my-2 py-2">Add Content to APNAGHARBANAO site</h2> */}
      {/* <h3 className="small-title fs-3 my-4 mx-2 ">Website Content</h3> */}
      <Tabs justify onSelect={(e) => setEventKey(e)}>
        <Tab eventKey="about-us" title="About Us">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && <AboutUs eventKey="about-us" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="contact-us" title="Contact Us">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && <ContactUs eventKey="contact-us" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="meet-our-team" title="Meet Our Team">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <MeetOurTeam eventKey="meet-our-team" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        {/* <Tab eventKey="privacy-policy" title="Privacy Policy">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <PrivacyPolicy eventKey="privacy-policy" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="shipping" title="Shipping Policy">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <ShippingPolicy eventKey="shipping" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="return" title="Return Policy">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && <ReturnPolicy eventKey="return" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />}
            </Card.Body>
          </Card>
        </Tab> 
        <Tab eventKey="cancellation" title="Cancellation Policy">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <CancellationPolicy eventKey="cancellation" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab> */}
        <Tab eventKey="faq" title="FAQ">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && <FAQ eventKey="faq" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />}
            </Card.Body>
          </Card>
        </Tab>
        {/* <Tab eventKey="t&c" title="T&C">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && <TandC eventKey="t&c" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />}
            </Card.Body>
          </Card>
        </Tab> */}
        <Tab eventKey="footer-address" title="Footer Address">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <FooterAddress eventKey="footer-address" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="footer-content" title="Footer Content">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <FooterContent eventKey="footer-content" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="login-page-content" title="Login Page Content">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <LoginPageContent eventKey="login-page-content" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="register-page-content" title="Register Page Content">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <RegisterPageContent eventKey="register-page-content" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="b2b-content" title="B2B Registration Content">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <B2BRegistration eventKey="b2b-content" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow" />
              )}
            </Card.Body>
          </Card>
        </Tab>
        {/* <Tab eventKey="seller-content" title="Seller Registration Content">
          <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-4 px-0 py-0">
              {dataSiteContent && (
                <SellerRegistration eventKey="seller-content" refetch={refetch} data={dataSiteContent?.getSiteContent} modules={modules} theme="snow"  />
              )}
            </Card.Body>
          </Card>
        </Tab> */}
      </Tabs>

      <h3 className="small-title fs-3 my-4 mx-2 ">Social Media Links</h3>
      {/* onSelect={(e) => setEventKey(e)} */}
      <Tabs justify defaultActiveKey="whatsapp">
        <Tab eventKey="whatsapp" title="WhatsApp">
          <SocialMedia title="whatsapp" />
        </Tab>
        <Tab eventKey="youtube" title="Youtube">
          <SocialMedia title="youtube" />
        </Tab>
        <Tab eventKey="facebook" title="Facebook">
          <SocialMedia title="facebook" />
        </Tab>
        <Tab eventKey="instagram" title="Instagram">
          <SocialMedia title="instagram" />
        </Tab>
        <Tab eventKey="twitter" title="Twitter">
          <SocialMedia title="twitter" />
        </Tab>
        <Tab eventKey="linkedin" title="LinkedIn">
          <SocialMedia title="linkedin" />
        </Tab>
        <Tab eventKey="pinterest" title="Pinterest">
          <SocialMedia title="pinterest" />
        </Tab>
        <Tab eventKey="googleMap" title="Google Maps">
          <SocialMedia title="googleMap" />
        </Tab>
      </Tabs>

      <h3 className="small-title fs-3 my-4 mx-2 ">Home Page Image Sliders</h3>
      <Tabs className="mb-0" justify onSelect={(e) => setEventKeyImages(e)}>
        <Tab eventKey="slider1" title="Slider 1">
          {dataSlider && <HomePageSlider refetchAgain={refetchAgain} eventKey="slider1" title="Slider 1" data={dataSlider.getHomePageSlider} />}
          {/* <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4 my-0 px-0 py-0">
              <div className="my-4">
                <Form.Label className="small-title fs-6 mt-4"> First Image Slider </Form.Label>
                <Form.Control type="file" multiple onChange={(e) => setImages(e.target.files)} />
                <Form.Label className="small-title fs-6 mt-4">Content for First Image Slider</Form.Label>
                {dataSlider && (
                  <div>
                    <p>{dataSlider.getHomePageSlider.content}</p>
                  </div>
                )}
                <Form.Control
                  className="my-2"
                  type="text"
                  value={sliderContent}
                  onChange={(e) => setSliderContent(e.target.value)}
                  placeholder="Content for Slider"
                />
                <Form.Label className="small-title fs-6 mt-4">Link for Second Image Slider</Form.Label>
                {dataSlider && (
                  <div>
                    <p>{dataSlider.getHomePageSlider.url}</p>
                  </div>
                )}
                <Form.Control
                  className="my-2"
                  type="text"
                  value={sliderUrl}
                  onChange={(e) => setSliderUrl(e.target.value)}
                  placeholder="URL for Slider"
                />
                <Button onClick={() => handleSlider()}>Save Changes</Button>
              </div>
            </Card.Body>
          </Card> */}
        </Tab>
        <Tab eventKey="slider2" title="Slider 2">
          {dataSlider && <HomePageSlider refetchAgain={refetchAgain} eventKey="slider2" title="Slider 2" data={dataSlider.getHomePageSlider} />}
          {/* <Card className=" hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4  my-0 px-0 py-0">
              <div className="my-4">
                <Form.Label className="small-title fs-6 mt-4">Second Image Slider</Form.Label>
                <Form.Control type="file" multiple onChange={(e) => setImages(e.target.files)} />
                <Form.Label className="small-title fs-6 mt-4">Content for Second Image Slider</Form.Label>
                {dataSlider && (
                  <div>
                    <p>{dataSlider.getHomePageSlider.content}</p>
                  </div>
                )}
                <Form.Control
                  className="my-2"
                  type="text"
                  value={sliderContent}
                  onChange={(e) => setSliderContent(e.target.value)}
                  placeholder="Content for Slider"
                />
                <Form.Label className="small-title fs-6 mt-4">Link for Second Image Slider</Form.Label>
                {dataSlider && (
                  <div>
                    <p>{dataSlider.getHomePageSlider.url}</p>
                  </div>
                )}
                <Form.Control
                  className="my-2"
                  type="text"
                  value={sliderUrl}
                  onChange={(e) => setSliderUrl(e.target.value)}
                  placeholder="URL for Slider"
                />
                <Button onClick={() => handleSlider()}>Save Changes</Button>
              </div>
            </Card.Body>
          </Card> */}
        </Tab>
        <Tab eventKey="slider3" title="Slider 3">
          {dataSlider && <HomePageSlider refetchAgain={refetchAgain} eventKey="slider3" title="Slider 3" data={dataSlider.getHomePageSlider} />}
          {/* <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4  my-0 px-0 py-0">
              <div className="my-4">
                <Form.Label className="small-title fs-6 mt-4">Third Image Slider</Form.Label>
                <Form.Control type="file" multiple onChange={(e) => setImages(e.target.files)} />
                <Form.Label className="small-title fs-6 mt-4">Content for Third Image Slider</Form.Label>
                {dataSlider && (
                  <div>
                    <p>{dataSlider.getHomePageSlider.content}</p>
                  </div>
                )}
                <Form.Control
                  className="my-2"
                  type="text"
                  value={sliderContent}
                  onChange={(e) => setSliderContent(e.target.value)}
                  placeholder="Content for Slider"
                />
                <Form.Label className="small-title fs-6 mt-4">Link for Second Image Slider</Form.Label>
                {dataSlider && (
                  <div>
                    <p>{dataSlider.getHomePageSlider.url}</p>
                  </div>
                )}
                <Form.Control
                  className="my-2"
                  type="text"
                  value={sliderUrl}
                  onChange={(e) => setSliderUrl(e.target.value)}
                  placeholder="URL for Slider"
                />
                <Button onClick={() => handleSlider()}>Save Changes</Button>
              </div>
            </Card.Body>
          </Card> */}
        </Tab>
        <Tab eventKey="slider4" title="Slider 4">
          {dataSlider && <HomePageSlider refetchAgain={refetchAgain} eventKey="slider4" title="Slider 4" data={dataSlider.getHomePageSlider} />}
          {/* <Card className="hover-border-primary mx-0 my-0 px-0 py-0">
            <Card.Body className="mx-4  my-0 px-0 py-0">
              <div className="my-4">
                <Form.Label className="small-title fs-6 mt-4">Fourth Image Slider</Form.Label>
                <Form.Control type="file" multiple onChange={(e) => setImages(e.target.files)} />
                <Form.Label className="small-title fs-6 mt-4">Content for Fourth Image Slider</Form.Label>
                {dataSlider && (
                  <div>
                    <p>{dataSlider.getHomePageSlider.content}</p>
                  </div>
                )}
                <Form.Control
                  className="my-2"
                  type="text"
                  value={sliderContent}
                  onChange={(e) => setSliderContent(e.target.value)}
                  placeholder="Content for Slider"
                />
                <Form.Label className="small-title fs-6 mt-4">Link for Second Image Slider</Form.Label>
                {dataSlider && (
                  <div>
                    <p>{dataSlider.getHomePageSlider.url}</p>
                  </div>
                )}
                <Form.Control
                  className="my-2"
                  type="text"
                  value={sliderUrl}
                  onChange={(e) => setSliderUrl(e.target.value)}
                  placeholder="URL for Slider"
                />
                <Button onClick={() => handleSlider()}>Save Changes</Button>
              </div>
            </Card.Body>
          </Card> */}
        </Tab>
      </Tabs>

      {/* <div className='my-4'>
    <Form.Label className='small-title fs-6 mt-4'> Image sliders</Form.Label>
      <Form.Control type="file" multiple onChange={(e) => setImages(e.target.files)}  />
      <Form.Label className='small-title fs-6 mt-4'>Content for Image sliders</Form.Label>
      <Form.Control className="my-2" type="text" value={sliderContent} onChange={(e) => setSliderContent(e.target.value)} placeholder='Content for Slider' />
      <Button onClick={() => handleSlider()} >Save</Button>
    </div > */}
    </>
  );
}

export default AddSiteContent;
