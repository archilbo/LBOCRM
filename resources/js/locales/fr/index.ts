import { frCommon } from './common';
import { frDashboard } from './dashboard';
import { frClients } from './clients';
import { frIntermediaries } from './intermediaries';
import { frGlobalSearch } from './globalSearch';
import { frDocuments } from './documents';
import { frDocumentsExplorer } from './documentsExplorer';
import { frArchives } from './archives';
import { frNotifications } from './notifications';
import { frInbox } from './inbox';
import { frTasks } from './tasks';
import { frCalendar } from './calendar';
import { frUsers } from './users';
import { frAuth } from './auth';
import { frDossiers } from './dossiers';

export const fr = { ...frCommon, ...frDashboard, ...frClients, ...frIntermediaries, ...frGlobalSearch, ...frDocuments, ...frDocumentsExplorer, ...frArchives, ...frNotifications, ...frInbox, ...frTasks, ...frCalendar, ...frUsers, ...frAuth, ...frDossiers };
