import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useLazyQuery } from '@apollo/client';
import SubSectionAD from './SubSectionAD';

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

function AddNewAd() {
  const title = 'Home Page Advertisement';
  const description = 'Home Page Advertisement';
  const [eventKeyAds, setEventKeyAds] = useState('Home1');

  const [getAdContent, { data, refetch }] = useLazyQuery(GET_AD_CONTENT);

  useEffect(() => {
    getAdContent({
      variables: {
        key: eventKeyAds,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, eventKeyAds]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              {/* <CsLineIcons icon="chevron-left" size="13" /> */}
              <span className="align-middle text-dark ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
            {/* Title End */}
          </Col>
        </Row>
      </div>

      <Tabs justify onSelect={(e) => setEventKeyAds(e)}>
        <Tab eventKey="Home1" title="Ads 1 for PC">
          {data?.getAds && <SubSectionAD eventKey="Home1" refetch={refetch} data={data?.getAds} />}
        </Tab>
        <Tab eventKey="Home1Mobile" title="Ads 1 for Mobile">
          {data?.getAds && <SubSectionAD eventKey="Home1Mobile" refetch={refetch} data={data?.getAds} />}
        </Tab>
        <Tab eventKey="Home2" title="Ads 2 for PC">
          {data?.getAds && <SubSectionAD eventKey="Home2" refetch={refetch} data={data?.getAds} />}
        </Tab>
        <Tab eventKey="Home2Mobile" title="Ads 2 for Mobile">
          {data?.getAds && <SubSectionAD eventKey="Home2Mobile" refetch={refetch} data={data?.getAds} />}
        </Tab>
        <Tab eventKey="Home3" title="Ads 3 for PC">
          {data?.getAds && <SubSectionAD eventKey="Home3" refetch={refetch} data={data?.getAds} />}
        </Tab>
        <Tab eventKey="Home3Mobile" title="Ads 3 for Mobile">
          {data?.getAds && <SubSectionAD eventKey="Home3Mobile" refetch={refetch} data={data?.getAds} />}
        </Tab>
      </Tabs>
    </>
  );
}

export default AddNewAd;
