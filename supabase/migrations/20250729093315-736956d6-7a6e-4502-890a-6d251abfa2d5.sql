-- Add comprehensive CBSE Class 12 subjects, chapters, and learning outcomes
-- This migration adds real CBSE curriculum data for testing the assessment system

-- Create subjects table for CBSE Class 12
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  medium TEXT NOT NULL DEFAULT 'English',
  board TEXT NOT NULL DEFAULT 'CBSE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapters table
CREATE TABLE IF NOT EXISTS public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id),
  chapter_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  unit_name TEXT,
  marks_weightage INTEGER,
  periods INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning outcomes table
CREATE TABLE IF NOT EXISTS public.learning_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id),
  outcome_text TEXT NOT NULL,
  bloom_level INTEGER NOT NULL CHECK (bloom_level >= 1 AND bloom_level <= 6),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_outcomes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (educational content should be accessible to all)
CREATE POLICY "Subjects are publicly readable" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Chapters are publicly readable" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Learning outcomes are publicly readable" ON public.learning_outcomes FOR SELECT USING (true);

-- Insert CBSE Class 12 Physics
INSERT INTO public.subjects (name, grade, medium, board) VALUES 
('Physics', 12, 'English', 'CBSE');

-- Get the Physics subject ID for reference
DO $$
DECLARE
    physics_id UUID;
    electrostatics_id UUID;
    current_electricity_id UUID;
    magnetic_effects_id UUID;
    electromagnetic_induction_id UUID;
    optics_id UUID;
    modern_physics_id UUID;
BEGIN
    SELECT id INTO physics_id FROM public.subjects WHERE name = 'Physics' AND grade = 12;
    
    -- Insert Physics chapters
    INSERT INTO public.chapters (subject_id, chapter_number, name, unit_name, marks_weightage, periods) VALUES
    (physics_id, 1, 'Electric Charges and Fields', 'Electrostatics', 8, 13),
    (physics_id, 2, 'Electrostatic Potential and Capacitance', 'Electrostatics', 8, 13),
    (physics_id, 3, 'Current Electricity', 'Current Electricity', 8, 18),
    (physics_id, 4, 'Moving Charges and Magnetism', 'Magnetic Effects of Current and Magnetism', 9, 13),
    (physics_id, 5, 'Magnetism and Matter', 'Magnetic Effects of Current and Magnetism', 8, 12),
    (physics_id, 6, 'Electromagnetic Induction', 'Electromagnetic Induction and Alternating Currents', 8, 12),
    (physics_id, 7, 'Alternating Current', 'Electromagnetic Induction and Alternating Currents', 8, 12),
    (physics_id, 8, 'Ray Optics and Optical Instruments', 'Optics', 9, 14),
    (physics_id, 9, 'Wave Optics', 'Optics', 8, 12),
    (physics_id, 10, 'Dual Nature of Radiation and Matter', 'Modern Physics', 4, 8),
    (physics_id, 11, 'Atoms', 'Modern Physics', 3, 6),
    (physics_id, 12, 'Nuclei', 'Modern Physics', 3, 6),
    (physics_id, 13, 'Semiconductor Electronics', 'Modern Physics', 7, 14);
    
    -- Get chapter IDs
    SELECT id INTO electrostatics_id FROM public.chapters WHERE subject_id = physics_id AND chapter_number = 1;
    SELECT id INTO current_electricity_id FROM public.chapters WHERE subject_id = physics_id AND chapter_number = 3;
    SELECT id INTO magnetic_effects_id FROM public.chapters WHERE subject_id = physics_id AND chapter_number = 4;
    SELECT id INTO electromagnetic_induction_id FROM public.chapters WHERE subject_id = physics_id AND chapter_number = 6;
    SELECT id INTO optics_id FROM public.chapters WHERE subject_id = physics_id AND chapter_number = 8;
    SELECT id INTO modern_physics_id FROM public.chapters WHERE subject_id = physics_id AND chapter_number = 10;
    
    -- Insert learning outcomes for key chapters
    INSERT INTO public.learning_outcomes (chapter_id, outcome_text, bloom_level) VALUES
    (electrostatics_id, 'Understand the concept of electric charge and its properties', 2),
    (electrostatics_id, 'Apply Coulombs law to calculate force between charges', 3),
    (electrostatics_id, 'Analyze electric field patterns and field lines', 4),
    (current_electricity_id, 'Understand Ohms law and electrical resistance', 2),
    (current_electricity_id, 'Apply Kirchhoffs laws to solve circuit problems', 3),
    (current_electricity_id, 'Evaluate power dissipation in electrical circuits', 5),
    (magnetic_effects_id, 'Understand magnetic field due to current-carrying conductors', 2),
    (magnetic_effects_id, 'Apply Biot-Savart law and Amperes law', 3),
    (electromagnetic_induction_id, 'Understand Faradays laws of electromagnetic induction', 2),
    (electromagnetic_induction_id, 'Apply Lenzs law to determine direction of induced current', 3),
    (optics_id, 'Understand laws of reflection and refraction', 2),
    (optics_id, 'Apply lens formula and mirror formula', 3),
    (modern_physics_id, 'Understand photoelectric effect and wave-particle duality', 2),
    (modern_physics_id, 'Analyze Bohrs atomic model and energy levels', 4);
