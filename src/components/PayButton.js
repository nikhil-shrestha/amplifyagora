import React from 'react';
import { API } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
// import { Notification, Message } from "element-react";

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_Qzpqxw8oqfWF4vusTPrPEDs4',
};

const PayButton = ({ product, user }) => {
  const handleCharge = async (token) => {
    try {
      const result = await API.post('orderlamda', '/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            descript: product.description,
          },
        },
      });
      console.log({ result });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <StripeCheckout
      token={handleCharge}
      email={user.attributes.email}
      name={product.description}
      amount={product.price}
      currency={stripeConfig.currency}
      stripeKey={stripeConfig.publishableAPIKey}
      shippingAddress={product.shipped}
      billingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
