// Google App Script code, which generates and events in the next free slot in the calendar
// I run it by passing a GET parameter to it like:
// https://script.google.com/macros/s/{replace with you Project ID}/exec?title=event%20title


function doGet(e) {
  var title = e.parameter.title;
  if (title) {
    var docurl = createEventwithDoc(title);
    return HtmlService.createHtmlOutput('Event created: <a href="' + docurl + '">' + title + '</a>');
  } else {
    return HtmlService.createHtmlOutput('<form><input name="title" placeholder="Enter event title" /><input type="submit" value="Create event" /></form>');
  }
}

function testCreateEventwithDoc() {
createEventwithDoc("test script"); 


}


function createEvent(title) {
  var calendar = CalendarApp.getDefaultCalendar();
  var duration = 35; // duration of the event in minutes
  var now = new Date();
  var freeBusy = Calendar.Freebusy.query({
    timeMin: now.toISOString(),
    timeMax: new Date(now.getTime() + 1000*60*60*24).toISOString(),
    timeZone: calendar.getTimeZone(),
    items: [{id: 'primary'}]
  });
  var busyPeriods = freeBusy.calendars.primary.busy;

  var start;
  for (var i = 0; i < busyPeriods.length; i++) {
    var busyStart = new Date(busyPeriods[i].start);
    var busyEnd = new Date(busyPeriods[i].end);
    if (i === 0 && now < busyStart) { // check if there's free time between now and the first busy period
      var diff = (busyStart.getTime() - now.getTime()) / (1000*60); // in minutes
      if (diff >= duration) {
        start = now;
        break;
      }
    }
    if (i < busyPeriods.length - 1) { // check if there's free time between two busy periods
      var nextBusyStart = new Date(busyPeriods[i+1].start);
      var diff = (nextBusyStart.getTime() - busyEnd.getTime()) / (1000*60); // in minutes
      if (diff >= duration) {
        start = new Date(busyEnd.getTime() + 1000*60*5); // add a 5-minute buffer
        break;
      }
    } else { // check if there's free time after the last busy period
      var diff = (now.getTime() + 1000*60*60*24 - busyEnd.getTime()) / (1000*60); // in minutes
      if (diff >= duration) {
        start = new Date(busyEnd.getTime() + 1000*60*5); // add a 5-minute buffer
        break;
      }
    }
  }

  var end = new Date(start.getTime() + 1000*60*duration);
  var conflicts = calendar.getEvents(start, end);
  while (conflicts.length > 0) { // there is a conflict with an existing event
    start = new Date(conflicts[conflicts.length-1].getEndTime().getTime() + 1000*60*5); // schedule the event 5 minutes after the last conflicting event ends
    end = new Date(start.getTime() + 1000*60*duration);
    conflicts = calendar.getEvents(start, end);
  }

  var event = calendar.createEvent(title, start, end);
  Logger.log('Event created: ' + event.getTitle() + ' (' + event.getStartTime() + ' - ' + event.getEndTime() + ')');
}


