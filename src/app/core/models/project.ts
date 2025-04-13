import { Framework } from './framework';
import { Field } from '../../modules/project/services/project.service';

export interface Project {
  id?: number;
  project_name: string;
  model_name: string;
  framework?: Framework | null;
  user?: number | null;
  date_creation: string;
  date_modification: string;
  script_file?: string | null;
  fields?: Field[];
}