import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { Row, Col, Card, Form, Spinner } from 'react-bootstrap';
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import HtmlHead from 'components/html-head/HtmlHead';
import * as Yup from 'yup';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { useFormik } from 'formik';
import { NavLink, useParams } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const SINGLE_ENQUIRY_MAIL = gql`
mutation singleEnquryMail($fullname: String, $email: String, $mobile: String, $address: String, $state: String, $message: String, $productname: String) {
  singleEnquryMail(fullname: $fullname, email: $email, mobile: $mobile, address: $address, state: $state, message: $message, productname: $productname) {
    message
  }
}
`;

function SendEnquiry({ history }) {
  const { productname } = useParams();
  const { dataStoreFeatures1 } = useGlobleContext();
  const dispatch = useDispatch();
  const title = `Send Enquiry for ${productname}`;
  const description = `Send Enquiry for ${productname}`;

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
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

  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);
  const [getGoogleMap, { data: dataGoogleMap }] = useLazyQuery(GET_SITE_CONTENT);


  useEffect(() => {
    getContent({
      variables: {
        key: 'contact-us',
      },
    });
    getGoogleMap({
      variables: {
        key: 'googleMap',
      },
    });
  }, [dataSiteContent, getContent, dataGoogleMap, getGoogleMap]);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
  }, [dispatch]);

  const [captchacode, setCaptchaCode] = useState('');
  const [captchaError, setcaptchaError] = useState('');
  const [singleEnqueryMail, { loading }] = useMutation(SINGLE_ENQUIRY_MAIL);
  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);


  const phoneRegExp = /^(\+91)?(-)?\s*?(91)?\s*?(\d{3})-?\s*?(\d{3})-?\s*?(\d{4})$/;

  const validationSchema = Yup.object().shape({
    fullname: Yup.string().required('Full Name is required'),
    message: Yup.string().required('Message is required'),
    email: Yup.string().email('Must be a valid email').required('Email is required'),
    mobile: Yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone Number is required'),
    address: Yup.string().required('Full Address is required'),
    state: Yup.string().required('State is required'),
  });

  const initialValues = { fullname: '', message: '', email: '', mobile: '', address: '', state: '' };

  const onSubmit = async (values, { resetForm }) => {
    if (validateCaptcha(captchacode, false) === true) {
      setcaptchaError('');
      try {
        const response = await singleEnqueryMail({
          variables: { ...values, productname },
          onCompleted: () => {
            toast.success('Success! The form has been submitted successfully and a representative will get in touch with you.');
            setTimeout(() => {
              history.push('/');
            }, 2000);
          },
          onError: (error) => {
            console.error(error.message);
          },
        });
        // eslint-disable-next-line no-alert
        alert(response.data.singleEnqueryMail.message);
        resetForm();
      } catch (error) {
        console.error(error);
        // eslint-disable-next-line no-alert
      }
    } else {
      setcaptchaError('Captcha not validated!');
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;


  return (
    <>
      <HtmlHead title={title} description={description} />
      <style>
        {`.bg_color { background: ${dataStoreFeatures1?.getStoreFeature?.bgColor}; color: ${dataStoreFeatures1?.getStoreFeature?.fontColor}; }`}
        {`.font_color { color: ${dataStoreFeatures1?.getStoreFeature?.bgColor}; }`}
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
      <div className="page-title-container mb-0">
        <Row className="g-0">
          <Col className="col-auto mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/">
              <span className="align-middle text-dark ms-1">Home</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <Row>
        <Col xl="2">{' '}</Col>
        <Col xl="5" sm="12">
          {/* Product Info Start */}
          <Card className="mb-5">
            <div>
              <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
                <h1 className=" bg_color rounded p-3 fs-6">
                  <p className="m-0">Send Enquiry for {productname}</p>
                </h1>
                <div className="p-3">
                  <div className="mb-1 filled form-group">
                    <CsLineIcons icon="suitcase" />
                    <Form.Control
                      type="text"
                      className="bg-white border"
                      name="fullname"
                      placeholder="Full name"
                      value={values.fullname}
                      onChange={handleChange}
                    />
                    {errors.fullname && touched.fullname && <div className="d-block text-danger p-1">Full Name is required</div>}
                  </div>
                  <div className="mb-1 filled form-group">
                    <CsLineIcons icon="email" />
                    <Form.Control type="text" name="email" className="bg-white border" placeholder="Email" value={values.email} onChange={handleChange} />
                    {errors.email && touched.email && <div className="d-block text-danger p-1">Email is required</div>}
                  </div>
                  <div className="mb-1 filled form-group">
                    <CsLineIcons icon="phone" />
                    <Form.Control
                      type="text"
                      name="mobile"
                      className="bg-white border"
                      placeholder="Mobile number"
                      value={values.mobile}
                      onChange={(e) => {
                        const { value } = e.target;
                        const numericValue = value.replace(/\D/g, '');
                        formik.setFieldValue('mobile', numericValue.slice(0, 10));
                      }}
                      inputMode="numeric"
                      maxLength="10"
                    />

                    {errors.mobile && touched.mobile && <div className="d-block text-danger p-1">10 digit mobile number is required</div>}
                  </div>
                  <div className="mb-1 filled form-group">
                    <CsLineIcons icon="home" />
                    <Form.Control
                      type="text"
                      name="address"
                      className="bg-white border"
                      placeholder="Full address"
                      value={values.address}
                      onChange={handleChange}
                    />
                    {errors.address && touched.address && <div className="d-block text-danger p-1">Full address is required</div>}
                  </div>
                  <div className="mb-1 filled form-group">
                    <CsLineIcons icon="building-large" style={{ marginTop: '-3px' }} />
                    <Form.Select name="state" className="px-7" value={values.state} onChange={handleChange}>
                      <option hidden>Select State</option>
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
                      <option value="Other">Other</option>
                    </Form.Select>
                    {errors.state && touched.state && <div className="d-block text-danger p-1">State is required</div>}
                  </div>
                  <div className="mb-1 filled form-group">
                    <CsLineIcons icon="suitcase" />
                    <Form.Control
                      type="text"
                      name="message"
                      as="textarea"
                      className="bg-white border"
                      placeholder="Message"
                      value={values.message}
                      onChange={handleChange}
                    />
                    {errors.message && touched.message && <div className="d-block text-danger p-1">Message is required</div>}
                  </div>
                  <div className='border pt-2 rounded'><LoadCanvasTemplateNoReload /></div>
                  <Form.Control
                    type="text"
                    className="form-control my-2 rounded"
                    placeholder="Enter the captcha code"
                    value={captchacode}
                    onChange={(e) => setCaptchaCode(e.target.value)}
                  />
                  {captchaError && <div className="d-block text-danger my-2">{captchaError}</div>}
                  <div className="text-center">
                    <button className="btn btn-primary btn_color btn-lg" type="submit" disabled={loading}>
                      {loading ? <Spinner animation="border" size="sm" /> : 'Send Enquiry'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </Col>
        <Col className="text-center" xl="3" sm="12">
          <div className="bg-white rounded">
            <h1 className=" bg_color rounded p-3 fs-6">
              <p className="m-0">Contact Us </p>
            </h1>
            <div className='p-3'>
              {dataSiteContent && (
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent.getSiteContent.content) }}
                  className="text-start justify-content-start align-items-start mb-3"
                />
              )}
              {dataGoogleMap?.getSiteContent && (
                <div className="embed-responsive ratio ratio-16x9">
                  <iframe
                    className="embed-responsive-item"
                    title="Map of APNAGHARBANAO"
                    src={dataGoogleMap?.getSiteContent?.content}
                    style={{ border: '3px solid #1facec', borderRadius: '5px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </div>
        </Col>
        <Col xl="2">{' '}</Col>
      </Row>
    </>
  );
}

export default SendEnquiry;
