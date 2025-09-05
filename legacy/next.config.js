const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')
const withImages = require('next-images')
module.exports = withImages()

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      env: {
        API_URL: 'http://127.0.0.1:1337',
        BASE_URL: 'http://127.0.0.1:3030',
        ADOBE_SIGN_CLIENT_ID: 'CBJCHBCAABAAz5rrPYzKweOKqJ8aC8Hj8m6jBwZWyTiG',
        ADOBE_SIGN_CLIENT_SECRET: 'M68v1FsiT6CpHdTZ5e9qECffl1uCXNAM',
        ADOBE_SIGN_REDIRECT_URI: 'https://welcome.indimortgage.ca/dashboard',
        ADOBE_SIGN_SCOPES:
          'scope=user_login:self+user_write:account+user_read:account+agreement_send:account+agreement_write:account+agreement_read:account+library_read:account+library_write:account',
        CLOUDINARY_NAME: 'axiom-mortgage',
        CLOUDINARY_KEY: '114438817563266',
        CLOUDINARY_SECRET: '76Ak_dZt_QLersSyXmZhdb7tLZM',
        EMPLOYER_ID: '604fdb6895bfeeb9e58cae98',
        AWS_BUCKET: 'indi-strapi',
        AWS_BUCKET_URL: 'https://indi-strapi.s3.amazonaws.com'
      },
      images: {
        domains: ['res.cloudinary.com', 'indi-strapi.s3.amazonaws.com', '*.s3.amazonaws.com'],
        disableStaticImages: true
      },
      swcMinify: true,
      eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true
      },
      experimental: {
        largePageDataBytes: 128 * 100000,
        esmExternals: false
      }
    }
  }

  return {
    env: {
      API_URL: 'https://axiomapi.herokuapp.com',
      BASE_URL: 'https://welcome.indimortgage.ca',
      ADOBE_SIGN_CLIENT_ID: 'CBJCHBCAABAAz5rrPYzKweOKqJ8aC8Hj8m6jBwZWyTiG',
      ADOBE_SIGN_CLIENT_SECRET: 'M68v1FsiT6CpHdTZ5e9qECffl1uCXNAM',
      ADOBE_SIGN_REDIRECT_URI: 'https://welcome.indimortgage.ca/dashboard',
      ADOBE_SIGN_SCOPES:
        'scope=user_login:self+user_write:account+user_read:account+agreement_send:account+agreement_write:account+agreement_read:account+library_read:account+library_write:account',
      CLOUDINARY_NAME: 'axiom-mortgage',
      CLOUDINARY_KEY: '114438817563266',
      CLOUDINARY_SECRET: '76Ak_dZt_QLersSyXmZhdb7tLZM',
      EMPLOYER_ID: '604fdb6895bfeeb9e58cae98',
      AWS_BUCKET: 'indi-strapi',
      AWS_BUCKET_URL: 'https://indi-strapi.s3.amazonaws.com'
    },
    images: {
      domains: ['res.cloudinary.com', 'indi-strapi.s3.amazonaws.com', '*.s3.amazonaws.com'],
      disableStaticImages: true
    },
    swcMinify: true,
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true
    },
    experimental: {
      largePageDataBytes: 128 * 100000,
      esmExternals: false
    }
  }
}

// module.exports = {
//   async redirects() {
//     return [
//       {
//         source: '/((?!maintenance).*)',
//         destination: '/maintenance',
//         permanent: false
//       }
//     ]
//   }
// }

// module.exports = {
//   eslint: {
//     // Warning: This allows production builds to successfully complete even if
//     // your project has ESLint errors.
//     ignoreDuringBuilds: true
//   },
//   experimental: {
//     largePageDataBytes: 128 * 100000
//   }
// }
