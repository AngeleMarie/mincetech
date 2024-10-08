

import swaggerUi from'swagger-ui-express';
import swaggerDocument from './swagger.json' assert { type: 'json' };


function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

export default setupSwagger;
