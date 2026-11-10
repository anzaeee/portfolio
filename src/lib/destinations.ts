import contactData from '$lib/contact-data.json';
import type { Surface } from '$lib/components/space/pixel';

export interface Destination {
	label: string;
	href: string;
	/** Colours from darkest to lightest */
	palette: string[];
	surface: Surface;
	seed: number;
}

const links = contactData.socialLinks;

/** The planets on the home console; each page reuses its planet as its header. */
export const destinations: Destination[] = [
	{ label: 'About', href: '/about', palette: ['#1a1030', '#3b2a63', '#6b5a9e', '#a291d6', '#d9cff5'], surface: 'craters', seed: 3 },
	{ label: 'Projects', href: '/projects', palette: ['#0c0840', '#2a1aa0', '#4b32e0', '#7a62ff', '#b9a8ff'], surface: 'bands', seed: 8 },
	{ label: 'Resume', href: '/resume', palette: ['#1b1b22', '#4a4a55', '#85858f', '#bdbdc6', '#ececf1'], surface: 'craters', seed: 12 },
	{ label: 'Contact', href: '/contact', palette: ['#0d1a3a', '#24407e', '#4f7cc4', '#94b9ec', '#dbe9ff'], surface: 'bands', seed: 21 },
	{ label: 'GitHub', href: links.github, palette: ['#2a0f3d', '#5b2185', '#9445c9', '#c98af0', '#f1d6ff'], surface: 'bands', seed: 34 },
	{ label: 'LinkedIn', href: links.linkedin, palette: ['#05063a', '#10149a', '#2a33e6', '#5d6bff', '#a9b2ff'], surface: 'bands', seed: 55 }
];

export const planet = (label: string) => destinations.find((d) => d.label === label)!;
