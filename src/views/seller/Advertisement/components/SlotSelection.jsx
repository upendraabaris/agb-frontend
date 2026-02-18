import React from 'react';
import { Form, Row, Col, Badge, Alert } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const SlotSelection = ({ slots, selectedSlot, adType, onSlotChange }) => {
  // Filter slots by ad_type and is_active status
  const availableSlots = slots.filter(
    (slot) => slot.ad_type === adType && slot.is_active === true
  );

  if (!slots || slots.length === 0) {
    return (
      <Alert variant='info'>
        <span className='text-muted'>
          No slots found. Please contact admin to add available slots.
        </span>
      </Alert>
    );
  }

  if (!availableSlots || availableSlots.length === 0) {
    return (
      <Alert variant='info'>
        <span className='text-muted'>
          No available slots for {adType === 'banner' ? 'Banner' : 'Stamp'} advertisements at the moment. Please try again later or contact support.
        </span>
      </Alert>
    );
  }

  // Group slots by position for better UI
  const slotsByPosition = availableSlots.reduce((acc, slot) => {
    if (!acc[slot.position]) {
      acc[slot.position] = [];
    }
    acc[slot.position].push(slot);
    return acc;
  }, {});

  return (
    <div>
      <p className='text-muted mb-3'>
        Select an available slot for your {adType === 'banner' ? 'Banner' : 'Stamp'} advertisement
      </p>
      {Object.entries(slotsByPosition).map(([position, positionSlots]) => (
        <div key={position} className='mb-4'>
          <h6 className='fw-bold mb-3 text-capitalize'>{position} Position</h6>
          <Row>
            {positionSlots.map((slot) => (
              <Col key={slot.id} md={6} lg={4} className='mb-3'>
                <div
                  className={`p-3 border rounded cursor-pointer transition-all ${
                    selectedSlot === slot.id
                      ? 'border-primary bg-light shadow-sm'
                      : 'border-light'
                  }`}
                  onClick={() => onSlotChange(slot.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSlotChange(slot.id);
                    }
                  }}
                  role='button'
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <div className='d-flex justify-content-between align-items-start mb-2'>
                    <div>
                      <div className='fw-bold'>
                        {adType === 'banner' ? (
                          <>
                            <CsLineIcons icon='image' className='me-2' />
                          </>
                        ) : (
                          <>
                            <CsLineIcons icon='stamp' className='me-2' />
                          </>
                        )}
                        {slot.ad_slot}
                      </div>
                      <div className='text-muted small mt-1'>
                        Slot #{slot.slot_number}
                      </div>
                    </div>
                    {selectedSlot === slot.id && (
                      <Badge bg='success'>Selected</Badge>
                    )}
                  </div>
                  <div className='text-muted small'>
                    <div className='text-capitalize'>
                      📍 {slot.position}
                    </div>
                  </div>
                  <Form.Check
                    type='radio'
                    id={`slot-${slot.id}`}
                    name='slot_selection'
                    value={slot.id}
                    checked={selectedSlot === slot.id}
                    onChange={(e) => onSlotChange(e.target.value)}
                    className='mt-2'
                    label='Select this slot'
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </div>
  );
};

export default SlotSelection;
