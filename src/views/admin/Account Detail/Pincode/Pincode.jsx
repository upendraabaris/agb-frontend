
/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */

import React, { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Row, Col, Button, Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

// Define the GraphQL mutations
const CREATE_STATE_MUTATION = gql`
  mutation CreateState($state: String!, $pincode: [Int]!) {
    createState(state: $state, pincode: $pincode) {
      id
      state
      pincode
    }
  }
`;

const UPDATE_STATE_MUTATION = gql`
  mutation UpdateState($updateStateId: ID!, $state: String, $pincode: [Int]) {
    updateState(id: $updateStateId, state: $state, pincode: $pincode) {
      id
      state
      pincode
    }
  }
`;

const DELETE_STATE_MUTATION = gql`
  mutation DeleteState($deleteStateId: ID!) {
    deleteState(id: $deleteStateId) {
      id
      state
      pincode
    }
  }
`;

// Define the GraphQL query to fetch states and pincodes
const GET_STATES_QUERY = gql`
  query GetAllStates {
    getAllStates {
      id
      state
      pincode
    }
  }
`;

const Pincode = () => {
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedState, setSelectedState] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stateToDelete, setStateToDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});

  const { data, loading, error, refetch } = useQuery(GET_STATES_QUERY);
  const [createState] = useMutation(CREATE_STATE_MUTATION);
  const [updateState] = useMutation(UPDATE_STATE_MUTATION);
  const [deleteState] = useMutation(DELETE_STATE_MUTATION);

  const [expandedStates, setExpandedStates] = useState({});

  const toggleExpand = (stateId) => {
    setExpandedStates(prev => ({
      ...prev,
      [stateId]: !prev[stateId]
    }));
  };

  const validate = () => {
    const errors = {};
    if (!stateName) errors.stateName = 'State name is required';
    if (!pincode) errors.pincode = 'Pincode is required';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await createState({ variables: { state: stateName, pincode: pincode.split(',').map(Number) } });
      toast.success('State and Pincode added successfully');
      refetch();
      setStateName('');
      setPincode('');
      setErrors({});
    } catch (error) {
      toast.error('Error adding state and pincode');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await updateState({ variables: { updateStateId: selectedState.id, state: stateName, pincode: pincode.split(',').map(Number) } });
      toast.success('State and Pincode updated successfully');
      refetch();
      setStateName('');
      setPincode('');
      setEditMode(false);
      setErrors({});
    } catch (error) {
      toast.error('Error updating state and pincode');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteState({ variables: { deleteStateId: stateToDelete.id } });
      toast.success('State and Pincode deleted successfully');
      refetch();
      setShowDeleteModal(false);
      setStateToDelete(null);
    } catch (error) {
      toast.error('Error deleting state and pincode');
    }
  };

  const openEditModal = (state) => {
    setSelectedState(state);
    setStateName(state.state);
    setPincode(state.pincode.join(', '));
    setEditMode(true);
    setErrors({});
  };

  const closeModal = () => {
    setEditMode(false);
    setSelectedState(null);
    setStateName('');
    setPincode('');
    setErrors({});
  };

  const openDeleteModal = (state) => {
    setStateToDelete(state);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStateToDelete(null);
  };

  const handleSearch = () => {
    refetch();
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="border rounded bg-white p-2 mb-2">
      <div className="border fw-bold p-2 mb-2 rounded bg-info">Add State</div>
      <div className="mb-3 mt-1">
        <Form onSubmit={editMode ? handleUpdate : handleSubmit}>
          <Row>
            <div className="d-inline-block mb-2 col-6">
              <Form.Control
                type="text"
                placeholder="State Name"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                isInvalid={!!errors.stateName}
              />
              <Form.Control.Feedback type="invalid">{errors.stateName}</Form.Control.Feedback>
            </div>
          </Row>
          <Row>
            <div className="col-12 d-inline-block">
              <Form.Control
                type="text"
                as="textarea"
                rows={4}
                placeholder="Enter Pincode (Example: 313001, 313002, 313003)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                isInvalid={!!errors.pincode}
              />
              <Form.Control.Feedback type="invalid">{errors.pincode}</Form.Control.Feedback>
            </div>
          </Row>
          <Row className="mb-2 mt-2">
            <Button variant="primary" type="submit" className="col-3 d-inline-block btn-icon btn-icon-start d-inline-block mx-lg-auto">
              
              <span>{editMode ? 'Update' : 'Save'}</span>
            </Button>
          </Row>
        </Form>
      </div>
      {/* Search Start */}
      {/* <Row className="mb-3">
        <Col md="5" lg="6" xxl="2" className="mb-1">
          <div className="d-inline-block float-md-start mt-2 border search-input-container w-100 shadow bg-foreground">
            <Form.Control
              id="userSearch"
              type="text"
              placeholder="Search State or Pincode"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <span className="search-magnifier-icon" onClick={handleSearch} onKeyPress={handleKeyPress}>
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
        </Col>
      </Row> */}
      {/* Search End */}
      <div className="border fw-bold p-2 mb-2 rounded bg-info">Pincode List</div>
      <Row className="g-0 h-100 border bg-white mb-2 fw-bold rounded align-content-center d-none d-lg-flex p-3 custom-sort">
        <Col lg="2" className="d-flex flex-column mb-lg-0 pe-3">
          <div className="text-md cursor-pointer">State</div>
        </Col>
        <Col lg="8" className="d-flex flex-column mb-lg-0 pe-3">
          <div className="text-md cursor-pointer">Pincode</div>
        </Col>
        <Col lg="2" className="d-flex flex-column pe-1 align-items-center">
          <div className="text-md cursor-pointer">Action</div>
        </Col>
      </Row>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error loading states</p>
      ) : (
        data.getAllStates
          .filter((state) => state.state.toLowerCase().includes(search.toLowerCase()) || state.pincode.join(', ').toLowerCase().includes(search.toLowerCase()))
          .slice() // Create a copy of the array to avoid mutating the original data
          .sort((a, b) => a.state.localeCompare(b.state)) // Sort by state name in alphabetical order
          .map((state) => (
            <Row key={state.id} className="g-0 border h-100 bg-white mb-2 rounded align-content-center d-lg-flex p-3 custom-sort">
              <Col lg="2" className="d-flex flex-column mb-lg-0 pe-3">
                <div>{state.state}</div>
                <div className="small text-dark pt-2">(Total {state.pincode.length} pincode list)</div>
              </Col>
              <Col lg="8" className="d-flex flex-column mb-lg-0 pe-3">
                <div>
                  {expandedStates[state.id] ? state.pincode.join(', ') : state.pincode.slice(0, 10).join(', ')}
                  {state.pincode.length > 10 && (
                    <Button
                      variant="link"
                      className="text-primary ps-2"
                      onClick={() => toggleExpand(state.id)}
                    >
                      {expandedStates[state.id] ? 'View Less' : 'View More'}
                    </Button>
                  )}
                </div>
              </Col>
              <Col lg="2" className="d-flex flex-column align-items-center pe-1">
                <Col xs="6" lg="2" className="d-flex flex-column justify-content-center align-items-end mb-2 mb-lg-0 order-5 order-lg-5">
                  <div className="text-muted text-small d-lg-none mb-1">Action</div>
                  <div className="d-flex flex-row align-items-center">
                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}>
                      <div className="d-inline-block me-2">
                        <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={() => openEditModal(state)}>
                          <CsLineIcons icon="edit-square" className="text-primary" size="17" />
                        </Button>
                      </div>
                    </OverlayTrigger>
                    {/* <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Delete</Tooltip>}>
                      <div className="d-inline-block">
                        <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={() => openDeleteModal(state)}>
                          <CsLineIcons icon="bin" className="text-primary" size="17" />
                        </Button>
                      </div>
                    </OverlayTrigger> */}
                  </div>
                </Col>
              </Col>
            </Row>
          ))
      )}

      <Modal show={editMode} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit State</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdate}>
            <Row>
              <div className="d-inline-block mb-2 col-6">
                <Form.Control
                  type="text"
                  placeholder="State Name"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  isInvalid={!!errors.stateName}
                />
                <Form.Control.Feedback type="invalid">{errors.stateName}</Form.Control.Feedback>
              </div>
            </Row>
            <Row>
              <div className="col-12 d-inline-block">
                <Form.Control
                  type="text"
                  as="textarea"
                  rows={10}
                  placeholder="Enter Pincode (Example: 313001, 313002, 313003)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  isInvalid={!!errors.pincode}
                />
                <Form.Control.Feedback type="invalid">{errors.pincode}</Form.Control.Feedback>
              </div>
            </Row>
            <Row className="mb-2 mt-2">
              <Button variant="primary" type="submit" className="col-3 d-inline-block btn-icon btn-icon-start d-inline-block mx-lg-auto">
                <span>Submit</span>
              </Button>
            </Row>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={closeDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this state and its pincodes?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
            No
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Pincode;
