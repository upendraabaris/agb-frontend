import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const SuccessModal = ({ show, categoryName, onClose }) => {
  const history = useHistory();

  const handleClose = () => {
    onClose();
  };

  const handleViewStatus = () => {
    handleClose();
    // Navigate to ads list
    history.push('/seller/advertisement/list');
  };

  return (
    <Modal show={show} onHide={handleClose} centered size='lg'>
      <Modal.Body className='text-center py-5'>
        <div className='mb-3'>
          <div
            className='rounded-circle mx-auto mb-3'
            style={{
              width: '100px',
              height: '100px',
              backgroundColor: '#d4edda',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CsLineIcons
              icon='check'
              className='display-4'
              style={{ color: '#28a745' }}
            />
          </div>
        </div>

        <h4 className='mb-2 fw-bold text-success'>Ad Request Submitted</h4>
        <p className='text-muted mb-4'>
          Your advertisement for <span className='fw-bold'>{categoryName}</span> has been
          submitted for review.
        </p>

        <div className='alert alert-info'>
          <small>
            <CsLineIcons icon='info' className='me-2' />
            Our admin team will review your submission within 24 hours. You'll receive an email
            notification once your advertisement is approved or if any changes are required.
          </small>
        </div>

        <p className='text-muted mb-4'>
          <strong>Next Steps:</strong>
          <br />
          1. Check your email for approval notification
          <br />
          2. Once approved, your ad will start running
          <br />
          3. Track your advertisement performance from your dashboard
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Go Back Home
        </Button>
        <Button variant='primary' onClick={handleViewStatus}>
          <CsLineIcons icon='eye' className='me-2' />
          View My Ads
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SuccessModal;
