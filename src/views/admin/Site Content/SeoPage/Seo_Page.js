import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import SubSection from './SubSection';
import SeoTitle from './SeoTitle';
import SeoDescription from './SeoDescription';

function ListSiteContent() {
  const title = 'SEO Friendly Title and Description';
  const description = 'SEO Friendly Title and Description';
  const [eventKey, setEventKey] = useState('seotitle');
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
  }, [dataSiteContent, eventKey]);

  // useEffect(() => {
  //   getContent({
  //     variables: {
  //       key: eventKeyCheckOut,
  //     },
  //   });
  // }, [eventKeyCheckOut]);

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
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
            {/* Title End */}
          </Col>
        </Row>
      </div>

      <div className="my-3">
        <Tabs onSelect={(e) => setEventKey(e)}>         
          <Tab eventKey="seotitle" title="SEO Title">
            {dataSiteContent && <SubSection eventKey="seotitle" title="SEO Title" refetch={refetch} data={dataSiteContent?.getSiteContent} />}
          </Tab>
          <Tab eventKey="seodescription" title="SEO Description">
            {dataSiteContent && <SubSection eventKey="seodescription" title="SEO Description" refetch={refetch} data={dataSiteContent?.getSiteContent} />}
          </Tab>         
        </Tabs>
      </div>
    </>
  );
}

export default ListSiteContent;
