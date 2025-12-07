-- Make the checkins bucket private
UPDATE storage.buckets SET public = false WHERE id = 'checkins';

-- Drop the public read policy that allows unauthenticated access
DROP POLICY IF EXISTS "Public can view checkin photos" ON storage.objects;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own checkin photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload checkin photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own checkin photos" ON storage.objects;

-- Create policies that only allow authenticated users to access their own photos
CREATE POLICY "Users can view own checkin photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'checkins' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload checkin photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'checkins' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own checkin photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'checkins' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);