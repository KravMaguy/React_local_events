import React, { Component } from "react";
import "./modalStyles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./fadeStyles.css";

import { render } from "react-dom";
import MapGL, {
GeolocateControl,
Marker,
Popup,
FlyToInterpolator
} from "react-map-gl";
// to fix you have to go to this link and follow these steps
//https://medium.com/@trekinbami/using-environment-variables-in-react-6b0a99d83cf5

//import { REACT_APP_MAPBOX_API_KEY, TICKETMASTER_KEY } from './env';
import { Navbar, NavbarBrand, Button } from "reactstrap";

const geolocateStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  margin: 10,
  zIndex: 100
};

const buttonStyles = {
  position: "relative",
  display: "block",
  margin: 7,
  zIndex: 100
};

const ticketUrl = `https://app.ticketmaster.com/discovery/v2/events.json?&apikey=4rTME5oHYcimuAeEz6QFqG0XSB1gHhC9&latlong=`;
const REACT_APP_MAPBOX_API_KEY =
  "pk.eyJ1IjoiZ3JleWtyYXYiLCJhIjoiY2p4bXlwb3NjMDkwdDNobzZkYXIxeTB2bCJ9.23vaPNjrffSym1U2FJbPVw";
const EventBrightUrl = `https://www.eventbriteapi.com/v3/events/search/?location.within=8mi&start_date.keyword=this_week&token=ZDZF7QS5ACTJOA6V365N&expand=venue`;
let timesClicked = 0;

class Modal extends React.Component {
  render() {
    const {onCloseRequest, name, hotelname, britestatus, britename, description, vicinity}= this.props;
    const {modalVisibility}= this.props;
    return (
      <div
        onClick={onCloseRequest}
        className={"modal-wrapper " + modalVisibility}
      >
        <div className="modal">
          <h1>
            {" "}
            {name
              ? name
              : hotelname
              ? hotelname
              : britestatus}
          </h1>
          <p>
            {" "}
            {description
              ? description
              : vicinity
              ? vicinity
              : britename}
          </p>
          <button onClick={onCloseRequest}>Okay</button>
        </div>
      </div>
    );
  }
}

