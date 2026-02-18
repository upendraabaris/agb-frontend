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
      sliderImage
      description
      parent {
        id
        name
        order
      }
      children {
        id
        image
        sliderImage
        description
        name
        order
        children {
          id
          image
          sliderImage
          name
          order
          description
          children {
            id
            name
            order
            image
            sliderImage
            description
            children {
              id
              name
              order
              image
              sliderImage
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

const UPDATE_CATEGORY = gql`
mutation UpdateCategory1($updateCategory1Id: ID!, $file: Upload, $sliderImage: String) {
  updateCategory1(id: $updateCategory1Id, file: $file, sliderImage: $sliderImage) {
    id
    sliderImage
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

  const handleCategoryToggle = (categoryId) => {
    if (openCategories.includes(categoryId)) {
      setOpenCategories(openCategories.filter((id) => id !== categoryId));
    } else {
      setOpenCategories([...openCategories, categoryId]);
    }
  };

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


  // update the category

  const [updateCatModalView, setUpdateCatModalView] = useState(false);

  const [originalCategory, setOriginalCategory] = useState(''); // in the side modal

  const [selectedCategoryForUpdate, setSelectedCategoryForUpdate] = useState(''); // to add subcategory to the category

  const [newcatName, setNewCatName] = useState('');
  const [editImg, setEditImg] = useState('');
  const [editSliderImg, setEditSliderImg] = useState('');
  const [editOrder, setEditOrder] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [newcatImage, setNewCatImage] = useState(null);
  const [newcatSliderImage, setNewCatSliderImage] = useState(null);

  // mutation for update the category
  const [UpdateCategory, updateResponse] = useMutation(UPDATE_CATEGORY, {
    onCompleted: () => {
      refetch();
      toast.success(`${updateResponse.data.updateCategory1.name} updated successfull!`);
      setUpdateCatModalView(false);
      setNewCatName('');
      setEditImg('');
      setEditSliderImg('');
      setEditOrder('');
      setNewCatImage(null);
      setNewCatSliderImage(null);
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
    setEditSliderImg(catImg);
    setEditOrder(orderNo);
  };
  const updateCategory1 = async (e) => {
    e.preventDefault();
  
    if (newcatName && selectedCategoryForUpdate && editImg && editSliderImg && editDesc && editOrder) {
      if (newcatSliderImage) {
        await UpdateCategory({
          variables: {
            name: newcatName,
            updateCategory1Id: selectedCategoryForUpdate,
            image: editImg,
            sliderImage: editSliderImg,
            order: parseInt(editOrder, 10),
            file: newcatSliderImage,
            description: editDesc,
          },
        });
      } else {
        await UpdateCategory({
          variables: {
            name: newcatName,
            updateCategory1Id: selectedCategoryForUpdate,
            image: editImg,
            sliderImage: editSliderImg,
            order: parseInt(editOrder, 10),
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
                  <Button variant="foreground-alternate" className="btn-icon border w-70 btn-icon-only shadow" onClick={() => handleCategoryToggle(category.id)}>
                    C {level + 1}
                    <CsLineIcons icon={openCategories.includes(category.id) ? 'arrow-bottom' : 'arrow-right'} />
                  </Button>
                )}
                {/* <div className="text-alternate">{category.name}</div> */}
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
              <Col xs="6" lg="2" className="d-flex flex-column align-items-center justify-content-center mb-2 mb-lg-0 order-2 order-lg-3 ">
                <div className="text-alternate mt-1" style={{ height: '50px', width: '50px' }}>
                 <a href={category.sliderImage} target="_blank" rel="noreferrer">
                        <img src={category.sliderImage} alt="cat_img" className="w-100 border p-1" />
                    </a>                                 
                </div>
              </Col>
              <Col xs="6" lg="4" className="d-flex flex-column text-center mb-2 mb-lg-0 order-5 order-lg-5">
                <div className="text-muted text-small d-lg-none mb-1">Action</div>
                <div>
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
    
      {/* List Header Start */}
      <div className="border fw-bold p-2 p mb-2 rounded bg-info">Category List</div>
      <Row className="g-0 h-100 bg-white mb-2 fw-bold rounded align-content-center d-none d-lg-flex p-3 custom-sort">
        <Col lg="1" className="d-flex flex-column mb-lg-0 pe-3">
          <div className="text-md text-center cursor-pointer">Level</div>
        </Col>

        <Col lg="3" className="d-flex flex-column mb-lg-0 pe-3">
          <div className="text-md cursor-pointer sort" onClick={() => handleSort()}>
            Category Name
          </div>
        </Col>
        <Col lg="2" className="d-flex flex-column mb-lg-0 text-center">
          <div className="text-md cursor-pointer">Images</div>
        </Col>
        <Col lg="2" className="d-flex flex-column mb-lg-0 text-center">
          <div className="text-md cursor-pointer">Slider Images</div>
        </Col>       
        <Col lg="4" className="d-flex flex-column pe-1 align-items-center">
          <div className="text-md cursor-pointer">Action</div>
        </Col>
      </Row>
      {data &&
        data.getAllCategories
          .filter((category) => !category.parent)
          .reverse()
          .map((category) => renderCategory(category))}     

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
            <Form onSubmit={updateCategory1}>
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
                  readOnly
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
                <Form.Control type="text" value={editOrder} hidden onChange={(e) => setEditOrder(e.target.value)} />
             
                <Form.Control type="text" maxLength="130" hidden value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
             
              <div className="mb-3">
                <Form.Label>New Slider Image</Form.Label>
                <Form.Control type="file" accept="sliderImage/*" onChange={(e) => setNewCatSliderImage(e.target.files[0])} />
              </div>
              <Button variant="primary" type="submit" className="btn-icon btn-icon-start">
                {/* <CsLineIcons icon="save" /> */}
                <span>Update</span>
              </Button>
            </Form>
          </OverlayScrollbarsComponent>
        </Modal.Body>
      </Modal>
      {/* update category modal ends  */}    
    </>
  );
};

export default ListViewCategory;
