import React, { useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { useLazyQuery, gql, useQuery, useMutation } from '@apollo/client';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useDispatch } from 'react-redux';

const ListViewProduct = ({ history }) => {
  const title = 'All Product Master List';
  const description = 'All Product Master List';

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);
  const GET_ALL_TMT_MASTER = gql`
    query GetTmtMaster($search: String, $limit: Int, $offset: Int, $sortBy: String, $sortOrder: String) {
      getTmtMaster(search: $search, limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
        id
        section
        brandCompareCategory
        categories
        listingCommType
        listingComm
        fixedComm
        fixedCommType
        shippingComm
        shippingCommType
        productComm
        productCommType
      }
    }
  `;
  const [getTmtMaster, { error, data, fetchMore, refetch }] = useLazyQuery(GET_ALL_TMT_MASTER);
  // const { error, data, refetch } = useQuery(GET_ALL_TMT_MASTER);

  // useEffect(() => {
  //   refetch();
  // }, []);

  if (error) {
    console.log(`GET_ALL_TMT_MASTER!!! : ${error.message}`);
  }

  const liveThisProduct = (id) => {
    console.log(id);
  };

  // delete category

  const DELETE_TMT_MASTER = gql`
    mutation DeleteTMTMaster($deleteTmtMasterId: ID!) {
      deleteTMTMaster(id: $deleteTmtMasterId) {
        id
        brandCompareCategory
      }
    }
  `;

  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deletetmtMaster, setDeletetmtMaster] = useState(null);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(500);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('firstName');

  // const limit = 10;
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [DeleteTMTMaster] = useMutation(DELETE_TMT_MASTER, {
    onCompleted: (res) => {
      toast.success(`${res.deleteTMTMaster.brandCompareCategory} deleted successfully!`);
      refetch();
      setDeleteModalView(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!');
    },
  });

  const handleDeletemasterVariant = (masterId) => {
    setDeleteModalView(true);
    const deletetmtmaster = data.getTmtMaster.find((item) => item.id === masterId);
    setDeletetmtMaster(deletetmtmaster);
  };

  const deleteTMTMaster = async () => {
    if (deletetmtMaster) {
      await DeleteTMTMaster({
        variables: {
          deleteTmtMasterId: deletetmtMaster.id,
        },
      });
    } else {
      toast.error('Something went wrong in delete TMT!');
    }
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
    getTmtMaster({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
    // Execute the getUsers function when the component mounts
  }, [getTmtMaster, offset, limit, sortBy, sortOrder, refetch]);

  const handleSearch = () => {
    getTmtMaster({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };

  const handleSort = (event) => {
    setSortBy(event);
    if (sortOrder === 'asc') {
      setSortOrder('dsc');
    } else {
      setSortOrder('asc');
    }

    getTmtMaster({
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
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="text-dark pb-1" to="/admin/dashboard">
              <span className="ms-1">Dashboard</span>
            </NavLink>
          </Col>
          <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
            <Button
              variant="outline-primary"
              onClick={() => {
                history.push('/admin/tmt/add_master');
              }}
              className="btn-icon btn-icon-start ms-0 ms-sm-1 w-100 w-md-auto"
            >
              <span>Add Product Master</span>
            </Button>
          </Col>
        </Row>
      </div>
      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <div className="mb-1 d-flex col-lg-12 col-md-6">
          <div className="w-50 d-flex align-items-center">
            <h5 className="fw-bold fs-5 ps-2 pt-2" id="title">
              {title}
            </h5>
          </div>
          <div className="w-50">
            <div className="d-flex align-items-center w-100">
              <Form.Control
                id="userSearch"
                type="text"
                placeholder="Search by Product Master"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                // eslint-disable-next-line no-undef
                onKeyPress={handleKeyPress}
              />
              <span className="search-magnifier-icon" onClick={handleSearch}>
                <CsLineIcons icon="search" />
              </span>
            </div>
          </div>
          {/* Search End */}
        </div>
      </Row>

      {/* List Header Start */}
      <Row className="g-0 h-100 align-content-center d-none d-lg-flex fw-bold p-3 bg-white mb-1 rounded pe-5 mb-2 row">
        <Col>
          <Row className="g-0 h-100 align-content-center custom-sort ps-3 pe-4 h-100">
            <Col xs="3" lg="6" className="d-flex flex-column mb-lg-0 pe-3 d-flex">
              <div className="text-dark text-md">Product Master Name</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 justify-content-center">
              <div className="text-dark text-md">Relational Pricing Status</div>
            </Col>
            <Col xs="2" lg="3" className="d-flex flex-column pe-1 ps-4 justify-content-center">
              <div className="text-dark text-md">Action</div>
            </Col>
          </Row>
        </Col>
      </Row>
      {/* List Header End */}

      {/* Single Card Begins Here */}
      {data && (
        <>
          {data.getTmtMaster?.map((product, index) => (
            <Card key={index} className="mb-2 hover-border-primary">
              <Row className="g-0 h-100 sh-lg-9 position-relative">
                <Col className="py-4 py-lg-0 ps-5 pe-4 h-100">
                  <Row className="g-0 h-100 align-content-center">
                    <Col xs="11" lg="6" className="d-flex flex-column mb-lg-0 mb-3 pe-3 d-flex  h-lg-100 justify-content-center">
                      {product.brandCompareCategory}
                    </Col>
                    <Col xs="2" lg="2" className="d-flex flex-column mb-2 mb-lg-0 align-items-center justify-content-lg-center">
                      <Form.Check className="form-check mt-2 ps-7 ps-md-2" type="checkbox" disabled checked={product.section} />
                    </Col>
                    <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 ">
                      <div className="text-muted text-small d-lg-none mb-1">Action</div>
                      <td className="text-end">
                        <div>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add Variant</Tooltip>}>
                            <div className="d-inline-block me-2">
                              <NavLink to={`add_variant/${product.brandCompareCategory}`} className="btn-icon btn-icon-only shadow">
                                <CsLineIcons icon="plus" className="text-primary" size="17" />
                              </NavLink>
                            </div>
                          </OverlayTrigger>
                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit Product Master Name</Tooltip>}>
                            <div className="d-inline-block me-2">
                              <NavLink to={`details/${product.id}`} className="btn-icon btn-icon-only shadow">
                                <CsLineIcons icon="edit-square" className="text-primary" size="17" />
                              </NavLink>
                            </div>
                          </OverlayTrigger>

                          <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Delete TMT Master</Tooltip>}>
                            <div className="d-inline-block me-2">
                              <Button
                                variant="foreground-alternate"
                                className="btn-icon btn-icon-only shadow"
                                onClick={() => {
                                  handleDeletemasterVariant(product.id);
                                }}
                              >
                                <CsLineIcons icon="bin" className="text-danger" size="17" />
                              </Button>
                            </div>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card >
          ))}
        </>
      )}
      {/* Single Card Ends Here */}

      {/* delete tmt modal starts */}
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete TMT Master</Modal.Title>
        </Modal.Header>
        {deletetmtMaster && <Modal.Body>Do you really want to delete {deletetmtMaster.brandCompareCategory}?</Modal.Body>}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
            No
          </Button>
          <Button variant="primary" onClick={() => deleteTMTMaster()}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
      {/* delete tmt modal ends */}
    </>
  );
};

export default withRouter(ListViewProduct);
