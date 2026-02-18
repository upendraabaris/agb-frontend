import React, { useEffect, useState } from 'react';
import { NavLink, useHistory  } from 'react-router-dom';
import { Button, Form, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import LayoutFullpage from 'layout/LayoutFullpage';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { useMutation, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import './forgotPassword.css';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const ForgotPassword = () => {
  const title = 'Forgot Password';
  const description = 'Forgot Password Page';
  const { dataStoreFeatures1 } = useGlobleContext();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const FORGOT_PASSWORD = gql`
    mutation RequestPasswordReset($email: String!) {
      requestPasswordReset(email: $email)
    }
  `;
  const [RequestPasswordReset] = useMutation(FORGOT_PASSWORD, {
    onCompleted: () => {
      toast.success('Successfully! Check your email to reset your password.', {
        autoClose: 6000,
      });
      setTimeout(() => {
        history.push('/');
      }, 6000);
    },
    onError: (err) => {
      setLoading(false);
      toast.error(err.message || 'Something went wrong!');
    },
  });
  const validationSchema = Yup.object().shape({
    email: Yup.string().email().required('Email is required'),
  });
  const initialValues = { email: '' };
  const onSubmit = async (values, { resetForm }) => {
    setLoading(true);
    await RequestPasswordReset({
      variables: {
        email: values.email,
      },
    });
    resetForm(initialValues);
  };
 
  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;
  const leftSide = (
    <div className="min-h-100 d-flex align-items-center">
      <div className="w-100">
        <div className="mb-5 d-flex">
          <img src="/img/forgot/forgot.png" className="my-image" alt="logo" />
        </div>
      </div>
    </div>
  );
  const rightSide = (
    <div className="sw-lg-70 min-h-100 bg-foreground d-flex justify-content-center align-items-center shadow-deep py-5 full-page-content-right-border">
      <div className="sw-lg-50 px-5">
        <div className="mb-5">
          <h2 className="cta-1 mb-0 text-dark fw-bold">Forgot Your Password ?</h2>
        </div>
        <div>
          <form className="tooltip-end-bottom" onSubmit={handleSubmit}>
            <div className="mb-3 filled form-group tooltip-end-top">
              <CsLineIcons icon="email" />
              <Form.Control type="text" name="email"   className='bg-white border' placeholder="Email" value={values.email} onChange={handleChange} />
              {errors.email && touched.email && <div className=" alert p-2 alert-danger">{errors.email}</div>}
            </div>
            {/* <Button className='btn_color' size="lg" type="submit">
              Reset my password
            </Button> */}
            <Button size="lg" type="submit" disabled={loading}>
              {loading ? ( // Show spinner if loading
                <>
                  <Spinner animation="border" size="sm" /> Resetting...
                </>
              ) : (
                'Reset my password'
              )}
            </Button>
          </form>
        </div>
        <p className="h6 pt-6 text-dark">
          Dont't have an account ?{' '}
          <NavLink to="/register" className="fw-bolder font_color">
            Register
          </NavLink>          
        </p>
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
export default ForgotPassword;