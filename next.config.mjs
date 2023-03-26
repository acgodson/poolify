// @ts-nocheck
/**
 * @param {{ resolve: { fallback: { fs: boolean; }; }; }} config
 */
export function webpack(config, { isServer }) {
  if (!isServer) {
    config.resolve.fallback = {
      fs: false,
      reactStrictMode: false,
    }
  }

  return config
}

