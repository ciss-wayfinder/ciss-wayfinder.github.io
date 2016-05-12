var WayFinder = (function() {

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

/** This function returns the room name from an id **/
function getLocationName(id) {
   var data = {7360 : "Space 1", 7358 : "Space 2", 7359 : "Space 3"};
   var name = data[id];
   return data[id];
};

return {

  InitCurrentRoomStatus : function(token){

    var scrapeForRoomStatus = 600000; // 1 minute

    var nInterval1 = setInterval(start, scrapeForRoomStatus);

    start();
    function start() {
          var locationID = 2079;
          var numRooms = 3;
          var robin = new Robin(token);
          var done = false;
          var space1_image = "<img src='images/space1_arrow.png'/>";
          var space2_image = "<img src='images/space2_arrow.png'/>";
          var space3_image = "<img src='images/space3_arrow.png'/>";
          robin.api.locations.spaces.get(locationID).then(function (response) {
          var space = response.getData();
          for (i = 0; i < numRooms; i++) {
              var eventTimeDiv = '';
              var event = '';
              if(space[i].current_event) {  // check to see if space has anything on at the moment
                 if(space[i]['id'] === space[i].current_event['space_id']) {
                    event = space[i].current_event;
                    eventTimeDiv += "<h3>" + getTimeFromDate(event['started_at']) + " to " + getTimeFromDate(event['ended_at']) + "</h3>";
                  }
              } else if ((space[i].next_event) && (compareTimes(space[i].next_event['started_at']) !== "nodisplay")) {   // no current events so lets see what is the next event for this room
                 if(space[i]['id'] === space[i].next_event['space_id']) {
                     event = space[i].next_event;
                     eventTimeDiv += "<br /><h1> Now Available </h1><br /><h1>Until " + getTimeFromDate(event['started_at']) + "</h1>" +
                                     "<br /><br /><h3 style='color: #fff'>"+ getTimeFromDate(event['started_at'])+ " " + event['title'] + "</h3>";
                     event = false;
                 }
              } else {
                  event = false;
                  eventTimeDiv = "<br /><h1>Available</h1><br /><h1>All Day</h1>"; // no events on today
              }

              var room = "<div style='background-color: #eee'>";

              switch (i)
              {
                case 0:
                  room += "<h2>" + space1_image  + space[i]['name'] + "</h2></div>";
                  break;
                case 2:
                  room += "<h2>" + space2_image  + space[i]['name'] + "</h2></div>";
                  break;
                case 1:
                  room += "<h2>" + space[i]['name'] + space3_image  +  "</h2></div>";
                  break;
              }
              if (event)
              {
                var privacy = getPrivacy(event);
                room += "<div><h1>" + event['title'] + "</h1></div>" +
                        "<br /><h3>" + eventTimeDiv + "</h3>" +
                      //  "<div class='text-center' style='margin-left: 30px'>" + event['description'] + "</div>" +
                        "<h3 style='color: #fff'>" + privacy + "</h3>";
              } else {
                    room += eventTimeDiv;
              }

              var roomDiv = document.getElementById('room' + i);
              roomDiv.innerHTML = room;
          }
      })
    }
  },

  InitUpcomingEvents : function(token){

    var scrapeForUpcomingEvents = 300000; // 5 minutes
    var nInterval = setInterval(showUpComing, scrapeForUpcomingEvents);

    showUpComing();

    function showUpComing()  {
        var spaces = [
            {ID: "7360", Element: 'upcomingDiv'},
            {ID: "7358", Element: 'upcomingDiv1'},
            {ID: "7359", Element: 'upcomingDiv2'}
        ];
        //["7360", "7358", "7359"];
        for (var x = 0; x < spaces.length; x++) {
            upcoming_events(spaces[x].ID, spaces[x].Element);
        }
    };

    function upcoming_events(id, divElement) { // room 1

        $.get("https://api.robinpowered.com/v1.0/spaces/" + id + "/events/upcoming" + "?access_token=" + token , function(data){
          var i = 0;
          var events = data.data;
          var div = document.getElementById(divElement);
          div.innerHTML = " "; // clear any prev html
          var numEventsShow = (events.length > 3) ? 3 : events.length;
          for (i ; i < numEventsShow; i++)
          {
            if(compareTimes(events[i]['started_at']) !== "nodisplay") {
                var event = new Event(events[i]);
                var template = $.templates('#upcomingLayout');
                div.innerHTML += template.render(event);
            }
          }
          // Were there any events to show?
          if(div.innerHTML == ' ') {
              div.innerHTML = "<div style='font-size: 24px' class='col-sm-12 upcoming'>There are no events scheduled for the next 3 days</div>";
            }
       }); // end of ajax GET
    };

    function Event (event) {
        this.Title = event['title'];
        this.Status = compareTimes(event['started_at']);
        this.Started = getTimeFromDate(event['started_at']);
        this.Ended = getTimeFromDate(event['ended_at']);
        this.Who = getPrivacy(event);
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
