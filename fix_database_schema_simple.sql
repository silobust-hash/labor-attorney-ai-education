-- Simple Database Schema Fix for Supabase
-- Run this in Supabase SQL Editor

-- 1. Create AI tools table
DROP TABLE IF EXISTS ai_tools CASCADE;
CREATE TABLE ai_tools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    advantages TEXT[] DEFAULT '{}',
    disadvantages TEXT[] DEFAULT '{}',
    practical_usage TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add YouTube URL column to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- 3. Add required columns to user_enrollments
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_enrollments ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Fix foreign key constraints
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_user_id_fkey;
ALTER TABLE user_enrollments DROP CONSTRAINT IF EXISTS user_enrollments_approved_by_fkey;

ALTER TABLE user_enrollments 
ADD CONSTRAINT user_enrollments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_enrollments 
ADD CONSTRAINT user_enrollments_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES users(id);

-- 5. Make all courses published
UPDATE courses SET is_published = true WHERE is_published = false;

-- 6. Insert sample AI tools
INSERT INTO ai_tools (name, description, category, advantages, disadvantages, practical_usage) VALUES
('ChatGPT', 'AI chatbot for various tasks', 'AI Assistant', 
 ARRAY['24/7 availability', 'Quick responses', 'Document drafting'], 
 ARRAY['Accuracy verification needed', 'Limited recent information'], 
 'Contract drafting, legal research, documentation'),
('Claude', 'AI assistant by Anthropic', 'AI Assistant',
 ARRAY['Long document analysis', 'Ethical responses', 'Accurate reasoning'], 
 ARRAY['Limited Korean support', 'No real-time data'], 
 'Contract review, legal document analysis, case organization'),
('Notion AI', 'AI integrated with Notion workspace', 'Document Management',
 ARRAY['Workspace integration', 'Auto organization', 'Template creation'], 
 ARRAY['Learning curve', 'Offline limitations'], 
 'Work logs, meeting notes, project management');

-- 7. Enable RLS for ai_tools
ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
CREATE POLICY "Enable read access for all users" ON ai_tools FOR SELECT USING (true);
CREATE POLICY "Enable all access for authenticated users" ON ai_tools FOR ALL USING (true);

-- 9. Complete
SELECT 'Database schema update completed' as status; 