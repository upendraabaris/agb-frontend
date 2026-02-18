import React, { useRef, useState } from 'react';
import EmailEditor from 'react-email-editor';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink, withRouter } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { toast } from 'react-toastify';
import { Row, Col, Button, Form, Card, Modal } from 'react-bootstrap';
import { gql, useMutation } from '@apollo/client';

const CREATE_EMAIL_TEMPLETE = gql`
  mutation CreateEmailTemp($html: String!, $design: String!, $title: String!) {
    createEmailTemp(html: $html, design: $design, title: $title) {
      id
      title
    }
  }
`;

const AddNewEmail = ({ history }) => {
  const title = 'Add Email Template';
  const description = 'Ecommerce Add Email Template Page';

  const emailEditorRef = useRef(null);

  const [modalView, setModalView] = useState(false);

  const [mailDesign, setMailDesign] = useState('');

  const [mailTitle, setMailTitle] = useState('');

  const [mailHtml, setMailHtml] = useState('');

  const [CreateEmailTemp] = useMutation(CREATE_EMAIL_TEMPLETE, {
    onCompleted: () => {
      setModalView(false);
      toast.success(' Email templete created successfull!');
      setMailHtml('');
      setMailTitle('');
      setMailDesign('');
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
    if (mailDesign && mailHtml && mailTitle) {
      await CreateEmailTemp({
        variables: {
          title: mailTitle,
          design: mailDesign,
          html: mailHtml,
        },
      });
    } else {
      toast.error('All Filed are Mandetory !');
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
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
            <Form.Control type="text" name="title" value={mailTitle} placeholder="Title" onChange={(e) => setMailTitle(e.target.value)} />
          </div>
          <EmailEditor ref={emailEditorRef} />
        </Card.Body>
      </Card>

      <Modal show={modalView} onHide={() => setModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Publish Email Templete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Do you really want to Publish?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setModalView(false);
            }}
          >
            No, Go back
          </Button>
          <Button variant="primary" onClick={() => confirmSaveTemplete()}>
            Yes, Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
export default withRouter(AddNewEmail);
