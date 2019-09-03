import React, {Component} from 'react';
import './modalStyles.css';

import 'bootstrap/dist/css/bootstrap.min.css'

import {render} from 'react-dom';
import MapGL, {GeolocateControl, Marker, Popup} from 'react-map-gl';
// to fix you have to go to this link and follow these steps
//https://medium.com/@trekinbami/using-environment-variables-in-react-6b0a99d83cf5

//import { REACT_APP_MAPBOX_API_KEY, TICKETMASTER_KEY } from './env';
import {Navbar, NavbarBrand} from 'reactstrap';

const geolocateStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  margin: 10
};

//const ticketMasterKey=process.env.local.TICKETMASTER_KEY
//const ticketUrl =`https://app.ticketmaster.com/discovery/v2/events.json?size=30&city=chicago&apikey=${ticketMasterKey}`;
//const REACT_APP_MAPBOX_API_KEY=process.env.local.REACT_APP_MAPBOX_API;

const ticketUrl =`https://app.ticketmaster.com/discovery/v2/events.json?size=30&city=chicago&apikey=4rTME5oHYcimuAeEz6QFqG0XSB1gHhC9`;
const REACT_APP_MAPBOX_API_KEY='pk.eyJ1IjoiZ3JleWtyYXYiLCJhIjoiY2p4bXlwb3NjMDkwdDNobzZkYXIxeTB2bCJ9.23vaPNjrffSym1U2FJbPVw'

class Modal extends React.Component {
  render(){
    console.log(this.props.event) 
    return(
      <div className = {'modal-wrapper '+this.props.modalVisibility}>
        <div className = 'modal'>
          <h1>Event: {this.props.name}</h1>
          <p>Description: {this.props.description}</p>
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
     <Navbar dark color="primary">
        <div className="container">
          <NavbarBrand href="/">React local Events</NavbarBrand>
        </div>
      </Navbar>
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
            description={this.state.selectedEvent.promoter && this.state.selectedEvent.promoter.name ? this.state.selectedEvent.promoter.name : 'Ticketmaster API did not provide a description'}
            event={this.state.selectedEvent}
            name={this.state.selectedEvent.name}
            onCloseRequest={() => {
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
