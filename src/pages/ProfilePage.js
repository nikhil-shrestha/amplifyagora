import React, { useEffect, useState } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
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
      orders(sortDirection: DESC, limit: 10) {
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
  const { user, userAttributes } = props;

  const [email, setEmail] = useState(userAttributes && userAttributes.email);
  const [emailDialog, setEmailDialog] = useState(false);
  const [verificationForm, setVerificationForm] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [orders, setOrders] = useState([]);
  const [columns] = useState([
    { prop: 'name', width: '150' },
    { prop: 'value', width: '330' },
    {
      prop: 'tag',
      width: '150',
      render: (row) => {
        if (row.name === 'Email') {
          const emailVerified = userAttributes.email_verified;
          return emailVerified ? (
            <Tag type="success">Verified</Tag>
          ) : (
            <Tag type="danger">UnVerified</Tag>
          );
        }
      },
    },
    {
      prop: 'operations',
      width: '330',
      render: (row) => {
        switch (row.name) {
          case 'Email':
            return (
              <Button
                type="info"
                size="small"
                onClick={() => setEmailDialog(true)}
              >
                Edit
              </Button>
            );
          case 'Delete Profile':
            return (
              <Button type="danger" size="small">
                Delete
              </Button>
            );

          default:
            return;
        }
      },
    },
  ]);

  useEffect(() => {
    if (userAttributes) {
      getUserOrders(userAttributes.sub);
    }
  }, [userAttributes]);

  const getUserOrders = async (userId) => {
    const input = { id: userId };
    const { data } = await API.graphql(graphqlOperation(getUser, input));
    setOrders(data.getUser.orders.items);
  };

  const handleUpdateEmail = async () => {
    try {
      const updatedAttributes = {
        email,
      };

      const result = await Auth.updateUserAttributes(user, updatedAttributes);
      if (result === 'SUCCESS') {
        sendVerificationCode('email');
      }
    } catch (err) {
      console.error(err);
      Notification.error({
        title: 'Error',
        message: `${err.message || 'Error updating email'}`,
      });
    }
  };

  const sendVerificationCode = async (attr) => {
    await Auth.verifyCurrentUserAttribute(attr);
    setVerificationForm(true);
    Message({
      type: 'info',
      customClass: 'message',
      message: `Verification code sent to ${email}`,
    });
  };

  const handleVerifyEmail = async (attr) => {
    try {
      const result = await Auth.verifyCurrentUserAttributeSubmit(
        attr,
        verificationCode
      );
      Notification({
        title: 'Success',
        message: 'Email sucessfully verified!',
        type: `${result.toLowerCase()}`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error(err);
      Notification.error({
        title: 'Error',
        message: `${err.message || 'Error updating email'}`,
      });
    }
  };

  return (
    userAttributes && (
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
            <Table
              columns={columns}
              data={[
                {
                  name: 'Your Id',
                  value: userAttributes.sub,
                },
                {
                  name: 'Username',
                  value: user.username,
                },
                {
                  name: 'Email',
                  value: userAttributes.email,
                },
                {
                  name: 'Phone Number',
                  value: userAttributes.phone_number,
                },
                {
                  name: 'Delete Profile',
                  value: 'Sorry to see you go',
                },
              ]}
              showHeader={false}
              rowClassName={(row) =>
                row.name === 'Delete Profile' && 'delete-profile'
              }
            />
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

        {/* Email Dialog */}
        <Dialog
          size="large"
          customClass="dialog"
          title="Edit Email"
          visible={emailDialog}
          onCancel={() => setEmailDialog(false)}
        >
          <Dialog.Body>
            <Form labelPosition="top">
              <Form.Item label="Email">
                <Input value={email} onChange={(email) => setEmail(email)} />
              </Form.Item>
              {verificationForm && (
                <Form.Item label="Emter Verification Code" labelWidth="120">
                  <Input
                    onChange={(verificationCode) =>
                      setVerificationCode(verificationCode)
                    }
                    value={verificationCode}
                  />
                </Form.Item>
              )}
            </Form>
          </Dialog.Body>
          <Dialog.Footer>
            <Button onCancel={() => setEmailDialog(false)}>Cancel</Button>
            {!verificationForm && (
              <Button type="primary" onClick={handleUpdateEmail}>
                Save
              </Button>
            )}
            {verificationForm && (
              <Button type="primary" onClick={() => handleVerifyEmail('email')}>
                Submit
              </Button>
            )}
          </Dialog.Footer>
        </Dialog>
      </>
    )
  );
};

export default ProfilePage;
