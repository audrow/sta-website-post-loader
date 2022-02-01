import getPost from './get-post'

import type PodcastConfig from './__types__/PodcastConfig'
import type Post from './__types__/Post'

import {join} from 'path'
import fs from 'fs'

type PodcastHelperConfig = {
  isNewestPostFirst: boolean
  isDebug: boolean
}

const defaultConfig: PodcastHelperConfig = {
  isNewestPostFirst: true,
  isDebug: false,
}

export class PostLoader {
  private podcast: PodcastConfig
  private posts: Post[]
  private tagToPostMap: {[tag: string]: string[]}
  private config: PodcastHelperConfig
  private isInitialized: boolean

  constructor(
    podcast: PodcastConfig,
    config: Partial<PodcastHelperConfig> = {},
  ) {
    this.podcast = podcast
    this.posts = []
    this.tagToPostMap = {}
    this.config = {...defaultConfig, ...config}
    this.isInitialized = false
  }

  async init(postsDirectory: string) {
    const postsDirectories = fs.readdirSync(postsDirectory)

    const posts: Post[] = []
    for await (const postDirectory of postsDirectories) {
      const postDirectoryPath = join(postsDirectory, postDirectory)
      const post = await getPost(this.podcast, postDirectoryPath)
      if (this.config.isDebug || post.publishDate.getTime() < Date.now()) {
        this.recordTags(post.tags, post.slug)
        posts.push(post)
      }
    }
    this.checkPostsForDuplicateSlugs(posts)
    this.sortPostsByPublishDate(posts)

    this.posts = posts
    this.isInitialized = true
  }

  private recordTags(postTags: string[], postSlug: string) {
    postTags.map((tag) => {
      if (!this.tagToPostMap[tag]) {
        this.tagToPostMap[tag] = []
      }
      this.tagToPostMap[tag].push(postSlug)
    })
  }

  private checkPostsForDuplicateSlugs(posts: Post[]) {
    const slugs = posts.map((post) => post.slug)
    if (new Set(slugs).size !== slugs.length) {
      throw new Error('Duplicate slugs detected')
    }
  }

  private sortPostsByPublishDate(
    posts: Post[],
    isNewestFirst = this.config.isNewestPostFirst,
  ) {
    return posts.sort((post1, post2) => {
      if (post1.publishDate > post2.publishDate) {
        return isNewestFirst ? -1 : 1
      } else if (post1.publishDate < post2.publishDate) {
        return isNewestFirst ? 1 : -1
      }
      return 0
    })
  }

  private throwIfNotInitialized() {
    if (!this.isInitialized) {
      throw new Error('PostHelper is not initialized')
    }
  }

  getTags() {
    this.throwIfNotInitialized()
    return Object.keys(this.tagToPostMap)
  }

  getSlugs() {
    this.throwIfNotInitialized()
    return this.posts.map((post) => post.slug)
  }

  getSlugsByTag(tag: string) {
    this.throwIfNotInitialized()
    return this.tagToPostMap[tag]
  }

  getPostBySlug(slug: string) {
    this.throwIfNotInitialized()
    const post = this.posts.find((post) => post.slug === slug)
    if (!post) {
      throw new Error(`Post with slug ${slug} not found`)
    }
    return post
  }

  getPosts(slugs: string[] = []) {
    this.throwIfNotInitialized()

    if (slugs.length === 0) {
      return this.posts
    } else {
      const posts = slugs.map((s) => this.getPostBySlug(s))
      this.sortPostsByPublishDate(posts)
      return posts
    }
  }
}

export default PostLoader