import React, { useEffect } from 'react';

const DEFAULT_SITE_NAME = 'सिटी समाचार डिजिटल , citysamachardigital';
const DEFAULT_SITE_TITLE = 'सिटी समाचार डिजिटल - ताज़ा हिंदी समाचार पोर्टल | Breaking News';
const DEFAULT_DESCRIPTION = 'सिटी समाचार डिजिटल - भारत, उत्तर प्रदेश, संत कबीर नगर, खलीलाबाद, मेहदावल और धनघटा की ताज़ा ख़बरें, स्थानीय समाचार, राजनीति, खेल और मनोरंजन की निष्पक्ष रिपोर्ट।';
const DEFAULT_KEYWORDS = 'सिटी समाचार डिजिटल, City Samachar Digital, Hindi News, ताज़ा ख़बरें, उत्तर प्रदेश समाचार, संत कबीर नगर न्यूज़, खलीलाबाद, मेहदावल, धनघटा, यूपी राजनीति, Breaking News in Hindi';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80';

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  news = null,
  jsonLd = null,
}) {
  const currentUrl = url || window.location.href;
  const pageTitle = title ? `${title} | ${DEFAULT_SITE_NAME}` : DEFAULT_SITE_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageKeywords = Array.isArray(keywords) ? keywords.join(', ') : (keywords || DEFAULT_KEYWORDS);
  const pageImage = image || (news && news.images && news.images[0]) || DEFAULT_IMAGE;

  useEffect(() => {
    // 1. Update Title
    document.title = pageTitle;

    // Helper to insert or update meta tags
    const setMetaTag = (attribute, attributeValue, content) => {
      if (!content) return;
      let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to insert or update canonical link tag
    const setCanonicalLink = (href) => {
      let element = document.querySelector('link[rel="canonical"]');
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // Helper to set JSON-LD script
    const setJsonLd = (data) => {
      let script = document.getElementById('seo-jsonld-data');
      if (!script) {
        script = document.createElement('script');
        script.id = 'seo-jsonld-data';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(data);
    };

    // Primary Meta Tags
    setMetaTag('name', 'description', pageDescription);
    setMetaTag('name', 'keywords', pageKeywords);
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('name', 'author', 'City Samachar Digital');
    setMetaTag('name', 'publisher', 'City Samachar Digital');

    // Canonical Tag
    setCanonicalLink(currentUrl);

    // Open Graph / Facebook
    setMetaTag('property', 'og:site_name', DEFAULT_SITE_NAME);
    setMetaTag('property', 'og:type', type === 'article' ? 'article' : 'website');
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:url', currentUrl);
    setMetaTag('property', 'og:image', pageImage);
    setMetaTag('property', 'og:locale', 'hi_IN');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);
    setMetaTag('name', 'twitter:image', pageImage);

    // Generate JSON-LD Schema
    let schemaData = [];

    if (jsonLd) {
      if (Array.isArray(jsonLd)) {
        schemaData = [...jsonLd];
      } else {
        schemaData.push(jsonLd);
      }
    }

    // Default WebSite & Organization Schemas
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsMediaOrganization',
      'name': 'सिटी समाचार डिजिटल',
      'alternateName': 'City Samachar Digital',
      'url': window.location.origin,
      'logo': {
        '@type': 'ImageObject',
        'url': `${window.location.origin}/logo.png`,
        'width': 600,
        'height': 60
      },
      'sameAs': [
        'https://facebook.com',
        'https://twitter.com',
        'https://youtube.com',
        'https://instagram.com'
      ]
    };

    if (type === 'article' && news) {
      const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': currentUrl
        },
        'headline': news.titleHi || news.titleEn || title,
        'description': news.summaryHi || news.summaryEn || pageDescription,
        'image': [pageImage],
        'datePublished': news.createdAt || new Date().toISOString(),
        'dateModified': news.updatedAt || news.createdAt || new Date().toISOString(),
        'author': {
          '@type': 'Person',
          'name': news.author || 'संपादकीय टीम (Editorial Team)',
          'jobTitle': 'पत्रकार'
        },
        'publisher': organizationSchema,
        'articleSection': news.district || 'उत्तर प्रदेश',
        'inLanguage': 'hi'
      };

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'मुख्य पृष्ठ (Home)',
            'item': window.location.origin
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': news.district || 'समाचार',
            'item': `${window.location.origin}/city/${encodeURIComponent(news.subdivision || 'all')}`
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': news.titleHi || news.titleEn || title,
            'item': currentUrl
          }
        ]
      };

      schemaData.push(articleSchema, breadcrumbSchema);
    } else {
      const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': DEFAULT_SITE_NAME,
        'url': window.location.origin,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${window.location.origin}/?search={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
      schemaData.push(organizationSchema, websiteSchema);
    }

    setJsonLd(schemaData);

  }, [pageTitle, pageDescription, pageKeywords, pageImage, currentUrl, type, news, jsonLd]);

  return null;
}
