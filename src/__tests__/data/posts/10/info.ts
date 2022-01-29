import PostYamlData from '../../../../__types__/PostYamlData'

const title = 'State Machines for Complex Robot Behavior'
const description = `
In this episode, Audrow Nash interviews Brett Aldrich, author of SMACC and CEO of Robosoft AI.
Robosoft AI develops and maintains SMACC and SMACC2, which are event-driven, behavior state machine libraries for ROS 1 and ROS 2, respectively.
Brett explains SMACC, its origins, other strategies for robot control such as behavior trees, speaks about the challenges of developing software for industry users and hobbists, and gives some advice for new roboticists.
`
  .replace(/\n/g, ' ')
  .trim()

const post: PostYamlData = {
  guests: 'Brett Aldrich',
  title,
  description,
  excerpt: 'Bret Aldrich is the author of SMACC and the CEO of Robosoft AI.',
  duration: {
    hours: 1,
    minutes: 51,
    seconds: 46,
  },
  tags: ['startup', 'software', 'behavior trees', 'state machines', 'control'],
  links: [
    {
      name: "Brett Aldrich's LinkedIn",
      url: 'https://www.linkedin.com/in/brett-aldrich-42915b97',
    },
    {
      name: "Robosoft.AI's website",
      url: 'https://robosoft.ai/',
    },
    {
      name: 'SMACC2 on Github',
      url: 'https://github.com/robosoft-ai/SMACC2',
    },
    {
      name: 'SMACC blog',
      url: 'https://smacc.dev/',
    },
  ],
  mp3SizeBytes: 216263919,
  publishDate: new Date(2021, 11, 28),
  youtube: {
    mainContent: {
      baseTitle: title,
      videoId: '3ju1g6g51ss',
    },
  },
}

export default post
