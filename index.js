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
    },
    init(server, options) { // eslint-disable-line no-unused-vars
      server.route({
        path: '/api/flexmonster_pivot/es',
        method: 'GET',
        handler: (req) => {
          return new Promise((resolve, reject) => {
            server.newPlatform.setup.core.elasticsearch.dataClient$.subscribe(client => {
              const url = new URL(client.config.hosts[0]);
              const esConfig = {
                "host": {
                  "protocol": url.protocol.replace(/:/g, ''),
                  "host": url.hostname,
                  "port": url.port,
                  "path": url.pathname,
                  "headers": {
                    "authorization": req.headers.authorization
                  }
                }
              }
              resolve(esConfig);
            });
          });
        }
      });
    }
  });
}
