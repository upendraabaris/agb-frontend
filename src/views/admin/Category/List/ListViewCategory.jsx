import React, { useEffect, useState } from 'react';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import HtmlHead from 'components/html-head/HtmlHead';
import { Row, Col, Button, Form, Card, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';

const GET_ALL_CATEGORIES = gql`
  query GetAllCategories($sortOrder: String, $sortBy: String, $offset: Int, $limit: Int, $search: String) {
    getAllCategories(sortOrder: $sortOrder, sortBy: $sortBy, offset: $offset, limit: $limit, search: $search) {
      id
      name
      order
      image
      description
      parent {
        id
        name
        order
      }
      children {
        id
        image
        description
        name
        order
        children {
          id
          image
          name
          order
          description
          children {
            id
            name
            order
            image
            description
            children {
              id
              name
              order
              image
              description
            }
          }
        }
      }
    }
  }
`;

const ADD_SUBCATEGORY = gql`
  mutation CreateCategory($name: String!, $file: Upload!, $description: String!, $parent: ID, $order: Int) {
    createCategory(name: $name, file: $file, description: $description, parent: $parent, order: $order) {
      id
      name
    }
  }
`;

const MASTER_CATEGORY = gql`
  mutation CreateCategory($name: String!, $file: Upload!, $description: String!, $order: Int) {
    createCategory(name: $name, file: $file, description: $description, order: $order) {
      id
      name
    }
  }
`;

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($deleteCategoryId: ID!) {
    deleteCategory(id: $deleteCategoryId) {
      id
      name
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($updateCategoryId: ID!, $image: String, $description: String, $file: Upload, $name: String, $order: Int) {
    updateCategory(id: $updateCategoryId, image: $image, description: $description, file: $file, name: $name, order: $order) {
      id
      name
      image
      description
    }
  }
`;

const ListViewCategory = () => {
  const title = 'Categories List';
  const description = 'Categories List';
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  // const [limit, setLimit] = useState(31);
  const [sortOrder, setSortOrder] = useState('ac');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [getAllCategories, { error, data, fetchMore, refetch }] = useLazyQuery(GET_ALL_CATEGORIES);
  const [openCategories, setOpenCategories] = useState([]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    getAllCategories({
      variables: {
        sortOrder,
        sortBy,
        offset,
        // limit,
        search,
      },
    });
  }, [offset, sortBy, sortOrder]);

  if (error) {
    toast.error(error.message || 'Something went wrong!');
    console.error('GET_ALL_CATEGORIES', error);
  }

  const handleSort = () => {
    if (sortOrder === 'ac') {
      setSortOrder('asc');
    } else {
      setSortOrder('ac');
    }

    getAllCategories({
      variables: {
        offset,
        sortBy,
        sortOrder,
      },
    });
  };

  // const handlePageChange = (newOffset) => {
  //   setOffset(newOffset);
  //   fetchMore({
  //     variables: { offset: newOffset },
  //   });
  // };

  const handleCategoryToggle = (categoryId) => {
    if (openCategories.includes(categoryId)) {
      setOpenCategories(openCategories.filter((id) => id !== categoryId));
    } else {
      setOpenCategories([...openCategories, categoryId]);
    }
  };

  const handleSearch = () => {
    getAllCategories({ variables: { search: debouncedSearch || undefined, offset } });
  };

  // add subcategory part

  // modal's values starts

  const [modalView, setModalview] = useState(false); // hide and show modal
  const [selectedCategory, setSelectedCategory] = useState(''); // to add subcategory to the category
  const [modalCategory, setModalCategory] = useState(''); // in the side modal
  const [newSubCat, setNewSubCat] = useState('');
  const [subImg, setSubImg] = useState(null);
  const [subDesc, setSubDesc] = useState('');
  const [subOrder, setSubOrder] = useState('');
  // modal's values ends

  const handleCatandModal = (id, catname) => {
    setModalview(true); // modal show
    setModalCategory(catname); // set category name at modal's input box
    setSelectedCategory(id); // category selected on + icon
  };

  const [CreateCategory, response] = useMutation(ADD_SUBCATEGORY, {
    onCompleted: () => {
      refetch();
      setModalview(false);
      toast.success(`${response.data.createCategory.name} created successfull!`);
      setNewSubCat('');
      setSelectedCategory('');
      setSubImg(null);
      setSubDesc('');
      setSubOrder('');
    },
    onError: (createsubcaterror) => {
      toast.error(createsubcaterror.message || 'Something went wrong!');
    },
  });

  const addNewSubcategory = async (e) => {
    e.preventDefault();
    if (newSubCat && selectedCategory && subImg && subDesc) {
      await CreateCategory({
        variables: {
          parent: selectedCategory,
          name: newSubCat.trim(),
          file: subImg,
          description: subDesc,
          order: parseInt(subOrder, 10),
        },
      });
    } else {
      toast.error('All fields are required!');
    }
  };

  // add master category

  const [masterCategory, setMasterCategory] = useState('');
  const [masterDesc, setMasterDesc] = useState('');
  const [masterImg, setMasterImg] = useState(null);
  const [masterOrder, setMasterOrder] = useState(0);
  const [createMaster, result] = useMutation(MASTER_CATEGORY, {
    onCompleted: () => {
      refetch();
      toast.success(`${result.data.createCategory.name} created successfull!`);
      setMasterCategory('');
      setMasterDesc('');
      setMasterImg(null);
      setMasterOrder(0);
    },
    onError: (createError) => {
      toast.error(createError.message || 'Something went wrong!'); 
    },
  });

  const addmasterCategory = async (e) => {
    e.preventDefault();

    if (masterCategory && masterDesc && masterImg && masterOrder) {
      await createMaster({
        variables: {
          name: masterCategory.trim(),
          file: masterImg,
          description: masterDesc,
          order: parseInt(masterOrder, 10),
        },
      });
      e.target.reset();
    } else {
      toast.error('All fields are required!');
    }
  };

  // delete category
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteCategoryName, setDeleteCategoryName] = useState('');
  const [deletecategoryId, setDeleteCategoryId] = useState('');
  const [categoryWithChildren, setCategoryWithChildren] = useState({});
  const [DeleteCategory, res] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => {
      toast(`${res.data.deleteCategory.name} deleted successfully!`);
      refetch();
      setDeleteModalView(false);
      setDeleteCategoryId('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const handleDeleteCategory = async (catId, catName, wholeCat) => {
    setDeleteModalView(true);
    setDeleteCategoryId(catId);
    setDeleteCategoryName(catName);
    setCategoryWithChildren(wholeCat);
  };

  const deleteCategory = async () => {
    if (categoryWithChildren && deletecategoryId) {
      if (!categoryWithChildren.children.length > 0) {
        await DeleteCategory({
          variables: {
            deleteCategoryId: deletecategoryId,
          },
        });
      } else {
        toast.error("You can't  delete category with children!");
      }
    } else {
      toast.error('Something went wrong in delete category!');
    }
  };

  // update the category

  const [updateCatModalView, setUpdateCatModalView] = useState(false);

  const [originalCategory, setOriginalCategory] = useState(''); // in the side modal

  const [selectedCategoryForUpdate, setSelectedCategoryForUpdate] = useState(''); // to add subcategory to the category

  const [newcatName, setNewCatName] = useState('');
  const [editImg, setEditImg] = useState('');
  const [editOrder, setEditOrder] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [newcatImage, setNewCatImage] = useState(null);

  // mutation for update the category
  const [UpdateCategory, updateResponse] = useMutation(UPDATE_CATEGORY, {
    onCompleted: () => {
      refetch();
      toast.success(`${updateResponse.data.updateCategory.name} updated successfull!`);
      setUpdateCatModalView(false);
      setNewCatName('');
      setEditImg('');
      setEditOrder('');
      setNewCatImage(null);
      setEditDesc('');
    },
    onError: (errorinupdate) => {
      console.error('UPDATE_CATEGORY', errorinupdate);
      toast.error(errorinupdate.message || 'Something went wrong!');
    },
  });

  const handleCategoryUpdate = (id, catname, catDesc, catImg, orderNo) => {
    setUpdateCatModalView(true);
    setOriginalCategory(catname);
    setSelectedCategoryForUpdate(id);
    setNewCatName(catname);
    setEditDesc(catDesc);
    setEditImg(catImg);
    setEditOrder(orderNo);
  };
  const updateCategory = async (e) => {
    e.preventDefault();

    if (newcatName && selectedCategoryForUpdate && editImg && editDesc && editOrder) {
      if (newcatImage) {
        await UpdateCategory({
          variables: {
            name: newcatName,
            updateCategoryId: selectedCategoryForUpdate,
            image: editImg,
            order: parseInt(editOrder, 10),
            file: newcatImage,
            description: editDesc,
          },
        });
      } else {
        await UpdateCategory({
          variables: {
            name: newcatName,
            updateCategoryId: selectedCategoryForUpdate,
            image: editImg,
            order: parseInt(editOrder, 10),
            description: editDesc,
          },
        });
      }
    } else {
      toast.error('All fields are required!');
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default form submission
      handleSearch();
    }
  };

  // categories items which renders
  const renderCategory = (category, level = 0) => {
    return (
      <div key={category.id} style={{ marginLeft: `${level * 10}px` }}>
        <Card className="mb-2">
          <Card.Body className="pt-0 pb-0 sh-30 sh-lg-8">
            <Row className="g-0 h-lg-100 mt-3 mt-lg-0 align-content-center">
              <Col xs="6" lg="1" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-4 order-lg-1 ">
                {category.children.length > 0 && (
                  <Button
                    variant="foreground-alternate"
                    className="btn-icon border w-70 btn-icon-only shadow"
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    C {level + 1}
                    <CsLineIcons icon={openCategories.includes(category.id) ? 'arrow-bottom' : 'arrow-right'} />
                  </Button>
                )}
              </Col>
              <Col xs="6" lg="3" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1 order-lg-2">
                <div className="text-muted text-small d-lg-none">Name</div>
                <NavLink to={`/category/${category.name}`}>
                  <div className="text-alternate fw-bold">{category.name}</div>
                </NavLink>
              </Col>
              <Col xs="6" lg="2" className="d-flex flex-column align-items-center justify-content-center mb-2 mb-lg-0 order-2 order-lg-3 ">
                <div className="text-alternate mt-1" style={{ height: '50px', width: '50px' }}>
                  <a href={category.image} target="_blank" rel="noreferrer">
                    <img src={category.image} alt="cat_img" className="w-100 border p-1" />
                  </a>
                </div>
              </Col>
              <Col xs="12" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-4">
                <div className="text-muted text-small d-lg-none">Description</div>
                <div className="text-alternate d-block text-truncate">{category.description}</div>
              </Col>
              <Col xs="12" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-4">
                <div className="text-muted text-small d-lg-none">Order</div>
                <div className="text-alternate d-block text-center">{category.order}</div>
              </Col>
              <Col xs="6" lg="2" className="d-flex flex-column justify-content-center align-items-end mb-2 mb-lg-0 order-5 order-lg-5">
                <div className="text-muted text-small d-lg-none mb-1">Action</div>
                <div>
                  <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Add SubCategory</Tooltip>}>
                    <div className="d-inline-block">
                      <Button
                        variant="foreground-alternate"
                        className="btn-icon btn-icon-only shadow"
                        onClick={() => handleCatandModal(category.id, category.name)}
                      >
                        <CsLineIcons icon="plus" className="text-primary" size="17" />
                      </Button>
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Edit Category</Tooltip>}>
                    <div className="d-inline-block">
                      <Button
                        variant="foreground-alternate"
                        className="btn-icon btn-icon-only shadow"
                        onClick={() => handleCategoryUpdate(category.id, category.name, category.description, category.image, category.order)}
                      >
                        <CsLineIcons icon="edit-square" className="text-primary" size="17" />
                      </Button>
                    </div>
                  </OverlayTrigger>
                  <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-top">Delete Category</Tooltip>}>
                    <div className="d-inline-block">
                      <Button
                        variant="foreground-alternate"
                        className="btn-icon btn-icon-only shadow"
                        onClick={() => {
                          handleDeleteCategory(category.id, category.name, category);
                        }}
                      >
                        <CsLineIcons icon="bin" className="text-primary" size="17" />
                      </Button>
                    </div>
                  </OverlayTrigger>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
        {openCategories.includes(category.id) && category.children.map((childCategory) => renderCategory(childCategory, level + 1))}
      </div>
    );
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-2">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="text-dark ms-1">Dashboard</span>
            </NavLink>
            <span className="p-1"> / </span>
            <span> {title} </span>
          </Col>
        </Row>
      </div>
      <Row className="m-0 mb-2 p-1 rounded bg-white align-items-center">
        <Col md="6">
          <span className="fw-bold fs-5 ps-2 pt-2">{title}</span>
        </Col>
      </Row>

      <div className="border rounded bg-white p-2 mb-2">
        <div className="border fw-bold p-2 p mb-2 rounded bg-info">Add Category 1</div>
        <div className="mb-3 mt-1">
          <Form onSubmit={addmasterCategory}>
            <Row>
              <div className="d-inline-block mb-2 col-6">
                <Form.Control
                  type="text"
                  placeholder="Add Category 1"
                  onChange={(e) => {
                    if (e.target.value.includes('_')) {
                      e.target.value = e.target.value.replace('_', '');
                    }
                    if (e.target.value.includes('/')) {
                      e.target.value = e.target.value.replace('/', '');
                    }
                    setMasterCategory(e.target.value);
                  }}
                />
              </div>
              <div className="d-inline-block mb-2 col-3">
                <Form.Select onChange={(e) => setMasterOrder(e.target.value)}>
                  <option value="">Select Rank No</option>
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="d-inline-block mb-2 col-3">
                <Form.Control type="file" accept="image/*" onChange={(e) => setMasterImg(e.target.files[0])} />
              </div>
            </Row>
            <Row>
              <div className="col-12 d-inline-block">
                <Form.Control as="textarea" rows={3} placeholder="Description" onChange={(e) => setMasterDesc(e.target.value)} />
              </div>
            </Row>
            <Row className="mb-2 mt-2">
              <Col className="d-flex justify-content-end">
                <Button variant="primary" type="submit">
                  Save
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
      {/* Search End */}

      {/* List Header Start */}
      <div className="border fw-bold p-2 p mb-2 rounded bg-info">Category List</div>
      <Row className="g-0 h-100 bg-white mb-2 fw-bold rounded align-content-center d-none d-lg-flex p-3 custom-sort">
        <Col lg="1" className="d-flex flex-column mb-lg-0 pe-3">
          <div className="text-md cursor-pointer">Level</div>
        </Col>

        <Col lg="3" className="d-flex flex-column mb-lg-0 pe-3">
          <div className="text-md cursor-pointer sort" onClick={() => handleSort()}>
            Category Name
          </div>
        </Col>
        <Col lg="2" className="d-flex flex-column mb-lg-0 text-center">
          <div className="text-md cursor-pointer">Images</div>
        </Col>
        <Col lg="2" className="d-flex flex-column mb-lg-0 pe-3">
          <div className="text-md cursor-pointer ">Description</div>
        </Col>
        <Col lg="2" className="d-flex flex-column mb-lg-0 pe-3 align-items-center">
          <div className="text-md cursor-pointer ">Order</div>
        </Col>
        <Col lg="2" className="d-flex flex-column pe-1 align-items-center">
          <div className="text-md cursor-pointer">Action</div>
        </Col>
      </Row>
      {!data ? (
        <div className="d-flex justify-content-center pt-5">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">Loading...</div>
          </div>
        </div>
      ) : (
        data.getAllCategories
          .filter((category) => !category.parent)
          .reverse()
          .map((category) => renderCategory(category))
      )}

      {/* Add sub category Modal Start */}

      <Modal className="modal-right scroll-out-negative" show={modalView} onHide={() => setModalview(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h5" className="text-dark">
            Add Subcategory
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form onSubmit={addNewSubcategory}>
              {modalCategory && (
                <div className="mb-3">
                  <Form.Label className="text-dark">Master Category Name</Form.Label>
                  <Form.Control type="text" defaultValue={modalCategory} readOnly />
                </div>
              )}
              <div className="mb-3">
                <Form.Label className="text-dark">
                  Add Subcategory <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  onChange={(e) => {
                    if (e.target.value.includes('_')) {
                      e.target.value = e.target.value.replace('_', '');
                    }
                    if (e.target.value.includes('/')) {
                      e.target.value = e.target.value.replace('/', '');
                    }
                    setNewSubCat(e.target.value);
                  }}
                />
              </div>
              <div className="mb-3">
                <Form.Label className="text-dark">
                  Add Subcategory Order <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select value={subOrder} onChange={(e) => setSubOrder(e.target.value)}>
                  <option value="">Select Order</option>
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </Form.Select>
              </div>

              <div className="mb-3">
                <Form.Label className="text-dark">
                  Add Subcategory Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control as="textarea" rows={3} onChange={(e) => setSubDesc(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label className="text-dark">
                  Add Subcategory Image <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => setSubImg(e.target.files[0])} />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                <span> Save</span>
              </Button>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
      </Modal>
      {/* Add sub category Modal End */}

      {/* update category modal starts  */}
      <Modal
        className="modal-right scroll-out-negative"
        show={updateCatModalView}
        onHide={() => setUpdateCatModalView(false)}
        scrollable
        dialogClassName="full"
      >
        <Modal.Header closeButton>
          <Modal.Title as="h5">Update Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form onSubmit={updateCategory}>
              {originalCategory && (
                <div className="mb-3">
                  <Form.Label className="text-dark">Category Name</Form.Label>
                  <Form.Control type="text" defaultValue={originalCategory} readOnly />
                </div>
              )}
              <div className="mb-3">
                <Form.Label className="text-dark">
                  New Category <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={newcatName}
                  onChange={(e) => {
                    if (e.target.value.includes('_')) {
                      e.target.value = e.target.value.replace('_', '');
                    }
                    if (e.target.value.includes('/')) {
                      e.target.value = e.target.value.replace('/', '');
                    }
                    setNewCatName(e.target.value);
                  }}
                />
              </div>
              <div className="mb-3">
                <Form.Label className="text-dark">
                  New Order <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select value={editOrder} onChange={(e) => setEditOrder(e.target.value)}>
                  <option value="">Select Order</option>
                  {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </Form.Select>
              </div>
              <div className="mb-3">
                <Form.Label className="text-dark">
                  New Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control as="textarea" rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label className="text-dark">New Image</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => setNewCatImage(e.target.files[0])} />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                <span>Update</span>
              </Button>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
      </Modal>
      {/* update category modal ends  */}

      {/* delete category modal starts */}
      <Modal show={deleteModalView} onHide={() => setDeleteModalView(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Category</Modal.Title>
        </Modal.Header>
        {deleteCategoryName && <Modal.Body>Do you really want to delete {deleteCategoryName}?</Modal.Body>}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModalView(false)}>
            No, Go Back
          </Button>
          <Button variant="primary" onClick={() => deleteCategory()}>
            Yes, Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ListViewCategory;
