import React, { useEffect } from 'camunda-modeler-plugin-helpers/react';

export default function FilePathTracker(props) {
  var subscribe = props.subscribe;
  var _getGlobal = props._getGlobal;

  useEffect(function() {
    var activeTab = null;

    if (typeof _getGlobal === 'function') {
      window.__scriptExtractorGetGlobal = _getGlobal;
    }

    function handleTabChanged(_ref) {
      activeTab = _ref.activeTab;
      window.__currentTab = activeTab;
    }

    var unsubscribe = subscribe('app.activeTabChanged', handleTabChanged);

    return function() {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [subscribe, _getGlobal]);

  return null;
}