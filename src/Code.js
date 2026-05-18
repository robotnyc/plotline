/**
 * @OnlyCurrentDoc
 *
 * The above comment directs Apps Script to limit the scope of file
 * access for this add-on. It specifies that this add-on will only
 * attempt to read or modify the files in which the add-on is used,
 * and not all of the user's files. The authorization request message
 * presented to users will reflect this limited scope.
 */

function onOpen() {
  DocumentApp.getUi()
    .createMenu('Plotline')
    .addItem('Open sidebar', 'showSidebar')
    .addItem('Simulate "File not found"', 'enableSimulation')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Plotline')
    .setWidth(300); // TODO sidebars can't be resized
  DocumentApp.getUi().showSidebar(html);
}

function getPickerConfig() {
  return {
    token: ScriptApp.getOAuthToken(),
    fileId: DocumentApp.getActiveDocument().getId(),
    developerKey: PropertiesService.getScriptProperties().getProperty('GOOGLE_CLOUD_API_KEY'),
    appId: PropertiesService.getScriptProperties().getProperty('GOOGLE_CLOUD_PROJECT_NUMBER')
  };
}

function openPickerModal() {
  const html = HtmlService.createHtmlOutputFromFile('PickerModal')
    .setWidth(800).setHeight(500);
  DocumentApp.getUi().showModalDialog(html, 'Grant File Access');
}

function enableSimulation() {
  PropertiesService.getScriptProperties().setProperty('SIMULATE_FILE_NOT_FOUND', 'true');
  console.log('Simulation enabled.');
}

function disableSimulation() {
  PropertiesService.getScriptProperties().deleteProperty('SIMULATE_FILE_NOT_FOUND');
  console.log('Simulation disabled.');
}
