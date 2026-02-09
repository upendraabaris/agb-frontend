import React, { useEffect } from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Row, Col, Card } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import DOMPurify from 'dompurify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const GET_BLOG = gql`
  query GetBlog($getBlogId: ID!) {
    getBlog(id: $getBlogId) {
      id
      title
      image
      content
      tags
    }
  }
`;

const GET_BLOGS = gql`
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

function DetailBlog() {
  const title = 'Blog Detail';
  const description = 'Ecommerce Blog Detail Page';
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(false));
    // eslint-disable-next-line
  }, []);

  const { error, data: dataAll, refetch } = useQuery(GET_BLOGS);

  if (error) {
    console.log(`GET_BLOG!!! : ${error.message}`);
  }

  const [getBlogById, { data }] = useLazyQuery(GET_BLOG);

  useEffect(() => {
    getBlogById({
      variables: {
        getBlogId: '65816603f41417665d732f75',
      },
    });
    refetch();
  }, [getBlogById, refetch]);

  // useEffect(() => {
  //   const redricted = () => {
  //     window.location.replace('/');
  //   };
  //   redricted();
  // }, []);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Home</span>
            </NavLink>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/blogs">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Blogs</span>
            </NavLink>
            {/* Title End */}
          </Col>
        </Row>
      </div>
      {data && (
        <>
          <Row>
            <Col xl="8" className="my-4" xs="12">
              <Card className="mb-5">
                <h1 className="bg-white p-3 fw-bolder">{data.getBlog.title}</h1>
                <Row className="justify-content-center">
                  <img alt={data.getBlog.title} src={data.getBlog.image} className="sh-sm-50 sw-sm-50 sh-xl-60 sw-xl-60 h-100 mx-2 px-2 my-2 py-2" />
                </Row>
                <Card.Body>
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.getBlog.content) }} className="mb-3 fs-5" />
                </Card.Body>
              </Card>
            </Col>

            <Col xl="4" xs="12" className="my-4">
              <h3>RECENT POSTS</h3>
              {dataAll &&
                dataAll.getAllBlog.map(
                  (blog, index) =>
                    index < 10 &&
                    !(blog.id === data.getBlog.id) && (
                      <Row className="mb-2" key={blog.id}>
                        <Card className="mx-1 py-1 px-1 py-1">
                          <Card.Body className="mx-1 py-1 px-1 py-1">
                            <NavLink to={`/blogs/detail/${blog.id}`} className="fs-5 fs-6">
                              {blog.title}
                            </NavLink>
                          </Card.Body>
                        </Card>
                      </Row>
                    )
                )}
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
export default DetailBlog;
