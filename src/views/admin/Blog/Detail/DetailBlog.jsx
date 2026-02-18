import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Row, Col, Card, Dropdown, Tooltip, OverlayTrigger, Button, Form } from 'react-bootstrap';
import { useParams, NavLink } from 'react-router-dom';
import DOMPurify from 'dompurify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';

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

function DetailBlog() {
  const title = 'Blog Detail';
  const description = 'Ecommerce Blog Detail Page';
  const { id } = useParams();

  const { error, data: dataAll } = useQuery(GET_BLOGS);

  if (error) {
    console.log(`GET_BLOG!!! : ${error.message}`);
  }

  const { data } = useQuery(GET_BLOG, {
    variables: {
      getBlogId: id,
    },
  });

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/blog/list">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Back to Blog List</span>
            </NavLink>
            <h1 className="mb-0 pb-0 display-4" id="title">
              {title}
            </h1>
            {/* Title End */}
          </Col>
        </Row>
      </div>
      <h2 className="small-title my-2 py-2">Detail Blog</h2>
      <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          {/* Search Start */}
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control
              id="userSearch"
              type="text"
              placeholder="Search"
              // value={search}
              // onChange={(e) => setSearch(e.target.value)}
            />
            <span
              className="search-magnifier-icon"
              // onClick={handleSearch}
            >
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
          {/* Search End */}
        </Col>
        <Col md="7" lg="9" xxl="10" className="mb-1 text-end">
          {/* Print Button Start */}
          <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">Print</Tooltip>}>
            <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow">
              <CsLineIcons icon="print" />
            </Button>
          </OverlayTrigger>
          {/* Print Button End */}

          {/* Export Dropdown Start */}
          <Dropdown align={{ xs: 'end' }} className="d-inline-block ms-1">
            <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">Export</Tooltip>}>
              <Dropdown.Toggle variant="foreground-alternate" className="dropdown-toggle-no-arrow btn btn-icon btn-icon-only shadow">
                <CsLineIcons icon="download" />
              </Dropdown.Toggle>
            </OverlayTrigger>
            <Dropdown.Menu className="shadow dropdown-menu-end">
              <Dropdown.Item href="#">Copy</Dropdown.Item>
              <Dropdown.Item href="#">Excel</Dropdown.Item>
              <Dropdown.Item href="#">Cvs</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {/* Export Dropdown End */}

          {/* Length Start */}
          <Dropdown
            // onSelect={(e) => setLimit(parseInt(e))}
            align={{ xs: 'end' }}
            className="d-inline-block ms-1"
          >
            <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">Item Count</Tooltip>}>
              <Dropdown.Toggle variant="foreground-alternate" className="shadow sw-13">
                Items
              </Dropdown.Toggle>
            </OverlayTrigger>
            <Dropdown.Menu className="shadow dropdown-menu-end">
              <Dropdown.Item eventKey="5">5 Items</Dropdown.Item>
              <Dropdown.Item eventKey="10">10 Items</Dropdown.Item>
              <Dropdown.Item eventKey="15">15 Items</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {/* Length End */}
        </Col>
      </Row>

      {data && (
        <>
          <Row>
            <h1>Blog {data.getBlog.title}</h1>
            <Col sm="12" className="my-4" xs="12">
              <Card className="mb-5">
                <Row className="justify-content-center">
                  <img alt="Blog Image" src={data.getBlog.image} className="sh-sm-50 sw-sm-50 sh-xl-60 sw-xl-60 h-100 mx-2 px-2 my-2 py-2" />
                </Row>
                <Card.Body>
                  {/* eslint-disable-next-line react/no-danger */}
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.getBlog.content) }} className="mb-3 fs-5" />
                </Card.Body>
              </Card>
            </Col>

            <Col sm="12" xs="12" className="my-4">
              <h3>Read more Blogs</h3>
              {dataAll &&
                dataAll.getAllBlog.map(
                  (blog, index) =>
                    index < 10 &&
                    !(blog.id === data.getBlog.id) && (
                      <Row className="mb-2" key={blog.id}>
                        <Card className="mx-1 py-1 px-1 py-1">
                          <Card.Body className="mx-1 py-1 px-1 py-1">
                            {/* <a href={`/blogs/detail/${blog.id}`}  className="fs-5"> {blog.title} </a> */}
                            <NavLink to={`/admin/blog/detail/${blog.id}`} className="fs-5">
                              {blog.title}{' '}
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
      {/* {data && <> <h1>Blog {data.getBlog.title}</h1>
 <img alt="dd" src={data.getBlog.image} />
 <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.getBlog.content) }} className="mb-3 fs-5" /> </>} */}
    </>
  );
}
export default DetailBlog;
