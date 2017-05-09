export default [
  {
    path: '/',
    name: 'dingus',
    component: require('components/dingus')
  },
  {
    path: '*',
    redirect: '/'
  }
]
