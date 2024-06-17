import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Sedan',
  description: 'See my car.',
}

export default function Page() {
  return (
    <section>
        <p className="mb-4">
            {`I think mine quite nice. I like the shape.`}
        </p>
        <img src="https://i.imgur.com/VzO984j.png"></img>
    </section>
  )
}
