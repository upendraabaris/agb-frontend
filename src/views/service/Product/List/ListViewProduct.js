import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { Row, Col, Button, Dropdown, Form, Card, Modal, Pagination, Tooltip, OverlayTrigger, Spinner } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import CheckAll from 'components/check-all/CheckAll';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { toast } from 'react-toastify';

const ListViewProduct = () => {
  const title = 'Service Product List';
  const description = 'Service Product List';
  const history = useHistory();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('fullName');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_PRODUCT_ENQUIRY_BY_FOR_SELLER = gql`
    query GetProductEnquiryByForSeller($search: String, $offset: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
      getProductEnquiryByForSeller(search: $search, offset: $offset, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
        approve
        fullName
        id
        images
        previewName
        thumbnail
        active
        brand_name
        sku
        identifier
      }
    }
  `;
  // attribute, brandName, category, seller, sku

  const [getProduct, { loading, data, fetchMore, refetch }] = useLazyQuery(GET_PRODUCT_ENQUIRY_BY_FOR_SELLER, {
    onError: (error) => {
      if (error) {
        toast.error(error.message || 'Something went wrong !');
        if (error.message === 'Authorization header is missing' || error.message === 'jwt expired') {
          setTimeout(() => {
            history.push('/login');
          }, 2000);
        } 
      }
    },
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [search]);

  useEffect(() => {
    getProduct({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
    // Execute the getProduct function when the component mounts
  }, [getProduct, offset, limit, sortBy, sortOrder]);

  // const handleSearch = (searchTerm) => {
  //   setDebouncedSearch(searchTerm);
  // };

  useEffect(() => {
    if (debouncedSearch) {
      getProduct({ variables: { search: debouncedSearch, limit, offset } });
    } else {
      getProduct({ variables: { limit, offset } });
    }
  }, [debouncedSearch, getProduct, limit, offset]);

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
  };

  const handleSort = (event) => {
    setSortBy(event);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    getProduct({
      variables: {
        limit,
        offset,
        sortBy: event,
        sortOrder: sortOrder === 'asc' ? 'desc' : 'asc',
      },
    });
  };

  const handlePageChange = (newOffset) => {
    setOffset(newOffset);
    fetchMore({
      variables: { offset: newOffset },
    });
  };

  function handleClick() {
    history.push('/Service/product/add');
  }

  // handle product delete

  const DELETE_INDIVIDUAL_PRODUCT = gql`
    mutation DeleteProduct($deleteProductId: ID!) {
      deleteProduct(id: $deleteProductId) {
        id
      }
    }
  `;

  // delete Product
  const [deleteModalView, setDeleteModalView] = useState(false);
  const [deleteProductName, setDeleteProductName] = useState('');
  const [deleteIndividualProductId, setDeleteIndividualProductId] = useState('');

  const [DeleteProduct] = useMutation(DELETE_INDIVIDUAL_PRODUCT, {
    onCompleted: () => {
      toast('Deleted successfully!');
      setDeleteModalView(false);
      refetch();
      setDeleteProductName('');
      setDeleteIndividualProductId('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong!'); 
    },
  });

  const deleteProduct = (prodId, prodfullName) => {
    setDeleteModalView(true);
    setDeleteIndividualProductId(prodId);
    setDeleteProductName(prodfullName);
  };

  const deleteProductEntry = async () => {
    if (deleteIndividualProductId) {
      await DeleteProduct({
        variables: {
          deleteProductId: deleteIndividualProductId,
        },
      });
    } else {
      toast.error('Something went wrong in DELETE_INDIVIDUAL_PRODUCT!');
    }
  };

  // product live

  const ACTIVE_PRODUCT = gql`
    mutation ActiveProduct($activeProductId: ID, $active: Boolean) {
      activeProduct(id: $activeProductId, active: $active) {
        id
      }
    }
  `;

  const [ActiveProduct] = useMutation(ACTIVE_PRODUCT, {
    onCompleted: () => {
      toast('Product Updated Successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went Wrong!'); 
    },
  });

  const liveThisProduct = async (e, id) => {
    const { checked } = e.target;

    await ActiveProduct({
      variables: {
        activeProductId: id,
        active: checked,
      },
    });
    refetch();
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container">
        <Row className="g-0 pt-6 text-center">
          <div className="fs-4 pt-6 fw-bold">
            Work in Process...
          </div>
        </Row>
      </div>


    </>
  );
};

export default ListViewProduct;
