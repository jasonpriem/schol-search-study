

//String.prototype.trim = function () {
//  return this.replace(/^\s*/, "").replace(/\s*$/, "");
//}

function lemurlogtoolbar_trimString( x ) {
    return x.replace(/^\s*/, "").replace(/\s*$/, "");
}


var lemurlogtoolbar_regexFilterSafeString="(\\\\|\\/|\\(|\\)|\\[|\\]|\\{|\\}|\\*|\\+|\\?|\\||\\^|\\$|\\.|\\-)";
var lemurlogtoolbar_regexFilterSafe=new RegExp(lemurlogtoolbar_regexFilterSafeString);

//String.prototype.safeForRegEx = function () {
  // characters to escape:
  // \/()[]{}*+?|^$.-
function lemurlogtoolbar_makeSafeForRegEx( x ) {
  var tmpVar = x.replace(lemurlogtoolbar_regexFilterSafe, "\\$1");
  return tmpVar;
}

var lemurlogtoolbar_LemurLogToolbarConfiguration = {

  _isCurrentlyUploading: false,

  _needToRefreshSettings: true,

  _serverBaseURL: "",
  
  _serverAllowAutoUploads: true,
  _useAutomaticUploads: true,
  _askWhenUsingAutoUploads: false,
  _nextTimeToAutoUpload: 0,
  _autoUploadIntervalTime: 604800000,

  _allowRandomSessionId: true,
  _useRandomSessionId: false,

  _allowBlacklistPersonal: true,
  _allowBlacklistAddress: true,
  _allowBlacklistProperName: true,
  _allowBlacklistKeywords: true,
  
  _useBlacklistPersonal: true,
  _useBlacklistAddress: true,
  _useBlacklistProperName: true,
  _useBlacklistKeywords: true,
  
  _useDesktopSearch: true,
  
  _serverEncryptionModulus: "",
  _serverEncryptionExponent: "",
  
  _blacklistPersonalItems: "",
  _blacklistAddressItems: "",
  _blacklistPropernameItems: "",
  _blacklistKeywordItems: "",
  
  _blacklistPersonalRegex: "",
  _blacklistAddressRegex: "",
  _blacklistPropernameRegex: "",
  _blacklistKeywordRegex: "",
  
  _knownSearchEngines: "",
  
  prefs: null,
  
  startup: function () {
  },
  
  arrayToString: function(thisArray) {
    var retString="";
    var hasOne=false;
    for (var i=0; i < thisArray.length; i++) {
      if (hasOne) { retString +="\n"; }
      retString += thisArray[i];
      hasOne=true;
    }
    return retString;
  },
  
  arrayFromString: function (inString) {
    var thisArray=new Array();
    var items=inString.split("\n");
    for (var i=0; i < items.length; i++) {
      if (items[i].length > 0) {
        thisArray[i]=items[i];
      }
    }
    return thisArray;
  },

  getDefaultServerConfiguration: function (forceReload, checkOnStartup) {
    var forceReload = (forceReload == null) ? false : forceReload;
    var checkOnStartup = (checkOnStartup == null) ? false : checkOnStartup;
    
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                 .getService(Components.interfaces.nsIPrefService)
                 .getBranch("extensions.lemurquerylog.");
    this._serverBaseURL=this.prefs.getCharPref("server");
                 
    if (this._needToRefreshSettings==true || (forceReload && forceReload==true)) {
    
      if (this.loadServerConfiguration(checkOnStartup)==true) {
        // save user prefs
        this.saveLocalUserConfiguration();
      }
    }
  },
  
  prefPwd: function() {
    var pString=lemurlog_GetUniqueStringFromProfilePath(false);
    pString+="_eSa1T";
    return pString;
  },
  
  getEncryptedCharPref: function(prefName) {
    var encValue=this.prefs.getCharPref(prefName);
    return (lemurlogtoolbar_AESDecryptCtr(encValue, this.prefPwd(), 192));
  },
  
  setEncryptedCharPref: function(prefName, prefValue) {
    var encValue=lemurlogtoolbar_AESEncryptCtr(lemurlogtoolbar_trimString(prefValue), this.prefPwd(), 192);
    this.prefs.setCharPref(prefName, encValue);
  },
  
  loadLocalUserConfiguration: function() {
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                 .getService(Components.interfaces.nsIPrefService)
                 .getBranch("extensions.lemurquerylog.");
    
    this._serverBaseURL= lemurlogtoolbar_trimString( this.prefs.getCharPref("server") );
    this._useRandomSessionId=this.prefs.getBoolPref("userandomsession");
    this._useDesktopSearch=this.prefs.getBoolPref("logdesktopsearch");
    
    this._useAutomaticUploads=this.prefs.getBoolPref("useautouploads");
    this._askWhenUsingAutoUploads=this.prefs.getBoolPref("askwhenautouploads");
    var thisNextUploadTime=this.prefs.getCharPref("nextautouploadtime");
    if (thisNextUploadTime=="undefined") {
      thisNextUploadTime=0;
    }
    var thisNextUploadTimeLong=(+thisNextUploadTime);

    if (thisNextUploadTimeLong==0) {
      var todaysDate = new Date; // Generic JS date object
      var unixtime_ms = todaysDate.getTime(); // Returns milliseconds since the epoch
      this._nextTimeToAutoUpload=unixtime_ms + this._autoUploadIntervalTime;
      // and set it in the prefs
      this.prefs.setCharPref("nextautouploadtime", new String(this._nextTimeToAutoUpload));
    } else {
      this._nextTimeToAutoUpload=thisNextUploadTimeLong;
    }

    this._useBlacklistPersonal=this.prefs.getBoolPref("usepersonalbl");
    this._useBlacklistAddress=this.prefs.getBoolPref("useaddressbl");
    this._useBlacklistProperName=this.prefs.getBoolPref("usepropernamebl");
    this._useBlacklistKeywords=this.prefs.getBoolPref("usekeywordbl");

    this._serverEncryptionModulus=this.prefs.getCharPref("encmodulus");
    this._serverEncryptionExponent=this.prefs.getCharPref("encexponent");
    
    this._blacklistPersonalItems=this.getEncryptedCharPref("bl.personal");
    this._blacklistAddressItems=this.getEncryptedCharPref("bl.address");
    this._blacklistPropernameItems=this.getEncryptedCharPref("bl.propername");
    this._blacklistKeywordItems=this.getEncryptedCharPref("bl.keyword");
    
    this._blacklistPersonalRegex=this.getEncryptedCharPref("bl.personalrx");
    this._blacklistAddressRegex=this.getEncryptedCharPref("bl.addressrx");
    this._blacklistPropernameRegex=this.getEncryptedCharPref("bl.propernamerx");
    this._blacklistKeywordRegex=this.getEncryptedCharPref("bl.keywordrx");
    
    this._knownSearchEngines=lemurlogtoolbar_trimString(this.prefs.getCharPref("searchengines"));
  },

  saveLocalUserConfiguration: function () {
    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
                 .getService(Components.interfaces.nsIPrefService)
                 .getBranch("extensions.lemurquerylog.");
                 
    this.prefs.setCharPref("server", lemurlogtoolbar_trimString(this._serverBaseURL));
    this.prefs.setBoolPref("userandomsession", this._useRandomSessionId);
    this.prefs.setBoolPref("logdesktopsearch", this._useDesktopSearch);

    this.prefs.setBoolPref("useautouploads", this._useAutomaticUploads);
    this.prefs.setBoolPref("askwhenautouploads", this._askWhenUsingAutoUploads);
    this.prefs.setCharPref("nextautouploadtime", new String(this._nextTimeToAutoUpload));

    this.prefs.setBoolPref("usepersonalbl", this._useBlacklistPersonal);
    this.prefs.setBoolPref("useaddressbl", this._useBlacklistAddress);
    this.prefs.setBoolPref("usepropernamebl", this._useBlacklistProperName);
    this.prefs.setBoolPref("usekeywordbl", this._useBlacklistKeywords);
    this.prefs.setCharPref("encmodulus", this._serverEncryptionModulus);
    this.prefs.setCharPref("encexponent", this._serverEncryptionExponent);

    this.setEncryptedCharPref("bl.personal", this._blacklistPersonalItems);
    this.setEncryptedCharPref("bl.address", this._blacklistAddressItems);
    this.setEncryptedCharPref("bl.propername", this._blacklistPropernameItems);
    this.setEncryptedCharPref("bl.keyword", this._blacklistKeywordItems);

    this.setEncryptedCharPref("bl.personalrx", this._blacklistPersonalRegex);
    this.setEncryptedCharPref("bl.addressrx", this._blacklistAddressRegex);
    this.setEncryptedCharPref("bl.propernamerx", this._blacklistPropernameRegex);
    this.setEncryptedCharPref("bl.keywordrx", this._blacklistKeywordRegex);
    
    this.prefs.setCharPref("searchengines", this._knownSearchEngines);
  },
  
  getSearchEnginePrefixArray: function() {
    var thisArray=new Array();
    var items=this._knownSearchEngines.split("\n");
    for (var i=0; i < items.length; i++) {
      if (items[i].length > 0) {
        thisArray[i]=items[i];
      }
    }
    return thisArray;
  },
  
  isTimeToAutomaticUpload: function () {
    if (this._serverAllowAutoUploads && this._useAutomaticUploads) {
      var currentTime=new Date;
      var currentTimeMs=currentTime.getTime();
      if (currentTimeMs > this._nextTimeToAutoUpload) {
        return true;
      }
    }
    return false;
  },
  
  setNextAutomaticUploadTime: function () {
    var currentTime=new Date;
    var currentTimeMs=currentTime.getTime();
    this._nextTimeToAutoUpload=currentTimeMs + this._autoUploadIntervalTime;
    this.saveLocalUserConfiguration();
  },
  
  getNextAutoUploadTimeString: function () {
    var nextUploadTimeSec=new Date(this._nextTimeToAutoUpload);
    return nextUploadTimeSec.toString();
  },

  loadServerConfiguration: function (checkOnStartup) {
  
    var checkOnStartup = (checkOnStartup == null) ? false : checkOnStartup;

    if (this._serverBaseURL.length==0) {
      return false;
    }
    
    var xmlRequest=new XMLHttpRequest();
    var configUrl=this._serverBaseURL + "/GetConfiguration";

    try {
      xmlRequest.open("GET", configUrl, false);
      xmlRequest.send(null);
    } catch (e) {
      if (!checkOnStartup) {
        alert("Lemur Query Log Toolbar:\nError retrieving configuration from server.\n Is the server URL set properly?");
      }
      return false;
    }
    
    if (xmlRequest.status!=200) {
      if (!checkOnStartup) {
        alert("Lemur Query Log Toolbar:\nError retrieving configuration from server.\n Is the server URL set properly?");
      }
      return false;
    }

    var xmlDoc=xmlRequest.responseXML.documentElement;

    var cryptoElement=xmlDoc.getElementsByTagName("publickey");
    if (!cryptoElement || cryptoElement.length != 1) {
      alert("Invalid configuration - could not retrieve public key information");
      return false;
    }

    var modulus=cryptoElement[0].getElementsByTagName("modulus");
    var exponent=cryptoElement[0].getElementsByTagName("exponent");
    if ((modulus.length!=1) || (exponent.length!=1)) {
      alert("Invalid configuration - could not retrieve public key malformed");
      return false;
    }

    this._serverEncryptionModulus=modulus[0].firstChild.nodeValue;
    this._serverEncryptionExponent=exponent[0].firstChild.nodeValue;
    
    var autouploadsElement=xmlDoc.getElementsByTagName("automaticuploads");
    if (autouploadsElement && autouploadsElement.length > 0) {
      var allowsAutoUploadElement=autouploadsElement[0].getElementsByTagName("allowautouploads");
      var autoUploadsIntervalElement=autouploadsElement[0].getElementsByTagName("autouploadinterval");
      if (allowsAutoUploadElement && allowsAutoUploadElement.length==1) {
        var allowsAutoUploadValue=allowsAutoUploadElement[0].firstChild.nodeValue;
        if (allowsAutoUploadValue=='false') {
          this._serverAllowAutoUploads=false;
        } else {
          this._serverAllowAutoUploads=true;
        }
      }
      if (autoUploadsIntervalElement && autoUploadsIntervalElement.length==1) {
        var dayInterval=autoUploadsIntervalElement[0].firstChild.nodeValue;
        var dayIntervalNumber=new Number(dayInterval);
        if (dayIntervalNumber!=Number.NaN) {
          this._autoUploadIntervalTime=dayIntervalNumber*86400000;
        }
      }
    }

    var rndSessionElement=xmlDoc.getElementsByTagName("allowrandomsession");
    var allowPersonalBLElement=xmlDoc.getElementsByTagName("allowpersonalblacklist");
    var allowAddressBLElement=xmlDoc.getElementsByTagName("allowaddressblacklist");
    var allowProperNameBLElement=xmlDoc.getElementsByTagName("allowpropernameblacklist");
    var allowKeywordBLElement=xmlDoc.getElementsByTagName("allowkeywordblacklist");

    if (rndSessionElement && rndSessionElement.length>0) {
      var thisValue=rndSessionElement[0].firstChild.nodeValue;
      if (thisValue=='false') {
        this._allowRandomSessionId=false;
      } else {
        this._allowRandomSessionId=true;
      }
    }

    if (allowPersonalBLElement && allowPersonalBLElement.length>0) {
      var thisValue=allowPersonalBLElement[0].firstChild.nodeValue;
      if (thisValue=='false') {
        this._allowBlacklistPersonal=false;
      } else {
        this._allowBlacklistPersonal=true;
      }
    }

    if (allowAddressBLElement && allowAddressBLElement.length>0) {
      var thisValue=allowAddressBLElement[0].firstChild.nodeValue;
      if (thisValue=='false') {
        this._allowBlacklistAddress=false;
      } else {
        this._allowBlacklistAddress=true;
      }
    }

    if (allowProperNameBLElement && allowProperNameBLElement.length>0) {
      var thisValue=allowProperNameBLElement[0].firstChild.nodeValue;
      if (thisValue=='false') {
        this._allowBlacklistProperName=false;
      } else {
        this._allowBlacklistProperName=true;
      }
    }

    if (allowKeywordBLElement && allowKeywordBLElement.length>0) {
      var thisValue=allowKeywordBLElement[0].firstChild.nodeValue;
      if (thisValue=='false') {
        this._allowBlacklistKeywords=false;
      } else {
        this._allowBlacklistKeywords=true;
      }
    }
    
    // get the known search engines if available
    var currentSEArray=Array();
    currentSEArray=this.arrayFromString(this._knownSearchEngines);
    
    var seElement=xmlDoc.getElementsByTagName("searchengines");
    if (seElement.length > 0) {
      var engineElements=seElement[0].getElementsByTagName("engine");
      for (var e=0; e < engineElements.length; e++) {
        var thisEngineValue=engineElements[e].firstChild.nodeValue;
        if (thisEngineValue.indexOf("http://127.0.0.1") >= 0) {
          continue; 
        } else {
          var foundSE=false;
          for (var sea=0; sea < currentSEArray.length; sea++) {
            if (currentSEArray[sea]==thisEngineValue) {
              foundSE=true;
              break;
            }
          }
          if (!foundSE) {
            currentSEArray.splice(currentSEArray.length, 0, thisEngineValue);
          }
        }
      }
    }
    
    this._knownSearchEngines=this.arrayToString(currentSEArray);
    

    this._needToRefreshSettings=false;
    return true;
  }
};


// UMass logging only to ensure the registry accepts it as a change
// and not the default value...
// try {
//   var prefs = Components.classes["@mozilla.org/preferences-service;1"]
//                 .getService(Components.interfaces.nsIPrefService)
//                 .getBranch("extensions.lemurquerylog.");
//  prefs.setCharPref("server", lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL.trim());
// } catch (prefEx) {
//  // ignore any errors
// }

