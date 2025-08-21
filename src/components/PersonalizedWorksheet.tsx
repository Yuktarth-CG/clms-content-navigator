import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";
import WorksheetFormatEditor, { WorksheetFormat } from "./WorksheetFormatEditor";

// Mock types local to this flow to avoid coupling to backend types yet
type QuestionTypeOption = "MCQ" | "ShortAnswer" | "LongAnswer";
type MockStudent = {
  id: string;
  name: string;
  grade: number;
};
type MockSchool = {
  udise: string;
  name: string;
  address: string;
};
const mockFetchSchoolAndStudents = async (udise: string) => {
  // Simulate network
  await new Promise(r => setTimeout(r, 400));
  const school: MockSchool = {
    udise,
    name: "Springfield Public School",
    address: "742 Evergreen Terrace, Springfield"
  };
  const students: MockStudent[] = Array.from({
    length: 12
  }).map((_, i) => ({
    id: `stu-${i + 1}`,
    name: `Student ${i + 1}`,
    grade: 5
  }));
  const assessments = [{
    id: "assess-lep",
    name: "LEP Diagnostic Assessment"
  }, {
    id: "assess-mid",
    name: "Mid-term Diagnostic"
  }];
  return {
    school,
    students,
    assessments
  };
};
const questionTypeOptions: {
  key: QuestionTypeOption;
  label: string;
}[] = [{
  key: "MCQ",
  label: "Multiple Choice"
}, {
  key: "ShortAnswer",
  label: "Short Answer"
}, {
  key: "LongAnswer",
  label: "Long Answer"
}];
type DifficultyOption = "Easy" | "Medium" | "Hard";
type LOConfig = {
  loCode: string;
  label: string;
  types: QuestionTypeOption[];
  count: number;
  difficulty: DifficultyOption;
};
const mockFetchAssessmentLOs = async (assessmentId: string): Promise<LOConfig[]> => {
  // Simulate network
  await new Promise(r => setTimeout(r, 200));
  const base: LOConfig[] = [{
    loCode: "LO-101",
    label: "Place value and numeration",
    types: ["MCQ"],
    count: 5,
    difficulty: "Easy"
  }, {
    loCode: "LO-205",
    label: "Addition and subtraction word problems",
    types: ["MCQ", "ShortAnswer"],
    count: 5,
    difficulty: "Medium"
  }, {
    loCode: "LO-309",
    label: "Fractions fundamentals",
    types: ["MCQ"],
    count: 5,
    difficulty: "Medium"
  }];
  if (assessmentId === "assess-lep") {
    return base;
  }
  return base.map((lo, i) => ({
    ...lo,
    loCode: `LO-${400 + i}`,
    difficulty: "Hard" as DifficultyOption
  }));
};
const Section = ({
  title,
  children,
  description
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) => <section className="space-y-3">
    <h2 className="text-xl font-semibold text-foreground">{title}</h2>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
    {children}
  </section>;
const StepHeader = ({
  step,
  label,
  Icon
}: {
  step: number;
  label: string;
  Icon: React.ComponentType<any>;
}) => <div className="flex items-center gap-3">
    <Badge variant="secondary" className="text-xs">Step {step}</Badge>
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4" />
      <span className="font-medium">{label}</span>
    </div>
  </div>;
const PersonalizedWorksheet: React.FC = () => {
  const {
    toast
  } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [udise, setUdise] = useState("");

  // Step 2
  const [selectedGrade, setSelectedGrade] = useState<string>("");

  // Step 3
  const [school, setSchool] = useState<MockSchool | null>(null);
  const [students, setStudents] = useState<MockStudent[]>([]);
  const [assessments, setAssessments] = useState<{
    id: string;
    name: string;
  }[]>([]);

  // Step 4
  const [selectedAssessment, setSelectedAssessment] = useState<string>("");

  // Step 5
  const [method, setMethod] = useState<"bulk" | "individual">("bulk");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Step 6 - New simplified format approach
  const [worksheetFormat, setWorksheetFormat] = useState<WorksheetFormat>({
    questionsPerLO: 5,
    allowedQuestionTypes: ["MCQ"],
    difficultyDistribution: {
      easy: 40,
      medium: 40,
      hard: 20
    }
  });
  const [loConfigs, setLoConfigs] = useState<LOConfig[]>([]);
  useEffect(() => {
    if (!selectedAssessment) return;
    mockFetchAssessmentLOs(selectedAssessment).then(setLoConfigs);
  }, [selectedAssessment]);
  const canGoNext = useMemo(() => {
    if (step === 1) return udise.trim().length >= 6;
    if (step === 2) return !!selectedGrade;
    if (step === 3) return !!school && students.length > 0;
    if (step === 4) return !!selectedAssessment;
    if (step === 5) return method === "bulk" ? students.length > 0 : selectedStudents.length > 0;
    if (step === 6) {
      if (loConfigs.length === 0) return false;
      return worksheetFormat.allowedQuestionTypes.length > 0 && worksheetFormat.questionsPerLO > 0;
    }
    return true;
  }, [step, udise, selectedGrade, school, students.length, selectedAssessment, selectedStudents.length, method, loConfigs, worksheetFormat]);
  const handleFetch = async () => {
    if (!udise || !selectedGrade) return;
    setLoading(true);
    try {
      const {
        school,
        students,
        assessments
      } = await mockFetchSchoolAndStudents(udise);
      setSchool(school);
      setStudents(students);
      setAssessments(assessments);
      toast({
        title: "Mock data loaded",
        description: `Found ${students.length} students for Grade ${selectedGrade} in UDISE ${udise}.`
      });
      setStep(3);
    } finally {
      setLoading(false);
    }
  };
  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };
  const handleGenerate = async () => {
    // In bulk mode, ensure all students are selected for generation
    if (method === "bulk") {
      setSelectedStudents(students.map(s => s.id));
    }
    const studentCount = method === "bulk" ? students.length : selectedStudents.length;
    const totalQs = worksheetFormat.questionsPerLO * loConfigs.length;
    toast({
      title: "Generating mock worksheets",
      description: `${studentCount} student(s), ${loConfigs.length} LOs, ${totalQs} questions/worksheet`
    });
    // Simulate generation
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    setStep(7);
  };
  const Summary = () => <div className="space-y-3 text-sm text-muted-foreground">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">UDISE: {udise}</Badge>
        <Badge variant="outline">Grade: {selectedGrade}</Badge>
        <Badge variant="outline">Assessment: {assessments.find(a => a.id === selectedAssessment)?.name}</Badge>
        <Badge variant="outline">Students: {method === "bulk" ? students.length : selectedStudents.length}</Badge>
        <Badge variant="outline">LOs: {loConfigs.length}</Badge>
      </div>
    </div>;
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span>Personalised Worksheet</span>
            <Badge variant="outline">Student-specific</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Create tailored worksheets per student using past assessment performance. This is a mock flow and does not call real APIs yet.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Step 1: UDISE */}
          {step === 1 && <Section title="Enter School UDISE" description="We will fetch mock school details and students for this UDISE.">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="udise">UDISE Code</Label>
                  <Input id="udise" placeholder="e.g. 27010100123" value={udise} onChange={e => setUdise(e.target.value)} />
                </div>
              </div>
            </Section>}

          {/* Step 2: Grade Selection */}
          {step === 2 && <Section title="Select Grade" description="Choose the grade for which you want to create worksheets.">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger className="w-full sm:w-[240px]">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background">
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                        <SelectItem key={grade} value={grade.toString()}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleFetch} disabled={loading || !selectedGrade || udise.trim().length < 6}>
                    Fetch Mock Data
                  </Button>
                </div>
              </div>
            </Section>}

          {/* Step 3: School & Students */}
          {step === 3 && <Section title="Review School & Students" description="Verify the mock school details and continue.">
              <div className="rounded-md border p-4 bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-medium text-foreground">{school?.name}</div>
                    <div className="text-sm text-muted-foreground">{school?.address}</div>
                    <div className="text-sm text-muted-foreground">Grade {selectedGrade}</div>
                  </div>
                  <Badge variant="secondary">{students.length} students</Badge>
                </div>
              </div>
            </Section>}

          {/* Step 4: Assessment selection */}
          {step === 4 && <Section title="Select Assessment" description="Choose the past assessment to base the personalised worksheets on.">
              <div className="space-y-2">
                <Label>Assessment</Label>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger className="w-full sm:w-[360px]">
                    <SelectValue placeholder="Choose assessment" />
                  </SelectTrigger>
                  {/* Ensure dropdown is opaque and on top */}
                  <SelectContent className="z-50 bg-background">
                    {assessments.map(a => <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </Section>}

          {/* Step 5: Student selection method */}
          {step === 5 && <Section title="Choose Students" description="Pick a method and select the students to include.">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <RadioGroup value={method} onValueChange={v => {
                const next = v as "bulk" | "individual";
                setMethod(next);
                if (next === "bulk") {
                  setSelectedStudents(students.map(s => s.id));
                } else {
                  setSelectedStudents([]);
                }
              }} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bulk" id="bulk" />
                      <Label htmlFor="bulk" className="cursor-pointer">Bulk Generation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual" className="cursor-pointer">Individual Selection</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  
                  {method === "individual" ? <div className="grid gap-2 sm:grid-cols-2">
                      {students.map(s => <label key={s.id} className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-muted/40">
                          <Checkbox checked={selectedStudents.includes(s.id)} onCheckedChange={() => toggleStudent(s.id)} />
                          <div className="leading-tight">
                            <div className="text-sm font-medium text-foreground">{s.name}</div>
                            <div className="text-xs text-muted-foreground">Grade {s.grade} • ID {s.id}</div>
                          </div>
                        </label>)}
                    </div> : <div className="rounded-md border p-3 bg-muted/20 text-sm text-muted-foreground">
                      Bulk mode is selected. Worksheets will be generated for all {students.length} students.
                    </div>}
                </div>
              </div>
            </Section>}

          {step === 6 && <Section title="Worksheet Format Configuration" description="Define the overall format that will be applied to all Learning Objectives in the worksheet.">
              <WorksheetFormatEditor 
                format={worksheetFormat}
                onChange={setWorksheetFormat}
                questionTypeOptions={questionTypeOptions}
                totalLOs={loConfigs.length}
              />
              <div className="pt-4">
                <Summary />
              </div>
            </Section>}

          {/* Step 7: Result summary (mock) */}
          {step === 7 && <Section title="Generation Complete (Mock)" description="Worksheets were generated locally in this demo. In production, PDFs will be saved to storage for download and printing.">
              <Summary />
              <div className="mt-4 grid gap-2">
                {selectedStudents.map(id => {
              const st = students.find(s => s.id === id)!;
              return <div key={id} className="flex items-center justify-between rounded-md border p-3">
                      <div className="text-sm">
                        <span className="font-medium text-foreground">{st.name}</span>
                        <span className="text-muted-foreground"> — Grade {st.grade}</span>
                      </div>
                      <Button variant="secondary" disabled title="Mock download disabled">
                        Download PDF (mock)
                      </Button>
                    </div>;
            })}
              </div>
            </Section>}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1 || loading}>
              Back
            </Button>
            {step < 6 && <Button onClick={() => setStep(s => s + 1)} disabled={!canGoNext || loading}>
                Next
              </Button>}
            {step === 6 && <Button onClick={handleGenerate} disabled={!canGoNext || loading}>
                Generate Worksheets (Mock)
              </Button>}
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default PersonalizedWorksheet;