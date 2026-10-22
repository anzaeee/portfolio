// Real education and career history, shared by the About and Resume pages

export interface EducationStage {
	id: string;
	title: string;
	period: string;
	institution: string;
	description: string;
	achievements: string[];
	icon: string;
	color: string;
}

export const educationJourney: EducationStage[] = [
	{
		id: 'middle',
		title: 'O Levels',
		period: '2012 - 2016',
		institution: 'Roots School System',
		description: 'The beginning of she',
		achievements: [
			'3x honorable mention debater',
			'Learned basic HTML but never worked on it',
			'Spelling Bee participant',
			'Pre-medical track'
		],
		icon: '🎒',
		color: '#7262ff'
	},
	{
		id: 'high',
		title: 'A Levels',
		period: '2016 - 2019',
		institution: 'Edwardes College Peshawar',
		description: 'The next chapter',
		achievements: [
			'Due to medical emergency, took a gap year and realigned my goals',
			'Published writer on AO3 and secured 100,000+ hits and kudos',
			'Pre-engineering track with extras in Urdu and Economics',
		],
		icon: '🎓',
		color: '#f59e0b'
	},
	{
		id: 'college',
		title: 'University',
		period: '2019 - 2023',
		institution: 'National University of Computer and Emerging Sciences',
		description: 'Comprehensive computer science education with focus on software engineering.',
		achievements: [
			'Bachelor of Science in Computer Science',
			'DevOps, Knowledge Graphs and Distributed Engineering electives - Scalable development',
			'Top 10 finalist for GDSC Tech Idea competition, finished Top 5',
			'Final Year Project in Natural Language Processing & Digital Image Processing'
		],
		icon: '🏛️',
		color: '#ef4444'
	},
	{
		id: 'career',
		title: 'Professional Career',
		period: '2022 - Present',
		institution: 'Tech Industry',
		description: 'Applying knowledge to solve real-world problems and mentor others.',
		achievements: [
			'Administrative Assistant at Foretheta automating workflows and hiring super engineers',
			'Software Engineer internship, learning heads-on development and delegation',
			'Advocated accessibility practices in design for end user at startup AIO for inclusive UI/UX',
			'Mentored 5+ junior interns across Product Management, Figma and rapid prototyping',
			'10x QA Delivery Manager - Pioneered an end-to-end testing framework with Playwright from the core',
			'Currently leading the charge at Thinkrr.ai to build Voice AI solutions meant to scale'
		],
		icon: '🚀',
		color: '#a99fff'
	}
];

export const skillGroups: { category: string; skills: string[] }[] = [
	{ category: 'Quality', skills: ['Playwright', 'End-to-end testing', 'Test strategy', 'Release delivery'] },
	{ category: 'Engineering', skills: ['TypeScript', 'Svelte / SvelteKit'] },
	{ category: 'AI', skills: ['Voice AI', 'Natural language processing', 'Digital image processing'] },
	{ category: 'Systems', skills: ['DevOps', 'Distributed systems', 'Knowledge graphs'] },
	{ category: 'Product', skills: ['Accessibility', 'Figma', 'Rapid prototyping', 'Product management'] },
	{ category: 'People & ops', skills: ['Mentoring', 'Hiring', 'Workflow automation', 'Writing', 'Debate'] }
];
