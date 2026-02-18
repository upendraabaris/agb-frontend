import React, { useEffect, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Tooltip, OverlayTrigger, Modal, Tab, Tabs } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useQuery, useMutation } from '@apollo/client';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import SectionDiffTrueList from './components/SectionDiffTrueList';
import SectionDiffFalseList from './components/SectionDiffFalseList';

const GET_ALL_TMT_MASTER = gql`
  query GetAllTMTSeriesProductForSeller {
    getAllTMTSeriesProductForSeller {
      id
      active
      images
      previewName
      brand_name
      identifier
      thumbnail
      fullName
      sku
      section
      tmtseriesvariant {
        variantName
        tmtserieslocation {
          price
          sectionDiff
          sellerId {
            companyName
          }
        }
      }
    }
  }
`;
const UPDATEPRICEBYSD = gql`
  mutation UpdateTMTPriceBySD($updateTmtPriceBySdId: ID, $price: Float) {
    updateTMTPriceBySD(id: $updateTmtPriceBySdId, price: $price) {
      id
    }
  }
`;
const UPDATE_TMT_SERIES_PRODUCT = gql`
  mutation UpdateTMTSereiesProduct($updateTmtSereiesProductId: ID, $active: Boolean) {
    updateTMTSereiesProduct(id: $updateTmtSereiesProductId, active: $active) {
      id
    }
  }
`;
const DELETE_TMT_SERIES_PRODUCT = gql`
  mutation DeleteTMTSeriesProduct($deleteTmtSeriesProductId: ID!) {
    deleteTMTSeriesProduct(id: $deleteTmtSeriesProductId) {
      id
    }
  }
`;

