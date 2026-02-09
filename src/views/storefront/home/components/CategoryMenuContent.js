import React, { useState, useEffect, useLayoutEffect } from 'react';
import { NavLink } from 'react-router-dom';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import './style.css';
import { Button } from 'react-bootstrap';
import Loading from 'components/loading/Loading';
import { useGlobleContext } from 'context/styleColor/ColorContext';

const GET_TOP_CATEGORY = gql`
  query GetAllCategories($sortOrder: String, $sortBy: String) {
    getAllCategories(sortOrder: $sortOrder, sortBy: $sortBy) {
      id
      name
      order
      parent {
        id
      }
      children {
        id
        name
        order
        children {
          id
          name
          order
          children {
            id
            name
            order
          }
        }
      }
    }
  }
`;

const CategoryMenuContent = () => {
  const { dataStoreFeatures1 } = useGlobleContext();
  const [selectedId, setSelectedId] = useState(null);
  const [selectedIdChild, setSelectedIdChild] = useState(null);

  const changeColor = (id) => {
    setSelectedId(id);
  };
  const changeColorChild = (id) => {
    setSelectedIdChild(id);
  };

  const [GetAllCategories, { error, data, loading }] = useLazyQuery(GET_TOP_CATEGORY);

  useLayoutEffect(() => {
    GetAllCategories({
      variables: {
        sortOrder: 'asc',
        sortBy: 'order',
      },
    });
  }, [GetAllCategories]);

  if (error) {
    console.log('GET_TOP_CATEGORY', error.message);
  }

  const [openCategories, setOpenCategories] = useState({});

  useEffect(() => {
    const newfunction = () => {
      const allFalse = Object.values(openCategories).every((value) => !value);

      if (allFalse) {
        setSelectedId(null);
      }
    };
    newfunction();
  }, [openCategories]);

  const toggleCategory = (categoryId, hasParent) => {
    if (!hasParent) {
      changeColorChild(null);

      setOpenCategories((prevOpen) => {
        const newOpenCategories = { ...prevOpen };

        Object.keys(newOpenCategories).forEach((id) => {
          if (id !== categoryId) {
            newOpenCategories[id] = false;
          }
        });

        newOpenCategories[categoryId] = !newOpenCategories[categoryId];

        return newOpenCategories;
      });
    } else {
      setOpenCategories((prevOpen) => ({
        ...prevOpen,
        [categoryId]: !prevOpen[categoryId],
      }));
    }
  };

  const renderCategories = (categories, hasParent) => {
    const sortedCategories = categories.slice().sort((a, b) => a.order - b.order);
    return (
      <>
        {/* PC screen Sub-Menu code */}
        <ul className="sub-menu d-none m-0 d-lg-inline">
          {sortedCategories.map((category, index) => (
            <li key={category.id} className={`${openCategories[category.id] && !hasParent ? 'active-category' : ''} ms-4`}>
              <div className="category-link">
                <>
                  <NavLink
                    className="mx-0 px-0 "
                    to={`/category/${category.name.replace(/\s/g, '_').toLowerCase()}`}
                    style={{ color: selectedIdChild === category.id ? '#1fa9e8' : 'black' }}
                  >
                    {category.name}
                  </NavLink>
                </>
                {category.children?.length > 0 && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category.id, hasParent);
                      changeColorChild(category.id);
                    }}
                    variant="foreground-alternate"
                    className="btn-icon btn-icon-only"
                    type="button"
                  >
                    <CsLineIcons icon="chevron-right" className="text-primary icon-right1" size="17" />
                  </Button>
                )}
              </div>
              {openCategories[category.id] && category.children?.length > 0 && renderCategories(category.children, true)}
            </li>
          ))}
        </ul>
        {/* Mobile screen Sub-Menu code */}
        <ul className="sub-menu p-0 d-lg-none">
          {sortedCategories.map((category, index) => (
            <li key={category.id} className={openCategories[category.id] && !hasParent ? 'active-category' : ''}>
              <div className="category-link">
                <>
                  <NavLink
                    className=""
                    to={`/category/${category.name.replace(/\s/g, '_').toLowerCase()}`}
                    style={{ color: selectedIdChild === category.id ? '#ffffff' : '#ffffff' }}
                  >
                    {category.name}
                  </NavLink>
                </>
                {category.children?.length > 0 && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCategory(category.id, hasParent);
                      changeColorChild(category.id);
                    }}
                    className="btn-icon btn-icon-only bg-transparent"
                    type="button"
                  >
                    <CsLineIcons icon="chevron-right" className="text-white" size="17" />
                  </Button>
                )}
              </div>
              {openCategories[category.id] && category.children?.length > 0 && renderCategories(category.children, true)}
            </li>
          ))}
        </ul>
      </>
    );
  };

  const categoriesWithoutParent = data?.getAllCategories?.filter((category) => !category.parent) || [];

  const displayedCategories = categoriesWithoutParent.slice(0, 15);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {data && (
        <nav>
          <style>
            {`.bg_color {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
        }`}
            {`.font_color {
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }`}
            {`.border_color {
          border: 1px solid ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }
        .border_color:hover {
          background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
          color: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
        }
        `}
            {`
          .btn_color {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            color: ${dataStoreFeatures1?.getStoreFeature?.fontColor};
            transition: background 0.3s ease;
            padding: 10px 30px;
            border: none;
            cursor: pointer;            
          }
          .btn_color:hover {
            background: ${dataStoreFeatures1?.getStoreFeature?.bgColor};
            filter: brightness(80%);       
          }
        `}
          </style>
          <ul className="main-menu" style={{ padding: 0 }}>
            {displayedCategories.map((category, index) => (
              <li
                className="row border rounded ps-2 m-1"
                key={category.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1px 4px' }}
              >
                <NavLink
                  className={`col-9 mx-0 px-0 d-inline pt-2 pb-2 fw-bold font_color ${index === selectedId ? 'font_color' : 'black'}`}
                  to={`/category/${category.name.replace(/\s/g, '_').toLowerCase()}`}
                  style={{ width: 'auto' }}
                >
                  {category.name}
                </NavLink>
                {category.children?.length > 0 && (
                  <>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(category.id, false);
                        changeColor(index);
                      }}
                      variant="foreground-alternate"
                      className="col-2 btn-icon btn-icon-only d-none d-lg-inline"
                      type="button"
                    >
                      <CsLineIcons icon="chevron-right" className="custom-icon-color " size="17" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(category.id, false);
                        changeColor(index);
                      }}
                      className="col-2 bg-transparent btn-icon btn-icon-only d-inline d-lg-none"
                      type="button"
                    >
                      <CsLineIcons icon="chevron-right" className="custom-icon-color text-white" size="17" />
                    </Button>
                  </>
                )}
                {openCategories[category.id] && category.children?.length > 0 && renderCategories(category.children, true)}
              </li>
            ))}
            {categoriesWithoutParent.length > displayedCategories.length && (
              <li className="row border rounded ps-2 m-1 p-2">
                <NavLink className="mx-0 px-0" style={{ fontWeight: 'bolder' }} to="/categories">
                  View All
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      )}
    </>
  );
};

export default CategoryMenuContent;
