import React, { useState, useEffect } from 'react';
import { Auth, Hub } from 'aws-amplify';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';

import './App.css';

export const UserContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);

  const onHubCapsule = (capsule) => {
    switch (capsule.payload.event) {
      case 'signIn':
        getUserData();
        break;
      case 'signUp':
        console.log('signed up');
        break;
      case 'signOut':
        console.log('user signed out');
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    getUserData();
    Hub.listen('auth', onHubCapsule);
  }, []);

  const getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    if (user) {
      setUser(user);
      return;
    }
    setUser(null);
  };

  const handleSignout = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (err) {
      console.warn('Error signing out user', err);
    }
  };

  return !user ? (
    <Authenticator theme={theme} />
  ) : (
    <UserContext.Provider value={{ user }}>
      <Router>
        <>
          {/* Navigation */}
          <Navbar user={user} handleSignout={handleSignout} />
          {/* Routes */}
          <div className="app-container">
            <Switch>
              <Route exact path="/" component={HomePage} />
              <Route exact path="/profile" component={ProfilePage} />
              <Route
                exact
                path="/market/:marketId"
                component={({ match }) => (
                  <MarketPage marketId={match.params.marketId} />
                )}
              />
            </Switch>
          </div>
        </>
      </Router>
    </UserContext.Provider>
  );
}

const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: '#ffc0cb',
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: 'var(--amazonOrange)',
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: '5px',
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: 'var(--squidInk)',
  },
};

// export default withAuthenticator(App, true, [], null, theme);
export default App;
