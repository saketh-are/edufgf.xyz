import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: 'Dj Dudino',
  description: 'See my car.',
}

export default function Page() {
  return (
    <section>
     <div>
     <iframe width="560" height="315" src="https://www.youtube.com/embed/fF8iStlHOrM?si=rm0dOD1Yu7pLP-hd" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
     </div>
    </section>
  )
}
