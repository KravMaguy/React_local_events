import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, {GeolocateControl, Marker, Popup} from 'react-map-gl';
//import { REACT_APP_MAPBOX_API_KEY, TICKETMASTER_KEY } from './env';
import Modalstyles from './modalStyles.css';

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

class Modal extends React.Component {
  render(){
    return(
      <div className = {'modal-wrapper '+this.props.modalVisibility}>
        <div className = 'modal'>
          <h1>Some Text on Modal</h1>
          <button onClick = {this.props.onCloseRequest}>Okay</button>
        </div>
      </div>
    )
  }
}

export default class App extends Component {
  state = {
   viewport:{ latitude: 41.86205404,
    longitude: -87.61682143,
    width: "100vw",
    height: "100vh",
    zoom: 10
  },
  events: [],
  selectedEvent: null
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
            <button className="theme-btn" onClick={e => { 
              e.preventDefault()
              this.setState({modalVisibility: 'visible'})               
              this.setState({selectedEvent: event})
              }}
            >
              <img src="/skateboarding.svg" alt="Skate Park Icon" width='20px' />
            </button>
          </Marker>
        })}
        
{this.state.selectedEvent ? (
          <Modal
            //latitude={Number(this.state.selectedEvent._embedded.venues[0].location.latitude)}
           //longitude={Number(this.state.selectedEvent._embedded.venues[0].location.longitude)}
            onCloseRequest={() => {
             // setSelectedPark(null);
             //close the info window if necessary, 
             //only display events within the next 24 hours
             //you should open the map and it shows locations with events in the next 24 hours
             
             console.log('closed')
             this.setState({selectedEvent: null})
             this.setState({modalVisibility: 'hidden'});
            }} modalVisibility = {this.state.modalVisibility}
          />
       
          ) : null}

        <button onClick={this.handleClick}>Click Me ({this.state.events.length})</button>
      </MapGL>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
