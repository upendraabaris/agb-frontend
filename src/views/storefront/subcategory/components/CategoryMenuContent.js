import React from 'react';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { Row, Col } from 'react-bootstrap';
import { NavLink, useParams } from 'react-router-dom';

const CategoryMenuContent = ({ subcatValue }) => {
  const params = useParams();

  // अगर order field है तो उसे sort करें
  const sortedChildren = subcatValue.getCategoryByName?.children
    ? [...subcatValue.getCategoryByName.children].sort((a, b) => {
        // order null/undefined हो तो उसे सबसे पीछे रखें
        return (a.order ?? Infinity) - (b.order ?? Infinity);
      })
    : [];

  return (
    <>
      <Row className="flex-column ms-3 ">
        {sortedChildren.length > 0 ? (
          sortedChildren.map((subcat, index) => (
            <Col key={index} className="list">
              <NavLink
                to={`/category/${subcat.name.replace(/\s/g, '_').toLowerCase()}`}
                className="list d-inline nav-link body-link px-0 py-2"
              >
                {subcat?.name}
                {subcat?.children?.length > 0 && (
                  <CsLineIcons
                    icon="chevron-right"
                    className="align-middle float-end"
                    size="13"
                  />
                )}
              </NavLink>
            </Col>
          ))
        ) : (
          <Col>{params.categoryname.replaceAll('_', ' ').toUpperCase()}</Col>
        )}
      </Row>
    </>
  );
};

export default CategoryMenuContent;
