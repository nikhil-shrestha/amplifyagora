import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import {
  Table,
  Button,
  Notification,
  MessageBox,
  Message,
  Tabs,
  Icon,
  Form,
  Dialog,
  Input,
  Card,
  Tag,
} from 'element-react';

import { convertCentsToDollar } from '../utils';

const getUser = `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      registered
      orders(sortDirection: DESC) {
        items {
          id
          createdAt
          product {
            id
            owner
            price
            createdAt
            description
          }
          shippingAddress {
            city
            country
            address_line1
            address_state
            address_zip
          }
        }
        nextToken
      }
    }
  }
`;

const ProfilePage = (props) => {
  const { user } = props;

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getUserOrders(user.attributes.sub);
  }, [user.attributes.sub]);

  const getUserOrders = async (userId) => {
    const input = { id: userId };
    const { data } = await API.graphql(graphqlOperation(getUser, input));
    setOrders(data.getUser.orders.items);
  };

  return (
    <>
      <Tabs activeName="1" className="profile-tabs">
        <Tabs.Pane
          label={
            <>
              <Icon name="document" className="icon" />
              Summary
            </>
          }
          name="1"
        >
          <h2 className="header">Profile Summary</h2>
        </Tabs.Pane>
        <Tabs.Pane
          label={
            <>
              <Icon name="message" className="icon" />
              Orders
            </>
          }
          name="2"
        >
          <h2 className="header">Order History</h2>
          {orders.map((order) => (
            <div className="mb-1" key={order.id}>
              <Card>
                <pre>
                  <p>Order Id: {order.id}</p>
                  <p>Product Description: {order.product.description}</p>
                  <p>Price: ${convertCentsToDollar(order.product.price)}</p>
                  <p>Purchases on {order.createdAt}</p>
                  {order.shippingAddress && (
                    <>
                      Shipping Address
                      <div className="ml-2">
                        <p>{order.shippingAddress.address_line1}</p>
                        <p>
                          {order.shippingAddress.city},
                          {order.shippingAddress.state}
                          {order.shippingAddress.country}
                          {order.shippingAddress.zip}
                        </p>
                      </div>
                    </>
                  )}
                </pre>
              </Card>
            </div>
          ))}
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default ProfilePage;
