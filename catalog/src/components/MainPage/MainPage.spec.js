import React from 'react';
import ReactDOM from 'react-dom';
import MainPage from './MainPage.component';

jest.mock('../ServiceClassList/ServiceClassList.container', () => () => null);

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <MainPage
      serviceClasses={{
        loading: false,
      }}
    />,
    div,
  );
  ReactDOM.unmountComponentAtNode(div);
});
