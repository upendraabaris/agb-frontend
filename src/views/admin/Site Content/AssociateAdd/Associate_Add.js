import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useLazyQuery, gql } from '@apollo/client';
import SubSection from './SubSection';

function ListSiteContent() {
  const title = 'Associate Content Add';
  const description = 'Associate Content Add';
  const [eventKey, setEventKey] = useState('sellerassociate');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  // GET SITE CONTENT
  const GET_SITE_CONTENT = gql`
    query GetSiteContent($key: String!) {
      getSiteContent(key: $key) {
        content
        key
      }
    }
  `;

  const [getContent, { data: dataSiteContent, refetch }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: {
        key: eventKey,
      },
    });
  }, [eventKey]);

  // REACT Quill Themes and Modules
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ font: [] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    }),
    []
  );

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <div className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="align-middle text-small ms-1"> / </span>
            <span className="text-dark ms-1"> {title} </span>
          </Col>
          <Row className="align-items-center">
            <div className="col-6 text-start">
              <h1 className="mb-0 pb-0 display-4 fw-bold" id="title">
                {title}
              </h1>
            </div>
            <div className="col-6 text-end">
              <NavLink className="btn btn-primary d-inline-block" to="/admin/siteContent/associate_PDF">
                <span className="text-white">PDF</span>
              </NavLink>
            </div>
          </Row>
        </div>
      </div>


      <div className="my-3">
        <Tabs activeKey={eventKey} onSelect={(e) => setEventKey(e)}>
          <Tab eventKey="sellerassociate" title="Enquiry Associate">
            {dataSiteContent && (
              <SubSection eventKey="sellerassociate" title="Seller Associate" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
          <Tab eventKey="sellerassociatedes" title="Enquiry Associate Des">
            {dataSiteContent && (
              <SubSection eventKey="sellerassociatedes" title="Seller Associate Des" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
          <Tab eventKey="serviceproviderassociate" title="Service Provider Associate">
            {dataSiteContent && (
              <SubSection eventKey="serviceproviderassociate" title="Service Provider Associate" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
          <Tab eventKey="serviceproviderassociatedes" title="Service Provider Associate Des">
            {dataSiteContent && (
              <SubSection eventKey="serviceproviderassociatedes" title="Service Provider Associate Des" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
          <Tab eventKey="tradeassociate" title="Seller Associate">
            {dataSiteContent && (
              <SubSection eventKey="tradeassociate" title="Seller Associate" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
          <Tab eventKey="tradeassociatedes" title="Seller Associate Des">
            {dataSiteContent && (
              <SubSection eventKey="tradeassociatedes" title="Seller Associate Des" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
          <Tab eventKey="businessassociate" title="Business Associate">
            {dataSiteContent && (
              <SubSection eventKey="businessassociate" title="Business Associate" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
          <Tab eventKey="businessassociatedes" title="Business Associate Des">
            {dataSiteContent && (
              <SubSection eventKey="businessassociatedes" title="Business Associate Des" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
          <Tab eventKey="businessassociatesubdealer" title="Business Associate Dealer">
            {dataSiteContent && (
              <SubSection eventKey="businessassociatesubdealer" title="Business Associate Dealer" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
          <Tab eventKey="businessassociatesubdealerdes" title="Business Associate Dealer Des">
            {dataSiteContent && (
              <SubSection eventKey="businessassociatesubdealerdes" title="Business Associate Dealer Des" refetch={refetch} data={dataSiteContent?.getSiteContent} />
            )}
          </Tab>
        </Tabs>
      </div>
    </>
  );
}

export default ListSiteContent;
