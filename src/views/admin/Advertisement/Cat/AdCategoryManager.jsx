import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { Row, Col, Button, Form, Card, Modal, Table } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const GET_AD_CATEGORIES = gql`
  query AdCategories {
    adCategories {
      id
      name
      price
      priority
      duration_days
      is_active
      createdAt
      updatedAt
    }
  }
`;

const CREATE_AD_CATEGORY = gql`
  mutation CreateAdCategory($input: AdCategoryInput!) {
    createAdCategory(input: $input) {
      id
      name
      price
      priority
      duration_days
      is_active
    }
  }
`;

const UPDATE_AD_CATEGORY = gql`
  mutation UpdateAdCategory($id: ID!, $input: AdCategoryInput!) {
    updateAdCategory(id: $id, input: $input) {
      id
      name
      price
      priority
      duration_days
      is_active
    }
  }
`;

const DELETE_AD_CATEGORY = gql`
  mutation DeleteAdCategory($id: ID!) {
    deleteAdCategory(id: $id) {
      success
      message
    }
  }
`;

const TOGGLE_AD_CATEGORY = gql`
  mutation ToggleAdCategoryStatus($id: ID!) {
    toggleAdCategoryStatus(id: $id) {
      id
      is_active
    }
  }
`;

const AdCategoryManager = () => {
  const title = 'Ads Categories';
  const description = 'Manage Ads Categories';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const { loading, error, data, refetch } = useQuery(GET_AD_CATEGORIES);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({ name: '', price: '', priority: 0, duration_days: 30, is_active: true });

  const [createAdCategory] = useMutation(CREATE_AD_CATEGORY, {
    onCompleted: () => {
      toast.success('Ad category created');
      setShowCreate(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to create');
    },
  });

  const [updateAdCategory] = useMutation(UPDATE_AD_CATEGORY, {
    onCompleted: () => {
      toast.success('Ad category updated');
      setShowEdit(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update');
    },
  });

  const [deleteAdCategory] = useMutation(DELETE_AD_CATEGORY, {
    onCompleted: (res) => {
      if (res.deleteAdCategory && res.deleteAdCategory.success) {
        toast.success(res.deleteAdCategory.message || 'Deleted');
        refetch();
      } else {
        toast.error(res.deleteAdCategory.message || 'Delete failed');
      }
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to delete');
    },
  });

  const [toggleAdCategoryStatus] = useMutation(TOGGLE_AD_CATEGORY, {
    onCompleted: () => {
      toast.success('Status updated');
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to toggle status');
    },
  });

  useEffect(() => {
    if (!showCreate) {
      setForm({ name: '', ad_slot: '', ad_type: 'banner', position: '', slot_number: 0, price: '', priority: 0, duration_days: 30, is_active: true });
    }
  }, [showCreate]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        ad_slot: editing.ad_slot,
        ad_type: editing.ad_type,
        position: editing.position,
        slot_number: editing.slot_number,
        price: editing.price,
        priority: editing.priority,
        duration_days: editing.duration_days,
        is_active: editing.is_active,
      });
    }
  }, [editing]);

  if (error) {
    console.error('GET_AD_CATEGORIES', error);
    toast.error(error.message || 'Something went wrong!');
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.priority || !form.duration_days) {
      toast.error('All fields required');
      return;
    }
    await createAdCategory({ variables: { input: { ...form, price: parseFloat(form.price), priority: parseInt(form.priority, 10), duration_days: parseInt(form.duration_days, 10) } } });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.priority || !form.duration_days) {
      toast.error('All fields required');
      return;
    }
    await updateAdCategory({ variables: { id: editing.id, input: { ...form, price: parseFloat(form.price), priority: parseInt(form.priority, 10), duration_days: parseInt(form.duration_days, 10) } } });
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
              <CsLineIcons icon="plus" /> Add Ad Category
            </Button>
          </Col>
        </Row>
      </div>

      <Card className="mb-5">
        <Card.Body>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Priority</th>
                  <th>Duration (days)</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.adCategories.map((cat) => (
                    <tr key={cat.id}>
                      <td>{cat.name}</td>
                      <td>{cat.price}</td>
                      <td>{cat.priority}</td>
                      <td>{cat.duration_days}</td>
                      <td>{cat.is_active ? 'Yes' : 'No'}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => { setEditing(cat); setShowEdit(true); }}>
                          Edit
                        </Button>
                        <Button variant="outline-warning" size="sm" className="me-2" onClick={() => toggleAdCategoryStatus({ variables: { id: cat.id } })}>
                          Toggle
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => deleteAdCategory({ variables: { id: cat.id } })}>
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
          <Modal.Title>Create Ad Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter category name" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Control type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duration (days)</Form.Label>
              <Form.Control type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            </Form.Group>
            <Button type="submit">Create</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Ad Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEdit}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter category name" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ad Slot</Form.Label>
              <Form.Control type="text" value={form.ad_slot} onChange={(e) => setForm({ ...form, ad_slot: e.target.value })} placeholder="Enter ad slot" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ad Type</Form.Label>
              <Form.Select value={form.ad_type} onChange={(e) => setForm({ ...form, ad_type: e.target.value })}>
                <option value="">Select Ad Type</option>
                <option value="banner">Banner</option>
                <option value="stamp">Stamp</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Enter position" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Slot Number</Form.Label>
              <Form.Control type="number" value={form.slot_number} onChange={(e) => setForm({ ...form, slot_number: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Control type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duration (days)</Form.Label>
              <Form.Control type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" label="Active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            </Form.Group>
            <Button type="submit">Save</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AdCategoryManager;
