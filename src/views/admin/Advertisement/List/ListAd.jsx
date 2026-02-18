import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { Row, Col, Tab, Tabs } from 'react-bootstrap';
import SubSectionAD from '../Add/SubSectionAD';

const GET_AD_CONTENT = gql`
  query GetAds($key: String!) {
    getAds(key: $key) {
      active
      images
      url
      key
    }
  }
`;

function ListAd() {
  const title = 'Down Banner';
  const description = 'Ecommerce Down Banner Page';

  const [eventKeyAds, setEventKeyAds] = useState('DownAd1');

  const [getAdContent, { data, refetch }] = useLazyQuery(GET_AD_CONTENT);

  useEffect(() => {
    getAdContent({
      variables: {
        key: eventKeyAds,
      },
    });
  }, [data, eventKeyAds]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Home</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
          </Col>
        </Row>
      </div>
      <Tabs justify onSelect={(e) => setEventKeyAds(e)}>
        <Tab eventKey="DownAd1" title="Down Banner 1">
          {data && <SubSectionAD eventKey="DownAd1" refetch={refetch} data={data.getAds} />}
        </Tab>
        <Tab eventKey="DownAd2" title="Down Banner 2">
          {data && <SubSectionAD eventKey="DownAd2" refetch={refetch} data={data.getAds} />}
        </Tab>
        <Tab eventKey="DownAd3" title="Down Banner 3">
          {data && <SubSectionAD eventKey="DownAd3" refetch={refetch} data={data.getAds} />}
        </Tab>
        <Tab eventKey="DownAd4" title="Down Banner 4">
          {data && <SubSectionAD eventKey="DownAd4" refetch={refetch} data={data.getAds} />}
        </Tab>
      </Tabs>
    </>
  );
}
export default ListAd;
