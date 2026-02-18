import React, { useState } from 'react';
import 'quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { Row, Col, Form, Card } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { NavLink, useHistory } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import ReactQuill from 'react-quill';
import 'react-dropzone-uploader/dist/styles.css';

const CREATE_BLOG = gql`
  mutation CreateBlog($title: String!, $files: [Upload]!, $content: String!, $tags: String!) {
    createBlog(title: $title, files: $files, content: $content, tags: $tags) {
      image
      id
      content
      tags
      title
    }
  }
`;

function AddBlog() {
  const title = 'Add Blog';
  const description = 'Ecommerce Blog Page';
  const history = useHistory();
  const [blogTag, setBlogTag] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogImage, setBlogImage] = useState([]);

  const [createBlog, { error, data }] = useMutation(CREATE_BLOG, {
    onCompleted: () => {
      toast(`${data.createBlog.title} is created!`);
      setBlogTag('');
      setBlogImage([]);
      setBlogTitle('');
      setBlogContent('');
      setTimeout(() => {
        history.push('/admin/blog/list');
      }, 2000);
    },
    onError: (err) => {
      toast.info('All Fields are Required!');
    },
  });
  if (error) {
    console.log(`Error!!! : ${error.message}`);
  }
  function handleSubmit() {
    if (blogImage.length !== 0 && blogTitle && blogContent && blogTag !== '') {
      createBlog({
        variables: {
          title: blogTitle,
          files: blogImage,
          content: blogContent,
          tags: blogTag,
        },
      });
    } else if (blogTitle || blogContent || blogTag === '' || blogImage.length === 0) {
      toast.error('All fields are required');
    }
  }

  const modules = {
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
  };
  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="text-dark ms-1">Portal Admin Dashboard</span>
            </NavLink>
            <span className="p-2"> / </span>
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/blog/list">
              <span className="text-dark">Blog List</span>
            </NavLink>
            <span className="p-2"> / </span>
            <span className="p-2"> Add Blog </span>
            <h1 className="mb-0 pt-2 display-4 fw-bold" id="title">
              {title}
            </h1>
          </Col>
          {/* Title End */}
        </Row>
      </div>
      <Card className="mb-5">
        <Card.Body>
          {/* onSubmit={handleSubmit} */}
          <div className="mb-3 filled form-group tooltip-end-top">
            <CsLineIcons icon="pen" />
            <Form.Control type="text" className='bg-white border' name="title" value={blogTitle} onChange={(e) => setBlogTitle(e.target.value)} placeholder="Blog Title" />
          </div>
          <div className="mb-3 filled form-group tooltip-end-top">
            <ReactQuill modules={modules} theme="snow" placeholder="Blog description" value={blogContent} onChange={setBlogContent} name="content" />
          </div>

          <div className="mb-3 filled form-group tooltip-end-top">
            <CsLineIcons icon="tag" />
            <Form.Control type="text" className='bg-white border' name="tag" value={blogTag} onChange={(e) => setBlogTag(e.target.value)} placeholder="Blog Tag" />
          </div>

          <div className="mb-3 pb-1 form-group tooltip-end-top ">
            <Form.Control name="image" type="file" accept="image/*" multiple onChange={(e) => setBlogImage(e.target.files[0])} />
          </div>
          <div className="text-center">
            <button className="btn btn-primary btn-lg" type="button" onClick={() => handleSubmit()}>
              Save
            </button>
          </div>
          {/* </form> */}
        </Card.Body>
      </Card>
    </>
  );
}
export default AddBlog;
