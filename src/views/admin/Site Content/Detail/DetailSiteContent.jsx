import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Row, Col, Form, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { NavLink } from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';

function DetailSiteContent() {
  const title = 'Gift Offer';
  const description = 'Ecommerce Gift Offer Page';

  const GIFT_TOKEN = gql`
    mutation CreateGift_token($user: ID!, $title: String!, $discription: String!) {
      createGift_token(user: $user, title: $title, discription: $discription) {
        title
        discription
        id
      }
    }
  `;

  const [createGift] = useMutation(GIFT_TOKEN);

  const onSubmit = (values) => {
    createGift({
      variables: {
        user: '643e477fc4c40564b39705a0',
        title: values.title,
        discription: values.desc,
      },
    });
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Enter Title'),
    desc: Yup.string().required('Enter Description'),
  });
  const initialValues = { title: '', desc: '' };
  // const onSubmit = (values) => console.log('submit form', values);

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleSubmit, handleChange, values, touched, errors } = formik;

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <Row>
        <Col xl="8">
          {/* Product Info Start */}
          <h2 className="small-title">{title}</h2>

          <Card className="mb-5">
            <Card.Body>
              <form id="sellerForm" className="tooltip-end-bottom" onSubmit={handleSubmit}>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="home" />
                  <Form.Control type="text" name="title" onChange={handleChange} placeholder="Enter Title" value={values.title} />
                  {errors.title && touched.title && <div className="d-block invalid-tooltip">{errors.title}</div>}
                </div>
                <div className="mb-3 filled form-group tooltip-end-top">
                  <CsLineIcons icon="home" />
                  <Form.Control type="text" name="desc" onChange={handleChange} placeholder="Enter Description" value={values.desc} />
                  {errors.desc && touched.desc && <div className="d-block invalid-tooltip">{errors.desc}</div>}
                </div>
                <div className="text-center">
                  <button className="btn btn-primary btn-lg" type="submit">
                    Submit
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
export default DetailSiteContent;
