

var lemurlogtoolbar_LemurLogToolbarConfiguration=window.arguments[0];

var lemurlogtoolbar_PersonalBLItemsRegex=new Array();
var lemurlogtoolbar_AddressBLItemsRegex=new Array();
var lemurlogtoolbar_ProperNameBLItemsRegex=new Array();
var lemurlogtoolbar_KeywordBLItemsRegex=new Array();

var lemurlogtoolbar_KnownSearchEnginePrefixes=new Array();

/**
 * retrieves the value as a boolean from a checkbox element
 * @param checkboxId the name of the checkbox component
 * @return true or value (value)
 */
function lemurlogtoolbar_getCheckboxItemValue(checkboxId) {
  var thisBox=document.getElementById(checkboxId);
  if (thisBox) {
    return thisBox.checked;
  }
  return false;
}

function lemurlogtoolbar_setCheckboxItemValue(checkboxId, newvalue) {
  var thisBox=document.getElementById(checkboxId);
  if (thisBox) {
    thisBox.checked=newvalue;
  }
}

/**
 * retrieves a listbox element's values and places them
 * in a string delimited by \n
 * @param lstItem the list element
 * @return encoded string
 */
function lemurlogtoolbar_getListItemAsString(lstItemId) {
  var lstItem=document.getElementById(lstItemId);
  if (!lstItem) { return ""; }
  
  var retString="";
  var hasOne=false;
  var numItems=lstItem.getRowCount();
  for (var i=0; i < numItems; i++) {
    var thisItemValue=lstItem.getItemAtIndex(i).value;
    if (thisItemValue.length > 0) {
      if (hasOne) { retString +="\n"; }
      retString += thisItemValue;
      hasOne=true;
    }
  }
  return retString;
}

function lemurlogtoolbar_getArrayItemAsString(thisArray) {
  var retString="";
  var hasOne=false;
  for (var i=0; i < thisArray.length; i++) {
    if (hasOne) { retString +="\n"; }
    retString += thisArray[i];
    hasOne=true;
  }
  return retString;
}

/**
 * populates a listbox element's values 
 * 
 * @param lstItemId the ID of list element
 * @param inString the input string (\n delimited)
 */
function lemurlogtoolbar_populateListboxFromString(lstItemId, inString) {
  var lstItem=document.getElementById(lstItemId);
  if (!lstItem) { return; }
  
  // clear the listbox
  while (lstItem.getRowCount() != 0) {
    lstItem.removeItemAt(0);
  
  }
  var items=inString.split("\n");
  for (var i=0; i < items.length; i++) {
    if (items[i].length > 0) {
      lstItem.appendItem(items[i], items[i]);
    }
  }
}

function lemurlogtoolbar_populateArrayFromString(inString) {
  var thisArray=new Array();
  var items=inString.split("\n");
  for (var i=0; i < items.length; i++) {
    if (items[i].length > 0) {
      thisArray[i]=items[i];
    }
  }
  return thisArray;
}

