"use client";

import Qualities from 'app/components/qualities'
import Bounce from './bounce/bounce';

export default function Page() {
  return (
    <section>
      <img src="https://i.imgur.com/3hrXJio.png" width="100%" center />
      <br/>

      <h1 className="mb-8 text-3xl font-semibold tracking-tighter">
        eduardo felipe gama ferreira
      </h1>

      <Qualities/>

      <Bounce src="https://i.imgur.com/iDH6Yjw.gif" />
    </section>
  )
}
