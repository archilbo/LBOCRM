import { frCommon } from './common';
import { frDashboard } from './dashboard';
import { frClients } from './clients';
import { frIntermediaries } from './intermediaries';

export const fr = { ...frCommon, ...frDashboard, ...frClients, ...frIntermediaries };
