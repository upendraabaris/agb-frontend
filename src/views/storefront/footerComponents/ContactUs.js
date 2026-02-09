import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import DOMPurify from 'dompurify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { Row, Col, Card, Form } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import * as Yup from 'yup';
import { useFormik } from 'formik';
// eslint-disable-next-line import/no-extraneous-dependencies
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import { NavLink, withRouter } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import './style.css';
import { toast } from 'react-toastify';
import { useGlobleContext } from 'context/styleColor/ColorContext';

function ContactUs({ history }) {
  const { dataStoreFeatures1 } = useGlobleContext();
  const dispatch = useDispatch();
  const title = 'Contact Us';
  const description = 'Contact Us';

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

  // handle captcha

  const [captchacode, setCaptchaCode] = useState('');

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);

  const [captchaError, setcaptchaError] = useState('');

  // Contact Us Mail Form

  const CONTACT_US = gql`
    mutation ContactUsMail($name: String, $mobile: String, $email: String, $state: String, $address: String, $message: String) {
      contactUsMail(name: $name, mobile: $mobile, email: $email, state: $state, address: $address, message: $message) {
        message
      }
    }
  `;

  const [sendMail, { data, loading }] = useMutation(CONTACT_US, {
    onCompleted: () => {
      toast.success('Contact Mail sent Successfully');
      setTimeout(() => {
        history.push('/');
      }, 2000);
    },
    onError: (error) => {
      toast.error('Some Error Occured');
      console.error(error.message);
    },
  });

  const onSubmit = async (values, { resetForm }) => {
    if (validateCaptcha(captchacode, false) === true) {
      setcaptchaError('');
      await sendMail({
        variables: {
          name: values.name,
          mobile: values.phone,
          email: values.email,
          state: values.state,
          address: values.address,
          message: values.message,
        },
      });
      // resetForm();
    } else {
      setcaptchaError('Fill Captcha before submit');
    }
  };
  // const onSubmit = (values) => console.log('submit form', values);
  // const token = captchaRef.current.getValue();
  const phoneRegExp = /^(\+91)?(-)?\s*?(91)?\s*?(\d{3})-?\s*?(\d{3})-?\s*?(\d{4})$/;
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Company Name is required'),
    message: Yup.string().required('Enter a message.'),
    email: Yup.string().email('Must be a valid email').required('Company Email is required'),
    phone: Yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone Number is required'),
    address: Yup.string().required('Enter Address'),
    state: Yup.string().required('Enter your state'),
  });
  const initialValues = { name: '', message: '', email: '', phone: '', address: '', state: '' };
  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  return (
    <>
      <HtmlHead title={title} description={description} />
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
        {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
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
      <div className="col-auto mt-2 mb-sm-0 me-auto col">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <button type="button" className="muted-link pb-1 d-inline-block bg-transparent border-0" onClick={() => window.history.back()}>
              <span className="text-dark ms-1">Back</span>
            </button>
          </Col>
        </Row>
      </div>
      <Row>
        <Col xl="7" sm="12">
          <div className="text-center fw-bold py-1 mt-3 bg_color  pt-2 pb-2  rounded">Send Enquiry</div>
          <Card className="mb-5 rounded">
            <div className="p-2 rounded">
              <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="suitcase" />
                  <Form.Control type="text" name="name" placeholder="Name" className=" bg-white border" value={values.name} onChange={handleChange} />
                  {errors.name && touched.name && <div className="d-block text-danger ps-2 pt-1">Name is required</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="email" />
                  <Form.Control type="text" className=" bg-white border" name="email" placeholder="Email" value={values.email} onChange={handleChange} />
                  {errors.email && touched.email && <div className="d-block text-danger ps-2 pt-1">Email is required</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="phone" />
                  <Form.Control
                    type="tel"
                    maxLength="10"
                    onKeyDown={(e) => {
                      if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                        e.preventDefault();
                      }
                    }}
                    name="phone"
                    className=" bg-white border"
                    onChange={handleChange}
                    value={values.phone}
                    placeholder="Mobile number"
                  />
                  {errors.phone && touched.phone && <div className="d-block text-danger ps-2 pt-1">Mobile number is required</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="home" />
                  <Form.Control
                    type="text"
                    autoComplete="street-address"
                    name="address"
                    onChange={handleChange}
                    placeholder="Address"
                    value={values.address}
                    className=" bg-white border"
                  />
                  {errors.address && touched.address && <div className="d-block text-danger ps-2 pt-1">Address is required</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <Form.Select name="state" onChange={handleChange} value={values.state} aria-label="Default select example">
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
                  </Form.Select>
                  {errors.state && touched.state && <div className="d-block text-danger ps-2 pt-1">State is required</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="suitcase" />
                  <Form.Control
                    type="text"
                    className=" bg-white border"
                    name="message"
                    placeholder="Enter Message"
                    value={values.message}
                    onChange={handleChange}
                  />
                  {errors.message && touched.message && <div className="d-block text-danger ps-2 pt-1">Message is required</div>}
                </div>
                <LoadCanvasTemplateNoReload />
                <Form.Control
                  type="text"
                  className="form-control my-2"
                  placeholder="Enter the captcha"
                  value={captchacode}
                  onChange={(e) => setCaptchaCode(e.target.value)}
                />
                {captchaError && <div className="d-block text-danger my-2">{captchaError}</div>}
                <div className="text-center">
                  {loading ? (
                    <button className="btn btn-primary btn-lg" type="button">
                      Loading...
                    </button>
                  ) : (
                    <button className="btn btn_color btn-lg" type="submit">
                      Send
                    </button>
                  )}
                </div>
              </form>
            </div>
          </Card>
        </Col>
        <Col xl="5" sm="12">
          <div className="text-center fw-bold py-1 mt-3 bg_color  pt-2 pb-2  rounded">Contact Us</div>
          <div className="pt-4 bg-white border p-4 rounded">
            {dataSiteContent && (
              <div
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content.replace(/<br>/g, '')) }}
                className="justify-content-start align-items-start mb-3"
              />
            )}
            {dataGoogleMap?.getSiteContent && (
              <iframe
                className="sw-35 sh-35 sh-sm-40 sw-sm-60 sh-lg-35 sw-lg-60 sh-md-30 sw-md-60 mt-3"
                title="Map of APNAGHARBANAO"
                src={dataGoogleMap?.getSiteContent?.content}
                style={{ border: '3px solid #1facec', borderRadius: '5px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}
export default withRouter(ContactUs);
