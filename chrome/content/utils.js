//To avoid confliction with other extensions, we put prefix "logtb_" on every global variables and functions
//constant variables
const lemurlog_DATA_DIR = "lemurlogtoolbar_data";
const lemurlog_LOG_FILE = "lemurlogtoolbar_log";
const lemurlog_PAGE_FILE = "lemurlogtoolbar_pages";
const lemurlog_TEMP_LOG_FILE = "lemurlogtoolbar_log_tmp";
const lemurlog_TEMP_PAGE_FILE = "lemurlogtoolbar_pages_tmp";
const lemurlog_LOCK_FILE = "lemurlogtoolbar_lock";

const lemurlog_UPLOAD_SUCCEED_STR="LOGTOOLBAR_UPLOAD_SUCCEED";

const lemurlog_MIN_INTERVAL = 500;//milliseconds

lemurlogtoolbar_LemurLogToolbarConfiguration.loadLocalUserConfiguration();
lemurlogtoolbar_LemurLogToolbarConfiguration.getDefaultServerConfiguration(true, true);

var lemurlogtoolbar_sanitizedSubstitution="##--##";

function lemurlogtoolbar_sanitizeString(inputString, sanitizeString) {
  var retVal=inputString;
  var stringPieces=sanitizeString.split("\n");
  for (var i=0; i < stringPieces.length; i++) {
    if (stringPieces[i].length > 0) {
      var r=new RegExp(stringPieces[i], "gi")
      retVal=retVal.replace(r, lemurlogtoolbar_sanitizedSubstitution);
    }
  }
  return retVal;
}

function lemurlogtoolbar_washAndRinse(inputString, isUrl) {
  if (isUrl==null) { isUrl=false; }
  var outputString=inputString;

  // if (isUrl) {
  //   outputString = outputString.replace(/\+/g, "%20");
  //   outputString=unescape(outputString);
  // }

  if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowBlacklistPersonal && lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistPersonal) {
    outputString=lemurlogtoolbar_sanitizeString(outputString, lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPersonalRegex);
  }
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowBlacklistAddress && lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistAddress) {
    outputString=lemurlogtoolbar_sanitizeString(outputString, lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistAddressRegex);
  }
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowBlacklistProperName && lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistProperName) {
    outputString=lemurlogtoolbar_sanitizeString(outputString, lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistPropernameRegex);
  }
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowBlacklistKeywords && lemurlogtoolbar_LemurLogToolbarConfiguration._useBlacklistKeywords) {
    outputString=lemurlogtoolbar_sanitizeString(outputString, lemurlogtoolbar_LemurLogToolbarConfiguration._blacklistKeywordRegex);
  }
  return outputString;
}

///////////////////////////////////////////////////////////////////////
// Print debug info to javascript console
///////////////////////////////////////////////////////////////////////
function lemurlog_PrintToConsole(text)
{
  var consoleService = Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
  consoleService.logStringMessage('LemurLogToolbar: ' + text);
}


///////////////////////////////////////////////////////////////////////
// check if it's a url of search engine 
///////////////////////////////////////////////////////////////////////
function lemurlog_IsSearchURL(url)
{
  // get the array of search engine prefixes from the configuration
  var sePrefixArray=lemurlogtoolbar_LemurLogToolbarConfiguration.getSearchEnginePrefixArray();
  
  for (var i=0; i < sePrefixArray.length; i++) {
    if (url.indexOf(sePrefixArray[i]) === 0) {
      return true;
    }
  }
  
  /*
  if (url.indexOf("http://www.google.com/search?") === 0
      ||url.indexOf("http://search.live.com/results.aspx?") === 0
      ||url.indexOf("http://search.msn.com/results.aspx?") === 0
      ||url.indexOf("http://search.yahoo.com/search?") === 0 ) {

      return true;
  }
  */
  
  // check for desktop search?
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._useDesktopSearch==true) {
    // check for Google desktop search
    if ((url.indexOf("http://127.0.0.1:")===0) && (url.indexOf("/search") > 0) ) {
      return true;
    }
  }
  
  return false;
}