END $$;

-- Insert CBSE Class 12 Chemistry
INSERT INTO public.subjects (name, grade, medium, board) VALUES 
('Chemistry', 12, 'English', 'CBSE');

DO $$
DECLARE
    chemistry_id UUID;
    solid_state_id UUID;
    solutions_id UUID;
    electrochemistry_id UUID;
    chemical_kinetics_id UUID;
    organic_id UUID;
BEGIN
    SELECT id INTO chemistry_id FROM public.subjects WHERE name = 'Chemistry' AND grade = 12;
    
    -- Insert Chemistry chapters
    INSERT INTO public.chapters (subject_id, chapter_number, name, unit_name, marks_weightage, periods) VALUES
    (chemistry_id, 1, 'The Solid State', 'Physical Chemistry', 4, 10),
    (chemistry_id, 2, 'Solutions', 'Physical Chemistry', 5, 12),
    (chemistry_id, 3, 'Electrochemistry', 'Physical Chemistry', 5, 12),
    (chemistry_id, 4, 'Chemical Kinetics', 'Physical Chemistry', 5, 12),
    (chemistry_id, 5, 'Surface Chemistry', 'Physical Chemistry', 4, 8),
    (chemistry_id, 6, 'General Principles and Processes of Isolation of Elements', 'Inorganic Chemistry', 3, 8),
    (chemistry_id, 7, 'The p-Block Elements', 'Inorganic Chemistry', 8, 14),
    (chemistry_id, 8, 'The d- and f-Block Elements', 'Inorganic Chemistry', 5, 12),
    (chemistry_id, 9, 'Coordination Compounds', 'Inorganic Chemistry', 3, 8),
    (chemistry_id, 10, 'Haloalkanes and Haloarenes', 'Organic Chemistry', 4, 10),
    (chemistry_id, 11, 'Alcohols, Phenols and Ethers', 'Organic Chemistry', 4, 10),
    (chemistry_id, 12, 'Aldehydes, Ketones and Carboxylic Acids', 'Organic Chemistry', 6, 12),
    (chemistry_id, 13, 'Amines', 'Organic Chemistry', 4, 10),
    (chemistry_id, 14, 'Biomolecules', 'Organic Chemistry', 4, 10),
    (chemistry_id, 15, 'Polymers', 'Organic Chemistry', 3, 8),
    (chemistry_id, 16, 'Chemistry in Everyday Life', 'Organic Chemistry', 3, 8);
    
    -- Get some chapter IDs for learning outcomes
    SELECT id INTO solid_state_id FROM public.chapters WHERE subject_id = chemistry_id AND chapter_number = 1;
    SELECT id INTO solutions_id FROM public.chapters WHERE subject_id = chemistry_id AND chapter_number = 2;
    SELECT id INTO electrochemistry_id FROM public.chapters WHERE subject_id = chemistry_id AND chapter_number = 3;
    SELECT id INTO chemical_kinetics_id FROM public.chapters WHERE subject_id = chemistry_id AND chapter_number = 4;
    SELECT id INTO organic_id FROM public.chapters WHERE subject_id = chemistry_id AND chapter_number = 10;
    
    -- Insert learning outcomes
    INSERT INTO public.learning_outcomes (chapter_id, outcome_text, bloom_level) VALUES
    (solid_state_id, 'Understand different types of crystalline solids', 2),
    (solid_state_id, 'Calculate packing efficiency in crystal lattices', 3),
    (solutions_id, 'Understand colligative properties of solutions', 2),
    (solutions_id, 'Apply Raoults law and calculate vapor pressure', 3),
    (electrochemistry_id, 'Understand galvanic and electrolytic cells', 2),
    (electrochemistry_id, 'Calculate EMF using Nernst equation', 3),
    (chemical_kinetics_id, 'Understand rate laws and reaction mechanisms', 2),
    (chemical_kinetics_id, 'Analyze first and second order reactions', 4),
    (organic_id, 'Understand nomenclature of haloalkanes', 2),
    (organic_id, 'Apply SN1 and SN2 reaction mechanisms', 3);
