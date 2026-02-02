import { 
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const AboutPage = () => {
  const values = [
    {
      name: 'Empowerment',
      description: 'We empower students to take control of their career journey with the right tools and insights.',
      icon: AcademicCapIcon,
    },
    {
      name: 'Connection',
      description: 'We connect talented students with amazing opportunities at leading companies.',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Growth',
      description: 'We foster continuous learning and skill development for long-term career success.',
      icon: ChartBarIcon,
    },
  ]

  const team = [
    {
      name: 'Alex Thompson',
      role: 'CEO & Founder',
      description: 'Passionate about education and technology with 10+ years in edtech.',
      avatar: 'AT',
    },
    {
      name: 'Sarah Martinez',
      role: 'Head of Product',
      description: 'Focused on creating intuitive user experiences that drive student success.',
      avatar: 'SM',
    },
    {
      name: 'David Kim',
      role: 'CTO',
      description: 'Building scalable technology to support thousands of students worldwide.',
      avatar: 'DK',
    },
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About InternTrack
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're on a mission to help students discover their potential and 
              launch successful careers through meaningful internships.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                InternTrack was founded with a simple goal: to bridge the gap 
                between education and employment. We believe every student deserves 
                the opportunity to gain real-world experience and build a successful career.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                Our platform combines skill assessment, career tracking, and 
                internship discovery to create a comprehensive ecosystem for student success.
              </p>
              <div className="space-y-3">
                {[
                  '10,000+ active students',
                  '500+ partner companies',
                  '85% success rate',
                  '2,000+ internships posted'
                ].map((stat) => (
                  <div key={stat} className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-success-500 mr-3" />
                    <span className="text-gray-700">{stat}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary-100 rounded-lg p-8 text-center">
              <AcademicCapIcon className="h-24 w-24 text-primary-600 mx-auto mb-4" />
              <p className="text-xl text-primary-800 font-medium">
                Empowering the next generation of professionals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.name} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-primary-100 rounded-full">
                    <value.icon className="h-12 w-12 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.name}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              The passionate people behind InternTrack
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="card p-6 text-center">
                <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join Our Community
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Be part of the movement that's transforming how students find internships.
          </p>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
