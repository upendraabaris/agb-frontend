import React, { useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import ItemCounter from './ItemCounter';

function Quantity({ min, max }) {
  const [formvalue, setformvalue] = useState(0);
  useEffect(() => {
    console.log('formvalue');
  }, [formvalue]);

  return (
    <>
      {/* <Row>
      <Card.Body>
        <Row className="h-100">
          <Col xs="6" md="3" className="pe-0 d-flex align-items-center"> */}
      <ItemCounter defVal="4" setformvalue={setformvalue} />
      {/* </Col>
        </Row>
      </Card.Body>
    </Row> */}
    </>
  );
}

export default Quantity;
