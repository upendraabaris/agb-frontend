/* eslint-disable */
import { React, useState, useEffect } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import LayoutFullpage from 'layout/LayoutFullpage';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from 'auth/authSlice';
import DOMPurify from 'dompurify';
import './login.css';
import FacebookLogin from 'react-facebook-login';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useGlobleContext } from 'context/styleColor/ColorContext';
import { useMutation, gql, useQuery, useLazyQuery } from '@apollo/client';

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
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
        seller {
          id
          companyName
          gstin
          address
          mobileNo
          email
          dealerstatus
        }
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

export const GET_SITE_LOGO = gql`
  query GetAds($key: String!) {
    getAds(key: $key) {
      images
    }
  }
`;

const Login = () => {
  const title = 'Login';
  const description = 'Login Page';
  const { dataStoreFeatures1 } = useGlobleContext();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState('');
  const [loginUser, { data }] = useMutation(LOGIN_USER, {
    onCompleted: async () => {
      localStorage.setItem('token', data.loginUser.token);
      localStorage.setItem('refreshToken', data.loginUser.refreshToken);
      dispatch(setCurrentUser(data.loginUser.user));
      if (data?.loginUser?.user?.role?.includes('admin')) {
        history.push('/admin');
      } else if (data?.loginUser?.user?.role?.includes('seller')) {
        history.push('/seller');
      } else {
        history.push('/');
      }
    },
    onError: (error) => {
      setLoading(false);
      setErrorMessage(error.message || 'Something went wrong!');
    },
  });

  // useEffect(() => {
  //   const orderID = sessionStorage.getItem('orderID') || localStorage.getItem('orderID');
  //   if (!orderID) return;

  //   if (!sessionStorage.getItem('orderID')) {
  //     sessionStorage.setItem('orderID', orderID);
  //     localStorage.removeItem('orderID');
  //   }

  //   history.replace(`/order/${orderID}`, { from: window.location.pathname });
  // }, []);

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

  const location = useLocation();
  const warningMessage = location.state?.warningMessage;
  useEffect(() => {
    if (warningMessage) {
      toast.error(warningMessage, {
        autoClose: 10000,
      });
    }
  }, [warningMessage]);

  const onSubmit = async (values) => {
    setLoading(true);
    await loginUser({
      variables: {
        email: values.email,
        password: values.password,
      },
    });
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().required('Email / Phone number is required'),
    password: Yup.string().min(6, 'Must be at least 6 chars!').required('Password is required'),
  });

  const initialValues = { email: '', password: '' };
  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;
  const [getLoginPageContent, { data: dataLoginPageContent }] = useLazyQuery(LOGIN_PAGE_CONTENT);

  useEffect(() => {
    getLoginPageContent({
      variables: {
        key: 'login-page-content',
      },
    });
  }, []);

  const [LoginWith] = useMutation(LOGIN_WITH, {
    onCompleted: async (res) => {
      localStorage.setItem('token', res.loginWith.token);
      if (res?.loginWith?.refreshToken) {
        localStorage.setItem('refreshToken', res.loginWith.refreshToken);
      }
      dispatch(setCurrentUser(res.loginWith.user));
      if (res?.loginWith?.user?.role?.includes('admin')) {
        history.push('/admin');
      } else if (res?.loginWith?.user?.role?.includes('seller')) {
        history.push('/seller');
      } else {
        history.push('/');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Something went wrong!');
    },
  });

  const responseFacebook = async (values) => {
    try {
      await LoginWith({
        variables: {
          email: values.email,
          firstName: values.name,
        },
      });
    } catch (error) {
      console.error('responseFacebook', error);
    }
  };

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
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="sw-lg-50 px-1">
        <div className="mb-3">
          <h2 className="cta-1 fw-bold mb-0 ">
            <NavLink to="/" className="text-dark">
              Login
            </NavLink>
            <NavLink to="/" className="float-end">
              <img src={faviconData?.getAds?.images} alt="Logo" width="40px" className="border bg-white rounded p-1 me-1" />
            </NavLink>
          </h2>
        </div>
        {warningMessage && <div className="text-danger pb-1">{warningMessage}</div>}
        <div>
          <form id="loginForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
            <div className="mb-3 filled form-group tooltip-end-top">
              <CsLineIcons icon="email" />
              <Form.Control
                type="text"
                className="bg-white border"
                name="email"
                placeholder="Email or Phone Number"
                value={values.email}
                onChange={handleChange}
              />
              {errors.email && touched.email && <div className="d-block  text-danger p-1 ps-1">{errors.email}</div>}
            </div>
            <div className="mb-1 filled form-group tooltip-end-top">
              <CsLineIcons icon="lock-off" />
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                className="bg-white border"
                name="password"
                onChange={handleChange}
                value={values.password}
                placeholder="Password"
              />
              {showPassword ? (
                <i className="bi bi-eye position-absolute show-password e-3" onClick={() => setShowPassword(!showPassword)}></i>
              ) : (
                <i className="bi bi-eye-slash position-absolute show-password e-3" onClick={() => setShowPassword(!showPassword)}></i>
              )}
              {errors.password && touched.password && <div className="d-block  text-danger p-1 ps-1">{errors.password}</div>}
            </div>
            <>{errorMessage && <div className="text-danger">{errorMessage} </div>}</>
            <Row className="position-relative">
              <Col className="mt-2 mb-2">
                <Button size="lg" type="submit" className="btn_color" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Login...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Col>
              <Col className="mt-2 mb-2">
                <NavLink className="position-absolute t-3 e-3 font_color" to="/forgot-password">
                  Forgot?
                </NavLink>
              </Col>
            </Row>
          </form>
          <hr />
          <div className="mb-2 text-center">
            <p className="h6">
              <span className="text-dark">If you are not a member, please</span>{' '}
              <NavLink to="/register" className="fw-bolder font_color">
                Register
              </NavLink>
              .
            </p>
          </div>
          <div className="containerlogin justify-content-center pt-2 w-100">
            {/* <FacebookLogin
              appId={process.env.REACT_APP_FACEBOOK_APP_ID}              
              textButton=""
              fields="name,email,picture"
              callback={responseFacebook}
              cssClass="loginicon loginicon1"
              icon="fa-facebook"
            /> */}
            <button aria-label="Log in with Google" type="button" onClick={handleGoogleLogin}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="loginicon">
                <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z" />
              </svg>
            </button>
          </div>
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

export default Login;
