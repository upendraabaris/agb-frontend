import React, { useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Button, Form, Spinner } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import LayoutFullpage from 'layout/LayoutFullpage';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useMutation } from '@apollo/client';
import HtmlHead from 'components/html-head/HtmlHead';
import { toast } from 'react-toastify';

const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

const ResetPassword = ({ history }) => {
  const title = 'Reset Password';
  const description = 'Reset Password Page';
  const [token1, setToken1] = useState('');
  const [loading, setLoading] = useState(false);

  const [ResetPassword1] = useMutation(RESET_PASSWORD, {
    onCompleted: (res) => {
      if (res.resetPassword) {
        setLoading(false);
        toast.success('Password reset successfully. Please log in.', {
          autoClose: 6000,
        });
        setTimeout(() => {
          history.push('/login');
        }, 6000);
      }
    },
    onError: (error) => {
      setLoading(false);
      toast.error(error.message || 'Something Went Wrong !');
    },
  });

  const validationSchema = Yup.object().shape({
    password: Yup.string().min(6, 'Must be at least 6 chars!').required('Password is required'),
    passwordConfirm: Yup.string()
      .required('Password Confirm is required')
      .oneOf([Yup.ref('password'), null], 'Must be same with password!'),
  });
  const initialValues = { password: '', passwordConfirm: '' };
  const onSubmit = async (values) => {
    setLoading(true);
    await ResetPassword1({
      variables: {
        token: token1,
        newPassword: values.password,
      },
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mailToken = urlParams.get('token');
    setToken1(mailToken);
  }, []);

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;
  const leftSide = (
    <div className="min-h-100 d-flex align-items-center">
      <img src="/img/forgot/forgot.png" className="my-image" alt="logo" />
    </div>
  );

  const rightSide = (
    <div className="sw-lg-70 min-h-100 bg-foreground d-flex justify-content-center align-items-center shadow-deep py-5 full-page-content-right-border">
      <div className="sw-lg-50 px-5">
        <div className="mb-5">
          <h2 className="cta-1 mb-0 text-dark fw-bold">Reset password</h2>
        </div>
        <div>
          <form id="resetForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
            <div className="mb-3 filled">
              <CsLineIcons icon="lock-off" />
              <Form.Control type="password" name="password" onChange={handleChange} value={values.password} placeholder="New password" />
              {errors.password && touched.password && <div className="d-block invalid-tooltip">{errors.password}</div>}
            </div>
            <div className="mb-3 filled">
              <CsLineIcons icon="lock-on" />
              <Form.Control type="password" name="passwordConfirm" onChange={handleChange} value={values.passwordConfirm} placeholder="Confirm new password" />
              {errors.passwordConfirm && touched.passwordConfirm && <div className="d-block invalid-tooltip">{errors.passwordConfirm}</div>}
            </div>
            <Button size="lg" type="submit" disabled={loading}>
              {loading ? ( // Show spinner if loading
                <>
                  <Spinner animation="border" size="sm" /> Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <HtmlHead title={title} description={description} />
      <LayoutFullpage left={leftSide} right={rightSide} />
    </>
  );
};

export default withRouter(ResetPassword);
