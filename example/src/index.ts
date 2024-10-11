import { BackgroundTask } from '@david.uhlir/background-task'

const test = new BackgroundTask({
  reportPhase: (event: string) => console.log(event),
}, async (context) => {
  context.breakPoint()
  context.events.reportPhase('hello')
  return true
})

;(async function () {
  test.start()
  console.log(await test.await())
})()
