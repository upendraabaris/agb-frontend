import React, { useState } from 'react';
import { Form, Card, Button } from 'react-bootstrap';

import { gql, useQuery, useLazyQuery } from '@apollo/client';

function AccordionItem21({ setFormData }) {
  const [catL1Id, setCatL1Id] = useState('');
  const [catL2Id, setCatL2Id] = useState('');
  const [catL3Id, setCatL3Id] = useState('');
  const [catL4Id, setCatL4Id] = useState('');
  const GET_CATEGORY = gql`
    query GetAllCategories {
      getAllCategories {
        id
        name
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
        parent {
          id
          name
        }
      }
    }
  `;

  const { data: catDataL1 } = useQuery(GET_CATEGORY);

  const GET_CATEGORY_L2 = gql`
    query GetCategory($getCategoryId: ID!) {
      getCategory(id: $getCategoryId) {
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

  const [getCategoriesL2, { data: categoryDataL2 }] = useLazyQuery(GET_CATEGORY_L2, {
    variables: {
      getCategoryId: catL1Id,
    },
  });

  const GET_CATEGORY_L3 = gql`
    query GetCategory($getCategoryId: ID!) {
      getCategory(id: $getCategoryId) {
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
  `;

  const [getCategoriesL3, { data: categoryDataL3 }] = useLazyQuery(GET_CATEGORY_L3, {
    variables: {
      getCategoryId: catL2Id,
    },
  });

  const GET_CATEGORY_L4 = gql`
    query GetCategory($getCategoryId: ID!) {
      getCategory(id: $getCategoryId) {
        children {
          id
          name
        }
      }
    }
  `;

  const [getCategoriesL4, { data: categoryDataL4 }] = useLazyQuery(GET_CATEGORY_L4, {
    variables: {
      getCategoryId: catL3Id,
    },
  });

  const handleClickL1 = async () => {
    await getCategoriesL2();
  };

  const handleClickL2 = async () => {
    await getCategoriesL3();
  };

  const handleClickL3 = async () => {
    await getCategoriesL4();
  };

  const handleCategoryChange = (event) => {
    const selectedCategoryId = event.target.value;
    setCatL1Id(selectedCategoryId);
    setCatL2Id('');
    setCatL3Id('');
    setCatL4Id('');
    handleClickL1();
  };

  const handleSubcategoryChange = (event) => {
    const selectedSubcategoryId = event.target.value;
    setCatL2Id(selectedSubcategoryId);
    setCatL3Id('');
    setCatL4Id('');

    handleClickL2();
  };

  const handleSubsubcategoryChange = (event) => {
    const selectedSubsubcategoryId = event.target.value;
    setCatL3Id(selectedSubsubcategoryId);
    setCatL4Id('');

    handleClickL3();
  };

  const handleSubsubsubcategoryChange = (event) => {
    const selectedSubsubsubcategoryId = event.target.value;
    setCatL4Id(selectedSubsubsubcategoryId);
  };

  const [isSaved, setIsSaved] = useState(false);

  const handleAddNew = () => {
    setFormData((prevFormData) => {
      const updatedCategories = [...prevFormData.categories, catL1Id, catL2Id, catL3Id, catL4Id].filter(
        (categoryId, index, array) => categoryId !== '' && array.indexOf(categoryId) === index
      );

      return {
        ...prevFormData,
        categories: updatedCategories,
      };
    });
    setIsSaved(true);

    // Optional: revert back to "Save" after a few seconds
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <>
      <Card className="mt-2">
        <div className="p-2">
          <div className="mb-2 row">
            {catDataL1 && (
              <>
                <div className="mb-3 filled form-group col-3">
                  <Form.Select name="categories" value={catL1Id} onChange={handleCategoryChange}>
                    <option hidden>Level 1</option>
                    {catDataL1.getAllCategories.map(
                      (getAllCategories) =>
                        !getAllCategories.parent && (
                          <option key={getAllCategories.id} value={getAllCategories.id}>
                            {getAllCategories.name}
                          </option>
                        )
                    )}
                  </Form.Select>
                </div>
                <div className="mb-3 filled form-group col-3">
                  <Form.Select name="categories" value={catL2Id} onChange={handleSubcategoryChange}>
                    <option hidden>Level 2</option>
                    {categoryDataL2 &&
                      categoryDataL2.getCategory.children.map((getCategory) => (
                        <option key={getCategory.id} value={getCategory.id}>
                          {getCategory.name}
                        </option>
                      ))}
                  </Form.Select>
                </div>
                <div className="mb-3 filled form-group col-3">
                  <Form.Select name="categories" value={catL3Id} onChange={handleSubsubcategoryChange}>
                    <option hidden>Level 3</option>
                    {categoryDataL3 &&
                      categoryDataL3.getCategory.children.map((getCategory) => (
                        <option key={getCategory.id} value={getCategory.id}>
                          {getCategory.name}
                        </option>
                      ))}
                  </Form.Select>
                </div>
                <div className="mb-3 filled form-group col-3">
                  <Form.Select name="categories" value={catL4Id} onChange={handleSubsubsubcategoryChange}>
                    <option hidden>Level 4</option>
                    {categoryDataL4 &&
                      categoryDataL4.getCategory.children.map((getCategory) => (
                        <option key={getCategory.id} value={getCategory.id}>
                          {getCategory.name}
                        </option>
                      ))}
                  </Form.Select>
                </div>
              </>
            )}
          </div>
          <Button onClick={handleAddNew} size="sm" variant={isSaved ? "success" : "primary"}>
            {isSaved ? "Saved" : "Save Product Placement"}
          </Button>

        </div>
      </Card>
    </>
  );
}

export default AccordionItem21;
