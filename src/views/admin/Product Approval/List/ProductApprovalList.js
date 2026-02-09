import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Row, Tab, Tabs, Col } from 'react-bootstrap';
import HtmlHead from 'components/html-head/HtmlHead';
import { useDispatch } from 'react-redux';
import { menuChangeUseSidebar } from 'layout/nav/main-menu/menuSlice';
import PendingList from './components/PendingList';
import ApprovedList from './components/ApprovedList';
import RejectedList from './components/RejectedList';

function ProductApprovalList() {
  const title = 'Product Approval List';
  const description = 'Ecommerce Product Approval List Page';
  const dispatch = useDispatch();
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0); // New state for total count

  useEffect(() => {
    dispatch(menuChangeUseSidebar(true));
  }, [dispatch]);

  useEffect(() => {
    // Calculate total count when any count changes
    setTotalCount(pendingCount + approvedCount + rejectedCount);
  }, [pendingCount, approvedCount, rejectedCount]);

  return (
    <>
      <HtmlHead title={title} description={description} />
      <div className="page-title-container m-0">
        <Row className="g-0">
          <Col className="col-auto mb-3 mb-sm-0 me-auto">
            <NavLink className="muted-link pb-1 d-inline-block hidden breadcrumb-back" to="/admin/dashboard">
              <span className="align-middle text-dark text-small ms-1">Dashboard</span>
            </NavLink>
          </Col>
        </Row>
      </div>
      <h1 className="mb-0 pb-2 text-center fw-bold" id="title">
        {title}
      </h1>
      <Tabs defaultActiveKey="pending_list" id="justify-tab-example" className="mb-0" justify>
        <Tab eventKey="pending_list" title={`Pending Approvals (${pendingCount})`}>
          <PendingList setPendingCount={setPendingCount} />
        </Tab>
        <Tab eventKey="approved_list" title={`Approved (${approvedCount})`}>
          <ApprovedList setApprovedCount={setApprovedCount} />
        </Tab>
        <Tab eventKey="rejected_list" title={`Rejected (${rejectedCount})`}>
          <RejectedList setRejectedCount={setRejectedCount} />
        </Tab>
      </Tabs>
    </>
  );
}

export default ProductApprovalList;
