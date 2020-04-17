import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Auth, Hub } from 'aws-amplify';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { Router, Route, Switch } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';

import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketPage from './pages/MarketPage';

import { getUser } from './graphql/queries';
import { registerUser } from './graphql/mutations';

import './App.css';

export const history = createBrowserHistory();
export const UserContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);

  const onHubCapsule = (capsule) => {
    switch (capsule.payload.event) {
      case 'signIn':
        getUserData();
        registerNewUser(capsule.payload.data);
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

  const registerNewUser = async (signinData) => {
    const getUserInput = {
      id: signinData.signInUserSession.idToken.payload.sub,
    };

    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));
    // if we can't get a user (meaning the user hasnt been registered before), then we execute registerUser

    if (!data.getUser) {
      try {
        const regiseterUserInput = {
          ...getUserInput,
          username: signinData.username,
          email: signinData.signInUserSession.idToken.payload.email,
          registered: true,
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, {
            input: regiseterUserInput,
          })
        );
        console.log({ newUser });
      } catch (err) {
        console.error('Error registering new user', err);
      }
    }
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
      <Router history={history}>
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
                path="/markets/:marketId"
                component={({ match }) => (
                  <MarketPage user={user} marketId={match.params.marketId} />
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
