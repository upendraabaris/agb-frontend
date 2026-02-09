import React, { useMemo, useRef, useState, useEffect } from 'react';
import EmailEditor from 'react-email-editor';
import { Row, Col, Button, Form, Dropdown, Card, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink, useParams, withRouter } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_EMAIL = gql`
  query GetEmailTemp($getEmailTempId: ID!) {
    getEmailTemp(id: $getEmailTempId) {
      id
      title
      design
      html
    }
  }
`;

const UPDATE_EMAIL_TEMPLETE = gql`
  mutation UpdateEmailTemp($updateEmailTempId: ID!, $html: String!, $design: String!, $title: String) {
    updateEmailTemp(id: $updateEmailTempId, html: $html, design: $design, title: $title) {
      id
    }
  }
`;

const DetailEmail = ({ history }) => {
  const { emailId } = useParams();
  const title = 'Edit Email Template';
  const description = 'Ecommerce Edit Email Template Page';
  const [editTemplete, setEdittemplete] = useState('');

  const [mailHtml, setMailHtml] = useState('');

  const [mailTitle, setMailTitle] = useState('');

  const [mailDesign, setMailDesign] = useState('');

  const [modalView, setModalView] = useState(false);

  const emailEditorRef = useRef(null);

  const { error, data, loading } = useQuery(GET_EMAIL, {
    variables: { getEmailTempId: emailId },
  });

  const fetchemailTemplete = () => {
    if (data) {
      setEdittemplete(data.getEmailTemp);
    }
    if (error) {
      console.log('GET_EMAIL', error);
    }
  };

  useEffect(() => {
    fetchemailTemplete();
  }, [data, error, loading]);

  // UPDATE EMAIL TEMPLETE

  const [UpdateEmailTemp] = useMutation(UPDATE_EMAIL_TEMPLETE, {
    onCompleted: () => {
      setModalView(false);
      toast.success('Email Temp Updated successfull!');

      setMailTitle('');
      setMailDesign('');
      setMailHtml('');
      setTimeout(() => {
        history.push('/admin/email/list');
      }, 2000);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const exportHtml = async () => {
    await emailEditorRef.current.editor.exportHtml(({ design, html }) => {
      if (design) {
        setMailDesign(JSON.stringify(design));
      }
      if (html) {
        setMailHtml(html);
      }
    });
  };
  const confirmSaveTemplete = async () => {
    if (mailDesign && mailHtml && emailId && mailTitle) {
      await UpdateEmailTemp({
        variables: {
          updateEmailTempId: emailId,
          title: mailTitle,
          design: mailDesign,
          html: mailHtml,
        },
      });
    } else {
      toast.error('All Filed are Mandetory !');
    }
  };

  const onReady = () => {
    if (editTemplete.design) {
      emailEditorRef.current.editor.loadDesign(JSON.parse(editTemplete.design));
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="text-dark pb-1 d-inline-block hidden" to="/admin/dashboard">
              <span className="align-middle ms-1">Dashboard</span>
            </NavLink>
            <span className="p-1"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/siteContent/email">
              <span className="align-middle text-dark ms-1">Email</span>
            </NavLink>
            <h1 className="mb-0 fw-bold pb-0 display-4" id="title">{title}</h1>
          </Col>
          {/* Title End */}

          {/* Top Buttons Start */}
          <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            {/* <Button variant="outline-primary" className="btn-icon btn-icon-only ms-1">
              <CsLineIcons icon="save" />
            </Button> */}
            <div className="btn-group ms-1 w-100 w-sm-auto">
              <Button
                onClick={() => {
                  setModalView(true);
                  exportHtml();
                }}
                variant="outline-primary"
                className="btn-icon btn-icon-start w-100 w-sm-auto"
              >
                <CsLineIcons icon="send" />
                <span>Publish</span>
              </Button>
            </div>
          </Col>
          {/* Top Buttons End */}
        </Row>
      </div>
      <Row>
        <Col xl="8">
          {/* Product Info Start */}
          <h2 className="small-title">{title}</h2>
        </Col>
      </Row>
      <Card className="mb-5">
        <Card.Body>
          <div className="mb-3 filled">
            <CsLineIcons icon="home" />
            {editTemplete && (
              <Form.Control type="text" name="title" placeholder="Title" defaultValue={editTemplete.title} onChange={(e) => setMailTitle(e.target.value)} />
            )}
          </div>
          <EmailEditor ref={emailEditorRef} onReady={onReady} />
        </Card.Body>
      </Card>

      {/* modal starts  for update email templete  */}
      <Modal show={modalView} onHide={() => setModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Email Templete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you really want to Update ?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setModalView(false);
            }}
          >
            No, I don't want
          </Button>
          <Button variant="primary" onClick={() => confirmSaveTemplete()}>
            Yes, I want
          </Button>
        </Modal.Footer>
      </Modal>
      {/* modal ends for update email templete  */}
    </>
  );
};

export default withRouter(DetailEmail);
