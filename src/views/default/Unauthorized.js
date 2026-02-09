import React from 'react';
import { NavLink } from 'react-router-dom';
import LayoutFullpage from 'layout/LayoutFullpage';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';

const Unauthorized = () => {
  const title = 'Unauthorized';
  const description = 'You do not have permission to access this page.';

  const rightSide = (
    <div
      className="sw-lg-80 min-h-100 d-flex justify-content-center align-items-center bg-light shadow-lg py-5 full-page-content-right-border"
      style={{ backgroundImage: 'url(/img/error-bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="sw-lg-60 px-5 text-center bg-white p-5 rounded-3 shadow-lg" style={{ maxWidth: '500px' }}>
        <div className="mb-4">
          <h2 className="text-danger fw-bold">Unauthorized Page</h2>
          <img
            src="https://media.istockphoto.com/id/1636498878/vector/access-beyond-this-point-is-forbidden.jpg?s=612x612&w=0&k=20&c=DbFWsJlDCbFl96vhI8XoQjCZb9HOkANysx8i0e9H1DI="
            alt="Unauthorized Access"
            className="img-fluid mb-3 rounded"
            style={{ maxHeight: '100px' }}
          />

          <p className="text-dark fs-6">You don’t have the right permissions to view this page.</p>
        </div>
        <div className="mb-4">
          <p className="h6 text-dark">
            If you believe this is an error, please{' '}
            <NavLink to="/contact_us" className="text-primary fw-semibold">
              contact support
            </NavLink>
            .
          </p>
        </div>
        <div>
          <NavLink to="/" className="btn btn-lg btn-primary shadow-sm px-4 py-2 d-flex align-items-center justify-content-center">
            <CsLineIcons icon="arrow-left" className="me-2" /> Return to Home
          </NavLink>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <HtmlHead title={title} description={description} />
      <LayoutFullpage right={rightSide} />
    </>
  );
};

export default Unauthorized;
