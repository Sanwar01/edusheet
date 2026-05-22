import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getServerEnv } from '@/lib/env';
import { checkRateLimit } from '@/lib/rate-limit';
import { apiJsonError, withApiErrorHandling } from '@/lib/api/errors';

const STOCK_SEARCH_PER_MINUTE = 30;

type PexelsPhoto = {
  id: number;
  alt: string;
  photographer: string;
  src: {
    medium: string;
    large2x: string;
  };
};

export type StockPhotoResult = {
  id: number;
  src: string;
  thumbnail: string;
  alt: string;
  photographer: string;
};

export async function GET(req: Request) {
  return withApiErrorHandling('GET /api/worksheets/images/stock', async () => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return apiJsonError('Unauthorized', 401);

    const apiKey = getServerEnv().PEXELS_API_KEY;
    if (!apiKey) {
      return apiJsonError(
        'Stock photos are not configured. Upload an image or paste a URL instead.',
        503,
      );
    }

    if (!checkRateLimit(`worksheet-stock:${user.id}`, STOCK_SEARCH_PER_MINUTE, 60_000)) {
      return apiJsonError('Too many searches. Try again shortly.', 429);
    }

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') ?? 'education classroom').trim().slice(0, 80);
    const page = Math.max(1, Math.min(Number(searchParams.get('page') ?? '1') || 1, 20));

    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.set('query', query || 'education');
    url.searchParams.set('per_page', '12');
    url.searchParams.set('page', String(page));
    url.searchParams.set('orientation', 'landscape');

    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return apiJsonError('Could not load stock photos. Try again later.', 502);
    }

    const payload = (await res.json()) as { photos?: PexelsPhoto[] };
    const photos: StockPhotoResult[] = (payload.photos ?? []).map((photo) => ({
      id: photo.id,
      src: photo.src.large2x,
      thumbnail: photo.src.medium,
      alt: photo.alt?.trim() || `Photo by ${photo.photographer}`,
      photographer: photo.photographer,
    }));

    return Response.json({ photos, query, page });
  });
}
