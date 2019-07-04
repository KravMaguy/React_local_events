import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, {GeolocateControl, Marker, Popup} from 'react-map-gl';
// import * as parkDate from "./data/skateboard-parks.json";
import { REACT_APP_MAPBOX_API_KEY, TICKETMASTER_KEY } from './env';

const geolocateStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  margin: 10
};
const ticketUrl = `https://app.ticketmaster.com/discovery/v2/events.json?size=30&city=chicago&apikey=${TICKETMASTER_KEY}`;


export default class App extends Component {
  state = {
    viewport: {
      latitude: 41.86205404,
      longitude: -87.61682143,
      width: "100vw",
      height: "100vh",
      zoom: 10
    },
    events: []
  };

  handleClick = () => {
    return fetch(ticketUrl)
    .then((response) => response.json())
    .then((responseJson) => {
      const events = responseJson._embedded.events;
      this.setState({
        events,
        viewport: {
          ...this.state.viewport,
          latitude: Number(events[1]._embedded.venues[0].location.latitude),
          longitude: Number(events[1]._embedded.venues[0].location.longitude),
        }
      })
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
        {this.state.events.map((event, idx) => {
          return <Marker
            key={idx}
            longitude={Number(event._embedded.venues[0].location.longitude)}
            latitude={Number(event._embedded.venues[0].location.latitude)}
          ><img width="20" src="https://img.icons8.com/office/2x/marker.png" /></Marker>
        })}
        <button onClick={this.handleClick}>Click Me ({this.state.events.length})</button>
      </MapGL>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
0