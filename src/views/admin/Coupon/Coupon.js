import { useMutation, gql } from '@apollo/client';
import React, { useState } from 'react';
import { Button, Row, Col, Card, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { toast } from 'react-toastify';

const CREATE_COUPON = gql`
  mutation CreateCouponCode($couponName: String, $discount: Float, $couponCode: String, $start: String, $active: Boolean, $end: String) {
    createCouponCode(couponName: $couponName, discount: $discount, couponCode: $couponCode, start: $start, active: $active, end: $end) {
      active
      couponCode
      couponName
      discount
      end
      id
      start
    }
  }
`;

function Coupon() {
  const title = 'Add Coupon';
  const description = 'Ecommerce Add Coupon  Page';
  const history = useHistory();
  const [checked, setChecked] = useState(false);
  const [createCoupon, { loading, error, data }] = useMutation(CREATE_COUPON, {
    onCompleted: () => {
      toast.success('Coupon code has been added successfully');
      setTimeout(() => {
        history.push(`/admin/coupon/list`);
      }, [2000]);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  if (error) {
    console.log('ERROR', error.message);
  }

  const onSubmit = (values) => {
    createCoupon({
      variables: {
        couponCode: values.code,
        discount: parseFloat(values.discount, 10),
        couponName: values.name,
        start: values.start,
        end: values.end,
        active: checked,
      },
    });
  };

  const validationSchema = Yup.object().shape({
    code: Yup.string().required('Coupon Code is required'),
    name: Yup.string().required('Coupon Name is required'),
    discount: Yup.string().required('Enter Discount Value'),
  });
  const initialValues = { code: '', name: '', discount: '' };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;
  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link text-dark pb-1 d-inline-block hidden breadcrumb-back" to="/admin/coupon/list">
              <span className="align-middle text-dark ms-1">Coupon List</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <h1 className="mb-0 pb-0 display-6 pb-4 text-center fw-bold" id="title">
        {title}
      </h1>
      <Card className="mb-5">
        <Card.Body>
          <form id="CouponForm" className="tooltip-end-bottom row " onSubmit={handleSubmit}>
            <div className="mb-3 col-12 col-md-6 filled form-group tooltip-end-top">
              <Form.Label className="fs-6 fw-bold text-dark">Coupon Code</Form.Label>
              <Form.Control
                type="text"
                name="code"
                className="bg-white ps-4 border rounded"
                placeholder="Coupon Code"
                value={values.code}
                onChange={handleChange}
              />
              {errors.code && touched.code && <div className="text-danger ps-4 pt-1">{errors.code}</div>}
            </div>
            <div className="mb-3 col-12 col-md-6 filled form-group tooltip-end-top">
              <Form.Label className="fs-6 fw-bold text-dark">Discount</Form.Label>
              <Form.Select name="discount" className="bg-white ps-4 border rounded" value={values.discount} onChange={handleChange}>
                <option value="">Select Discount</option>
                {[...Array(100)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}%
                  </option>
                ))}
              </Form.Select>

              {errors.discount && touched.discount && <div className="text-danger ps-4 pt-1">{errors.discount}</div>}
            </div>
            <div className="mb-3 col-12 col-md-6 filled form-group tooltip-end-top">
              <Form.Label className="fs-6 fw-bold text-dark">Coupon Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                className="bg-white ps-4 border rounded"
                placeholder="Coupon Name"
                value={values.name}
                onChange={handleChange}
              />
              {errors.name && touched.name && <div className="text-danger ps-4 pt-1">{errors.name}</div>}
            </div>
            <div className="mb-3 col-12 col-md-6">
              <Form.Label className="fs-6 fw-bold text-dark">Starting Date</Form.Label>
              <Form.Control type="date" required name="start" className="bg-white ps-4 border rounded" onChange={handleChange} min={today} />
              {errors.start && <div className="text-danger ps-4 pt-1">{errors.start}</div>}
            </div>
            <div className="mb-3">
              <Form.Label className="fs-6 fw-bold text-dark">Ending Date</Form.Label>
              <Form.Control type="date" required name="end" className="bg-white ps-4 border rounded" onChange={handleChange} min={today} />
              {errors.end && <div className="text-danger ps-4 pt-1">{errors.end}</div>}
            </div>
            <div className="text-center">
              <Button type="submit">Create Coupon</Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </>
  );
}

export default Coupon;
