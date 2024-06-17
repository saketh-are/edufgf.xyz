import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Pizza',
  description: 'The secret to a good life',
}

export default function Page() {
  return (
    <section>
        <h2 className="mb-8 text-2xl font-semibold tracking-tighter">
          My Top Toppings
        </h2>
        <p className="mb-4">
          <ul>
            <li>Calabresa</li>
            <li>Nutella</li>
            <li>Catupiry</li>
          </ul>
        </p>
    </section>
  )
}
