import { Helmet } from 'react-helmet';
// import { config } from 'dotenv';
// config();

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  type?: 'website' | 'article' | 'product';
  schema?: Record<string, any>;
}

export default function SEO({
  title = 'Pling - Buy & Sell Second-hand Bicycles',
  description = 'Find quality second-hand bicycles or sell your bike on Pling. Verified sellers, secure transactions, and premium bicycles.',
  canonicalUrl,
  imageUrl = '/images/og-default.jpg',
  type = 'website',
  schema
}: SEOProps) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://pling.com';
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;

  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pling',
    url: siteUrl,
    description: description,
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={`${siteUrl}${imageUrl}`} />
      <meta property="og:site_name" content="Pling" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${imageUrl}`} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema || defaultSchema)}
      </script>
    </Helmet>
  );
}