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

const hotelUrl=`https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyCFImmZyGtKhyhfyKxnJwd7csqCtXaNiIo&type=hotel&location=41.86205404,-87.61682143&radius=5500`
const ticketUrl =`https://app.ticketmaster.com/discovery/v2/events.json?size=30&city=chicago&apikey=4rTME5oHYcimuAeEz6QFqG0XSB1gHhC9`;
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
    zoom: 10
  },
  hotels:[],
  events: [],
  selectedEvent: null,
  selectedGoogleHotel: null,
  };
//this mosh put in Google is not allow to call directly to their server and require to use the SDK, that's why is different.
//Using Google Maps API via the SDK requires the SDK script to load.
//this above he said does not make sense because they do not provide an sdk no environment like android studio, leapmotion
//no build tools, no set of tools to measure the performance so why is it an sdk? I just want them to give me some geojson and hotel info
//asking for some info that is already public on their map is a get and is idempotence of the highest degree
  componentDidMount() {
    this.service = new google.maps.places.PlacesService(document.getElementById("googlestuff")
    );
  }

  searchIt= () => {
    console.log('check1')
    var request={
    location: {
    lat: 41.86205404,
    lng: -87.61682143},
    radius: 10000,
    keyword: 'hotel'
    }

    this.service.nearbySearch(request, this.getHotels);
  }

  getHotels = (x) => {
    //console.log(x);
    console.log('this is x length'+x.length)
    x.map(hotel=>console.log(hotel.geometry.location.lat(),hotel.geometry.location.lng()))
    console.log('the state is : ');

    this.setState({hotels:x})
    console.log(this.state);
  }

  handleClick = () => {
    return fetch(ticketUrl)
    .then((response) => response.json())
    .then((responseJson) => {
      const events = responseJson._embedded.events;
      //console.log(events)
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
    //console.log(viewport);

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
       this.setState({modalVisibility: 'visible'})
       this.setState({selectedGoogleHotel: hotel})
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
		<button onClick={this.searchIt}>find hotels ({this.state.hotels.length})</button>
      </MapGL>


    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}
