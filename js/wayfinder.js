var WayFinder = (function() {

  var spaces = [
      {ID: "7360", Element: "#upcomingDiv1"}, // room 1
      {ID: "7358", Element: "#upcomingDiv2"}, // room 2
      {ID: "7359", Element: "#upcomingDiv3"}  // room 3
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

    /** This function returns privacy of the event in the room **/
    function showUpComing()  {
        for (var x = 0; x < spaces.length; x++) {
            getEvents(spaces[x].ID, spaces[x].Element);
        }        
    };

    function getEvents(id, divElement) {
        $.get("https://api.robinpowered.com/v1.0/spaces/" + id + "/events/upcoming" + "?access_token=" + token)
            .done(function(data) {
                var events = data.data;
                var $upcomingDiv = $(divElement);
                var $roomDiv = $("#room" + id);
                var roomLoaded = false;

                $upcomingDiv.html(""); 
                $roomDiv.html("<h1>Available</h1><h1>All Day</h1>");
                
                var numEventsShow = (events.length > 3) ? 3 : events.length;

                for (var i = 0; i < numEventsShow; i++) {

                    var event = new Event(events[i]);
                    var eventTimeDiv = " ";
                
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

                        if (event.DayOfWeek) { // but there are upcoming events

                            var template = $.templates('#upcomingLayout');
                            $upcomingDiv.html($upcomingDiv.html() + template.render(event));

                            if (!roomLoaded) {
                                if (event.IsOnToday) {
                                    $roomDiv.html(
                                        "<h1> Now Available </h1>" +
                                        "<h1>Until " + event.StartTime + "</h1>" +
                                        "<h3 style='color: #fff'>"+ event.StartTime + " " + event.Title + "</h3>"
                                    );
                                    roomLoaded = true;
                                }
                            }
                        }

                    }
                }
            
                // Were there any events to show?
                if($upcomingDiv.html() === "") {
                    $upcomingDiv.html("<div style='font-size: 24px' class='col-sm-12 upcoming'>There are no events scheduled for the next 3 days</div>");
                }
            })
            .fail(function() {
                $(divElement).html("<small>Could not get room details.</small>");
            })
            .error(function() {
                $(divElement).html("<small>Could not get room details.</small>");
            });
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
        this.Title = event['title'];
        this.StartDate = new Date(event['started_at']);
        this.StartTime = getTimeFromDate(this.StartDate);
        this.EndDate = new Date(event['ended_at']);
        this.EndTime = getTimeFromDate(this.EndDate);
        this.TodayDate = new Date();
        this.IsOnToday = (this.StartDate.getDay() == this.TodayDate.getDay());
        this.DayOfWeek = this.IsOnToday ? "Today" : (this.StartDate.getDay() < this.TodayDate.getDay() + 3) ? getDayOfWeek(this.StartDate) : "";
        this.Who = (event["visibility"] == "private") ? "Private Function" : "All Welcome";
        this.IsOnNow = (this.StartDate <= this.TodayDate && this.TodayDate <= this.EndDate);
    };

return {

    InitUpcomingEvents: function(token){
        showUpComing();
        setInterval(showUpComing, 60000);
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
