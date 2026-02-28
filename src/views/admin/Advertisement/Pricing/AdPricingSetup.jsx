import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Row, Col, Card, Button, Form, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

// GraphQL Queries
const GET_ALL_TIERS = gql`
  query GetAllTiers {
    allAdTierMasters {
      id
      name
      description
    }
  }
`;

const GET_ALL_PRICING_CONFIGS = gql`
  query GetAllAdPricingConfigs {
    getAllAdPricingConfigs {
      id
      tier_id
      tier {
        id
        name
        description
      }
      banner1_quarterly_price
      stamp1_quarterly_price
      duration_multipliers {
        quarterly
        half_yearly
        yearly
      }
      banner_multipliers {
        pos1
        pos2
        pos3
        pos4
      }
      stamp_multipliers {
        pos1
        pos2
        pos3
        pos4
      }
      tier_multipliers {
        A1
        A2
        A3
      }
      is_base_tier
      generated_prices {
        ad_type
        slot_position
        slot_name
        quarterly
        half_yearly
        yearly
      }
      is_active
      updatedAt
    }
  }
`;

const UPSERT_PRICING_CONFIG = gql`
  mutation UpsertAdPricingConfig($input: AdPricingConfigInput!) {
    upsertAdPricingConfig(input: $input) {
      success
      message
      data {
        id
        tier_id
        banner1_quarterly_price
        stamp1_quarterly_price
        generated_prices {
          ad_type
          slot_position
          slot_name
          quarterly
          half_yearly
          yearly
        }
      }
    }
  }
`;

