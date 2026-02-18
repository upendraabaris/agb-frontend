import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, useQuery, useMutation, gql } from '@apollo/client';
import { NavLink } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Form, Card, Tooltip, Modal, Button, OverlayTrigger } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import './style.css';
import { stateList } from 'components/stateList/stateList';
// eslint-disable-next-line import/no-extraneous-dependencies

const GET_USER_DETAIL = gql`
  query GetProfile {
    getProfile {
      id
      firstName
      lastName
      email
      mobileNo
      password
      role
      profilepic
      addresses {
        id
        firstName
        lastName
        mobileNo
        addressLine1
        addressLine2
        city
        state
        postalCode
        country
        altrMobileNo
        businessName
        gstin
      }
      seller {
        id
        companyName
        gstin
        address
        companyDescription
        mobileNo
        email
      }
    }
  }
`;
const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;
const GET_ADS = gql`
  query GetAds($key: String!) {
    getAds(key: $key) {
      key
      images
      url
      active
    }
  }
`;
const BUSINESS_REGISTRATION_MAIL = gql`
  mutation BA_n_dA_RegMail(
    $name: String
    $description: String
    $gst: String
    $email: String
    $mobile: String
    $fulladdress: String
    $city: String
    $pincode: Int
    $state: String
    $type: String
  ) {
    bA_n_dA_RegMail(
      name: $name
      description: $description
      gst: $gst
      email: $email
      mobile: $mobile
      fulladdress: $fulladdress
      city: $city
      pincode: $pincode
      state: $state
      type: $type
    ) {
      message
    }
  }
`;

