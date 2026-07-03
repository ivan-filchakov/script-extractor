const fs = require("fs");
const { exec } = require("child_process");
const { shell, dialog } = require("electron");

module.exports = function (app, state) {
  return [
    {
      label: "About",
      enabled: isBpmnTabActive(state),
      action: function () {
        dialog.showMessageBox({
          title: "Extract the script:",
          message:
            "  1. Select a Script Task element\n" +
            '  2. Click "Open with editor" button in the Props Panel',
        });
      },
    },

  ];
};

function isBpmnTabActive(state) {
  return !!getGroovyPath(state);
}

function getGroovyPath(state) {
  var activeTab = state.activeTab;

  if (!activeTab) {
    return null;
  }

  var file = activeTab.file;

  if (!file || !file.path) {
    return null;
  }

  if (!/\.bpmn$/i.test(file.path)) {
    return null;
  }

  return file.path.replace(/\.bpmn$/i, "") + ".groovy";
}

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}
