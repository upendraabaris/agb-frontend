import { useMutation, gql } from '@apollo/client';
import React, { useState } from 'react';
import { Button, Row, Col, Card, Form } from 'react-bootstrap';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { toast } from 'react-toastify';

const CREATE_COUPON = gql`
  mutation CreateCouponCode(
    $couponName: String
    $discount: Float
    $couponCode: String
    $start: String
    $active: Boolean
    $end: String
    $couponType: String
    $discountType: String
    $maxUses: Int
    $perUserLimit: Int
    $minOrderAmount: Float
  ) {
    createCouponCode(
      couponName: $couponName
      discount: $discount
      couponCode: $couponCode
      start: $start
      active: $active
      end: $end
      couponType: $couponType
      discountType: $discountType
      maxUses: $maxUses
      perUserLimit: $perUserLimit
      minOrderAmount: $minOrderAmount
    ) {
      active
      couponCode
      couponName
      discount
      end
      id
      start
      couponType
      discountType
      maxUses
      perUserLimit
      minOrderAmount
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
        couponType: values.couponType || 'product',
        discountType: values.discountType || 'percentage',
        maxUses: values.maxUses ? parseInt(values.maxUses, 10) : null,
        perUserLimit: values.perUserLimit ? parseInt(values.perUserLimit, 10) : 1,
        minOrderAmount: values.minOrderAmount ? parseFloat(values.minOrderAmount) : 0,
      },
    });
  };

  const validationSchema = Yup.object().shape({
    code: Yup.string().required('Coupon Code is required'),
    name: Yup.string().required('Coupon Name is required'),
    discount: Yup.string().required('Enter Discount Value'),
  });
  const initialValues = { code: '', name: '', discount: '', couponType: 'product', discountType: 'percentage', maxUses: '', perUserLimit: '1', minOrderAmount: '' };

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
              <Form.Label className="fs-6 fw-bold text-dark">Coupon Type</Form.Label>
              <Form.Select name="couponType" className="bg-white ps-4 border rounded" value={values.couponType} onChange={handleChange}>
                <option value="product">Product</option>
                <option value="ad">Advertisement</option>
              </Form.Select>
            </div>
            <div className="mb-3 col-12 col-md-6 filled form-group tooltip-end-top">
              <Form.Label className="fs-6 fw-bold text-dark">Discount Type</Form.Label>
              <Form.Select name="discountType" className="bg-white ps-4 border rounded" value={values.discountType} onChange={handleChange}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </Form.Select>
            </div>
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
              <Form.Label className="fs-6 fw-bold text-dark">{values.discountType === 'flat' ? 'Discount Amount (₹)' : 'Discount (%)'}</Form.Label>
              {values.discountType === 'flat' ? (
                <Form.Control
                  type="number"
                  name="discount"
                  className="bg-white ps-4 border rounded"
                  placeholder="Enter flat discount amount"
                  value={values.discount}
                  onChange={handleChange}
                  min="1"
                />
              ) : (
                <Form.Select name="discount" className="bg-white ps-4 border rounded" value={values.discount} onChange={handleChange}>
                  <option value="">Select Discount</option>
                  {[...Array(100)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}%
                    </option>
                  ))}
                </Form.Select>
              )}
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
            <div className="mb-3 col-12 col-md-4 filled form-group tooltip-end-top">
              <Form.Label className="fs-6 fw-bold text-dark">Max Uses (Total)</Form.Label>
              <Form.Control
                type="number"
                name="maxUses"
                className="bg-white ps-4 border rounded"
                placeholder="Leave empty for unlimited"
                value={values.maxUses}
                onChange={handleChange}
                min="1"
              />
            </div>
            <div className="mb-3 col-12 col-md-4 filled form-group tooltip-end-top">
              <Form.Label className="fs-6 fw-bold text-dark">Per User Limit</Form.Label>
              <Form.Control
                type="number"
                name="perUserLimit"
                className="bg-white ps-4 border rounded"
                placeholder="1"
                value={values.perUserLimit}
                onChange={handleChange}
                min="1"
              />
            </div>
            <div className="mb-3 col-12 col-md-4 filled form-group tooltip-end-top">
              <Form.Label className="fs-6 fw-bold text-dark">Min Order Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                name="minOrderAmount"
                className="bg-white ps-4 border rounded"
                placeholder="0"
                value={values.minOrderAmount}
                onChange={handleChange}
                min="0"
              />
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
