import Navigation from '@/components/Navigation'
import Link from 'next/link'
import ReadingNow from '@/components/ReadingNow'
import FollowJourney from '@/components/FollowJourney'
import { postsApi } from '@/lib/api'

export default function HomePage() {
  // Server-side fetch of posts to pass into the client component
  const allPosts = postsApi.getPublished()

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Full-screen Hero */}
      <section className="relative h-screen w-full bg-gray-800 overflow-hidden">
  {/* Background image (blurred) */}
  <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/drgot7znf/image/upload/v1759731839/photo-1758270704925-fa59d93119c1_kjdvqg.jpg"
            alt="Students studying"
            className="w-full h-full object-cover filter blur-sm brightness-75"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

  <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-start lg:items-center relative z-10">
          <div className="w-full grid grid-cols-12 gap-6 items-center">
            {/* Left Hero (Main content) */}
            <div className="col-span-12 lg:col-span-7 xl:col-span-7 pb-8 lg:pb-0">
              <div className="max-w-2xl text-white">
                <div className="inline-block mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#EF623C] text-white text-sm font-medium">
                    Featured Article
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
                  UK University Applications 2024: Complete Step-by-Step Guide
                </h1>

                <p className="text-lg md:text-xl text-white/90 mb-6">
                  Get the insider secrets that helped 15,000+ students secure their dream university places. Everything from UCAS to interviews covered.
                </p>

                <div className="flex flex-wrap items-center text-white/90 gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Dec 15, 2024</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">12 min read</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm">Dr. Mitchell</span>
                  </div>
                </div>

                <div className="mt-6">
                  <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-md bg-[#EF623C] text-white font-medium shadow hover:opacity-95">
                    Read Full Article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>

                {/* Mobile CTA - moved inside left hero so it stacks under content on small screens */}
                <div className="block lg:hidden mt-6">
                  <div className="w-full bg-[#F8FAFC] rounded-xl shadow p-4">
                    <h4 className="text-md font-semibold text-gray-900 text-center">Get Your Free University Success Kit</h4>
                    <p className="text-sm text-gray-600 text-center">Download our complete application guide + scholarship database</p>
                    <form className="mt-3 space-y-2">
                      <input aria-label="First name" type="text" placeholder="Your first name" className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white placeholder-gray-400" />
                      <input aria-label="Email address" type="email" placeholder="Your email address" className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white placeholder-gray-400" />
                      <button type="button" className="w-full mt-1 px-4 py-2 rounded-md bg-[#EF623C] text-white font-semibold">Send Me The Success Kit</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
           
            {/* Right-middle overlay form (will appear over hero) */}
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 relative">
              <div className="hidden lg:block">
                <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-[360px] bg-[#F8FAFC] rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 text-center">Get Your Free University Success Kit</h3>
                  <p className="text-sm text-gray-600 mt-2 text-center">Download our complete application guide + scholarship database</p>

                  <form className="mt-4 space-y-3">
                    <input type="text" placeholder="Your first name" className="w-full px-4 py-2 rounded-md border border-gray-200 bg-white placeholder-gray-400" />
                    <input type="email" placeholder="Your email address" className="w-full px-4 py-2 rounded-md border border-gray-200 bg-white placeholder-gray-400" />
                    <button type="button" className="w-full mt-2 px-4 py-2 rounded-md bg-[#EF623C] text-white font-semibold">Send Me The Success Kit</button>
                  </form>

                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#EF623C]">
                      {/* stars */}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="#EF623C" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"/>
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm text-gray-700 mt-2">4.9/5 rating from 2,847 students</div>
                  </div>
                </div>
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

  <ReadingNow initialPosts={allPosts} />

  <FollowJourney />

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            <p>&copy; UAPP</p>
          </div>
        </div>
      </footer>
    </div>
  )
}