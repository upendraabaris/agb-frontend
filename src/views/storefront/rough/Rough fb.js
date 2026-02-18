import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import FacebookLogin from 'react-facebook-login';

const responseFacebook = (response) => {
  console.log('response', response);
};

function Rough() {
  return (
    <>
      <Row>
        <Card.Body>
          <Row className="h-100">
            <Col xs="6" md="3" className="pe-0 d-flex align-items-center">
              <FacebookLogin
                appId="1573909953142833"
                fields="name,email,picture"
                callback={responseFacebook}
                cssClass="my-facebook-button-class"
                icon="fa-facebook"
              />
            </Col>
          </Row>
        </Card.Body>
      </Row>
    </>
  );
}

export default Rough;
