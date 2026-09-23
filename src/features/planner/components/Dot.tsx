import type { CSSProperties } from 'react';
import { cx } from '../lib/ui';

const SIZE = { sm: 'size-[5px]', md: 'size-2', lg: 'size-[7px]' };

interface DotProps {
  color: string;
  size?: keyof typeof SIZE;
  style?: CSSProperties;
}

export default function Dot({ color, size = 'sm', style }: DotProps) {
  return <span className={cx('inline-block shrink-0 rounded-full', SIZE[size])} style={{ background: color, ...style }} />;
}
