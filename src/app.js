import React, {Component} from 'react';
import './modalStyles.css';

import 'bootstrap/dist/css/bootstrap.min.css'

import {render} from 'react-dom';
import MapGL, {GeolocateControl, Marker, Popup} from 'react-map-gl';
// to fix you have to go to this link and follow these steps
//https://medium.com/@trekinbami/using-environment-variables-in-react-6b0a99d83cf5

//import { REACT_APP_MAPBOX_API_KEY, TICKETMASTER_KEY } from './env';
import {Navbar, NavbarBrand, Button} from 'reactstrap';

const geolocateStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  margin: 10,
  zIndex:100

};

const buttonStyles={
  display:'block',
  margin:5,
  zIndex:100
}

let ticketUrl =`https://app.ticketmaster.com/discovery/v2/events.json?&apikey=4rTME5oHYcimuAeEz6QFqG0XSB1gHhC9&latlong=`;
const REACT_APP_MAPBOX_API_KEY='pk.eyJ1IjoiZ3JleWtyYXYiLCJhIjoiY2p4bXlwb3NjMDkwdDNobzZkYXIxeTB2bCJ9.23vaPNjrffSym1U2FJbPVw'


class Modal extends React.Component {
  render(){
    console.log(this.props.event)
    return(
      <div className = {'modal-wrapper '+this.props.modalVisibility}>
        <div className = 'modal'>
          <h1> {this.props.name? this.props.name: this.props.hotelname}</h1>
          <p> {this.props.description? this.props.description: this.props.vicinity}</p>
          <button onClick = {this.props.onCloseRequest}>Okay</button>
        </div>
      </div>
    )
  }
}

export default class App extends Component {
  service;
  state = {
   viewport:{ latitude: 41.86205404,
    longitude: -87.61682143,
    width: "100vw",
    height: "100vh",
    zoom: 10,
    userLocation: null
  },
  hotels:[],
  events: [],
  selectedEvent: null,
  selectedGoogleHotel: null,
  };
  componentDidMount() {
    this.service = new google.maps.places.PlacesService(document.getElementById("googlestuff")
    );

    this.askReshus();
  }

  updateRequestLocation=(hisMakom)=>{
    this.setState({
      viewport: {
        ...this.state.viewport,
        latitude: hisMakom.coords.latitude,
        longitude: hisMakom.coords.longitude,
      },
      userLocation: {
        lat: hisMakom.coords.latitude,
        lng: hisMakom.coords.longitude
      }
    });
  }

  askReshus=()=>{
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(this.updateRequestLocation, this.showError);
    } else {
      console.error('browser not support location');
    }
  }

   showError=(error)=> {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.")
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.")
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.")
            break;
    }
}

  searchIt= () => {
    console.log('check if heGaveReshus')
    var request={
      location: this.state.userLocation,
      radius: 10000,
      keyword: 'hotel'
    }

    this.service.nearbySearch(request, this.getHotels);
  }

  getHotels = (x) => {
    x.map(hotel=>console.log(hotel.geometry.location.lat(),hotel.geometry.location.lng()))
    this.setState({hotels:x})
  }

  handleClick = () => {
    let {lat, lng}=this.state.userLocation;
    let latlng=lat+","+lng
      ticketUrl=ticketUrl+latlng
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
     <Navbar style={{zIndex:99}} dark color="primary">
        <div style={{marginLeft:'3vw'}} className="">
          <NavbarBrand href="/">React local Events</NavbarBrand>
          </div>
      </Navbar>
        <GeolocateControl
          style={geolocateStyle}
          positionOptions={{enableHighAccuracy: true}}
          trackUserLocation={true}
        />

{this.state.hotels.map((hotel, idx) => {
  return <Marker
    key={idx}
    longitude={Number(hotel.geometry.location.lng())}
    latitude={Number(hotel.geometry.location.lat())}
  >
    <img style={{width: 20, height: 20, borderRadius: '50%'}} src="https://png.pngtree.com/element_our/md/20180518/md_5afec7ed7dd4e.jpg"
    onClick={e => {
      e.preventDefault();
      console.log('a hotel was clicked');
       this.setState({
         modalVisibility: 'visible',
         selectedGoogleHotel: hotel
        })
      }}
    />
  </Marker>
})}


{this.state.selectedGoogleHotel ? (
  <Modal
    vicinity={this.state.selectedGoogleHotel.vicinity}
    hotelname={this.state.selectedGoogleHotel.name}
    onCloseRequest={() => {
     console.log('closed')
     this.setState({selectedGoogleHotel: null})
     this.setState({modalVisibility: 'hidden'});
    }} modalVisibility = {this.state.modalVisibility}
  />
  ) : null}


       {this.state.events.map((event, idx) => {
          return <Marker
            key={idx}
            longitude={Number(event._embedded.venues[0].location.longitude)}
            latitude={Number(event._embedded.venues[0].location.latitude)}
          >

              <img style={{width: 30, height: 30, borderRadius: ''}} src="ticketmaster.png"
                 onClick={e => {
                  e.preventDefault();
                   this.setState({modalVisibility: 'visible'})
                   this.setState({selectedEvent: event})
                  }}
              />

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
		    <Button style={buttonStyles} color="warning" onClick={this.searchIt}>find hotels ({this.state.hotels.length})</Button>
        <Button style={buttonStyles} color="primary" onClick={this.handleClick}>Click Me ({this.state.events.length})</Button>
      </MapGL>


    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}