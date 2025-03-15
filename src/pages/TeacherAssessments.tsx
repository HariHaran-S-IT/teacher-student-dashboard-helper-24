
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, ListChecks, Users } from 'lucide-react';
import AnimatedCard from '@/components/AnimatedCard';
import PageTransition from '@/components/PageTransition';
import AssessmentForm from '@/components/AssessmentForm';
import { format, isPast } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const TeacherAssessments = () => {
  const { currentUser, getTeacherAssessments, createAssessment } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const teacherAssessments = currentUser 
    ? getTeacherAssessments(currentUser.id)
    : [];

  const filteredAssessments = teacherAssessments.filter(
    assessment => 
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    // Sort by due date (upcoming first)
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleCreateAssessment = async (
    title: string,
    description: string,
    dueDate: string,
    questions: any[]
  ) => {
    await createAssessment(title, description, dueDate, questions);
    setIsDialogOpen(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-1">
                Assessments
              </h1>
              <p className="text-gray-500">
                Create and manage assessments for your students
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                asChild 
                className="shrink-0"
              >
                <Link to="/teacher-dashboard">
                  <Users className="h-4 w-4 mr-2" /> Students
                </Link>
              </Button>
              
              <Button onClick={() => setIsDialogOpen(true)} className="shrink-0">
                <FileText className="h-4 w-4 mr-2" /> Create Assessment
              </Button>
            </div>
          </header>

          <div className="mb-6">
            <div className="relative w-full sm:w-80">
              <Input
                placeholder="Search assessments"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <AnimatedCard contentClassName="p-0" delay={0.2}>
            {sortedAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {sortedAssessments.map((assessment) => {
                  const isOverdue = isPast(new Date(assessment.dueDate));
                  
                  return (
                    <div 
                      key={assessment.id} 
                      className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <h3 className="font-medium text-lg mb-2 truncate">{assessment.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                          {assessment.description || "No description provided"}
                        </p>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className={`${isOverdue ? 'text-red-500' : ''}`}>
                            Due: {format(new Date(assessment.dueDate), 'PPP')}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <ListChecks className="h-4 w-4 mr-2" />
                          <span>{assessment.questions.length} Questions</span>
                        </div>
                        
                        <Button 
                          asChild 
                          className="w-full"
                        >
                          <Link to={`/assessment/${assessment.id}`}>
                            View Assessment
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No assessments found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? "No assessments match your search criteria"
                    : "You haven't created any assessments yet"}
                </p>
                {searchQuery ? (
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                ) : (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Create Your First Assessment
                  </Button>
                )}
              </div>
            )}
          </AnimatedCard>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Assessment</DialogTitle>
          </DialogHeader>
          
          <AssessmentForm 
            onSubmit={handleCreateAssessment}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

export default TeacherAssessments;
