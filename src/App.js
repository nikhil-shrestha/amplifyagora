import React, { useState, useEffect } from 'react';
import { Auth, Hub } from 'aws-amplify';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';

import './App.css';

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

  return !user ? <Authenticator theme={theme} /> : <div>App</div>;
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
