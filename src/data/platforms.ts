/**
 * OTT Platform Mock Data
 * 
 * This file contains mock data for OTT platforms, their current month releases,
 * pricing, and scoring. This can be replaced with a real API later.
 * 
 * All prices are in USD ($)
 */

export type VerdictType = 'buy' | 'skip' | 'continue' | 'pause';

export interface Content {
    id: string;
    title: string;
    type: 'movie' | 'series' | 'documentary' | 'live' | 'special';
    genre: string[];
    releaseDate: string;
    rating?: number;
    description: string;
}

export interface Platform {
    id: string;
    name: string;
    slug: string;
    logo: string;
    color: string;
    monthlyPrice: number;
    yearlyPrice?: number;
    currency: string;
    thisMonthContent: Content[];
    baseScore: number;
    categories: string[];
}

export const platforms: Platform[] = [
    {
        id: '1',
        name: 'Netflix',
        slug: 'netflix',
        logo: 'N',
        color: 'from-red-600 to-red-800',
        monthlyPrice: 15.49,
        yearlyPrice: 155.88,
        currency: '$',
        categories: ['movies', 'series', 'anime', 'kdrama', 'documentary'],
        baseScore: 7.5,
        thisMonthContent: [
            {
                id: 'n1',
                title: 'Squid Game Season 2',
                type: 'series',
                genre: ['thriller', 'drama', 'kdrama'],
                releaseDate: '2024-12-26',
                rating: 9.2,
                description: 'The deadly games return with new players and higher stakes.',
            },
            {
                id: 'n2',
                title: 'Black Mirror Season 7',
                type: 'series',
                genre: ['sci-fi', 'thriller', 'anthology'],
                releaseDate: '2024-12-15',
                rating: 8.8,
                description: 'Dark tales of technology and humanity.',
            },
            {
                id: 'n3',
                title: 'The Witcher: Sirens of the Deep',
                type: 'movie',
                genre: ['fantasy', 'anime', 'action'],
                releaseDate: '2024-12-20',
                rating: 8.1,
                description: 'Animated Witcher adventure exploring aquatic creatures.',
            },
            {
                id: 'n4',
                title: 'Carry-On',
                type: 'movie',
                genre: ['action', 'thriller'],
                releaseDate: '2024-12-13',
                rating: 7.5,
                description: 'A young TSA agent races to outsmart a mysterious traveler.',
            },
        ],
    },
    {
        id: '2',
        name: 'Prime Video',
        slug: 'prime',
        logo: 'P',
        color: 'from-blue-500 to-blue-700',
        monthlyPrice: 8.99,
        yearlyPrice: 139,
        currency: '$',
        categories: ['movies', 'series', 'sports', 'documentary'],
        baseScore: 6.8,
        thisMonthContent: [
            {
                id: 'p1',
                title: 'Reacher Season 3',
                type: 'series',
                genre: ['action', 'thriller', 'crime'],
                releaseDate: '2024-12-20',
                rating: 8.5,
                description: "Jack Reacher returns with more justice to serve.",
            },
            {
                id: 'p2',
                title: 'The Boys: Gen V Season 2',
                type: 'series',
                genre: ['superhero', 'action', 'comedy'],
                releaseDate: '2024-12-27',
                rating: 8.2,
                description: 'The young supes face new challenges.',
            },
            {
                id: 'p3',
                title: 'Citadel Season 2',
                type: 'series',
                genre: ['action', 'spy', 'thriller'],
                releaseDate: '2024-12-18',
                rating: 7.6,
                description: 'The spy agency continues its covert operations.',
            },
        ],
    },
    {
        id: '3',
        name: 'Disney+',
        slug: 'disney',
        logo: 'D+',
        color: 'from-blue-600 to-purple-700',
        monthlyPrice: 13.99,
        yearlyPrice: 139.99,
        currency: '$',
        categories: ['movies', 'series', 'sports', 'disney', 'marvel'],
        baseScore: 5.2,
        thisMonthContent: [
            {
                id: 'h1',
                title: 'Skeleton Crew',
                type: 'series',
                genre: ['sci-fi', 'adventure', 'star-wars'],
                releaseDate: '2024-12-03',
                rating: 7.8,
                description: 'Kids lost in the Star Wars galaxy.',
            },
            {
                id: 'h2',
                title: 'Mufasa: The Lion King',
                type: 'movie',
                genre: ['animation', 'family', 'musical'],
                releaseDate: '2024-12-20',
                rating: 7.2,
                description: 'The origin story of the legendary lion.',
            },
        ],
    },
    {
        id: '4',
        name: 'HBO Max',
        slug: 'hbomax',
        logo: 'H',
        color: 'from-purple-600 to-purple-800',
        monthlyPrice: 15.99,
        yearlyPrice: 149.99,
        currency: '$',
        categories: ['movies', 'series', 'hbo', 'drama'],
        baseScore: 7.8,
        thisMonthContent: [
            {
                id: 'j1',
                title: 'House of the Dragon S2',
                type: 'series',
                genre: ['fantasy', 'drama', 'hbo'],
                releaseDate: '2024-12-01',
                rating: 9.0,
                description: 'The Targaryen civil war intensifies.',
            },
            {
                id: 'j2',
                title: 'The Penguin',
                type: 'series',
                genre: ['crime', 'drama', 'dc'],
                releaseDate: '2024-12-05',
                rating: 8.7,
                description: "Oz Cobb's rise to power in Gotham.",
            },
            {
                id: 'j3',
                title: 'Dune: Prophecy',
                type: 'series',
                genre: ['sci-fi', 'drama'],
                releaseDate: '2024-12-17',
                rating: 8.5,
                description: 'The origin story of the Bene Gesserit.',
            },
        ],
    },
    {
        id: '5',
        name: 'Hulu',
        slug: 'hulu',
        logo: 'h',
        color: 'from-green-500 to-green-700',
        monthlyPrice: 7.99,
        yearlyPrice: 79.99,
        currency: '$',
        categories: ['movies', 'series', 'reality', 'anime'],
        baseScore: 5.5,
        thisMonthContent: [
            {
                id: 's1',
                title: 'Only Murders in the Building S4',
                type: 'series',
                genre: ['comedy', 'mystery'],
                releaseDate: '2024-12-10',
                rating: 8.0,
                description: 'The trio investigates a new Hollywood mystery.',
            },
            {
                id: 's2',
                title: 'The Bear S3',
                type: 'series',
                genre: ['drama', 'comedy'],
                releaseDate: '2024-12-15',
                rating: 8.8,
                description: 'Carmen pushes his restaurant to new heights.',
            },
        ],
    },
    {
        id: '6',
        name: 'Apple TV+',
        slug: 'appletv',
        logo: 'A',
        color: 'from-gray-600 to-gray-800',
        monthlyPrice: 9.99,
        yearlyPrice: 99,
        currency: '$',
        categories: ['series', 'movies', 'documentary'],
        baseScore: 7.2,
        thisMonthContent: [
            {
                id: 'a1',
                title: 'Severance Season 2',
                type: 'series',
                genre: ['thriller', 'sci-fi', 'mystery'],
                releaseDate: '2024-12-17',
                rating: 9.0,
                description: 'The severed employees return.',
            },
            {
                id: 'a2',
                title: 'Silo Season 2',
                type: 'series',
                genre: ['sci-fi', 'drama', 'mystery'],
                releaseDate: '2024-12-15',
                rating: 8.5,
                description: 'Juliette uncovers more secrets.',
            },
        ],
    },
];

// Interest categories for personalization
export const interestCategories = [
    { id: 'movies', label: 'Movies', emoji: '🎬' },
    { id: 'series', label: 'TV Series', emoji: '📺' },
    { id: 'anime', label: 'Anime', emoji: '🎌' },
    { id: 'sports', label: 'Sports', emoji: '⚽' },
    { id: 'kdrama', label: 'K-Drama', emoji: '🇰🇷' },
    { id: 'documentary', label: 'Documentary', emoji: '🎥' },
    { id: 'comedy', label: 'Comedy', emoji: '😂' },
    { id: 'thriller', label: 'Thriller', emoji: '👻' },
    { id: 'sci-fi', label: 'Sci-Fi', emoji: '🚀' },
    { id: 'fantasy', label: 'Fantasy', emoji: '🐉' },
];

export default platforms;
