import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API, graphqlOperation } from 'aws-amplify';
import { Loading, Tabs, Icon } from 'element-react';

import NewProduct from '../components/NewProduct';
import Product from '../components/Product';

import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
} from '../graphql/subscriptions';

const getMarket = `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products(sortDirection: DESC, limit: 10) {
        items {
          id
          description
          price
          shipped
          owner
          file {
            key
          }
          createdAt
        }
        nextToken
      }
      tags
      owner
      createdAt
    }
  }
`;

const MarketPage = (props) => {
  const { marketId, user, userAttributes } = props;

  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isMarketOwner, setIsMarketOwner] = useState(false);

  useEffect(() => {
    handleGetMarket();

    const createProductListener = API.graphql(
      graphqlOperation(onCreateProduct, { owner: user.attributes.sub })
    ).subscribe({
      next: ({ value }) => {
        const createdProduct = value.data.onCreateProduct;
        setMarket((prevMarket) => {
          const prevProducts = prevMarket.products.items.filter(
            (item) => item.id !== createdProduct.id
          );
          const updatedProducts = [createdProduct, ...prevProducts];
          const updatedMarket = { ...prevMarket };
          updatedMarket.products.items = updatedProducts;
          return updatedMarket;
        });
      },
    });

    const updateProductListener = API.graphql(
      graphqlOperation(onUpdateProduct, { owner: user.attributes.sub })
    ).subscribe({
      next: ({ value }) => {
        const updatedProduct = value.data.onCreateProduct;
        setMarket((prevMarket) => {
          const updatedProductIndex = prevMarket.products.items.findIndex(
            (item) => item.id !== updatedProduct.id
          );
          const updatedProducts = [
            ...prevMarket.products.items.slice(0, updatedProductIndex),
            updatedProduct,
            ...prevMarket.products.items.slice(updatedProductIndex + 1),
          ];
          const updatedMarket = { ...prevMarket };
          updatedMarket.products.items = updatedProducts;
          return updatedMarket;
        });
      },
    });

    const deleteProductListener = API.graphql(
      graphqlOperation(onDeleteProduct, { owner: user.attributes.sub })
    ).subscribe({
      next: ({ value }) => {
        const deletedProduct = value.data.onDeleteProduct;
        setMarket((prevMarket) => {
          const updatedProducts = prevMarket.products.items.filter(
            (item) => item.id !== deletedProduct.id
          );

          const updatedMarket = { ...prevMarket };
          updatedMarket.products.items = updatedProducts;
          return updatedMarket;
        });
      },
    });

    return () => {
      createProductListener.unsubscribe();
      updateProductListener.unsubscribe();
      deleteProductListener.unsubscribe();
    };
  }, []);

  async function handleGetMarket() {
    console.log('get Market data');
    const input = {
      id: marketId,
    };
    console.log(input);
    const { data } = await API.graphql(graphqlOperation(getMarket, input));

    console.log({ data });
    setMarket(data.getMarket);
    checkMarketOwner(data.getMarket);
    checkEmailVerified();
    setIsLoading(false);
  }

  const checkEmailVerified = () => {
    if (userAttributes) {
      setIsEmailVerified(userAttributes.email_verified);
    }
  };

  const checkMarketOwner = (market) => {
    if (user) {
      setIsMarketOwner(user.username === market.owner);
    }
  };

  return isLoading ? (
    <Loading fullscreen={true} />
  ) : (
    <>
      {/* Back Button */}
      <Link className="link" to="/">
        Back to Markets List
      </Link>

      {/* Market MetaData */}
      <span className="items-center pt-2">
        <h2 className="mb-mr">{market.name}</h2> - {market.owner}
      </span>
      <div className="items-center pt-2">
        <span style={{ color: 'var(--lightSquidInk)', paddingBottom: '1em' }}>
          <Icon name="date" className="icon" />
          {market.createdAt}
        </span>
      </div>

      {/* New Product */}
      <Tabs type="border-card" value={isMarketOwner ? '1' : '2'}>
        {isMarketOwner && (
          <Tabs.Pane
            label={
              <>
                <Icon name="plus" className="icon" />
                Add Product
              </>
            }
            name="1"
          >
            {isEmailVerified ? (
              <NewProduct marketId={marketId} />
            ) : (
              <Link to="/profile" className="header">
                Verify your Email Before Adding Products
              </Link>
            )}
          </Tabs.Pane>
        )}

        {/* Products List */}
        <Tabs.Pane
          label={
            <>
              <Icon name="Menu" className="icon" />
              Products ({market.products?.items?.length})
            </>
          }
          name="2"
        >
          <div className="product-list">
            {market.products.items &&
              market.products.items.map((product) => (
                <Product key={product.id} product={product} />
              ))}
          </div>
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default MarketPage;
