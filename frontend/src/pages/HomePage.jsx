import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  AcademicCapIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const HomePage = () => {
  const { user } = useAuth()

  const features = [
    {
      name: 'Skill Tracking',
      description: 'Track your skills with proficiency levels and assessment scores.',
      icon: ChartBarIcon,
    },
    {
      name: 'Internship Discovery',
      description: 'Find the perfect internships based on your skills and preferences.',
      icon: AcademicCapIcon,
    },
    {
      name: 'Application Management',
      description: 'Keep track of all your applications and their status in one place.',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Career Analytics',
      description: 'Get insights into your career progress and skill development.',
      icon: UserGroupIcon,
    },
  ]

  const stats = [
    { name: 'Active Students', value: '10,000+' },
    { name: 'Partner Companies', value: '500+' },
    { name: 'Internships Posted', value: '2,000+' },
    { name: 'Success Rate', value: '85%' },
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      content: 'InternTrack helped me land my dream internship at a top tech company. The skill assessment feature was incredibly helpful!',
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Recruiter at TechCorp',
      content: 'We found amazing talent through InternTrack. The platform makes it easy to find candidates with the right skills.',
      avatar: 'MC',
    },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Track Your Skills,
              <br />
              Land Your Dream Internship
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              The comprehensive platform for students to track skills, find internships, 
              and manage applications all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3"
                  >
                    Get Started Free
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/about"
                    className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3"
                  >
                    Learn More
                  </Link>
                </>
              ) : (
                <Link
                  to={`/${user.role}/dashboard`}
                  className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div key={stat.name}>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to track your progress 
              and find the perfect opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="card p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary-100 rounded-full">
                    <feature.icon className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in minutes and accelerate your career
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                description: 'Sign up and build your profile with skills, education, and experience.',
              },
              {
                step: '2',
                title: 'Take Skill Assessments',
                description: 'Assess your skills and get personalized recommendations for improvement.',
              },
              {
                step: '3',
                title: 'Apply & Track',
                description: 'Find internships that match your profile and track your applications.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="card p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of students who have found their dream internships through InternTrack.
          </p>
          {!user && (
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Get Started Today
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage
