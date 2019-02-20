# s3-list-bucket-stream

Node.js stream library that allows you to stream a list of objects from an S3 bucket

[![npm version](https://badge.fury.io/js/s3-list-bucket-stream.svg)](https://badge.fury.io/js/s3-list-bucket-stream)
[![CircleCI](https://circleci.com/gh/lmammino/s3-list-bucket-stream.svg?style=shield)](https://circleci.com/gh/lmammino/s3-list-bucket-stream)
[![Codecov coverage](https://codecov.io/gh/lmammino/s3-list-bucket-stream/branch/master/graph/badge.svg)](https://codecov.io/gh/lmammino/s3-list-bucket-stream)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

Using npm:

```bash
npm i --save s3-list-bucket-stream
```

or yarn

```bash
yarn add s3-list-bucket-stream
```

**Note:** In order to use this package you need to have the [`aws-sdk`](https://www.npmjs.com/package/aws-sdk) module installed
(or any other library that allows you to instantiate an S3 client with the `listBucketV2` method).


## Usage

Here's a simple example that allows to list all the files in a bucket

```javascript
const S3ListBucketStream = require('s3-list-bucket-stream')

// create the S3 client
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

// create the instance for the stream
const listBucketStream = new S3ListBucketStream(s3, 'some-bucket', 'path/to/files')

// attach an 'on data' event which will start the stream flow
listBucketStream
  .on('data', (key) => console.log(key.toString()))
```

This will output:

```plain
path/to/files/file1
path/to/files/file2
path/to/files/file3
...
```

If you want to emit objects containing the entire S3 object metadata, you can do so
by enabling the `fullMetadata` option while creating the stream instance:

```javascript
const S3ListBucketStream = require('s3-list-bucket-stream')

// create the S3 client
const AWS = require('aws-sdk')
const s3 = new AWS.S3()

// create the instance for the stream
const listBucketStream = new S3ListBucketStream(
  s3,
  'some-bucket',
  'path/to/files',
  { fullMetadata: true }
)

// attach an 'on data' event which will start the stream flow
listBucketStream
  .on('data', console.log)
```

This will produce this output:

```plain
{ Key: 'path/to/files/file1',
  LastModified: 2019-02-08T11:11:19.000Z,
  ETag: '"7e97db1005fe07801a3e3737103ceab8"',
  Size: 49152,
  StorageClass: 'STANDARD' }
{ Key: 'path/to/files/file2',
  LastModified: 2019-02-07T11:11:19.000Z,
  ETag: '"6a97db1005fe07801a3e3737103ceab8"',
  Size: 39152,
  StorageClass: 'STANDARD' }
{ Key: 'path/to/files/file3',
  LastModified: 2019-02-05T11:11:19.000Z,
  ETag: '"b097db1005fe07801a3e3737103ceab8"',
  Size: 29152,
  StorageClass: 'STANDARD' }
...
```

**Note**: with this option enabled, the stream will automatically enable `objectMode`.


## Programmatic API

Here you can find more details on how to configure the stream instances and what kind
of events are available.

### Constructor arguments

When creating a new instance of the stream these are the arguments you can pass as
constructor arguments:

 - `s3` (`Object`): An S3 client from the AWS SDK (or any object that implements a compatible `listObjectsV2` method)
 - `bucket` (`string`): The name of the bucket to list
 - `[bucketPrefix]` (`string`): A prefix to list only files with the given prefix (optional)
 - `[options]` (`S3ListBucketStreamOptions`): Stream options (optional)
 - `[listObjectsV2args]` (`ListObjectsV2args`): Extra arguments to be passed to the listObjectsV2 call in the S3 client (optional)

#### S3ListBucketStreamOptions

`S3ListBucketStreamOptions` is an object that can contain arbitrary `Readable` stream options.
You can also specify the following extra options:

 - `fullMetadata` (`boolean`): switches the stream to `objectMode: true` and emits objects containing the full metadata for a given bucket object. See the example above for more details (default value is `false`).

#### ListObjectsV2args

`ListObjectsV2args` is an object that can contain arbitrary [`s3.listObjectsV2` parameters](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#listObjectsV2-property) like `MaxKeys` (set to `1000` by default), `FetchOwner`, `RequestPayer` or `StartAfter`.

These parameters will be propagated to every internal `listObjectsV2` call to the S3 client
provided at construction time.

**Note**: be careful not to specify values for `Bucket`, `Prefix` and `ContinuationToken`
as these values will be managed by the internals according to the internal state and configuration
of the given stream instance.


### Events

The stream is a `Readable` stream instance, so it can fire all the common
[`Readable` stream events](https://nodejs.org/api/stream.html#stream_class_stream_readable).

In addition to these events there some new events that will be fired by a given instance:

 - `page`: fired when a new page is fetched through the S3 client. If listening to this event,
   your callback will receive an object containing the properties `params` (original parameters for the `listObjectsV2` call)
   and `data` (the raw response to the `listObjectsV2` call).
 - `stopped`: fired when the readable buffer is full and the fetch from S3 is stopped
 - `restarted`: fired when the fetch from S3 is restarted after a pause

## Contributing

Everyone is very welcome to contribute to this project. You can contribute just by submitting bugs or
suggesting improvements by [opening an issue on GitHub](https://github.com/lmammino/s3-list-bucket-stream/issues).

You can also submit PRs as long as you adhere with the code standards and write tests for the proposed changes.

## License

Licensed under [MIT License](LICENSE). © Luciano Mammino.
