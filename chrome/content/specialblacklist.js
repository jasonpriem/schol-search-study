var lemurlogtoolbar_DlgSettingsWindow=window.arguments[0];
var lemurlogtoolbar_PersonalBLItemsRegex=window.arguments[1];

function lemurlogtoolbar_addToPersonalBlacklist(readableValue, valueToAdd) {
  var lstBlacklist=lemurlogtoolbar_DlgSettingsWindow.document.getElementById('lstBlacklistPersonalData')
  lstBlacklist.appendItem(readableValue, readableValue);
  lemurlogtoolbar_PersonalBLItemsRegex.splice(lemurlogtoolbar_PersonalBLItemsRegex.length, 0, valueToAdd);
}

function lemurlogtoolbar_btnAddPhoneOnClick() {
  var txtPhone=document.getElementById('txtPhoneNumber');
  var phoneValue= lemurlogtoolbar_trimString(txtPhone.value);

  // US phone
  var testValue=phoneValue.match("^(?:\\+)?(?:1[\\s\\.\\-]?)?[(]?(\\d{3})?[\\s\\)\\-\\.]?[\\s]?(\\d{3})[\\s\\-\\.]?(\\d{4})$");
  if (testValue!=null && testValue.length==4) {
    var val="";
    if (testValue[1]==undefined) {
      // only 7 digits
      val=testValue[2] + "[\\s\\-\\.]?" + testValue[3];
    } else {
      // 7 digits + area code
      val="\\+?(1[\\s\\.\\-]?)?[\\(]?" + testValue[1] + "[\\s\\)\\-\\.]?[\\s]?" + testValue[2] + "[\\s\\-\\.]?" + testValue[3];
    }
    lemurlogtoolbar_addToPersonalBlacklist(phoneValue, val);
    close();
    return;
  }
  
  // international phone
  // i.e. +44 (0) 28 9065 1066
  
  // optional +
  // optional space
  // optional 2 digits (grouping)
  // optional space
  // optional ( or -
  // optional 1 digit (grouping)
  // optional ) - (if first ( or - matched)
  // optional space
  // required 1 digit (grouping)
  // required 7 to 20 digits with - space or . matched (grouping)
  
  testValue=phoneValue.match("^\\+?\\s?(?:(\\d{1,2})?[\\-\\.\\s])?(?:[\\s\\.\\(\\-]+(\\d)[\\s\\.\\)\\-]+)?\\s?([\\d\\-\\.\\s]{7,20})$");
  
  if (testValue!=null && testValue.length==4) {
    var val="\\+?\\s?";
    if (testValue[1]!=undefined && testValue[2]==undefined) {
      val=testValue[1] + "[\\-\\.\\s]";
      var replacementDel=new RegExp("[\\-\\.\\s]", "g");
      val += testValue[3].replace(replacementDel, "[\\-\\.\\s]");
    } else {
    
      if (testValue[1]!=undefined) {
        val += testValue[1];
      } else {
        val += "(?:(\\d{1,2})?[\\-\\.\\s])?"
      }
      val += "(?:[\\s\\.\\(\\-]+";
      if (testValue[2]!=undefined) {
        val += testValue[2];
      } else {
        val += "\\d";
      }
      val += "[\\s\\.\\)\\-]+)?\\s?";

      var replacementDel=new RegExp("[\\-\\.\\s]", "g");
      val += testValue[3].replace(replacementDel, "[\\-\\.\\s]");
    }
    
    lemurlogtoolbar_addToPersonalBlacklist(phoneValue, val);
    close();
    return;
  }
  
  alert("Please enter a valid phone number.");
}

function lemurlogtoolbar_btnAddCCOnClick() {
  // visa, mc, discover / amex 
  // var regexCC=new RegExp("^(?:(\\d{4})[ -]?(\\d{4})[ -]?(\\d{4})[ -]?(\\d{4}))|(?:(\\d{4})[ -]?(\\d{5})[ -]?(\\d{5}))$");
  
  var txtCreditCard=document.getElementById('txtCreditCard');
  var ccValue=lemurlogtoolbar_trimString(txtCreditCard.value);
  var testValue=ccValue.match("^(\\d{4})[ -]?(\\d{4})[\\s\\-]?(\\d{4})[\\s\\-]?(\\d{4})$");
  if (testValue!=null && testValue.length==5) {
    // mc / discover / visa
    var val=testValue[1]+"[\\s\\-]?" + testValue[2] + "[\\s\\-]?" + testValue[3] + "[\\s\\-]?" + testValue[4];
    lemurlogtoolbar_addToPersonalBlacklist(ccValue, val);
    close();
    return;
  }
  
  testValue=ccValue.match("^(\\d{4})[\\s\\-]?(\\d{5})[\\s\\-]?(\\d{5})$");
  if (testValue!=null && testValue.length==4) {
    // amex
    var val=testValue[1]+"[\\s\\-]?" + testValue[2] + "[\\s\\-]?" + testValue[3];
    lemurlogtoolbar_addToPersonalBlacklist(ccValue, val);
    close();
    return;
  }
  
  alert("The credit card you entered does not appear valid.");
}

function lemurlogtoolbar_btnAddSSNOnClick() {
  
  var txtSSN=document.getElementById('txtSSN');
  var ssnValue=lemurlogtoolbar_trimString(txtSSN.value);
  var testValue=ssnValue.match("^(\\d{3})[\\s\\-]?(\\d{2})[\\s\\-]?(\\d{4})$");
  if (testValue!=null && testValue.length==4) {
    var val=testValue[1]+"[\\s\\-]?" + testValue[2] + "[\\s\\-]?" + testValue[3];
    lemurlogtoolbar_addToPersonalBlacklist(ssnValue, val);
    close();
    return;
  }
  alert("The SSN you entered does not appear valid.\nPlease enter a SSN in the form of:\n###-##-#### or ### ## #### or #########");
}

function lemurlogtoolbar_btnAddDriversOnClick() {
  // search for:
  // possibly 2 letter abbriv. ([\\w]{2})?  
  // space / - separator or none
  // digits - min 6, up to 16 with potential spacers
  var txtDriversLic=document.getElementById('txtDriversLic');
  var dlValue=lemurlogtoolbar_trimString(txtDriversLic.value);
  var testValue=dlValue.match("^(\\w{1,2})?[\\s\\-]?([\\d\\s\\-]{6,16})$");
  if (testValue!=null && testValue.length==3) {
    var val="";
    
    if (testValue[1]!=undefined) {
      val += testValue[1] + "[\\s\\-]?";
    }
    
    var replacementDel=new RegExp("[\\-\\s]", "g");
    val += testValue[2].replace(replacementDel, "[\\-\\s]");
    
    lemurlogtoolbar_addToPersonalBlacklist(dlValue, val);
    close();
    return;
  }
  alert("The Driver's License you entered does not appear valid.\nPlease enter the number (without the state or country abbreviation).");
  
}
