import React, { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import {
  Form,
  Button,
  Dialog,
  Input,
  Select,
  Notification,
} from 'element-react';

import { createMarket } from '../graphql/mutations';

import { UserContext } from '../App';

const NewMarket = () => {
  const [addMarketDialog, setAddMarketDialog] = useState(false);
  const [name, setName] = useState('');

  const handleAddMarket = async (user) => {
    console.log(name);
    try {
      setAddMarketDialog(false);
      const input = {
        name,
        owner: user.username,
      };

      const { data } = await API.graphql(
        graphqlOperation(createMarket, {
          input,
        })
      );
      console.log(`Created market: id ${data.createMarket.id}`);
      setName('');
    } catch (err) {
      Notification.error({
        title: 'Error',
        message: `${err.message || 'Error adding markder'}`,
      });
    }
  };

  return (
    <UserContext.Consumer>
      {({ user }) => (
        <>
          <div className="market-header">
            <h1 className="market-title">
              Create Your MarketPlace
              <Button
                type="text"
                icon="edit"
                className="market-title-button"
                onClick={() => setAddMarketDialog(true)}
              />
            </h1>
          </div>

          <Dialog
            title="Create New Market"
            visible={addMarketDialog}
            onCancel={() => setAddMarketDialog(false)}
            size="large"
            customClass="dialog"
          >
            <Dialog.Body>
              <Form labelPosition="top">
                <Form.Item label="Add Market Name">
                  <Input
                    placeholder="Market Name"
                    trim={true}
                    onChange={(name) => setName(name)}
                    value={name}
                  />
                </Form.Item>
              </Form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => setAddMarketDialog(false)}>Cancel</Button>
              <Button
                disabled={!name}
                type="primary"
                onClick={() => handleAddMarket(user)}
              >
                Add
              </Button>
            </Dialog.Footer>
          </Dialog>
        </>
      )}
    </UserContext.Consumer>
  );
};

export default NewMarket;
