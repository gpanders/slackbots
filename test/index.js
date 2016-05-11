import '../app/vendor';
import 'angular-mocks';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

let testsContext = require.context('../app', true, /\.spec\.jsx?$/);
testsContext.keys().forEach(testsContext);
