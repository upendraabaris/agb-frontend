import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import AccordionItem21 from './SelectCategories components/AccordionItem21';

const SelectCategories = ({ setFormData }) => {
  const [childComponents, setChildComponents] = useState([]);

  const handleRemove = (index) => {
    setChildComponents((prevChildComponents) => {
      const updatedChildComponents = [...prevChildComponents];
      updatedChildComponents.splice(index, 1);
      return updatedChildComponents;
    });
  };

  const handleClick = () => {
    // Add a new child component to the array
    const newIndex = childComponents.length + 1;
    const newChild = <AccordionItem21 key={newIndex} indexofcat={newIndex} handleRemove={handleRemove} setFormData={setFormData} />;
    setChildComponents([...childComponents, newChild]);
  };

  return (
    <div>
      {childComponents}
      <div className="d-flex">
        <Button onClick={handleClick}>Add Categories</Button>
      </div>
    </div>
  );
};

export default SelectCategories;
