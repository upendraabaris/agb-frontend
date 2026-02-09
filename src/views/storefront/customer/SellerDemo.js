import React, { useEffect, useState } from 'react';
import 'quill/dist/quill.bubble.css';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';
import { Row, Col, Form, Card } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import HtmlHead from 'components/html-head/HtmlHead';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DOMPurify from 'dompurify';
// eslint-disable-next-line import/no-extraneous-dependencies
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';

function SellerRegistration() {
  const title = 'Seller Registration';
  const description = 'Ecommerce Product Detail Page';
  const dispatch = useDispatch();

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

  useEffect(() => {
    getContent({
      variables: {
        key: 'seller-content',
      },
    });
  }, [dataSiteContent, getContent]);

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  // handle captcha

  const [captchacode, setCaptchaCode] = useState('');

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);

  const [captchaError, setcaptchaError] = useState('');

  const SELLER_REGISTRATION_MAIL = gql`
  mutation SellerRegMail($name: String, $email: String, $mobile: String, $address: String, $message: String, $state: String) {
    sellerRegMail(name: $name, email: $email, mobile: $mobile, address: $address, message: $message, state: $state) {
      message
    }
  }
`;

const [sendSellerMail, {data: sellerMailData}] = useMutation(SELLER_REGISTRATION_MAIL,{ 
  onCompleted: () => {
    toast.success("Registered Successfully");
  },
  onError : (error) => {
    toast.error("Some error occurred"); 
  }
});

if(sellerMailData){
  console.log("sellerMailData", sellerMailData);
}
  const onSubmit = (values, { resetForm }) => {
    if (validateCaptcha(captchacode, false) === true) {
      setcaptchaError('');
      sendSellerMail({
          variables: {
            name: values.name,
            email: values.email,
            mobile: values.phone,
            address: values.address,
            message: values.message,
            state: values.state
          }
      });
      setTimeout(() => {
        resetForm({ values: '' });
      }, 1000);
    } else { 
      setcaptchaError('Fill Captcha before submit');
    }
  };
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
  // const onSubmit = (values) => console.log('submit form', values);

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Home</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <Row>
        <h2 className="small-title fs-3 mb-4 my-2">Register for Seller Registration</h2>
      </Row>
      <Row>
        <Col style={{ border: '1px solid #1ea8e7', background: '#1ea8e7', borderRadius: '5px' }} xl="5">
          {dataSiteContent && (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content) }} className="justify my-2 mt-2 px-4 pt-4" />
          )}
        </Col>
        <Col xl="7">
          <Card className="mb-5">
            <Card.Body>
              <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="suitcase" />
                  <Form.Control type="text" name="name" placeholder="Enter Name" value={values.name} onChange={handleChange} />
                  {errors.name && touched.name && <div className="d-block invalid-tooltip">{errors.name}</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="email" />
                  <Form.Control type="text" name="email" placeholder="Enter Email" value={values.email} onChange={handleChange} />
                  {errors.email && touched.email && <div className="d-block invalid-tooltip">{errors.email}</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="phone" />
                  <Form.Control
                    //  type="phone"
                    type="tel"
                    maxLength="10"
                    onKeyDown={(e) => {
                      if (e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'Delete' && (e.key < '0' || e.key > '9')) {
                        e.preventDefault();
                      }
                    }}
                    name="phone"
                    onChange={handleChange}
                    value={values.phone}
                    placeholder="Mobile No"
                  />
                  {errors.phone && touched.phone && <div className="d-block invalid-tooltip">{errors.phone}</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="home" />
                  <Form.Control
                    type="text"
                    autoComplete="street-address"
                    name="address"
                    onChange={handleChange}
                    placeholder="Enter House No, Colony name..."
                    value={values.address}
                  />
                  {errors.address && touched.address && <div className="d-block invalid-tooltip">{errors.address}</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  {/* <CsLineIcons icon="building-large" /> */}
                  {/* <Form.Control type="text" name="state" onChange={handleChange} placeholder="Enter State" value={values.state} /> */}

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
                  {errors.state && touched.state && <div className="d-block invalid-tooltip">{errors.state}</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="suitcase" />
                  <Form.Control type="text" name="message" placeholder="Enter Message" value={values.message} onChange={handleChange} />
                  {errors.message && touched.message && <div className="d-block invalid-tooltip">{errors.message}</div>}
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
                  <button className="btn btn-primary btn-lg" type="submit">
                    Send
                  </button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default SellerRegistration;