END $$;

-- Insert CBSE Class 12 Mathematics  
INSERT INTO public.subjects (name, grade, medium, board) VALUES 
('Mathematics', 12, 'English', 'CBSE');

DO $$
DECLARE
    math_id UUID;
    relations_id UUID;
    calculus_id UUID;
    probability_id UUID;
    vectors_id UUID;
BEGIN
    SELECT id INTO math_id FROM public.subjects WHERE name = 'Mathematics' AND grade = 12;
    
    -- Insert Mathematics chapters
    INSERT INTO public.chapters (subject_id, chapter_number, name, unit_name, marks_weightage, periods) VALUES
    (math_id, 1, 'Relations and Functions', 'Relations and Functions', 8, 30),
    (math_id, 2, 'Inverse Trigonometric Functions', 'Relations and Functions', 4, 15),
    (math_id, 3, 'Matrices', 'Algebra', 6, 25),
    (math_id, 4, 'Determinants', 'Algebra', 4, 25),
    (math_id, 5, 'Continuity and Differentiability', 'Calculus', 15, 40),
    (math_id, 6, 'Application of Derivatives', 'Calculus', 10, 20),
    (math_id, 7, 'Integrals', 'Calculus', 10, 20),
    (math_id, 8, 'Application of Integrals', 'Calculus', 8, 15),
    (math_id, 9, 'Differential Equations', 'Calculus', 6, 15),
    (math_id, 10, 'Vector Algebra', 'Vectors and 3D Geometry', 8, 15),
    (math_id, 11, 'Three Dimensional Geometry', 'Vectors and 3D Geometry', 6, 15),
    (math_id, 12, 'Linear Programming', 'Linear Programming', 5, 20),
    (math_id, 13, 'Probability', 'Probability', 8, 30);
    
    -- Get chapter IDs for learning outcomes
    SELECT id INTO relations_id FROM public.chapters WHERE subject_id = math_id AND chapter_number = 1;
    SELECT id INTO calculus_id FROM public.chapters WHERE subject_id = math_id AND chapter_number = 5;
    SELECT id INTO probability_id FROM public.chapters WHERE subject_id = math_id AND chapter_number = 13;
    SELECT id INTO vectors_id FROM public.chapters WHERE subject_id = math_id AND chapter_number = 10;
    
    -- Insert learning outcomes
    INSERT INTO public.learning_outcomes (chapter_id, outcome_text, bloom_level) VALUES
    (relations_id, 'Understand types of relations and functions', 2),
    (relations_id, 'Apply composition and inverse of functions', 3),
    (calculus_id, 'Understand continuity and differentiability of functions', 2),
    (calculus_id, 'Apply rules of differentiation', 3),
    (calculus_id, 'Analyze critical points and optimization problems', 4),
    (probability_id, 'Understand conditional probability and independence', 2),
    (probability_id, 'Apply Bayes theorem in probability problems', 3),
    (vectors_id, 'Understand vector operations and properties', 2),
    (vectors_id, 'Apply dot and cross products of vectors', 3);
END $$;

-- Insert CBSE Class 12 Biology
INSERT INTO public.subjects (name, grade, medium, board) VALUES 
('Biology', 12, 'English', 'CBSE');