function AdPricingSetup() {
  const title = 'Ad Pricing Configuration';
  const description = 'Configure advertising pricing by tier and slot';

  // Form state
  const [selectedTierId, setSelectedTierId] = useState('');
  const [banner1Price, setBanner1Price] = useState(10000);
  const [stamp1Price, setStamp1Price] = useState(5000);
  const [durationMultipliers, setDurationMultipliers] = useState({
    quarterly: 1.0,
    half_yearly: 1.8,
    yearly: 3.2
  });
  const [bannerMultipliers, setBannerMultipliers] = useState({
    pos1: 1.0,
    pos2: 0.8,
    pos3: 0.65,
    pos4: 0.5
  });
  const [stampMultipliers, setStampMultipliers] = useState({
    pos1: 1.0,
    pos2: 0.8,
    pos3: 0.65,
    pos4: 0.5
  });
  
  // Tier cascade settings
  const [isBaseTier, setIsBaseTier] = useState(false);
  const [tierMultipliers, setTierMultipliers] = useState({
    A1: 1.0,
    A2: 0.85,
    A3: 0.70
  });
  const [autoCascade, setAutoCascade] = useState(true);

  // Preview prices state
  const [previewPrices, setPreviewPrices] = useState([]);

  // Queries
  const { data: tiersData, loading: tiersLoading } = useQuery(GET_ALL_TIERS);
  const { data: configsData, loading: configsLoading, refetch: refetchConfigs } = useQuery(GET_ALL_PRICING_CONFIGS);

  // Mutation
  const [upsertConfig, { loading: saving }] = useMutation(UPSERT_PRICING_CONFIG, {
    onCompleted: (response) => {
      if (response.upsertAdPricingConfig.success) {
        toast.success(response.upsertAdPricingConfig.message || 'Pricing saved successfully!');
        refetchConfigs();
      } else {
        toast.error(response.upsertAdPricingConfig.message || 'Failed to save pricing');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save pricing');
    }
  });

  // Load existing config when tier is selected
  useEffect(() => {
    if (selectedTierId && configsData?.getAllAdPricingConfigs) {
      const existingConfig = configsData.getAllAdPricingConfigs.find(
        c => c.tier_id === selectedTierId
      );
      
      if (existingConfig) {
        setBanner1Price(existingConfig.banner1_quarterly_price || 10000);
        setStamp1Price(existingConfig.stamp1_quarterly_price || 5000);
        setDurationMultipliers(existingConfig.duration_multipliers || {
          quarterly: 1.0,
          half_yearly: 1.8,
          yearly: 3.2
        });
        setBannerMultipliers(existingConfig.banner_multipliers || {
          pos1: 1.0,
          pos2: 0.8,
          pos3: 0.65,
          pos4: 0.5
        });
        setStampMultipliers(existingConfig.stamp_multipliers || {
          pos1: 1.0,
          pos2: 0.8,
          pos3: 0.65,
          pos4: 0.5
        });
        setIsBaseTier(existingConfig.is_base_tier || false);
        setTierMultipliers(existingConfig.tier_multipliers || {
          A1: 1.0,
          A2: 0.85,
          A3: 0.70
        });
      } else {
        // Reset to defaults for new tier
        setBanner1Price(10000);
        setStamp1Price(5000);
        setDurationMultipliers({ quarterly: 1.0, half_yearly: 1.8, yearly: 3.2 });
        setBannerMultipliers({ pos1: 1.0, pos2: 0.8, pos3: 0.65, pos4: 0.5 });
        setStampMultipliers({ pos1: 1.0, pos2: 0.8, pos3: 0.65, pos4: 0.5 });
        setIsBaseTier(false);
        setTierMultipliers({ A1: 1.0, A2: 0.85, A3: 0.70 });
      }
    }
  }, [selectedTierId, configsData]);

  // Generate preview prices
  useEffect(() => {
    const prices = [];
    
    // Generate banner prices
    [1, 2, 3, 4].forEach(pos => {
      const multiplier = bannerMultipliers[`pos${pos}`] || 1;
      const basePrice = banner1Price * multiplier;
      prices.push({
        ad_type: 'banner',
        slot_position: pos,
        slot_name: `banner_${pos}`,
        quarterly: Math.round(basePrice * (durationMultipliers.quarterly || 1)),
        half_yearly: Math.round(basePrice * (durationMultipliers.half_yearly || 1.8)),
        yearly: Math.round(basePrice * (durationMultipliers.yearly || 3.2))
      });
    });
    
    // Generate stamp prices
    [1, 2, 3, 4].forEach(pos => {
      const multiplier = stampMultipliers[`pos${pos}`] || 1;
      const basePrice = stamp1Price * multiplier;
      prices.push({
        ad_type: 'stamp',
        slot_position: pos,
        slot_name: `stamp_${pos}`,
        quarterly: Math.round(basePrice * (durationMultipliers.quarterly || 1)),
        half_yearly: Math.round(basePrice * (durationMultipliers.half_yearly || 1.8)),
        yearly: Math.round(basePrice * (durationMultipliers.yearly || 3.2))
      });
    });
    
    setPreviewPrices(prices);
  }, [banner1Price, stamp1Price, durationMultipliers, bannerMultipliers, stampMultipliers]);

  // Handle save
  const handleSave = async () => {
    if (!selectedTierId) {
      toast.error('Please select a tier');
      return;
    }

    await upsertConfig({
      variables: {
        input: {
          tier_id: selectedTierId,
          banner1_quarterly_price: parseFloat(banner1Price),
          stamp1_quarterly_price: parseFloat(stamp1Price),
          duration_multipliers: {
            quarterly: parseFloat(durationMultipliers.quarterly),
            half_yearly: parseFloat(durationMultipliers.half_yearly),
            yearly: parseFloat(durationMultipliers.yearly)
          },
          banner_multipliers: {
            pos1: parseFloat(bannerMultipliers.pos1),
            pos2: parseFloat(bannerMultipliers.pos2),
            pos3: parseFloat(bannerMultipliers.pos3),
            pos4: parseFloat(bannerMultipliers.pos4)
          },
          stamp_multipliers: {
            pos1: parseFloat(stampMultipliers.pos1),
            pos2: parseFloat(stampMultipliers.pos2),
            pos3: parseFloat(stampMultipliers.pos3),
            pos4: parseFloat(stampMultipliers.pos4)
          },
          tier_multipliers: isBaseTier ? {
            A1: parseFloat(tierMultipliers.A1),
            A2: parseFloat(tierMultipliers.A2),
            A3: parseFloat(tierMultipliers.A3)
          } : null,
          is_base_tier: isBaseTier,
          auto_cascade_to_other_tiers: isBaseTier && autoCascade,
          is_active: true
        }
      }
    });
  };

  const getSelectedTierName = () => {
    const tier = tiersData?.allAdTierMasters?.find(t => t.id === selectedTierId);
    return tier?.name || '';
  };

  if (tiersLoading || configsLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      
      {/* Title */}
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <div className="mw-auto">
              <h1 className="mb-0 pb-0 display-4">{title}</h1>
            </div>
          </Col>
        </Row>
      </div>

      <Row>
        {/* Configuration Form */}
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="mb-4">
                <CsLineIcons icon="settings-1" className="me-2" />
                Pricing Configuration
              </h5>

              {/* Tier Selection */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Select Tier</Form.Label>
                <Form.Select
                  value={selectedTierId}
                  onChange={(e) => setSelectedTierId(e.target.value)}
                >
                  <option value="">-- Select Tier --</option>
                  {tiersData?.allAdTierMasters?.map(tier => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} - {tier.description}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {selectedTierId && (
                <>
                  {/* Base Prices */}
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">Base Prices (Quarterly)</h6>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Banner 1 Price (₹)</Form.Label>
                          <Form.Control
                            type="number"
                            value={banner1Price}
                            onChange={(e) => setBanner1Price(e.target.value)}
                            min="0"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Stamp 1 Price (₹)</Form.Label>
                          <Form.Control
                            type="number"
                            value={stamp1Price}
                            onChange={(e) => setStamp1Price(e.target.value)}
                            min="0"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Duration Multipliers */}
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">Duration Multipliers</h6>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Quarterly</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            value={durationMultipliers.quarterly}
                            onChange={(e) => setDurationMultipliers({
                              ...durationMultipliers,
                              quarterly: e.target.value
                            })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Half Yearly</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            value={durationMultipliers.half_yearly}
                            onChange={(e) => setDurationMultipliers({
                              ...durationMultipliers,
                              half_yearly: e.target.value
                            })}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Yearly</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            value={durationMultipliers.yearly}
                            onChange={(e) => setDurationMultipliers({
                              ...durationMultipliers,
                              yearly: e.target.value
                            })}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <small className="text-muted">
                      Example: Half Yearly 1.8× means 2 quarters with 10% discount (2 × 0.9 = 1.8)
                    </small>
                  </div>

                  {/* Banner Position Multipliers */}
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">Banner Position Multipliers (% of Banner 1)</h6>
                    <Row>
                      {[1, 2, 3, 4].map(pos => (
                        <Col md={3} key={`banner-${pos}`}>
                          <Form.Group className="mb-3">
                            <Form.Label>Pos {pos}</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.05"
                              value={bannerMultipliers[`pos${pos}`]}
                              onChange={(e) => setBannerMultipliers({
                                ...bannerMultipliers,
                                [`pos${pos}`]: e.target.value
                              })}
                              disabled={pos === 1}
                            />
                          </Form.Group>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  {/* Stamp Position Multipliers */}
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">Stamp Position Multipliers (% of Stamp 1)</h6>
                    <Row>
                      {[1, 2, 3, 4].map(pos => (
                        <Col md={3} key={`stamp-${pos}`}>
                          <Form.Group className="mb-3">
                            <Form.Label>Pos {pos}</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.05"
                              value={stampMultipliers[`pos${pos}`]}
                              onChange={(e) => setStampMultipliers({
                                ...stampMultipliers,
                                [`pos${pos}`]: e.target.value
                              })}
                              disabled={pos === 1}
                            />
                          </Form.Group>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  {/* Tier Cascade Settings */}
                  <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="text-muted mb-3">
                      <CsLineIcons icon="layers" className="me-2" />
                      Tier Auto-Cascade Settings
                    </h6>
                    
                    <Form.Check
                      type="checkbox"
                      id="is-base-tier"
                      label="This is the base tier (A1) - cascade prices to other tiers"
                      checked={isBaseTier}
                      onChange={(e) => setIsBaseTier(e.target.checked)}
                      className="mb-3"
                    />
                    
                    {isBaseTier && (
                      <>
                        <small className="text-muted d-block mb-3">
                          Set multipliers to auto-calculate A2 and A3 prices based on A1 base price
                        </small>
                        
                        <Row>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>A1 (Base: 100%)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.05"
                                value={tierMultipliers.A1}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>A2 Multiplier</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.05"
                                min="0"
                                max="1"
                                value={tierMultipliers.A2}
                                onChange={(e) => setTierMultipliers({
                                  ...tierMultipliers,
                                  A2: e.target.value
                                })}
                              />
                              <small className="text-muted">
                                A2 Price: ₹{Math.round(banner1Price * tierMultipliers.A2)}
                              </small>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>A3 Multiplier</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.05"
                                min="0"
                                max="1"
                                value={tierMultipliers.A3}
                                onChange={(e) => setTierMultipliers({
                                  ...tierMultipliers,
                                  A3: e.target.value
                                })}
                              />
                              <small className="text-muted">
                                A3 Price: ₹{Math.round(banner1Price * tierMultipliers.A3)}
                              </small>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Check
                          type="checkbox"
                          id="auto-cascade"
                          label="Auto-update A2 and A3 configs when saving"
                          checked={autoCascade}
                          onChange={(e) => setAutoCascade(e.target.checked)}
                          className="mt-2"
                        />
                        {autoCascade && (
                          <Alert variant="info" className="mt-2 mb-0 py-2">
                            <small>
                              <CsLineIcons icon="info-hexagon" className="me-1" size={14} />
                              Saving will automatically update A2 and A3 pricing configs
                            </small>
                          </Alert>
                        )}
                      </>
                    )}
                  </div>

                  {/* Save Button */}
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-100"
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CsLineIcons icon="save" className="me-2" />
                        Save Configuration for {getSelectedTierName()}
                      </>
                    )}
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Preview & Saved Configs */}
        <Col lg={7}>
          {/* Preview Table */}
          {selectedTierId && (
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-4">
                  <CsLineIcons icon="eye" className="me-2" />
                  Preview: Generated Prices for {getSelectedTierName()}
                </h5>
                
                <Table striped bordered hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>Slot</th>
                      <th className="text-end">Quarterly</th>
                      <th className="text-end">Half Yearly</th>
                      <th className="text-end">Yearly</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewPrices.filter(p => p.ad_type === 'banner').map(price => (
                      <tr key={price.slot_name}>
                        <td>
                          <Badge bg="primary" className="me-2">Banner</Badge>
                          {price.slot_name}
                        </td>
                        <td className="text-end">₹{price.quarterly.toLocaleString()}</td>
                        <td className="text-end">₹{price.half_yearly.toLocaleString()}</td>
                        <td className="text-end">₹{price.yearly.toLocaleString()}</td>
                      </tr>
                    ))}
                    {previewPrices.filter(p => p.ad_type === 'stamp').map(price => (
                      <tr key={price.slot_name}>
                        <td>
                          <Badge bg="success" className="me-2">Stamp</Badge>
                          {price.slot_name}
                        </td>
                        <td className="text-end">₹{price.quarterly.toLocaleString()}</td>
                        <td className="text-end">₹{price.half_yearly.toLocaleString()}</td>
                        <td className="text-end">₹{price.yearly.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Saved Configurations */}
          <Card>
            <Card.Body>
              <h5 className="mb-4">
                <CsLineIcons icon="database" className="me-2" />
                Saved Pricing Configurations
              </h5>
              
              {configsData?.getAllAdPricingConfigs?.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Tier</th>
                      <th className="text-end">Banner 1 (Q)</th>
                      <th className="text-end">Stamp 1 (Q)</th>
                      <th>Status</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {configsData.getAllAdPricingConfigs.map(config => (
                      <tr 
                        key={config.id}
                        className={config.tier_id === selectedTierId ? 'table-active' : ''}
                        onClick={() => setSelectedTierId(config.tier_id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <strong>{config.tier?.name || 'Unknown'}</strong>
                          <br />
                          <small className="text-muted">{config.tier?.description}</small>
                        </td>
                        <td className="text-end">₹{config.banner1_quarterly_price?.toLocaleString()}</td>
                        <td className="text-end">₹{config.stamp1_quarterly_price?.toLocaleString()}</td>
                        <td>
                          <Badge bg={config.is_active ? 'success' : 'secondary'}>
                            {config.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td>
                          {config.updatedAt 
                            ? new Date(config.updatedAt).toLocaleDateString() 
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  No pricing configurations found. Select a tier and configure pricing above.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default AdPricingSetup;
