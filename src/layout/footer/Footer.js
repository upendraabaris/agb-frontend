import React, { useState, useRef, useEffect } from 'react';
import { gql, useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { Link, NavLink, useHistory } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useDispatch, useSelector } from 'react-redux';
import './style.css';
import { Col, Form, Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;

const GET_PARENT_CATEGORY = gql`
  query GetAllCategories {
    getAllCategories {
      id
      name
      order
      parent {
        id
      }
      children {
        id
        name
        children {
          id
          name
          children {
            id
            name
          }
          children {
            id
            name
          }
        }
      }
    }
  }
`;

const SUBCRIPTIONEMAIL = gql`
  mutation Subscriptionletteremail($email: String) {
    subscriptionletteremail(email: $email) {
      message
    }
  }
`;

const Footer = () => {
  // GET SITE CONTENT
  const { dataStoreFeatures1 } = useGlobleContext();
  const history = useHistory();
  const [getWhatsapp, { data: dataWhatsapp }] = useLazyQuery(GET_SITE_CONTENT);
  const [getInstagram, { data: dataInstagram }] = useLazyQuery(GET_SITE_CONTENT);
  const [getYoutube, { data: dataYoutube }] = useLazyQuery(GET_SITE_CONTENT);
  const [getLinkedIn, { data: dataLinkedIn }] = useLazyQuery(GET_SITE_CONTENT);
  const [getTwitter, { data: dataTwitter }] = useLazyQuery(GET_SITE_CONTENT);
  const [getFacebook, { data: dataFacebook }] = useLazyQuery(GET_SITE_CONTENT);
  const [getPinterest, { data: dataPinterest }] = useLazyQuery(GET_SITE_CONTENT);
  const [getFooterAddress, { data: dataFooterAddress }] = useLazyQuery(GET_SITE_CONTENT);
  const [getFooterContent, { data: dataFooterContent }] = useLazyQuery(GET_SITE_CONTENT);
  const [getGoogleMap, { data: dataGoogleMap }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getWhatsapp({
      variables: {
        key: 'whatsapp',
      },
    });
    getInstagram({
      variables: {
        key: 'instagram',
      },
    });
    getYoutube({
      variables: {
        key: 'youtube',
      },
    });
    getLinkedIn({
      variables: {
        key: 'linkedin',
      },
    });
    getTwitter({
      variables: {
        key: 'twitter',
      },
    });
    getPinterest({
      variables: {
        key: 'pinterest',
      },
    });
    getFacebook({
      variables: {
        key: 'facebook',
      },
    });
    getFooterAddress({
      variables: {
        key: 'footer-address',
      },
    });
    getFooterContent({
      variables: {
        key: 'footer-content',
      },
    });
    getGoogleMap({
      variables: {
        key: 'googleMap',
      },
    });
  }, [
    dataWhatsapp,
    dataInstagram,
    dataYoutube,
    dataLinkedIn,
    dataTwitter,
    dataFacebook,
    dataPinterest,
    dataFooterAddress,
    dataFooterContent,
    dataGoogleMap,
    getGoogleMap,
  ]);

  // GET CATEGORY

  const { data } = useQuery(GET_PARENT_CATEGORY);

  useEffect(() => {
    document.documentElement.setAttribute('data-footer', 'true');
    return () => {
      document.documentElement.removeAttribute('data-footer');
    };
  }, []);

  const year = new Date().getFullYear();
  // handle email subcription

  const [emailData, setEmailData] = useState('');
  const [loading, setLoading] = useState(false);
  const [captchaError, setcaptchaError] = useState('');
  const [captchaCode1, setCaptchaCode1] = useState('');
  const [Subscriptionletteremail] = useMutation(SUBCRIPTIONEMAIL, {
    onCompleted: (res) => {
      toast.success(res.subscriptionletteremail?.message);
      setEmailData('');
      setCaptchaCode1('');
    },
    onError: (err) => {
      console.log('err', err);
    },
  });

  const emailSubscribe = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true

    try {
      await Subscriptionletteremail({
        variables: {
          email: emailData,
        },
      });
      // Handle successful subscription (optional)
    } catch (error) {
      // Handle error (optional)
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const { isLogin, currentUser } = useSelector((state) => state.auth);
  const b2b = currentUser?.role?.some((role) => role === 'b2b');
  const seller = currentUser?.role?.some((role) => role === 'seller');
  const [modalshow, setModalshow] = useState(false);
  const [orderId, setorderId] = useState('');

  const trackOrder = (e) => {
    e.preventDefault();
    if (orderId) {
      history.push(`/order/${orderId}`);
      setModalshow(false);
      setorderId('');
    } else {
      console.log('mising');
    }
  };

  const [showAll, setShowAll] = useState(false);

  // Filter, sort, and prepare the categories
  const categories = data?.getAllCategories.filter((cat) => !cat.parent).sort((a, b) => a.order - b.order) || [];

  // Determine the categories to display
  const visibleCategories = showAll ? categories : categories.slice(0, 4);

  return (
    <footer>
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`
          .btn_color {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
            transition: background 0.3s ease;
            padding: 10px 30px;
            border: none;
            cursor: pointer;            
          }
          .btn_color:hover {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            filter: brightness(80%);       
          }
        `}
      </style>
      <div className="container-fluid">
        <div className="row mt-4 bg-dark">
          <div className="d-inline p-4">
            {dataFooterContent && (
              // eslint-disable-next-line react/no-danger
              <div className="d-inline" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataFooterContent.getSiteContent.content) }} />
            )}
          </div>
        </div>
        <div className="row p-2 pb-4 border-top bg-dark">
          <div className="text-white fs-5 pb-3">Subscribe to our Newsletter </div>
          <div>
            <Form onSubmit={emailSubscribe} className="row row-cols-lg-auto g-2 align-items-center justify-content-start">
              <div>
                <input type="email" className="form-control" placeholder="Email" value={emailData} onChange={(e) => setEmailData(e.target.value)} required />
              </div>
              <div>
                <button type="submit" className="rounded btn_color" disabled={loading}>
                  {loading ? 'Loading...' : 'Subscribe'}
                </button>
              </div>
            </Form>
            <div className="col-12 pt-2">
              By subscribing you agree to our{' '}
              <Link to="/privacy_policy" className="text-decoration-underline" target="_blank">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
        <div className="row border-top">
          <div className="col-12 ps-4 col-sm-3 bg-dark">
            <h3 className="fs-6 text-white mt-3 fw-bold">Categories </h3>
            <ul className="nav flex-column text-primary-hover">
              {visibleCategories.map((cat) => (
                <li key={cat.id} className="pt-1 pb-1">
                  <Link className="px-0 text-white" to={`/category/${cat.name.replace(/\s/g, '_').toLowerCase()}`}>
                    {cat.name}
                  </Link>
                </li>
              ))}
              {categories.length > 4 && (
                <li>
                  <button type="button" className="btn btn-link px-0 text-white" onClick={() => setShowAll(!showAll)}>
                    {showAll ? 'View Less' : 'View More'}
                  </button>
                </li>
              )}
            </ul>
          </div>
          <div className="col-12 ps-4 col-sm-3 bg-dark">
            <h3 className="fs-6 text-white mt-3 fw-bold">Quick Links</h3>
            <ul className="nav flex-column text-primary-hover">
              <li className="pt-1 pb-1">
                <Link className="px-0 text-white" to="#/!" onClick={() => setModalshow(true)}>
                  Track Your Order
                </Link>
              </li>
              <li className="pt-1 pb-1">
                <Link className="px-0 text-white" to="/user_policies">
                  User Policies
                </Link>
              </li>
              <li className="pt-1 pb-1">
                <Link className="px-0 text-white" to="/faq">
                  FAQ
                </Link>
              </li>
              <li className="pt-1 pb-1">
                <Link className="px-0 text-white" to="/contact_us">
                  Contact Us
                </Link>
              </li>
              {/* {!b2b && (
                <li>
                  <Link className="nav-link px-0  text-white" target="_blank" to="/b2b_registration">
                    B2B Registration
                  </Link>
                </li>
              )} */}
            </ul>
          </div>
          <div className="col-12 col-sm-3 bg-dark">
            <div className="ps-3">
              <h3 className="fs-6 text-white mt-3 fw-bold">Get in Touch</h3>
              <ul className="nav flex-column text-primary-hover">
                <li className="pt-1 pb-1">
                  <Link className="px-0 text-white" to="/about_us">
                    About Us
                  </Link>
                </li>
                {dataStoreFeatures1?.getStoreFeature?.associate && (
                  <li className="pt-1 pb-1">
                    <Link className="px-0 text-white" target="_blank" to="/associate_with_us">
                      Associate Program
                    </Link>
                  </li>
                )}
                <li className="pt-1 pb-1">
                  <Link className="px-0 text-white" target="_blank" to="/blogs">
                    Blogs
                  </Link>
                </li>
                <li className="pt-1 pb-1">
                  <Link className="px-0 text-white" to="/meet_our_team">
                    Meet Our Team
                  </Link>
                </li>
              </ul>
              {/* {dataFooterAddress && (
                <div
                  style={{ fontSize: '13px' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataFooterAddress.getSiteContent.content.replace(/<br>/g, '')) }}
                />
              )} */}
            </div>
          </div>
          <div className="col-12 ps-4 col-sm-3 bg-dark">
            <h3 className="fs-6 text-white mt-3 fw-bold">Social Media</h3>
            <div className="d-flex">
              {dataWhatsapp?.getSiteContent?.content && (
                <a href={dataWhatsapp.getSiteContent?.content || '#/!'} target="_blank" rel="noreferrer">
                  <h1 className="pt-1">
                    <img src="/img/social/whatsapp.png" width="40px" className="border bg-white rounded p-1 me-1" alt="WhatsApp" />
                  </h1>
                </a>
              )}
              {dataFacebook?.getSiteContent?.content && (
                <a href={dataFacebook.getSiteContent?.content || '#/!'} target="_blank" rel="noreferrer">
                  <h1 className="pt-1">
                    <img src="/img/social/facebook.png" width="40px" className="border bg-white rounded p-1 me-1" alt="Facebook" />
                  </h1>
                </a>
              )}
              {dataInstagram?.getSiteContent?.content && (
                <a href={dataInstagram.getSiteContent?.content || '#/!'} target="_blank" rel="noreferrer">
                  <h1 className="pt-1">
                    <img src="/img/social/instagram.png" width="40px" className="border bg-white rounded p-1 me-1" alt="Instagram" />
                  </h1>
                </a>
              )}
              {dataYoutube?.getSiteContent?.content && (
                <a href={dataYoutube.getSiteContent?.content || '#/!'} target="_blank" rel="noreferrer">
                  <h1 className="pt-1">
                    <img src="/img/social/youtube.png" width="40px" className="border bg-white rounded p-1 me-1" alt="YouTube" />
                  </h1>
                </a>
              )}
              {dataTwitter?.getSiteContent?.content && (
                <a href={dataTwitter.getSiteContent?.content || '#/!'} target="_blank" rel="noreferrer">
                  <h1 className="pt-1">
                    <img src="/img/social/twitter.png" width="40px" className="border bg-white rounded p-1 me-1" alt="Twitter" />
                  </h1>
                </a>
              )}
              {dataLinkedIn?.getSiteContent?.content && (
                <a href={dataLinkedIn.getSiteContent?.content || '#/!'} target="_blank" rel="noreferrer">
                  <h1 className="pt-1">
                    <img src="/img/social/linkedin.png" width="40px" className="border bg-white rounded p-1 me-1" alt="LinkedIn" />
                  </h1>
                </a>
              )}
              {/* {dataPinterest && (
                  <a href={dataPinterest.getSiteContent?.content || '#/!'} target="_blank" rel="noreferrer">
                    <h1 className="pt-1">
                      <img src="/img/social/pin.png" width="40px" className="border bg-white rounded p-1 me-1" alt="Pinterest" />
                    </h1>
                  </a>
                )} */}
            </div>
            <h3 className="fs-6 text-white mt-3 fw-bold">Accepted Payment Methods</h3>
            <div>UPI, Credit/Debit Cards, Wallets, Net Banking, EMI Options etc.</div>
            {/* {dataGoogleMap?.getSiteContent && (
              <iframe
                className="sw-35 sh-35 sh-sm-17 sw-sm-17 sh-lg-35 sw-lg-30 sh-md-20 sw-md-20 "
                title="Google Map Location"
                src={dataGoogleMap?.getSiteContent?.content}
                style={{ border: '3px solid #1facec', borderRadius: '5px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )} */}
          </div>
        </div>
        <div className="row text-center mb-0 bg_color pt-2 pb-2">
          <div className="col text-white">© 2025 {dataStoreFeatures1?.getStoreFeature.storeName} All Rights Reserved.</div>
        </div>
        <div className="row d-flex align-items-center mb-4 bg_color pt-2 pb-2 ">
          <div className="mx-auto text-white">
            Powered by{' '}
            <a href="https://www.samarecom.com/mysol/" className="text-white fw-bold" target="_blank" rel="noopener noreferrer">
              MySol Version 1.05_181225
            </a>
          </div>
        </div>
        {dataWhatsapp && (
          <div className="m-2 fixed-chat">
            <a href={dataWhatsapp.getSiteContent?.content || '#/!'} target="_blank" rel="noreferrer">
              <div className="p-1 px-2 float-end border rounded btn-dark">
                {/* <img src="/img/social/whatsapp.png"  width='30px' className='rounded p-1 me-1' alt="WhatsApp" />                     */}
                <img src="/img/background/chat-whatsapp.gif" width="25px" className="rounded p-1" alt="WhatsApp" />
                Chat Now
              </div>
            </a>
          </div>
        )}
      </div>

      <Modal show={modalshow} onHide={() => setModalshow(false)}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Track Your Order</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2 pb-2">
          <Form onSubmit={trackOrder}>
            <Form.Group className="mb-3" controlId="orderId">
              <Form.Label className="text-dark fw-bold">
                Enter Order Id <span className="text-danger"> * </span>
              </Form.Label>
              <Form.Control type="text" name="orderId" autoFocus value={orderId} onChange={(e) => setorderId(e.target.value)} />
            </Form.Group>
            <Button type="submit" className="btn_color mb-2">
              Track Order
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </footer>
  );
};

export default React.memo(Footer);