function DealerAssociate({ history }) {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const allStatesList = stateList();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);
  const renderTooltip = (props, message) => (
    <Tooltip id="button-tooltip" {...props} className="bg-dark">
      {message}
    </Tooltip>
  );
  const [showTooltip, setShowTooltip] = useState(false);
  const handleTooltipToggle = () => {
    if (window.innerWidth < 768) {
      setShowTooltip(!showTooltip);
      setTimeout(() => setShowTooltip(false), 3000);
    }
  };
  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);
  useEffect(() => {
    getContent({
      variables: {
        key: 'businessassociatesubdealerdes',
      },
    });
  }, [dataSiteContent, getContent]);
  const [pdfFile, setPdfFile] = useState(null);
  const [fetchAds] = useLazyQuery(GET_ADS, {
    onCompleted: (data) => {
      if (data && data.getAds && data.getAds.images) {
        const file = Array.isArray(data.getAds.images) ? data.getAds.images[0] : data.getAds.images;
        if (file?.endsWith('.pdf')) {
          setPdfFile(file);
        }
      }
    },
  });
  useEffect(() => {
    fetchAds({
      variables: {
        key: 'dealerpdf',
      },
    });
  }, [fetchAds]);
  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };
  const [captchacode, setCaptchaCode] = useState('');
  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);
  const [captchaError, setcaptchaError] = useState('');
  const [createBusinessMail, { loading }] = useMutation(BUSINESS_REGISTRATION_MAIL, {
    onCompleted: () => {
      setShowSuccessModal(true);
    },
    onError: (error) => {
      toast.error('Some error occurred'); 
    },
  });
  const onSubmit = (values, { resetForm }) => {  
    if (validateCaptcha(captchacode, false) === true) {
      setcaptchaError('');
      createBusinessMail({
        variables: {
          name: values.name,
          email: values.email,
          mobile: values.phone,
          description: values.desc,
          gst: values.gst,
          fulladdress: values.fulladdress,
          city: values.city,
          pincode: parseInt(values.pincode, 10),
          state: values.state,
          type: 'dealer',
        },
      });
    } else { 
      setcaptchaError('Fill Captcha before submit');
    }
  };
  const phoneRegExp = /^(\+91)?(-)?\s*?(91)?\s*?(\d{3})-?\s*?(\d{3})-?\s*?(\d{4})$/;
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Firm name is required'),
    desc: Yup.string().required('Firm description is required'),
    email: Yup.string().email('Must be a valid email').required('Firm email is required'),
    gst: Yup.string().required('GST number is required'),
    phone: Yup.string().matches(phoneRegExp, 'Mobile number is not valid').required('Mobile number is required'),
    fulladdress: Yup.string().required('Firm address is required'),
    city: Yup.string().required('City is required'),
    pincode: Yup.string().required('Pincode is required'),
    state: Yup.string().required('State is required'),
  });
  const initialValues = {
    name: '',
    desc: '',
    email: '',
    gst: '',
    phone: '',
    fulladdress: '',
    city: '',
    pincode: '',
    state: '',
  };
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
  });
  const { handleSubmit, handleChange, values, touched, errors } = formik;
  const { data, refetch } = useQuery(GET_USER_DETAIL);
  const roles = data?.getProfile?.role || [];
  const companyName = data?.getProfile?.seller?.companyName;
  const isLoggedIn = Boolean(data?.getProfile);

  return (
    <div className="bg-white">
      <h1 className="mb-1 p-2 mark text-center rounded">
        <span className="mb-1 fw-bold text-dark">Dealer Associate</span>
      </h1>
      <div className="container">
        <div className="tab-container-responsive border rounded p-2 pb-4">
          <div className={isLoggedIn ? 'd-none' : 'w-100 bg-light border-bottom rounded-top fw-bold p-4 mb-4'}>
            Please login first.
            <div className="w-100">
              You need to first create a personal account on this platform, after which you can apply. Please
              <NavLink to="/login" className="text-primary">
                {' '}
                Login{' '}
              </NavLink>
              or
              <NavLink to="/register" className="text-primary">
                {' '}
                Register{' '}
              </NavLink>
              new account.
            </div>
          </div>

          <div className={isLoggedIn && roles.includes('super') ? '' : 'd-none'}>
            <div className="container">
              <div className="card shadow-lg border">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-2">
                    <h2 className="card-title fw-bold text-dark">Welcome, {companyName}</h2>
                  </div>
                  <p className="mb-4">
                    You are our valued "Dealer Associate". You are already connected with us. Access your dashboard
                    <NavLink to="/superSeller/dashboard" className="text-primary ms-2" aria-label="Access dashboard">
                      Go to Dashboard
                    </NavLink>
                  </p>
                  <div className="alert alert-info" role="alert">
                    Your current status: <strong>Active</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={isLoggedIn && !roles.includes('super') ? '' : 'd-none'}>
            <Card className="mb-4 py-2 border mark">
              <h3 className="p-3 pb-2 fs-5 fw-bold">Registration Form</h3>
              <div className="p-3 pt-0">
                <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <div className="fw-bold p-1">
                        Firm Name <span className="text-danger"> *</span>
                      </div>
                      <Form.Control
                        type="text"
                        className="bg-white border rounded ps-3"
                        name="name"
                        placeholder="Enter firm name"
                        value={values.name}
                        onChange={handleChange}
                      />
                      {errors.name && touched.name && <div className="d-block text-danger p-1 small">{errors.name}</div>}
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="fw-bold p-1">
                        Firm Email <span className="text-danger"> *</span>
                      </div>
                      <Form.Control
                        type="text"
                        className="bg-white border rounded ps-3"
                        name="email"
                        placeholder="Enter firm email"
                        value={values.email}
                        onChange={handleChange}
                      />
                      {errors.email && touched.email && <div className="d-block text-danger p-1 small">{errors.email}</div>}
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="fw-bold p-1">
                        GST Number <span className="text-danger"> *</span>
                      </div>
                      <Form.Control
                        type="text"
                        className="bg-white border rounded"
                        name="gst"
                        onChange={handleChange}
                        placeholder="Enter GST Number"
                        value={values.gst}
                      />
                      {errors.gst && touched.gst && <div className="d-block text-danger p-1 small">{errors.gst}</div>}
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="fw-bold p-1">
                        Mobile Number <span className="text-danger"> *</span>
                      </div>
                      <Form.Control
                        type="tel"
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        maxLength="10"
                        name="phone"
                        onChange={handleChange}
                        value={values.phone}
                        placeholder="Enter mobile number"
                        className="bg-white border rounded ps-3"
                      />
                      {errors.phone && touched.phone && <div className="d-block text-danger p-1 small">{errors.phone}</div>}
                    </div>
                    <div className="col-md-6 mb-2 ">
                      <div className="fw-bold p-1">
                        Firm Address <span className="text-danger"> *</span>
                      </div>
                      <Form.Control
                        type="text"
                        autoComplete="street-address"
                        name="fulladdress"
                        onChange={handleChange}
                        placeholder="Enter firm address"
                        value={values.fulladdress}
                        className="bg-white border rounded ps-3"
                      />
                      {errors.fulladdress && touched.fulladdress && <div className="d-block text-danger p-1 small">{errors.fulladdress}</div>}
                    </div>
                    <div className="col-md-6 mb-2 ">
                      <div className="fw-bold p-1">
                        City <span className="text-danger"> *</span>
                      </div>
                      <Form.Control
                        type="text"
                        className="bg-white border rounded ps-3"
                        name="city"
                        onChange={handleChange}
                        placeholder="Enter city"
                        value={values.city}
                      />
                      {errors.city && touched.city && <div className="d-block text-danger p-1 small">{errors.city}</div>}
                    </div>
                    <div className="col-md-6 mb-2 ">
                      <div className="fw-bold p-1">
                        Pincode <span className="text-danger"> *</span>
                      </div>
                      <Form.Control
                        type="text"
                        onKeyDown={(e) => {
                          if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                        maxLength="6"
                        name="pincode"
                        onChange={handleChange}
                        placeholder="Enter pincode"
                        value={values.pincode}
                        className="bg-white border rounded ps-3"
                      />
                      {errors.pincode && touched.pincode && <div className="d-block text-danger p-1 small">{errors.pincode}</div>}
                    </div>
                    <div className="col-md-6 mb-2">
                      <div className="fw-bold p-1">
                        State <span className="text-danger"> *</span>
                      </div>
                      <Form.Select name="state" onChange={handleChange} value={values.state} aria-label="Default select example">
                        <option value="" hidden>
                          Select State
                        </option>
                        {allStatesList.map((state, index) => (
                          <option value={state.value} key={index}>
                            {state.displayValue}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.state && touched.state && <div className="d-block text-danger p-1 small">{errors.state}</div>}
                    </div>
                    <div className="col-md-12 mb-2">
                      <div className="fw-bold p-1">
                        Firm Description <span className="text-danger"> *</span>
                        <OverlayTrigger placement="top" overlay={<Tooltip id="firm-desc-tooltip">Enter a brief description about your firm.</Tooltip>}>
                          <span className="ms-1 text-primary" style={{ cursor: 'pointer' }}>
                            ℹ️
                          </span>
                        </OverlayTrigger>
                      </div>
                      <Form.Control
                        type="text"
                        as="textarea"
                        className="bg-white border rounded"
                        name="desc"
                        onChange={handleChange}
                        placeholder="Enter firm description"
                        value={values.desc}
                      />
                      {errors.desc && touched.desc && <div className="d-block text-danger p-1 small">{errors.desc}</div>}
                    </div>

                    <div className="w-100 mt-4">
                      <div className="d-flex justify-content-end">
                        <div className="col-md-3 mb-2">
                          <div className="border rounded pt-2 mb-2">
                            <LoadCanvasTemplateNoReload />
                            <Form.Control
                              type="text"
                              className="form-control ps-4 bg-white border rounded mt-2"
                              placeholder="Enter Captcha Code"
                              value={captchacode}
                              onChange={(e) => setCaptchaCode(e.target.value)}
                            />
                            {captchaError && <div className="d-block text-danger mt-2">{captchaError}</div>}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <div className="text-center col-md-3">
                          {loading ? (
                            <button className="btn btn_color w-100 btn-lg" disabled type="button">
                              Loading
                            </button>
                          ) : (
                            <>
                              <div className="form-check mb-3">
                                <input className="form-check-input" type="checkbox" id="acceptTerms" required />
                                <label className="form-check-label" htmlFor="acceptTerms">
                                  I accept{' '}
                                  <a href="/user_policies" target="_blank">
                                    T&C
                                  </a>{' '}
                                  and read
                                </label>
                                {pdfFile ? (
                                  <a href={pdfFile} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                    <CsLineIcons name="download" /> PDF{' '}
                                  </a>
                                ) : (
                                  <p>No PDF file available.</p>
                                )}
                                file.
                              </div>
                              <button className="btn btn_color w-100 btn-lg" type="submit">
                                Create Account
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>

          <div>
            {dataSiteContent && (
              <div className="p-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent.getSiteContent.content.replace(/<br>/g, '')) }} />
            )}
          </div>
          <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} centered backdrop="static" className="success-modal">
            <Modal.Header closeButton className="border-0">
              <Modal.Title className="w-100 text-center text-success fw-bold">🎉 Success!</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <div className="fs-5 text-dark fw-bold w-100">Your "Dealer Associate" form has been submitted successfully.</div>
              <div className="text-dark pt-2">You will receive a call from our team regarding the next steps within 2 to 5 working days.</div>
            </Modal.Body>
            <Modal.Footer className="border-0 d-flex justify-content-center pt-2">
              <Button
                variant="success"
                className="px-4 py-2 fw-bold"
                onClick={() => {
                  setShowSuccessModal(false);
                  history.push('/');
                }}
              >
                OK
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </div>
  );
}
export default DealerAssociate;
