import React, { useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';

import NewMarket from '../components/NewMarket';
import MarketList from '../components/MarketList';
import { searchMarkets } from '../graphql/queries';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchChange = (searchTerm) => setSearchTerm(searchTerm);

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleSearch = async (event) => {
    try {
      event.preventDefault();
      setIsSearching(true);
      const { data } = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: searchTerm } },
              { owner: { match: searchTerm } },
              { tags: { match: searchTerm } },
            ],
          },
          sort: {
            field: 'name',
            direction: 'asc',
          },
        })
      );

      console.log({ data });

      setSearchResults(data.searchMarkets.items);
      setIsSearching(false);
    } catch (err) {
      console.log({ err });
    }
  };

  return (
    <>
      <NewMarket
        searchTerm={searchTerm}
        isSearching={isSearching}
        handleSearchChange={handleSearchChange}
        handleClearSearch={handleClearSearch}
        handleSearch={handleSearch}
      />
      <MarketList searchResults={searchResults} searchTerm={searchTerm} />
    </>
  );
};

export default HomePage;
