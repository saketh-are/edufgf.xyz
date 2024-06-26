import { Component } from 'react';
import Marquee from "react-fast-marquee";

// funny caring responsible smart father
class Qualities extends Component {
  render() {
    return (
        <div className="marquee">
        <Marquee className="marquee_inner">
            <div className="marquee_image" style={{width: 170}}>
              <img src="https://i.imgur.com/RQiR0YK.png"/>
            </div>

            <div className="marquee_image" style={{width: 150}}>
              <img src="https://i.imgur.com/QxNiBAS.png"/>
            </div>

            <div className="marquee_image" style={{width: 150}}>
              <img src="https://i.imgur.com/rWej2F5.png"/>
            </div>

            <div className="marquee_image" style={{width: 120}}>
              <img src="https://i.imgur.com/fbqmOeJ.png"/>
            </div>

            <div className="marquee_image" style={{width : 150}}>
              <img src="https://i.imgur.com/r0cYKwc.png"/>
            </div>
        </Marquee>
        </div>
    );
  }
}

export default Qualities;