function lemurlogtoolbar_setOptionsSettings() {
  lemurlogtoolbar_LemurLogToolbarConfiguration.loadLocalUserConfiguration();
  lemurlogtoolbar_LemurLogToolbarConfiguration.getDefaultServerConfiguration();

  // if (lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL.length==0) {
  //  lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL=window.prompt("No server address is defined\nPlease enter one\n(or leave blank for none):");
  // }
  
  // load current configuration here...
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowRandomSessionId==false) {
    var thisCheckbox=document.getElementById('chkAnonSession');
    thisCheckbox.value=false;
    thisCheckbox.disabled=true;
  }
  
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowBlacklistPersonal==false) {
    var thisCheckbox=document.getElementById('chkPersonalData');
    thisCheckbox.value=false;
    thisCheckbox.disabled=true;
    var thisListbox=document.getElementById('tabBlacklistPersonal');
    thisListbox.disabled=true; 
  }

  if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowBlacklistAddress==false) {
    var thisCheckbox=document.getElementById('chkAddressData');
    thisCheckbox.value=false;
    thisCheckbox.disabled=true;
    var thisListbox=document.getElementById('tabBlacklistAddress');
    thisListbox.disabled=true; 
  }
  
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowBlacklistProperName==false) {
    var thisCheckbox=document.getElementById('chkProperNameData');
    thisCheckbox.value=false;
    thisCheckbox.disabled=true;
    var thisListbox=document.getElementById('tabBlacklistNames');
    thisListbox.disabled=true; 
  }
  
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowBlacklistKeywords==false) {
    var thisCheckbox=document.getElementById('chkKeywordData');
    thisCheckbox.value=false;
    thisCheckbox.disabled=true;
    var thisListbox=document.getElementById('tabBlacklistKeywords');
    thisListbox.disabled=true; 
  }
  
  lemurlogtoolbar_populateListboxFromString('lstBlacklistPersonalData', lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPersonalItems);
  lemurlogtoolbar_populateListboxFromString('lstBlacklistAddressData', lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistAddressItems);
  lemurlogtoolbar_populateListboxFromString('lstBlacklistNameData', lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPropernameItems);
  lemurlogtoolbar_populateListboxFromString('lstBlacklistKeywordData', lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistKeywordItems);
  
  lemurlogtoolbar_PersonalBLItemsRegex=lemurlogtoolbar_populateArrayFromString(lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPersonalRegex);
  lemurlogtoolbar_AddressBLItemsRegex=lemurlogtoolbar_populateArrayFromString(lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistAddressRegex);
  lemurlogtoolbar_ProperNameBLItemsRegex=lemurlogtoolbar_populateArrayFromString(lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPropernameRegex);
  lemurlogtoolbar_KeywordBLItemsRegex=lemurlogtoolbar_populateArrayFromString(lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistKeywordRegex);
  
  lemurlogtoolbar_setCheckboxItemValue('chkAnonSession', lemurlogtoolbar_LemurLogToolbarConfiguration._useRandomSessionId);
  lemurlogtoolbar_setCheckboxItemValue('chkUseDesktopSearch', lemurlogtoolbar_LemurLogToolbarConfiguration._useDesktopSearch);
  lemurlogtoolbar_setCheckboxItemValue('chkPersonalData', lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistPersonal);
  lemurlogtoolbar_setCheckboxItemValue('chkAddressData', lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistAddress);
  lemurlogtoolbar_setCheckboxItemValue('chkProperNameData', lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistProperName);
  lemurlogtoolbar_setCheckboxItemValue('chkKeywordData', lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistKeywords);
  
  lemurlogtoolbar_populateListboxFromString('lstSearchEngines', lemurlogtoolbar_LemurLogToolbarConfiguration._knownSearchEngines);
  
  lemurlogtoolbar_chkPersonalDataOnChange();
  lemurlogtoolbar_chkAddressDataOnChange();
  lemurlogtoolbar_chkProperNameDataOnChange();
  lemurlogtoolbar_chkKeywordDataOnChange();
     
  var txtServer=document.getElementById('txtServer');
  txtServer.value=lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL;
  
  lemurlogtoolbar_setAutoUploadVisualSettings();
}

function lemurlogtoolbar_setAutoUploadVisualSettings() {
  var autoUploadRB=document.getElementById('btnAllowAutoUploads');
  var manualUploadOnlyRB=document.getElementById('btnManualUploadsOnly');
  var autoUploadAskRB=document.getElementById('btnAutoUploadsWithAsk');
  var grpAutoUploadBox=document.getElementById('rdoGroupAutoUploads');
  var lblAutoUploads=document.getElementById('lblAutoUploads');
  
  grpAutoUploadBox.selectedIndex=1;
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._serverAllowAutoUploads==false) {
    // manual upload only
    manualUploadOnlyRB.disabled=false;
    autoUploadRB.disabled=true;
    autoUploadAskRB.disabled=true;
    lblAutoUploads.label="Automatic Uploads: (server does not allow)";
  } else {
    manualUploadOnlyRB.disabled=false;
    autoUploadRB.disabled=false;
    autoUploadAskRB.disabled=false;
    lblAutoUploads.label="Automatic Uploads: (manual upload selected)";
    if (lemurlogtoolbar_LemurLogToolbarConfiguration._useAutomaticUploads==true) {
      lblAutoUploads.label="Automatic Uploads: next upload at:\n" + lemurlogtoolbar_LemurLogToolbarConfiguration.getNextAutoUploadTimeString();
      grpAutoUploadBox.selectedIndex=0;
      if (lemurlogtoolbar_LemurLogToolbarConfiguration._askWhenUsingAutoUploads==true) {
        grpAutoUploadBox.selectedIndex=2;
      }
    }
  }
  
  // var thisDialog=document.getElementById('dlgToolbarSettings');
  try {
    window.sizeToContent();
  } catch (excp) {
    // do nothing
  }
}

