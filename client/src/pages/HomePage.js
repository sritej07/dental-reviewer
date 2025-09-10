import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, BarChart3, FileText, Shield, Clock, Users } from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Upload dental photos quickly and securely with our simple interface'
    },
    {
      icon: BarChart3,
      title: 'Professional Review',
      description: 'Qualified professionals review and annotate your submissions'
    },
    {
      icon: FileText,
      title: 'Detailed Reports',
      description: 'Receive comprehensive reports with treatment recommendations'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your medical information is protected with enterprise-grade security'
    },
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description: 'Get your results quickly with our efficient review process'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Reviewed by qualified dental professionals'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-16">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight">
            Professional Oral Health
            <span className="text-blue-600 block">Screening Service</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload your dental photos for professional review and receive comprehensive 
            reports with personalized treatment recommendations from qualified experts.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {user ? (
            <>
              {user.role === 'patient' ? (
                <>
                  <Link to="/upload" className="btn-primary text-lg px-8 py-4">
                    <Upload size={20} />
                    Upload Photos
                  </Link>
                  <Link to="/dashboard" className="btn-secondary text-lg px-8 py-4">
                    <BarChart3 size={20} />
                    View Dashboard
                  </Link>
                </>
              ) : (
                <Link to="/admin" className="btn-primary text-lg px-8 py-4">
                  <BarChart3 size={20} />
                  Admin Dashboard
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-lg px-8 py-4">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4">
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Why Choose Our Service?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide professional, secure, and comprehensive oral health screening 
            services with fast turnaround times.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <feature.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white rounded-2xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Simple steps to get your oral health screening
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Upload</h3>
            <p className="text-gray-600">
              Upload clear photos of your teeth along with basic information
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Review</h3>
            <p className="text-gray-600">
              Our dental professionals review and annotate your images
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Report</h3>
            <p className="text-gray-600">
              Receive a comprehensive PDF report with recommendations
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl text-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of patients who trust our professional oral health 
              screening service for their dental care needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register" className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold transition-colors">
                Create Free Account
              </Link>
              <Link to="/login" className="border border-white text-white hover:bg-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;