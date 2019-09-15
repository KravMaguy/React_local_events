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
    zoom: 5,
    userLocation: null,
    pitch:90,
  },
  hotels:[],
  events: [],
  selectedEvent: null,
  selectedGoogleHotel: null,
  };

  componentDidMount() {
    this.service = new google.maps.places.PlacesService(document.getElementById("googlestuff")
    );

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
    var request={
      location: this.state.userLocation,
      radius: 10000,
      keyword: 'hotel'
    }
    return request;
  }

  askReshus=()=>{
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(this.updateRequestLocation);
    } else {
      console.error('browser not support location');
    }
  }

  locateHotels= (request) => {
    request.persist()
    console.log('inside serachit')
    this.askReshus();

    this.service.nearbySearch(request, this.getHotels);
  }

  getHotels = (x) => {
    console.log('this is x length'+x.length)
    x.map(hotel=>console.log(hotel.geometry.location.lat(),hotel.geometry.location.lng()))
    console.log('the state is : ');

    this.setState({hotels:x})
    console.log(this.state);
  }

  handleClick = () => {
    console.log('inside handleclick')
    this.askReshus();

    // return fetch(ticketUrl)
    // .then((response) => response.json())
    // .then((responseJson) => {
    //   const events = responseJson._embedded.events;
    //   this.setState({
    //     events,
    //     viewport: {
    //       ...this.state.viewport,
    //       latitude: Number(events[1]._embedded.venues[0].location.latitude),
    //       longitude: Number(events[1]._embedded.venues[0].location.longitude),
    //     }
    //   })
    // })
    // .catch((error) => {
    //   console.error(error);
    // });
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
             this.setState({selectedEvent: null})
             this.setState({modalVisibility: 'hidden'});
            }} modalVisibility = {this.state.modalVisibility}
          />
          ) : null}
		    <Button style={{display:'block', margin:5}} color="warning" onClick={this.locateHotels}>find hotels ({this.state.hotels.length})</Button>

        <Button style={{display:'block', margin:5}} color="primary" onClick={this.handleClick}>Click Me ({this.state.events.length})</Button>
      </MapGL>


    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}