import { html } from "htm/preact";

export default function (element) {
  return [
    {
      id: "extractScript",
      element: element,
      component: ScriptExtractButton,
      isEdited: function () {
        return false;
      },
    },
  ];
}

function ScriptExtractButton(props) {
  var element = props.element;

  function getScriptObject() {
    var bo = element.businessObject;
    var script = bo?.script;
    var arrowScript = bo?.conditionExpression?.body;
    var connectorScript =
      bo.extensionElements?.values?.[0]?.inputParameters.find(
        (e) => e.definition?.scriptFormat == "groovy",
      )?.definition?.value;
    return {
      script: connectorScript || script || arrowScript || "",
      id: bo.id,
    };
  }

  function getBpmnPath() {
    var tab = window.__currentTab;
    var filePath = tab && tab.file && tab.file.path;

    if (!filePath) {
      return null;
    }

    var dir = filePath.substring(0, filePath.lastIndexOf("\\"));
    if (dir === filePath) {
      dir = filePath.substring(0, filePath.lastIndexOf("/"));
    }
    if (dir === filePath) {
      return null;
    }

    var baseName = filePath.substring(dir.length + 1);
    baseName = baseName.replace(/\.[^\.]+$/, "");

    return dir + "\\" + baseName + ".bpmn";
  }

  var delimiter = "\n// #################\n";

  // function checkIsChanged() {
  //   // debugger;
  //   var scriptObject = getScriptObject();
  //   var scriptContent =
  //     `// ID: ${scriptObject.id}${delimiter}` + scriptObject.script;

  //   var bpmnPath = getBpmnPath();

  //   var _getGlobal = window.__scriptExtractorGetGlobal;
  //   var backend = _getGlobal && _getGlobal("backend");

  //   if (backend) {
  //     var parentDirPath = bpmnPath.split("registry-regulations")[0];
  //     var targetPath = parentDirPath + "script-extractor.groovy";
  //     var result = backend
  //       .send("file:read", targetPath, { encoding: "utf8" })
  //       .then((result) => {
  //         var fileContent =
  //           typeof result === "string" ? result : result && result.contents;
  //         var [idContent, fileContentClean] = fileContent.split(
  //           delimiter.trim(),
  //         );
  //         var hasSameId = idContent && idContent.includes(scriptObject.id);
  //         fileContentClean = fileContentClean.trim();
  //         if (hasSameId && fileContentClean != scriptObject.script.trim()) {
  //           return true;
  //         }
  //       });
  //     return result;
  //   }
  // }

  function handleClickEditor() {
    var scriptObject = getScriptObject();
    var scriptCleared = scriptObject.script.split(delimiter).at(-1);
    var scriptContent = `// ${scriptObject.id}${delimiter}` + scriptCleared;

    var bpmnPath = getBpmnPath();

    var _getGlobal = window.__scriptExtractorGetGlobal;
    var backend = _getGlobal && _getGlobal("backend");

    if (backend) {
      var parentDirPath = bpmnPath.split("registry-regulations")[0];
      var targetPath = parentDirPath + "script-extractor.groovy";
      debugger
      backend.send("dialog:save-file", { file: bpmnPath });
      backend
        .send(
          "file:write",
          targetPath,
          {
            contents: scriptContent,
          },
          {},
        )
        .then(() => {
          backend.send("vscode:open", {
            file: targetPath,
          });
        });
    }
  }

  function handleClickPaste() {
    // debugger;
    var scriptObject = getScriptObject();

    var bpmnPath = getBpmnPath();
    var parentDirPath = bpmnPath.split("registry-regulations")[0];
    var targetPath = parentDirPath + "script-extractor.groovy";

    var _getGlobal = window.__scriptExtractorGetGlobal;
    var backend = _getGlobal && _getGlobal("backend");

    if (props?.element?.businessObject?.$type != "bpmn:ScriptTask") {
      alert(
        `paste function currently works only for ScriptTask elements :c\n\nTODO: Implement for templateScripts and arrowScripts.`,
      );
      return;
    }
    if (backend) {
      backend
        .send("file:read", targetPath, { encoding: "utf8" })
        .then((result) => {
          // debugger;
          var fileContent =
            typeof result === "string" ? result : result && result.contents;
          var [fileHeader, fileContentClean] = fileContent.split(
            delimiter.trim(),
          );
          var fileId = fileHeader.replace(/[/#\s]/g, "");
          var hasSameId = fileId == scriptObject.id;
          fileContentClean = fileContentClean?.trim();
          if (!hasSameId || !fileContentClean) {
            alert(
              !fileContentClean
                ? "script-extractor.groovy  is empty.\npress 'Open with editor' to make changes for pasting here."
                : `element ID mismatch. \nscript-extractor.groovy contents previous script: ${fileId}\npress 'Open with editor' to make changes for pasting here.`,
            );
            return;
          }

          var element = props.element;
          if (element && element.businessObject) {
            element.businessObject.script = fileContentClean;

            // trigger element re-rendering
            try {
              var canvasElement =
                document.querySelector(".djs-container svg") ||
                document.querySelector(".viewport");

              var elementId =
                (element && element.id) ||
                (element &&
                  element.businessObject &&
                  element.businessObject.id);

              if (canvasElement && elementId) {
                var clickEvent = new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });

                // drop focus from the element by clicking the canvas
                canvasElement.dispatchEvent(clickEvent);
                console.log("Фокус сброшен кликом на холст");

                // reactivate the element by clicking on it after a short delay
                setTimeout(function () {
                  var targetVisualElement = document.querySelector(
                    '[data-element-id="' + elementId + '"]',
                  );

                  if (targetVisualElement) {
                    targetVisualElement.dispatchEvent(clickEvent);
                  } else {
                    console.warn("DOM element not found:", elementId);
                  }
                }, 50);
              }
            } catch (e) {
              console.error(e);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          alert(err);
        });
    }
  }

  return html`
    <div class="bio-properties-panel-entry" data-entry-id="extractScript">
      <style>
        .vsc-btn-container {
          display: flex;
          gap: 8px;
        }
        .vsc-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: none;
          padding: 12px;
          cursor: pointer;
          transition: 0.3s ease;
        }
        .vsc-btn--editor {
          gap: 12px;
          flex-grow: 1;
          background-color: #eef3f7;
        }
        .vsc-btn--editor:hover {
          background-color: #dceef9;
        }
        .vsc-btn--paste {
          gap: 6px;
          background-color: #f1f1f1;
        }
        .vsc-btn--paste:hover {
          background-color: #cfe7cc;
        }
        .vsc-btn-icon {
          width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.5;
        }
      </style>
      <div class="vsc-btn-container">
        <button class="vsc-btn vsc-btn--editor" onClick=${handleClickEditor}>
          <div class="vsc-btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="100%" viewBox="0 -960 960 960" width="100%" fill="#1f1f1f"><path d="M240-280 40-480l200-200 56 56-143 144 143 144-56 56Zm178 132-76-24 200-640 76 24-200 640Zm302-132-56-56 143-144-143-144 56-56 200 200-200 200Z"/></svg>
          </div>
          <span>Open with editor</span>
        </button>
        <button class="vsc-btn vsc-btn--paste" onclick=${handleClickPaste}>
          <div style="width: 16px;" class="vsc-btn-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="100%"
              viewBox="0 -960 960 960"
              width="100%"
              fill="#1f1f1f"
            >
              <path
                d="m720-120-56-57 63-63H480v-80h247l-63-64 56-56 160 160-160 160Zm120-400h-80v-240h-80v120H280v-120h-80v560h200v80H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h167q11-35 43-57.5t70-22.5q40 0 71.5 22.5T594-840h166q33 0 56.5 23.5T840-760v240ZM508.5-771.5Q520-783 520-800t-11.5-28.5Q497-840 480-840t-28.5 11.5Q440-817 440-800t11.5 28.5Q463-760 480-760t28.5-11.5Z"
              />
            </svg>
          </div>
          <span>Paste</span>
        </button>
      </div>
    </div>
  `;
}