const ListViewProduct = ({ history }) => {
  const title = 'Series Product List - Fixed Variant';
  const description = 'Series Product List Page';
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);
  const [sectionTrue, setSectionTrue] = useState([]);
  const [sectionFalse, setSectionFalse] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { error, data, refetch } = useQuery(GET_ALL_TMT_MASTER, {
    onCompleted: () => {
      if (data && data.getAllTMTSeriesProductForSeller) { 
        const categorizedProducts = {
          sectionTrue: [],
          sectionFalse: [],
        };
        data.getAllTMTSeriesProductForSeller.forEach((product) => {
          if (product.section) {
            categorizedProducts.sectionTrue.push(product);
          } else {
            categorizedProducts.sectionFalse.push(product);
          }
        });
        setSectionTrue(categorizedProducts.sectionTrue);
        setSectionFalse(categorizedProducts.sectionFalse);
      }
    },
    onError: () => {
      console.log('Error!!!', error.message);
    },
  });
  useEffect(() => {
    refetch();
  }, []);

  if (error) {
    console.log(`GET_ALL_TMT_MASTER!!! : ${error.message}`);
  }

  const [formData, setformData] = useState({ updateTmtPriceBySdId: '', price: null });
  const [modalView, setModalView] = useState(false);
  const [UpdateTMTPriceBySD] = useMutation(UPDATEPRICEBYSD, {
    onCompleted: () => {
      toast.success('Price Updated successfully');
      setModalView(false);
      refetch();
      setformData({ updateTmtPriceBySdId: '', price: null });
    },
    onError: (err) => {
      console.log('UPDATEPRICEBYSD', err);
    },
  });

  const updatePrice = async (tmtID) => {
    setModalView(true);
    setformData((prevFormData) => ({
      ...prevFormData,
      updateTmtPriceBySdId: tmtID,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    await UpdateTMTPriceBySD({
      variables: formData,
    });
  };

  const [UpdateTMTSereiesProduct] = useMutation(UPDATE_TMT_SERIES_PRODUCT, {
    onCompleted: () => {
      toast.success('Active Status changed Successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!'); 
    },
  });

  const liveThisProduct = async (e, id) => {
    const { checked } = e.target;

    await UpdateTMTSereiesProduct({
      variables: {
        updateTmtSereiesProductId: id,
        active: checked,
      },
    });
    refetch();
  };

  // handle delete

  const [deletemodalView, setdeletemodalView] = useState(false);
  const [deleteproductID, setdeleteproductID] = useState(null);

  const [DeleteTMTSeriesProduct] = useMutation(DELETE_TMT_SERIES_PRODUCT, {
    onCompleted: () => {
      toast.success('Product deleted Successfully!');
      setdeletemodalView(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!'); 
    },
  });

  const deleteTmtSeriesProduct = async (e) => {
    e.preventDefault();
    await DeleteTMTSeriesProduct({
      variables: {
        deleteTmtSeriesProductId: deleteproductID,
      },
    });
    refetch();
  };

  const handleSelect = (key) => {
    if (key === "section_true") {
      history.push("/seller/tmt_product/list");
    } else if (key === "section_false") {
      history.push("/seller/tmt_product/relationallist");
    }
  };

  const filteredSectionTrue = sectionTrue.filter((product) =>
    product.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSectionFalse = sectionFalse.filter((product) =>
    product.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container mb-1">
        <Row className="g-0">
          {/* Title Start */}
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/seller/dashboard">
              <span className="text-dark ms-1">Dashboard</span>
            </NavLink>
          </Col>
          <div className="d-flex bg-white rounded p-2 flex-wrap align-items-center justify-content-between">
            <h1 className="mb-0 pb-0 fw-bold text-dark h4 ms-2" id="title">
              {title}
            </h1>
            <Col xs="12" sm="auto" className="d-flex align-items-end justify-content-end mb-2 mb-sm-0 order-sm-3">
              <Button
                variant="outline-primary"
                onClick={() => {
                  history.push('/seller/tmt_product/add');
                }}
                className="btn-icon btn-icon-start ms-0 ms-sm-1 w-100 w-md-auto"
              >
                <span>Add Series Product</span>
              </Button>
            </Col>
          </div>
        </Row>
      </div>

      <Row className="bg-white rounded p-1 m-0 mb-2">
        <Col md="5" lg="6" xxl="2" className="mb-1">
          <div className="d-inline-block float-md-start me-1 mb-1 search-input-container w-100 shadow bg-foreground">
            <Form.Control
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-magnifier-icon">
              <CsLineIcons icon="search" />
            </span>
            <span
              className={`search-delete-icon ${searchQuery ? '' : 'd-none'}`}
              onClick={() => setSearchQuery('')}
            >
              <CsLineIcons icon="close" />
            </span>

          </div>
        </Col>
        <Col md="7" lg="6" xxl="10" className="mb-1 text-end">
          {/* Length Start */}
          <Dropdown align={{ xs: 'end' }} className="d-inline-block ms-1">
            <OverlayTrigger delay={{ show: 1000, hide: 0 }} placement="top" overlay={<Tooltip id="tooltip-top">Item Count</Tooltip>}>
              <Dropdown.Toggle variant="foreground-alternate" className="shadow sw-13">
                10 Items
              </Dropdown.Toggle>
            </OverlayTrigger>
            <Dropdown.Menu className="shadow dropdown-menu-end">
              <Dropdown.Item href="#">5 Items</Dropdown.Item>
              <Dropdown.Item href="#">10 Items</Dropdown.Item>
              <Dropdown.Item href="#">20 Items</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {/* Length End */}
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="section_false"
        id="justify-tab-example"
        className="mb-3"
        justify
        onSelect={handleSelect}
      >
        <Tab eventKey="section_true" title="Regular Series Products (Fixed Variants)">
          {filteredSectionFalse && filteredSectionFalse.length > 0 ? (
            <SectionDiffFalseList
              data={filteredSectionFalse}
              updatePrice={updatePrice}
              setdeleteproductID={setdeleteproductID}
              setdeletemodalView={setdeletemodalView}
              liveThisProduct={liveThisProduct}
            />
          ) : (
            <div className="text-center text-muted p-3">Product not found</div>
          )}
        </Tab>

        <Tab eventKey="section_false" title="Relational Series Products (Fixed Variants)">
          {filteredSectionTrue && filteredSectionTrue.length > 0 ? (
            <SectionDiffTrueList
              data={filteredSectionTrue}
              updatePrice={updatePrice}
              setdeleteproductID={setdeleteproductID}
              setdeletemodalView={setdeletemodalView}
              liveThisProduct={liveThisProduct}
            />
          ) : (
            <div className="text-center text-muted p-3">Product not found</div>
          )}
        </Tab>
      </Tabs>

      {/* update price modal */}

      <Modal size="sm" aria-labelledby="contained-modal-title-vcenter" centered show={modalView} onHide={() => setModalView(!modalView)}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Update Price !</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="updateprice" className="tooltip-end-bottom" onSubmit={submit}>
            <div className="mb-3 filled form-group tooltip-end-top">
              <CsLineIcons icon="money" />
              <Form.Control
                type="number"
                name="price"
                required
                placeholder="Enter Price"
                value={formData.price || ''}
                onChange={(e) =>
                  setformData((prevFormData) => ({
                    ...prevFormData,
                    price: parseFloat(e.target.value),
                  }))
                }
                min={0}
                step="0.01"
              />
            </div>
            <div className="text-center">
              <button className="btn btn-primary btn-lg" type="submit">
                Submit
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* delete modal  */}
      <Modal size="sm" aria-labelledby="contained-modal-title-vcenter" centered show={deletemodalView} onHide={() => setdeletemodalView(!deletemodalView)}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Delete Product !</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id="deleteproduct" className="tooltip-end-bottom" onSubmit={deleteTmtSeriesProduct}>
            <div className="mb-3 filled form-group tooltip-end-top">
              <Form.Label>Sure to delete this product !</Form.Label>
            </div>
            <div className="text-center">
              <button className="btn btn-primary btn-lg" type="submit">
                Submit
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default withRouter(ListViewProduct);
