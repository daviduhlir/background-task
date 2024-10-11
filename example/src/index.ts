import { BackgroundTask } from '@david.uhlir/background-task'

const test = new BackgroundTask({
  reportPhase: (event: string) => console.log(event),
}, async (context) => {
  context.breakPoint()
  context.events.reportPhase('hello')
  return true
})


const test2 = new BackgroundTask(async (context) => {
  context.breakPoint()
  return 'Hello world'
}, true)


;(async function () {
  test.start()
  console.log('Test1', await test.await())
  console.log('Test2', await test2.await())
})()
