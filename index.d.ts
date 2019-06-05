export = bundleHtmlPlugin

declare function bundleHtmlPlugin (options?: BundleHtmlPluginOptions): import('rollup').Plugin

interface BundleHtmlPluginOptions {
  template: string
  dest: string
  filename?: string
  inject?: 'head' | 'body'
  externals?: ExternalResource[]
  absolute?: boolean
  async?: boolean
  defer?: boolean
}

interface ExternalResource {
  type: string
  file: string
  pos: 'before' | string
}
