var WayFinder = (function() {

  var spaces = [
      {ID: "7360", Element: 'upcomingDiv', Loaded: false},  // room 1
      {ID: "7358", Element: 'upcomingDiv1', Loaded: false}, // room 2
      {ID: "7359", Element: 'upcomingDiv2', Loaded: false} // room 3
  ];

    /** This function takes a date as a string and returns the time and whether Am or Pm **/
function getTimeFromDate(dateStr, needSeconds) {
    var date = new Date(dateStr);
    var hours = date.getHours().toString();
    var amORpm = "am";
    var mins = date.getMinutes().toString();
    var secs = " ";
    // hours
    if (hours > 12){
      amORpm = "pm";
      hours -= 12;
    } else if(hours == 12) {
       amORpm = "pm";
    }

    if(hours == 0){
       hours = 12;
    }
    // minutes
    if (mins <= 9){
       mins = "0" + mins;
    }

    var str = "" + hours + ":" + mins;
    // seconds
    if(needSeconds) {
        var secs = date.getSeconds().toString();
        if(secs <= 9) {
            secs = "0" + secs;
        }
        str += "." + secs;
    }
    str += " " + amORpm;
    return str;
};

function compareTimes(dateStr) {
    var date = new Date(dateStr);
    var eventDay = date.getDay();
    var currDate = new Date();
    var currDay = currDate.getDay();
    if((eventDay > currDay) && (eventDay < currDay+3)) {
        return getDayOfWeek(dateStr);
    } else if (eventDay == currDay) {
        return "Today";
    }
    return "nodisplay";
};

function getRoomImage(roomID) {

  switch (roomID)
  {
    case 7360:
      var image =  "<div><h2><img src='images/space1_arrow.png'/>Room 1</h2></div></div>";
      return image;
      break;
    case 7358:
      var image = "<div><h2><img src='images/space2_arrow.png'/>Room 2</h2></div></div>";
      return image;
      break;
    case 7359:
      var image = "<div><h2><img src='images/space3_arrow.png'/>Room 3</h2></div></div>";
      return image;
      break;
  }
}

function isEventOn(event) {
     var end = new Date(event['ended_at']);
     var start = new Date(event['started_at']);
     var curr = new Date();
     if(start <= curr && end >= curr) {
         return true;
     }
     return false;
}

/** This function checks what the next event is **/
function hasNextEvent(space) {
    var event = '';
    if(space.current_event && space['name'] === space.current_event['location']) {
        event = space.current_event;
    } else if (space.next_event && space['name'] === space.next_event['location']){
        event = space.next_event;
    } else {
        event = "Available";
    }
    return event;
};

function getDayOfWeek(dateStr){
    var weekday = {0:"Sunday", 1:"Monday", 2:"Tuesday", 3:"Wednesday", 4:"Thursday", 5:"Friday", 6:"Saturday"};
    var date = new Date(dateStr);
    var numOfWeekday = date.getDay();
    return weekday[numOfWeekday];
};

/** This function returns privacy of the event in the room **/
function getPrivacy(event) {
   if (event['visibility'] == "private")
   {
      return "Private Function";
   } else {
      return "All Welcome";
   }
};

function IsRoomLoaded (roomID, spaces) {
  var space;
  var loaded;
  $.each(spaces, function (ind) {
      if(spaces[ind].ID == roomID) {
         space = spaces[ind];
      }
  })
  if((space)) {
    loaded = space.Loaded;
    space.Loaded = true;
  }
  return loaded;
}

function unloadRooms(spaces) {
  $.each(spaces, function (ind) {
      spaces[ind].Loaded = false;
  })
}

function LoadRoom (eventTimeDiv, event, eventOn) {
  var room = "<div style='background-color: #eee'>";
  var image = getRoomImage(event.Id);
  room += image;
  if (eventOn)
  {
    var privacy = getPrivacy(event);
    room += "<div><br /><h1>" + event.Title + "</h1></div>" +
            "<br />" + eventTimeDiv +
            "<h2 style='color: #fff'>" + privacy + "</h2>";
  } else {
      room += eventTimeDiv;
  }
  //var privacy = getPrivacy(event);
  return room;
}

/** This function returns the room name from an id **/
function getLocationName(id) {
   var data = {7360 : "Space 1", 7358 : "Space 2", 7359 : "Space 3"};
   var name = data[id];
   return data[id];
};

return {

  InitUpcomingEvents : function(token){

    var scrapeForUpcomingEvents = 30000; // 1 minute
    var nInterval = setInterval(showUpComing, scrapeForUpcomingEvents);

    showUpComing();

    function showUpComing()  {
        for (var x = 0; x < spaces.length; x++) {
            upcoming_events(spaces[x].ID, spaces[x].Element);
        }
    };

    function upcoming_events(id, divElement) {
        $.get("https://api.robinpowered.com/v1.0/spaces/" + id + "/events/upcoming" + "?access_token=" + token , function(data){
          var i = 0;
          var events = data.data;
          var div = document.getElementById(divElement);
          div.innerHTML = " "; // clear any prev html
          var numEventsShow = (events.length > 3) ? 3 : events.length;
          for (i; i < numEventsShow; i++)
          {
            var eventTimeDiv = " ";
            var currEvent = isEventOn(events[i]);
            if(!currEvent) {  // no event on at the moment in the room
              if((compareTimes(events[i]['started_at']) !== "nodisplay")) { // but there are upcoming events
                  var event = new Event(events[i]);
                  var template = $.templates('#upcomingLayout');
                  div.innerHTML += template.render(event);

                  if(!IsRoomLoaded(event.Id, spaces)) {
                      if (compareTimes(events[i]['started_at']) === "Today") {
                         eventTimeDiv = "<br /><h1> Now Available </h1><br /><h1>Until " + event.Started + "</h1>" +
                                        "<br /><br /><h3 style='color: #fff'>"+ event.Started + " " + event.Title + "</h3>";
                      }
                      else {
                         eventTimeDiv = "<br /><h1>Available</h1><br /><h1>All Day</h1>"; // no events on today
                      }

                      var content = LoadRoom(eventTimeDiv,event,false);
                      var roomDiv = document.getElementById('room' + event.Id);
                      roomDiv.innerHTML = content;
                  }
              }
              else { // no events today in room
                var event = new Event(events[i]);
                if(!IsRoomLoaded(event.Id, spaces)) {
                  eventTimeDiv = "<br /><h1>Available</h1><br /><h1>All Day</h1>"; // no events on today
                  if(!IsRoomLoaded(event.Id, spaces)) {
                      var content = LoadRoom(eventTimeDiv, event, false);
                      var roomDiv = document.getElementById('room' + event.Id);
                      roomDiv.innerHTML = content;
                  }
                }
              }
            } else {  // there is a current event in the room
                numEventsShow++;
                var event = new Event(events[i]);
                var eventTimeDiv = "<h3>" + event.Started + " to " + event.Ended + "</h3>";
                if(!IsRoomLoaded(event.Id, spaces)) {
                     var content = LoadRoom(eventTimeDiv, event, true)
                     var roomDiv = document.getElementById('room' + event.Id);
                     roomDiv.innerHTML = content;
                }
             }
          }
          // Were there any events to show?
          if(div.innerHTML == ' ') {
              div.innerHTML = "<div style='font-size: 24px' class='col-sm-12 upcoming'>There are no events scheduled for the next 3 days</div>";
          }
       }); // end of ajax GET
       unloadRooms(spaces);
    };

    function Event (event) {
        this.Title = event['title'];
        this.Status = compareTimes(event['started_at']);
        this.Started = getTimeFromDate(event['started_at']);
        this.Ended = getTimeFromDate(event['ended_at']);
        this.Who = getPrivacy(event);
        this.Id = event['space_id'];
    };

   },
   InitClock : function () {
       function showClock() {
          var clockDiv = document.getElementById('clock');
          var currDate = new Date();
          clockDiv.innerHTML = " ";
          clockDiv.innerHTML = "<div><h1>" + getTimeFromDate(currDate.toString(), true) + "</h1></div>";
       }
       var nInterval = setInterval(showClock, 1000);
       showClock();
   }
}
})();
