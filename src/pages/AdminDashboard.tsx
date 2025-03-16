
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Calendar, GraduationCap, Notebook, Users } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import PageTransition from '@/components/PageTransition';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { currentUser, getAllAssessments, getAllSubmissions, getAllStudents, teachers } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/unauthorized" />;
  }
  
  const allAssessments = getAllAssessments();
  const allSubmissions = getAllSubmissions();
  const allStudents = getAllStudents();
  
  // Filter assessments by search term
  const filteredAssessments = allAssessments.filter(
    assessment => assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter submissions by search term
  const filteredSubmissions = allSubmissions.filter(
    submission => {
      const assessment = allAssessments.find(a => a.id === submission.assessmentId);
      return assessment?.title.toLowerCase().includes(searchTerm.toLowerCase());
    }
  );
  
  // Filter students by search term
  const filteredStudents = allStudents.filter(
    student => student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Filter teachers by search term
  const filteredTeachers = teachers.filter(
    teacher => teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) && teacher.role === 'teacher'
  );
  
  return (
    <PageTransition>
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Manage all assessments, teachers, and students</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-md py-1 px-3 rounded-full">
              Admin: {currentUser.name}
            </Badge>
            <Button asChild>
              <Link to="/login">Logout</Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Teachers</p>
                  <p className="text-2xl font-bold">{teachers.filter(t => t.role === 'teacher').length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-bold">{allStudents.length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Assessments</p>
                  <p className="text-2xl font-bold">{allAssessments.length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Notebook className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Submissions</p>
                  <p className="text-2xl font-bold">{allSubmissions.length}</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Tabs defaultValue="assessments" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="teachers">Teachers</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="assessments" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>All Assessments</CardTitle>
                  <CardDescription>View all assessments created by teachers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Questions</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAssessments.length > 0 ? (
                          filteredAssessments.map((assessment) => {
                            const teacher = teachers.find(t => t.id === assessment.createdBy);
                            
                            return (
                              <TableRow key={assessment.id}>
                                <TableCell className="font-medium">{assessment.title}</TableCell>
                                <TableCell>{teacher?.name || 'Unknown Teacher'}</TableCell>
                                <TableCell>
                                  {format(new Date(assessment.dueDate), 'PPP')}
                                </TableCell>
                                <TableCell>{assessment.questions.length}</TableCell>
                                <TableCell>
                                  <Button asChild size="sm" variant="outline">
                                    <Link to={`/assessment/${assessment.id}`}>
                                      View Details
                                    </Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No assessments found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="students" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>All Students</CardTitle>
                  <CardDescription>View all students in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Teacher</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => {
                            const teacher = teachers.find(t => t.id === student.createdBy);
                            
                            return (
                              <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>{teacher?.name || 'Unknown Teacher'}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4">
                              No students found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="teachers" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>All Teachers</CardTitle>
                  <CardDescription>View all teachers in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Assessments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.length > 0 ? (
                        filteredTeachers.map((teacher) => {
                          const teacherStudents = allStudents.filter(s => s.createdBy === teacher.id);
                          const teacherAssessments = allAssessments.filter(a => a.createdBy === teacher.id);
                          
                          return (
                            <TableRow key={teacher.id}>
                              <TableCell className="font-medium">{teacher.name}</TableCell>
                              <TableCell>{teacher.email}</TableCell>
                              <TableCell>{teacherStudents.length}</TableCell>
                              <TableCell>{teacherAssessments.length}</TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            No teachers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="submissions" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>All Submissions</CardTitle>
                  <CardDescription>View all assessment submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Assessment</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Submitted At</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubmissions.length > 0 ? (
                          filteredSubmissions.map((submission) => {
                            const assessment = allAssessments.find(a => a.id === submission.assessmentId);
                            const student = allStudents.find(s => s.id === submission.studentId);
                            const totalMarks = assessment?.questions.reduce((sum, q) => sum + q.marks, 0) || 0;
                            
                            return (
                              <TableRow key={submission.id}>
                                <TableCell className="font-medium">{assessment?.title || 'Unknown Assessment'}</TableCell>
                                <TableCell>{student?.name || 'Unknown Student'}</TableCell>
                                <TableCell>
                                  {format(new Date(submission.submittedAt), 'PPP p')}
                                </TableCell>
                                <TableCell>
                                  {submission.isCompleted ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-amber-600">In Progress</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {submission.marksAwarded !== undefined ? (
                                    `${submission.marksAwarded}/${totalMarks}`
                                  ) : (
                                    submission.autoGradedMarks !== undefined ? (
                                      `${submission.autoGradedMarks}/${totalMarks} (Auto)`
                                    ) : (
                                      'Not Graded'
                                    )
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Button asChild size="sm" variant="outline">
                                    <Link to={`/assessment/${assessment?.id}`}>
                                      View Assessment
                                    </Link>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              No submissions found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminDashboard;