function createEventwithDoc(title) {
  var calendar = CalendarApp.getDefaultCalendar();
  var duration = 35; // duration of the event in minutes
  var now = new Date();
  var freeBusy = Calendar.Freebusy.query({
    timeMin: now.toISOString(),
    timeMax: new Date(now.getTime() + 1000*60*60*24).toISOString(),
    timeZone: calendar.getTimeZone(),
    items: [{id: 'primary'}]
  });
  var busyPeriods = freeBusy.calendars.primary.busy;
// create a variable called start as a Date object with default value of now.
var start = new Date();
//  var start = new Date();
  for (var i = 0; i < busyPeriods.length; i++) {
    var busyStart = new Date(busyPeriods[i].start);
    var busyEnd = new Date(busyPeriods[i].end);
    if (i === 0 && now < busyStart) { // check if there's free time between now and the first busy period
      var diff = (busyStart.getTime() - now.getTime()) / (1000*60); // in minutes
      if (diff >= duration) {
        start = now;
        break;
      }
    }
    if (i < busyPeriods.length - 1) { // check if there's free time between two busy periods
      var nextBusyStart = new Date(busyPeriods[i+1].start);
      var diff = (nextBusyStart.getTime() - busyEnd.getTime()) / (1000*60); // in minutes
      if (diff >= duration) {
        start = new Date(busyEnd.getTime() + 1000*60*5); // add a 5-minute buffer
        break;
      }
    } else { // check if there's free time after the last busy period
      var diff = (now.getTime() + 1000*60*60*24 - busyEnd.getTime()) / (1000*60); // in minutes
      if (diff >= duration) {
        start = new Date(busyEnd.getTime() + 1000*60*5); // add a 5-minute buffer
        break;
      }
    }
  }

  var end = new Date(start.getTime() + 1000*60*duration);
  var conflicts = calendar.getEvents(start, end);
  while (conflicts.length > 0) { // there is a conflict with an existing event
    start = new Date(conflicts[conflicts.length-1].getEndTime().getTime() + 1000*60*5); // schedule the event 5 minutes after the last conflicting event ends
    end = new Date(start.getTime() + 1000*60*duration);
    conflicts = calendar.getEvents(start, end);
  }

  var event = calendar.createEvent(title, start, end);
  Logger.log('Event created: ' + event.getTitle() + ' (' + event.getStartTime() + ' - ' + event.getEndTime() + ')');


    var now = new Date();
  var year = now.getFullYear().toString();
  var month = (now.getMonth() + 1).toString().padStart(2, '0');
  var day = now.getDate().toString().padStart(2, '0');
  var dateString = year + '-' + month + '-' + day;
  
  var rootFolder = DriveApp.getRootFolder();
  var yearFolderIterator = rootFolder.getFoldersByName(year);
  var yearFolder;
  
  if (yearFolderIterator.hasNext()) {
    yearFolder = yearFolderIterator.next();
  } else {
    yearFolder = rootFolder.createFolder(year);
  }
  
  var dateFolderIterator = yearFolder.getFoldersByName(dateString);
  var dateFolder;
  
  if (dateFolderIterator.hasNext()) {
    dateFolder = dateFolderIterator.next();
  } else {
    dateFolder = yearFolder.createFolder(dateString);
  }
  
  var existingFile = dateFolder.getFilesByName(title);
  if (existingFile.hasNext()) {
    var doc = DocumentApp.openById(existingFile.next().getId());
  } else {
    var doc = DocumentApp.create(title);
    var file = DriveApp.getFileById(doc.getId());
    dateFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }
  
  return doc.getUrl();

}


function createDoc(title) {
  var now = new Date();
  var year = now.getFullYear().toString();
  var month = (now.getMonth() + 1).toString().padStart(2, '0');
  var day = now.getDate().toString().padStart(2, '0');
  var dateString = year + '-' + month + '-' + day;
  
  var rootFolder = DriveApp.getRootFolder();
  var yearFolderIterator = rootFolder.getFoldersByName(year);
  var yearFolder;
  
  if (yearFolderIterator.hasNext()) {
    yearFolder = yearFolderIterator.next();
  } else {
    yearFolder = rootFolder.createFolder(year);
  }
  
  var dateFolderIterator = yearFolder.getFoldersByName(dateString);
  var dateFolder;
  
  if (dateFolderIterator.hasNext()) {
    dateFolder = dateFolderIterator.next();
  } else {
    dateFolder = yearFolder.createFolder(dateString);
  }
  
  var existingFile = dateFolder.getFilesByName(title);
  if (existingFile.hasNext()) {
    var doc = DocumentApp.openById(existingFile.next().getId());
  } else {
    var doc = DocumentApp.create(title);
    var file = DriveApp.getFileById(doc.getId());
    dateFolder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }
  
  return doc.getUrl();
}

