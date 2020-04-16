import React, { useState } from 'react';

import NewMarket from '../components/NewMarket';
import MarketList from '../components/MarketList';

const HomePage = () => {
  return (
    <>
      <NewMarket />
      <MarketList />
    </>
  );
};

export default HomePage;
