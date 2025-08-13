import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Local types to keep this component self-contained
export type QuestionTypeOption = "MCQ" | "ShortAnswer" | "LongAnswer";
export type DifficultyOption = "Easy" | "Medium" | "Hard";

export type LOConfig = {
  loCode: string;
  label: string;
  types: QuestionTypeOption[];
  count: number;
  difficulty: DifficultyOption;
};

interface Props {
  loConfigs: LOConfig[];
  onChange: (next: LOConfig[]) => void;
  questionTypeOptions: { key: QuestionTypeOption; label: string }[];
}

const PerLOFormatEditor: React.FC<Props> = ({ loConfigs, onChange, questionTypeOptions }) => {
  const toggleType = (index: number, key: QuestionTypeOption) => {
    const next = [...loConfigs];
    const current = next[index];
    next[index] = {
      ...current,
      types: current.types.includes(key)
        ? current.types.filter((k) => k !== key)
        : [...current.types, key],
    };
    onChange(next);
  };

  const updateCount = (index: number, value: number) => {
    const next = [...loConfigs];
    next[index] = { ...next[index], count: Math.max(1, value) };
    onChange(next);
  };

  const updateDifficulty = (index: number, value: DifficultyOption) => {
    const next = [...loConfigs];
    next[index] = { ...next[index], difficulty: value };
    onChange(next);
  };

  if (loConfigs.length === 0) {
    return <p className="text-sm text-muted-foreground">No LOs found for this assessment (mock).</p>;
  }

  return (
    <div className="space-y-4">
      {loConfigs.map((lo, idx) => (
        <div key={lo.loCode} className="rounded-md border p-4 space-y-3 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-foreground">
              {lo.loCode} — {lo.label}
            </div>
            <Badge variant="secondary">Difficulty: {lo.difficulty}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Question Types</Label>
              <div className="space-y-2">
                {questionTypeOptions.map((opt) => (
                  <label key={opt.key} className="flex items-center gap-2">
                    <Checkbox
                      checked={lo.types.includes(opt.key)}
                      onCheckedChange={() => toggleType(idx, opt.key)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Input
                type="number"
                min={1}
                value={lo.count}
                onChange={(e) => updateCount(idx, Number(e.target.value || 1))}
                className="w-32"
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={lo.difficulty} onValueChange={(v) => updateDifficulty(idx, v as DifficultyOption)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerLOFormatEditor;