///////////////////////////////////////////////////////////////////////
// check if it's a "recordable" url 
///////////////////////////////////////////////////////////////////////
function lemurlog_IsRecordableURL(url)
{
  var isHttp=url.indexOf("http://");
  var isHttps=url.indexOf("https://");

  lemurlogtoolbar_LemurLogToolbarConfiguration.loadLocalUserConfiguration();
  var isConfigServer=-1;
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL.length > 0) {
    isConfigServer=url.indexOf(lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL);
  }

  if ( ( (isHttp==0) || (isHttps==0) ) && (isConfigServer==-1) ) {
    return true;
  }
  
  // alert("In isRecordable - isHttp:" + isHttp + "\nisHttps:" + isHttps + "\nURL: " + url + "\nConfig: " + isConfigServer);

  return false;
}

///////////////////////////////////////////////////////////////////////
// Set buttons to enabled/disabled according to lemurlog_g_enalbe
///////////////////////////////////////////////////////////////////////
function lemurlog_SetButtons()
{
    /*
     * this isn't needed since no toolbar in this version.
    // turn toolbar red when recording (added by jason)
    var toolbar = document.getElementById("LogTB-Toolbar");
    var button = document.getElementById("LogTB-Record-Button");
    
    if (lemurlog_g_enable) {
        toolbar.className = "chromeclass-toolbar active";
        button.label = "Recording!";
    }
    else {
        toolbar.className = "chromeclass-toolbar inactive";
        button.label = "Record";
    }
    */
    
}


///////////////////////////////////////////////////////////////////////
// Move file in the log directory
///////////////////////////////////////////////////////////////////////
function lemurlog_CreateLogFile(filename)
{
  var file = lemurlog_GetLogFile(filename);
  if (!file) 
  {
    return;
  }
  if(file.exists())
  {
    return;
  }
  file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE , 0644);
  return;
}

///////////////////////////////////////////////////////////////////////
// Move file in the log directory
///////////////////////////////////////////////////////////////////////
function lemurlog_MoveLogFile(src_filename, des_filename)
{
  var file = lemurlog_GetLogFile(src_filename);
  var dir = lemurlog_GetLogDir();
  if (!file || !dir) 
  {
    return;
  }
  file.moveTo(dir, des_filename);
  return;
}

///////////////////////////////////////////////////////////////////////
// Remove file in the log directory
///////////////////////////////////////////////////////////////////////
function lemurlog_RemoveLogFile(filename)
{
  var file = lemurlog_GetLogFile(filename);
  if (!file) 
  {
    return;
  }
  if(!file.exists())
  {
    return;
  }
  file.remove(false);//non-recursive
  return;
}

function lemurlogtoolbar_isScrubbableLogLine(logLineType) {
  if (logLineType=="CtrlC") { return true; }
  if (logLineType=="LClick") { return true; }
  if (logLineType=="MClick") { return true; }
  if (logLineType=="RClick") { return true; }
  if (logLineType=="SelTab") { return true; }
  if (logLineType=="Focus") { return true; }
  if (logLineType=="Show") { return true; }
  if (logLineType=="LoadCap") { return true; }
  if (logLineType=="LoadBub") { return true; }
  
  return false;
}

