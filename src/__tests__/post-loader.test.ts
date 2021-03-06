import PostLoader from '../post-loader'
import {join} from 'path'
import podcast from './data/podcast.config'
import getPost from '../get-post'
import readTsPost from '../read-post/read-ts'
import dayjs, {Dayjs} from 'dayjs'

describe('PostLoader init', () => {
  {
    const dataDirectory = join(__dirname, 'data', 'posts')
    it('loads all the posts with debug', async () => {
      const ph = new PostLoader(podcast, {
        isDebug: true,
        isNewestPostFirst: true,
        isSerialized: true,
      })
      await ph.init(dataDirectory, getPost, readTsPost)

      expect(ph.getPosts().length).toBe(4)
      const slugs = ph.getSlugs()
      expect(slugs.length).toBe(4)
      expect(slugs).toEqual([
        '99-future-post',
        '11-cbq',
        '10-brett-aldrich',
        '0-welcome',
      ])
    })

    it('loads all the posts in reverse order with debug', async () => {
      const ph = new PostLoader(podcast, {
        isDebug: true,
        isNewestPostFirst: false,
        isSerialized: true,
      })
      await ph.init(dataDirectory, getPost, readTsPost)

      expect(ph.getPosts().length).toBe(4)
      const slugs = ph.getSlugs()
      expect(slugs.length).toBe(4)
      expect(slugs).toEqual([
        '0-welcome',
        '10-brett-aldrich',
        '11-cbq',
        '99-future-post',
      ])
    })

    it('loads past posts without debug', async () => {
      const ph = new PostLoader(podcast, {
        isDebug: false,
        isNewestPostFirst: true,
        isSerialized: true,
      })
      await ph.init(dataDirectory, getPost, readTsPost)

      expect(ph.getPosts().length).toBe(3)
      const slugs = ph.getSlugs()
      expect(slugs.length).toBe(3)
      expect(slugs).toEqual(['11-cbq', '10-brett-aldrich', '0-welcome'])
    })

    it('creates a tag list', async () => {
      const ph = new PostLoader(podcast, {
        isDebug: false,
        isNewestPostFirst: true,
        isSerialized: true,
      })
      await ph.init(dataDirectory, getPost, readTsPost)

      expect(ph.getTags()).toMatchSnapshot()
      const slugs = ph.getSlugsByTag('startup')
      const expectedSlugs = ['11-cbq', '10-brett-aldrich']
      expect(slugs).toEqual(expect.arrayContaining(expectedSlugs))
      const posts = ph.getPosts(slugs)
      expect(posts.map((p) => p.slug)).toEqual(expectedSlugs)
    })

    it('throws when you miss init', async () => {
      const ph = new PostLoader(podcast, {
        isDebug: true,
        isNewestPostFirst: true,
        isSerialized: true,
      })
      expect(() => ph.getSlugs()).toThrowError()
      expect(() => ph.getPosts()).toThrowError()
      expect(() => ph.getPostBySlug('0-welcome')).toThrowError()
      await ph.init(dataDirectory, getPost, readTsPost)
      expect(() => ph.getSlugs()).not.toThrowError()
      expect(() => ph.getPosts()).not.toThrowError()
      expect(() => ph.getPostBySlug('0-welcome')).not.toThrowError()
    })

    it('serializes the date', async () => {
      const phSerial = new PostLoader(podcast, {
        isDebug: false,
        isNewestPostFirst: true,
        isSerialized: true,
      })
      await phSerial.init(dataDirectory, getPost, readTsPost)
      const serialDates = phSerial.getPosts().map((p) => {
        expect(typeof p.publishDate === 'string').toBeTruthy()
        expect(() => dayjs(p.publishDate)).not.toThrowError()
        return p.publishDate as string
      })

      const phNotSerial = new PostLoader(podcast, {
        isDebug: false,
        isNewestPostFirst: true,
        isSerialized: false,
      })
      await phNotSerial.init(dataDirectory, getPost, readTsPost)
      const notSerialDates = phNotSerial
        .getPosts()
        .map((p) => p.publishDate as Dayjs)

      expect(serialDates).toEqual(
        notSerialDates.map((d) => d.format('YYYY-MM-DD')),
      )
    })
  }

  {
    const dataDirectory = join(__dirname, 'data', 'duplicate-slugs')
    it('throws an error when there are duplicate slugs', async () => {
      const ph = new PostLoader(podcast, {
        isDebug: true,
        isNewestPostFirst: true,
        isSerialized: true,
      })
      expect(ph.init(dataDirectory, getPost, readTsPost)).rejects.toThrowError()
    })
  }
})

describe('PostLoader getPostBySlug', () => {
  const dataDirectory = join(__dirname, 'data', 'posts')
  it('gets a post with a number by slug', async () => {
    const ph = new PostLoader(podcast, {
      isDebug: false,
      isNewestPostFirst: true,
      isSerialized: true,
    })
    await ph.init(dataDirectory, getPost, readTsPost)
    const post = ph.getPostBySlug('11-cbq')
    expect(post.slug).toBe('11-cbq')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {includes, publishDate, ...remainingPostKeys} = post
    expect(remainingPostKeys).toMatchSnapshot()
  })
  it('gets a post with a custom slug by slug', async () => {
    const ph = new PostLoader(podcast, {
      isDebug: false,
      isNewestPostFirst: true,
      isSerialized: true,
    })
    await ph.init(dataDirectory, getPost, readTsPost)
    const post = ph.getPostBySlug('0-welcome')
    expect(post.slug).toBe('0-welcome')

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {includes, publishDate, ...remainingPostKeys} = post
    expect(remainingPostKeys).toMatchSnapshot()
  })
  it('throws an error when there is no matching slug', async () => {
    const ph = new PostLoader(podcast, {
      isDebug: false,
      isNewestPostFirst: true,
      isSerialized: true,
    })
    await ph.init(dataDirectory, getPost, readTsPost)
    expect(() => ph.getPostBySlug('not-a-slug')).toThrowError()
  })
})
