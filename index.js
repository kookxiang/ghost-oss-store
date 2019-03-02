var fs = require('fs')
var path = require('path')
var OSS = require('ali-oss').Wrapper
var utils = require('./utils')

var StorageBase = require('ghost-storage-base')

class OssStore extends StorageBase {
  constructor (config) {
    super(config)
    this.options = config || {}
    this.client = new OSS(this.options)
  }

  async save (file) {
    const origin = this.options.origin
    const key = this.getFileKey(file)

    const result = await this.client.put(
      key,
      fs.createReadStream(file.path)
    )

    if (origin) {
      return utils.joinUrl(origin, result.name)
    } else {
      return result.url
    }
  }

  async exists (filename) {
    try {
      await this.client.head(filename)
      return true
    } catch {
      return false
    }
  }

  serve () {
    return (req, res, next) => next()
  }

  async delete(filename) {
    try {
      await this.client.delete(filename)
      return true
    } catch {
      return false
    }
  }

  read () {

  }

  getFileKey (file) {
    const keyOptions = this.options.fileKey

    if (keyOptions) {
      const getValue = (obj) => typeof obj === 'function' ? obj() : obj;
      const ext = path.extname(file.name)
      let name = path.basename(file.name, ext)

      if (keyOptions.safeString) {
        name = utils.safeString(name)
      }

      if (keyOptions.prefix) {
        name = path.join(keyOptions.prefix, name);
      }

      if (keyOptions.suffix) {
        name += getValue(keyOptions.suffix)
      }

      return name + ext.toLowerCase();
    }

    return null;
  }
}

module.exports = OssStore
