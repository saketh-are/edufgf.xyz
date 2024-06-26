import { Component } from 'react';
import Marquee from "react-fast-marquee";

class Qualities extends Component {
  render() {
    return (
        <div className="marquee">
        <Marquee className="marquee_inner">
            <img src="https://i.imgur.com/MLFhjr5.png"/>
            <img src="https://i.imgur.com/kucaSD1.png"/>
            <img src="https://i.imgur.com/faPLBNF.png"/>
            <img src="https://i.imgur.com/qSqBrRo.png"/>
            <img src="https://i.imgur.com/TEj9r0q.png"/>
        </Marquee>
        </div>
    );
  }
}

export default Qualities;

