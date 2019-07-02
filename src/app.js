import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, {GeolocateControl, Marker, Popup} from 'react-map-gl';
import * as parkDate from "./data/skateboard-parks.json";
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ3JleWtyYXYiLCJhIjoiY2p2dHdueW5qMWw5YzN6bzgxZmJ6ZGI0YyJ9.cjkhj2sNCi_xeQQpM1MHgA'; // Set your mapbox token here

const geolocateStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  margin: 10
};
const ticketUrl = 'https://app.ticketmaster.com/discovery/v2/events.json?size=3&city=chicago&apikey=04HrEhaZmyaJysTpp6pIJeVndmGzVoNN'


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

      console.log(responseJson._embedded.events[i]._embedded)
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
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        <GeolocateControl
          style={geolocateStyle}
          positionOptions={{enableHighAccuracy: true}}
          trackUserLocation={true}
        />
        <button onClick={this.handleClick}>Click Me</button>
      </MapGL>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
