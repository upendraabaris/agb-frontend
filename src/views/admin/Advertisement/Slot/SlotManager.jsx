import React, { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { toast } from 'react-toastify';
import { Modal, Button, Form, Table, Spinner, Pagination } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import BreadcrumbList from 'components/breadcrumb-list/BreadcrumbList';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

// GraphQL Queries and Mutations
const GET_SLOTS = gql`
  query GetSlots {
    slots {
      id
      ad_slot
      ad_type
      position
      slot_number
      is_active
      createdAt
      updatedAt
    }
  }
`;

const CREATE_SLOT = gql`
  mutation CreateSlot($ad_slot: String!, $ad_type: String!, $position: String!, $slot_number: Int!) {
    createSlot(ad_slot: $ad_slot, ad_type: $ad_type, position: $position, slot_number: $slot_number) {
      id
      ad_slot
      ad_type
      position
      slot_number
      is_active
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_SLOT = gql`
  mutation UpdateSlot($id: String!, $ad_slot: String, $ad_type: String, $position: String, $slot_number: Int) {
    updateSlot(id: $id, ad_slot: $ad_slot, ad_type: $ad_type, position: $position, slot_number: $slot_number) {
      id
      ad_slot
      ad_type
      position
      slot_number
      is_active
      createdAt
      updatedAt
    }
  }
`;

const DELETE_SLOT = gql`
  mutation DeleteSlot($id: String!) {
    deleteSlot(id: $id) {
      success
      message
    }
  }
`;

const TOGGLE_SLOT_STATUS = gql`
  mutation ToggleSlotStatus($id: String!) {
    toggleSlotStatus(id: $id) {
      id
      ad_slot
      ad_type
      position
      slot_number
      is_active
      createdAt
      updatedAt
    }
  }
`;

const SlotManager = () => {
  const title = 'Slot Management';
  const description = 'Manage advertising slots';
  const breadcrumbs = [
    { id: '0', name: 'Dashboard', icon: 'home' },
    { id: '1', name: 'Advertisement' },
    { id: '2', name: 'Slots' }
  ];

  
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [formData, setFormData] = useState({
    ad_slot: '',
    ad_type: 'banner',
    position: '',
    slot_number: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // GraphQL Query
  const { data, loading, error, refetch } = useQuery(GET_SLOTS);
  const slots = data?.slots || [];

  // GraphQL Mutations
  const [createSlot] = useMutation(CREATE_SLOT);
  const [updateSlot] = useMutation(UPDATE_SLOT);
  const [deleteSlot] = useMutation(DELETE_SLOT);
  const [toggleSlotStatus] = useMutation(TOGGLE_SLOT_STATUS);

  const handleOpenModal = (slot = null) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        ad_slot: slot.ad_slot,
        ad_type: slot.ad_type,
        position: slot.position,
        slot_number: slot.slot_number
      });
    } else {
      setEditingSlot(null);
      setFormData({
        ad_slot: '',
        ad_type: 'banner',
        position: '',
        slot_number: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSlot(null);
    setFormData({
      ad_slot: '',
      ad_type: 'banner',
      position: '',
      slot_number: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'slot_number' ? parseInt(value, 10) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ad_slot.trim() || !formData.position.trim() || !formData.slot_number) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingSlot) {
        await updateSlot({
          variables: {
            id: editingSlot.id,
            ad_slot: formData.ad_slot,
            ad_type: formData.ad_type,
            position: formData.position,
            slot_number: formData.slot_number
          }
        });
        toast.success('Slot updated successfully');
      } else {
        await createSlot({
          variables: {
            ad_slot: formData.ad_slot,
            ad_type: formData.ad_type,
            position: formData.position,
            slot_number: formData.slot_number
          }
        });
        toast.success('Slot created successfully');
      }
      refetch();
      handleCloseModal();
    } catch (err) {
      toast.error(err.message || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slot?')) {
      try {
        await deleteSlot({
          variables: { id }
        });
        toast.success('Slot deleted successfully');
        refetch();
      } catch (err) {
        toast.error(err.message || 'Failed to delete slot');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleSlotStatus({
        variables: { id }
      });
      toast.success('Slot status updated');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const pageCount = Math.ceil(slots.length / itemsPerPage);
  const displayedSlots = slots.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-wrapper">
        <div className="page-heading d-print-none">
          <BreadcrumbList items={breadcrumbs} />
          <div className="page-title">
            <h1>{title}</h1>
          </div>
        </div>
        <div className="page-body">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Manage Slots</h5>
                <Button variant="primary" onClick={() => handleOpenModal()}>
                  <CsLineIcons icon="plus" /> Add New Slot
                </Button>
              </div>

              {loading && (
                <div className="text-center">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              )}
              {error && (
                <div className="alert alert-danger">Error loading slots: {error.message}</div>
              )}
              {!loading && !error && slots.length === 0 && (
                <div className="alert alert-info">No slots found. Create one to get started!</div>
              )}
              {!loading && !error && slots.length > 0 && (
                <>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Ad Slot</th>
                        <th>Ad Type</th>
                        <th>Position</th>
                        <th>Slot Number</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSlots.map((slot) => (
                        <tr key={slot.id}>
                          <td>{slot.ad_slot}</td>
                          <td>
                            <span className="badge bg-info">{slot.ad_type}</span>
                          </td>
                          <td>{slot.position}</td>
                          <td>{slot.slot_number}</td>
                          <td>
                            <span
                              className={`badge ${slot.is_active ? 'bg-success' : 'bg-danger'}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleToggleStatus(slot.id)}
                            >
                              {slot.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(slot.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleOpenModal(slot)}
                            >
                              <CsLineIcons icon="edit" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(slot.id)}
                            >
                              <CsLineIcons icon="trash" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {pageCount > 1 && (
                    <Pagination>
                      <Pagination.First onClick={() => setCurrentPage(0)} disabled={currentPage === 0} />
                      <Pagination.Prev onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} />
                      {[...Array(pageCount)].map((_, index) => (
                        <Pagination.Item
                          key={index}
                          active={index === currentPage}
                          onClick={() => setCurrentPage(index)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next onClick={() => setCurrentPage(Math.min(pageCount - 1, currentPage + 1))} disabled={currentPage === pageCount - 1} />
                      <Pagination.Last onClick={() => setCurrentPage(pageCount - 1)} disabled={currentPage === pageCount - 1} />
                    </Pagination>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingSlot ? 'Edit Slot' : 'Create New Slot'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Ad Slot Name</Form.Label>
              <Form.Control
                type="text"
                name="ad_slot"
                value={formData.ad_slot}
                onChange={handleInputChange}
                placeholder="e.g., Homepage Banner Top"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ad Type</Form.Label>
              <Form.Select
                name="ad_type"
                value={formData.ad_type}
                onChange={handleInputChange}
              >
                <option value="banner">Banner</option>
                <option value="stamp">Stamp</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Position</Form.Label>
              <Form.Control
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                placeholder="e.g., Top, Bottom, Sidebar"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Slot Number</Form.Label>
              <Form.Control
                type="number"
                name="slot_number"
                value={formData.slot_number}
                onChange={handleInputChange}
                placeholder="1"
                min="1"
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" className="flex-grow-1">
                {editingSlot ? 'Update Slot' : 'Create Slot'}
              </Button>
              <Button variant="secondary" onClick={handleCloseModal} className="flex-grow-1">
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SlotManager;
