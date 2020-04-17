import React, { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { S3Image } from 'aws-amplify-react';
import {
  Notification,
  Popover,
  Button,
  Dialog,
  Card,
  Form,
  Input,
  Radio,
} from 'element-react';

import PayButton from './PayButton';

import { UserContext } from '../App';
import { updateProduct, deleteProduct } from '../graphql/mutations';
import { convertCentsToDollar, convertDollarsToCents } from '../utils';

const Product = (props) => {
  const { product } = props;

  const [formData, setFormData] = useState({
    description: '',
    price: 0,
    shipped: false,
  });
  const [updateProductDialog, setUpdateProductDialog] = useState(false);
  const [deleteProductDialog, setDeleteProductDialog] = useState(false);

  const { description, price, shipped } = formData;

  const handleUpdateProduct = async (productId) => {
    try {
      setUpdateProductDialog(false);
      const input = {
        id: productId,
        description,
        price: convertDollarsToCents(price),
        shipped,
      };

      const result = await API.graphql(
        graphqlOperation(updateProduct, { input })
      );
      console.log({ result });
      Notification({
        title: 'Success',
        message: 'Product successfully updated!',
        type: 'success',
        duration: 2000,
      });
      // setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.log(`Failed to update product with id: ${productId}`, err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setDeleteProductDialog(false);
      const input = {
        id: productId,
      };
      await API.graphql(graphqlOperation(deleteProduct, { input }));
      Notification({
        title: 'Success',
        message: 'Product successfully deleted!',
        type: 'success',
        duration: 2000,
      });
      // setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.log(`Failed to delete product with id: ${productId}`, err);
    }
  };

  return (
    <UserContext.Consumer>
      {({ userAttributes }) => {
        const isProductOwner =
          userAttributes && userAttributes.sub === product.owner;
        return (
          <div className="card-container">
            <Card bodyStyle={{ padding: 0, minWidth: '200px' }}>
              <S3Image
                imgKey={product.file.key}
                theme={{
                  photoImg: {
                    maxWidth: '100%',
                    maxHeight: '100%',
                  },
                }}
              />
              <div className="card-body">
                <h3 className="m-0">{product.description}</h3>
                <div className="items-center">
                  <img
                    src={`https://icon.now.sh/${
                      product.shipped ? 'markunread_mailbox' : 'mail'
                    }`}
                    alt="Shipping Icon"
                    className="icon"
                  />
                  {product.shipped ? 'Shipped' : 'Emailed'}
                </div>
                <div className="text-right">
                  <span className="mx-1">
                    ${convertCentsToDollar(product.price)}
                  </span>
                  {!isProductOwner && (
                    <PayButton
                      product={product}
                      userAttributes={userAttributes}
                    />
                  )}
                </div>
              </div>
            </Card>
            {/* Update / Delete Product Buttons */}
            <div className="text-center">
              {isProductOwner && (
                <>
                  <Button
                    type="warning"
                    icon="edit"
                    className="m-1"
                    onClick={() => {
                      setUpdateProductDialog(true);
                      setFormData({
                        description: product.description,
                        shipped: product.shipped,
                        price: convertCentsToDollar(product.price),
                      });
                    }}
                  />
                  <Popover
                    placement="top"
                    width="160"
                    trigger="click"
                    visible={deleteProductDialog}
                    content={
                      <>
                        <p>Do you want to delete this?</p>
                        <div className="text-right">
                          <Button
                            size="mini"
                            type="text"
                            className="m-1"
                            onClick={() => setDeleteProductDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            size="mini"
                            className="m-1"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Confirm
                          </Button>
                        </div>
                      </>
                    }
                  >
                    <Button
                      onClick={() => setDeleteProductDialog(true)}
                      type="danger"
                      icon="delete"
                      className="m-1"
                    />
                  </Popover>
                </>
              )}
            </div>
            {/* Update Product Dialog */}
            <Dialog
              title="Update Product"
              size="large"
              customClass="dialog"
              visible={updateProductDialog}
              onCancel={() => setUpdateProductDialog(false)}
            >
              <Dialog.Body>
                <Form labelPosition="top">
                  <Form.Item label="Update Description">
                    <Input
                      type="text"
                      icon="information"
                      placeholder="Product Description"
                      value={description}
                      trim={true}
                      onChange={(description) =>
                        setFormData({ ...formData, description })
                      }
                    />
                  </Form.Item>
                  <Form.Item label="Update Price">
                    <Input
                      type="number"
                      icon="plus"
                      placeholder="Price ($USD)"
                      onChange={(price) => setFormData({ ...formData, price })}
                      value={price}
                    />
                  </Form.Item>
                  <Form.Item label="Update Shipping">
                    <div className="text-center">
                      <Radio
                        value="true"
                        checked={shipped === true}
                        onChange={() =>
                          setFormData({ ...formData, shipped: true })
                        }
                      >
                        Shipped
                      </Radio>
                      <Radio
                        value="false"
                        checked={shipped === false}
                        onChange={() =>
                          setFormData({ ...formData, shipped: false })
                        }
                      >
                        Emailed
                      </Radio>
                    </div>
                  </Form.Item>
                </Form>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => setUpdateProductDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={() => handleUpdateProduct(product.id)}
                >
                  Update
                </Button>
              </Dialog.Footer>
            </Dialog>
          </div>
        );
      }}
    </UserContext.Consumer>
  );
};

export default Product;
