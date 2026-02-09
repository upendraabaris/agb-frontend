import { React, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { NavLink, withRouter } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Row, Col, Button, Card, Modal } from 'react-bootstrap';

const GET_EMAIL = gql`
  query GetAllEmailTemp {
    getAllEmailTemp {
      id
      title
      html
      design
    }
  }
`;

const DELETE_EMAIL = gql`
  mutation DeleteEmailTemp($deleteEmailTempId: ID!) {
    deleteEmailTemp(id: $deleteEmailTempId) {
      id
      title
    }
  }
`;

function ListEmail({ history }) {
  const title = 'List Email Templete';
  const description = 'List Email Templete Page';

  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteTitle, setTitleDelete] = useState('');

  const { error, data, refetch } = useQuery(GET_EMAIL);

  if (error) {
    console.log(`GET_EMAIL : ${error.message}`);
  }

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle edit function
  function handleEdit(editId) {
    history.push(`/admin/email/edit/${editId}`);
  }
  // Delete Email

  const [DeleteEmailTemp] = useMutation(DELETE_EMAIL, {
    onCompleted: () => {
      toast('deleted successfully !');
      setDeleteModalView(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
      console.error('DELETE_EMAIL', err);
    },
  });

  function handleDelete(event, event2) {
    setDeleteModalView(true);
    setDeleteId(event);
    setTitleDelete(event2);
  }

  const deleteTempleteConfirm = async () => {
    await DeleteEmailTemp({
      variables: {
        deleteEmailTempId: deleteId,
      },
    });
  };

  function handleClick() {
    history.push(`/admin/email/add`);
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
          </Col>
          <Col xs="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button variant="outline-primary" onClick={() => handleClick()} className="btn-icon btn-icon-start ms-0 ms-sm-1 w-100 w-md-auto">
              <span>Add New Email</span>
            </Button>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <h2 className="small-title">{title}</h2>

      {data &&
        data.getAllEmailTemp.map((getAllEmailTemp) => {
          // const message = getAllEmailTemp.message;
          return (
            <div key={getAllEmailTemp.id}>
              <Row>
                <Col xl="12">
                  <Card className="mb-5">
                    <Card.Body>
                      <Row>
                        <div className="mb-3 col-11">
                          <div className="text-alternate fs-4">{getAllEmailTemp.title}</div>
                          {/*  eslint-disable-next-line react/no-danger */}
                          <div className="fs-6" dangerouslySetInnerHTML={{ __html: getAllEmailTemp.html }}>
                            {/* {getAllEmailTemp.massege} */}
                          </div>
                        </div>
                        <div className="col-1">
                          <Button variant="outline-primary" className="mb-2 btn-icon btn-icon-only" onClick={() => handleEdit(getAllEmailTemp.id)}>
                            <CsLineIcons icon="edit-square" />
                          </Button>
                          <Button
                            variant="outline-primary"
                            className="mt-2 btn-icon btn-icon-only"
                            onClick={() => handleDelete(getAllEmailTemp.id, getAllEmailTemp.title)}
                          >
                            <CsLineIcons icon="bin" />
                          </Button>
                        </div>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          );
        })}
      {/* Delete Email Modal Starts */}
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Email Templete </Modal.Title>
        </Modal.Header>

        {deleteTitle && <Modal.Body>Are you sure you want to delete {deleteTitle} ?</Modal.Body>}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
            No, Go Back!
          </Button>
          <Button variant="primary" onClick={() => deleteTempleteConfirm()}>
            Yes, Continue!
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Delete Email Modal Ends */}
    </>
  );
}
export default withRouter(ListEmail);
