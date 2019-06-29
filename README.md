# TFL Bus and Tube Arrivals Information

A simple JavaScript app that uses the TFL API to retrieve bus and tube information.
The UI is very simple and essentially uses HTML tables to display the information as
a set of tables.

## Setup

In order to use this app, you need a file called *credentials.js* which contains your
credentials for using the TFL API.  You can get this for free by registering with TFL
at:

```
https://api-portal.tfl.gov.uk
```

It used to be the case that you could do without your own credentials, as long as you made
just a few requests a day.  However, this seems to have changed, and I found I needed to
register to get satisfactory service from the server.

The format of *credentials.js* should be as follows:

```
const credentials = "app_id=<your id>&app_key=<your key>";
```

## Running

Load `tfl.html` into your browser and start by entering a stop point search pattern
in the search box and pressing `Submit`.  This will display a list of search matches
in a table form.  Select the row of interest by tapping on it.

Below the search matches, another table will appear with a list of stop points associated
with the selected search match.  Selecting one of these will then display the arrivals
information for that stop point in a further table below.

The `Select` and `Save` buttons are used to store a list of favourite stop points.  Once you
have a set of stop points, pressing `Select` will display a set of check boxes to the right
of each stop point.  Select the stop points of interest and then press `Save`.  You can
display your saved stop points by pressing on the `Saved` button at the top of the screen.

The `Nearby` button will display all stop points that are within ~500m.  If you press this,
you may get a popup requesting permission to retrieve your location.  This is only used
to retrieve the neaby stop points and is not saved.

The `Disruptions` button is self-explanatory and displays the current tube status in a
new table.


