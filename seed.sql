-- ============================================================
-- ShiftIn — Seed Data (Demo Jobs & Employer)
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- Create a demo employer profile
INSERT INTO public.profiles (id, firebase_uid, role, full_name, email, company_name, business_type, company_location, contact_person, verification_status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'demo_employer_1', 'employer', 'Sarah Johnson', 'sarah@techsolutions.com', 'Tech Solutions Inc.', 'Technology', 'Bangalore, India', 'Sarah Johnson', 'verified'),
  ('00000000-0000-0000-0000-000000000002', 'demo_employer_2', 'employer', 'Raj Patel', 'raj@globallogistics.com', 'Global Logistics', 'Logistics', 'Mumbai, India', 'Raj Patel', 'verified'),
  ('00000000-0000-0000-0000-000000000003', 'demo_employer_3', 'employer', 'Emily Chen', 'emily@metacorp.io', 'MetaCorp', 'Technology', 'Remote, US', 'Emily Chen', 'verified'),
  ('00000000-0000-0000-0000-000000000004', 'demo_employer_4', 'employer', 'Amit Kumar', 'amit@starbucks.in', 'Starbucks India', 'Hospitality', 'Mumbai, India', 'Amit Kumar', 'verified'),
  ('00000000-0000-0000-0000-000000000005', 'demo_employer_5', 'employer', 'Lisa Wang', 'lisa@brandlab.co', 'BrandLab Co.', 'Marketing', 'Delhi, India', 'Lisa Wang', 'verified')
ON CONFLICT (firebase_uid) DO NOTHING;

-- Insert demo jobs
INSERT INTO public.jobs (employer_id, title, category, description, requirements, pay_amount, pay_unit, shift_type, location, openings, status, is_verified) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'UI/UX Research Assistant',
  'Technology',
  'Join our design team to conduct user research, create wireframes, and assist in usability testing for our enterprise products. You will work directly with our lead UX designer and gain real-world experience in product design.

Key Responsibilities:
• Conduct user interviews and surveys
• Analyze usability test results
• Create wireframes and prototypes in Figma
• Document design patterns and guidelines',
  'Valid Student ID from a recognized university.
Strong communication skills in English.
Familiarity with Figma or similar design tools.
Available for at least 3 shifts per week.',
  25.00, 'hr', 'Evening Shift', 'Bangalore, India', 3, 'active', true
),
(
  '00000000-0000-0000-0000-000000000002',
  'Warehouse Supervisor (Part-time)',
  'Logistics',
  'Oversee daily warehouse operations including inventory management, order fulfillment, and team coordination. Great opportunity for management students looking for hands-on supply chain experience.

Key Responsibilities:
• Supervise a team of 5-8 warehouse associates
• Manage inventory counts and stock levels
• Coordinate with delivery drivers for dispatch
• Maintain safety and cleanliness standards',
  'Currently enrolled in a business or logistics program.
Ability to lift up to 15kg.
Strong organizational skills.
Previous warehouse or retail experience is a plus.',
  19.00, 'hr', 'Morning Shift', 'Mumbai, India', 2, 'active', true
),
(
  '00000000-0000-0000-0000-000000000003',
  'Senior Data Analyst',
  'Technology',
  'Work with our analytics team to process large datasets, build dashboards, and generate actionable insights. Ideal for CS or Statistics students with strong Python/SQL skills.

Key Responsibilities:
• Clean and process data from multiple sources
• Build interactive dashboards in Tableau/Power BI
• Write SQL queries for data extraction
• Present findings to stakeholders',
  'Strong proficiency in Python and SQL.
Experience with data visualization tools.
Currently pursuing degree in CS, Statistics, or related field.
Knowledge of machine learning basics is a plus.',
  45.00, 'hr', 'Full-time', 'Remote, US', 1, 'active', true
),
(
  '00000000-0000-0000-0000-000000000004',
  'Store Assistant — Starbucks',
  'Hospitality',
  'We are looking for energetic student assistants to join our flagship store. You will provide excellent customer service, manage front-of-house operations, and ensure a welcoming environment. This role is designed to fit around your college schedule.

Key Responsibilities:
• Greet and serve customers with a smile
• Prepare beverages following Starbucks standards
• Maintain store cleanliness and ambiance
• Handle POS transactions accurately',
  'Valid Student ID from a recognized university.
Strong communication skills in English and Hindi.
Availability for at least 3 shifts per week.
Previous retail or F&B experience is a plus, but not mandatory.',
  500.00, 'shift', 'Evening Shift', 'Phoenix Marketcity, Mumbai', 5, 'active', true
),
(
  '00000000-0000-0000-0000-000000000003',
  'Customer Support Lead',
  'Technology',
  'Handle customer inquiries via chat and email, escalate complex issues, and maintain our knowledge base. Perfect for communication students seeking tech industry exposure.

Key Responsibilities:
• Respond to customer tickets within SLA
• Troubleshoot basic technical issues
• Update FAQ and help documentation
• Collaborate with engineering on bug reports',
  'Excellent written communication skills.
Patience and empathy in customer interactions.
Basic technical troubleshooting ability.
Available for flexible scheduling.',
  22.50, 'hr', 'Flexible', 'Chicago, IL', 2, 'active', true
),
(
  '00000000-0000-0000-0000-000000000005',
  'Marketing Intern',
  'Marketing',
  'Assist our marketing team with social media management, content creation, and campaign analytics. Learn hands-on digital marketing in a fast-paced startup environment.

Key Responsibilities:
• Create social media content (Instagram, LinkedIn)
• Write blog posts and email newsletters
• Track campaign performance metrics
• Assist with event planning and coordination',
  'Currently studying Marketing, Communications, or related field.
Portfolio of creative work (social media, writing, design).
Familiarity with Canva, Hootsuite, or similar tools.
Strong writing skills in English.',
  18.00, 'hr', 'Part-time', 'Delhi, India', 2, 'active', true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Frontend Developer Intern',
  'Technology',
  'Build and maintain responsive web interfaces using React and modern CSS. Collaborate with our engineering team to ship features that thousands of users interact with daily.

Key Responsibilities:
• Develop UI components in React/Next.js
• Write clean, maintainable JavaScript/TypeScript
• Implement responsive designs from Figma mockups
• Participate in code reviews and sprint planning',
  'Proficiency in HTML, CSS, JavaScript.
Experience with React or Vue.js.
Understanding of Git version control.
CS or IT student in 3rd year or above.',
  30.00, 'hr', 'Part-time', 'Bangalore, India (Hybrid)', 2, 'active', true
),
(
  '00000000-0000-0000-0000-000000000002',
  'Event Coordinator Assistant',
  'General Labor',
  'Help plan and execute corporate events, workshops, and team-building activities. Great for students interested in event management and hospitality.

Key Responsibilities:
• Assist in venue setup and teardown
• Coordinate with vendors and suppliers
• Manage guest registration and check-in
• Handle on-site logistics during events',
  'Strong organizational and multitasking skills.
Ability to work weekends when events are scheduled.
Good communication and interpersonal skills.
Previous event experience is a bonus.',
  15.00, 'hr', 'Weekends', 'Mumbai, India', 4, 'active', true
);
