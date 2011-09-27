var lemurlog_MainWin;

function lemurlog_up_onLoad()
{
  lemurlog_MainWin = window.arguments[0];
  lemurlog_MainWin.lemurlog_UploadWin = window;

  //disable OK button
  var btn = document.documentElement.getButton("accept");
  btn.collapsed = true;

  lemurlogtoolbar_LemurLogToolbarConfiguration.loadLocalUserConfiguration();

  var log_file_size = lemurlog_GetLogFileSize(lemurlog_LOG_FILE);
  var page_file_size = lemurlog_GetLogFileSize(lemurlog_PAGE_FILE);

  var log_str ="Activity log: "+lemurlog_NumberToHumanReadable(log_file_size);
  var page_str ="Search log: "+lemurlog_NumberToHumanReadable(page_file_size);


  // ensure we have a server setup!
  if (lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL.length==0) {
    lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL=window.prompt("No server address is defined\nPlease enter one\n(or leave blank for none):");
  }
  
  var baseURL=lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL;
  if (baseURL==null || baseURL.length==0) {
    lemurlog_up_onCancel();
    window.close();
    return;
  } else {
    lemurlogtoolbar_LemurLogToolbarConfiguration.saveLocalUserConfiguration();
  }

  // Add labels
  var item;

  item = document.getElementById("LogTB-Up-Desc0");
  item.setAttribute("value", "Uploading log files to " + lemurlogtoolbar_LemurLogToolbarConfiguration._serverBaseURL + ":");

  item = document.getElementById("LogTB-Up-Desc1");
  item.setAttribute("value", log_str);

  item = document.getElementById("LogTB-Up-Desc2");
  item.setAttribute("value", page_str);
  
  // before uploading - scrub the files
  item = document.getElementById("LogTB-Up-Result");
  item.setAttribute("value", "Scrubbing log files before upload");
  
  var scrubbingWindow=window.openDialog("chrome://lemurlogtoolbar/content/scrubbingscreen.xul", "LogTB-Scrubbing", "chrome=yes,modal=no,centerscreen=yes,status=no,height=120,width=320");
  
  var progressMeterLabel=scrubbingWindow.document.getElementById("lblScrubbing");
  var progressMeterItem=scrubbingWindow.document.getElementById("pbrScrubbingProgress");
  scrubbingWindow.focus();
  lemurlog_scrubLogFiles(progressMeterItem, progressMeterLabel);
  scrubbingWindow.close();
  
  item.setAttribute("value", "Uploading...");

  //upload the first file
  // var cgi_url = "http://"+lemurlog_UPLOAD_HOST+lemurlog_UPLOAD_CGI;
  
  var cgi_url=baseURL + "/Upload";
  lemurlog_MainWin.lemurlog_upload_service._hasScrubbedLogs=false;
  lemurlog_MainWin.lemurlog_upload_service.cgi_url = cgi_url;
  lemurlog_MainWin.lemurlog_upload_service.timestamp = new Date().getTime();
  lemurlog_MainWin.lemurlog_upload_service.cur_file = lemurlog_LOG_FILE;
  lemurlog_MainWin.lemurlog_upload_service._userId=lemurlog_GetUniqueStringFromProfilePath(true);
  lemurlog_MainWin.lemurlog_upload_service.upload(progressMeterItem, item);
}

function lemurlog_up_onAccept()
{
  return true;
}


function lemurlog_up_onCancel()
{
  if(!lemurlog_MainWin.lemurlog_upload_service)
  {
    return true;
  }
  lemurlog_MainWin.lemurlog_upload_service.cancelUpload();
  return true;
}

