import { is } from "bpmn-js/lib/util/ModelUtil";
import scriptButtonEntry from "./parts/ScriptButtonEntry";

export default function ScriptTaskButtonProvider(propertiesPanel, translate) {
  this.getGroups = function (element) {
    return function (groups) {
      var connectorExtension =
        element.businessObject?.extensionElements?.values?.[0];
      var connectorScript = connectorExtension?.inputParameters?.find(
        (param) => param?.definition?.scriptFormat === "groovy",
      );
      if (connectorScript) {
        var descriptionGroup = groups?.[1]?.entries;
        if (Array.isArray(descriptionGroup)) {
          var btn = scriptButtonEntry(element).at(0);
          descriptionGroup.push(btn);
          return groups;
        }
      }

      if (is(element, "bpmn:ScriptTask")) {
        var scriptGroup = groups.find((e) => e.id == "CamundaPlatform__Script");
        if (scriptGroup && Array.isArray(scriptGroup.entries)) {
          var btn = scriptButtonEntry(element).at(0);
          scriptGroup.entries.splice(2, 0, btn);
        }
        return groups;
      }

      var isArrowScript =
        element.businessObject?.conditionExpression?.language == "groovy";
      if (isArrowScript) {
        var conditionGroup = groups.find(
          (e) => e.id == "CamundaPlatform__Condition",
        )?.entries;
        if (Array.isArray(conditionGroup)) {
          var btn = scriptButtonEntry(element).at(0);
          conditionGroup.push(btn);
        }
      }
      return groups;
    };
  };

  propertiesPanel.registerProvider(500, this);
}

ScriptTaskButtonProvider.$inject = ["propertiesPanel", "translate"];

function createScriptGroup(element, translate) {
  return {
    id: "scriptExtractor",
    label: translate("Script Extractor"),
    entries: scriptButtonEntry(element),
    // tooltip: translate('Extract script to .groovy file')
  };
}
