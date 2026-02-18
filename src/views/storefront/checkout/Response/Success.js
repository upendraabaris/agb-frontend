import React, { useEffect } from 'react';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import Cartitems from 'globalValue/CartItems/Cartitems';
import img from './success.png';

function Success() {
  const { refetch } = Cartitems();
  const history = useHistory();

  const { state } = useLocation();

  useEffect(() => {
    refetch();
    if (state?.txnID) {
      const timeout = setTimeout(() => {
        history.push(`/order/${state?.txnID}`);
      });
      return () => {
        clearTimeout(timeout);
      };
    }
    return null;
  }, [history, refetch, state]);

  return (
    <>
      {/* <div className="text-center">
        <img style={{ height: '100px', width: '100px', borderRadius: '50px' }} alt="tick" src={img} />
        <h1 className="my-2 mx-2">Payment Successful</h1>
      </div> */}
      <div className="text-center mt-5 p-5 border rounded">
        <img style={{ height: '100px', width: '100px', borderRadius: '50px' }} alt="tick" src={img} />
        <h1 className="my-2 mx-2 pb-4 pt-2">Payment Successful</h1>
        <NavLink to="/" className="btn btn-light">
          Go to Home
        </NavLink>
        <NavLink to="/user/orders" className="btn btn-danger ms-2">
          Your Order
        </NavLink>
      </div>
    </>
    
  );
}

export default Success;
