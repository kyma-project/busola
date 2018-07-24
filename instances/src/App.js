import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import ServiceInstances from './components/ServiceInstances/ServiceInstances.container';
import ServiceInstanceDetails from './components/ServiceInstanceDetails/ServiceInstanceDetails.container';

class App extends Component {
  render() {
    return (
      <div>
        <div className="ph3 pv1 background-gray">
          <Switch>
            <Route exact path="/" component={ServiceInstances} />
            <Route
              exact
              path="/details/:name"
              component={ServiceInstanceDetails}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
