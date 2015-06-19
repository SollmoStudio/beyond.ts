import logger = require('../../lib/logger');

describe('logger API', () => {
  describe('#log do nothing if not initialized', () => {
    logger.log('Log do nothing if not %s', 'initialized');
  });

  describe('#info do nothing if not initialized', () => {
    logger.info('Info do nothing if not %s', 'initialized');
  });

  describe('#warn do nothing if not initialized', () => {
    logger.warn('Warn do nothing if not %s', 'initialized');
  });

  describe('#debug do nothing if not initialized', () => {
    logger.debug('Debug do nothing if not %s', 'initialized');
  });

  describe('#error do nothing if not initialized', () => {
    logger.error('Error do nothing if not %s', 'initialized');
  });

  describe('#data do nothing if not initialized', () => {
    logger.data('TEST', { some: 'object' }, 'data do nothing if not %s', 'initialized');
  });
});
