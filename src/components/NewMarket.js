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
  const [selectedTags, setSelectedTags] = useState([]);
  const [options, setOptions] = useState([]);
  const [tags] = useState([
    'Arts',
    'Web Development',
    'Technology',
    'Crafts',
    'Entertainment',
  ]);

  const handleAddMarket = async (user) => {
    console.log(name);
    try {
      setAddMarketDialog(false);
      const input = {
        name,
        owner: user.username,
        tags: selectedTags,
      };

      const { data } = await API.graphql(
        graphqlOperation(createMarket, {
          input,
        })
      );
      console.log(`Created market: id ${data.createMarket.id}`);
      console.log({ data });
      setName('');
      setSelectedTags('');
    } catch (err) {
      Notification.error({
        title: 'Error',
        message: `${err.message || 'Error adding markder'}`,
      });
    }
  };

  const handleFilterTags = (query) => {
    const options = tags
      .map((tag) => ({ value: tag, label: tag }))
      .filter((tag) => tag.label.toLowerCase().includes(query.toLowerCase()));
    setOptions(options);
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
                <Form.Item label="Add Tags">
                  <Select
                    multiple={true}
                    filterable={true}
                    placeholder="Market Tags"
                    onChange={(selectedTags) => setSelectedTags(selectedTags)}
                    remoteMethod={handleFilterTags}
                    remote={true}
                  >
                    {options.map((option) => (
                      <Select.Option
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Select>
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
