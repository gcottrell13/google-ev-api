
// provides a file system interface to upload a coordinate file
class CoordImport extends ScreenContainer
{
    start()
    {
        printpage("",
            wblock(
                wtitle('GeV')
            ),
            generateSaveContainer()
        );
    }
}
class CoordImportConfirm extends ScreenContainer
{
    start()
    {
        printpage("",
            wblock(
                wtitle('Coordinate Import')
            ),
            "<p>Is this shape correct?</p>",
            get_canvas()
        );
    }
}

// lets the user select points on the map
class CoordPoint extends ScreenContainer
{
    start()
    {
        this.points = [];
        this.markers = [];
        this.poly = null;

        this.meta_index = [];

        this.labels = ["A", "B", "C", "D"];

        printpage("",
            wblock(
                wtitle('Map Select')
            ),
            get_canvas(),
            wblock(
                "<div id='point_display'></div>"
            )
        );
    }

    _do_drawing()
    {
        if(this.poly != null)
            this.poly.setMap(null);

		this.poly = new google.maps.Polygon({
        	paths: this.points,
        	strokeColor: '#FF0000',
        	strokeOpacity: 0.8,
        	strokeWeight: 2,
        	fillColor: '#FF0000',
        	fillOpacity: 0.35
		});
        this.poly.setMap(map);

        // update the markers with new labels
        // and change the button text
        var k = 0;
        var mx = this.meta_index;
        for(var i in mx)
        {
            if(mx[i].marker != null)
            {
                var m = mx[i].marker;
                m.setLabel(this.labels[k]);
                $("#button_" + mx[i].mx).text("Remove corner " + this.labels[k]);

                k++;
            }
        }

        // check to see if we should give the user the option to continue
        if(this.points.length == 4)
        {
            $("#map").before(
                wblock(
                    wbutton("Continue", "changePage(SelectQuerySizePage)", "continue", "green")
                )
            );
        }
        else
        {
            $("#continue").parent().remove();
        }
    }

    // when we leave this page
    pause()
    {
        set_corners(this.points);
    }

    selectPoint(latLng)
    {
        if(this.points.length >= 4)
            return;

        this.points.push(latLng);

        // put a marker so it's easier to tell which points correspond to the buttons below the map
        var index = this.points.length - 1;
        var label = this.labels[index];
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            label: label
        });

        this.markers.push(marker);

        var mx = this.meta_index.length;
        this.meta_index.push({latLng: latLng, marker: marker, index: index, mx: mx});

        this._do_drawing();

        $("#point_display").append(
            wrapdiv(
                wbutton("Remove corner " + label, "GM.screenmanager.topScreen.removePoint(" + mx + ")", "button_" + mx),
                "short-block"
            )
        );
    }

    removePoint(mx)
    {
        if(this.points.length <= 0)
            return;

        var refs = this.meta_index[mx];

        var index = null;
        for(var i in this.markers)
        {
            if(this.markers[i] == refs.marker)
            {
                index = i;
                break;
            }
        }

        this.points.splice(index, 1);

        this.markers[index].setMap(null);
        this.markers.splice(index, 1);

        refs.latLng = null;
        refs.marker = null;

        this._do_drawing();

        $("#button_" + mx).parent().remove();
    }
}


class SelectQuerySizePage extends ScreenContainer
{
    start()
    {
        printpage("",
            wblock(
                wtitle("Select Query Size")
            ),
            display_density_choices()
        );
    }
}

class SubmitCoordsPage extends ScreenContainer
{
    constructor(size)
    {
        super("SubmitCoords");

        this.size = size;
    }

    start()
    {
        printpage("",
            wblock(
                wtitle("Confirm Query")
            ),
            getStaticMap(),
            wblock(
                "Query: " + this.size*this.size + " points."
            ),
            wblock(
                "Will take about " + ((this.size*this.size/500)*QUERY_TIMER) + " seconds."
            ),
            wblock(
                wbutton("Yes", "changePage(QueryPage, " + this.size + ")")
            ),
            wblock(
                wbutton("No", "changePage(\'back\')")
            )
        );
    }
}

class QueryPage extends ScreenContainer
{
    back(){return false;}
    constructor(size)
    {
        super("Query");
        this.size = size;
    }

    start()
    {
        printpage("",
            wblock(
                wtitle("Getting Data...")
            )
        );
        generate_points(this.size);
    }
}
