import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, {GeolocateControl, Marker, Popup} from 'react-map-gl';
//import { REACT_APP_MAPBOX_API_KEY, TICKETMASTER_KEY } from './env';

const geolocateStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  margin: 10
};

//const ticketUrl = `https://app.ticketmaster.com/discovery/v2/events.json?size=30&city=chicago&apikey=${TICKETMASTER_KEY}`;
//const REACT_APP_MAPBOX_API_KEY=process.env.REACT_APP_MAPBOX_API_KEY
const ticketUrl = `https://app.ticketmaster.com/discovery/v2/events.json?size=30&city=chicago&apikey=4rTME5oHYcimuAeEz6QFqG0XSB1gHhC9`;
const REACT_APP_MAPBOX_API_KEY='pk.eyJ1IjoiZ3JleWtyYXYiLCJhIjoiY2p4bXlwb3NjMDkwdDNobzZkYXIxeTB2bCJ9.23vaPNjrffSym1U2FJbPVw'


export default class App extends Component {
  state = {
   viewport:{ latitude: 41.86205404,
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
         console.log(event)
          return <Marker
            key={idx}
            longitude={Number(event._embedded.venues[0].location.longitude)}
            latitude={Number(event._embedded.venues[0].location.latitude)}
          >
            <button className="marker-btn" onClick={e => {
                e.preventDefault();
                setSelectedPark(park);
                this.setState({})
                this.setState({ count: this.state.count + 1 })
              }}
            >
              <img src="/skateboarding.svg" alt="Skate Park Icon" width='20px' />
            </button>
          </Marker>
        })}
{selectedPark ? (
          <Popup
            latitude={selectedPark.geometry.coordinates[1]}
            longitude={selectedPark.geometry.coordinates[0]}
            onClose={() => {
             // setSelectedPark(null);
             console.log('closed')
            }}
          >
            <div>
              <h2>{selectedPark.properties.NAME}</h2>
              <p>{selectedPark.properties.DESCRIPTIO}</p>
            </div>
          </Popup>
        ) : null}

        <button onClick={this.handleClick}>Click Me ({this.state.events.length})</button>
      </MapGL>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
