import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Row, Col, Button, Form } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const CREATE_ENQUIRY = gql`
  mutation Mutation($userId: ID!, $message: String!, $active: Boolean, $types: [String]) {
    createEnquery(userId: $userId, message: $message, active: $active, types: $types) {
      id
      active
      types
      message
    }
  }
`;

function DetailEnquire() {
  const title = 'Detail Enquire';
  const description = 'Detail Enquire Page';
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const user = '643fc5eda48fa2fbfd57b775';
  const [createEnquiry] = useMutation(CREATE_ENQUIRY);
  function handleSubmit() {
    createEnquiry({
      variables: {
        message,
        types: type,
        active: checked,
        userId: user,
      },
    });
    setMessage('');
    setChecked(false);
    setType('');
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>
      <h2 className="small-title">{title}</h2>
      <div>
        <Form id="formEnquiry" className="tooltip-end-bottom" onSubmit={() => handleSubmit()}>
          <div className="mb-3 form-group tooltip-end-top">
            <Form.Control id="EnquiryMessage" as="textarea" rows={4} type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="mb-3 filled form-group tooltip-end-top">
            <Form.Select id="EnquirySelect" onChange={(event) => setType(event.target.value)} aria-label="Default select example">
              <option>Enquire on...</option>
              <option value="order_enquery">Order</option>
              <option value="product_enquery">Product</option>
              <option value="other">Other</option>
            </Form.Select>
          </div>
          <div className="mb-3 filled form-group tooltip-end-top">
            <Row>
              <Col lg="2">
                <Form.Label htmlFor="EnquiryCheck">Active</Form.Label>
              </Col>
              <Col lg="1">
                <Form.Check id="EnquiryCheck" className="form-check" type="checkbox" onChange={(e) => setChecked(e.currentTarget.checked)} value={checked} />
              </Col>
            </Row>
          </div>
          <div className="mb-3 filled form-group tooltip-end-top">
            <Button type="submit">Submit</Button>
          </div>
        </Form>
      </div>      
    </>
  );
}

export default DetailEnquire;
