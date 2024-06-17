import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Pizza',
  description: 'The secret to a good life',
}

export default function Page() {
  return (
    <section>
        <p className="mb-4">
            {`I think mine quite nice. I like the shape.`}
        </p>
    </section>
  )
}
