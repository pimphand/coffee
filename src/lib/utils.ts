// cn helper for shadcn-vue-style component composition — combines
// clsx (conditional class join) with tailwind-merge (dedupes tailwind
// utilities like `p-2 px-4` so the LAST one wins).
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
