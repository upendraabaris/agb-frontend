import React, { useEffect, useState } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Button, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import LayoutFullpage from 'layout/LayoutFullpage';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { setCurrentUser } from 'auth/authSlice';
import { useDispatch } from 'react-redux';
import HtmlHead from 'components/html-head/HtmlHead';
import { toast } from 'react-toastify';
import { useMutation, gql, useLazyQuery } from '@apollo/client';
import DOMPurify from 'dompurify';
import './login.css';
import FacebookLogin from 'react-facebook-login';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useGlobleContext } from 'context/styleColor/ColorContext';

// Creating a schema for CREATE_USER

const LOGIN_WITH = gql`
  mutation LoginWith($email: String!, $firstName: String!) {
    loginWith(email: $email, firstName: $firstName) {
      token
      user {
        id
        role
        firstName
        email
        profilepic
        lastName
        mobileNo
      }
    }
  }
`;

const CREATE_USER = gql`
  mutation RegisterUser($firstName: String!, $lastName: String!, $email: String!, $mobileNo: String!, $password: String!) {
    registerUser(firstName: $firstName, lastName: $lastName, email: $email, mobileNo: $mobileNo, password: $password) {
      token
      refreshToken
      user {
        id
        role
        firstName
        lastName
        email
        mobileNo
        profilepic
      }
    }
  }
`;

const LOGIN_PAGE_CONTENT = gql`
  query GetSiteContent($key: String!) {
    getSiteContent(key: $key) {
      content
      key
    }
  }
`;

export const GET_SITE_LOGO = gql`
  query GetAds($key: String!) {
    getAds(key: $key) {
      images
    }
  }
`;

