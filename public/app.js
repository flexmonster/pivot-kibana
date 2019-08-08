import React from 'react';
import { uiModules } from 'ui/modules';
import chrome from 'ui/chrome';
import { render, unmountComponentAtNode } from 'react-dom';

import 'ui/autoload/styles';
import 'elasticsearch-browser';
import { FlexmonsterPivotTable } from './components/flexmonster/FlexmonsterPivotTable';

const app = uiModules.get('apps/flexmonsterPivot', ['elasticsearch'])
  .service('es', function (esFactory) {
    return esFactory;
  });

app.config($locationProvider => {
  $locationProvider.html5Mode({
    enabled: false,
    requireBase: false,
    rewriteLinks: false,
  });
});
app.config(stateManagementConfigProvider =>
  stateManagementConfigProvider.disable()
);

function RootController($scope, $element, $http, es) {
  const domNode = $element[0];

  $http.get('../api/flexmonster_pivot/es').then(
    (resp) => {
      const esClient = es(resp.data);
      // render react to DOM
      render(<FlexmonsterPivotTable esClient={esClient}/>, domNode);
    }
  );
  
  // unmount react on controller destroy
  $scope.$on('$destroy', () => {
    unmountComponentAtNode(domNode);
  });
}
chrome.setRootController('flexmonsterPivot', RootController);