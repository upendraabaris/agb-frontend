import React, { useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Form } from 'react-bootstrap';

function HandleCategory({ productdetail, setProductDetail }) {
  const [categories, setCategories] = useState([...productdetail.categories]);
  const [expandedCategories, setExpandedCategories] = useState({});

  const GET_CATEGORY = gql`
    query GetAllCategories {
      getAllCategories {
        id
        name
        parent {
          id
        }
        children {
          id
          name
          children {
            id
            name
            children {
              id
              name
            }
          }
        }
      }
    }
  `;

  const { data: categoryData, error: error1 } = useQuery(GET_CATEGORY);

  if (error1) {
    console.error('GET_CATEGORY', error1);
  }

  // Initialize expandedCategories with all categories expanded
  useEffect(() => {
    if (categoryData) {
      const expandAllCategories = (categoryList, expanded = {}) => {
        categoryList.forEach(category => {
          expanded[category.id] = true;
          if (category.children && category.children.length > 0) {
            expandAllCategories(category.children, expanded);
          }
        });
        return expanded;
      };

      const expandedState = expandAllCategories(categoryData.getAllCategories);
      setExpandedCategories(expandedState);
    }
  }, [categoryData]);

  const removeCategoryAndChildren = (categoryId, categoriesArray) => {
    const categoryIndex = categoriesArray.indexOf(categoryId);
    if (categoryIndex !== -1) {
      categoriesArray.splice(categoryIndex, 1);
    }

    const categoryToRemove = categoryData.getAllCategories.find((item) => item.id === categoryId);

    if (categoryToRemove && categoryToRemove.children.length) {
      categoryToRemove.children.forEach((child) => {
        const childIndex = categoriesArray.indexOf(child.id);
        if (childIndex !== -1) {
          categoriesArray.splice(childIndex, 1);
        }
        removeCategoryAndChildren(child.id, categoriesArray); // Recursively remove child categories
      });
    }
  };

  const categoryHandle = (e) => {
    const { value, checked } = e.target;

    const updatedCategories = [...categories];

    if (checked) {
      if (!updatedCategories.includes(value)) {
        updatedCategories.push(value);
      }
    } else {
      removeCategoryAndChildren(value, updatedCategories);
    }

    setCategories(updatedCategories);

    setProductDetail((prevFormData) => ({
      ...prevFormData,
      categories: updatedCategories,
    }));
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const renderCategory = (category, level = 0) => {
    const check = categories.includes(category.id);
    const isExpanded = expandedCategories[category.id];
    const backgroundColors = ['#d1ecf1', '#f8d7da', '#E6E6FA', '#fff3cd'];
    const backgroundColor = backgroundColors[level % backgroundColors.length];

    return (
      <div key={category.id} className="mb-1 mt-1">
        <div style={{ backgroundColor, padding: '8px', borderRadius: '4px', width: '100%' }}>
          <Form.Group controlId={`categories${category.id}`}>
            <Form.Label className="d-flex align-items-center fw-bold text-dark mb-0" style={{ width: '100%' }}>
              <Form.Check
                type="checkbox"
                name="categories"
                id={`categories${category.id}`}
                inline
                checked={check}
                onChange={categoryHandle}
                value={category.id}
              />
              <span
                className="ms-2"
                onClick={() => toggleCategory(category.id)}
                style={{ cursor: 'pointer', flexGrow: 1 }}
              >
                {category.name}
              </span>
              {category.children && category.children.length > 0 && (
                <button
                  type="button"
                  className="btn btn-link ms-2 fs-4"
                  onClick={() => toggleCategory(category.id)}
                >
                  {isExpanded ? '-' : '+'}
                </button>
              )}
            </Form.Label>
          </Form.Group>
        </div>
        {isExpanded && category.children?.length > 0 && (
          <div className="ms-6">
            {category.children.map((childCategory) => renderCategory(childCategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-3">
      <div className="row">
        {categoryData && categoryData.getAllCategories.filter((category) => !category.parent).map((category) => renderCategory(category))}
      </div>
    </div>
  );
}

export default HandleCategory;
