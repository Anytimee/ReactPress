import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Endpoint publik — tidak butuh access token. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
