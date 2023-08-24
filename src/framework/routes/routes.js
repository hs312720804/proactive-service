export default function createRoutes (frameRoutes = []) {
  console.log(frameRoutes)
  frameRoutes = frameRoutes.concat([
    {
      path: '/ps/proactive',
      name: 'p_proactiveServ',
      component: () => import(/* webpackChunkName: "LowcodeEngine" */ '@/views/LowcodeEngine/Index.vue')
    },
    {
      path: '/ps/switch',
      name: 'ps_switch',
      component: () => import(/* webpackChunkName: "LowcodeEngine" */ '@/views/LowcodeEngine/Index.vue')
    },
    {
      path: '/ps/switchall',
      name: 'ps_switchall',
      component: () => import(/* webpackChunkName: "LowcodeEngine" */ '@/views/LowcodeEngine/Index.vue')
    },
    {
      path: '/ps/blacklist',
      name: 'ps_blacklist',
      component: () => import(/* webpackChunkName: "LowcodeEngine" */ '@/views/LowcodeEngine/Index.vue')
    },

    {
      path: '/rule-base',
      name: 'ruleBase',
      component: () => import(/* webpackChunkName: "LowcodeEngine" */ '@/views/LowcodeEngine/Index.vue')
    },

    {
      path: '/skill-pool',
      name: 'skillPool',
      component: () => import(/* webpackChunkName: "LowcodeEngine" */ '@/views/LowcodeEngine/Index.vue')
    },

    {
      path: '/service-delivery',
      name: 'serviceDelivery',
      component: () => import(/* webpackChunkName: "LowcodeEngine" */ '@/views/LowcodeEngine/Index.vue')
    },
    {
      path: '/service-interaction',
      name: 'service-interaction',
      component: () => import(/* webpackChunkName: "service" */ '@/views/serviceInteraction/List.vue')
    },
    {
      path: '/interaction-detail',
      name: 'interaction-detail',
      component: () => import(/* webpackChunkName: "service" */ '@/views/serviceInteraction/Detail.vue')
    },
    {
      path: '/all-switch-state',
      name: 'all-switch-state',
      component: () => import(/* webpackChunkName: "service" */ '@/views/serviceState/List.vue')
    },
    // {
    //   path: '/baseListTest',
    //   name: 'baseListTest',
    //   component: () => import(/* webpackChunkName: "baseList" */ '@/views/baseList/Index.vue')
    // },
    // {
    //   path: '/lowcodeEngineTest',
    //   name: 'lowcodeEngineTest',
    //   component: () => import(/* webpackChunkName: "LowcodeEngine" */ '@/views/LowcodeEngine/Index.vue')
    // },
    {
      path: '*',
      name: 'not-found',
      meta: {
        isNoAuth: true,
        title: '404'
      },
      component: () => import('cseed-frame/components/NotFound.vue')
    }
  ])
  return frameRoutes
}
