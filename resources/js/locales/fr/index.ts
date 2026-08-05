import { frCommon } from './common';
import { frDashboard } from './dashboard';
import { frClients } from './clients';
import { frIntermediaries } from './intermediaries';
import { frGlobalSearch } from './globalSearch';
import { frDocuments } from './documents';
import { frDocumentsExplorer } from './documentsExplorer';

export const fr = { ...frCommon, ...frDashboard, ...frClients, ...frIntermediaries, ...frGlobalSearch, ...frDocuments, ...frDocumentsExplorer };
