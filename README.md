# s3-list-bucket-stream

Node.js stream library that allows you to stream a list of objects from an S3 bucket

[![npm version](https://badge.fury.io/js/s3-list-bucket-stream.svg)](https://badge.fury.io/js/s3-list-bucket-stream)
[![CircleCI](https://circleci.com/gh/lmammino/s3-list-bucket-stream.svg?style=shield)](https://circleci.com/gh/lmammino/s3-list-bucket-stream)
[![Codecov coverage](https://codecov.io/gh/lmammino/s3-list-bucket-stream/branch/master/graph/badge.svg)](https://codecov.io/gh/lmammino/s3-list-bucket-stream)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Example

```javascript
const S3ListBucketStream = require('s3-list-bucket-stream')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

const listBucketStream = new S3ListBucketStream(s3, 'some-bucket', 'path/to/files')

listBucketStream
  .pipe(process.stdout)
```

Will output:

```plain
path/to/files/file1
path/to/files/file2
path/to/files/file3
...
```