export default class App extends Component {
  service;
  state = {
    viewport: {
      latitude: 41.86205404,
      longitude: -87.61682143,
      width: "100vw",
      height: "100vh",
      zoom: 10,
      bearing: 0,
      pitch: 0,
      userLocation: null
    },
    hotels: [],
    events: [],
    events_visibility: false,
    hotels_visibility: false,
    brites_visibility: false,
    eventBrights: [],
    selectedEvent: null,
    selectedGoogleHotel: null,
    selectedBright: null
  };
  _onViewportChange = viewport =>
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });

  _goToViewport = ({ longitude, latitude }) => {
    this._onViewportChange({
      longitude,
      latitude,
      zoom: 16,
      pitch: 40,
      bearing: 0,
      //easing: function (t) { return t; },
      //speed: 0.2, // make the flying slow
      //curve: 1, // change the speed at which it zooms out
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 2000
    });
  };

  zoomOut=() => {
    // this._onViewportChange({
 
    //   zoom: 10,
    //   //easing: function (t) { return t; },
    //   //speed: 0.2, // make the flying slow
    //   //curve: 1, // change the speed at which it zooms out
    //   transitionInterpolator: new FlyToInterpolator(),
    //   transitionDuration: 1500
    // });
    this.setState({
      viewport: {
        ...this.state.viewport,
        zoom: 10
      },
  });
}

  componentDidMount() {
    this.service = new google.maps.places.PlacesService(
      document.getElementById("googlestuff")
    );
    this.askReshus();
  }

  updateRequestLocation = hisMakom => {
    const {latitude, longitude}= hisMakom.coords;
    this.setState({
      viewport: {
        ...this.state.viewport,
        latitude: latitude,
        longitude: longitude
      },
      userLocation: {
        lat: latitude,
        lng: longitude
      }
    });
  };

  askReshus = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.updateRequestLocation,
        this.showError
      );
    } else {
      console.error("browser not support location");
    }
  };

  showError = error => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.");
        break;
    }
  };

  searchIt = () => {
    const {hotels_visibility, userLocation}= this.state;
    if (hotels_visibility) {
      this.setState({
        hotels_visibility: false
      });
    } else {
      this.setState({
        hotels_visibility: true
      });
    }
    var request = {
      location: userLocation,
      radius: 10000,
      keyword: "hotel"
    };

    this.service.nearbySearch(request, this.getHotels);
  };

  getHotels = x => {
    this.setState({ hotels: x });
  };

  handleClick = () => {
    const {events_visibility}= this.state;
    if (events_visibility) {
      this.setState({
        events_visibility: false
      });
    } else {
      this.setState({
        events_visibility: true
      });
    }

    let { lat, lng } = this.state.userLocation;
    let latlng = lat + "," + lng;
    return fetch(ticketUrl + latlng)
      .then(response => response.json())
      .then(responseJson => {
        const events = responseJson._embedded.events;
        this.setState({
          events,
          viewport:   {
            ...this.state.viewport,
            latitude: Number(events[1]._embedded.venues[0].location.latitude),
            longitude: Number(events[1]._embedded.venues[0].location.longitude)
          }
        });
      })
      .catch(error => {
        console.error(error);
      });
  };

  eventBrightSearch = () => {
    const {brites_visibility} = this.state;
    if (brites_visibility) {
      this.setState({
        brites_visibility: false
      });
    } else {
      this.setState({
        brites_visibility: true
      });
    }

    let { lat, lng } = this.state.userLocation;
    let UrlParams = `&location.latitude=${lat}&location.longitude=${lng}`;
    let Url = EventBrightUrl + UrlParams;
    return fetch(Url)
      .then(response => response.json())
      .then(responseJson => {
        const eventBrights = responseJson.events;
        this.setState({
          eventBrights,
          viewport: {
            ...this.state.viewport,
            latitude: Number(eventBrights[0].venue.latitude),
            longitude: Number(eventBrights[0].venue.longitude)
          }
        });
      })
      .catch(error => {
        console.error(error);
      });
  };

  render() {
    const { viewport, settings } = this.state;
    const {hotels_visibility, selectedGoogleHotel, hotels, modalVisibility, events_visibility, events, selectedEvent, brites_visibility, eventBrights, selectedBright}= this.state;
    return (
      <MapGL
        {...viewport}
        {...settings}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange}
        dragToRotate={false}
        mapboxApiAccessToken={REACT_APP_MAPBOX_API_KEY}
      >
        <Navbar style={{ zIndex: 99 }} dark color="primary">
          <div style={{ marginLeft: "3vw" }} className="">
            <NavbarBrand href="/">React local Events</NavbarBrand>
          </div>
        </Navbar>
        <GeolocateControl
          style={geolocateStyle}
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
        />

        {hotels_visibility &&
          hotels.map((hotel, idx) => {
            return (
              <div className="fade-in">

              <Marker
                key={idx}
                longitude={Number(hotel.geometry.location.lng())}
                latitude={Number(hotel.geometry.location.lat())}
              >
                <img
                  style={{ width: 20, height: 20, borderRadius: "50%" }}
                  src="https://png.pngtree.com/element_our/md/20180518/md_5afec7ed7dd4e.jpg"
                  onClick={e => {
                    timesClicked++;
                    if (timesClicked > 1) {
                      this.setState({
                        modalVisibility: "visible",
                        selectedGoogleHotel: hotel
                      });
                      timesClicked = 0;
                    } else {
                      this._goToViewport({
                        longitude: hotel.geometry.location.lng(),
                        latitude: hotel.geometry.location.lat()
                      });
                    }
                  }}
                />
              </Marker>
              </div>
            );
          })}

        {selectedGoogleHotel ? (
          <Modal
            vicinity={selectedGoogleHotel.vicinity}
            hotelname={selectedGoogleHotel.name}
            onCloseRequest={() => {
              this.setState({ selectedGoogleHotel: null });
              this.setState({ modalVisibility: "hidden" });
            }}
            modalVisibility={modalVisibility}
          />
        ) : null}

        {events_visibility &&
          events.map((event, idx) => {
            return (
              <div className="fade-in">
              <Marker
                key={idx}
                longitude={Number(event._embedded.venues[0].location.longitude)}
                latitude={Number(event._embedded.venues[0].location.latitude)}
              >
                <img
                  style={{ width: 30, height: 30, borderRadius: "" }}
                  src="ticketmaster.png"
                  onClick={e => {
                    e.preventDefault();
                    this.setState({ modalVisibility: "visible" });
                    this.setState({ selectedEvent: event });
                  }}
                />
              </Marker>
              </div>
            );
          })}

        {selectedEvent ? (
          <Modal
            description={
              selectedEvent.promoter &&
              selectedEvent.promoter.name
                ? selectedEvent.promoter.name
                : "Ticketmaster API did not provide a description"
            }
            event={selectedEvent}
            name={selectedEvent.name}
            onCloseRequest={() => {
              this.setState({ selectedEvent: null });
              this.setState({ modalVisibility: "hidden" });
            }}
            modalVisibility={modalVisibility}
          />
        ) : null}

        {brites_visibility &&
          eventBrights.map((event, idx) => {
            return (
              <div className="fade-in">

              <Marker
                key={idx}
                longitude={Number(event.venue.longitude)}
                latitude={Number(event.venue.latitude)}
              >
                <img
                  style={{ width: 25, height: 25, borderRadius: "" }}
                  src="eventbrite_logo.png"
                  onClick={e => {
                    e.preventDefault();
                    this.setState({ modalVisibility: "visible" });
                    this.setState({ selectedBright: event });
                  }}
                />
              </Marker>
              </div>
            );
          })}

        {selectedBright ? (
          <Modal
            britestatus={selectedBright.status}
            britename={selectedBright.name.text}
            onCloseRequest={() => {
              this.setState({ selectedBright: null });
              this.setState({ modalVisibility: "hidden" });
            }}
            modalVisibility={modalVisibility}
          />
        ) : null}

        <Button style={buttonStyles} color="warning" onClick={this.searchIt}>
          <img
            src="/chrome.svg"
            style={{ marginRight: "0.3rem", width: "23px" }}
            alt="google Icon"
          />
          Google hotels ({hotels.length})
        </Button>
        <Button
          style={buttonStyles}
          color="primary"
          onClick={this.eventBrightSearch}
        >
          <img
            style={{ marginRight: "0.3rem", width: "23px" }}
            src="/e.png"
            alt="eventbrite Icon"
          />
          EventBrite ({eventBrights.length})
        </Button>
        <Button style={buttonStyles} color="light" onClick={this.handleClick}>
          <img
            src="/t.png"
            style={{
              transform: "translateY(-50%)",
              position: "absolute",
              top: "50%",
              width: "23px"
            }}
            alt="ticketmaster Icon"
          />
          TicketMaster ({events.length})
        </Button>

      

        {this.state.viewport.zoom>10 ? (
          <div className="fade-in">
        <Button style={buttonStyles} color="warning" onClick={this.zoomOut}>
        <i className="icon-zoom-out"></i> icon-zoom-out        
        </Button>
        </div>
        ) : <div className="fade-out"><Button style={buttonStyles} color="warning" onClick={this.zoomOut}>
        <i className="icon-zoom-out"></i> icon-zoom-out        
        </Button></div>}

      </MapGL>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
