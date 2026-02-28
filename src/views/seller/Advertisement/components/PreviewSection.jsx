import React from 'react';
import { Card, Row, Col, Button, Badge } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

const PreviewSection = ({
  cartEntries = [],
  selectedCategory,
  allCategories = [],
  duration,
  durationLabel,
  startPreference,
  selectedStartQuarter,
  computePricingPreview,
  computeCartEntryPrice,
  computeGrandTotal,
  getSlotDisplayName,
  getQuarterEnd,
  onEdit,
  onSubmit,
  submitting,
}) => {
  const fmtPrice = (v) => `\u20b9${Math.round(v).toLocaleString('en-IN')}`;

  // Compute per-slot price for a cart entry (non-current category)
  const getSlotPriceFromEntry = (entry, slot) => {
    const pr = entry.pricingData;
    if (!pr) return 0;
    const adType = slot.split('_')[0];
    const slotQPrice = pr.adCategories?.find(ac => ac.slot_name === slot && ac.duration_days === 90)?.price || 0;
    let proRata = 0;
    if (startPreference === 'today') {
      const now = new Date();
      const nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const qEnd = getQuarterEnd(nowUTC);
      const rem = Math.floor((qEnd - nowUTC) / 86400000) + 1;
      const qsm = Math.floor(nowUTC.getUTCMonth() / 3) * 3;
      const qStart = new Date(Date.UTC(nowUTC.getUTCFullYear(), qsm, 1));
      const full = Math.floor((qEnd - qStart) / 86400000) + 1;
      proRata = Math.round((rem / full) * slotQPrice);
    }
    let adCat = pr.adCategories?.find(ac => ac.slot_name === slot && ac.duration_days === duration);
    if (!adCat) adCat = pr.adCategories?.find(ac => ac.ad_type === adType && ac.duration_days === duration);
    return (adCat?.price || 0) + proRata;
  };

  if (cartEntries.length === 0) {
    return (
      <Card className='border-danger'>
        <Card.Body>
          <p className='text-danger'>Error: No slots selected. Please go back and select slots.</p>
        </Card.Body>
      </Card>
    );
  }

  const totalSlots = cartEntries.reduce((s, e) => s + e.slots.length, 0);
  const grandTotal = computeGrandTotal();

  return (
    <div>
      <Row className='mb-4'>
        <Col>
          <div className='page-title-container'>
            <h2 className='mb-0 pb-0'>Advertisement Preview</h2>
            <div className='text-muted fs-base'>Review your advertisement before submitting</div>
          </div>
        </Col>
      </Row>

      {/* Plan Summary */}
      <Card className='mb-4' style={{ backgroundColor: '#f0f4ff', border: '1px solid #c5d5f7' }}>
        <Card.Body>
          <Row>
            <Col md={3} className='mb-2'>
              <label className='text-muted small fw-bold mb-1 d-block'>Duration</label>
              <div className='fw-bold fs-6'>{durationLabel}</div>
            </Col>
            <Col md={3} className='mb-2'>
              <label className='text-muted small fw-bold mb-1 d-block'>Start</label>
              <div className='fw-bold fs-6'>{startPreference === 'today' ? 'Today (Pro-rata)' : (selectedStartQuarter || 'Next Quarter')}</div>
            </Col>
            <Col md={3} className='mb-2'>
              <label className='text-muted small fw-bold mb-1 d-block'>Categories</label>
              <div className='fw-bold fs-6'>{cartEntries.length}</div>
            </Col>
            <Col md={3} className='mb-2'>
              <label className='text-muted small fw-bold mb-1 d-block'>Total Slots</label>
              <div className='fw-bold fs-6'>{totalSlots}</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Per-Category Details */}
      {cartEntries.map(entry => {
        const catData = allCategories.find(c => c.id === entry.categoryId);
        const tierName = catData?.tierId?.name || 'Unknown';
        let catTotal = 0;

        const slotDetails = entry.slots.map(slot => {
          let price = 0;
          let breakdown = null;
          if (entry.categoryId === selectedCategory) {
            const preview = computePricingPreview(slot);
            price = preview?.total || 0;
            breakdown = preview?.breakdown || null;
          } else {
            price = getSlotPriceFromEntry(entry, slot);
          }
          catTotal += price;
          return { slot, displayName: getSlotDisplayName(slot), price, breakdown, media: entry.slotMedia[slot] || {} };
        });

        return (
          <Card key={entry.categoryId} className='mb-4'>
            <Card.Header className='bg-light d-flex justify-content-between align-items-center'>
              <div>
                <Card.Title className='mb-0'>
                  <CsLineIcons icon='tag' className='me-2' />
                  {entry.categoryName}
                </Card.Title>
                <small className='text-muted'>Tier: {tierName} &bull; {slotDetails.length} slot(s)</small>
              </div>
              <span className='fw-bold fs-5' style={{ color: '#0d6efd' }}>{fmtPrice(catTotal)}</span>
            </Card.Header>
            <Card.Body>
              {/* Pricing Table */}
              <table className='table table-sm mb-3' style={{ fontSize: '0.9rem' }}>
                <thead>
                  <tr>
                    <th>Slot</th>
                    <th>Breakdown</th>
                    <th className='text-end'>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {slotDetails.map(sd => (
                    <tr key={sd.slot}>
                      <td className='fw-bold' style={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>{sd.displayName}</td>
                      <td style={{ fontSize: '0.82rem', color: '#555' }}>
                        {sd.breakdown && sd.breakdown.length > 0 ? (
                          sd.breakdown.map((b, idx) => (
                            <div key={idx}>
                              {b.quarter}: {b.days}d &times; {`\u20b9${b.rate_per_day}`} = {fmtPrice(b.subtotal)}
                            </div>
                          ))
                        ) : (
                          <span>{durationLabel}</span>
                        )}
                      </td>
                      <td className='text-end fw-bold' style={{ whiteSpace: 'nowrap', verticalAlign: 'top' }}>{fmtPrice(sd.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Media Preview */}
              <h6 className='mt-3 mb-2'>Uploaded Media</h6>
              <Row>
                {slotDetails.map(sd => (
                  <Col md={6} key={sd.slot} className='mb-3'>
                    <div className='border rounded p-2' style={{ backgroundColor: '#fafafa' }}>
                      <strong className='d-block mb-2'>{sd.displayName}</strong>
                      {sd.media.mobileImage && (
                        <div className='mb-2'>
                          <small className='text-muted d-block'>Mobile Image:</small>
                          <img src={sd.media.mobileImage} alt='mobile' className='img-fluid rounded' style={{ maxHeight: '100px' }} />
                        </div>
                      )}
                      {sd.media.desktopImage && (
                        <div className='mb-2'>
                          <small className='text-muted d-block'>Desktop Image:</small>
                          <img src={sd.media.desktopImage} alt='desktop' className='img-fluid rounded' style={{ maxHeight: '100px' }} />
                        </div>
                      )}
                      <div className='mt-1'>
                        <small>
                          <Badge bg={(sd.media.urlType || 'external') === 'internal' ? 'info' : 'secondary'} className='me-1'>
                            {(sd.media.urlType || 'external').charAt(0).toUpperCase() + (sd.media.urlType || 'external').slice(1)}
                          </Badge>
                          {sd.media.redirectUrl && (
                            <a href={sd.media.redirectUrl} target='_blank' rel='noopener noreferrer' style={{ fontSize: '0.8rem' }}>
                              {sd.media.redirectUrl.length > 40 ? `${sd.media.redirectUrl.substring(0, 40)}...` : sd.media.redirectUrl}
                            </a>
                          )}
                        </small>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        );
      })}

      {/* Grand Total */}
      <Card className='mb-4 border-success'>
        <Card.Body>
          <div className='d-flex justify-content-between align-items-center'>
            <span className='fw-bold fs-5'>Grand Total</span>
            <span className='h3 fw-bold mb-0' style={{ color: '#0d6efd' }}>{fmtPrice(grandTotal)}</span>
          </div>
          {startPreference === 'today' && (
            <small className='text-muted d-block mt-1'>* Includes pro-rata charges for remaining days in current quarter</small>
          )}
        </Card.Body>
      </Card>

      {/* Terms Notice */}
      <Card className='mb-4 border-warning'>
        <Card.Body>
          <div className='alert alert-warning mb-0'>
            <CsLineIcons icon='warning' className='me-2' />
            <strong>Important:</strong> By submitting this advertisement, you agree that:
            <ul className='mt-2 mb-0 ms-3'>
              <li>The images and content are original or you have rights to use them</li>
              <li>The advertisement complies with our content guidelines</li>
              <li>You understand this request will be reviewed by our admin team</li>
              <li>Once approved, your advertisement will run for the selected duration and slots</li>
              <li>The pricing shown is for each selected ad slot based on position and duration</li>
            </ul>
          </div>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <Card>
        <Card.Body className='text-end'>
          <Button
            variant='outline-secondary'
            className='me-2'
            onClick={onEdit}
            disabled={submitting}
          >
            <CsLineIcons icon='edit' className='me-2' />
            Edit
          </Button>
          <Button
            variant='success'
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span
                  className='spinner-border spinner-border-sm me-2'
                  role='status'
                  aria-hidden='true'
                />
                Submitting...
              </>
            ) : (
              <>
                <CsLineIcons icon='check' className='me-2' />
                Submit Advertisement
              </>
            )}
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PreviewSection;
