
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Question = {
  text: string;
  type: 'text' | 'multiple-choice';
  options?: string[];
  correctAnswer?: string;
  marks: number;
};

type AssessmentFormProps = {
  onSubmit: (
    title: string,
    description: string,
    dueDate: string,
    questions: Question[]
  ) => Promise<void>;
  onCancel: () => void;
};

const AssessmentForm = ({ onSubmit, onCancel }: AssessmentFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', type: 'text', marks: 1 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', type: 'text', marks: 1 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    } else {
      toast.error('Assessment must have at least one question');
    }
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    
    // Reset correctAnswer when changing from multiple-choice to text
    if (field === 'type' && value === 'text') {
      updatedQuestions[index].correctAnswer = undefined;
      updatedQuestions[index].options = undefined;
    }
    
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    const options = question.options || [];
    updatedQuestions[questionIndex] = {
      ...question,
      options: [...options, '']
    };
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    const options = [...(question.options || [])];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...question,
      options
    };
    
    // Update correctAnswer if it was this option
    if (question.correctAnswer === options[optionIndex]) {
      updatedQuestions[questionIndex].correctAnswer = value;
    }
    
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    const options = [...(question.options || [])];
    const removedOption = options[optionIndex];
    options.splice(optionIndex, 1);
    updatedQuestions[questionIndex] = {
      ...question,
      options,
      // Reset correctAnswer if it was the removed option
      correctAnswer: question.correctAnswer === removedOption ? undefined : question.correctAnswer
    };
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!dueDate) {
      toast.error('Due date is required');
      return;
    }
    
    // Validate questions
    const invalidQuestions = questions.filter(q => !q.text.trim());
    if (invalidQuestions.length > 0) {
      toast.error('All questions must have text');
      return;
    }
    
    // Validate multiple choice questions
    const invalidMCQuestions = questions.filter(q => 
      q.type === 'multiple-choice' && 
      (!q.options || q.options.length < 2 || q.options.some(opt => !opt.trim()))
    );
    
    if (invalidMCQuestions.length > 0) {
      toast.error('Multiple choice questions must have at least two non-empty options');
      return;
    }
    
    // Validate correct answers for multiple choice questions
    const missingCorrectAnswers = questions.filter(q => 
      q.type === 'multiple-choice' && !q.correctAnswer
    );
    
    if (missingCorrectAnswers.length > 0) {
      toast.error('All multiple choice questions must have a correct answer selected');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(
        title, 
        description, 
        dueDate.toISOString(), 
        questions
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Assessment Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="End of Term Assessment"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Instructions for students..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Select a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
                disabled={(date) => date < new Date()}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Questions</h3>
          <Button 
            type="button" 
            onClick={addQuestion} 
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="border p-4 rounded-md space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="font-medium">Question {qIndex + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-500 hover:text-red-700 h-8 px-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`q-${qIndex}-text`}>Question Text</Label>
              <Textarea
                id={`q-${qIndex}-text`}
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                placeholder="Enter your question here..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`q-${qIndex}-type`}>Question Type</Label>
                <select
                  id={`q-${qIndex}-type`}
                  value={question.type}
                  onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="text">Text Answer</option>
                  <option value="multiple-choice">Multiple Choice</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`q-${qIndex}-marks`}>Marks</Label>
                <Input
                  id={`q-${qIndex}-marks`}
                  type="number"
                  min="1"
                  value={question.marks}
                  onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            {question.type === 'multiple-choice' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addOption(qIndex)}
                    className="h-8"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Option
                  </Button>
                </div>

                {(question.options || []).map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="radio"
                        id={`q-${qIndex}-opt-${oIndex}-correct`}
                        name={`q-${qIndex}-correct`}
                        checked={question.correctAnswer === option}
                        onChange={() => updateQuestion(qIndex, 'correctAnswer', option)}
                        className="h-4 w-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="text-sm text-gray-500 mt-2">
                  Select the radio button next to the correct answer option
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Assessment'}
        </Button>
      </div>
    </form>
  );
};

export default AssessmentForm;
