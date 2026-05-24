/**
 * KakaoBank Brand Symbol
 *
 * ⚠️ STRICT BRAND GUIDELINES — DO NOT MODIFY ⚠️
 *
 * Source: Print_Symbol_Primary_Black.svg / Print_Symbol_Secondary_White.svg
 * - Light mode: #1d1d1d fill on White background
 * - Dark mode: #ffffff fill on #1E1E1E background
 *
 * Brand rules (from kakaobank.com/view/about/brand/resource):
 * - Logo colors are RESTRICTED to Yellow (#FFE300), Black (#1E1E1E), White (#FFFFFF) only
 * - Do NOT change fill colors, stroke, proportions, or add effects
 * - Do NOT use currentColor — colors are hardcoded per brand spec
 * - This icon is for SIDEBAR HEADER use only — not a general-purpose UI icon
 *
 * If brand assets are updated, replace the path data from official SVG files only.
 */
import React from 'react';

interface KakaoBankIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const KakaoBankSymbol = React.forwardRef<SVGSVGElement, KakaoBankIconProps>(
  ({ className = 'size-4', ...props }, ref) => (
    <svg
      ref={ref}
      className={className}
      viewBox='0 0 1600 2000'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M1354.72,1000c148.95-98.42,246.84-267.37,245.26-459.47C1597.87,238.95,1344.19,0,1042.61,0H60C26.84,0,0,26.84,0,60v1880c0,33.16,26.84,60,60,60h982.61c301.05,0,555.26-238.95,557.37-540.53,1.58-192.11-96.31-361.58-245.26-459.47ZM868.42,1480h-220v-960h220v960Z'
        className='fill-[#1d1d1d] dark:fill-white'
      />
    </svg>
  )
);

KakaoBankSymbol.displayName = 'KakaoBankSymbol';
