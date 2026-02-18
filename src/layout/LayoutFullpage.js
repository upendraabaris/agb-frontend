import React, { useEffect } from 'react';
import useLayout from 'hooks/useLayout';

const LayoutFullpage = ({ left, right }) => {
  useLayout();

  useEffect(() => {
    document.body.classList.add('h-100');
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('h-100');
    }
    return () => {
      document.body.classList.remove('h-100');
      if (root) {
        root.classList.remove('h-100');
      }
    };
  }, []);

  return (
    <> 
      <div className="fixed-background" /> 
      <div className="container-fluid p-0 h-100 position-relative">
        <div className="row g-0 h-100"> 
          <div className="offset-0 col-12 d-none d-lg-flex offset-md-1 col-lg h-lg-100">{left}</div> 
          <div className="col-12 col-lg-auto h-100 pb-4 px-4 pt-0 p-lg-0">{right}</div> 
        </div>
      </div>
    </>
  );
};
export default LayoutFullpage;
