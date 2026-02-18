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
      image
      description
      parent {
        id
        name
      }
      children {
        id
        image
        description
        name
        children {
          id
          image
          name
          description
          children {
            id
            name
            image
            description
            children {
              id
              name
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
  mutation CreateCategory($name: String!, $file: Upload!, $description: String!, $parent: ID) {
    createCategory(name: $name, file: $file, description: $description, parent: $parent) {
      id
      name
    }
  }
`;

const MASTER_CATEGORY = gql`
  mutation CreateCategory($name: String!, $file: Upload!, $description: String!) {
    createCategory(name: $name, file: $file, description: $description) {
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
  mutation UpdateCategory($updateCategoryId: ID!, $image: String, $description: String, $file: Upload, $name: String) {
    updateCategory(id: $updateCategoryId, image: $image, description: $description, file: $file, name: $name) {
      id
      name
      image
      description
    }
  }
`;

const ListViewCategory = () => {
  const title = 'Categories List';
  const description = 'Ecommerce Category List Page';
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
  const [createMaster, result] = useMutation(MASTER_CATEGORY, {
    onCompleted: () => {
      refetch();
      toast.success(`${result.data.createCategory.name} created successfull!`);
      setMasterCategory('');
      setMasterDesc('');
      setMasterImg(null);
    },
    onError: (createError) => {
      toast.error(createError.message || 'Something went wrong!');
    },
  });

  const addmasterCategory = async (e) => {
    e.preventDefault();

    if (masterCategory && masterDesc && masterImg) {
      await createMaster({
        variables: {
          name: masterCategory.trim(),
          file: masterImg,
          description: masterDesc,
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
      setNewCatImage(null);
      setEditDesc('');
    },
    onError: (errorinupdate) => {
      console.error('UPDATE_CATEGORY', errorinupdate);
      toast.error(errorinupdate.message || 'Something went wrong!');
    },
  });

  const handleCategoryUpdate = (id, catname, catDesc, catImg) => {
    setUpdateCatModalView(true);
    setOriginalCategory(catname);
    setSelectedCategoryForUpdate(id);
    setNewCatName(catname);
    setEditDesc(catDesc);
    setEditImg(catImg);
  };
  const updateCategory = async (e) => {
    e.preventDefault();

    if (newcatName && selectedCategoryForUpdate && editImg && editDesc) {
      if (newcatImage) {
        await UpdateCategory({
          variables: {
            name: newcatName,
            updateCategoryId: selectedCategoryForUpdate,
            image: editImg,
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
            description: editDesc,
          },
        });
      }
    } else {
      toast.error('All fields are required!');
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
                  <Button variant="foreground-alternate" className="btn-icon btn-icon-only shadow" onClick={() => handleCategoryToggle(category.id)}>
                    C {level + 1}
                    <CsLineIcons icon={openCategories.includes(category.id) ? 'arrow-bottom' : 'arrow-right'} />
                  </Button>
                )}
                {/* <div className="text-alternate">{category.name}</div> */}
              </Col>
              <Col xs="6" lg="2" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-1 order-lg-2">
                <div className="text-muted text-small d-lg-none">Name</div>
                <NavLink to={`/category/${category.name}`}>
                  <div className="text-alternate">{category.name}</div>
                </NavLink>
              </Col>
              <Col xs="6" lg="2" className="d-flex flex-column align-items-center justify-content-center mb-2 mb-lg-0 order-2 order-lg-3 ">
                <div className="text-alternate mt-1" style={{ height: '50px', width: '60px' }}>
                  <a href={category.image} target="_blank" rel="noreferrer">
                    <img src={category.image} alt="cat_img" className="h-100 w-100" />
                  </a>
                </div>
              </Col>
              <Col xs="12" lg="5" className="d-flex flex-column justify-content-center mb-2 mb-lg-0 order-3 order-lg-4">
                <div className="text-muted text-small d-lg-none">Description</div>
                <div className="text-alternate d-block">{category.description}</div>
              </Col>
              {/* Buttons Options */}
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
                        onClick={() => handleCategoryUpdate(category.id, category.name, category.description, category.image)}
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
      <Row className="mb-3">
        <Col md="5" lg="3" xxl="2" className="mb-1">
          {/* Search Start */}
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control id="userSearch" type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <span className="search-magnifier-icon" onClick={handleSearch}>
              <CsLineIcons icon="search" />
            </span>
            <span className="search-delete-icon d-none">
              <CsLineIcons icon="close" />
            </span>
          </div>
        </Col>
        {/* <Col md="7" lg="9" xxl="10" className="mb-1 text-end">
        <Dropdown onSelect={(e) => setLimit(parseInt(e, 10))}  align={{ xs: 'end' }} className="d-inline-block ms-1">
          <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">Item Count</Tooltip>}>
            <Dropdown.Toggle variant="foreground-alternate" className="shadow sw-13">
              {limit} Items
            </Dropdown.Toggle>
          </OverlayTrigger>
          <Dropdown.Menu className="shadow dropdown-menu-end">
            <Dropdown.Item eventKey="5" >5 Items</Dropdown.Item>
            <Dropdown.Item eventKey="10">10 Items</Dropdown.Item>
            <Dropdown.Item  eventKey="15">15 Items</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown></Col> */}
      </Row>

      {/* Master Catergory Section */}
      <h2 className="small-title">Add Main Category</h2>
      <div className="mb-3 mt-1">
        {/* Search End */}

        <Form onSubmit={addmasterCategory}>
          <Row>
            <div className="d-inline-block mb-2 col-6">
              <Form.Control
                type="text"
                placeholder="Add Master Category"
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
            <div className="d-inline-block mb-2 col-6">
              <Form.Control type="file" accept="image/*" onChange={(e) => setMasterImg(e.target.files[0])} />
            </div>
          </Row>
          <Row>
            <div className="col-12 d-inline-block">
              <Form.Control type="text" placeholder="Description" maxLength="130" onChange={(e) => setMasterDesc(e.target.value)} />
            </div>
          </Row>
          <Row className="mb-2 mt-2">
            <Button variant="primary" type="submit" className="col-lg-2 d-inline-block  btn-icon btn-icon-start d-inline-block mx-lg-auto">
              <CsLineIcons icon="save" />
              <span> Add</span>
            </Button>
          </Row>
        </Form>
      </div>
      {/* Master Catergory Section */}

      {/* List Header Start */}
      <h2 className="small-title">Category List</h2>
      <Row className="g-0 h-100 align-content-center d-none d-lg-flex ps-5 pe-5 mb-2 custom-sort">
        <Col lg="1" className="d-flex flex-column mb-lg-0 pe-3">
          <div className="text-md cursor-pointer">Level</div>
        </Col>

        <Col lg="2" className="d-flex flex-column mb-lg-0 pe-3">
          <div className="text-md cursor-pointer sort" onClick={() => handleSort()}>
            Category Name
          </div>
        </Col>
        <Col lg="2" className="d-flex flex-column mb-lg-0 align-items-start">
          <div className="text-md cursor-pointer">Images</div>
        </Col>
        <Col lg="3" className="d-flex flex-column mb-lg-0 pe-3 align-items-center">
          <div className="text-md cursor-pointer ">Description</div>
        </Col>
        <Col lg="4" className="d-flex flex-column pe-1 align-items-end">
          <div className="text-md cursor-pointer">Action</div>
        </Col>
      </Row>
      {data &&
        data.getAllCategories
          .filter((category) => !category.parent)
          .reverse()
          .map((category) => renderCategory(category))}

      {/* Add sub category Modal Start */}

      <Modal className="modal-right scroll-out-negative" show={modalView} onHide={() => setModalview(false)} scrollable dialogClassName="full">
        <Modal.Header closeButton>
          <Modal.Title as="h5">Add Subcategory</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <OverlayScrollbarsComponent options={{ overflowBehavior: { x: 'hidden', y: 'scroll' } }} className="scroll-track-visible">
            <Form onSubmit={addNewSubcategory}>
              {modalCategory && (
                <div className="mb-3">
                  <Form.Label>Master Category Name</Form.Label>
                  <Form.Control type="text" defaultValue={modalCategory} readOnly />
                </div>
              )}
              <div className="mb-3">
                <Form.Label>Add Subcategory</Form.Label>
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
                <Form.Label>Add Subcategory Description</Form.Label>
                <Form.Control type="text" maxLength="130" onChange={(e) => setSubDesc(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label>Add Subcategory Image</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => setSubImg(e.target.files[0])} />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                <CsLineIcons icon="save" />
                <span> Add</span>
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
                  <Form.Label>Category Name</Form.Label>
                  <Form.Control type="text" defaultValue={originalCategory} readOnly />
                </div>
              )}
              <div className="mb-3">
                <Form.Label>New Category</Form.Label>
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
                <Form.Label>New Description</Form.Label>
                <Form.Control type="text"  value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>
              <div className="mb-3">
                <Form.Label>New Image</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e) => setNewCatImage(e.target.files[0])} />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                <CsLineIcons icon="save" />
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
      {/* delete category modal ends */}

      {/* Pagination */}
      {/* {data && <div className="d-flex justify-content-center mt-5">
        <Pagination>
          <Pagination.Prev className="shadow" onClick={() => handlePageChange(Math.max(offset - limit, 0))} disabled={offset === 0}>
            <CsLineIcons icon="chevron-left" />
          </Pagination.Prev>
       
          <Pagination.Next className="shadow" onClick={() => handlePageChange(offset + limit)} disabled={data.getAllCategories?.length < limit}>
            <CsLineIcons icon="chevron-right" />
          </Pagination.Next>
        </Pagination>
      </div>} */}
    </>
  );
};

export default ListViewCategory;
