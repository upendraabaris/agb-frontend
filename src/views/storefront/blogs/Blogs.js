import React, { useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Row, Col, Form, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const GET_BLOG = gql`
  query GetAllBlog {
    getAllBlog {
      id
      title
      tags
      content
      image
    }
  }
`;

function Blogs() {
  const title = 'MY BLOGS';
  const description = 'My Blogs Page';
  const { dataStoreFeatures1 } = useGlobleContext();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const { error, data } = useQuery(GET_BLOG);

  if (error) {
    console.log(`GET_BLOG!!! : ${error.message}`);
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
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
      {/* <div className="">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Home</span>
            </NavLink>           
          </Col>
        </Row>
      </div> */}
      <h1 className="text-center fw-bold mb-4 pb-2 pt-4">
        MY <span className="font_color"> BLOG</span>
      </h1>

      <Row className="row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-4 g-2 mb-5">
        {data &&
          data.getAllBlog
            ?.slice(0)
            .reverse()
            .map((getAllBlog) => (
              <Col key={getAllBlog.id}>
                <Card>
                <NavLink to={`/blogs/detail/${getAllBlog.id}`} >
                  <Card.Img src={getAllBlog.image} className="card-img border-bottom card-img-top w-100 px-2 py-2 rounded" alt={getAllBlog.title} />
                  </NavLink>
                  {/* <img src={getAllBlog.image} className="card-img rounded-md" alt="thumb" /> */}

                  <div className="p-2">
                    <h2 className="heading mb-0 fw-bolder text-center pt-3 pb-3">
                      <NavLink to={`/blogs/detail/${getAllBlog.id}`} className="font_color">
                        {getAllBlog.title}
                      </NavLink>
                    </h2>
                  </div>
                </Card>
              </Col>
            ))}
      </Row>
    </>
  );
}

export default Blogs;
