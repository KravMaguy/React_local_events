import React, {Component} from 'react';
import './modalStyles.css';
//import Background from '../fb.png';
import 'bootstrap/dist/css/bootstrap.min.css'

import {render} from 'react-dom';
import MapGL, {GeolocateControl, Marker, Popup, FlyToInterpolator} from 'react-map-gl';
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
  position:'relative',
  display:'block',
  margin:7,
  zIndex:100,
}

const ticketUrl =`https://app.ticketmaster.com/discovery/v2/events.json?&apikey=4rTME5oHYcimuAeEz6QFqG0XSB1gHhC9&latlong=`;
const REACT_APP_MAPBOX_API_KEY='pk.eyJ1IjoiZ3JleWtyYXYiLCJhIjoiY2p4bXlwb3NjMDkwdDNobzZkYXIxeTB2bCJ9.23vaPNjrffSym1U2FJbPVw';
const EventBrightUrl=`https://www.eventbriteapi.com/v3/events/search/?location.within=8mi&start_date.keyword=this_week&token=ZDZF7QS5ACTJOA6V365N&expand=venue`;
let timesClicked= 0;

class Modal extends React.Component {
  render(){
    return(
      <div onClick = {this.props.onCloseRequest} className = {'modal-wrapper '+this.props.modalVisibility}>
        <div className = 'modal'>
          <h1> {this.props.name? this.props.name: this.props.hotelname ? this.props.hotelname : this.props.britestatus}</h1>
           <p> {this.props.description? this.props.description: this.props.vicinity? this.props.vicinity:this.props.britename}</p>
          <button onClick = {this.props.onCloseRequest}>Okay</button>
        </div>
      </div>
    )
  }
}

export default class App extends Component {
  service;
  state = {
   viewport:{
    latitude: 41.86205404,
    longitude: -87.61682143,
    width: "100vw",
    height: "100vh",
    zoom: 10,
    bearing: 0,
    pitch: 0,
    userLocation: null
  },
  hotels:[],
  events: [],
  events_visibility: false,
  hotels_visibility: false,
  brites_visibility: false,
  eventBrights: [],
  selectedEvent: null,
  selectedGoogleHotel: null,
  selectedBright : null
  };
  _onViewportChange = viewport =>
  this.setState({
    viewport: {...this.state.viewport, ...viewport}
  });

  _goToViewport = ({longitude, latitude}) => {
    this._onViewportChange({
      longitude,
      latitude,
      zoom: 15,
      pitch: 35,
      bearing: 0,
      easing: function (t) { return t; },
      //speed: 0.2, // make the flying slow
      curve: 1, // change the speed at which it zooms out
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 3000
    });
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
    if (this.state.hotels_visibility){
      this.setState ({
        hotels_visibility: false });
    } else {
        this.setState ({
          hotels_visibility: true})

      }
    var request={
      location: this.state.userLocation,
      radius: 10000,
      keyword: 'hotel'
    }

    this.service.nearbySearch(request, this.getHotels);
  }

  getHotels = (x) => {
   // x.map(hotel=>console.log(hotel.geometry.location.lat(),hotel.geometry.location.lng()))
    this.setState({hotels:x})
  }

