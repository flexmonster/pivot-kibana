export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'flexmonster_pivot',
    uiExports: {
      app: {
        title: 'Flexmonster Pivot',
        description: 'Flexmonster Pivot Table',
        main: 'plugins/flexmonster_pivot/app',
        icon: 'plugins/flexmonster_pivot/logo.png'
      },
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    }
  });
}
