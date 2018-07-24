import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import MainPage from '../MainPage/MainPage.container';
import Details from '../ServiceClassDetails/ServiceClassDetails.container';
import Notification from '../Notification/Notification.component';

const NOTIFICATION_VISIBILITY_TIME = 5000;

class App extends Component {
  scheduleClearNotification() {
    const props = this.props;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      if (props && props.clearNotification) {
        props.clearNotification();
      }
    }, NOTIFICATION_VISIBILITY_TIME);
  }

  clearNotification = () => {
    clearTimeout(this.timeout);
    this.props.clearNotification();
  };

  render() {
    const notificationQuery = this.props.notification;
    const notification = notificationQuery && notificationQuery.notification;
    if (notification) {
      this.scheduleClearNotification();
    }

    return (
      <div>
        <Notification {...notification} onClick={this.clearNotification} />
        <div className="ph3 pv1 background-gray">
          <Switch>
            <Route exact path="/" component={MainPage} />
            <Route exact path="/details/:name" component={Details} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
