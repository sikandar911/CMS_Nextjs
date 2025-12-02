import Link from 'next/link'
import ReadingNow from '@/components/ReadingNow'
import FollowJourney from '@/components/FollowJourney'
import { postsApi } from '@/lib/api'
import BlogSlider from '@/components/BlogSlider'
import UniversityKitForm from '@/components/UniversityKitForm'

export default async function HomePage() {
  // Server-side fetch of posts to pass into the client component
  const allPosts = await postsApi.getPublished()

  return (
    <div className="min-h-screen bg-white">

      {/* Full-screen Hero */}
      {/* move the hero up so its background sits under the fixed transparent header */}
      <section className="relative h-[70vh] md:h-[75vh] lg:h-screen w-full bg-gray-800 overflow-hidden -mt-20">
  {/* Background image (blurred) */}
  <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/drgot7znf/image/upload/v1759731839/photo-1758270704925-fa59d93119c1_kjdvqg.jpg"
            alt="Students studying"
            className="w-full h-full object-cover filter blur-sm brightness-75"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

  <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end lg:items-center relative z-10">
          <div className="w-full grid grid-cols-12 gap-6 items-end lg:items-center pb-4 lg:pb-0">
            {/* Left Hero (Main content) */}
            <div className="col-span-12 block lg:hidden pt-4 mt-4" />
            <div className="col-span-12 lg:col-span-7 xl:col-span-7 pb-0 lg:pb-0 pt-6 sm:pt-20">
              <div className="max-w-2xl text-white ">
                
                {/* blog slider  */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
                  Blogs, Updates and News
                </h1>

                <p className="text-lg md:text-xl text-white/90 mb-0 lg:mb-6">
                  Keep yourself updated about latest developments in higher education industry through our range of articles and news updates.
                </p>
                <div className="inline-block mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EF623C] text-white text-sm font-medium">
                    Featured Articles
                  </span>
                </div>
            

                {/* Blog slider (client component) */}
                <BlogSlider posts={allPosts} />
              {/* blog slider  end */}
              </div>
            </div>
           
            {/* Right-middle overlay form (will appear over hero) */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 relative">
              <div className="hidden lg:block">
                <UniversityKitForm variant="desktop" />
              </div>
            </div>
            {/* Sidebar (far right) - visible on large screens */}
            <aside className="hidden xl:block col-span-12 xl:col-span-1">
              <div className="w-56 ml-auto bg-[#1C334D] rounded-2xl p-4 text-white shadow-lg">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold">150+</div>
                  <div className="text-sm text-white/80">Downloads today</div>
                </div>

                <div className="flex -space-x-3 justify-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs border-2 border-white">S</div>
                  <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs border-2 border-white">M</div>
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs border-2 border-white">A</div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs border-2 border-white">J</div>
                </div>
                <div className="text-center text-sm underline text-white/90 mb-3">Join students downloading now</div>

                <div className="text-sm text-white/80">
                  <div className="mb-2">Recent Downloads:</div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 mt-2" />
                      <div className="text-xs">Sarah from London - 2min ago</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 mt-2" />
                      <div className="text-xs">Marcus from Manchester - 10min ago</div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 mt-2" />
                      <div className="text-xs">Aisha from Birmingham - 25min ago</div>
                    </li>
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Mobile CTA Section - Only visible on mobile/small screens */}
      <section className="lg:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <UniversityKitForm variant="mobile" />
        </div>
      </section>
  <ReadingNow initialPosts={allPosts} />
    </div>
  )
}