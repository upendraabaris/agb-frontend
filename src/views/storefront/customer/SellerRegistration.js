import React, { useEffect, useState } from 'react';
import 'quill/dist/quill.bubble.css';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { toast } from 'react-toastify';
import { NavLink, withRouter } from 'react-router-dom';
import { Row, Col, Form, Card } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import HtmlHead from 'components/html-head/HtmlHead';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DOMPurify from 'dompurify';
// eslint-disable-next-line import/no-extraneous-dependencies
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';

function SellerRegistration({ history }) {
  const title = 'Seller Registration';
  const description = 'Seller Registration Form';
  const { dataStoreFeatures1 } = useGlobleContext();
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
    mutation SellerRegMail(
      $name: String
      $description: String
      $email: String
      $mobile: String
      $gst: String
      $address1: String
      $address2: String
      $city: String
      $pincode: Int
      $state: String
      $composite: String
      $all: String
    ) {
      sellerRegMail(
        name: $name
        description: $description
        email: $email
        mobile: $mobile
        gst: $gst
        address1: $address1
        address2: $address2
        city: $city
        pincode: $pincode
        state: $state
        composite: $composite
        all: $all
      ) {
        message
      }
    }
  `;

  const [createSellerMail, { loading }] = useMutation(SELLER_REGISTRATION_MAIL, {
    onCompleted: () => {
      toast.success('Success! The form has been submitted successfully and a representative will get in touch with you.');
      setTimeout(() => {
        history.push('/');
      }, 2000);
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
          address: values.address,
          description: values.desc,
          gst: values.gst,
          address1: values.address,
          address2: values.address2,
          city: values.city,
          pincode: parseInt(values.pincode, 10),
          state: values.state,
          composite: values.gstType === 'Composite' ? values.gst : '',
          all: values.gstType === 'All' ? values.gst : '',
        },
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
    name: Yup.string().required('Company name is required'),
    desc: Yup.string().required('Company description is required'),
    email: Yup.string().email('Must be a valid email').required('Company email is required'),
    // gst: Yup.string().required('GST number is required'),
    gst: Yup.string().when('hasGst', {
      is: true,
      then: Yup.string().required('GST number is required'),
    }),
    gstType: Yup.string().when('hasGst', {
      is: true,
      then: Yup.string().required('Please select GST type'),
    }),
    phone: Yup.string().matches(phoneRegExp, 'Mobile number is not valid').required('Mobile number is required'),
    address: Yup.string().required('Company address is required'),
    address2: Yup.string().required('Street no. area is required'),
    city: Yup.string().required('City is required'),
    pincode: Yup.string().required('Pincode is required'),
    state: Yup.string().required('State is required'),
  });
  const initialValues = { name: '', desc: '', email: '', gst: '', phone: '', address: '', address2: '', city: '', pincode: '', state: '' };
  // const onSubmit = (values) => console.log('submit form', values);
  const [gstType, setGstType] = useState('');
  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;
  const [hasGst, setHasGst] = useState(false);
  return (
    <>
      <HtmlHead title={title} description={description} />
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
      <Row>
        <Col style={{ border: '1px solid #1ea8e7', background: '#1ea8e7', borderRadius: '5px' }} xl="5">
          {dataSiteContent && (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content) }} className="justify my-2 mt-2 px-4 pt-2" />
          )}
        </Col>
        <Col xl="7">
          {/* Product Info Start */}
          <Card className=" py-2">
            <div className="p-3">
              <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
                <div className="fw-bold fs-5 pb-3 text-dark">Create your account to start selling</div>
                <div className="row">
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <CsLineIcons className="ms-2" icon="suitcase" />
                    <Form.Control
                      type="text"
                      className="bg-white border rounded"
                      name="name"
                      placeholder="Enter company name"
                      value={values.name}
                      onChange={handleChange}
                    />
                    {errors.name && touched.name && <div className="d-block text-danger p-1 small">{errors.name}</div>}
                  </div>
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <CsLineIcons className="ms-2" icon="email" />
                    <Form.Control
                      type="text"
                      className="bg-white border rounded"
                      name="email"
                      placeholder="Enter company email"
                      value={values.email}
                      onChange={handleChange}
                    />
                    {errors.email && touched.email && <div className="d-block text-danger p-1 small">{errors.email}</div>}
                  </div>
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <CsLineIcons className="ms-2" icon="phone" />
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
                      className="bg-white border rounded"
                    />
                    {errors.phone && touched.phone && <div className="d-block text-danger p-1 small">{errors.phone}</div>}
                  </div>
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <CsLineIcons className="ms-2" icon="home" />
                    <Form.Control
                      type="text"
                      autoComplete="street-address"
                      name="address"
                      onChange={handleChange}
                      placeholder="Enter company address"
                      value={values.address}
                      className="bg-white border rounded"
                    />
                    {errors.address && touched.address && <div className="d-block text-danger p-1 small">{errors.address}</div>}
                  </div>
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <CsLineIcons className="ms-2" icon="home" />
                    <Form.Control
                      type="text"
                      className="bg-white border rounded"
                      name="address2"
                      onChange={handleChange}
                      placeholder="Enter street no. Area"
                      value={values.address2}
                    />
                    {errors.address2 && touched.address2 && <div className="d-block text-danger p-1 small">{errors.address2}</div>}
                  </div>
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <CsLineIcons className="ms-2" icon="building-large" />
                    <Form.Control
                      type="text"
                      className="bg-white border rounded"
                      name="city"
                      onChange={handleChange}
                      placeholder="Enter city"
                      value={values.city}
                    />
                    {errors.city && touched.city && <div className="d-block text-danger p-1 small">{errors.city}</div>}
                  </div>
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <CsLineIcons className="ms-2" icon="bookmark" />
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
                      className="bg-white border rounded"
                    />
                    {errors.pincode && touched.pincode && <div className="d-block text-danger p-1 small">{errors.pincode}</div>}
                  </div>
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <Form.Select name="state" style={{ height: '44px' }} onChange={handleChange} value={values.state} aria-label="Default select example">
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
                  <div className="col-md-12 mb-2 filled form-group tooltip-end-top">
                    <CsLineIcons className="ms-2" icon="boxes" />
                    <Form.Control
                      type="text"
                      as="textarea"
                      className="bg-white border rounded"
                      name="desc"
                      onChange={handleChange}
                      placeholder="Enter company description"
                      value={values.desc}
                    />
                    {errors.desc && touched.desc && <div className="d-block text-danger p-1 small">{errors.desc}</div>}
                  </div>
                  <Form onSubmit={formik.handleSubmit} className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <div>
                      <div className="fw-bold pb-1 text-dark">Do you have a GST Number?</div>
                      <div>
                        <Form.Check
                          type="radio"
                          label="Yes"
                          name="hasGst"
                          id="hasGstYes"
                          onChange={() => {
                            setHasGst(true);
                            formik.setFieldValue('hasGst', true);
                          }}
                          checked={hasGst === true}
                          className="col-6 float-start"
                        />
                        <Form.Check
                          type="radio"
                          label="No"
                          name="hasGst"
                          id="hasGstNo"
                          onChange={() => {
                            setHasGst(false);
                            formik.setFieldValue('hasGst', false);
                            formik.setFieldValue('gstType', '');
                            setGstType('');
                          }}
                          checked={hasGst === false}
                          className="col-6  float-start "
                        />
                      </div>
                    </div>
                    {hasGst && (
                      <div className="mb-2 filled form-group tooltip-end-top">
                        <div className="mb-2 mt-3 col-12">
                          <div className="fw-bold pb-1 pt-3 text-dark">Select GST Type</div>
                          <div>
                            <Form.Check
                              type="radio"
                              label="Composite"
                              name="gstType"
                              id="gstTypeComposite"
                              onChange={() => {
                                setGstType('Composite');
                                formik.setFieldValue('gstType', 'Composite');
                              }}
                              checked={gstType === 'Composite'}
                              className="col-6 float-start"
                            />
                            <Form.Check
                              type="radio"
                              label="All"
                              name="gstType"
                              id="gstTypeAll"
                              onChange={() => {
                                setGstType('All');
                                formik.setFieldValue('gstType', 'All');
                              }}
                              checked={gstType === 'All'}
                              className="col-6 float-start"
                            />
                          </div>
                          {formik.errors.gstType && formik.touched.gstType && <div className="d-block text-danger p-1 small">{formik.errors.gstType}</div>}
                        </div>
                        <div className="mb-2 mt-2 filled form-group tooltip-end-top">
                          <CsLineIcons className="ms-1 mt-3" icon="credit-card" />
                          <Form.Control
                            type="text"
                            className="bg-white border rounded"
                            onKeyPress={(e) => {
                              const { key } = e;
                              if (!/^[0-9a-zA-Z]*$/.test(key)) {
                                e.preventDefault();
                              }
                            }}
                            name="gst"
                            maxLength="15"
                            onChange={formik.handleChange}
                            placeholder="Enter GST Number"
                            value={formik.values.gst}
                          />
                          {formik.errors.gst && formik.touched.gst && <div className="d-block text-danger p-1 small">{formik.errors.gst}</div>}
                        </div>
                      </div>
                    )}
                  </Form>
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">
                    <div className="border rounded pt-2 mb-2">
                      <LoadCanvasTemplateNoReload />
                    </div>
                    <Form.Control
                      type="text"
                      className="form-control ps-4 bg-white border rounded"
                      placeholder="Enter Captcha Code"
                      value={captchacode}
                      onChange={(e) => setCaptchaCode(e.target.value)}
                    />
                    {captchaError && <div className="d-block text-danger mt-2">{captchaError}</div>}
                  </div>
                  <div className="col-md-6 mb-2 filled form-group tooltip-end-top">{/* <LoadCanvasTemplateNoReload />                    */}</div>
                  <div className="text-center col-md-6 float-end">
                    {loading ? (
                      <button className="btn btn_color w-100 btn-lg" disabled type="button">
                        Loading
                      </button>
                    ) : (
                      <button className="btn btn_color w-100 btn-lg" type="submit">
                        Create Account
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default withRouter(SellerRegistration);