function lemurlogtoolbar_saveSettings() {
  // lemurlogtoolbar_LemurLogToolbarConfiguration.loadLocalUserConfiguration();
  
  var txtServer=document.getElementById('txtServer');
  
  lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL=txtServer.value;
  lemurlogtoolbar_LemurLogToolbarConfiguration._useRandomSessionId=lemurlogtoolbar_getCheckboxItemValue('chkAnonSession');
  lemurlogtoolbar_LemurLogToolbarConfiguration._useDesktopSearch=lemurlogtoolbar_getCheckboxItemValue('chkUseDesktopSearch');
  
  var autoUploadRB=document.getElementById('btnAllowAutoUploads');
  var manualUploadOnlyRB=document.getElementById('btnManualUploadsOnly');
  var autoUploadAskRB=document.getElementById('btnAutoUploadsWithAsk');
  
  if (autoUploadRB.selected==true) {
    // auto upload without ask
    lemurlogtoolbar_LemurLogToolbarConfiguration._useAutomaticUploads=true;
    lemurlogtoolbar_LemurLogToolbarConfiguration._askWhenUsingAutoUploads=false;
  } else if (autoUploadAskRB.selected==true) {
    // auto upload ask
    lemurlogtoolbar_LemurLogToolbarConfiguration._useAutomaticUploads=true;
    lemurlogtoolbar_LemurLogToolbarConfiguration._askWhenUsingAutoUploads=true;
  } else {
    // manual upload
    lemurlogtoolbar_LemurLogToolbarConfiguration._useAutomaticUploads=false;
    lemurlogtoolbar_LemurLogToolbarConfiguration._askWhenUsingAutoUploads=false;
  }
  
  lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPersonalItems=lemurlogtoolbar_getListItemAsString('lstBlacklistPersonalData');
  lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistAddressItems=lemurlogtoolbar_getListItemAsString('lstBlacklistAddressData');
  lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPropernameItems=lemurlogtoolbar_getListItemAsString('lstBlacklistNameData');
  lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistKeywordItems=lemurlogtoolbar_getListItemAsString('lstBlacklistKeywordData');
  
  lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPersonalRegex=lemurlogtoolbar_getArrayItemAsString(lemurlogtoolbar_PersonalBLItemsRegex);
  lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistAddressRegex=lemurlogtoolbar_getArrayItemAsString(lemurlogtoolbar_AddressBLItemsRegex);
  lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPropernameRegex=lemurlogtoolbar_getArrayItemAsString(lemurlogtoolbar_ProperNameBLItemsRegex);
  lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistKeywordRegex=lemurlogtoolbar_getArrayItemAsString(lemurlogtoolbar_KeywordBLItemsRegex);

  lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistPersonal=lemurlogtoolbar_getCheckboxItemValue('chkPersonalData');
  lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistAddress=lemurlogtoolbar_getCheckboxItemValue('chkAddressData');
  lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistProperName=lemurlogtoolbar_getCheckboxItemValue('chkProperNameData');
  lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistKeywords=lemurlogtoolbar_getCheckboxItemValue('chkKeywordData');
  
  lemurlogtoolbar_LemurLogToolbarConfiguration._knownSearchEngines=lemurlogtoolbar_getListItemAsString('lstSearchEngines');
  
  lemurlogtoolbar_LemurLogToolbarConfiguration.saveLocalUserConfiguration();

  lemurlogtoolbar_setAutoUploadVisualSettings();

  return true;
}