///////////////////////////////////////////////////////////////////////
// scrubs the log files based on the blacklist filters
// also - if any blacklist term occurs in a known search query
// remove the search results for that item
///////////////////////////////////////////////////////////////////////
function lemurlog_scrubLogFiles(progressMeter, progressLabel) {
  if (progressMeter==null) { return; }

  // if we're locked - just return
  var lockfile = lemurlog_GetLogFile(lemurlog_LOCK_FILE);
  if(lockfile.exists())
  {
    return;
  }

  // first - lock the log
  lemurlog_CreateLogFile(lemurlog_LOCK_FILE);
  
  // create an array to hold our result IDs to filter
  var resultIdsToFilter=new Array();
  
  // get our temporary output log file
  lemurlog_CreateLogFile(lemurlog_TEMP_LOG_FILE);
  var outlogfile=lemurlog_GetLogFile(lemurlog_TEMP_LOG_FILE);
  if (!outlogfile.exists()) {
    return;
  }
  
  var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
  foStream.init(outlogfile, 0x02 | 0x08 | 0x10, 0600, 0);//append
  
  // next - roll through the log writing to the new temp
  // keeping track of search result IDs that need filtered
  // search IDs will be in the form of:
  //
  // LoadCap  <ID> <URL>
  // Search <ID> <SIZE>
  
  var logfile = lemurlog_GetLogFile(lemurlog_LOG_FILE);
  var logFileSize = lemurlog_GetLogFileSize(lemurlog_LOG_FILE);
  var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);  
  istream.init(logfile, 0x01, 0444, 0);
  istream.QueryInterface(Components.interfaces.nsILineInputStream);
  
  var lastLineWasScrubbed=false;
  var lastLineWasLoadCap=false;
  var lastKnownURL="";
  var readingLine={};
  var currentWorkingLine="";
  var hasMore;
  
  progressLabel.setAttribute("value", "Scrubbing activity log...");
  
  var charsRead=0;
  do {
    hasMore=istream.readLine(readingLine);
    if (readingLine.value!=null) {
      currentWorkingLine=readingLine.value;
      
      // set our progress meter
      charsRead+=currentWorkingLine.length;
      if (logFileSize > 0) {
        var pctSizeCurrent=Math.floor((charsRead / logFileSize)*100.0);
        progressMeter.setAttribute("value", "" + pctSizeCurrent);
      } else {
        progressMeter.setAttribute("value", "100");
      }
      
      // split the current working line by tabs
      var stringSplit=currentWorkingLine.split(/\t/);
      if (stringSplit.length < 2) {
        // just write out the line and move on
        currentWorkingLine+="\n";
        foStream.write(currentWorkingLine, currentWorkingLine.length);
        continue;
      } 
      
      // if the current item is a search...  
      if (stringSplit[0]=="Search") {
        // if last line was scrubbed and it was a loadcap event, _and_ it was a search...
        if ((lastLineWasScrubbed==true) && (lastLineWasLoadCap==true) && (lemurlog_IsSearchURL(lastKnownURL))) {
          // add this log ID to the list
          resultIdsToFilter.push(stringSplit[1]);
          
          // and don't add the search line to the new log...
          continue;
        }
      } // end if (stringSplit[0]=="Search") 

      // is it one of the types we need to check?
      if (lemurlogtoolbar_isScrubbableLogLine(stringSplit[0])) {
        // yes - we need to scrub it
        // if it's CtrlC, the text is the 4th item in the array
        // else, the URL is the 3rd
        lastLineWasScrubbed=false;
        lastLineWasLoadCap=false;
        lastKnownURL="";
        
        if (stringSplit[0]=="CtrlC") {
          stringSplit[3]=lemurlogtoolbar_washAndRinse(stringSplit[3], false);
          // was this line scrubbed? check for our delimiter
          if (stringSplit[3].indexOf(lemurlogtoolbar_sanitizedSubstitution) >= 0) {
            lastLineWasScrubbed=true;
          }
        } else {
          stringSplit[2]=lemurlogtoolbar_washAndRinse(stringSplit[2], true);
          
          // save the last URL
          lastKnownURL=stringSplit[2];
          
          // need to look for loadcap events - possible indication
          // of a search ID coming up
          if (stringSplit[0]=="LoadCap") {
            lastLineWasLoadCap=true;
          }

          // was this line scrubbed? check for our delimiter
          if (stringSplit[2].indexOf(lemurlogtoolbar_sanitizedSubstitution) >= 0) {
            lastLineWasScrubbed=true;
          }
        } // end if (stringSplit[0]=="CtrlC")
        
        // and recombine the line if we were scrubbed
        if (lastLineWasScrubbed) {
          var recomLine=stringSplit[0];
          for (var i=1; i < stringSplit.length; i++) {
            recomLine += "\t" + stringSplit[i];
          }
          currentWorkingLine=recomLine;
        }
      } // end if (lemurlogtoolbar_isScrubbableLogLine(stringSplit[0]))
      
      // write out the possibly scrubbed line
      currentWorkingLine+="\n";
      foStream.write(currentWorkingLine, currentWorkingLine.length);
    } // end if (readingLine.value!=null) {
  } while (hasMore); // end do
  
  foStream.close();
  istream.close();
  
  // set the progress meter to 100%
  progressMeter.setAttribute("value", "100");
  
  // remove the old log and rename the new one
  lemurlog_RemoveLogFile(lemurlog_LOG_FILE);
  lemurlog_MoveLogFile(lemurlog_TEMP_LOG_FILE, lemurlog_LOG_FILE);
  
  // roll through the search results log
  // create our temp page file
  lemurlog_CreateLogFile(lemurlog_TEMP_PAGE_FILE);
  var outpagefile=lemurlog_GetLogFile(lemurlog_TEMP_PAGE_FILE);
  if (!outpagefile.exists()) {
    return;
  }
  
  var pageoutStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
  pageoutStream.init(outpagefile, 0x02 | 0x08 | 0x10, 0600, 0);//append
  
  // now open our original page file
  var pagefile = lemurlog_GetLogFile(lemurlog_PAGE_FILE);
  var pageinstream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);  
  pageinstream.init(pagefile, 0x01, 0444, 0);
  pageinstream.QueryInterface(Components.interfaces.nsILineInputStream);  
  
  var pageFileSize = lemurlog_GetLogFileSize(lemurlog_PAGE_FILE);

  progressLabel.setAttribute("value", "Scrubbing search page log...");
  
  charsRead=0;
  var skipThisOne=false;
  var lastLineWasHeader=false;
  do {
    hasMore=pageinstream.readLine(readingLine);
    if (readingLine.value!=null) {
      if (skipThisOne==false) {
        currentWorkingLine=readingLine.value;
        
        charsRead+=currentWorkingLine.length;
        if (pageFileSize > 0) {
          var pctSizeCurrent=Math.floor((charsRead / pageFileSize)*100.0);
          progressMeter.setAttribute("value", "" + pctSizeCurrent);
        } else {
          progressMeter.setAttribute("value", "100");
        }
        
        if (lastLineWasHeader) {
          // should be our ID
          // ID=1194982335173
          var stringSplit=currentWorkingLine.split(/=/);
          if (stringSplit.length==2) {
            // does this ID appear in the ones we want to filter?
            for (var i=0; (i < resultIdsToFilter.length) && (skipThisOne==false); i++) {
              if (resultIdsToFilter[i]==stringSplit[1]) {
               // yes - it's filtered
               skipThisOne=true;
              }
            } // end for...
          } // end if (stringSplit.length==2)
          
          if (skipThisOne==false) {
            // no? Write out our header LOGTB\n + ID\n + the rest
            var headerLine="LOGTB_BEGIN_SEARCH_PAGE\n";
            pageoutStream.write(headerLine, headerLine.length);
            currentWorkingLine+="\n";
            pageoutStream.write(currentWorkingLine, currentWorkingLine.length);
          }

          lastLineWasHeader=false;
        } else if (currentWorkingLine.indexOf("LOGTB_BEGIN_SEARCH_PAGE") >= 0) {
          // look for our header: LOGTB_BEGIN_SEARCH_PAGE        
          // next line will be ID
          lastLineWasHeader=true;
        } else {
          // we're clear to write if we get here...
          currentWorkingLine+="\n";
          pageoutStream.write(currentWorkingLine, currentWorkingLine.length);
        }
      } else {
        // we're skipping - read
        // until the next header or EOF
        do {
          hasMore=pageinstream.readLine(readingLine);
          if (readingLine.value!=null) {
            currentWorkingLine=readingLine.value;
            charsRead+=currentWorkingLine.length;
            if (currentWorkingLine.indexOf("LOGTB_BEGIN_SEARCH_PAGE") >= 0) {
              lastLineWasHeader=true;
              break;
            }
          }
        } while (hasMore);
        
        // reset our skip flag
        skipThisOne=false;
      } // end if (skipThisOne==false)
    } // end if (readingLine.value!=null)
  } while (hasMore); // end do

  // set the progress meter to 100%
  progressMeter.setAttribute("value", "100");

  // we're done - close out output / input
  pageoutStream.close();
  pageinstream.close();
  
  // rename the new page file to the old
  lemurlog_RemoveLogFile(lemurlog_PAGE_FILE);
  lemurlog_MoveLogFile(lemurlog_TEMP_PAGE_FILE, lemurlog_PAGE_FILE);
  
  // unlock the log
  lemurlog_RemoveLogFile(lemurlog_LOCK_FILE);
} // end function lemurlog_scrubLogFiles()

