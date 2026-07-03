import { registerClientExtension, registerBpmnJSPlugin } from 'camunda-modeler-plugin-helpers';
import FilePathTracker from './FilePathTracker';
import ScriptExtractorModule from './provider';

registerClientExtension(FilePathTracker);
registerBpmnJSPlugin(ScriptExtractorModule);