function lemurlogtoolbar_txtServerOnChange() {
  var txtServer=document.getElementById('txtServer');
  
  lemurlogtoolbar_LemurLogToolbarConfiguration.loadLocalUserConfiguration();
  if (txtServer.value!=lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL) {
    var doReloadVal=window.confirm("The server address has changed.\nClick \"OK\" to retrieve the server configuration.");
    if (doReloadVal) {
      lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL=txtServer.value;
      lemurlogtoolbar_LemurLogToolbarConfiguration.saveLocalUserConfiguration();
      lemurlogtoolbar_LemurLogToolbarConfiguration.getDefaultServerConfiguration(true);
      lemurlogtoolbar_setOptionsSettings();
    }
  }
}

function lemurlogtoolbar_chkPersonalDataOnChange() {
  var thisCheckbox=document.getElementById('chkPersonalData');
  var thisListbox=document.getElementById('lstBlacklistPersonalData');
  if (thisCheckbox.checked) {
    thisListbox.disabled=false;
  } else {
    thisListbox.disabled=true;
  }
  lemurlogtoolbar_drpBlacklists_OnSelect();
}

function lemurlogtoolbar_chkAddressDataOnChange() {
  var thisCheckbox=document.getElementById('chkAddressData');
  var thisListbox=document.getElementById('lstBlacklistAddressData');
  if (thisCheckbox.checked) {
    thisListbox.disabled=false;
  } else {
    thisListbox.disabled=true;
  }
  lemurlogtoolbar_drpBlacklists_OnSelect();
}

function lemurlogtoolbar_chkProperNameDataOnChange() {
  var thisCheckbox=document.getElementById('chkProperNameData');
  var thisListbox=document.getElementById('lstBlacklistNameData');
  if (thisCheckbox.checked) {
    thisListbox.disabled=false;
  } else {
    thisListbox.disabled=true;
  }
  lemurlogtoolbar_drpBlacklists_OnSelect();
}

function lemurlogtoolbar_chkKeywordDataOnChange() {
  var thisCheckbox=document.getElementById('chkKeywordData');
  var thisListbox=document.getElementById('lstBlacklistKeywordData');
  if (thisCheckbox.checked) {
    thisListbox.disabled=false;
  } else {
    thisListbox.disabled=true;
  }
  lemurlogtoolbar_drpBlacklists_OnSelect();
}

function lemurlogtoolbar_setWhichBlacklistItems(thisListBox) {
  var groupLabel=document.getElementById('lblBlacklistGroup');
  document.getElementById('btnRemoveListItem').disabled=true;
  if (thisListBox.disabled) {
    document.getElementById('txtNewListItem').disabled=true;
    document.getElementById('btnAddListItem').disabled=true;
    groupLabel.value += ' (disabled)';
  } else {
    document.getElementById('txtNewListItem').disabled=false;
    document.getElementById('btnAddListItem').disabled=false;
  }
}

// when user selects the dropdown menu for blacklists
function lemurlogtoolbar_drpBlacklists_OnSelect() {
  var drpBlacklists=document.getElementById('drpBlacklists');
  var groupLabel=document.getElementById('lblBlacklistGroup');
  var groupTab=document.getElementById('tbBlacklists');
  var whichPanel;
  switch (drpBlacklists.selectedIndex) {
    case 0:
      groupLabel.setAttribute('value', 'Personal Data:');
      whichPanel=document.getElementById('tabBlacklistPersonal');
      break;
    case 1:
      groupLabel.setAttribute('value', 'Addresses:');
      whichPanel=document.getElementById('tabBlacklistAddress');
      break;
    case 2:
      groupLabel.setAttribute('value', 'Proper Names:');
      whichPanel=document.getElementById('tabBlacklistNames');
      break;
    default:
      groupLabel.setAttribute('value', 'Keywords:');
      whichPanel=document.getElementById('tabBlacklistKeywords');
  }
  groupTab.selectedPanel=whichPanel;
  lemurlogtoolbar_setWhichBlacklistItems(lemurlogtoolbar_getWhichBlacklistControl());
}

