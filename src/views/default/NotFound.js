import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import LayoutFullpage from 'layout/LayoutFullpage';
import CsLineIcons from 'cs-line-icons/CsLineIcons';
import HtmlHead from 'components/html-head/HtmlHead';

const NotFound = () => {
  const title = '404 Not Found';
  const description = '404 Not Found';

  useEffect(() => {
    const redricted = () => {
      window.location.replace('/');
    };
    redricted();
  }, []);

  const rightSide = (
    <div className="sw-lg-80 min-h-100 bg-foreground d-flex justify-content-center align-items-center shadow-deep py-5 full-page-content-right-border">
      <div className="sw-lg-60 px-5">
        <div className="mb-5">
          <h2 className="cta-1 mb-0 text-dark pb-6">Oops...</h2>
          <h2 className="display-2 text-dark fw-bolder pt-4">Page Not Found</h2>
        </div>
        <div className="pt-6">
          <NavLink to="/" className="btn btn-icon btn-icon-start btn-primary">
            <CsLineIcons icon="arrow-left" /> <span>Plz Go Home</span>
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

export default NotFound;
