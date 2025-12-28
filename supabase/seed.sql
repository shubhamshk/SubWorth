-- ============================================================================
-- OTT SUBSCRIPTION MANAGER - SEED DATA
-- ============================================================================
-- This populates the platform and release data for testing.
-- In production, this would be managed by admin tools.
-- ============================================================================

-- ============================================================================
-- SEED OTT PLATFORMS
-- ============================================================================
INSERT INTO public.ott_platforms (name, slug, logo_url, color_from, color_to, monthly_price, yearly_price, currency, categories, base_score, is_active)
VALUES
    ('Netflix', 'netflix', null, '#dc2626', '#991b1b', 15.49, 155.88, 'USD', ARRAY['movies', 'series', 'anime', 'kdrama', 'documentary'], 7.5, true),
    ('Prime Video', 'prime', null, '#3b82f6', '#1d4ed8', 8.99, 139.00, 'USD', ARRAY['movies', 'series', 'sports', 'documentary'], 6.8, true),
    ('Disney+', 'disney', null, '#2563eb', '#7c3aed', 13.99, 139.99, 'USD', ARRAY['movies', 'series', 'sports', 'disney', 'marvel'], 5.2, true),
    ('HBO Max', 'hbomax', null, '#9333ea', '#6b21a8', 15.99, 149.99, 'USD', ARRAY['movies', 'series', 'hbo', 'drama'], 7.8, true),
    ('Hulu', 'hulu', null, '#22c55e', '#15803d', 7.99, 79.99, 'USD', ARRAY['movies', 'series', 'reality', 'anime'], 5.5, true),
    ('Apple TV+', 'appletv', null, '#4b5563', '#1f2937', 9.99, 99.00, 'USD', ARRAY['series', 'movies', 'documentary'], 7.2, true);

-- ============================================================================
-- SEED MONTHLY RELEASES (December 2024)
-- ============================================================================

-- Netflix releases
INSERT INTO public.monthly_releases (platform_id, title, content_type, genres, release_date, rating, description, release_month, release_year)
SELECT 
    id,
    'Squid Game Season 2',
    'series',
    ARRAY['thriller', 'drama', 'kdrama'],
    '2024-12-26',
    9.2,
    'The deadly games return with new players and higher stakes.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'netflix'
UNION ALL
SELECT 
    id,
    'Black Mirror Season 7',
    'series',
    ARRAY['sci-fi', 'thriller', 'anthology'],
    '2024-12-15',
    8.8,
    'Dark tales of technology and humanity.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'netflix'
UNION ALL
SELECT 
    id,
    'The Witcher: Sirens of the Deep',
    'movie',
    ARRAY['fantasy', 'anime', 'action'],
    '2024-12-20',
    8.1,
    'Animated Witcher adventure exploring aquatic creatures.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'netflix'
UNION ALL
SELECT 
    id,
    'Carry-On',
    'movie',
    ARRAY['action', 'thriller'],
    '2024-12-13',
    7.5,
    'A young TSA agent races to outsmart a mysterious traveler.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'netflix';

-- Prime Video releases
INSERT INTO public.monthly_releases (platform_id, title, content_type, genres, release_date, rating, description, release_month, release_year)
SELECT 
    id,
    'Reacher Season 3',
    'series',
    ARRAY['action', 'thriller', 'crime'],
    '2024-12-20',
    8.5,
    'Jack Reacher returns with more justice to serve.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'prime'
UNION ALL
SELECT 
    id,
    'The Boys: Gen V Season 2',
    'series',
    ARRAY['superhero', 'action', 'comedy'],
    '2024-12-27',
    8.2,
    'The young supes face new challenges.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'prime'
UNION ALL
SELECT 
    id,
    'Citadel Season 2',
    'series',
    ARRAY['action', 'spy', 'thriller'],
    '2024-12-18',
    7.6,
    'The spy agency continues its covert operations.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'prime';

-- Disney+ releases
INSERT INTO public.monthly_releases (platform_id, title, content_type, genres, release_date, rating, description, release_month, release_year)
SELECT 
    id,
    'Skeleton Crew',
    'series',
    ARRAY['sci-fi', 'adventure', 'star-wars'],
    '2024-12-03',
    7.8,
    'Kids lost in the Star Wars galaxy.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'disney'
UNION ALL
SELECT 
    id,
    'Mufasa: The Lion King',
    'movie',
    ARRAY['animation', 'family', 'musical'],
    '2024-12-20',
    7.2,
    'The origin story of the legendary lion.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'disney';

-- HBO Max releases
INSERT INTO public.monthly_releases (platform_id, title, content_type, genres, release_date, rating, description, release_month, release_year)
SELECT 
    id,
    'House of the Dragon S2',
    'series',
    ARRAY['fantasy', 'drama', 'hbo'],
    '2024-12-01',
    9.0,
    'The Targaryen civil war intensifies.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'hbomax'
UNION ALL
SELECT 
    id,
    'The Penguin',
    'series',
    ARRAY['crime', 'drama', 'dc'],
    '2024-12-05',
    8.7,
    'Oz Cobb''s rise to power in Gotham.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'hbomax'
UNION ALL
SELECT 
    id,
    'Dune: Prophecy',
    'series',
    ARRAY['sci-fi', 'drama'],
    '2024-12-17',
    8.5,
    'The origin story of the Bene Gesserit.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'hbomax';

-- Hulu releases
INSERT INTO public.monthly_releases (platform_id, title, content_type, genres, release_date, rating, description, release_month, release_year)
SELECT 
    id,
    'Only Murders in the Building S4',
    'series',
    ARRAY['comedy', 'mystery'],
    '2024-12-10',
    8.0,
    'The trio investigates a new Hollywood mystery.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'hulu'
UNION ALL
SELECT 
    id,
    'The Bear S3',
    'series',
    ARRAY['drama', 'comedy'],
    '2024-12-15',
    8.8,
    'Carmen pushes his restaurant to new heights.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'hulu';

-- Apple TV+ releases
INSERT INTO public.monthly_releases (platform_id, title, content_type, genres, release_date, rating, description, release_month, release_year)
SELECT 
    id,
    'Severance Season 2',
    'series',
    ARRAY['thriller', 'sci-fi', 'mystery'],
    '2024-12-17',
    9.0,
    'The severed employees return.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'appletv'
UNION ALL
SELECT 
    id,
    'Silo Season 2',
    'series',
    ARRAY['sci-fi', 'drama', 'mystery'],
    '2024-12-15',
    8.5,
    'Juliette uncovers more secrets.',
    12,
    2024
FROM public.ott_platforms WHERE slug = 'appletv';
