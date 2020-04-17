import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
// import { Notification, Message } from "element-react";

import { getUser } from '../graphql/queries';

const stripeConfig = {
  currency: 'USD',
  publishableAPIKey: 'pk_test_Qzpqxw8oqfWF4vusTPrPEDs4',
};

const PayButton = ({ product, user }) => {
  const getOwnerEmail = async (ownerId) => {
    try {
      const input = { id: ownerId };

      const { data } = await API.graphql(graphqlOperation(getUser, input));
      return data.getUser.email;
    } catch (err) {
      console.error(`Error fetching produc owner's email `, err);
    }
  };

  const handleCharge = async (token) => {
    try {
      const ownerEmail = await getOwnerEmail(product.owner);
      console.log({ ownerEmail });
      const result = await API.post('orderlamda', '/charge', {
        body: {
          token,
          charge: {
            currency: stripeConfig.currency,
            amount: product.price,
            descript: product.description,
          },
          email: {
            customerEmail: user.attributes.email,
            ownerEmail,
            shipped: product.shipped,
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
      // shippingAddress={product.shipped}
      // billingAddress={product.shipped}
      locale="auto"
      allowRememberMe={false}
    />
  );
};

export default PayButton;