DO $$
DECLARE
    biology_id UUID;
    reproduction_id UUID;
    genetics_id UUID;
    evolution_id UUID;
    ecology_id UUID;
BEGIN
    SELECT id INTO biology_id FROM public.subjects WHERE name = 'Biology' AND grade = 12;
    
    -- Insert Biology chapters
    INSERT INTO public.chapters (subject_id, chapter_number, name, unit_name, marks_weightage, periods) VALUES
    (biology_id, 1, 'Sexual Reproduction in Flowering Plants', 'Reproduction', 8, 12),
    (biology_id, 2, 'Human Reproduction', 'Reproduction', 8, 12),
    (biology_id, 3, 'Reproductive Health', 'Reproduction', 4, 6),
    (biology_id, 4, 'Principles of Inheritance and Variation', 'Genetics and Evolution', 7, 12),
    (biology_id, 5, 'Molecular Basis of Inheritance', 'Genetics and Evolution', 8, 12),
    (biology_id, 6, 'Evolution', 'Genetics and Evolution', 5, 10),
    (biology_id, 7, 'Human Health and Disease', 'Biology and Human Welfare', 6, 10),
    (biology_id, 8, 'Microbes in Human Welfare', 'Biology and Human Welfare', 6, 10),
    (biology_id, 9, 'Biotechnology Principles and Processes', 'Biotechnology', 6, 10),
    (biology_id, 10, 'Biotechnology and its Applications', 'Biotechnology', 6, 10),
    (biology_id, 11, 'Organisms and Populations', 'Ecology and Environment', 5, 8),
    (biology_id, 12, 'Ecosystem', 'Ecology and Environment', 5, 8);
    
    -- Get chapter IDs for learning outcomes
    SELECT id INTO reproduction_id FROM public.chapters WHERE subject_id = biology_id AND chapter_number = 1;
    SELECT id INTO genetics_id FROM public.chapters WHERE subject_id = biology_id AND chapter_number = 4;
    SELECT id INTO evolution_id FROM public.chapters WHERE subject_id = biology_id AND chapter_number = 6;
    SELECT id INTO ecology_id FROM public.chapters WHERE subject_id = biology_id AND chapter_number = 11;
    
    -- Insert learning outcomes
    INSERT INTO public.learning_outcomes (chapter_id, outcome_text, bloom_level) VALUES
    (reproduction_id, 'Understand the process of sexual reproduction in plants', 2),
    (reproduction_id, 'Analyze different types of pollination mechanisms', 4),
    (genetics_id, 'Understand Mendels laws of inheritance', 2),
    (genetics_id, 'Apply genetic crosses to predict offspring ratios', 3),
    (genetics_id, 'Evaluate inheritance patterns in human genetics', 5),
    (evolution_id, 'Understand theories of evolution', 2),
    (evolution_id, 'Analyze evidences of evolution', 4),
    (ecology_id, 'Understand population dynamics and interactions', 2),
    (ecology_id, 'Apply ecological principles to environmental problems', 3);
END $$;

-- Insert CBSE Class 12 Computer Science
INSERT INTO public.subjects (name, grade, medium, board) VALUES 
('Computer Science', 12, 'English', 'CBSE');

DO $$
DECLARE
    cs_id UUID;
    programming_id UUID;
    database_id UUID;
    networks_id UUID;
BEGIN
    SELECT id INTO cs_id FROM public.subjects WHERE name = 'Computer Science' AND grade = 12;
    
    -- Insert Computer Science chapters
    INSERT INTO public.chapters (subject_id, chapter_number, name, unit_name, marks_weightage, periods) VALUES
    (cs_id, 1, 'Functions', 'Computational Thinking and Programming', 6, 15),
    (cs_id, 2, 'File Handling', 'Computational Thinking and Programming', 6, 15),
    (cs_id, 3, 'Data Structure - Stacks', 'Computational Thinking and Programming', 6, 15),
    (cs_id, 4, 'Computer Networks', 'Computer Networks', 10, 15),
    (cs_id, 5, 'Database Concepts', 'Database Management', 8, 12),
    (cs_id, 6, 'Structured Query Language', 'Database Management', 7, 13);
    
    -- Get chapter IDs for learning outcomes
    SELECT id INTO programming_id FROM public.chapters WHERE subject_id = cs_id AND chapter_number = 1;
    SELECT id INTO database_id FROM public.chapters WHERE subject_id = cs_id AND chapter_number = 5;
    SELECT id INTO networks_id FROM public.chapters WHERE subject_id = cs_id AND chapter_number = 4;
    
    -- Insert learning outcomes
    INSERT INTO public.learning_outcomes (chapter_id, outcome_text, bloom_level) VALUES
    (programming_id, 'Understand the concept of functions in Python', 2),
    (programming_id, 'Apply function parameters and return values', 3),
    (programming_id, 'Create modular programs using functions', 6),
    (database_id, 'Understand database concepts and RDBMS', 2),
    (database_id, 'Apply normalization techniques', 3),
    (database_id, 'Design efficient database schemas', 6),
    (networks_id, 'Understand network topologies and protocols', 2),
    (networks_id, 'Analyze network security issues', 4);
