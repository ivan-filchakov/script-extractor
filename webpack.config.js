const path = require('path');

module.exports = {
  mode: 'development',
  entry: './client/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'client.js'
  },
  devtool: 'cheap-module-source-map',
  resolve: {
    alias: {
      'react': 'camunda-modeler-plugin-helpers/vendor/react',
      '@bpmn-io/properties-panel': 'camunda-modeler-plugin-helpers/vendor/@bpmn-io/properties-panel',
      'bpmn-js-properties-panel': 'camunda-modeler-plugin-helpers/vendor/bpmn-js-properties-panel'
    }
  }
};
