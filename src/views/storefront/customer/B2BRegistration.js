import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { useFormik } from 'formik';
import HtmlHead from 'components/html-head/HtmlHead';
import * as Yup from 'yup';
import { Row, Col, Form, Card, Spinner } from 'react-bootstrap';
import { NavLink, withRouter } from 'react-router-dom';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
// eslint-disable-next-line import/no-extraneous-dependencies
import { loadCaptchaEnginge, LoadCanvasTemplateNoReload, validateCaptcha } from 'react-simple-captcha';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';

function B2BRegistration({ history }) {
  const title = 'User to B2B';
  const description = 'Ecommerce User to B2B Page';
  const dispatch = useDispatch();
  const [add, setAdd] = useState('');

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

  useEffect(() => {
    getContent({
      variables: {
        key: 'b2b-content',
      },
    });
  }, [dataSiteContent, getContent]);

  const UPGRADE_USER_TO_B2B = gql`
    mutation UpgradeUserToB2b(
      $companyName: String!
      $gstin: String!
      $address: String!
      $companyDescription: String!
      $mobileNo: String!
      $email: String!
      $status: String!
    ) {
      upgradeUserToB2b(
        companyName: $companyName
        gstin: $gstin
        address: $address
        companyDescription: $companyDescription
        mobileNo: $mobileNo
        email: $email
        status: $status
      ) {
        companyName
        companyDescription
        email
        gstin
        mobileNo
        status
      }
    }
  `;

  const [upgradeUserToB2b, { data, loading }] = useMutation(UPGRADE_USER_TO_B2B, {
    onCompleted: () => {
      // toast(`${data.upgradeUserToB2b.companyName} is registered for B2B!`);
      toast('Request send successfully !');
      setTimeout(() => {
        history.push('/');
      }, 2000);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  // handle captcha

  const [captchacode, setCaptchaCode] = useState('');

  useEffect(() => {
    loadCaptchaEnginge(6);
  }, []);

  const [captchaError, setcaptchaError] = useState('');

  const onSubmit = (values, { resetForm }) => {
    if (validateCaptcha(captchacode, false) === true) {
      setcaptchaError('');
      upgradeUserToB2b({
        variables: {
          companyName: values.businessName,
          companyDescription: values.description,
          address: add,
          mobileNo: values.mobile,
          gstin: values.gstin,
          email: values.email,
          status: 'Pending',
        },
      });
      resetForm({ values: '' });
    } else {
      setcaptchaError('Fill Captcha before submit');
    }
  };

  const phoneRegExp = /^(\+91)?(-)?\s*?(91)?\s*?(\d{3})-?\s*?(\d{3})-?\s*?(\d{4})$/;
  const pincodeRegExp = /^[0-9]*$/;
  const validationSchema = Yup.object().shape({
    businessName: Yup.string().required('Company Name is required'),
    description: Yup.string().required('Company Description is required'),
    email: Yup.string().email('Must be a valid email, Remove extra spaces if any.').required('Company Email is required'),
    gstin: Yup.string().required('Goods and Services Tax detail is required'),
    mobile: Yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone Number is required'),
    businessAddress: Yup.string().required('Enter Address'),
    pincode: Yup.string().matches(pincodeRegExp, 'Pincode is not valid').required('Enter Pincode'),
  });

  const initialValues = { businessName: '', description: '', businessAddress: '', mobile: '', active: '', gstin: '', email: '', pincode: '' };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  useEffect(() => {
    const temp = values.businessAddress.concat(', ');
    const tempFinal = temp.concat(values.pincode);
    setAdd(tempFinal);
  }, [values]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">HOME</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <Row className="justify-content-center mb-4">
        <Col md={10} className="text-center">
          <h2 className="text-dark fw-bold fs-3 mb-2">Register for Business to Business</h2>
        </Col>
      </Row>

      <Row>
        <Col style={{ border: '1px solid #1ea8e7', background: '#1ea8e7', borderRadius: '5px' }} xl="5">
          {dataSiteContent && (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content) }} className="justify my-2 mt-2 px-4 pt-4" />
          )}
        </Col>
        <Col xl="7">
          {/* Product Info Start */}
          <Card className="shadow-lg rounded-4 border-0 p-2 bg-white">
            <Card.Body>
              <h3 className="mb-2 text-center fw-bold">B2B Registration</h3>
              <Form id="sellerForm" onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-dark fw-bold">
                        Business Name<span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="businessName"
                        placeholder="Enter Business Name"
                        value={values.businessName}
                        onChange={handleChange}
                        isInvalid={!!errors.businessName && touched.businessName}
                      />
                      <Form.Control.Feedback type="invalid">{errors.businessName}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-dark fw-bold">
                        Email<span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter Company Email"
                        value={values.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email && touched.email}
                      />
                      <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-dark fw-bold">
                        GST No.<span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="gstin"
                        placeholder="Enter GST Number"
                        maxLength={15}
                        value={values.gstin}
                        onChange={handleChange}
                        isInvalid={!!errors.gstin && touched.gstin}
                        onKeyPress={(e) => {
                          if (!/^[0-9a-zA-Z]*$/.test(e.key)) e.preventDefault();
                        }}
                      />
                      <Form.Control.Feedback type="invalid">{errors.gstin}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-dark fw-bold">
                        Mobile No.<span className="text-danger"> *</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        maxLength="10"
                        name="mobile"
                        placeholder="Enter Mobile Number"
                        value={values.mobile}
                        onChange={handleChange}
                        isInvalid={!!errors.mobile && touched.mobile}
                        onKeyDown={(e) => {
                          if (!['Backspace', 'Tab', 'Delete'].includes(e.key) && (e.key < '0' || e.key > '9')) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <Form.Control.Feedback type="invalid">{errors.mobile}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="text-dark fw-bold">
                    Business Description<span className="text-danger"> *</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    placeholder="Enter Business Description"
                    value={values.description}
                    onChange={handleChange}
                    isInvalid={!!errors.description && touched.description}
                  />
                  <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-dark fw-bold">
                    Business Address<span className="text-danger"> *</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="businessAddress"
                    placeholder="Enter Business Address"
                    value={values.businessAddress}
                    onChange={handleChange}
                    isInvalid={!!errors.businessAddress && touched.businessAddress}
                  />
                  <Form.Control.Feedback type="invalid">{errors.businessAddress}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-dark fw-bold">
                    Pincode<span className="text-danger"> *</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    maxLength="6"
                    name="pincode"
                    placeholder="Enter Pincode"
                    value={values.pincode}
                    onChange={handleChange}
                    isInvalid={!!errors.pincode && touched.pincode}
                    onKeyDown={(e) => {
                      if (!['Backspace', 'Tab', 'Delete'].includes(e.key) && (e.key < '0' || e.key > '9')) {
                        e.preventDefault();
                      }
                    }}
                  />
                  <Form.Control.Feedback type="invalid">{errors.pincode}</Form.Control.Feedback>
                </Form.Group>

                <Row className="mb-3 align-items-center">
                  <Col md={6}>
                    <LoadCanvasTemplateNoReload />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      type="text"
                      placeholder="Enter the captcha"
                      value={captchacode}
                      onChange={(e) => setCaptchaCode(e.target.value)}
                      isInvalid={!!captchaError}
                    />
                    {captchaError && <div className="text-danger mt-1">{captchaError}</div>}
                  </Col>
                </Row>

                <div className="text-center mt-4">
                  <button className="btn btn-primary btn-lg px-5" type="submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : 'Register for B2B'}
                  </button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default withRouter(B2BRegistration);
