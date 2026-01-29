import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string[];
    canonical?: string;
    type?: 'website' | 'article';
    image?: string;
}

export const SEO = ({
    title,
    description,
    keywords = [],
    canonical = 'https://effortless-verify.vercel.app',
    type = 'website',
    image = 'https://effortless-verify.vercel.app/og-image.png'
}: SEOProps) => {
    const siteTitle = 'Effortless';
    const fullTitle = title === siteTitle ? siteTitle : `${title} | ${siteTitle}`;
    const allKeywords = [
        'Effortless',
        'SaaS',
        'Verification',
        'Integrity',
        'Samarth Kashyap',
        'AI Detection',
        'Writing',
        'Coding',
        ...keywords
    ].join(', ');

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={allKeywords} />
            <meta name="author" content="Samarth Kashyap" />
            <link rel="canonical" href={canonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@samarthkashyap" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
};
