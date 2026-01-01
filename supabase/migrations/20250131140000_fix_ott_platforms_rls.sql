-- Add RLS policy for ott_platforms to allow public read access
-- Essential for authenticated users to fetch platform list

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ott_platforms' 
        AND policyname = 'Public read access for ott_platforms'
    ) THEN
        CREATE POLICY "Public read access for ott_platforms" 
        ON public.ott_platforms FOR SELECT 
        USING (true);
    END IF;
END $$;

-- Also ensure authenticated users have GRANT
GRANT SELECT ON public.ott_platforms TO authenticated;
GRANT SELECT ON public.ott_platforms TO anon;
