import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { Row, Col, Button, Form, Card, Modal, Table } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const GET_AD_CATEGORY_MASTERS = gql`
  query AdCategoryMasters {
    adCategoryMasters {
      id
      name
      description
      is_active
      createdAt
      updatedAt
    }
  }
`;

const CREATE_AD_CATEGORY_MASTER = gql`
  mutation CreateAdCategoryMaster($input: AdCategoryMasterInput!) {
    createAdCategoryMaster(input: $input) {
      id
      name
      description
      is_active
    }
  }
`;

const UPDATE_AD_CATEGORY_MASTER = gql`
  mutation UpdateAdCategoryMaster($id: ID!, $input: AdCategoryMasterInput!) {
    updateAdCategoryMaster(id: $id, input: $input) {
      id
      name
      description
      is_active
    }
  }
`;

const DELETE_AD_CATEGORY_MASTER = gql`
  mutation DeleteAdCategoryMaster($id: ID!) {
    deleteAdCategoryMaster(id: $id) {
      success
      message
    }
  }
`;

const TOGGLE_AD_CATEGORY_MASTER = gql`
  mutation ToggleAdCategoryMasterStatus($id: ID!) {
    toggleAdCategoryMasterStatus(id: $id) {
      id
      is_active
    }
  }
`;

const AdCategoryMasterManager = () => {
  const title = 'Ad Category Master';
  const description = 'Manage Ad Category Masters';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { loading, error, data, refetch } = useQuery(GET_AD_CATEGORY_MASTERS);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({ name: '', description: '', is_active: true });

  const [createAdCategoryMaster] = useMutation(CREATE_AD_CATEGORY_MASTER, {
    onCompleted: () => {
      toast.success('Category Master created successfully');
      refetch();
      setShowCreate(false);
      setForm({ name: '', description: '', is_active: true });
    },
    onError: (err) => toast.error(err.message || 'Failed to create category master'),
  });

  const [updateAdCategoryMaster] = useMutation(UPDATE_AD_CATEGORY_MASTER, {
    onCompleted: () => {
      toast.success('Category Master updated successfully');
      refetch();
      setShowEdit(false);
      setEditing(null);
      setForm({ name: '', description: '', is_active: true });
    },
    onError: (err) => toast.error(err.message || 'Failed to update category master'),
  });

  const [deleteAdCategoryMaster] = useMutation(DELETE_AD_CATEGORY_MASTER, {
    onCompleted: () => {
      toast.success('Category Master deleted successfully');
      refetch();
    },
    onError: (err) => toast.error(err.message || 'Failed to delete category master'),
  });

  const [toggleAdCategoryMaster] = useMutation(TOGGLE_AD_CATEGORY_MASTER, {
    onCompleted: () => {
      toast.success('Category Master status toggled');
      refetch();
    },
    onError: (err) => toast.error(err.message || 'Failed to toggle status'),
  });

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        description: editing.description,
        is_active: editing.is_active,
      });
    }
  }, [editing]);

  if (error) {
    console.error('GET_AD_CATEGORY_MASTERS', error);
    toast.error(error.message || 'Something went wrong!');
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      toast.error('All fields required');
      return;
    }
    await createAdCategoryMaster({ variables: { input: form } });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description) {
      toast.error('All fields required');
      return;
    }
    await updateAdCategoryMaster({ variables: { id: editing.id, input: form } });
  };

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
          <Col className="col-auto mb-3 mb-sm-0">
            <Button onClick={() => setShowCreate(true)}>
              <CsLineIcons icon="plus" /> Add Category Master
            </Button>
          </Col>
        </Row>
      </div>
      <Card>
        <Card.Body>
          {loading && <div className="text-center">Loading...</div>}
          {error && <div className="alert alert-danger">Error loading data</div>}
          {!loading && !error && (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Active</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.adCategoryMasters.map((master) => (
                    <tr key={master.id}>
                      <td>{master.name}</td>
                      <td>{master.description}</td>
                      <td>{master.is_active ? 'Yes' : 'No'}</td>
                      <td>{new Date(master.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setEditing(master);
                            setShowEdit(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-2"
                          onClick={() => toggleAdCategoryMaster({ variables: { id: master.id } })}
                        >
                          Toggle
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('Are you sure?')) {
                              deleteAdCategoryMaster({ variables: { id: master.id } });
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Category Master</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter category master name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
            </Form.Group>
            <Button type="submit">Create</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Category Master</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter category master name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Enter description"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
            </Form.Group>
            <Button type="submit">Save</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdCategoryMasterManager;
