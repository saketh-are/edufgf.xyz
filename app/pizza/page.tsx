"use client";

import Bounce from '../bounce/bounce';

export default function Page() {
  return (
    <section>
        <img src="https://i.imgur.com/29vhKyE.png"></img>
        <br/>
        <h2 className="mb-8 text-2xl font-semibold tracking-tighter">
          My Top Toppings
        </h2>
          
        <ul>
          <li>Calabresa</li>
          <li>Nutella</li>
          <li>Meat Lovers</li>
          <li>Catupiry</li>
        </ul>

        <Bounce src="https://i.imgur.com/Kl66188.gif" width="120px"/>
    </section>
  )
}
