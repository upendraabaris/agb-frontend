import React from 'react';
import { Form } from 'react-bootstrap';
import cs from 'classnames';

const TierSelection = ({ tiers, selectedTier, onTierChange }) => {
  if (!tiers || tiers.length === 0) {
    return (
      <div className='text-center py-4'>
        <p className='text-muted'>No tiers available for this category</p>
      </div>
    );
  }

  return (
    <div className='tier-selection'>
      {tiers.map((tier) => (
        <Form.Check
          key={tier.id}
          type='radio'
          id={`tier-${tier.id}`}
          name='tier'
          value={tier.id}
          checked={selectedTier === tier.id}
          onChange={() => onTierChange(tier.id)}
          className='mb-3 p-3 border rounded cursor-pointer'
          style={{
            backgroundColor: selectedTier === tier.id ? '#f0f7ff' : '#fff',
            borderColor: selectedTier === tier.id ? '#0d66cc' : '#ddd',
          }}
          label={
            <div className='d-flex align-items-center justify-content-between flex-grow-1 ms-2'>
              <div>
                <h6 className='mb-1 fw-bold'>{tier.name}</h6>
                {tier.description && (
                  <p className='mb-0 text-muted small'>{tier.description}</p>
                )}
              </div>
              {!tier.is_active && (
                <span className='badge bg-danger'>Inactive</span>
              )}
            </div>
          }
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTierChange(tier.id);
            }
          }}
        />
      ))}
    </div>
  );
};

export default TierSelection;
