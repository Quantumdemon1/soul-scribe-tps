import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  canonicalPath?: string; // e.g., "/assessments"
  structuredData?: Record<string, any> | Record<string, any>[];
}

const SEO: React.FC<SEOProps> = ({ title, description, canonicalPath, structuredData }) => {
  useEffect(() => {
    // Title
    if (title) {
      document.title = title;
    }

    // Meta description
    if (description) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description.slice(0, 160));
    }

    // Canonical link
    const href = canonicalPath
      ? `${window.location.origin}${canonicalPath}`
      : window.location.href;

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);

    // Structured data (JSON-LD)
    const scriptId = 'seo-structured-data';
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (structuredData) {
      const script: HTMLScriptElement = existing || document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.id = scriptId;
      script.textContent = JSON.stringify(structuredData);
      if (!existing) document.head.appendChild(script);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, canonicalPath, structuredData]);

  return null;
};

export default SEO;
