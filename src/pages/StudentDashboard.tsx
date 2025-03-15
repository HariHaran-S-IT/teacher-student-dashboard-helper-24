
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, GraduationCap } from 'lucide-react';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';

const StudentDashboard = () => {
  const { currentUser, logout, teachers } = useAuth();
  
  // Find the teacher that created this student
  const teacher = teachers.find(t => t.id === currentUser?.createdBy);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-1">
                Student Dashboard
              </h1>
              <p className="text-gray-500">
                Welcome, {currentUser?.name || 'Student'}
              </p>
            </div>
            
            <Button variant="outline" onClick={logout} className="shrink-0">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <AnimatedCard
              delay={0.1}
              header={
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                  <h2 className="text-xl font-medium">Your Profile</h2>
                </div>
              }
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{currentUser?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{currentUser?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teacher</p>
                  <p className="font-medium">{teacher?.name || 'Unknown Teacher'}</p>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard
              delay={0.2}
              header={
                <h2 className="text-xl font-medium">Welcome Note</h2>
              }
            >
              <div className="prose">
                <p>
                  Welcome to your student dashboard! This is where you'll be able to access your learning materials, 
                  assignments, and communicate with your teacher.
                </p>
                <p className="mt-4">
                  As we continue to develop this platform, more features will become available to enhance your learning experience.
                </p>
              </div>
            </AnimatedCard>
          </div>

          <AnimatedCard
            delay={0.3}
            header={
              <h2 className="text-xl font-medium">Coming Soon</h2>
            }
          >
            <div className="space-y-4">
              <p>Future features that will be added to your dashboard:</p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {[
                  "Assignment submissions",
                  "Grade tracking",
                  "Course materials",
                  "Discussion forums",
                  "Calendar and schedule",
                  "Direct messaging",
                  "Progress reports",
                  "Learning resources"
                ].map((feature, index) => (
                  <li 
                    key={index} 
                    className="reveal flex items-center p-3 rounded-md bg-gray-50"
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentDashboard;
