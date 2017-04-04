
function set_corners(c)
{
	corners = c;
}

function Vec2(x, y)
{
	this.x = x;
	this.y = y;
	this.add = function(v)
	{
		return new Vec2(this.x + v.x, this.y + v.y);
	};
	this.sub = function(v)
	{
		return new Vec2(this.x - v.x, this.y - v.y);
	};
	this.mult = function(n)
	{
		return new Vec2(this.x * n, this.y * n);
	};

	this.toString = function()
	{
		return "<" + this.x + ", " + this.y + ">";
	};
}

function V(x,y,n,p)
{
	var A = p[1].sub(p[0]);
	var B = p[2].sub(p[3]);

	A = A.mult(x/n).add(p[0]);
	B = B.mult(x/n).add(p[3]);

	var C = (B.sub(A)).mult(y/n).add(A);

	return C;
}


function generate_points(size)
{
	points = [];

	c = []; // corners Vec2-ified
	for(var k in corners)
	{
		var corner = corners[k];
		var v = new Vec2(corner.lat(), corner.lng());
		c.push(v);
	}

	for(var i = 0; i < size; i++)
	{
		for(var j = 0; j < size; j++)
		{
			var p = V(i+1, j+1, size, c);
			p.lat = p.x;
			p.lng = p.y;
			points.push(p);
		}
	}
	//console.log(corners);
	submit_coords();
}

function submit_coords()
{
	elevator = new google.maps.ElevationService;
	$(".page").append("<div id='progress'></div>");

	elevation_data = [];
	get_next_coordinate();
}

function cancel_operation()
{
	points = [];
	clear();

	generateSaveContainer();
}

function finish_getting_data()
{
	$("#warning").remove();

	points = [];
	point_number = 0;

	//generateSaveContainer();

	$(".page").append(

		getStaticMap(),
		wblock(
			wbutton("Menu", "GM.screenmanager.backUpTo(UserMenu)")
		)
	);

	save_query();
	saveData();
}

function save_query()
{
	var query_string = '';
	for(var i in corners)
	{
		var c = corners[i];

		query_string += c.lat() + "," + c.lng() + (i == corners.length - 1 ? "" : ":");
	}

    ajaxPOST('backend.php', {action: "savequery", qstring: query_string, id: GM.getUser().id}, function(r){
        var result = JSON.parse(r);
        if(result.success != 1)
        {
			log("Error saving query string:", result.text);
        }
    });
}
function get_queries()
{
    ajaxPOST('backend.php', {action: "pastqueries", id: GM.getUser().id}, function(r){
        var result = JSON.parse(r);
        if(result.success == 1)
        {
			log("past queries result:");
			for(var i in result.res)
			{
				log(result.res[i]);

				var qstring = result.res[i].query_string;

				var corners = qstring.split(":");
				corners = corners.map(function(o){
					var s = o.split(",");
					return new Vec2(s[0], s[1]);
				});

				$(".page").append(
					wbutton(qstring, "", "", "compact") + "<br>"
				);
			}
        }
    });
}

function get_next_coordinate()
{
	var locations = [];

	//log(points);
	while(locations.length < 500 && points.length > 0)
	{
		locations.push(points.pop());
	}

	//log(locations);

	elevator.getElevationForLocations({
		'locations': locations
	  }, function(results, status) {
		//infowindow.setPosition(location);
		if (status === 'OK') {
		  // Retrieve the first result
		  if (results[0]) {
			// Open the infowindow indicating the elevation at the clicked position.
			//infowindow.setContent('The elevation at ' + location.lat + ", " + location.lng + ' <br>is ' +
			//	results[0].elevation + ' meters.');

			for(var i = 0; i < results.length; i++)
			{
				var l = results[i];
				log(locations[i]);
				elevation_data.push({
					point_num : ++point_number,
					lat : (locations[i].x * lat_factor + lat_offset),
					lng : (locations[i].y * lng_factor + lng_offset),
					elevation: l.elevation * meters_convert
				});
			}

			$(".page").append("Got " + results.length + " points.<br>");
			$("#progress").text(Math.floor(point_number * 100 / (point_number+points.length)) + "%");

			if(points.length > 0)
				setTimeout(get_next_coordinate, QUERY_TIMER * 1000);
			else
				finish_getting_data();
		  } else {
			//infowindow.setContent('No results found for ' + location.lat + ", " + location.lng);
			$(".page").append('<div>No results found for ' + location.lat + ", " + location.lng + '</div>');
		  }
		} else {
			$(".page").append("<div>" + status + "</div>");
			finish_getting_data();
		}
	  });
}


function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 8,
		center: center,  // Phoenix, AZ
		mapTypeId: 'terrain'
	});
	map.addListener('click', function(e) {
		if(GM.screenmanager.topScreen.name == "selectpoints")
		{
			GM.screenmanager.topScreen.selectPoint(e.latLng);
		}
    });
}


function saveData()
{
	// output data to a csv format

	var data = '';

	for(var i = 0; i < elevation_data.length; i++)
	{
		var ev = elevation_data[i];
		data = data + ev.point_num + "," + ev.lat + "," + ev.lng + "," + ev.elevation + "\r\n";
	}

	var now = new Date();
	var name = "elevation_data_" +
		now.getDate() + "_" +
		(now.getMonth()+1) + "_" +
		now.getFullYear() + "_" +
		now.getHours() + "_" +
		now.getMinutes() + '_' +
		now.getSeconds();

	$FILE.saveAs(name + ".csv", data, 'text/plain');

	getStaticMapBlob(name + "_map.png");
}


function getStaticMapURL()
{
	var markers = "";
	var path = "&path=color:0xff0000ff|weight:5|fillcolor:0xff000000|";
	var firstpoint = corners[0];
	for(var i in corners)
	{
		var c = corners[i];

		//markers += "&markers=size:tiny|" + c.lat() + "," + c.lng();
		path += c.lat() + "," + c.lng() + "|";
	}
	path += firstpoint.lat() + "," + firstpoint.lng();

	var srcurl = "https://maps.googleapis.com/maps/api/staticmap?" +
		//"center=" + center.x + "," + center.y +
		//"&zoom=15" +
		"&size=400x400" +
		"&maptype=hybrid" +
		markers +
		path +
		"&key="+API_KEY;
	return srcurl;
}
function getStaticMapBlob(name)
{
	fetch(getStaticMapURL())
	  .then(function(response) {
	    return response.blob()
	  })
	  .then(function(blob) {
	    $FILE.saveBlob(name, blob);
	  });
}