  handleClick = () => {
    if (this.state.events_visibility){
      this.setState ({
        events_visibility: false });
    } else {
        this.setState ({
          events_visibility: true})

      }


      let {lat, lng}=this.state.userLocation;
      let latlng=lat+","+lng
        // ticketUrl=ticketUrl+latlng
        // console.log('the tiecketmaster Url----')
        // console.log(ticketUrl)
      return fetch(ticketUrl+latlng)
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

  // event brite handler

  eventBrightSearch = () => {
    if (this.state.brites_visibility){
      this.setState ({
        brites_visibility: false });
    } else {
        this.setState ({
          brites_visibility: true})

      }



    let {lat, lng}=this.state.userLocation;
      let UrlParams=`&location.latitude=${lat}&location.longitude=${lng}`
      let Url=EventBrightUrl+UrlParams;
    return fetch(Url)
    .then((response) => response.json())
    .then((responseJson) => {
      console.log('the json. eventbrite api_____')
      const eventBrights = responseJson.events;
      console.log('parse through these')
      console.log(eventBrights[0].status)
      // console.log(responseJson.events[1].venue)
      //eventBrights.map(event=>console.log(event.venue.latitude, event.venue.longitude))
       this.setState({
         eventBrights,
         viewport: {
           ...this.state.viewport,
           latitude: Number(eventBrights[0].venue.latitude),
           longitude: Number(eventBrights[0].venue.longitude),
         }
       })
    })
    .catch((error) => {
      console.error(error);
    });
  }


  render() {
    const {viewport, settings} = this.state;

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

{this.state.hotels_visibility&&
  this.state.hotels.map((hotel, idx) => {
  return <Marker
    key={idx}
    longitude={Number(hotel.geometry.location.lng())}
    latitude={Number(hotel.geometry.location.lat())}


    // about line 268, you added the prop on an <img />
    // while they added it to the <ControlPanel /> component.
    // The warning message is right. The img component doesn't
    // "know" what to do with this prop

  >

    <img style={{width: 20, height: 20, borderRadius: '50%'}} src="https://png.pngtree.com/element_our/md/20180518/md_5afec7ed7dd4e.jpg"
    onClick={e => {
      timesClicked++;
      if (timesClicked>1){
        this.setState({
          modalVisibility: 'visible',
         selectedGoogleHotel: hotel
        })
        timesClicked=0;
      }else {
        this._goToViewport({
          longitude: hotel.geometry.location.lng(),
          latitude: hotel.geometry.location.lat()
        });
      }
     
        
       
      }}
    />
  </Marker>
})}

{/* _goToViewport = ({longitude, latitude}) => {
    this._onViewportChange({
      longitude,
      latitude,
      zoom: 11,
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 3000
    });
  }; */}



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



{this.state.events_visibility&&
       this.state.events.map((event, idx) => {
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
        })
}

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


          {/* this start */}

          {this.state.brites_visibility&&
            this.state.eventBrights.map((event, idx) => {
          return <Marker

            key={idx}
            longitude={Number(event.venue.longitude)}
            latitude={Number(event.venue.latitude)}
          >

              <img style={{width: 25, height: 25, borderRadius: ''}} src="eventbrite_logo.png"
                 onClick={e => {
                  e.preventDefault();
                   this.setState({modalVisibility: 'visible'})
                   this.setState({selectedBright: event})
                  }}
              />

          </Marker>
        })}

        {this.state.selectedBright ? (
          <Modal
            britestatus={this.state.selectedBright.status}
            britename={this.state.selectedBright.name.text}
            onCloseRequest={() => {
            console.log('closed')
            this.setState({selectedBright: null})
            this.setState({modalVisibility: 'hidden'});
            }} modalVisibility = {this.state.modalVisibility}
          />
          ) : null}




		    <Button style={buttonStyles} color="warning" onClick={this.searchIt}><img src="/chrome.svg" style={{marginRight:'0.3rem', width:'23px'}} alt="google Icon" />Google hotels ({this.state.hotels.length})</Button>
        <Button style={buttonStyles} color="primary" onClick={this.eventBrightSearch}><img  style={{marginRight:'0.3rem', width:'23px'}} src="/e.png" alt="eventbrite Icon" />EventBrite ({this.state.eventBrights.length})</Button>
        <Button style={buttonStyles} color="light" onClick={this.handleClick}><img src="/t.png" style={{transform: 'translateY(-50%)', position:'absolute', top:'50%', width:'23px'}} alt="ticketmaster Icon" />TicketMaster ({this.state.events.length})</Button>

      </MapGL>
    );
  }
}

export function renderToDom(container) {
  render(<App />, container);
}