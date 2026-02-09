import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

function MeetTeam() {
  const title = 'Meet our Team Info';
  const description = 'Ecommerce Meet our Team Page';
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState('');

  const CREATE_TEAM = gql`
    mutation CreateMeet($title: String, $file: Upload, $role: String) {
      createMeet(title: $title, file: $file, role: $role) {
        id
        title
        image
        role
      }
    }
  `;

  const [createTeam, { data: dataTeam }] = useMutation(CREATE_TEAM, {
    onCompleted: () => {
      toast(`${dataTeam.createMeet.title}'s information is updated successfully!`);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  function handleTeam() {
    createTeam({
      variables: {
        title: name,
        file: image,
        role: desc,
      },
    });
  }

  const GET_TEAM = gql`
    query GetMeet {
      getMeet {
        id
        title
        image
        role
      }
    }
  `;

  const { data: dataTeam1 } = useQuery(GET_TEAM);
  if (dataTeam1) {
    console.log('dataTeam1', dataTeam1);
  }

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
            {/* Title End */}
          </Col>
        </Row>
      </div>
      <div>
        <Card className="mb-5">
          <Card.Body>
            <div className="mb-3 mx-2">
              <Form.Label>
                {' '}
                <CsLineIcons icon="user" /> Name
              </Form.Label>
              <Form.Control type="text" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-3 mx-2">
              <Form.Label>
                {' '}
                <CsLineIcons icon="content" /> Description
              </Form.Label>
              <Form.Control type="text" onChange={(e) => setDesc(e.target.value)} />
            </div>
            <div className="mb-3 mx-2">
              <Form.Label>
                {' '}
                <CsLineIcons icon="palette" /> Image
              </Form.Label>
              <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} />
            </div>
            <Button onClick={() => handleTeam()}>Save</Button>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}

export default MeetTeam;