END $$;

-- Insert CBSE Class 12 English
INSERT INTO public.subjects (name, grade, medium, board) VALUES 
('English', 12, 'English', 'CBSE');

DO $$
DECLARE
    english_id UUID;
    flamingo_id UUID;
    vistas_id UUID;
    writing_id UUID;
BEGIN
    SELECT id INTO english_id FROM public.subjects WHERE name = 'English' AND grade = 12;
    
    -- Insert English chapters
    INSERT INTO public.chapters (subject_id, chapter_number, name, unit_name, marks_weightage, periods) VALUES
    (english_id, 1, 'The Last Lesson', 'Flamingo - Prose', 4, 8),
    (english_id, 2, 'Lost Spring', 'Flamingo - Prose', 4, 8),
    (english_id, 3, 'Deep Water', 'Flamingo - Prose', 4, 8),
    (english_id, 4, 'The Rattrap', 'Flamingo - Prose', 4, 8),
    (english_id, 5, 'My Mother at Sixty-six', 'Flamingo - Poetry', 3, 6),
    (english_id, 6, 'Keeping Quiet', 'Flamingo - Poetry', 3, 6),
    (english_id, 7, 'A Thing of Beauty', 'Flamingo - Poetry', 3, 6),
    (english_id, 8, 'The Third Level', 'Vistas - Short Stories', 4, 8),
    (english_id, 9, 'The Tiger King', 'Vistas - Short Stories', 4, 8),
    (english_id, 10, 'Journey to the End of the Earth', 'Vistas - Short Stories', 4, 8),
    (english_id, 11, 'Writing Skills - Notice and Advertisement', 'Writing Skills', 5, 10),
    (english_id, 12, 'Writing Skills - Article and Speech', 'Writing Skills', 5, 10);
    
    -- Get chapter IDs for learning outcomes
    SELECT id INTO flamingo_id FROM public.chapters WHERE subject_id = english_id AND chapter_number = 1;
    SELECT id INTO vistas_id FROM public.chapters WHERE subject_id = english_id AND chapter_number = 8;
    SELECT id INTO writing_id FROM public.chapters WHERE subject_id = english_id AND chapter_number = 11;
    
    -- Insert learning outcomes
    INSERT INTO public.learning_outcomes (chapter_id, outcome_text, bloom_level) VALUES
    (flamingo_id, 'Understand themes of patriotism and cultural identity', 2),
    (flamingo_id, 'Analyze character development and narrative techniques', 4),
    (flamingo_id, 'Evaluate the authors perspective on social issues', 5),
    (vistas_id, 'Understand science fiction and fantasy elements', 2),
    (vistas_id, 'Analyze symbolism and metaphors in the story', 4),
    (writing_id, 'Understand formal writing formats', 2),
    (writing_id, 'Apply appropriate language and tone in writing', 3),
    (writing_id, 'Create effective communication pieces', 6);
END $$;

-- Create indexes for better performance
CREATE INDEX idx_chapters_subject_id ON public.chapters(subject_id);
CREATE INDEX idx_learning_outcomes_chapter_id ON public.learning_outcomes(chapter_id);
CREATE INDEX idx_subjects_grade_board ON public.subjects(grade, board);

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_outcomes_updated_at BEFORE UPDATE ON public.learning_outcomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();