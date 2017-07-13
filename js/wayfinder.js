var WayFinder = (function() {

//   var spaces = [
//       {ID: "7358", Element: "#upcomingDiv2"}, // room 2
//       {ID: "7360", Element: "#upcomingDiv1"}, // room 1
//       {ID: "7359", Element: "#upcomingDiv3"}  // room 3
//   ]; 

  var ApiKey = "AIzaSyAbAIMFWBtVBUAAeF17VV_n8nD2nfj0Q4s";
  var LastFetched = new Date();

  var rooms = [
      {Room: 1, Title: "Room 1", ID: "mycommunitydirectory.com.au_70jk7vcroldgaprgtoeg98b4q4%40group.calendar.google.com", Events: []},
      {Room: 2, Title: "Room 2", ID: "mycommunitydirectory.com.au_lg7205iba886dam5h6htpuv970@group.calendar.google.com", Events: []},
      {Room: 3, Title: "Room 3", ID: "mycommunitydirectory.com.au_aad3272ff4i2kj2aqc8a5fuk64@group.calendar.google.com", Events: []}
  ];


    /** This function takes a date as a string and returns the time and whether Am or Pm **/
    function getTimeFromDate(date, showSeconds) {

        var hours = date.getHours();
        var amORpm = "am";
        var mins = date.getMinutes();

        // hours
        if (hours >= 12) {
            amORpm = "pm";
            hours -= 12;
        }
        if (hours === 0) hours = 12;
        
        // minutes
        if (mins <= 9) mins = "0" + mins;

        var str = hours + ":" + mins;

        if (showSeconds) {
            var secs = date.getSeconds();
            if (secs <= 9) secs = "0" + secs;        
            str += "." + secs;
        }
        
        return str + " " + amORpm;
    };

    function getDayOfWeek(date){
        var weekday = {0:"Sunday", 1:"Monday", 2:"Tuesday", 3:"Wednesday", 4:"Thursday", 5:"Friday", 6:"Saturday"};
        var numOfWeekday = date.getDay();
        return weekday[numOfWeekday];
    };

    function loadEvents()  {
        for (var x = 0; x < rooms.length; x++) {
            getRoomEvents(rooms[x]);
        }
    };

    function getRoomEvents(room) {
        var startDate = new Date();
        startDate.setHours(0,0,0,0);
        var startTime = encodeURIComponent(startDate.toISOString());
        $(".error-row").html('Fetching events for ' + room.Title + ' at ' + getTimeFromDate(new Date(), true) + ' ...');

        if (!navigator.onLine) {
            $(".error-row").html('WayFinder is currently OFFLINE. Current events are not being displayed. (Last fetched: ' + getDayOfWeek(LastFetched) + ' at ' + getTimeFromDate(LastFetched, true) + ').');
            return;
        }

        $.ajax({
            url: "https://www.googleapis.com/calendar/v3/calendars/" + room.ID + "/events?" + 
            "maxResults=4" + 
            "&orderBy=startTime" + 
            "&singleEvents=true" + 
            "&timeMin=" + startTime +
            "&key=" + ApiKey
        })
        .done(function(data) {
            room.Events = data.items;
            showRoomEvents(room);
            $(".error-row").html('');
            LastFetched = new Date();
        })
        .fail(function(xhr, status, error) {
            var err = $(".error-row").html();
            $(".error-row").html(err + "<br />Failed to get the details of the upcoming events for " + room.Title + ". Failure: " + xhr.statusText + " (" + xhr.status + "), ReadyState: " + xhr.readyState + ", ResponseText: " + xhr.responseText);
        })
        .error(function(xhr, status, error) {
            var err = $(".error-row").html();
            $(".error-row").html(err + "<br />Could not get the details of the upcoming events for " + room.Title + ". Status: " + xhr.statusText + " (" + xhr.status + "), ReadyState: " + xhr.readyState + ", ResponseText: " + xhr.responseText);
        });
    }

    function showEvents()  {
        for (var x = 0; x < rooms.length; x++) {
            showRoomEvents(rooms[x]);
        }
    };

    function showRoomEvents(room) {
        var $upcomingDiv = $("#upcomingDiv" + room.Room);
        var $roomDiv = $("#room" + room.Room);
        var roomLoaded = false;
        var upcomingEvents = [];

        $upcomingDiv.html(""); 
        $roomDiv.html("<h1>Available</h1><h1>All Day</h1>");
            
        for (var i = 0; i < room.Events.length; i++) {

            var event = new Event(room.Events[i]);            
            
            if (event.IsOnNow) {  // there is a current event in the room
                if (!roomLoaded) {
                    $roomDiv.html(
                        "<h1>" + event.Title + "</h1>" +
                        "<h3>" + event.StartTime + " to " + event.EndTime + "</h3>" +
                        "<h2 style='color: #fff'>" + event.Who + "</h2>"
                    );
                    roomLoaded = true;
                }
            } else {  // no event on at the moment in the room

                if (event.IsOnToday) {
                    if (event.EndDate < event.TodayDate) {
                        // Don't show event finished today already
                        continue;
                    }
                    if (!roomLoaded) {
                        $roomDiv.html(
                            "<h1> Now Available </h1>" +
                            "<h1>Until " + event.StartTime + "</h1>" +
                            "<h3 style='color: #fff'>"+ event.StartTime + " " + event.Title + "</h3>"
                        );
                        roomLoaded = true;
                    }
                }

                upcomingEvents.push(event);
            }
        }
            
        // Were there any events to show?
        if(upcomingEvents.length === 0) {
            $upcomingDiv.html("<div class='col-sm-12 upcoming text-center'>There are no events scheduled for the next 3 days</div>");
        }
        else {
            upcomingEvents = upcomingEvents.slice(0, 3);
            var template = $.templates('#upcomingLayout');
            $upcomingDiv.html(template.render(upcomingEvents));
        }
    };

    function showClock() {
         $("#clock").html("<h1>" + getTimeFromDate(new Date(), true) + "</h1>");
    }

    var pages = [
        {Selector: "#upcoming", DisplayTime: 60 }, 
        {Selector: "#ciss-page", DisplayTime: 20 }, 
        {Selector: "#mcd-page", DisplayTime: 20 }, 
        {Selector: "#upcoming", DisplayTime: 30 }, 
        {Selector: "#diary-page", DisplayTime: 20 }, 
        {Selector: "#hart-page", DisplayTime: 30 }];

    var nextPageNo = 10000;
    var currentPage;
    var counter = 0;
    var progressInterval;

    function showPage() {
        if (currentPage) clearInterval(currentPage.Interval);

        var oldPage = currentPage;
        if (++nextPageNo >= pages.length) nextPageNo = 0;
        currentPage = pages[nextPageNo];

        if (oldPage)
        {
            $(oldPage.Selector).slideToggle("slow", function() {
                $(currentPage.Selector).slideToggle("slow");
            });
        }
        else {
            $(currentPage.Selector).slideToggle("slow");
        }

        setTimeout(showPage, currentPage.DisplayTime * 1000);
        currentPage.Counter = 0;
        currentPage.Interval = setInterval(showProgress, 100);
    }

    function showProgress() {
        currentPage.Counter += 100;
        var width = currentPage.Counter / (currentPage.DisplayTime * 1000) * 100;
        if (width > 100) width = 100;
        $("#progress .bar").width(width + "%");
        //console.log("counter: " + counter + ", currentTimeout: " + currentTimeout + ", width: " + width);
    }

    function Event (event) {
        this.Title = event.summary || "Private Function";
        this.StartDate = new Date(event.start.dateTime);
        this.StartTime = getTimeFromDate(this.StartDate);
        this.EndDate = new Date(event.end.dateTime);
        this.EndTime = getTimeFromDate(this.EndDate);
        this.TodayDate = new Date();
        this.IsOnToday = (this.StartDate.getDate() == this.TodayDate.getDate());
        this.DayOfWeek = this.IsOnToday ? "Today" : getDayOfWeek(this.StartDate);
        this.IsOnNow = (this.StartDate <= this.TodayDate && this.TodayDate <= this.EndDate);
        this.Visibility
        this.Who = "All Welcome";

        if (!event.visibility || event.visibility !== "private") {
            if (event.description) {
                if (event.description.includes("PRIVATE")) {
                    this.Who = "Private Function";
                }
                else if (event.description.includes("INVITATION")) {
                    this.Who = "By Invitation";
                }
            }
        }
        var future = new Date();
        future.setDate(this.TodayDate.getDate() + 7);
        if (this.StartDate >= future) {
            this.DayOfWeek = this.DayOfWeek.substr(0, 3) + " " + this.StartDate.getDate();
            switch (this.StartDate.getDate()) {
                case 1, 21, 31:
                    this.DayOfWeek += "st";
                    break;
                case 2, 22:
                    this.DayOfWeek += "nd";
                    break;
                case 3, 23:
                    this.DayOfWeek += "rd";
                    break;
                default:
                    this.DayOfWeek += "th";
                    break;
            }
        }

    };

return {

    InitUpcomingEvents: function(token){
        loadEvents();
        setInterval(loadEvents, 600000); // every 10 minutes check Google for events
        setInterval(showEvents, 60000); // every minute redisplay events
        window.addEventListener('online',  loadEvents);
        window.addEventListener('offline', function() {
            $(".error-row").html('WayFinder is currently OFFLINE. Current events are not being displayed. (Last fetched: ' + getDayOfWeek(LastFetched) + ' at ' + getTimeFromDate(LastFetched, true) + ').');
        });
    },
   
    InitClock: function () {
       showClock();
       setInterval(showClock, 1000);
    },

    InitAds: function() {
        $(".page").hide();
        showPage();
    }
}
})();
