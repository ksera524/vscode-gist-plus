import { commit } from 'node-git-utils';
import { bumpMessage } from './bump-msg.js';

commit(bumpMessage);
