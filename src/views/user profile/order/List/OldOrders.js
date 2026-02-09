import React from 'react';

function OldOrders() {
  return (
    <div className="border p-6 text-center bg-white">
      For information on orders before 31/Dec/2023, share your mobile number, email, and order details. We'll promptly email you the bill. 
      <a target="_blank" href="/contact_us">
         {' '} Contact Us
      </a>
    </div>
  );
}

export default OldOrders;
