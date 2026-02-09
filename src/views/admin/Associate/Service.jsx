import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Col, Dropdown, Form, Card, Pagination, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import HtmlHead from 'components/html-head/HtmlHead';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import { gql, useLazyQuery } from '@apollo/client';

function ListSeller() {
  const title = 'Service List';
  const description = 'Ecommerce Seller List Page';
  const dispatch = useDispatch();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
    // eslint-disable-next-line
  }, []);

  const GET_ALL_SELLERS = gql`
    query GetAllSellers($search: String, $limit: Int, $offset: Int, $sortBy: String, $sortOrder: String) {
      getAllSellers(search: $search, limit: $limit, offset: $offset, sortBy: $sortBy, sortOrder: $sortOrder) {
        id
        email
        companyName
        companyDescription
        address
        gstin
        mobileNo
      }
    }
  `;
  const [getAllSeller, { error, data, fetchMore, refetch }] = useLazyQuery(GET_ALL_SELLERS);
  if (error) {
    console.error('GET_ALL_SELLERS', error);
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

    getAllSeller({
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
    getAllSeller({ variables: { offset, limit, sortBy, sortOrder } });
    refetch();
    // Execute the getUsers function when the component mounts
  }, [getAllSeller, offset, limit, sortBy, sortOrder]);

  const handleSearch = () => {
    getAllSeller({ variables: { search: debouncedSearch || undefined, limit, offset } });
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); 
      handleSearch();
    }
  };

  return (
    <>
      <HtmlHead title={title} description={description} />
    

      {/* List Header Start */}
      <Row className="g-0 h-100 align-content-center d-none d-lg-flex p-3 rounded bg-white ps-5 mb-2 fw-bold custom-sort">
        <h1 className="p-6 fw-bold text-dark text-center">Under Working</h1>
      </Row>
    </>
  );
}
export default ListSeller;
