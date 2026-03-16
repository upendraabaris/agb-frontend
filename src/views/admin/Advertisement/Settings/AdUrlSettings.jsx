import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Card, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

// ─── GraphQL ─────────────────────────────────────────────────────────────────

const GET_AD_SETTINGS = gql`
  query GetAdSettings {
    getAdSettings {
      id
      allow_external_url_for_sellers
      allow_internal_url_for_ad_managers
      updatedAt
    }
  }
`;

const UPDATE_AD_SETTINGS = gql`
  mutation UpdateAdSettings($allow_external_url_for_sellers: Boolean, $allow_internal_url_for_ad_managers: Boolean) {
    updateAdSettings(
      allow_external_url_for_sellers: $allow_external_url_for_sellers
      allow_internal_url_for_ad_managers: $allow_internal_url_for_ad_managers
    ) {
      id
      allow_external_url_for_sellers
      allow_internal_url_for_ad_managers
      updatedAt
    }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

const AdUrlSettings = () => {
  const title = 'Ad URL Settings';
  const description = 'Control which roles can use external or internal redirect URLs for ads';

  const [allowExternalForSellers, setAllowExternalForSellers] = useState(false);
  const [allowInternalForAdManagers, setAllowInternalForAdManagers] = useState(false);

  const { data, loading, error } = useQuery(GET_AD_SETTINGS, { fetchPolicy: 'network-only' });

  useEffect(() => {
    if (data?.getAdSettings) {
      setAllowExternalForSellers(data.getAdSettings.allow_external_url_for_sellers ?? false);
      setAllowInternalForAdManagers(data.getAdSettings.allow_internal_url_for_ad_managers ?? false);
    }
  }, [data]);

  const [updateSettings, { loading: saving }] = useMutation(UPDATE_AD_SETTINGS, {
    onCompleted: () => toast.success('Ad URL settings saved successfully!'),
    onError: (err) => toast.error(`Save failed: ${err.message}`),
  });

  const handleSave = () => {
    updateSettings({
      variables: {
        allow_external_url_for_sellers: allowExternalForSellers,
        allow_internal_url_for_ad_managers: allowInternalForAdManagers,
      },
    });
  };

  return (
    <>
      <HtmlHead title={title} description={description} />

      <div className="page-title-container mb-3">
        <Row>
          <Col>
            <h1 className="mb-0 pb-0 display-4">
              <CsLineIcons icon="link" className="me-2" />
              {title}
            </h1>
            <small className="text-muted">{description}</small>
          </Col>
        </Row>
      </div>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && (
        <Alert variant="danger">Failed to load settings: {error.message}</Alert>
      )}

      {!loading && !error && (
        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-4">URL Type Permissions</h5>

            <Alert variant="info" className="mb-4" style={{ fontSize: '0.9rem' }}>
              <strong>How URL types work:</strong>
              <ul className="mb-0 mt-1">
                <li><strong>Internal URL</strong> – points to a page within the same website (e.g. a product or category page). Default for sellers.</li>
                <li><strong>External URL</strong> – points to any off-site URL. Default for Ads Associates.</li>
                <li>To charge a surcharge for external URLs, set the amount in <em>Pricing Config</em> per tier.</li>
              </ul>
            </Alert>

            <Form>
              <Form.Group className="mb-4">
                <Form.Check
                  type="switch"
                  id="allow-external-sellers"
                  label={
                    <span>
                      <strong>Allow sellers to use external (off-site) redirect URLs</strong>
                      <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                        When disabled, sellers can only enter internal (same-site) redirect URLs.
                        The external URL surcharge still applies if they are permitted.
                      </div>
                    </span>
                  }
                  checked={allowExternalForSellers}
                  onChange={(e) => setAllowExternalForSellers(e.target.checked)}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check
                  type="switch"
                  id="allow-internal-ad-managers"
                  label={
                    <span>
                      <strong>Allow Ads Associates to use internal (same-site) redirect URLs</strong>
                      <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                        By default, Ads Associates are forced to use external URLs only.
                        Enable this to also allow them to choose internal URLs.
                      </div>
                    </span>
                  }
                  checked={allowInternalForAdManagers}
                  onChange={(e) => setAllowInternalForAdManagers(e.target.checked)}
                />
              </Form.Group>

              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CsLineIcons icon="save" className="me-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </Form>

            {data?.getAdSettings?.updatedAt && (
              <div className="mt-3 text-muted" style={{ fontSize: '0.8rem' }}>
                Last updated: {new Date(data.getAdSettings.updatedAt).toLocaleString('en-IN')}
              </div>
            )}
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default AdUrlSettings;
