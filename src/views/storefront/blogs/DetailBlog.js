import React, { useEffect } from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Row, Col, Card } from 'react-bootstrap';
import { useParams, NavLink } from 'react-router-dom';
import moment from 'moment';
import DOMPurify from 'dompurify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const GET_BLOGS = gql`
  query GetAllBlog {
    getAllBlog {
      id
      title
      tags
      content
      image
      createdAt
    }
  }
`;

const GET_BLOG = gql`
  query GetBlog($getBlogId: ID!) {
    getBlog(id: $getBlogId) {
      id
      title
      image
      content
      tags
      createdAt
    }
  }
`;

const GET_STORE_FEATURE = gql`
  query GetStoreFeature {
    getStoreFeature {
      id
      storeName
    }
  }
`;

function DetailBlog() {
  // const title = 'Blog Detail';
  // const description = 'Blog Detail Page';
  const { dataStoreFeatures1 } = useGlobleContext();
  const { id } = useParams();
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
        getBlogId: id,
      },
    });
    refetch();
  }, [getBlogById, id, refetch]);

  const { data: storeData } = useQuery(GET_STORE_FEATURE);
  const sanitizeWithResponsiveImages = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Add Bootstrap class to all images
    const images = tempDiv.querySelectorAll('img');
    images.forEach((img) => {
      img.classList.add('img-fluid'); // Bootstrap 5 responsive image class
    });

    return DOMPurify.sanitize(tempDiv.innerHTML);
  };

  return (
    <>
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
      {data && <HtmlHead title={data.getBlog.title} description={data.getBlog.title} />}
      <div className="mb-2">
        <Row className="g-0 align-items-center">
          <Col className="col-12">
            <div className="d-flex align-items-center flex-nowrap pb-2 overflow-auto" style={{ whiteSpace: 'nowrap' }}>
              <NavLink className="text-dark fw-semibold d-inline-flex align-items-center me-2" to="/">
                <span className="align-middle">Home</span>
              </NavLink>

              <NavLink className="text-dark d-inline-flex align-items-center me-2 text-decoration-none" to="/blogs">
                <CsLineIcons icon="chevron-right" size="13" className="text-muted" />
                {data && <span className="align-middle ms-1">Blogs</span>}
              </NavLink>

              <span className="text-dark fw-medium d-inline-flex align-items-center">
                <CsLineIcons icon="chevron-right" size="13" className="text-muted" />
                {data && <span className="align-middle ms-1">{data.getBlog.title}</span>}
              </span>
            </div>
          </Col>
        </Row>
      </div>

      {data && (
        <>
          <Row className="g-0">
            <Col xl={10} lg={10} md={12} className="rounded p-3 shadow-sm bg-white">
              <div>
                <h1 className="bg-white p-0 fw-bolder ps-1 pt-2 mb-0">{data.getBlog.title}</h1>
                <div className="ps-1 pt-2">
                  by {storeData?.getStoreFeature?.storeName || 'Our Store'} | Create date: {moment(parseInt(data.getBlog.createdAt, 10)).format('LL')}
                </div>
                <Row className="justify-content-center">
                  <img alt={data.getBlog.title} src={data.getBlog.image} className="sh-sm-50 sw-sm-50 sh-xl-60 sw-xl-60 h-100 mx-2 px-2 my-2 py-2 ps-3 px-3" />
                </Row>
                <div>
                  {/* eslint-disable-next-line react/no-danger */}
                  {/* <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.getBlog.content) }} className="mb-3 fs-5 p-1" /> */}
                  <div dangerouslySetInnerHTML={{ __html: sanitizeWithResponsiveImages(data.getBlog.content) }} className="mb-3 fs-5 p-1" />
                </div>
              </div>
            </Col>
            <Col xl={2} lg={2} md={12} className="rounded p-3 shadow-sm bg-white">
              <h3 className="fw-bold text-center text-dark p-3 border-bottom">📢 Recent Posts</h3>
              {dataAll &&
                dataAll.getAllBlog
                  .filter((blog) => blog.id !== data.getBlog.id)
                  .slice(0, 10)
                  .map((blog) => (
                    <Card key={blog.id} className="mb-3 border-0 shadow-sm rounded overflow-hidden">
                      {blog.image && (
                        <NavLink to={`/blogs/detail/${blog.id}`}>
                          <Card.Img variant="top" src={blog.image} alt={blog.title} className="blog-thumbnail" />
                        </NavLink>
                      )}
                      <Card.Body className="p-2">
                        <NavLink to={`/blogs/detail/${blog.id}`} className="fw-bold text-dark text-decoration-none blog-title">
                          {blog.title}
                        </NavLink>
                      </Card.Body>
                    </Card>
                  ))}
            </Col>
          </Row>
        </>
      )}
    </>
  );
}
export default DetailBlog;
