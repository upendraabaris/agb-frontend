import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyQuery, gql, useQuery } from '@apollo/client';
import { NavLink, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { Row, Col, Button, Badge, Card, Modal } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import './style.css';
import { useGlobleContext } from 'context/styleColor/ColorContext';

function AboutUs() {
  const title = 'Meet Our Team';
  const description = 'Meet Our Team: The focus of our team is to get more and more people shopping online and deliver good quality';
  const dispatch = useDispatch();
  const { dataStoreFeatures1 } = useGlobleContext();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
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

  const [getContent, { data: dataSiteContent }] = useLazyQuery(GET_SITE_CONTENT);

  useEffect(() => {
    getContent({
      variables: {
        key: 'meet-our-team',
      },
    });
  }, [dataSiteContent, getContent]);

  const GET_TEAM = gql`
    query GetMeet {
      getMeet {
        id
        title
        image
        role
      }
    }
  `;

  const { data: dataTeam } = useQuery(GET_TEAM);
  if (dataTeam) {
    console.log(dataTeam);
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      {
        <style>
          {`.bg_color {
        background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
      }`}
          {`.font_color {
        color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
      }`}
          {`
        .btn_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
          transition: background 0.3s ease;
          padding: 10px 30px;
          border: none;
          cursor: pointer;            
        }
        .btn_color:hover {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          filter: brightness(80%);       
        } 
      `}
        </style>
      }
      {/* <h1 className="Header">Meet Our Team Page</h1> */}
      {/* eslint-disable-next-line react/no-danger */}
      {dataSiteContent && (
        <div
          className="text-center border mb-2 rounded bg_color p-2"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(dataSiteContent?.getSiteContent?.content.replace(/<br>/g, '')) }}
        />
      )}
      <Row className="g-2 row-cols-2 row-cols-md-3 row-cols-xl-5 mb-5">
        {dataTeam?.getMeet &&
          dataTeam.getMeet.map((item) => (
            <Col key={item.id}>
              <Card className="border rounded p-2">
                <Row className="g-0 h-100 p-2">
                  <img src={item.image} className="card-img p-0 img_1 h-100s border-primary rounded-circle scale" alt="card image" />
                </Row>
                <Row>
                  <Card.Body className="text-center pt-4 h-100 py-0 px-2 my-1 mx-1">
                    <div className="text-center">
                      <h5>
                        <b>{item.title}</b>
                      </h5>
                      <p>{item.role}</p>
                    </div>
                  </Card.Body>
                </Row>
              </Card>
            </Col>
          ))}
      </Row>
    </>
  );
}
export default AboutUs;
