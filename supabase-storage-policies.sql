-- Script SQL para configurar o Supabase Storage para course-images
-- Execute este script no SQL Editor do Supabase após criar o bucket 'course-images'

-- 1. Política de Upload (INSERT) - Permite que admins façam upload
CREATE POLICY "Allow admins to upload course images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-images' AND
  auth.uid()::text IN (
    SELECT "supabaseUid" FROM public.users WHERE role = 'ADMIN'
  )
);

-- 2. Política de Leitura Pública (SELECT) - Permite que qualquer pessoa visualize
CREATE POLICY "Public access to course images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-images');

-- 3. Política de Atualização (UPDATE) - Permite que admins atualizem
CREATE POLICY "Allow admins to update course images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-images' AND
  auth.uid()::text IN (
    SELECT "supabaseUid" FROM public.users WHERE role = 'ADMIN'
  )
);

-- 4. Política de Exclusão (DELETE) - Permite que admins excluam
CREATE POLICY "Allow admins to delete course images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-images' AND
  auth.uid()::text IN (
    SELECT "supabaseUid" FROM public.users WHERE role = 'ADMIN'
  )
);
