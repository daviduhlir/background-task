export * from './Awaiter'
export * from './BackgroundTask'





const test = new BackgroundTask(async (context) => {
  context.breakPoint()
  context.events.reportPhase('phase')
  return true
}, {
  reportPhase: (event) => console.log(event),
})