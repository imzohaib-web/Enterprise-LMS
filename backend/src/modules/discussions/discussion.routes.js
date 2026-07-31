// JS commonjs adapter for discussion routes
const routesTS = require('./discussion.routes.ts');

module.exports = routesTS.router || routesTS.default || routesTS;
module.exports.replyRouter = routesTS.replyRouter;
