import {
  getPost,
  getNumber,
  getSlug,
  getMp3Url,
  getCustomMp3Url,
} from '../get-post'

import {join} from 'path'
import podcast from './data/podcast.config'
import encodeUrl from 'encodeurl'
import readTsPost from '../read-post/read-ts'
// import readYamlPost from '../read-post/read-yaml'

describe('getPost', () => {
  const dataDirectory = join(__dirname, 'data')
  it('should get a standard episode with a number', async () => {
    const episodeDir = join(dataDirectory, 'posts', '11')
    const post = await getPost(podcast, episodeDir, readTsPost)
    expect(post.slug).toBe('11-cbq')
    expect(post.mp3.url).toBe(
      encodeUrl(
        'https://ftp.osuosl.org/pub/ros/download.ros.org/sensethinkact/episodes/STA Ep 11 - CBQ.mp3',
      ),
    )
    expect(post.number).toBe(11)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {includes, publishDate, ...remainingPostKeys} = post
    expect(remainingPostKeys).toMatchSnapshot()

    expect(post.includes?.outline).toBeDefined()
    expect(post.includes?.transcript).toBeDefined()
    expect(post.includes?.coverArtPath).toBeDefined()
  })
  it('should get an episode with a custom slug and mp3 URL', async () => {
    const episodeDir = join(dataDirectory, 'posts', 'welcome')
    const post = await getPost(podcast, episodeDir, readTsPost)
    expect(post.slug).toBe('0-welcome')
    expect(post.mp3.url).toBe(
      encodeUrl(
        'https://ftp.osuosl.org/pub/ros/download.ros.org/sensethinkact/episodes/STA Ep 0 - Welcome.mp3',
      ),
    )
    expect(post.number).toBeUndefined()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {includes, publishDate, ...remainingPostKeys} = post
    expect(remainingPostKeys).toMatchSnapshot()

    expect(post.includes?.outline).toBeUndefined()
    expect(post.includes?.transcript).toBeUndefined()
    expect(post.includes?.coverArtPath).toBeUndefined()
  })
  it('should throw an error on no number or custom slug', async () => {
    const episodeDir = join(
      dataDirectory,
      'bad-posts',
      'no-number-or-custom-slug',
    )
    expect(getPost(podcast, episodeDir, readTsPost)).rejects.toThrowError()
  })
  it('should throw an error on no number or custom mp3 url', async () => {
    const episodeDir = join(
      dataDirectory,
      'bad-posts',
      'no-number-or-custom-url',
    )
    expect(getPost(podcast, episodeDir, readTsPost)).rejects.toThrowError()
  })
  it('should throw when given an empty folder', async () => {
    const episodeDir = join(dataDirectory, 'bad-posts', 'empty-dir')
    expect(getPost(podcast, episodeDir, readTsPost)).rejects.toThrowError()
  })
  it('should throw when given a non-existent folder', async () => {
    const episodeDir = 'does-not-exist'
    expect(getPost(podcast, episodeDir, readTsPost)).rejects.toThrowError()
  })
})

describe('getMp3Url', () => {
  const baseUrl = 'https://example.com'
  it('should return the expected URL', () => {
    expect(getMp3Url(baseUrl, 1, 'John Doe')).toBe(
      encodeUrl('https://example.com/STA Ep 1 - John Doe.mp3'),
    )
    expect(getMp3Url(baseUrl, 1, ['John Doe'])).toBe(
      encodeUrl('https://example.com/STA Ep 1 - John Doe.mp3'),
    )
    expect(getMp3Url(baseUrl, 1, ['John Doe', 'Bob Smith'])).toBe(
      encodeUrl('https://example.com/STA Ep 1 - John Doe and Bob Smith.mp3'),
    )
    expect(getMp3Url(baseUrl, 1, ['John Doe', 'Bob Smith', 'Sara Wong'])).toBe(
      encodeUrl(
        'https://example.com/STA Ep 1 - John Doe, Bob Smith, and Sara Wong.mp3',
      ),
    )
    expect(
      getMp3Url(baseUrl, 1, [
        'John Doe',
        'Bob Smith',
        'Sara Wong',
        'Margaret Brown',
      ]),
    ).toBe(
      encodeUrl(
        'https://example.com/STA Ep 1 - John Doe, Bob Smith, Sara Wong, and Margaret Brown.mp3',
      ),
    )
  })
  it('should error when given an empty string', () => {
    expect(() => getMp3Url(baseUrl, 1, '')).toThrowError()
  })
  it('should error when given an empty list', () => {
    expect(() => getMp3Url(baseUrl, 1, [])).toThrowError(
      'Must have at least one guest',
    )
  })
})

describe('getCustomHostedMp3Url', () => {
  const baseUrl = 'https://example.com'
  it('should return the expected URL', () => {
    expect(getCustomMp3Url(baseUrl, 'Welcome')).toBe(
      'https://example.com/Welcome.mp3',
    )
  })
  it('should error when given an empty string', () => {
    expect(() => getCustomMp3Url(baseUrl, '')).toThrowError()
  })
})

describe('getSlug', () => {
  it('should return a slug', () => {
    expect(getSlug(1, ['foo'])).toEqual('1-foo')
    expect(getSlug(1, ['foo bar'])).toEqual('1-foo-bar')
    expect(getSlug(1, ['foo bar', 'baz bop'])).toEqual('1-foo-bar-and-baz-bop')
    expect(getSlug(1, ['foo bar', 'baz bop', 'bang pow'])).toEqual(
      '1-foo-bar-baz-bop-and-bang-pow',
    )
  })
  it('should throw an error on an empty list', () => {
    expect(() => getSlug(1, [])).toThrowError()
  })
  it('should throw errors on white space', () => {
    expect(() => getSlug(1, [''])).toThrowError()
    expect(() => getSlug(1, [' '])).toThrowError()
    expect(() => getSlug(1, ['   \n\t  '])).toThrowError()
    expect(() => getSlug(1, ['', ''])).toThrowError()
    expect(() => getSlug(1, ['', ' '])).toThrowError()
    expect(() => getSlug(1, ['foo', ''])).toThrowError()
    expect(() => getSlug(1, ['foo', ' '])).toThrowError()
    expect(() => getSlug(1, ['foo', '    \n\t   '])).toThrowError()
  })
})

describe('getPostNumberFromPath', () => {
  it('should return an episode number', () => {
    expect(getNumber('1')).toEqual(1)
    expect(getNumber('101')).toEqual(101)

    expect(getNumber('foo/1')).toEqual(1)

    expect(getNumber('foo/bar/1')).toEqual(1)
    expect(getNumber('foo/bar/2')).toEqual(2)
    expect(getNumber('foo/bar/101')).toEqual(101)
  })
  it('should return NaN if no number is given', () => {
    for (const path of ['', 'foo', 'foo/', 'foo/bar', 'foo/bar/']) {
      expect(getNumber(path)).toBeUndefined()
    }
  })
})