///////////////////////////////////////////////////////////////////////
// Remove all leading and ending spaces,
// then replace repeated spaces into a single one
///////////////////////////////////////////////////////////////////////
function lemurlog_TrimString(str)
{
  var s = str.replace(/^\s+/,"");
  s = s.replace(/\s+$/,"");
  return s.replace(/\s+/g, " ");
}

///////////////////////////////////////////////////////////////////////////////
// Loads the specified URL in the browser.
////////////////////////////////////////////////////////////////////////////////
function lemurlog_LoadURL(url)
{
  // Set the browser window's location to the incoming URL
  window.content.document.location = url;

  // Make sure that we get the focus
  window.content.focus();
}

///////////////////////////////////////////////////////////////////////
// Get the size of a log file
// return: number
///////////////////////////////////////////////////////////////////////
function lemurlog_GetLogFileSize(fileName)
{
  var file = lemurlog_GetLogFile(fileName);
  if(!file.exists())
  {
    file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0644);
    return 0;
  }
  return file.fileSize;

}

///////////////////////////////////////////////////////////////////////
// Convert positive integer into human readable form
// e.g. 2000->2K, 2000000->2M, ...
// return: string
///////////////////////////////////////////////////////////////////////
function lemurlog_NumberToHumanReadable(n)
{
  if(n<1000)
  {
    return Math.floor(n)+" B";
  }
  else if(n<1000000)
  {
    return Math.floor(n/1000)+" KB";
  }
  else if(n<1000000000)
  {
    return Math.floor(n/1000000)+" MB";
  }
  else
  {
    return Math.floor(n/1000000000)+" GB";
  }

}

