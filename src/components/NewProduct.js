import React, { useState } from 'react';
import { PhotoPicker } from 'aws-amplify-react';
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress,
} from 'element-react';

const NewProduct = () => {
  const [formData, setFormData] = useState({
    description: '',
    price: 0,
    shipped: false,
  });

  const { description, price, shipped } = formData;

  const handleAddProduct = () => {
    console.log('Product Added');
  };

  return (
    <div className="flex-center">
      <h2 className="header">Add New Product</h2>
      <div>
        <Form className="market-header">
          <Form.Item label="Add Product Description">
            <Input
              type="text"
              icon="information"
              placeholder="Description"
              onChange={(description) =>
                setFormData({ ...formData, description })
              }
              value={description}
            />
          </Form.Item>
          <Form.Item label="Set Product Price">
            <Input
              type="number"
              icon="plus"
              placeholder="Price ($USD)"
              onChange={(price) => setFormData({ ...formData, price })}
              value={price}
            />
          </Form.Item>
          <Form.Item label="Is the Product Shipped or Emailed to the Customer?">
            <div className="text-center">
              <Radio
                value="true"
                checked={shipped === true}
                onChange={() => setFormData({ ...formData, shipped: true })}
              >
                Shipped
              </Radio>
              <Radio
                value="false"
                checked={shipped === false}
                onChange={() => setFormData({ ...formData, shipped: false })}
              >
                Emailed
              </Radio>
            </div>
          </Form.Item>
          <PhotoPicker />
          <Form.Item>
            <Button type="primary" onClick={handleAddProduct}>
              Add Product
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
