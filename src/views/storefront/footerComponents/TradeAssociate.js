import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, useQuery, useMutation, gql } from '@apollo/client';
import { NavLink } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Row, Col, Form, Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { toast } from 'react-toastify';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useGlobleContext } from 'context/styleColor/ColorContext';
// eslint-disable-next-line import/no-extraneous-dependencies
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import './style.css';

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
const GET_SITE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;
const SELLER_REGISTRATION_MAIL = gql`
  mutation SellerRegMail(
    $name: String
    $description: String
    $email: String
    $gst: String
    $composition: Boolean
    $pancardNo: String
    $mobile: String
    $fulladdress: String
    $city: String
    $pincode: Int
    $state: String
    $plan: String
    $type: String
  ) {
    sellerRegMail(
      name: $name
      description: $description
      email: $email
      gst: $gst
      composition: $composition
      pancardNo: $pancardNo
      mobile: $mobile
      fulladdress: $fulladdress
      city: $city
      pincode: $pincode
      state: $state
      plan: $plan
      type: $type
    ) {
      message
    }
  }
`;
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

function TradeAssociate({ history }) {
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);
  const renderTooltip = (props, message) => (
    <Tooltip id="button-tooltip" {...props} className="bg-dark">
      {message}
    </Tooltip>
  );
  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);
  useEffect(() => {
    getContent({
      variables: {
        key: 'tradeassociatedes',
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
        key: 'tradepdf',
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
  const [createSellerMail, { loading }] = useMutation(SELLER_REGISTRATION_MAIL, {
    onCompleted: () => {
      toast.success('Success! The form has been submitted successfully and a representative will get in touch with you.');
    },
    onError: (error) => {
      toast.error('Some error occurred'); 
    },
  });
  const onSubmit = (values, { resetForm }) => { 
    if (validateCaptcha(captchacode, false) === true) {
      setcaptchaError('');
      createSellerMail({
        variables: {
          name: values.name,
          email: values.email,
          mobile: values.phone,
          description: values.desc,
          gst: values.gst,
          composition: values.composition,
          pancardNo: values.pancardNo,
          fulladdress: values.fulladdress,
          city: values.city,
          pincode: parseInt(values.pincode, 10),
          state: values.state,
          // plan: values.plan,
          type: 'trade',
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
    phone: Yup.string().matches(phoneRegExp, 'Mobile number is not valid').required('Mobile number is required'),
    fulladdress: Yup.string().required('Firm fulladdress is required'),
    city: Yup.string().required('City is required'),
    pincode: Yup.string().required('Pincode is required'),
    state: Yup.string().required('State is required'),
    // plan: Yup.string().required('Plan is required'),
  });
  const initialValues = {
    name: '',
    desc: '',
    email: '',
    gst: '',
    composition: false,
    pancardNo: '',
    phone: '',
    fulladdress: '',
    city: '',
    pincode: '',
    state: '',
    // plan: '',
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
  const [selectedOption, setSelectedOption] = useState('gst');

  return (
    <div className="bg-white">
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
      <h1 className="mb-1 p-2 mark text-center rounded">
        <span className="mb-1 fw-bold text-dark">Seller Associate</span>
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

          <div className={isLoggedIn && roles.includes('seller') ? '' : 'd-none'}>
            <div className="container">
              <div className="card shadow-lg border">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-2">
                    <h2 className="card-title fw-bold text-dark">Welcome, {companyName}</h2>
                  </div>
                  <p className="mb-4">
                    You are our valued "Seller Associate". You are already connected with us. Access your dashboard
                    <NavLink to="/seller/dashboard" className="text-primary ms-2" aria-label="Access dashboard">
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
          <div className={isLoggedIn && !roles.includes('seller') ? '' : 'd-none'}>
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
                      <div className="mb-3">
                        <label className="form-label text-dark fw-bold">
                          Select ID Type <span className="text-danger"> *</span>
                        </label>
                        <div>
                          {['gst', 'pancardNo'].map((type) => (
                            <div key={type} className="form-check form-check-inline">
                              <input
                                type="radio"
                                className="form-check-input"
                                id={type}
                                name="idType"
                                value={type}
                                checked={selectedOption === type}
                                onChange={() => setSelectedOption(type)}
                              />
                              <label className="form-check-label" htmlFor={type}>
                                {type === 'gst' ? 'GST Number' : 'PAN (Unregistered Seller)'}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedOption && (
                        <div className="mb-3">
                          <Form.Control
                            type="text"
                            name={selectedOption}
                            maxLength={selectedOption === 'pancardNo' ? '10' : '15'}
                            onChange={(e) =>
                              handleChange({
                                target: {
                                  name: selectedOption,
                                  value: e.target.value.toUpperCase(),
                                },
                              })
                            }
                            placeholder={`Enter ${selectedOption === 'gst' ? 'GST' : 'PAN'} number`}
                            value={values[selectedOption] || ''}
                            className="form-control"
                            onKeyPress={(e) => !/^[0-9a-zA-Z]*$/.test(e.key) && e.preventDefault()}
                          />
                        </div>
                      )}
                    </div>
                    <div className="col-md-6 col-12">
                      {selectedOption === 'gst' && (
                        <>
                          <div className="mb-3 p-3">
                            <label className="form-label fw-bold text-dark">Is it under Composition Scheme?</label>
                            <div className="d-flex gap-4">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="composition"
                                  id="compositionYes"
                                  checked={values.composition === true}
                                  onChange={() => formik.setFieldValue('composition', true)}
                                />
                                <label className="form-check-label" htmlFor="compositionYes">
                                  Yes
                                </label>
                              </div>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="composition"
                                  id="compositionNo"
                                  checked={values.composition === false}
                                  onChange={() => formik.setFieldValue('composition', false)}
                                />
                                <label className="form-check-label" htmlFor="compositionNo">
                                  No
                                </label>
                              </div>
                              <div className="text-muted small">
                                Composition scheme is available to small taxpayers whose turnover in the previous financial year was less than ₹20 lakhs.
                              </div>
                            </div>
                          </div>
                        </>
                      )}
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
                        placeholder="Mobile number"
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
                        placeholder="Enter firm fulladdress"
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
                        <option hidden>Select state</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
                        <option value="Daman and Diu">Daman and Diu</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Puducherry">Puducherry</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                      </Form.Select>
                      {errors.state && touched.state && <div className="d-block text-danger p-1 small">{errors.state}</div>}
                    </div>
                    <div className="col-md-12 mb-2">
                      <div className="fw-bold p-1">
                        Firm Description <span className="text-danger"> *</span>
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
                    {/* <div className="col-md-6 mb-2">
                      <div className="fw-bold p-1">
                        Plan <span className="text-danger"> *</span>
                      </div>
                      <Form.Select name="plan" onChange={handleChange} value={values.plan} aria-label="Default select example">
                        <option hidden>Select Plan</option>
                        <option value="Alpha">Alpha</option>
                        <option value="Alpha Plus">Alpha Plus</option>
                        <option value="Beta">Beta</option>
                        <option value="Beta Plus">Beta Plus</option>
                      </Form.Select>
                      {errors.plan && touched.plan && <div className="d-block text-danger p-1 small">{errors.plan}</div>}
                    </div> */}
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
        </div>
      </div>
    </div>
  );
}
export default TradeAssociate;
