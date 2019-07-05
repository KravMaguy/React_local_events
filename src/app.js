import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, {GeolocateControl, Marker, Popup} from 'react-map-gl';
import * as parkDate from "./data/skateboard-parks.json";

const geolocateStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  margin: 10
};
const Ticket_Master_Key=process.env.apikey
const ticketUrl = 'https://app.ticketmaster.com/discovery/v2/events.json?size=3&city=chicago&apikey='+Ticket_Master_Key
const REACT_APP_MAPBOX_API_KEY=process.env.REACT_APP_MAPBOX_API_KEY


export default class App extends Component {
  state = {
    viewport: {
      latitude: 37.8,
      longitude: 96,
      zoom: 3,
      bearing: 0,
      pitch: 0
    }
  };

  handleClick = () => {
    return fetch(ticketUrl)
    .then((response) => response.json())
    .then((responseJson) => {

      for (let x=0; x<responseJson._embedded.events.length; x++){
      console.log(responseJson._embedded.events[x]._embedded.venues[0].location)
      //merge each lat long as a marker into state
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  _onViewportChange = viewport => this.setState({viewport});

  render() {
    const {viewport} = this.state;
   
    return (
      <MapGL
        {...viewport}
        width="100%"
        height="100%"
        mapStyle="mapbox://styles/mapbox/dark-v9"
        onViewportChange={this._onViewportChange}
        mapboxApiAccessToken={REACT_APP_MAPBOX_API_KEY}
      >
        <GeolocateControl
          style={geolocateStyle}
          positionOptions={{enableHighAccuracy: true}}
          trackUserLocation={true}
        />

        <button onClick={this.handleClick}>Click Me</button>

        {parkDate.features.map(park => (
          <Marker
            key={park.properties.PARK_ID}
            latitude={park.geometry.coordinates[1]}
            longitude={park.geometry.coordinates[0]}
          >
            <button
              className="marker-btn"
              onClick={e => {
                e.preventDefault();
                setSelectedPark(park);
              }}
            >
              <img src="/skateboarding.svg" alt="Skate Park Icon" />
            </button>
          </Marker>
        ))}

      </MapGL>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
