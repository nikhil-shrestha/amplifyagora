import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API, graphqlOperation } from 'aws-amplify';
import { Loading, Tabs, Icon } from 'element-react';

import NewProduct from '../components/NewProduct';
import Product from '../components/Product';
import { getMarket } from '../graphql/queries';

const useStateWithCallback = (initialState, callback) => {
  const [state, setState] = useState(initialState);

  useEffect(() => callback(state), [state, callback]);

  return [state, setState];
};

const MarketPage = (props) => {
  const { marketId, user } = props;

  const [market, setMarket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarketOwner, setIsMarketOwner] = useState(false);

  useEffect(() => {
    handleGetMarket();
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
    setIsLoading(false);
  }

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
            <NewProduct />
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
                <Product product={product} />
              ))}
          </div>
        </Tabs.Pane>
      </Tabs>
    </>
  );
};

export default MarketPage;
