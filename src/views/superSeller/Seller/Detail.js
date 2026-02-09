import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Card, Form, Button, Modal } from 'react-bootstrap';
import Select from 'react-select';

const GET_SELLER_DETAILS = gql`
  query GetSeller($id: ID!) {
    getSeller(id: $id) {
      id
      companyName
      gstin
      fullAddress
      city
      state
      pincode
      companyDescription
      mobileNo
      email
      allotted {
        dealerId
        dastatus
        baId
        pincode
        state
      }
    }
  }
`;

const GET_ALL_STATES = gql`
  query GetAllStates {
    getAllStates {
      id
      state
      pincode
    }
  }
`;

const UPDATE_DEALER_PINCODE = gql`
  mutation UpdateDealerPincode($id: ID!, $dealerId: ID, $baId: ID, $pincode: [Int], $state: [String]) {
    updateDealerPincode(id: $id, dealerId: $dealerId, baId: $baId, pincode: $pincode, state: $state) {
      id
      allotted {
        dealerId
        baId
        pincode
        state
      }
    }
  }
`;

function DealerDetails() {
  const { id } = useParams();
  const { currentUser } = useSelector((state) => state.auth);
  const { loading, error, data } = useQuery(GET_SELLER_DETAILS, { variables: { id } });
  const { data: stateData } = useQuery(GET_ALL_STATES);
  const [updateDealerPincode] = useMutation(UPDATE_DEALER_PINCODE);
  const [showState, setShowState] = useState(false);
  const [showPincode, setShowPincode] = useState(false);
  const [selectedStates, setSelectedStates] = useState([]);
  const [pincode, setPincode] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Modal open effect
  useEffect(() => {
    if (showModal && data?.getSeller?.allotted?.length) {
      const latestAllot = data.getSeller.allotted[data.getSeller.allotted.length - 1];

      if (latestAllot?.state && latestAllot.state.length > 0) {
        // State exist -> show state selector, clear pincode
        setShowState(true);
        setShowPincode(false);
        setSelectedStates(latestAllot.state.map((st) => ({ label: st, value: st })));
        setPincode('');
      } else if (latestAllot?.pincode && latestAllot.pincode.length > 0) {
        // State empty -> show pincode textarea with data
        setShowPincode(true);
        setShowState(false);
        setSelectedStates([]);
        setPincode(latestAllot.pincode.join(', ')); // ✅ fill pincode
      } else {
        // Neither state nor pincode -> both empty
        setShowState(false);
        setShowPincode(true);
        setSelectedStates([]);
        setPincode('');
      }
    }
  }, [showModal, data]);

  // Selected states effect (update pincode only if states selected)
  useEffect(() => {
    if (selectedStates.length > 0 && stateData?.getAllStates) {
      setPincode(selectedStates.flatMap((st) => stateData.getAllStates.find((s) => s.state === st.value)?.pincode || []).join(', '));
    }
    // do NOT clear pincode if selectedStates is empty
  }, [selectedStates, stateData]);

  useEffect(() => {
    if (selectedStates.length && stateData?.getAllStates) {
      setPincode(selectedStates.flatMap((st) => stateData.getAllStates.find((s) => s.state === st.value)?.pincode || []).join(', '));
    } else {
      setPincode('');
    }
  }, [selectedStates, stateData]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching details</p>;
  if (!data?.getSeller) return <p>No Dealer Associate found</p>;

  const { companyName, fullAddress, city, state: sellerState, pincode: sellerPincode, mobileNo, email, gstin, companyDescription, allotted } = data.getSeller;

  const handleSubmit = async () => {
    try {
      await updateDealerPincode({
        variables: {
          id,
          dealerId: id,
          baId: currentUser?.seller?.id,
          pincode: pincode ? pincode.split(',').map((pin) => parseInt(pin.trim(), 10)) : [],
          state: selectedStates.map((state) => state.value),
        },
      });
      setShowModal(false);
    } catch {
      alert('❌ Error updating dealer details!');
    }
  };
  const approvalBadge = allotted?.some((item) => item.dastatus === true) ? (
    <span className="badge bg-primary px-3 py-2 ms-2">Approved</span>
  ) : (
    <span className="badge bg-danger px-3 py-2 ms-2">Not Approved</span>
  );

  return (
    <Container className="mt-0">
      <NavLink to="/superSeller/seller/list" className="btn btn-link p-0 p-2 rounded bg-white fw-bold mb-1">
        ← Back
      </NavLink>
      <Card className="p-4 shadow">
        <h2 className="fw-bold text-dark">Dealer Associate Detail</h2>
        <table className="table table-bordered table-striped">
          <tbody>
            <tr>
              <th>DA ID</th>
              <td>{id}</td>
            </tr>

            <tr>
              <th>DA Name</th>
              <td>
                {companyName}
                {approvalBadge}
              </td>
            </tr>

            <tr>
              <th> Address</th>
              <td>{`${fullAddress}, ${city}, ${sellerState} - ${sellerPincode}`}</td>
            </tr>

            <tr>
              <th> Email</th>
              <td>{email}</td>
            </tr>

            <tr>
              <th> Mobile</th>
              <td>{mobileNo}</td>
            </tr>

            <tr>
              <th> GSTIN</th>
              <td>{gstin}</td>
            </tr>

            <tr>
              <th> DA Description</th>
              <td>{companyDescription}</td>
            </tr>

            <tr>
              <th> Allot {allotted.some((entry) => entry.state.length > 0) ? 'State' : 'Pincode'}</th>
              <td>
                {allotted.length ? (
                  <div>
                    {allotted.map((entry, index) => (
                      <div key={index}>{entry.state.length > 0 ? entry.state.join(', ') : entry.pincode.join(', ')}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-danger">No allotted areas</div>
                )}

                <a
                  href="#"
                  className="btn btn-link m-0 p-0"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true);
                  }}
                >
                  Update Pincode & State
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light p-3">
          <Modal.Title className="fw-bold text-dark">Update Pincode & State</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <Form>
            <h6 className="fw-bold">Select Delivery Location</h6>
            <Form.Group className="mb-3 d-flex gap-3">
              <Form.Check
                type="checkbox"
                label="State Wise Delivery"
                checked={showState}
                onChange={() => {
                  setShowState(!showState);
                  setShowPincode(false);
                }}
              />
              <Form.Check
                type="checkbox"
                label="Manual Pincode Entry"
                checked={showPincode}
                onChange={() => {
                  setShowPincode(!showPincode);
                  setShowState(false);
                }}
              />
            </Form.Group>
            {showState && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Select State(s) </Form.Label>
                <Select
                  isMulti
                  options={stateData?.getAllStates.map((st) => ({ value: st.state, label: st.state }))}
                  value={selectedStates}
                  onChange={setSelectedStates}
                  placeholder="Select states"
                  className="custom-select"
                />
                <span className="text-muted mt-1 mb-1">{pincode.length > 0 && <span>Total Pincode's: {pincode.length}</span>}</span>
                {pincode && (
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter pincodes (comma-separated)"
                    className="border rounded p-2"
                  />
                )}
              </Form.Group>
            )}
            {showPincode && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold text-dark">Pincode(s)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincodes (313001, 313002, 313003...)"
                  className="border rounded p-2"
                />
              </Form.Group>
            )}
            <div className="alert alert-warning mb-0">Details of the Dealer Associate to grant order delivery permission for specified pincodes.</div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DealerDetails;