function lemurlogtoolbar_getWhichBlacklistControl() {
  var drpBlacklists=document.getElementById('drpBlacklists');
  switch (drpBlacklists.selectedIndex) {
    case 0: return document.getElementById('lstBlacklistPersonalData');
    case 1: return document.getElementById('lstBlacklistAddressData');
    case 2: return document.getElementById('lstBlacklistNameData');
    default: return document.getElementById('lstBlacklistKeywordData');
  }
}

function lemurlogtoolbar_getWhichRegexArray() {
  var drpBlacklists=document.getElementById('drpBlacklists');
  switch (drpBlacklists.selectedIndex) {
    case 0: return lemurlogtoolbar_PersonalBLItemsRegex;
    case 1: return lemurlogtoolbar_AddressBLItemsRegex;
    case 2: return lemurlogtoolbar_ProperNameBLItemsRegex;
    default: return lemurlogtoolbar_KeywordBLItemsRegex;
  }
}

function lemurlogtoolbar_btnRemoveListItemOnClick() {
  var thisListBox=lemurlogtoolbar_getWhichBlacklistControl();
  var thisArray=lemurlogtoolbar_getWhichRegexArray();
  if (thisListBox.selectedIndex > -1) {
    thisArray.splice(thisListBox.selectedIndex, 1);
    thisListBox.removeItemAt(thisListBox.selectedIndex);
  }
}

function lemurlogtoolbar_btnAddListItemOnClick() {
  var thisListBox=lemurlogtoolbar_getWhichBlacklistControl();
  var thisTextBox=document.getElementById('txtNewListItem');
  var thisArray=lemurlogtoolbar_getWhichRegexArray();
  var thisValue=thisTextBox.value;
  if (thisValue.length > 0) {
    // ensure it will properly evaluate to 
    // a regex correct item
    thisListBox.appendItem(thisValue, thisValue);
    thisArray.splice(thisArray.length, 0, lemurlogtoolbar_makeSafeForRegEx(thisValue)); //.safeForRegEx());
  }
}

function lemurlogtoolbar_doListItemSelection() {
  var thisListBox=lemurlogtoolbar_getWhichBlacklistControl();
  if (thisListBox.selectedIndex > -1) {
    document.getElementById('btnRemoveListItem').disabled=false;
  } else {
    document.getElementById('btnRemoveListItem').disabled=true;
  }  
}

function lemurlogtoolbar_btnRemoveSEListItemOnClick() {
  var thisListBox=document.getElementById('lstSearchEngines')
  if (thisListBox.selectedIndex > -1) {
    lemurlogtoolbar_KnownSearchEnginePrefixes.splice(thisListBox.selectedIndex, 1);
    thisListBox.removeItemAt(thisListBox.selectedIndex);
  }
}

function lemurlogtoolbar_btnAddSEListItemOnClick() {
  var thisListBox=document.getElementById('lstSearchEngines')
  var thisTextBox=document.getElementById('txtNewSEListItem');
  var thisValue=thisTextBox.value;
  if (thisValue.length > 0) {
    thisListBox.appendItem(thisValue, thisValue);
    lemurlogtoolbar_KnownSearchEnginePrefixes.splice(lemurlogtoolbar_KnownSearchEnginePrefixes.length, 0, lemurlogtoolbar_makeSafeForRegEx(thisValue)); //safeForRegEx());
  }
}

function lemurlogtoolbar_doSEListItemSelection() {
  var thisListBox=document.getElementById('lstSearchEngines')
  if (thisListBox.selectedIndex > -1) {
    document.getElementById('btnRemoveSEListItem').disabled=false;
  } else {
    document.getElementById('btnRemoveListItem').disabled=true;
  }  
}

function lemurlogtoolbar_btnAddSpecialPersonalOnClick() {
  window.openDialog('chrome://lemurlogtoolbar/content/specialblacklist.xul', 'Personal Information Blacklist', 'chrome=yes,modal=yes,status=no', this, lemurlogtoolbar_PersonalBLItemsRegex);
}

