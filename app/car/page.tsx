import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Car',
  description: 'See my car.',
}

export default function Page() {
  return (
    <section>
        <p className="mb-4">
            {`This is my sedan. It is tasteful and practical. I like the shape.`}
        </p>
        <img src="https://i.imgur.com/VzO984j.png"></img>
    </section>
  )
}
