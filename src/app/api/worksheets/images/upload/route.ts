import { randomUUID } from 'crypto';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  extensionForImageMime,
  validateWorksheetImageFile,
} from '@/lib/worksheets/image-upload';
import { checkRateLimit } from '@/lib/rate-limit';
import { apiJsonError, withApiErrorHandling } from '@/lib/api/errors';
import { getServerEnv } from '@/lib/env';

const UPLOADS_PER_MINUTE = 20;

export async function POST(req: Request) {
  return withApiErrorHandling(
    'POST /api/worksheets/images/upload',
    async () => {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return apiJsonError('Unauthorized', 401);

      if (
        !checkRateLimit(
          `worksheet-image-upload:${user.id}`,
          UPLOADS_PER_MINUTE,
          60_000,
        )
      ) {
        return apiJsonError('Too many uploads. Try again shortly.', 429);
      }

      const formData = await req.formData();
      const file = formData.get('file');
      if (!(file instanceof File)) {
        return apiJsonError('No image file provided.', 400);
      }

      const validationError = validateWorksheetImageFile(file);
      if (validationError) return apiJsonError(validationError, 400);

      const ext = extensionForImageMime(file.type);
      if (!ext) return apiJsonError('Unsupported image type.', 400);

      const path = `${user.id}/${randomUUID()}.${ext}`;
      const bytes = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(getServerEnv().WORKSHEET_IMAGES_BUCKET)
        .upload(path, bytes, {
          contentType: file.type,
          upsert: false,
          cacheControl: '3600',
        });

      if (uploadError) {
        return apiJsonError(uploadError.message, 500);
      }

      const { data: publicUrl } = supabase.storage
        .from(getServerEnv().WORKSHEET_IMAGES_BUCKET)
        .getPublicUrl(path);

      return Response.json({
        url: publicUrl.publicUrl,
        path,
      });
    },
  );
}