const Register = () => {
  const title = 'Register';
  const description = 'Register Page';
  const facebookAppId = process.env.REACT_APP_FACEBOOK_APP_ID;
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
  const history = useHistory();

  const [faviconImage, setFaviconImage] = useState(null);
  const [getFavicon, { data: faviconData }] = useLazyQuery(GET_SITE_LOGO, {
    onError: (err) => console.log('GET_SITE_FAVICON', err),
  });

  useEffect(() => {
    getFavicon({ variables: { key: 'favicon' } });
  }, []);

  useEffect(() => {
    if (faviconData?.getAds?.images) {
      setFaviconImage(faviconData.getAds.images);
    }
  }, [faviconData]);

  const [registerUser, { data, loading }] = useMutation(CREATE_USER, {
    onCompleted: () => {
      localStorage.setItem('token', data.registerUser.token);
      localStorage.setItem('refreshToken', data.registerUser.refreshToken);
      dispatch(setCurrentUser(data.registerUser.user));
      toast.success('Account created successfull!');
      setTimeout(() => {
        history.push('/');
      }, 2000);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.message || 'Something went wrong!', {
        autoClose: 10000,
      });
    },
  });
  //  Defining onSubmit
  const onSubmit = (values) => {
    registerUser({
      variables: {
        firstName: values.fname,
        lastName: values.lname,
        email: values.email,
        mobileNo: values.phone,
        password: values.confirm,
      },
    });
  };

  const phoneRegExp = /^(\+91)?(-)?\s*?(91)?\s*?(\d{3})-?\s*?(\d{3})-?\s*?(\d{4})$/;

  const validationSchema = Yup.object().shape({
    fname: Yup.string().required('First Name is required'),
    lname: Yup.string().required('Last Name is required'),
    email: Yup.string().email().required('Email is required'),
    password: Yup.string().min(6, 'Must be at least 6 chars!').required('Password is required'),
    confirm: Yup.string()
      .min(6, 'Must be at least 6 chars!')
      .required('Confirm your Password')
      .oneOf([Yup.ref('password')], 'Passwords does not match'),
    phone: Yup.string().matches(phoneRegExp, 'Phone number is not valid').required('Phone Number is required'),
    terms: Yup.bool().required().oneOf([true], 'Terms must be accepted'),
  });
  const initialValues = { fname: '', lname: '', email: '', password: '', confirm: '', phone: '', terms: false };
  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;
  const [LoginWith] = useMutation(LOGIN_WITH, {
    onCompleted: async (res) => {
      localStorage.setItem('token', res.loginWith.token);
      if (res?.loginWith?.refreshToken) {
        localStorage.setItem('refreshToken', res.loginWith.refreshToken);
      }
      dispatch(setCurrentUser(res.loginWith.user));
      toast.success('Account created successfull!');
      setTimeout(() => {
        history.push('/');
      }, 2000);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
      console.error('LOGIN_WITH', err);
    },
  });

  const responseFacebook = async (values1) => {
    try {
      await LoginWith({
        variables: {
          email: values1.email,
          firstName: values1.name,
        },
      });
    } catch (errr) {
      console.error('responseFacebook', errr);
    }
  };

  const [getLoginPageContent, { data: dataLoginPageContent }] = useLazyQuery(LOGIN_PAGE_CONTENT);

  useEffect(() => {
    getLoginPageContent({
      variables: {
        key: 'register-page-content',
      },
    });
  }, []);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);
    },
    onError: (error2) => console.log('Login Failed:', error2),
  });

  const logOut = () => {
    googleLogout();
    setProfile(null);
  };

  useEffect(() => {
    if (user) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: 'application/json',
          },
        })
        .then((res) => {
          setProfile(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      LoginWith({
        variables: {
          email: profile.email,
          firstName: profile.given_name,
        },
      });
    }
  }, [LoginWith, profile]);

  const leftSide = (
    <div className="min-h-100 d-flex align-items-center">
      <div className="w-100 w-lg-75 w-xxl-50">
        {dataLoginPageContent && (
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataLoginPageContent.getSiteContent.content) }} className="mb-3 fs-5" />
        )}
      </div>
    </div>
  );

  const rightSide = (
    <div className="sw-lg-70 min-h-100 bg-foreground d-flex justify-content-center align-items-center shadow-deep py-5 full-page-content-right-border">
      <div className="sw-lg-50 px-5">
        <div className="mb-3">
          <h2 className="cta-1 fw-bold mb-0 ">
            <NavLink to="/" className="text-dark">
              Register
            </NavLink>
            <NavLink to="/" className="float-end">
              <img src={faviconData?.getAds?.images} alt="Logo" width="40px" className="border bg-white rounded p-1 me-1" />
            </NavLink>
          </h2>
        </div>
        <div>
          <form id="registerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
            <Row>
              <div className="col-6 mb-3 filled form-group tooltip-end-top">
                <CsLineIcons icon="user" className="ms-2" />
                <Form.Control type="text" name="fname" className="bg-white border" placeholder="First Name" value={values.fname} onChange={handleChange} />
                {errors.fname && touched.fname && <div className="d-block text-danger p-1 ps-1">{errors.fname}</div>}
              </div>
              <div className="col-6 mb-3 filled form-group tooltip-end-top">
                <CsLineIcons icon="user" className="ms-2" />
                <Form.Control type="text" name="lname" className="bg-white border" placeholder="Last Name" value={values.lname} onChange={handleChange} />
                {errors.lname && touched.lname && <div className="d-block  text-danger p-1 ps-1">{errors.lname}</div>}
              </div>
            </Row>
            <Row>
              <div className="col-12 mb-3 filled form-group tooltip-end-top">
                <CsLineIcons icon="email" className="ms-2" />
                <Form.Control type="text" name="email" className="bg-white border" placeholder="Email" value={values.email} onChange={handleChange} />
                {errors.email && touched.email && <div className="d-block  text-danger p-1 ps-1">{errors.email}</div>}
              </div>
            </Row>
            <Row>
              <div className="mb-3 filled form-group tooltip-end-top">
                <CsLineIcons icon="phone" className="ms-2" />
                <Form.Control
                  type="tel"
                  name="phone"
                  onChange={handleChange}
                  className="bg-white border"
                  maxLength="10"
                  onKeyDown={(e) => {
                    if (e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && (e.key < '0' || e.key > '9')) {
                      e.preventDefault();
                    }
                  }}
                  value={values.phone}
                  placeholder="Mobile number"
                />
                {errors.phone && touched.phone && <div className="d-block  text-danger p-1 ps-1">Mobile number</div>}
              </div>
            </Row>
            <Row>
              <div className="mb-3 filled form-group tooltip-end-top">
                <CsLineIcons icon="lock-off" className="ms-2" />
                <Form.Control
                  type="password"
                  className="bg-white border"
                  name="password"
                  onChange={handleChange}
                  value={values.password}
                  placeholder="Password"
                />
                {errors.password && touched.password && <div className="d-block  text-danger p-1 ps-1">{errors.password}</div>}
              </div>
            </Row>
            <Row>
              <div className="mb-3 filled form-group tooltip-end-top">
                <CsLineIcons icon="lock-on" className="ms-2" />
                <Form.Control
                  type="password"
                  className="bg-white border"
                  name="confirm"
                  onChange={handleChange}
                  value={values.confirm}
                  placeholder="Confirm Password"
                />
                {errors.confirm && touched.confirm && <div className="d-block  text-danger p-1 ps-1">{errors.confirm}</div>}
              </div>
            </Row>
            <div className="mb-3 position-relative form-group">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" name="terms" onChange={handleChange} value={values.terms} />
                <label className="form-check-label font-color">
                  I have read and accept the{' '}
                  <NavLink target="_blank" to="/user_policies" className="font_color">
                    User Policies.
                  </NavLink>
                </label>
                {errors.terms && touched.terms && <div className="d-block  text-danger p-1 ps-1">{errors.terms}</div>}
              </div>
            </div>

            {loading ? (
              <Button size="lg" type="button" >
                Loading...
              </Button>
            ) : (
              <Button size="lg" type="submit" className="btn_color">
                Signup
              </Button>
            )}
          </form>
        </div>
        <hr />
        <div className="mb-2 text-center">
          <p className="h6">
            <span className="font-color">If you are a member, please </span>{' '}
            <NavLink to="/login" className="fw-bolder font_color">
              login
            </NavLink>
            .
          </p>
        </div>
        <div className="containerlogin justify-content-center pt-2 w-100">
          {/* <FacebookLogin
            appId={facebookAppId}
            textButton=""
            fields="name,email,picture"
            callback={responseFacebook}
            cssClass="loginicon loginicon1"
            icon="fa-facebook"
          /> */}
          {/* <button type="button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-whatsapp loginicon" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
          </button> */}
          <button aria-label="Log in with Google" type="button" onClick={handleGoogleLogin}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="loginicon">
              <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <HtmlHead title={title} description={description} />
      <LayoutFullpage left={leftSide} right={rightSide} />
      <style>
        {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
        {`
        .font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }
        .font_color:hover {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          filter: brightness(80%);       
        }
        `}
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
        {`.btn_widht {
          width: 236px;
        }`}
      </style>
    </>
  );
};

export default Register;
