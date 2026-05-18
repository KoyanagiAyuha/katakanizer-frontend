'use client';

import { useEffect } from 'react';
import { ADSENSE_CLIENT_ID } from '@/utils/constants';

declare global {
  interface Window {
    adsbygoogle: object[];
  }
}

export interface AdSenseProps {
  /** AdSense 管理画面で発行した広告ユニットのスロットID */
  adSlot?: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

/**
 * Google AdSense の広告枠を表示するコンポーネント。
 * 広告を出したい箇所に <AdSense adSlot="..." /> を配置して使う。
 * スクリプト本体は app/layout.tsx で読み込んでいる。
 */
export default function AdSense({
  adSlot = 'auto',
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={ADSENSE_CLIENT_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive.toString()}
    />
  );
}
