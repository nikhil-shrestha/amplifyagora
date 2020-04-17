import React from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import StripeCheckout from 'react-stripe-checkout';
import { Notification, Message } from 'element-react';

import { history } from '../App';
import { getUser } from '../graphql/queries';
import { createOrder } from '../graphql/mutations';

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

  const createShippingAddress = (source) => ({
    city: source.address_city,
    country: source.address_country,
    address_line1: source.address_line1,
    address_state: source.address_state,
    address_zip: source.address_zip,
  });

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

      if (result.charge.status === 'succeeded') {
        let shippingAddress = null;
        if (product.shipped) {
          shippingAddress = createShippingAddress(result.charge.source);
        }

        const input = {
          orderUserId: user.attributes.sub,
          orderProductId: product.id,
          shippingAddress,
        };

        const order = await API.graphql(
          graphqlOperation(createOrder, { input })
        );

        console.log({ order });
      }

      console.log({ result });
      Notification({
        title: 'Success',
        message: `${result.message}`,
        type: 'success',
        duration: 3000,
      });

      setTimeout(() => {
        history.push('/');
        Message({
          type: 'info',
          message: 'Check your verified email for order details',
          duration: 5000,
          showClose: true,
        });
      }, 3000);
    } catch (err) {
      console.error(err);
      Notification.error({
        title: 'Error',
        message: `${err.message || 'Error processing order'}`,
      });
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
