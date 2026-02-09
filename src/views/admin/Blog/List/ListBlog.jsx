import { React, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { NavLink, useHistory } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useMutation, useLazyQuery } from '@apollo/client';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { Row, Col, Button, Dropdown, Form, Modal, Tooltip, OverlayTrigger, Pagination, Table, Spinner } from 'react-bootstrap';
import 'quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import DOMPurify from 'dompurify';
import Truncate from 'react-truncate-html';

const GET_BLOG = gql`
  query GetAllBlog($search: String, $limit: Int, $offset: Int, $sortBy: String, $sortOrder: String) {
    getAllBlog(search: $search, limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
      id
      title
      tags
      content
      image
    }
  }
`;

const EDIT_BLOG = gql`
  mutation UpdateBlog($updateBlogId: ID!, $title: String, $content: String, $tags: String, $files: [Upload]) {
    updateBlog(id: $updateBlogId, title: $title, content: $content, tags: $tags, files: $files) {
      title
      tags
      image
      id
      content
    }
  }
`;

const DELETE_BLOG = gql`
  mutation DeleteBlog($deleteBlogId: ID!) {
    deleteBlog(id: $deleteBlogId) {
      content
      id
      image
      tags
      title
    }
  }
`;

function ListBlog() {
  const title = 'Blog List';
  const description = 'Ecommerce Blog List Page';
  const history = useHistory();
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('title');
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImages, setEditImages] = useState([]);
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteTitle, setTitleDelete] = useState('');
  const [loading, setLoading] = useState(false);
  const [getBlog, { error, data, loading: queryLoading, fetchMore, refetch }] = useLazyQuery(GET_BLOG, {
    onCompleted: () => setLoading(false),
    onError: () => setLoading(false),
  });
  if (error) {
    console.log(`Error!!! : ${error.message}`);
  }
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleSort = (event) => {
    setSortBy(event);
    if (sortOrder === 'asc') {
      setSortOrder('dsc');
    } else {
      setSortOrder('asc');
    }
    getBlog({
      variables: {
        limit,
        offset,
        sortBy,
        sortOrder,
      },
    });
  };
  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);
  useEffect(() => {
    getBlog({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
  }, [getBlog, offset, limit, sortBy, sortOrder]);
  const handleSearch = () => {
    getBlog({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);
  useEffect(() => {
    if (debouncedSearch !== '') {
      handleSearch();
    } else {
      getBlog({ variables: { limit, offset, sortBy, sortOrder } });
    }
  }, [debouncedSearch, getBlog, limit, offset, sortBy, sortOrder]);
  const [editBlog, { data: dataEdit }] = useMutation(EDIT_BLOG, {
    onCompleted: () => {
      toast.success(`${dataEdit.updateBlog.title} is Updated!`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
      console.error(err);
    },
  });
  function handleSave() {
    editBlog({
      variables: {
        updateBlogId: editId,
        title: editTitle,
        files: editImages,
        content: editContent,
        tags: editTag,
      },
    });
    setEditModal(false);
  }
  function handleEdit(event, event2, event3, event4, event5) {
    setEditId(event);
    setEditModal(true);
    setEditTitle(event2);
    setEditContent(event3);
    setEditTag(event4);
    setEditImages(event5);
  }
  const [deleteBlog, res] = useMutation(DELETE_BLOG, {
    onCompleted: () => {
      toast(`${res.data.deleteBlog.title} is removed from database.!`);
      refetch();
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });
  function handleDelete(event, event2) {
    setDeleteModalView(true);
    setDeleteId(event);
    setTitleDelete(event2);
  }
  const deleteSellerConfirmed = async () => {
    setDeleteModalView(true);
    await deleteBlog({
      variables: {
        deleteBlogId: deleteId,
      },
    });
    setDeleteModalView(false);
  };
  const modules = {
    toolbar: [
      [{ font: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };
  function handleClick() {
    history.push(`/admin/blog/add`);
  }
  function ReadMore(event) {
    setSelected(event);
  }

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <CsLineIcons icon="chevron-left" size="13" />
              <span className="align-middle text-small ms-1">Dashboard</span>
            </NavLink>
          </Col>
          <Col xs="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button variant="outline-primary" onClick={() => handleClick()} className="btn-icon btn-icon-start ms-0 ms-sm-1 w-100 w-md-auto">
              <span>Add New Blog</span>
            </Button>
          </Col>
        </Row>
      </div>
      <Row className="m-0 bg-white p-1 rounded border mb-2">
        <Col md="5" lg="6" xxl="2" className="mb-1 fw-bold fs-4 pt-1 text-dark">
          {title}
        </Col>
        <Col md="7" lg="6" xxl="10" className="mb-1 mt-1 text-end">
          <div className="d-inline-block float-md-start me-1 search-input-container w-100 bg-foreground">
            <Form.Control
              type="text"
              placeholder="Search"
              value={search}
              className="border"
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value === '') {
                  setDebouncedSearch('');
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
          </div>
        </Col>
      </Row>

      <div className="mb-5">
        <Table bordered hover responsive className="bg-white">
          <thead>
            <tr>
              <th colSpan="2">Title</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {queryLoading && (
              <tr>
                <td colSpan="4" className="text-center">
                  <Spinner animation="border" variant="primary" />
                </td>
              </tr>
            )}
            {!queryLoading && data?.getAllBlog?.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center bg-white fs-5 fw-bold p-4">
                  Blog not found!
                </td>
              </tr>
            )}
            {!queryLoading &&
              data?.getAllBlog?.map((getAllBlog) => (
                <tr key={getAllBlog.id}>
                  <td>
                    <img src={getAllBlog.image} alt={getAllBlog.title} style={{ width: '50px', height: 'auto' }} />
                  </td>
                  <td>
                    <NavLink to={`/admin/blog/detail/${getAllBlog.id}`}>{getAllBlog.title}</NavLink>
                  </td>
                  <td>{getAllBlog.tags}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      className="shadow p-2 m-0"
                      onClick={() => handleEdit(getAllBlog.id, getAllBlog.title, getAllBlog.content, getAllBlog.tags, getAllBlog.images)}
                    >
                      <CsLineIcons icon="edit" />
                    </Button>{' '}
                    <Button variant="outline-danger" className="shadow p-2 m-0" onClick={() => handleDelete(getAllBlog.id, getAllBlog.title)}>
                      <CsLineIcons icon="bin" />
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>

      {data && (
        <div className="d-flex justify-content-center mt-5">
          <Pagination>
            <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
              <CsLineIcons icon="chevron-left" />
            </Pagination.Prev>
            <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data?.getAllBlog?.length < limit}>
              <CsLineIcons icon="chevron-right" />
            </Pagination.Next>
          </Pagination>
        </div>
      )}

      <Modal className="modal-close d-inline-block" dialogClassName="modal-semi-full" centered scrollable show={editModal} onHide={() => setEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title as="h4" className="fw-bold">
            Edit Blog
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form>
              <div className="mb-3">
                <Form.Label className="text-dark fw-bold">Blog Title</Form.Label>
                <Form.Control type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label className="text-dark fw-bold">Blog Description </Form.Label>
                <ReactQuill modules={modules} theme="snow" value={editContent} onChange={setEditContent} placeholder="Compose an epic blog" />
              </div>
              <div className="mb-3">
                <Form.Label className="text-dark fw-bold">Blog Tag</Form.Label>
                <Form.Control type="text" value={editTag} onChange={(e) => setEditTag(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label className="text-dark fw-bold">Images</Form.Label>
                <Form.Control type="file" accept="image/*" multiple onChange={(e) => setEditImages(e.target.files[0])} />
              </div>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="primary" className="btn-icon btn-icon-start" type="button" onClick={() => handleSave()}>
            <span> Save</span>
          </Button>
          <Button variant="outline-primary" className="btn-icon " onClick={() => setEditModal(false)}>
            <span> Cancel</span>
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Blog</Modal.Title>
        </Modal.Header>
        {deleteTitle && (
          <Modal.Body>
            <span className="fs-5">{deleteTitle}</span> will be deleted?
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
            No
          </Button>
          <Button variant="primary" onClick={() => deleteSellerConfirmed()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
export default ListBlog;
