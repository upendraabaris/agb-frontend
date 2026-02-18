import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Form } from 'react-bootstrap';

function HandleCategory({ productdetail, setProductDetail }) {
  // HANDLE CATEGORIES

  const [categories, setCategories] = useState([...productdetail.categories]);

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
    console.log('GET_CATEGORY', error1);
  }

  const removeCategoryAndChildren = (categoryId, categoriesArray) => {
    const categoryIndex = categoriesArray.indexOf(categoryId);
    if (categoryIndex !== -1) {
      categoriesArray.splice(categoryIndex, 1);
    }

    const categoryToRemove = categoryData.getAllCategories.find((item) => item.id === categoryId);

    if (categoryToRemove && categoryToRemove.children.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const child of categoryToRemove.children) {
        const childIndex = categoriesArray.indexOf(child.id);
        if (childIndex !== -1) {
          categoriesArray.splice(childIndex, 1);
        }
        removeCategoryAndChildren(child.id, categoriesArray);
      }
    }
  };
  const categoryHandle = async (e) => {
    const { value, checked } = e.target;

    // Create a copy of the current categories array
    const updatedCategories = [...categories];

    if (checked) {
      // If the checkbox is checked, add the value to the array if it's not already there
      if (!updatedCategories.includes(value)) {
        updatedCategories.push(value);
      }
    } else {
      // If the checkbox is unchecked, remove the value and its children from the array
      removeCategoryAndChildren(value, updatedCategories);
    }

    // Update the state with the updated categories array
    setCategories(updatedCategories);

    setProductDetail((prevFormData) => ({
      ...prevFormData,
      categories: updatedCategories,
    }));
  };

  const renderCategory = (category, level = 0) => {
    const check = categories.includes(category.id);
    return (
      //   <div key={category.id} style={{ marginLeft: `${level * 50}px` }}>
      <div key={category.id} className="col-12 mb-3 ms-4">
        <Form.Group controlId={`categories${category.id}`}>
          C {level + 1}
          <Form.Label className="ms-3">
            <Form.Check type="checkbox" name="categories" id={`categories${category.id}`} inline checked={check} disabled />
            {category.name}
          </Form.Label>
        </Form.Group>
        {category.children?.length > 0 && category.children.map((childCategory) => renderCategory(childCategory, level + 1))}
      </div>
    );
  };

  return (
    <>
      <div className="mb-3">
        Categories
        <div className="row mt-3">
          {categoryData && categoryData.getAllCategories.filter((category) => !category.parent).map((category) => renderCategory(category))}
        </div>
      </div>
    </>
  );
}

export default HandleCategory;
