
var map;
var elevator;

var square = null;

var meters_convert = 3.281;

var QUERY_TIMER = 3;

var lat_factor = 1;//82000;
var lat_offset = 0;//-2725000;
var lng_factor = 1;//90000;
var lng_offset = 0;//10100000;

var grid_sizes = { // points per row
	high : 150,
	medium : 100,
	low : 50,
	superlow : 10,
	Nine : 3
};

var points = [];
var corners = [];
var point_number = 0;
var center = {lat: 33.46, lng: -112.06}; // Phoenix, AZ

var elevation_data = [];

var API_KEY = "AIzaSyCoodUVqU4w0f9YnIyt9OKJ4ggIQNdEzpI";


function import_coords(filetext)
{
	var nums = filetext.split(',');

	var avg = {lat: 0, lng: 0};

	corners = [];

	if(nums.length == 8)
	{
		for(var i = 0; i < nums.length; i += 2)
		{
			var p = new Vec2(parseFloat(nums[i]), parseFloat(nums[i+1]));
			p.lat = p.x;
			p.lng = p.y;

			corners.push(p);

			avg.lat += p.lat;
			avg.lng += p.lng;
		}

		avg.lat /= 4;
		avg.lng /= 4;
	}
	else if(nums.length == 4)
	{
		var center_point = {lat:parseFloat(nums[0]), lng:parseFloat(nums[1])};

		var width = parseFloat(nums[2]);
		var height = parseFloat(nums[3]);

		corners.push({
			lat : center_point.lat + width/2,
			lng : center_point.lng + height/2
		});
		corners.push({
			lat : center_point.lat - width/2,
			lng : center_point.lng + height/2
		});
		corners.push({
			lat : center_point.lat - width/2,
			lng : center_point.lng - height/2
		});
		corners.push({
			lat : center_point.lat + width/2,
			lng : center_point.lng - height/2
		});

		avg = center_point;
		center = center_point;
	}
	else
	{
		clear();
		print("<h1>Incorrect input format! Possible formats:</h1>");
		print("<h3>Format 1: Center X, Center Y, Width, Height</h3>");
		print("<h3>Format 2: 4 points X,Y specifiying corners of a quad.</h3>");
		generateSaveContainer();
		return;
	}


	if (corners.length != 4)
	{
		print("<h1>Need 4 points, but got: " + corners.length + "</h1>");
		return;
	}


	//alert("Import successful!");

	// Construct the polygon.
	if(square == null)
		square = new google.maps.Polygon({
		  paths: corners,
		  strokeColor: '#FF0000',
		  strokeOpacity: 0.8,
		  strokeWeight: 2,
		  fillColor: '#FF0000',
		  fillOpacity: 0.35
		});
	else
		square.setPaths(corners);

	square.setMap(map);

	map.setCenter(avg);

	// show continue or cancel buttons
	clear();
	var html = "<h2>Is this shape the correct area that you want to generate topo data for?</h2>";
	html += "<p style='color:#f99999;'>Make sure that this shape is not twisted, or does not look like a bowtie.</p>";
	html += "<button onclick='display_density_choices()'>Yes, it's fine</button>";
	html += "<button style='margin-left:20px;' onclick='cancel_operation()'>No, let me fix that</button>";
	print(html);
}

function display_density_choices()
{
	var out = "<h1>Choose your point count</h1>";

	for(var e in grid_sizes)
	{
		var size = grid_sizes[e];

		out += ("<button class='med_button' onclick='changePage(SubmitCoordsPage, " + size + ")'>" + e + ": " + size + " (" + (size*size) + " points)</button><br>");
	}
	return out;
}

function generateSaveContainer()
{
   var html = '';

   html += '<div class="save_container">';

   html += '<div class="lightpadding">Load file here:</div>';
   html += '<input type="file" onchange="$FILE.readText(this, import_coords)"></input><br></b><br>';

   html += '<hr>';

   html += '</div>';
   return html;
}

//generateSaveContainer();

function get_back_arrow(){
	return wrapdiv(['<i class="fa fa-arrow-left" aria-hidden="true"></i>'], 'back-button center-align" onclick="changePage(\'back\');"');
}

function printpage(classes, ... pagehtml)
{
	clear();

	var out = '';

	// if we are not on the root screen and the current screen allows the back action
	if(GM.screenmanager.root != GM.screenmanager.topScreen && GM.screenmanager.topScreen.back())
		out += get_back_arrow();

	out += '<div class="page ' + classes + '">';
	for(var i in pagehtml)
		out += pagehtml[i];
	print(out + '</div>');
}
function wrapdiv(html, classes)
{
	var out = '<div class="' + classes + '">';
	for(var i in html)
	{
		out += html[i];
	}
	return out + '</div>';
}
function wblock(html)
{
	return wrapdiv(html, "menu-block");
}
function wtitle(... html)
{
	return wrapdiv(html, "title");
}
function wbutton(title, clickevent, id = "", classes = "")
{
	return '<button class="' + classes + '" id="' + id + '" onclick="' + clickevent + '">' + title + '</button>';
}
function winput(type, value, params)
{
	var out = '<input type="' + type + '" value="' + value + '" ';
	for(var i in params)
	{
		out += i + '="' + params[i] + '" ';
	}
	return out += ' />';
}

function loadGoogleMaps(){
	if($("#googlemapsAPI").size() > 0){
		google = null;
	}

    var script_tag = document.createElement('script');
	script_tag.setAttribute("id", "googlemapsAPI");
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src","https://maps.googleapis.com/maps/api/js?key="+API_KEY+"&callback=initMap");
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
}

function getStaticMap()
{
	return "<div style='width:400px;margin:auto;'><img src='" + getStaticMapURL() + "'></img></div>";
}

function get_canvas()
{
	var out = '<div id="map" style="width:500px;height:500px;"></div>';
	loadGoogleMaps();
	return out;
}