///////////////////////////////////////////////////////////////////////
// Get the nsIFile object of log data directory
///////////////////////////////////////////////////////////////////////
function lemurlog_GetLogDir()
{
  // Get profile directory.
  var dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
  if(!dirService)
  {
    return null;
  }
  var dir = dirService.get("ProfD", Components.interfaces.nsIFile);
  if(!dir)
  {
    return null;
  }
  dir.append(lemurlog_DATA_DIR);
  if (!dir.exists())
  {
    dir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0755);
  }
  return dir;
}
///////////////////////////////////////////////////////////////////////
// Get the nsIFile object of a log file
///////////////////////////////////////////////////////////////////////
function lemurlog_GetLogFile(fileName)
{
  var file = lemurlog_GetLogDir();
  if(!file)
  {
    return null;
  }
  file.append(fileName);
  return file;
}

///////////////////////////////////////////////////////////////////////
// Write text to a log file
///////////////////////////////////////////////////////////////////////
function lemurlog_WriteLogFile(fileName, text) 
{
  //avoid read/write confliction
  /*
  if(!lemurlog_g_enable)
  {
    return;
  }
  */
  //use a lock file instead of a global variable
  var lockfile = lemurlog_GetLogFile(lemurlog_LOCK_FILE);
  if(lockfile.exists())
  {
    return;
  }
  //write file
  var file = lemurlog_GetLogFile(fileName);
  if(!file)
  {
    return;
  }
  
  
  var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
  foStream.init(file, 0x02 | 0x08 | 0x10, 0600, 0);//append
  //foStream.write(text, text.length);
  // must use a conversion stream here to properly handle multi-byte character encodings
  var converterStream = Components.classes['@mozilla.org/intl/converter-output-stream;1'].createInstance(Components.interfaces.nsIConverterOutputStream);
  var charset = 'utf-8';
  converterStream.init(foStream, charset, text.length, Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
  converterStream.writeString(text);
  converterStream.close();
  foStream.close();
}

///////////////////////////////////////////////////////////////////////
// Extract the random unique string(8 characters) from the path of user profile(windows only)
///////////////////////////////////////////////////////////////////////
function lemurlog_GetUniqueStringFromProfilePath(forUpload)
{
  if (forUpload!=null && forUpload==true) {
    if (lemurlogtoolbar_LemurLogToolbarConfiguration._allowRandomSessionId && lemurlogtoolbar_LemurLogToolbarConfiguration._useRandomSessionId) {
      var rand_no = Math.floor(Math.random()*10000000+1);
      return "" + rand_no;
    }
  }
  // Get profile directory.
  var dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
  if(!dirService)
  {
    return null;
  }
  var prof_dir = dirService.get("ProfD", Components.interfaces.nsIFile);
  if(!prof_dir)
  {
    return null;
  }
  var unique_str = prof_dir.leafName.substring(0, 8);
  return unique_str;
}


