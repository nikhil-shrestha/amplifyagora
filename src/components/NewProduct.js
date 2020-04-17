import React, { useState } from 'react';
import { Storage, Auth, API, graphqlOperation } from 'aws-amplify';
import { PhotoPicker } from 'aws-amplify-react';
import {
  Form,
  Button,
  Input,
  Notification,
  Radio,
  Progress,
} from 'element-react';

import { convertDollarsToCents } from '../utils';
import { createProduct } from '../graphql/mutations';
import aws_exports from '../aws-exports';

const NewProduct = (props) => {
  const { marketId } = props;

  const [formData, setFormData] = useState({
    description: '',
    price: 0,
    shipped: false,
    imagePreview: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [image, setImage] = useState('');

  const { description, price, shipped, imagePreview } = formData;

  const handleAddProduct = async () => {
    try {
      setIsUploading(true);
      const visiblity = 'public';
      const { identityId } = await Auth.currentCredentials();
      const filename = `/${visiblity}/${identityId}/${Date.now()}-${
        image.name
      }`;

      const uploadedFile = await Storage.put(filename, image.file, {
        contentType: image.type,
      });

      const file = {
        key: uploadedFile.key,
        bucket: aws_exports.aws_user_files_s3_bucket,
        region: aws_exports.aws_user_files_s3_bucket_region,
      };

      const input = {
        productMarketId: marketId,
        description,
        price: convertDollarsToCents(price),
        shipped,
        file,
      };

      const { data } = await API.graphql(
        graphqlOperation(createProduct, { input })
      );
      console.log('Created Product', data);

      Notification({
        title: 'Success',
        message: 'Product successfully created!',
        type: 'success',
      });
      setFormData({
        description: '',
        price: 0,
        shipped: false,
        imagePreview: '',
        image: '',
      });
    } catch (err) {
      console.error('error adding product', err);
    }
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
          {imagePreview && (
            <img className="image-preview" src={imagePreview} alt="Product" />
          )}
          <PhotoPicker
            title="Product Image"
            preview="hidden"
            onLoad={(url) => setFormData({ ...formData, imagePreview: url })}
            onPick={(file) => {
              console.log(file);
              setImage(file);
            }}
            theme={{
              formContainer: {
                margin: 0,
                padding: '0.8em',
              },
              formSection: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              },
              sectionBody: {
                margin: 0,
                width: '250px',
              },
              sectionHeader: {
                padding: '0.2em',
                color: 'var(--darkAmazonOrange)',
              },
              // photoPickerButton: {
              //   display: 'none',
              // },
            }}
          />
          <Form.Item>
            <Button
              disabled={!image || !description || !price || isUploading}
              type="primary"
              loading={isUploading}
              onClick={handleAddProduct}
            >
              {isUploading ? 'Uploading...' : 'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default NewProduct;
