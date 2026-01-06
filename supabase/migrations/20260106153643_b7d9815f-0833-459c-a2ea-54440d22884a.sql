-- Create storage bucket for meal photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('meal-photos', 'meal-photos', false);

-- Allow authenticated users to upload their own meal photos
CREATE POLICY "Users can upload meal photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'meal-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own meal photos
CREATE POLICY "Users can view their own meal photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'meal-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own meal photos
CREATE POLICY "Users can delete their own meal photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'meal-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);